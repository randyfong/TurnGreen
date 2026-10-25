import { z } from "zod";
export const TurnRecordSchema = z.object({
    turn: z.number().int().min(1).max(5).describe("Turn number (1 to 5)"),
    intervention_id: z.enum([
        "green_roofs",
        "pocket_parks",
        "urban_canopy_trees",
        "permeable_pavement",
        "bioswales",
        "cool_roofs"
    ]).describe("Intervention ID applied"),
    intervention_name: z.string().describe("Human readable name of intervention"),
    budget_allocated: z.number().nonnegative().describe("Budget spent in USD"),
    area_converted_ha: z.number().nonnegative().optional().describe("Hectares converted"),
    surface_temp_drop_celsius: z.number().optional().describe("Surface cooling delta in °C"),
    runoff_retained_m3: z.number().optional().describe("Volume of stormwater retained in m³"),
    esa_conversions: z.record(z.string(), z.number()).optional().describe("Land cover conversion deltas")
});
export const BaselineLandCoverSchema = z.object({
    built_up_pct: z.number().min(0).max(100).default(72),
    tree_cover_pct: z.number().min(0).max(100).default(12),
    grassland_pct: z.number().min(0).max(100).default(8),
    shrubland_pct: z.number().min(0).max(100).default(3),
    bare_soil_pct: z.number().min(0).max(100).default(5)
});
export const CumulativeMetricsSchema = z.object({
    total_budget_spent: z.number().default(0),
    remaining_budget: z.number().default(0),
    net_cooling_celsius: z.number().default(0),
    net_cooling_fahrenheit: z.number().default(0),
    net_stormwater_retained_m3: z.number().default(0),
    total_modeled_retention_m3: z.number().optional().describe("Total modeled stormwater retained during design storm"),
    baseline_runoff_reduction_m3: z.number().optional().describe("Improvement over original baseline runoff in m³"),
    net_stormwater_retained_gallons: z.number().default(0),
    total_area_converted_ha: z.number().default(0),
    ground_depaved_ha: z.number().optional().describe("Net ground area de-paved (Classes 10 & 20)"),
    rooftop_treated_ha: z.number().optional().describe("Rooftop retrofit area (cool roofs and green roofs)"),
    depaved_impervious_pct: z.number().default(0),
    overall_sustainability_score: z.number().min(0).max(100).default(75),
    community_cheer_score: z.number().min(0).max(100).default(80)
});
export const SessionHistorySchema = z.object({
    session_id: z.string().optional().describe("Anonymous session identifier"),
    turns: z.array(TurnRecordSchema).min(1).describe("List of turns played in simulation (1 to 5)"),
    baseline: BaselineLandCoverSchema.default({}),
    final_metrics: CumulativeMetricsSchema.optional(),
    learning_gain: z.object({
        normalized_gain: z.number(),
        gain_category: z.string(),
        summary: z.string().optional()
    }).optional()
});
export const GenerateYouthResolutionInputSchema = z.object({
    author_name: z.string().min(1).describe("Name of youth author or delegate"),
    district_name: z.string().min(1).describe("Name of target municipal district or neighborhood (e.g. 'District 4 - Eastside Basin')"),
    organization_or_school: z.string().optional().describe("Youth organization, club, or school name (optional)"),
    target_body: z.enum([
        "City Council",
        "School Board",
        "Planning Commission",
        "County Board of Supervisors",
        "Parks & Recreation Commission"
    ]).default("City Council").describe("Target municipal governing body for the resolution"),
    session_history: SessionHistorySchema.describe("History of player turns and biophysical metrics from the simulation")
});
