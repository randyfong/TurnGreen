import { z } from "zod";

/**
 * ESA WorldCover 2021/2020 Standard Land Cover Classes
 * 10: Tree cover
 * 20: Shrubland
 * 30: Grassland
 * 40: Cropland
 * 50: Built-up (Impervious surface, asphalt, roofs)
 * 60: Bare / sparse vegetation
 * 80: Permanent water bodies
 */
export type ESAWorldCoverClass = 10 | 20 | 30 | 40 | 50 | 60 | 80;

export interface LandCoverDistribution {
  tree_cover_10: number;       // Percentage (0 - 100)
  shrubland_20: number;        // Percentage (0 - 100)
  grassland_30: number;        // Percentage (0 - 100)
  cropland_40: number;         // Percentage (0 - 100)
  built_up_50: number;         // Percentage (0 - 100)
  bare_soil_60: number;        // Percentage (0 - 100)
  water_80: number;            // Percentage (0 - 100)
}

export type BudgetCurrency = "coins" | "usd";

export interface NeighborhoodState {
  total_area_hectares: number; // Default e.g. 50 hectares
  land_cover: LandCoverDistribution;
  remaining_budget: number;
  budget_currency?: BudgetCurrency; // "coins" or "usd" (default: "coins")
  roof_treatment_hectares?: number; // Cumulative area of high-albedo roof/surface retrofits in hectares
  baseline_runoff_mm?: number; // Baseline (Turn 0) design storm runoff depth in mm
  baseline_land_cover?: LandCoverDistribution; // Baseline (Turn 0) land cover distribution
}

export type InterventionType =
  | "green_roofs"
  | "pocket_parks"
  | "urban_canopy_trees"
  | "permeable_pavement"
  | "bioswales"
  | "cool_roofs";

export interface InterventionConfig {
  id: InterventionType;
  name: string;
  description: string;
  unit_cost_usd_per_pct: number; // Cost in USD to convert 1% of total neighborhood area
  cost_coins_per_pct?: number;   // Cost in coins to convert 1% of total neighborhood area
  conversions: Partial<Record<keyof LandCoverDistribution, number>>; // Deltas per 1% intervention
  albedo_boost?: number; // Direct surface reflectivity delta
}

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

export type PolicyInput = z.infer<typeof PolicyInputSchema>;

export const YearPlanProjectSchema = z.object({
  intervention_id: z.enum([
    "green_roofs",
    "pocket_parks",
    "urban_canopy_trees",
    "permeable_pavement",
    "bioswales",
    "cool_roofs"
  ]).describe("Selected urban policy intervention"),
  budget_allocated: z.number().positive().describe("Budget allocated for this intervention in coins or USD"),
  project_name: z.string().optional().describe("Optional custom display name for this project")
});

export type YearPlanProject = z.infer<typeof YearPlanProjectSchema>;

export const YearPlanInputSchema = z.object({
  year: z.number().int().min(1).max(5).optional().describe("Optional year or turn identifier (1 to 5)"),
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

export type YearPlanInput = z.infer<typeof YearPlanInputSchema>;

export interface SimulationResult {
  turn: number;
  intervention: {
    id: InterventionType;
    name: string;
    budget_requested: number;
    budget_allocated: number;
    budget_capped: boolean;
    budget_warning?: string;
    area_converted_hectares: number;
    pct_area_converted: number;
  };
  next_state: NeighborhoodState;
  player_summary: {
    headline: string;
    youth_takeaway: string;
    cooling_stars: number; // 1 to 5
    temperature_drop_display: string;
    water_retention_analogy: string;
    neighborhood_vibe: string;
  };
  player_metrics: {
    overall_sustainability_score: number; // 0 - 100
    cooling_score: number; // 0 - 100
    flood_resilience_score: number; // 0 - 100
    community_cheer_score: number; // 0 - 100
    design_storm_total_retained_m3: number; // Absolute total stormwater retained by soil/canopy during design storm
    incremental_runoff_reduction_m3: number; // Incremental stormwater runoff reduction relative to baseline (avoided flood volume)
  };
  science_payload: {
    models_referenced: string[];
    esa_worldcover_shifts: Record<string, { prior_pct: number; post_pct: number; delta_pct: number }>;
    invest_urban_cooling: {
      prior_hmi: number;
      post_hmi: number;
      hmi_delta: number;
      surface_temp_drop_celsius: number;
      surface_temp_drop_fahrenheit: number;
      effective_albedo: { prior: number; post: number };
      vegetation_fraction: { prior: number; post: number };
      et_index: { prior: number; post: number };
    };
    invest_urban_flood: {
      design_storm_depth_mm: number;
      baseline_runoff_mm: number;
      prior_composite_cn: number;
      post_composite_cn: number;
      prior_runoff_mm: number;
      post_runoff_mm: number;
      retained_runoff_depth_mm: number;
      stormwater_retained_m3: number;
      incremental_runoff_reduction_m3: number;
      retention_efficiency_pct: number;
    };
  };
}

export interface ExecutedPlanProject {
  intervention_id: InterventionType;
  intervention_name: string;
  project_name?: string;
  budget_requested: number;
  budget_allocated: number;
  budget_capped: boolean;
  budget_warning?: string;
  area_converted_hectares: number;
  pct_area_converted: number;
}

export interface YearPlanSimulationResult {
  year?: number;
  projects_executed: ExecutedPlanProject[];
  total_budget_spent: number;
  next_state: NeighborhoodState;
  youth_scorecard: {
    headline: string;
    youth_takeaway: string;
    net_cooling_score: number; // 0 - 100
    runoff_score: number; // 0 - 100
    land_restoration_score: number; // 0 - 100
    overall_sustainability_score: number; // 0 - 100
    cooling_stars: number; // 1 to 5
    temperature_drop_display: string;
    water_retention_analogy: string;
    neighborhood_vibe: string;
  };
  science_payload: {
    models_referenced: string[];
    cumulative_esa_worldcover_shifts: Record<string, { prior_pct: number; post_pct: number; delta_pct: number }>;
    invest_urban_cooling: {
      prior_hmi: number;
      post_hmi: number;
      hmi_delta: number;
      surface_temp_drop_celsius: number;
      surface_temp_drop_fahrenheit: number;
      effective_albedo: { prior: number; post: number };
      vegetation_fraction: { prior: number; post: number };
      et_index: { prior: number; post: number };
    };
    invest_urban_flood: {
      design_storm_depth_mm: number;
      baseline_runoff_mm: number;
      prior_composite_cn: number;
      post_composite_cn: number;
      prior_runoff_mm: number;
      post_runoff_mm: number;
      retained_runoff_depth_mm: number;
      stormwater_retained_m3: number;
      incremental_runoff_reduction_m3: number;
      retention_efficiency_pct: number;
    };
    dry_season_impact?: {
      drought_precipitation_mm: number;
      drought_temp_drop_celsius: number;
      et_loss_pct: number;
      canopy_resilience_ratio: number;
      drought_retention_pct: number;
      sponge_capacity_description: string;
    };
    intermediate_steps?: Array<{
      intervention_id: InterventionType;
      area_converted_hectares: number;
      post_step_temp_drop_celsius: number;
      post_step_stormwater_retained_m3: number;
    }>;
  };
}
