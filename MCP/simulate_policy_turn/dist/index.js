import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { POLICY_INTERVENTIONS, CANONICAL_PROJECT_EXECUTION_ORDER } from "./constants/esa_worldcover.js";
import { calculateInVESTCooling, calculateDrySeasonCooling } from "./models/invest_cooling.js";
import { calculateInVESTFloodRisk, calculateDrySeasonFloodRisk } from "./models/invest_flood.js";
import { generateYouthSummary } from "./translators/youth_metrics.js";
import { PolicyInputSchema, SimulationPlanError, YearPlanInputSchema } from "./types.js";
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
                    roof_treatment_hectares: {
                        type: "number",
                        default: 0,
                        minimum: 0,
                        description: "Cumulative area of high-albedo cool roofs/surfaces retrofitted in hectares"
                    },
                    baseline_runoff_mm: {
                        type: "number",
                        minimum: 0,
                        description: "Baseline Turn 0 storm runoff depth in mm"
                    },
                    baseline_land_cover: {
                        type: "object",
                        description: "Baseline Turn 0 ESA WorldCover percentages",
                        properties: {
                            tree_cover_10: { type: "number", minimum: 0, maximum: 100 },
                            shrubland_20: { type: "number", minimum: 0, maximum: 100 },
                            grassland_30: { type: "number", minimum: 0, maximum: 100 },
                            cropland_40: { type: "number", minimum: 0, maximum: 100 },
                            built_up_50: { type: "number", minimum: 0, maximum: 100 },
                            bare_soil_60: { type: "number", minimum: 0, maximum: 100 },
                            water_80: { type: "number", minimum: 0, maximum: 100 }
                        }
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
const SIMULATE_YEAR_PLAN_TOOL = {
    name: "simulate_year_plan",
    description: "Simulates an entire year's climate action plan containing a list of multiple urban policy interventions in TurnGreen. Calculates aggregated biophysical shifts (temperature drop, stormwater retention, UN SDG 15.3.1 land restoration) using Stanford InVEST Urban Cooling & Urban Flood Risk equations. Stateless: accepts current state and project list, returns updated state, aggregated youth scorecard, and comprehensive scientific metadata payload.",
    inputSchema: {
        type: "object",
        properties: {
            year: {
                type: "integer",
                minimum: 1,
                maximum: 5,
                description: "Optional year or turn identifier (1 to 5)"
            },
            annual_budget_limit: {
                type: "number",
                minimum: 1,
                description: "Optional annual budget limit for this plan in dollars or coins (e.g., 1000 USD = 100 coins)"
            },
            max_annual_budget: {
                type: "number",
                minimum: 1,
                description: "Optional annual budget ceiling for this plan in coins or USD (alias for annual_budget_limit)"
            },
            projects: {
                type: "array",
                description: "List of urban policy interventions to execute in this year plan",
                items: {
                    type: "object",
                    properties: {
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
                            description: "Budget amount in USD allocated to this project"
                        },
                        project_name: {
                            type: "string",
                            description: "Optional custom display name for this project"
                        }
                    },
                    required: ["intervention_id", "budget_allocated"]
                }
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
                        description: "Current remaining budget before this plan"
                    },
                    roof_treatment_hectares: {
                        type: "number",
                        default: 0,
                        minimum: 0,
                        description: "Cumulative area of high-albedo cool roofs/surfaces retrofitted in hectares"
                    },
                    baseline_runoff_mm: {
                        type: "number",
                        minimum: 0,
                        description: "Baseline Turn 0 storm runoff depth in mm"
                    },
                    baseline_land_cover: {
                        type: "object",
                        description: "Baseline Turn 0 ESA WorldCover percentages",
                        properties: {
                            tree_cover_10: { type: "number", minimum: 0, maximum: 100 },
                            shrubland_20: { type: "number", minimum: 0, maximum: 100 },
                            grassland_30: { type: "number", minimum: 0, maximum: 100 },
                            cropland_40: { type: "number", minimum: 0, maximum: 100 },
                            built_up_50: { type: "number", minimum: 0, maximum: 100 },
                            bare_soil_60: { type: "number", minimum: 0, maximum: 100 },
                            water_80: { type: "number", minimum: 0, maximum: 100 }
                        }
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
        required: ["projects", "current_state"]
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
    const budgetCurrency = current_state.budget_currency ?? (current_state.remaining_budget > 500 ? "usd" : "coins");
    const currencySymbol = budgetCurrency === "coins" ? "🪙" : "$";
    const budgetRequested = budget_allocated;
    const isCapped = budgetRequested > current_state.remaining_budget;
    const actualBudgetSpent = isCapped ? current_state.remaining_budget : budgetRequested;
    const budgetWarning = isCapped
        ? `Requested budget (${currencySymbol}${budgetRequested.toLocaleString()}) exceeded remaining budget (${currencySymbol}${current_state.remaining_budget.toLocaleString()}). Allocation was capped to ${currencySymbol}${actualBudgetSpent.toLocaleString()}.`
        : undefined;
    const newRemainingBudget = Math.max(0, current_state.remaining_budget - actualBudgetSpent);
    // Compute conversion percentage based on budget spent and currency mode
    const unitCost = (budgetCurrency === "coins" && policy.cost_coins_per_pct)
        ? policy.cost_coins_per_pct
        : policy.unit_cost_usd_per_pct;
    const pctConversion = actualBudgetSpent / unitCost;
    const hectaresConverted = (pctConversion / 100) * current_state.total_area_hectares;
    // Clone land cover for modification
    const priorLandCover = { ...current_state.land_cover };
    const updatedLandCover = { ...current_state.land_cover };
    // Determine available budget and conversion scale based on source classes
    // Identify source classes (negative deltas) and destination classes (positive deltas)
    let maxPossibleScale = 1.0;
    for (const [key, deltaPerUnit] of Object.entries(policy.conversions)) {
        if (deltaPerUnit && deltaPerUnit < 0) {
            const classKey = key;
            const available = updatedLandCover[classKey] ?? 0;
            const targetReduction = Math.abs(deltaPerUnit * pctConversion);
            if (targetReduction > 0) {
                const classScale = available / targetReduction;
                if (classScale < maxPossibleScale) {
                    maxPossibleScale = Math.max(0, classScale);
                }
            }
        }
    }
    const effectivePctConversion = pctConversion * maxPossibleScale;
    // Apply shifts to land cover
    let primarySourceClass = null;
    let maxSourceReduction = 0;
    for (const [key, deltaPerUnit] of Object.entries(policy.conversions)) {
        const classKey = key;
        const delta = (deltaPerUnit ?? 0) * effectivePctConversion;
        if ((deltaPerUnit ?? 0) < 0 && Math.abs(delta) > maxSourceReduction) {
            maxSourceReduction = Math.abs(delta);
            primarySourceClass = classKey;
        }
        // Round each change to 2 decimal places
        updatedLandCover[classKey] = Number(Math.max(0, Math.min(100, updatedLandCover[classKey] + delta)).toFixed(2));
    }
    // Ensure land cover sums strictly to 100% without proportional re-scaling of untouched classes
    // (Proportional normalization causes untouched classes like tree_cover or grassland to bleed/shift)
    const total = Number(Object.values(updatedLandCover).reduce((acc, v) => acc + v, 0).toFixed(2));
    const diff = Number((100 - total).toFixed(2));
    if (Math.abs(diff) > 0.0001) {
        // Absorb rounding discrepancy into the primary source class or built_up_50
        const targetKey = primarySourceClass ?? "built_up_50";
        updatedLandCover[targetKey] = Number(Math.max(0, Math.min(100, updatedLandCover[targetKey] + diff)).toFixed(2));
    }
    // Track roof treatment area (in hectares)
    const priorRoofTreatmentHa = current_state.roof_treatment_hectares ?? 0;
    let newRoofTreatmentHa = priorRoofTreatmentHa;
    if (intervention_id === "cool_roofs") {
        newRoofTreatmentHa += hectaresConverted;
    }
    // Calculate InVEST Urban Cooling incorporating prior and updated roof treatment albedo boosts
    // Each hectare of cool roof retrofit contributes an albedo boost over the total district area:
    // delta_albedo = albedo_boost * (treated_area_ha / total_area_ha)
    const coolRoofConfig = POLICY_INTERVENTIONS.cool_roofs;
    const coolRoofAlbedoBoostFactor = coolRoofConfig.albedo_boost ?? 0.35;
    const priorCoolRoofBoost = (priorRoofTreatmentHa / current_state.total_area_hectares) * coolRoofAlbedoBoostFactor;
    // Additional albedo boost from this turn's intervention (if cool_roofs or permeable_pavement)
    const turnInterventionAlbedoBoost = policy.albedo_boost
        ? (policy.albedo_boost * (effectivePctConversion / 100))
        : 0;
    const priorCooling = calculateInVESTCooling(priorLandCover, priorCoolRoofBoost);
    const postCooling = calculateInVESTCooling(updatedLandCover, priorCoolRoofBoost + turnInterventionAlbedoBoost);
    // Calculate InVEST Urban Flood Risk (SCS-CN)
    const priorFlood = calculateInVESTFloodRisk(priorLandCover, current_state.total_area_hectares);
    const postFlood = calculateInVESTFloodRisk(updatedLandCover, current_state.total_area_hectares);
    // Compute baseline (Turn 0) storm runoff depth
    // If baseline_runoff_mm was supplied in current_state, preserve it.
    // If baseline_land_cover was supplied, compute from that.
    // Otherwise, if turn === 1, priorFlood.direct_runoff_mm is the baseline; else calculate or fallback to prior.
    const baselineLandCover = current_state.baseline_land_cover ?? priorLandCover;
    let baselineRunoffMm;
    if (current_state.baseline_runoff_mm !== undefined) {
        baselineRunoffMm = current_state.baseline_runoff_mm;
    }
    else if (current_state.baseline_land_cover) {
        const baseFlood = calculateInVESTFloodRisk(current_state.baseline_land_cover, current_state.total_area_hectares);
        baselineRunoffMm = baseFlood.direct_runoff_mm;
    }
    else {
        baselineRunoffMm = priorFlood.direct_runoff_mm;
    }
    // Incremental runoff reduction relative to Turn 0 baseline (depth in mm and volume in m³)
    // Runoff reduction depth = max(0, baselineRunoffMm - postFlood.direct_runoff_mm)
    // Volume (m³) = (reduction_depth_mm / 1000 m) * total_area_m2
    const runoffReductionDepthMm = Math.max(0, Number((baselineRunoffMm - postFlood.direct_runoff_mm).toFixed(2)));
    const totalAreaM2 = current_state.total_area_hectares * 10000;
    const incrementalRunoffReductionM3 = Number(((runoffReductionDepthMm / 1000) * totalAreaM2).toFixed(1));
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
            budget_requested: budgetRequested,
            budget_allocated: actualBudgetSpent,
            budget_capped: isCapped,
            ...(budgetWarning ? { budget_warning: budgetWarning } : {}),
            area_converted_hectares: Number(((effectivePctConversion / 100) * current_state.total_area_hectares).toFixed(2)),
            pct_area_converted: Number(effectivePctConversion.toFixed(2))
        },
        next_state: {
            total_area_hectares: current_state.total_area_hectares,
            remaining_budget: newRemainingBudget,
            roof_treatment_hectares: Number(newRoofTreatmentHa.toFixed(2)),
            baseline_runoff_mm: baselineRunoffMm,
            baseline_land_cover: baselineLandCover,
            land_cover: updatedLandCover
        },
        player_summary: youthSummary,
        player_metrics: {
            overall_sustainability_score: overallSustainability,
            cooling_score: coolingScore,
            flood_resilience_score: floodScore,
            community_cheer_score: cheerScore,
            design_storm_total_retained_m3: postFlood.stormwater_retained_m3,
            incremental_runoff_reduction_m3: incrementalRunoffReductionM3
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
                baseline_runoff_mm: baselineRunoffMm,
                prior_composite_cn: priorFlood.composite_curve_number,
                post_composite_cn: postFlood.composite_curve_number,
                prior_runoff_mm: priorFlood.direct_runoff_mm,
                post_runoff_mm: postFlood.direct_runoff_mm,
                retained_runoff_depth_mm: postFlood.retained_water_depth_mm,
                stormwater_retained_m3: postFlood.stormwater_retained_m3,
                incremental_runoff_reduction_m3: incrementalRunoffReductionM3,
                retention_efficiency_pct: postFlood.retention_efficiency_pct
            }
        }
    };
}
/**
 * Executes the annual climate dry season stress phase exactly once per year plan:
 * 1. Evaluates low precipitation (P = 10 mm) infiltration and crusting risk.
 * 2. Evaluates high-temperature evapotranspiration attenuation across shallow vs deep-root vegetation.
 * 3. Derives drought resilience score and temperature under peak dry-heat stress.
 */
