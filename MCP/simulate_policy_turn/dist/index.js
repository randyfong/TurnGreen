import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { POLICY_INTERVENTIONS } from "./constants/esa_worldcover.js";
import { calculateInVESTCooling } from "./models/invest_cooling.js";
import { calculateInVESTFloodRisk } from "./models/invest_flood.js";
import { generateYouthSummary } from "./translators/youth_metrics.js";
import { PolicyInputSchema } from "./types.js";
const SIMULATE_POLICY_TURN_TOOL = {
    name: "simulate_policy_turn",
    description: "Simulates an urban policy turn (1 to 5) in TurnGreen. Calculates environmental shifts in neighborhood temperature and stormwater retention based on land cover conversions (ESA WorldCover) using Stanford InVEST Urban Cooling and Urban Flood Risk Mitigation equations. Stateless: accepts current state and budget, returns updated state, youth-accessible scorecards, and a scientific metadata payload.",
    inputSchema: {
        type: "object",
        properties: {
            turn: {
                type: "integer",
                minimum: 1,
                maximum: 5,
                description: "Current turn number in the 5-turn game"
            },
            intervention_id: {
                type: "string",
                enum: [
                    "green_roofs",
                    "pocket_parks",
                    "urban_canopy_trees",
                    "permeable_pavement",
                    "bioswales",
                    "cool_roofs"
                ],
                description: "Selected policy intervention to deploy"
            },
            budget_allocated: {
                type: "number",
                minimum: 1,
                description: "Budget amount in USD allocated to this intervention"
            },
            current_state: {
                type: "object",
                description: "Current stateless neighborhood and budget state",
                properties: {
                    total_area_hectares: {
                        type: "number",
                        default: 50,
                        description: "Total neighborhood area in hectares (default: 50)"
                    },
                    remaining_budget: {
                        type: "number",
                        default: 200000,
                        description: "Current remaining budget before this turn"
                    },
                    land_cover: {
                        type: "object",
                        description: "Current ESA WorldCover land cover percentages (summing to 100)",
                        properties: {
                            tree_cover_10: { type: "number", minimum: 0, maximum: 100 },
                            shrubland_20: { type: "number", minimum: 0, maximum: 100 },
                            grassland_30: { type: "number", minimum: 0, maximum: 100 },
                            cropland_40: { type: "number", minimum: 0, maximum: 100 },
                            built_up_50: { type: "number", minimum: 0, maximum: 100 },
                            bare_soil_60: { type: "number", minimum: 0, maximum: 100 },
                            water_80: { type: "number", minimum: 0, maximum: 100 }
                        },
                        required: [
                            "tree_cover_10",
                            "shrubland_20",
                            "grassland_30",
                            "cropland_40",
                            "built_up_50",
                            "bare_soil_60",
                            "water_80"
                        ]
                    }
                },
                required: ["total_area_hectares", "remaining_budget", "land_cover"]
            }
        },
        required: ["turn", "intervention_id", "budget_allocated", "current_state"]
    }
};
export function executeSimulation(inputRaw) {
    const parsed = PolicyInputSchema.parse(inputRaw);
    const { turn, intervention_id, budget_allocated, current_state } = parsed;
    const policy = POLICY_INTERVENTIONS[intervention_id];
    if (!policy) {
        throw new Error(`Unknown intervention ID: ${intervention_id}`);
    }
    // Validate budget
    const actualBudgetSpent = Math.min(budget_allocated, current_state.remaining_budget);
    const newRemainingBudget = Math.max(0, current_state.remaining_budget - actualBudgetSpent);
    // Compute conversion percentage based on budget spent
    const pctConversion = actualBudgetSpent / policy.unit_cost_usd_per_pct;
    const hectaresConverted = (pctConversion / 100) * current_state.total_area_hectares;
    // Clone land cover for modification
    const priorLandCover = { ...current_state.land_cover };
    const updatedLandCover = { ...current_state.land_cover };
    // Calculate maximum reducible built-up area
    const maxAvailableBuiltUp = updatedLandCover.built_up_50;
    const targetBuiltUpReduction = Math.abs((policy.conversions.built_up_50 ?? 0) * pctConversion);
    const scale = targetBuiltUpReduction > maxAvailableBuiltUp && targetBuiltUpReduction > 0
        ? maxAvailableBuiltUp / targetBuiltUpReduction
        : 1.0;
    const effectivePctConversion = pctConversion * scale;
    // Apply shifts to land cover
    for (const [key, deltaPerUnit] of Object.entries(policy.conversions)) {
        const classKey = key;
        const delta = (deltaPerUnit ?? 0) * effectivePctConversion;
        updatedLandCover[classKey] = Math.max(0, Math.min(100, updatedLandCover[classKey] + delta));
    }
    // Re-normalize land cover to ensure it sums strictly to 100%
    const total = Object.values(updatedLandCover).reduce((acc, v) => acc + v, 0);
    if (total > 0 && Math.abs(total - 100) > 0.01) {
        for (const key of Object.keys(updatedLandCover)) {
            updatedLandCover[key] = Number(((updatedLandCover[key] / total) * 100).toFixed(2));
        }
    }
    // Calculate InVEST Urban Cooling
    const priorCooling = calculateInVESTCooling(priorLandCover);
    const postCooling = calculateInVESTCooling(updatedLandCover, policy.albedo_boost ? (policy.albedo_boost * (effectivePctConversion / 100)) : 0);
    // Calculate InVEST Urban Flood Risk (SCS-CN)
    const priorFlood = calculateInVESTFloodRisk(priorLandCover, current_state.total_area_hectares);
    const postFlood = calculateInVESTFloodRisk(updatedLandCover, current_state.total_area_hectares);
    // Shifts in WorldCover
    const esaShifts = {};
    for (const key of Object.keys(priorLandCover)) {
        esaShifts[key] = {
            prior_pct: Number(priorLandCover[key].toFixed(2)),
            post_pct: Number(updatedLandCover[key].toFixed(2)),
            delta_pct: Number((updatedLandCover[key] - priorLandCover[key]).toFixed(2))
        };
    }
    // Derived player scores
    const coolingScore = Math.min(100, Math.round(postCooling.heat_mitigation_index * 135));
    const floodScore = Math.min(100, Math.round(postFlood.retention_efficiency_pct * 1.15));
    const cheerScore = Math.min(100, Math.round((coolingScore * 0.5) + (floodScore * 0.5) + (turn * 4)));
    const overallSustainability = Math.round((coolingScore + floodScore) / 2);
    const deltaTempC = Math.max(0, postCooling.surface_temperature_drop_c - priorCooling.surface_temperature_drop_c);
    const youthSummary = generateYouthSummary({
        tempDropDeltaC: deltaTempC,
        stormwaterRetainedM3: postFlood.stormwater_retained_m3,
        newCoolingScore: coolingScore,
        newFloodScore: floodScore,
        interventionId: policy.id,
        interventionName: policy.name
    });
    return {
        turn,
        intervention: {
            id: policy.id,
            name: policy.name,
            budget_allocated: actualBudgetSpent,
            area_converted_hectares: Number(hectaresConverted.toFixed(2)),
            pct_area_converted: Number(effectivePctConversion.toFixed(2))
        },
        next_state: {
            total_area_hectares: current_state.total_area_hectares,
            remaining_budget: newRemainingBudget,
            land_cover: updatedLandCover
        },
        player_summary: youthSummary,
        player_metrics: {
            overall_sustainability_score: overallSustainability,
            cooling_score: coolingScore,
            flood_resilience_score: floodScore,
            community_cheer_score: cheerScore
        },
        science_payload: {
            models_referenced: [
                "Stanford InVEST Urban Cooling Model v3.14 (Heat Mitigation Index)",
                "Stanford InVEST Urban Flood Risk Mitigation Model (USDA SCS-CN Curve Number)",
                "ESA WorldCover 10m Land Cover Classification"
            ],
            esa_worldcover_shifts: esaShifts,
            invest_urban_cooling: {
                prior_hmi: priorCooling.heat_mitigation_index,
                post_hmi: postCooling.heat_mitigation_index,
                hmi_delta: Number((postCooling.heat_mitigation_index - priorCooling.heat_mitigation_index).toFixed(4)),
                surface_temp_drop_celsius: deltaTempC,
                surface_temp_drop_fahrenheit: Number((deltaTempC * 1.8).toFixed(2)),
                effective_albedo: {
                    prior: priorCooling.effective_albedo,
                    post: postCooling.effective_albedo
                },
                vegetation_fraction: {
                    prior: priorCooling.vegetation_fraction,
                    post: postCooling.vegetation_fraction
                },
                et_index: {
                    prior: priorCooling.et_index,
                    post: postCooling.et_index
                }
            },
            invest_urban_flood: {
                design_storm_depth_mm: postFlood.design_storm_depth_mm,
                prior_composite_cn: priorFlood.composite_curve_number,
                post_composite_cn: postFlood.composite_curve_number,
                prior_runoff_mm: priorFlood.direct_runoff_mm,
                post_runoff_mm: postFlood.direct_runoff_mm,
                retained_runoff_depth_mm: postFlood.retained_water_depth_mm,
                stormwater_retained_m3: postFlood.stormwater_retained_m3,
                retention_efficiency_pct: postFlood.retention_efficiency_pct
            }
        }
    };
}
async function startServer() {
    const server = new Server({
        name: "simulate-policy-turn-server",
        version: "1.0.0"
    }, {
        capabilities: {
            tools: {}
        }
    });
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [SIMULATE_POLICY_TURN_TOOL]
        };
    });
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        if (request.params.name === "simulate_policy_turn") {
            try {
                const result = executeSimulation(request.params.arguments);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            }
            catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: `Simulation error: ${errorMsg}`
                        }
                    ]
                };
            }
        }
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: `Unknown tool name: ${request.params.name}`
                }
            ]
        };
    });
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("simulate_policy_turn MCP Server running on stdio");
}
// Only start the stdio server if directly run
if (process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js")) {
    startServer().catch((err) => {
        console.error("Fatal server error:", err);
        process.exit(1);
    });
}
