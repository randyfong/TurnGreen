import { z } from "zod";
export const PolicyInputSchema = z.object({
    turn: z.number().int().min(1).max(5).describe("Current turn number (1 to 5)"),
    intervention_id: z.enum([
        "green_roofs",
        "pocket_parks",
        "urban_canopy_trees",
        "permeable_pavement",
        "bioswales",
        "cool_roofs"
    ]).describe("Selected urban policy intervention"),
    budget_allocated: z.number().positive().describe("Budget allocated for this intervention in coins or USD"),
    current_state: z.object({
        total_area_hectares: z.number().positive().default(50).describe("Total neighborhood area in hectares"),
        remaining_budget: z.number().default(100).describe("Current player remaining budget"),
        budget_currency: z.enum(["coins", "usd"]).optional().describe("Budget currency mode ('coins' or 'usd')"),
        roof_treatment_hectares: z.number().min(0).default(0).describe("Cumulative area of reflective cool roofs/coatings retrofitted in hectares"),
        baseline_runoff_mm: z.number().min(0).optional().describe("Baseline Turn 0 storm runoff depth in mm"),
        baseline_land_cover: z.object({
            tree_cover_10: z.number().min(0).max(100),
            shrubland_20: z.number().min(0).max(100),
            grassland_30: z.number().min(0).max(100),
            cropland_40: z.number().min(0).max(100),
            built_up_50: z.number().min(0).max(100),
            bare_soil_60: z.number().min(0).max(100),
            water_80: z.number().min(0).max(100)
        }).optional().describe("Baseline Turn 0 land cover distribution"),
        land_cover: z.object({
            tree_cover_10: z.number().min(0).max(100).default(12),
            shrubland_20: z.number().min(0).max(100).default(3),
            grassland_30: z.number().min(0).max(100).default(8),
            cropland_40: z.number().min(0).max(100).default(0),
            built_up_50: z.number().min(0).max(100).default(72),
            bare_soil_60: z.number().min(0).max(100).default(5),
            water_80: z.number().min(0).max(100).default(0)
        }).describe("Baseline ESA WorldCover percentages summing to 100")
    }).describe("Stateless neighborhood and budget state passed into the turn")
});
export const YearPlanProjectSchema = z.object({
    intervention_id: z.enum([
        "green_roofs",
        "pocket_parks",
        "urban_canopy_trees",
        "permeable_pavement",
        "bioswales",
        "cool_roofs"
    ]).describe("Selected urban policy intervention"),
    budget_allocated: z.number().positive().describe("Strictly positive budget allocated for this intervention in coins or USD"),
    project_name: z.string().optional().describe("Optional custom display name for this project")
});
export const YearPlanInputSchema = z.object({
    year: z.number().int().min(1).max(5).optional().describe("Optional year or turn identifier (1 to 5)"),
    annual_budget_limit: z.number().positive().optional().describe("Optional annual budget limit for this plan in dollars or coins (e.g., 1000 USD = 100 coins)"),
    max_annual_budget: z.number().positive().optional().describe("Alias for annual_budget_limit for backward compatibility"),
    projects: z.array(YearPlanProjectSchema).min(1).describe("List of interventions to execute within the year plan"),
    current_state: z.object({
        total_area_hectares: z.number().positive().default(50).describe("Total neighborhood area in hectares"),
        remaining_budget: z.number().default(100).describe("Current player remaining budget"),
        budget_currency: z.enum(["coins", "usd"]).optional().describe("Budget currency mode ('coins' or 'usd')"),
        roof_treatment_hectares: z.number().min(0).default(0).describe("Cumulative area of reflective cool roofs/coatings retrofitted in hectares"),
        baseline_runoff_mm: z.number().min(0).optional().describe("Baseline Turn 0 storm runoff depth in mm"),
        baseline_land_cover: z.object({
            tree_cover_10: z.number().min(0).max(100),
            shrubland_20: z.number().min(0).max(100),
            grassland_30: z.number().min(0).max(100),
            cropland_40: z.number().min(0).max(100),
            built_up_50: z.number().min(0).max(100),
            bare_soil_60: z.number().min(0).max(100),
            water_80: z.number().min(0).max(100)
        }).optional().describe("Baseline Turn 0 land cover distribution"),
        land_cover: z.object({
            tree_cover_10: z.number().min(0).max(100).default(12),
            shrubland_20: z.number().min(0).max(100).default(3),
            grassland_30: z.number().min(0).max(100).default(8),
            cropland_40: z.number().min(0).max(100).default(0),
            built_up_50: z.number().min(0).max(100).default(72),
            bare_soil_60: z.number().min(0).max(100).default(5),
            water_80: z.number().min(0).max(100).default(0)
        }).describe("Baseline ESA WorldCover percentages summing to 100")
    }).describe("Stateless neighborhood and budget state passed into the year plan")
});
export class SimulationPlanError extends Error {
    detail;
    constructor(detail) {
        super(detail.message);
        this.name = "SimulationPlanError";
        this.detail = detail;
        Object.setPrototypeOf(this, SimulationPlanError.prototype);
    }
}
