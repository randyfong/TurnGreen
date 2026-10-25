import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { buildYouthResolution } from "./generators/resolution_builder.js";
import { GenerateYouthResolutionInputSchema } from "./types.js";
const GENERATE_YOUTH_RESOLUTION_TOOL = {
    name: "generate_youth_resolution",
    description: "Accepts the player's 5-turn simulation history, district name, and author name to output a structured 1-page policy mandate featuring three actionable civic talking points ready for city council or school board public comment, backed by Stanford InVEST biophysical models and UN SDG 15.3.1 Land Degradation Neutrality standards.",
    inputSchema: {
        type: "object",
        properties: {
            author_name: {
                type: "string",
                description: "Name of the youth delegate or student author"
            },
            district_name: {
                type: "string",
                description: "Target municipal district or neighborhood name (e.g., 'District 4 - Eastside Basin')"
            },
            organization_or_school: {
                type: "string",
                description: "School, youth climate council, or community organization name (optional; defaults to author and district delegation)"
            },
            target_body: {
                type: "string",
                enum: [
                    "City Council",
                    "School Board",
                    "Planning Commission",
                    "County Board of Supervisors",
                    "Parks & Recreation Commission"
                ],
                description: "Governing body to which the resolution will be submitted",
                default: "City Council"
            },
            session_history: {
                type: "object",
                description: "Simulation session turn history containing interventions, allocated budgets, and biophysical metrics",
                properties: {
                    session_id: { type: "string" },
                    turns: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                turn: { type: "integer", minimum: 1, maximum: 5 },
                                intervention_id: {
                                    type: "string",
                                    enum: [
                                        "green_roofs",
                                        "pocket_parks",
                                        "urban_canopy_trees",
                                        "permeable_pavement",
                                        "bioswales",
                                        "cool_roofs"
                                    ]
                                },
                                intervention_name: { type: "string" },
                                budget_allocated: { type: "number" },
                                area_converted_ha: { type: "number" },
                                surface_temp_drop_celsius: { type: "number" },
                                runoff_retained_m3: { type: "number" }
                            },
                            required: ["turn", "intervention_id", "intervention_name", "budget_allocated"]
                        }
                    },
                    baseline: {
                        type: "object",
                        properties: {
                            built_up_pct: { type: "number" },
                            tree_cover_pct: { type: "number" },
                            grassland_pct: { type: "number" },
                            shrubland_pct: { type: "number" },
                            bare_soil_pct: { type: "number" }
                        }
                    },
                    final_metrics: {
                        type: "object",
                        properties: {
                            total_budget_spent: { type: "number" },
                            remaining_budget: { type: "number" },
                            net_cooling_celsius: { type: "number" },
                            net_cooling_fahrenheit: { type: "number" },
                            net_stormwater_retained_m3: { type: "number" },
                            total_modeled_retention_m3: { type: "number" },
                            baseline_runoff_reduction_m3: { type: "number" },
                            net_stormwater_retained_gallons: { type: "number" },
                            total_area_converted_ha: { type: "number" },
                            net_built_up_reduced_ha: { type: "number" },
                            ground_depaved_ha: { type: "number" },
                            total_ground_interventions_ha: { type: "number" },
                            bare_soil_vegetated_ha: { type: "number" },
                            rooftop_treated_ha: { type: "number" },
                            overall_sustainability_score: { type: "number" },
                            community_cheer_score: { type: "number" }
                        }
                    },
                    learning_gain: {
                        type: "object",
                        properties: {
                            normalized_gain: { type: "number" },
                            gain_category: { type: "string" },
                            summary: { type: "string" }
                        }
                    }
                },
                required: ["turns"]
            }
        },
        required: ["author_name", "district_name", "session_history"]
    }
};
export function executeGenerateYouthResolution(inputRaw) {
    const parsed = GenerateYouthResolutionInputSchema.parse(inputRaw);
    return buildYouthResolution(parsed);
}
async function startServer() {
    const server = new Server({
        name: "resolution-generator-server",
        version: "1.0.0"
    }, {
        capabilities: {
            tools: {}
        }
    });
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [GENERATE_YOUTH_RESOLUTION_TOOL]
        };
    });
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        if (request.params.name === "generate_youth_resolution") {
            try {
                const result = executeGenerateYouthResolution(request.params.arguments);
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
                            text: `Resolution generator error: ${errorMsg}`
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
    console.error("resolution_generator MCP Server running on stdio");
}
if (process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js")) {
    startServer().catch((err) => {
        console.error("Fatal server error:", err);
        process.exit(1);
    });
}
