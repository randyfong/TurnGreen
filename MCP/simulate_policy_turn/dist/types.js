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
    budget_allocated: z.number().positive().describe("Budget allocated for this intervention in USD"),
    current_state: z.object({
        total_area_hectares: z.number().positive().default(50).describe("Total neighborhood area in hectares"),
        remaining_budget: z.number().default(200000).describe("Current player remaining budget"),
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