export function applyAnnualDrySeason(workingLandCover, options) {
    const coolRoofConfig = POLICY_INTERVENTIONS.cool_roofs;
    const coolRoofBoost = ((options.roofTreatmentHa ?? 0) / options.totalAreaHectares) * (coolRoofConfig.albedo_boost ?? 0.35);
    const totalAlbedoBoost = coolRoofBoost + (options.accumulatedAlbedoBoost ?? 0);
    const dryCooling = calculateDrySeasonCooling(workingLandCover, totalAlbedoBoost, options.droughtStressFactor ?? 0.5);
    const dryFlood = calculateDrySeasonFloodRisk(workingLandCover, options.totalAreaHectares, options.droughtPrecipitationMm ?? 10);
    // Peak dry-heat urban baseline temperature (e.g. 38.0°C in heat wave)
    const peakDryHeatBaselineC = 38.0;
    const peakDryHeatSurfaceTempC = Number((peakDryHeatBaselineC - dryCooling.surface_temperature_drop_c).toFixed(2));
    // Drought resilience score: weighted balance of canopy retention (45%), soil sponge retention (40%), and low ET loss (15%)
    const canopyScore = Math.min(100, Math.round(dryCooling.canopy_et_retention_ratio * 100));
    const spongeScore = Math.min(100, Math.round(dryFlood.drought_retention_pct));
    const etRetentionScore = Math.max(0, Math.min(100, Math.round(100 - dryCooling.et_loss_pct)));
    const droughtResilienceScore = Math.round((canopyScore * 0.45) + (spongeScore * 0.40) + (etRetentionScore * 0.15));
    const droughtSummary = droughtResilienceScore >= 75
        ? `High drought resilience (${droughtResilienceScore}/100): Deep-root canopy and sponge soils maintained cool microclimates during peak dry season.`
        : droughtResilienceScore >= 50
            ? `Moderate drought resilience (${droughtResilienceScore}/100): Shallow turf suffered minor moisture loss, but shade buffers mitigated extreme dry heat.`
            : `Low drought resilience (${droughtResilienceScore}/100): High soil crusting and ET loss during dry season; additional street canopy and bioswales needed.`;
    return {
        drySeasonCooling: dryCooling,
        drySeasonFlood: dryFlood,
        drought_resilience_score: droughtResilienceScore,
        peak_dry_heat_surface_temp_celsius: peakDryHeatSurfaceTempC,
        temperature_under_dry_heat_display: `${peakDryHeatSurfaceTempC}°C (${Number((peakDryHeatSurfaceTempC * 1.8 + 32).toFixed(1))}°F)`,
        drought_summary: droughtSummary
    };
}
export function validateYearPlan(rawInput) {
    // Check raw projects array existence and emptiness before or during schema parse
    if (typeof rawInput === "object" && rawInput !== null) {
        const rawObj = rawInput;
        if (Array.isArray(rawObj.projects) && rawObj.projects.length === 0) {
            throw new SimulationPlanError({
                error_code: "EMPTY_PLAN",
                message: "Plan validation failed: projects list cannot be empty."
            });
        }
        // Inspect individual projects for invalid ID, nonpositive budget, or duplicates
        if (Array.isArray(rawObj.projects)) {
            const seenInterventions = new Set();
            for (let i = 0; i < rawObj.projects.length; i++) {
                const p = rawObj.projects[i];
                if (!p || typeof p !== "object") {
                    throw new SimulationPlanError({
                        error_code: "INVALID_PROJECT",
                        project_index: i,
                        message: `Plan validation failed at project index ${i}: project entry must be an object.`
                    });
                }
                const projectObj = p;
                const interventionId = projectObj.intervention_id;
                const projectName = typeof projectObj.project_name === "string" ? projectObj.project_name : undefined;
                // 1. Unknown / invalid intervention ID
                const validInterventions = Object.keys(POLICY_INTERVENTIONS);
                if (!interventionId || !validInterventions.includes(interventionId)) {
                    throw new SimulationPlanError({
                        error_code: "INVALID_PROJECT",
                        project_index: i,
                        project_name: projectName,
                        message: `Plan validation failed at project index ${i}: Unknown or invalid intervention '${interventionId}'. Valid options: ${validInterventions.join(", ")}.`
                    });
                }
                // 2. Nonpositive or NaN budget
                const budgetAllocated = projectObj.budget_allocated;
                if (typeof budgetAllocated !== "number" ||
                    isNaN(budgetAllocated) ||
                    budgetAllocated <= 0) {
                    throw new SimulationPlanError({
                        error_code: "NON_POSITIVE_BUDGET",
                        project_index: i,
                        project_name: projectName,
                        message: `Plan validation failed at project index ${i} (${interventionId}): Budget allocated must be a positive number greater than 0, received ${budgetAllocated}.`
                    });
                }
                // 3. Strict Reject duplicate intervention policy
                if (seenInterventions.has(interventionId)) {
                    throw new SimulationPlanError({
                        error_code: "DUPLICATE_PROJECT_TYPE",
                        project_index: i,
                        project_name: projectName,
                        message: `Plan validation failed at project index ${i}: Duplicate project intervention '${interventionId}' found. Duplicate project types must be combined into a single project allocation.`
                    });
                }
                seenInterventions.add(interventionId);
            }
        }
    }
    // Parse input against schema
    let parsed;
    try {
        parsed = YearPlanInputSchema.parse(rawInput);
    }
    catch (zodErr) {
        throw zodErr;
    }
    const { projects, current_state } = parsed;
    const budgetCurrency = current_state.budget_currency ?? (current_state.remaining_budget > 500 ? "usd" : "coins");
    const currencySymbol = budgetCurrency === "coins" ? "🪙" : "$";
    const totalRequestedBudget = projects.reduce((acc, p) => acc + p.budget_allocated, 0);
    // 4. Annual budget limit check
    const effectiveAnnualBudgetLimit = parsed.annual_budget_limit ?? parsed.max_annual_budget;
    if (effectiveAnnualBudgetLimit !== undefined && totalRequestedBudget > effectiveAnnualBudgetLimit) {
        throw new SimulationPlanError({
            error_code: "ANNUAL_BUDGET_EXCEEDED",
            message: `Annual budget validation failed: Total requested budget (${currencySymbol}${totalRequestedBudget.toLocaleString()}) exceeds maximum annual budget limit (${currencySymbol}${effectiveAnnualBudgetLimit.toLocaleString()}).`
        });
    }
    // 5. Remaining player budget check
    if (totalRequestedBudget > current_state.remaining_budget) {
        throw new SimulationPlanError({
            error_code: "REMAINING_BUDGET_EXCEEDED",
            message: `Budget validation failed: Total requested budget (${currencySymbol}${totalRequestedBudget.toLocaleString()}) exceeds remaining budget (${currencySymbol}${current_state.remaining_budget.toLocaleString()}).`
        });
    }
    return parsed;
}
export function executeYearPlanSimulation(args) {
    const parsed = validateYearPlan(args);
    const { year, projects, current_state } = parsed;
    const budgetCurrency = current_state.budget_currency ?? (current_state.remaining_budget > 500 ? "usd" : "coins");
    const currencySymbol = budgetCurrency === "coins" ? "🪙" : "$";
    // Baseline copies
    const initialLandCover = { ...current_state.land_cover };
    const workingLandCover = { ...current_state.land_cover };
    let workingRoofTreatmentHa = current_state.roof_treatment_hectares ?? 0;
    let remainingBudget = current_state.remaining_budget;
    const projectsExecuted = [];
    const intermediateSteps = [];
    let accumulatedAlbedoBoost = 0;
    // Track initial cool roof boost from prior state
    const coolRoofConfig = POLICY_INTERVENTIONS.cool_roofs;
    const coolRoofAlbedoBoostFactor = coolRoofConfig.albedo_boost ?? 0.35;
    const priorCoolRoofBoost = (workingRoofTreatmentHa / current_state.total_area_hectares) * coolRoofAlbedoBoostFactor;
    // Baseline cooling & flood evaluations
    const priorCooling = calculateInVESTCooling(initialLandCover, priorCoolRoofBoost);
    const priorFlood = calculateInVESTFloodRisk(initialLandCover, current_state.total_area_hectares);
    // 2. Deterministic Project Ordering & Sequential Land/Albedo Accumulation
    // Sort projects deterministically using CANONICAL_PROJECT_EXECUTION_ORDER, tie-breaking by project_name then original input index
    const indexedProjects = projects.map((project, originalIndex) => ({
        project,
        originalIndex
    }));
    indexedProjects.sort((a, b) => {
        const orderA = CANONICAL_PROJECT_EXECUTION_ORDER[a.project.intervention_id] ?? 99;
        const orderB = CANONICAL_PROJECT_EXECUTION_ORDER[b.project.intervention_id] ?? 99;
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        const nameA = a.project.project_name ?? "";
        const nameB = b.project.project_name ?? "";
        const nameCmp = nameA.localeCompare(nameB);
        if (nameCmp !== 0) {
            return nameCmp;
        }
        return a.originalIndex - b.originalIndex;
    });
    indexedProjects.forEach(({ project, originalIndex }, executedIndex) => {
        const policy = POLICY_INTERVENTIONS[project.intervention_id];
        if (!policy) {
            throw new Error(`Unknown intervention type: ${project.intervention_id}`);
        }
        const budgetRequested = project.budget_allocated;
        let actualBudgetSpent = budgetRequested;
        let isCapped = false;
        let budgetWarning;
        if (actualBudgetSpent > remainingBudget) {
            actualBudgetSpent = Math.max(0, remainingBudget);
            isCapped = true;
            budgetWarning = `Project budget capped from ${currencySymbol}${budgetRequested.toLocaleString()} to remaining ${currencySymbol}${actualBudgetSpent.toLocaleString()}`;
        }
        remainingBudget -= actualBudgetSpent;
        const unitCost = (budgetCurrency === "coins" && policy.cost_coins_per_pct)
            ? policy.cost_coins_per_pct
            : policy.unit_cost_usd_per_pct;
        const pctConversion = (actualBudgetSpent / unitCost);
        const hectaresRequested = (pctConversion / 100) * current_state.total_area_hectares;
        // Check available source classes for conversion
        let maxPossibleScale = 1.0;
        for (const [key, deltaPerUnit] of Object.entries(policy.conversions)) {
            if (deltaPerUnit && deltaPerUnit < 0) {
                const classKey = key;
                const available = workingLandCover[classKey] ?? 0;
                const targetReduction = Math.abs(deltaPerUnit * pctConversion);
                if (targetReduction > 0) {
                    const classScale = available / targetReduction;
                    if (classScale < maxPossibleScale) {
                        maxPossibleScale = Math.max(0, classScale);
                    }
                }
            }
        }
        const effectivePctConversion = pctConversion * maxPossibleScale;
        const hectaresConverted = (effectivePctConversion / 100) * current_state.total_area_hectares;
        // Apply shifts to land cover
        let primarySourceClass = null;
        let maxSourceReduction = 0;
        for (const [key, deltaPerUnit] of Object.entries(policy.conversions)) {
            const classKey = key;
            const delta = (deltaPerUnit ?? 0) * effectivePctConversion;
            if ((deltaPerUnit ?? 0) < 0 && Math.abs(delta) > maxSourceReduction) {
                maxSourceReduction = Math.abs(delta);
                primarySourceClass = classKey;
            }
            workingLandCover[classKey] = Number(Math.max(0, Math.min(100, workingLandCover[classKey] + delta)).toFixed(2));
        }
        // Ensure land cover sums strictly to 100% without rounding drift
        const total = Number(Object.values(workingLandCover).reduce((acc, v) => acc + v, 0).toFixed(2));
        const diff = Number((100 - total).toFixed(2));
        if (Math.abs(diff) > 0.0001) {
            const targetKey = primarySourceClass ?? "built_up_50";
            workingLandCover[targetKey] = Number(Math.max(0, Math.min(100, workingLandCover[targetKey] + diff)).toFixed(2));
        }
        // Roof treatment and albedo boost accumulation
        if (project.intervention_id === "cool_roofs") {
            workingRoofTreatmentHa += hectaresConverted;
        }
        const interventionAlbedoBoost = policy.albedo_boost
            ? (policy.albedo_boost * (effectivePctConversion / 100))
            : 0;
        accumulatedAlbedoBoost += interventionAlbedoBoost;
        // Step calculation for intermediate payload
        const stepCooling = calculateInVESTCooling(workingLandCover, priorCoolRoofBoost + accumulatedAlbedoBoost);
        const stepFlood = calculateInVESTFloodRisk(workingLandCover, current_state.total_area_hectares);
        const stepTempDrop = Math.max(0, stepCooling.surface_temperature_drop_c - priorCooling.surface_temperature_drop_c);
        intermediateSteps.push({
            intervention_id: project.intervention_id,
            area_converted_hectares: Number(hectaresConverted.toFixed(2)),
            post_step_temp_drop_celsius: Number(stepTempDrop.toFixed(2)),
            post_step_stormwater_retained_m3: stepFlood.stormwater_retained_m3
        });
        projectsExecuted.push({
            intervention_id: project.intervention_id,
            intervention_name: policy.name,
            ...(project.project_name ? { project_name: project.project_name } : {}),
            original_index: originalIndex,
            executed_index: executedIndex,
            budget_requested: budgetRequested,
            budget_allocated: actualBudgetSpent,
            budget_capped: isCapped,
            ...(budgetWarning ? { budget_warning: budgetWarning } : {}),
            area_converted_hectares: Number(hectaresConverted.toFixed(2)),
            pct_area_converted: Number(effectivePctConversion.toFixed(2))
        });
    });
    // 3. Biophysical Modeling for Final Accumulated State
    const postCooling = calculateInVESTCooling(workingLandCover, priorCoolRoofBoost + accumulatedAlbedoBoost);
    const postFlood = calculateInVESTFloodRisk(workingLandCover, current_state.total_area_hectares);
    // Invoke applyAnnualDrySeason exactly once per year as an annual climate stress phase
    const drySeasonImpact = applyAnnualDrySeason(workingLandCover, {
        totalAreaHectares: current_state.total_area_hectares,
        roofTreatmentHa: workingRoofTreatmentHa,
        accumulatedAlbedoBoost,
        droughtStressFactor: 0.5,
        droughtPrecipitationMm: 10
    });
    // Baseline runoff determination
    const baselineLandCover = current_state.baseline_land_cover ?? initialLandCover;
    let baselineRunoffMm;
    if (current_state.baseline_runoff_mm !== undefined) {
        baselineRunoffMm = current_state.baseline_runoff_mm;
    }
    else if (current_state.baseline_land_cover) {
        const baseFlood = calculateInVESTFloodRisk(current_state.baseline_land_cover, current_state.total_area_hectares);
        baselineRunoffMm = baseFlood.direct_runoff_mm;
    }
    else {
        baselineRunoffMm = priorFlood.direct_runoff_mm;
    }
    // Calculate Turn 0 baseline retained water vs current year improvement
    const baseFloodRisk = current_state.baseline_land_cover
        ? calculateInVESTFloodRisk(current_state.baseline_land_cover, current_state.total_area_hectares)
        : priorFlood;
    const baselineStormwaterRetainedM3 = baseFloodRisk.stormwater_retained_m3;
    const cumulativeRetainedImprovementM3 = Number(Math.max(0, postFlood.stormwater_retained_m3 - baselineStormwaterRetainedM3).toFixed(1));
    // Incremental runoff reduction caused specifically by this year's executed projects
    const yearRunoffReductionDepthMm = Math.max(0, Number((priorFlood.direct_runoff_mm - postFlood.direct_runoff_mm).toFixed(2)));
    const totalAreaM2 = current_state.total_area_hectares * 10000;
    const annualPlanIncrementalRunoffReductionM3 = Number(((yearRunoffReductionDepthMm / 1000) * totalAreaM2).toFixed(1));
    // Cumulative ESA shifts
    const cumulativeEsaShifts = {};
    for (const key of Object.keys(initialLandCover)) {
        cumulativeEsaShifts[key] = {
            prior_pct: Number(initialLandCover[key].toFixed(2)),
            post_pct: Number(workingLandCover[key].toFixed(2)),
            delta_pct: Number((workingLandCover[key] - initialLandCover[key]).toFixed(2))
        };
    }
    // 4. Synthesize Combined Scores and Youth Scorecard
    const coolingScore = Math.min(100, Math.round(postCooling.heat_mitigation_index * 135));
    const floodScore = Math.min(100, Math.round(postFlood.retention_efficiency_pct * 1.15));
    // Land restoration score: UN SDG 15.3.1 - based on reduction in degraded built_up_50 + bare_soil_60 into vegetated classes
    const initialDegraded = (initialLandCover.built_up_50 ?? 0) + (initialLandCover.bare_soil_60 ?? 0);
    const finalDegraded = (workingLandCover.built_up_50 ?? 0) + (workingLandCover.bare_soil_60 ?? 0);
    const degradedHectaresRestored = Math.max(0, ((initialDegraded - finalDegraded) / 100) * current_state.total_area_hectares);
    const landRestorationScore = Math.min(100, Math.round((degradedHectaresRestored / (current_state.total_area_hectares * 0.15)) * 100));
    const overallSustainability = Math.round((coolingScore * 0.4) + (floodScore * 0.4) + (landRestorationScore * 0.2));
    const deltaTempC = Math.max(0, postCooling.surface_temperature_drop_c - priorCooling.surface_temperature_drop_c);
    // Generate youth analogies and scorecard
    const totalSpent = projectsExecuted.reduce((acc, p) => acc + p.budget_allocated, 0);
    const olympicPools = (postFlood.stormwater_retained_m3 / 2500).toFixed(1);
    const bathtubs = Math.round(postFlood.stormwater_retained_m3 / 0.3).toLocaleString();
    const coolingStars = Math.min(5, Math.max(1, Math.round(coolingScore / 20)));
    const waterAnalogy = parseFloat(olympicPools) >= 1.0
        ? `Soaked up ${postFlood.stormwater_retained_m3.toLocaleString()} m³ of rain—equivalent to filling ${olympicPools} Olympic swimming pools (or ~${bathtubs} full bathtubs)!`
        : `Absorbed ${postFlood.stormwater_retained_m3.toLocaleString()} m³ of rainwater—that's roughly ${bathtubs} backyard bathtubs saved from storm drains!`;
    const projectNames = projectsExecuted.map((p) => p.project_name || p.intervention_name).join(", ");
    let headline = `Comprehensive Year Plan executed: ${projectsExecuted.length} project(s) deployed!`;
    let youthTakeaway = "";
    let vibe = "Warm & Humid";
    if (coolingScore >= 80 && floodScore >= 80) {
        headline = `Spectacular multi-project transformation! Combined investments create an urban climate haven.`;
        youthTakeaway = `The community deployed ${projectNames}. Neighborhood streets feel like an interconnected forest park with cool breezes and dry walkways!`;
        vibe = "Oasis Breeze (Super Chill ❄️)";
    }
    else if (coolingScore >= 60 || floodScore >= 60) {
        headline = `Major resilience milestone! ${projectsExecuted.length} green projects cool streets and absorb floodwater.`;
        youthTakeaway = `Investing across ${projectNames} cooled neighborhood hotspots and virtually eliminated puddling after major rain events.`;
        vibe = "Pleasantly Fresh (Comfortable 🌳)";
    }
    else {
        headline = `Solid foundational progress: ${projectsExecuted.length} resilience project(s) underway.`;
        youthTakeaway = `New plantings and retrofits (${projectNames}) are taking root across the district.`;
        vibe = "Summer Sun (Starting to Cool Down 🌤️)";
    }
    const tempDropDisplay = deltaTempC > 0
        ? `-${deltaTempC.toFixed(2)}°C (-${(deltaTempC * 1.8).toFixed(2)}°F)`
        : "0.0°C (Baseline)";
    const nextState = {
        total_area_hectares: current_state.total_area_hectares,
        remaining_budget: remainingBudget,
        budget_currency: budgetCurrency,
        roof_treatment_hectares: Number(workingRoofTreatmentHa.toFixed(2)),
        baseline_runoff_mm: baselineRunoffMm,
        baseline_land_cover: baselineLandCover,
        land_cover: workingLandCover
    };
    return {
        ...(year !== undefined ? { year } : {}),
        projects_executed: projectsExecuted,
        total_budget_spent: totalSpent,
        next_state: nextState,
        youth_scorecard: {
            headline,
            youth_takeaway: youthTakeaway,
            net_cooling_score: coolingScore,
            runoff_score: floodScore,
            land_restoration_score: landRestorationScore,
            overall_sustainability_score: overallSustainability,
            cooling_stars: coolingStars,
            temperature_drop_display: tempDropDisplay,
            water_retention_analogy: waterAnalogy,
            neighborhood_vibe: vibe,
            dry_season_impact: {
                drought_resilience_score: drySeasonImpact.drought_resilience_score,
                temperature_under_dry_heat_display: drySeasonImpact.temperature_under_dry_heat_display,
                drought_summary: drySeasonImpact.drought_summary
            }
        },
        science_payload: {
            models_referenced: [
                "Stanford InVEST Urban Cooling Model v3.14 (Heat Mitigation Index)",
                "Stanford InVEST Urban Flood Risk Mitigation Model (USDA SCS-CN Curve Number)",
                "ESA WorldCover 10m Land Cover Classification",
                "UN SDG 15.3.1 Land Degradation Neutrality Framework"
            ],
            cumulative_esa_worldcover_shifts: cumulativeEsaShifts,
            invest_urban_cooling: {
                prior_hmi: priorCooling.heat_mitigation_index,
                post_hmi: postCooling.heat_mitigation_index,
                hmi_delta: Number((postCooling.heat_mitigation_index - priorCooling.heat_mitigation_index).toFixed(4)),
                surface_temp_drop_celsius: Number(deltaTempC.toFixed(2)),
                surface_temp_drop_fahrenheit: Number((deltaTempC * 1.8).toFixed(2)),
                annual_plan_temp_drop_celsius: Number(deltaTempC.toFixed(2)),
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
                baseline_runoff_mm: baselineRunoffMm,
                prior_composite_cn: priorFlood.composite_curve_number,
                post_composite_cn: postFlood.composite_curve_number,
                prior_runoff_mm: priorFlood.direct_runoff_mm,
                post_runoff_mm: postFlood.direct_runoff_mm,
                retained_runoff_depth_mm: postFlood.retained_water_depth_mm,
                design_storm_total_retained_m3: postFlood.stormwater_retained_m3,
                cumulative_retained_improvement_m3: cumulativeRetainedImprovementM3,
                annual_plan_incremental_runoff_reduction_m3: annualPlanIncrementalRunoffReductionM3,
                stormwater_retained_m3: postFlood.stormwater_retained_m3,
                incremental_runoff_reduction_m3: annualPlanIncrementalRunoffReductionM3,
                retention_efficiency_pct: postFlood.retention_efficiency_pct
            },
            dry_season_impact: {
                drought_precipitation_mm: drySeasonImpact.drySeasonFlood.design_storm_depth_mm,
                drought_temp_drop_celsius: drySeasonImpact.drySeasonCooling.surface_temperature_drop_c,
                peak_dry_heat_surface_temp_celsius: drySeasonImpact.peak_dry_heat_surface_temp_celsius,
                drought_resilience_score: drySeasonImpact.drought_resilience_score,
                et_loss_pct: drySeasonImpact.drySeasonCooling.et_loss_pct,
                canopy_resilience_ratio: drySeasonImpact.drySeasonCooling.canopy_et_retention_ratio,
                drought_retention_pct: drySeasonImpact.drySeasonFlood.drought_retention_pct,
                sponge_capacity_description: drySeasonImpact.drySeasonFlood.drought_retention_pct >= 95
                    ? `Natural sponge soils retain ${drySeasonImpact.drySeasonFlood.drought_retention_pct}% of dry-season rainfall without runoff.`
                    : `Dry season runoff deficit of ${drySeasonImpact.drySeasonFlood.unretained_drought_runoff_m3} m³ due to soil crusting and lack of bioswales.`
            },
            intermediate_steps: intermediateSteps
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
            tools: [SIMULATE_POLICY_TURN_TOOL, SIMULATE_YEAR_PLAN_TOOL]
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
        if (request.params.name === "simulate_year_plan") {
            try {
                const result = executeYearPlanSimulation(request.params.arguments);
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
                if (err instanceof SimulationPlanError) {
                    return {
                        isError: true,
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(err.detail, null, 2)
                            }
                        ]
                    };
                }
                const errorMsg = err instanceof Error ? err.message : String(err);
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: `Year plan simulation error: ${errorMsg}`
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
