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
    tree_cover_10: number;
    shrubland_20: number;
    grassland_30: number;
    cropland_40: number;
    built_up_50: number;
    bare_soil_60: number;
    water_80: number;
}
export type BudgetCurrency = "coins" | "usd";
export interface NeighborhoodState {
    total_area_hectares: number;
    land_cover: LandCoverDistribution;
    remaining_budget: number;
    budget_currency?: BudgetCurrency;
    roof_treatment_hectares?: number;
    baseline_runoff_mm?: number;
    baseline_land_cover?: LandCoverDistribution;
}
export type InterventionType = "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
export interface InterventionConfig {
    id: InterventionType;
    name: string;
    description: string;
    unit_cost_usd_per_pct: number;
    cost_coins_per_pct?: number;
    conversions: Partial<Record<keyof LandCoverDistribution, number>>;
    albedo_boost?: number;
}
export declare const PolicyInputSchema: z.ZodObject<{
    turn: z.ZodNumber;
    intervention_id: z.ZodEnum<["green_roofs", "pocket_parks", "urban_canopy_trees", "permeable_pavement", "bioswales", "cool_roofs"]>;
    budget_allocated: z.ZodNumber;
    current_state: z.ZodObject<{
        total_area_hectares: z.ZodDefault<z.ZodNumber>;
        remaining_budget: z.ZodDefault<z.ZodNumber>;
        budget_currency: z.ZodOptional<z.ZodEnum<["coins", "usd"]>>;
        roof_treatment_hectares: z.ZodDefault<z.ZodNumber>;
        baseline_runoff_mm: z.ZodOptional<z.ZodNumber>;
        baseline_land_cover: z.ZodOptional<z.ZodObject<{
            tree_cover_10: z.ZodNumber;
            shrubland_20: z.ZodNumber;
            grassland_30: z.ZodNumber;
            cropland_40: z.ZodNumber;
            built_up_50: z.ZodNumber;
            bare_soil_60: z.ZodNumber;
            water_80: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        }, {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        }>>;
        land_cover: z.ZodObject<{
            tree_cover_10: z.ZodDefault<z.ZodNumber>;
            shrubland_20: z.ZodDefault<z.ZodNumber>;
            grassland_30: z.ZodDefault<z.ZodNumber>;
            cropland_40: z.ZodDefault<z.ZodNumber>;
            built_up_50: z.ZodDefault<z.ZodNumber>;
            bare_soil_60: z.ZodDefault<z.ZodNumber>;
            water_80: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        }, {
            tree_cover_10?: number | undefined;
            shrubland_20?: number | undefined;
            grassland_30?: number | undefined;
            cropland_40?: number | undefined;
            built_up_50?: number | undefined;
            bare_soil_60?: number | undefined;
            water_80?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        total_area_hectares: number;
        remaining_budget: number;
        roof_treatment_hectares: number;
        land_cover: {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        };
        budget_currency?: "coins" | "usd" | undefined;
        baseline_runoff_mm?: number | undefined;
        baseline_land_cover?: {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        } | undefined;
    }, {
        land_cover: {
            tree_cover_10?: number | undefined;
            shrubland_20?: number | undefined;
            grassland_30?: number | undefined;
            cropland_40?: number | undefined;
            built_up_50?: number | undefined;
            bare_soil_60?: number | undefined;
            water_80?: number | undefined;
        };
        total_area_hectares?: number | undefined;
        remaining_budget?: number | undefined;
        budget_currency?: "coins" | "usd" | undefined;
        roof_treatment_hectares?: number | undefined;
        baseline_runoff_mm?: number | undefined;
        baseline_land_cover?: {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    turn: number;
    intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
    budget_allocated: number;
    current_state: {
        total_area_hectares: number;
        remaining_budget: number;
        roof_treatment_hectares: number;
        land_cover: {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        };
        budget_currency?: "coins" | "usd" | undefined;
        baseline_runoff_mm?: number | undefined;
        baseline_land_cover?: {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        } | undefined;
    };
}, {
    turn: number;
    intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
    budget_allocated: number;
    current_state: {
        land_cover: {
            tree_cover_10?: number | undefined;
            shrubland_20?: number | undefined;
            grassland_30?: number | undefined;
            cropland_40?: number | undefined;
            built_up_50?: number | undefined;
            bare_soil_60?: number | undefined;
            water_80?: number | undefined;
        };
        total_area_hectares?: number | undefined;
        remaining_budget?: number | undefined;
        budget_currency?: "coins" | "usd" | undefined;
        roof_treatment_hectares?: number | undefined;
        baseline_runoff_mm?: number | undefined;
        baseline_land_cover?: {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        } | undefined;
    };
}>;
export type PolicyInput = z.infer<typeof PolicyInputSchema>;
export declare const YearPlanProjectSchema: z.ZodObject<{
    intervention_id: z.ZodEnum<["green_roofs", "pocket_parks", "urban_canopy_trees", "permeable_pavement", "bioswales", "cool_roofs"]>;
    budget_allocated: z.ZodNumber;
    project_name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
    budget_allocated: number;
    project_name?: string | undefined;
}, {
    intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
    budget_allocated: number;
    project_name?: string | undefined;
}>;
export type YearPlanProject = z.infer<typeof YearPlanProjectSchema>;
export declare const YearPlanInputSchema: z.ZodObject<{
    year: z.ZodOptional<z.ZodNumber>;
    annual_budget_limit: z.ZodOptional<z.ZodNumber>;
    max_annual_budget: z.ZodOptional<z.ZodNumber>;
    projects: z.ZodArray<z.ZodObject<{
        intervention_id: z.ZodEnum<["green_roofs", "pocket_parks", "urban_canopy_trees", "permeable_pavement", "bioswales", "cool_roofs"]>;
        budget_allocated: z.ZodNumber;
        project_name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
        budget_allocated: number;
        project_name?: string | undefined;
    }, {
        intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
        budget_allocated: number;
        project_name?: string | undefined;
    }>, "many">;
    current_state: z.ZodObject<{
        total_area_hectares: z.ZodDefault<z.ZodNumber>;
        remaining_budget: z.ZodDefault<z.ZodNumber>;
        budget_currency: z.ZodOptional<z.ZodEnum<["coins", "usd"]>>;
        roof_treatment_hectares: z.ZodDefault<z.ZodNumber>;
        baseline_runoff_mm: z.ZodOptional<z.ZodNumber>;
        baseline_land_cover: z.ZodOptional<z.ZodObject<{
            tree_cover_10: z.ZodNumber;
            shrubland_20: z.ZodNumber;
            grassland_30: z.ZodNumber;
            cropland_40: z.ZodNumber;
            built_up_50: z.ZodNumber;
            bare_soil_60: z.ZodNumber;
            water_80: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        }, {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        }>>;
        land_cover: z.ZodObject<{
            tree_cover_10: z.ZodDefault<z.ZodNumber>;
            shrubland_20: z.ZodDefault<z.ZodNumber>;
            grassland_30: z.ZodDefault<z.ZodNumber>;
            cropland_40: z.ZodDefault<z.ZodNumber>;
            built_up_50: z.ZodDefault<z.ZodNumber>;
            bare_soil_60: z.ZodDefault<z.ZodNumber>;
            water_80: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        }, {
            tree_cover_10?: number | undefined;
            shrubland_20?: number | undefined;
            grassland_30?: number | undefined;
            cropland_40?: number | undefined;
            built_up_50?: number | undefined;
            bare_soil_60?: number | undefined;
            water_80?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        total_area_hectares: number;
        remaining_budget: number;
        roof_treatment_hectares: number;
        land_cover: {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        };
        budget_currency?: "coins" | "usd" | undefined;
        baseline_runoff_mm?: number | undefined;
        baseline_land_cover?: {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        } | undefined;
    }, {
        land_cover: {
            tree_cover_10?: number | undefined;
            shrubland_20?: number | undefined;
            grassland_30?: number | undefined;
            cropland_40?: number | undefined;
            built_up_50?: number | undefined;
            bare_soil_60?: number | undefined;
            water_80?: number | undefined;
        };
        total_area_hectares?: number | undefined;
        remaining_budget?: number | undefined;
        budget_currency?: "coins" | "usd" | undefined;
        roof_treatment_hectares?: number | undefined;
        baseline_runoff_mm?: number | undefined;
        baseline_land_cover?: {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    current_state: {
        total_area_hectares: number;
        remaining_budget: number;
        roof_treatment_hectares: number;
        land_cover: {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        };
        budget_currency?: "coins" | "usd" | undefined;
        baseline_runoff_mm?: number | undefined;
        baseline_land_cover?: {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        } | undefined;
    };
    projects: {
        intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
        budget_allocated: number;
        project_name?: string | undefined;
    }[];
    year?: number | undefined;
    annual_budget_limit?: number | undefined;
    max_annual_budget?: number | undefined;
}, {
    current_state: {
        land_cover: {
            tree_cover_10?: number | undefined;
            shrubland_20?: number | undefined;
            grassland_30?: number | undefined;
            cropland_40?: number | undefined;
            built_up_50?: number | undefined;
            bare_soil_60?: number | undefined;
            water_80?: number | undefined;
        };
        total_area_hectares?: number | undefined;
        remaining_budget?: number | undefined;
        budget_currency?: "coins" | "usd" | undefined;
        roof_treatment_hectares?: number | undefined;
        baseline_runoff_mm?: number | undefined;
        baseline_land_cover?: {
            tree_cover_10: number;
            shrubland_20: number;
            grassland_30: number;
            cropland_40: number;
            built_up_50: number;
            bare_soil_60: number;
            water_80: number;
        } | undefined;
    };
    projects: {
        intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
        budget_allocated: number;
        project_name?: string | undefined;
    }[];
    year?: number | undefined;
    annual_budget_limit?: number | undefined;
    max_annual_budget?: number | undefined;
}>;
export type YearPlanInput = z.infer<typeof YearPlanInputSchema>;
export type SimulationErrorCode = "EMPTY_PLAN" | "INVALID_PROJECT" | "NON_POSITIVE_BUDGET" | "ANNUAL_BUDGET_EXCEEDED" | "REMAINING_BUDGET_EXCEEDED" | "DUPLICATE_PROJECT_TYPE" | "UNKNOWN_INTERVENTION";
export interface SimulationPlanErrorDetail {
    error_code: SimulationErrorCode;
    project_index?: number;
    project_name?: string;
    message: string;
}
export declare class SimulationPlanError extends Error {
    readonly detail: SimulationPlanErrorDetail;
    constructor(detail: SimulationPlanErrorDetail);
}
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
        cooling_stars: number;
        temperature_drop_display: string;
        water_retention_analogy: string;
        neighborhood_vibe: string;
    };
    player_metrics: {
        overall_sustainability_score: number;
        cooling_score: number;
        flood_resilience_score: number;
        community_cheer_score: number;
        design_storm_total_retained_m3: number;
        incremental_runoff_reduction_m3: number;
    };
    science_payload: {
        models_referenced: string[];
        esa_worldcover_shifts: Record<string, {
            prior_pct: number;
            post_pct: number;
            delta_pct: number;
        }>;
        invest_urban_cooling: {
            prior_hmi: number;
            post_hmi: number;
            hmi_delta: number;
            surface_temp_drop_celsius: number;
            surface_temp_drop_fahrenheit: number;
            effective_albedo: {
                prior: number;
                post: number;
            };
            vegetation_fraction: {
                prior: number;
                post: number;
            };
            et_index: {
                prior: number;
                post: number;
            };
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
    original_index: number;
    executed_index: number;
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
        net_cooling_score: number;
        runoff_score: number;
        land_restoration_score: number;
        overall_sustainability_score: number;
        cooling_stars: number;
        temperature_drop_display: string;
        water_retention_analogy: string;
        neighborhood_vibe: string;
        dry_season_impact?: {
            drought_resilience_score: number;
            temperature_under_dry_heat_display: string;
            drought_summary: string;
        };
    };
    science_payload: {
        models_referenced: string[];
        cumulative_esa_worldcover_shifts: Record<string, {
            prior_pct: number;
            post_pct: number;
            delta_pct: number;
        }>;
        invest_urban_cooling: {
            prior_hmi: number;
            post_hmi: number;
            hmi_delta: number;
            surface_temp_drop_celsius: number;
            surface_temp_drop_fahrenheit: number;
            annual_plan_temp_drop_celsius: number;
            effective_albedo: {
                prior: number;
                post: number;
            };
            vegetation_fraction: {
                prior: number;
                post: number;
            };
            et_index: {
                prior: number;
                post: number;
            };
        };
        invest_urban_flood: {
            design_storm_depth_mm: number;
            baseline_runoff_mm: number;
            prior_composite_cn: number;
            post_composite_cn: number;
            prior_runoff_mm: number;
            post_runoff_mm: number;
            retained_runoff_depth_mm: number;
            design_storm_total_retained_m3: number;
            cumulative_retained_improvement_m3: number;
            annual_plan_incremental_runoff_reduction_m3: number;
            stormwater_retained_m3: number;
            incremental_runoff_reduction_m3: number;
            retention_efficiency_pct: number;
        };
        dry_season_impact?: {
            drought_precipitation_mm: number;
            drought_temp_drop_celsius: number;
            peak_dry_heat_surface_temp_celsius: number;
            drought_resilience_score: number;
            et_loss_pct: number;
            canopy_resilience_ratio: number;
            drought_retention_pct: number;
            sponge_capacity_description: string;
        };
        /**
         * Snapshots representing intermediate state progression. Do not sum these values together.
         */
        intermediate_steps?: Array<{
            intervention_id: InterventionType;
            area_converted_hectares: number;
            post_step_temp_drop_celsius: number;
            post_step_stormwater_retained_m3: number;
        }>;
    };
}
