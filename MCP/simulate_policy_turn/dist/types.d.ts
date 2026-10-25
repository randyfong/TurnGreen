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
export interface NeighborhoodState {
    total_area_hectares: number;
    land_cover: LandCoverDistribution;
    remaining_budget: number;
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
}>;
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
