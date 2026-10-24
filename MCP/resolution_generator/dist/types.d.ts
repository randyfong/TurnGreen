import { z } from "zod";
export declare const TurnRecordSchema: z.ZodObject<{
    turn: z.ZodNumber;
    intervention_id: z.ZodEnum<["green_roofs", "pocket_parks", "urban_canopy_trees", "permeable_pavement", "bioswales", "cool_roofs"]>;
    intervention_name: z.ZodString;
    budget_allocated: z.ZodNumber;
    area_converted_ha: z.ZodOptional<z.ZodNumber>;
    surface_temp_drop_celsius: z.ZodOptional<z.ZodNumber>;
    runoff_retained_m3: z.ZodOptional<z.ZodNumber>;
    esa_conversions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    turn: number;
    intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
    intervention_name: string;
    budget_allocated: number;
    area_converted_ha?: number | undefined;
    surface_temp_drop_celsius?: number | undefined;
    runoff_retained_m3?: number | undefined;
    esa_conversions?: Record<string, number> | undefined;
}, {
    turn: number;
    intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
    intervention_name: string;
    budget_allocated: number;
    area_converted_ha?: number | undefined;
    surface_temp_drop_celsius?: number | undefined;
    runoff_retained_m3?: number | undefined;
    esa_conversions?: Record<string, number> | undefined;
}>;
export type TurnRecord = z.infer<typeof TurnRecordSchema>;
export declare const BaselineLandCoverSchema: z.ZodObject<{
    built_up_pct: z.ZodDefault<z.ZodNumber>;
    tree_cover_pct: z.ZodDefault<z.ZodNumber>;
    grassland_pct: z.ZodDefault<z.ZodNumber>;
    shrubland_pct: z.ZodDefault<z.ZodNumber>;
    bare_soil_pct: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    built_up_pct: number;
    tree_cover_pct: number;
    grassland_pct: number;
    shrubland_pct: number;
    bare_soil_pct: number;
}, {
    built_up_pct?: number | undefined;
    tree_cover_pct?: number | undefined;
    grassland_pct?: number | undefined;
    shrubland_pct?: number | undefined;
    bare_soil_pct?: number | undefined;
}>;
export type BaselineLandCover = z.infer<typeof BaselineLandCoverSchema>;
export declare const CumulativeMetricsSchema: z.ZodObject<{
    total_budget_spent: z.ZodDefault<z.ZodNumber>;
    remaining_budget: z.ZodDefault<z.ZodNumber>;
    net_cooling_celsius: z.ZodDefault<z.ZodNumber>;
    net_cooling_fahrenheit: z.ZodDefault<z.ZodNumber>;
    net_stormwater_retained_m3: z.ZodDefault<z.ZodNumber>;
    net_stormwater_retained_gallons: z.ZodDefault<z.ZodNumber>;
    total_area_converted_ha: z.ZodDefault<z.ZodNumber>;
    ground_depaved_ha: z.ZodOptional<z.ZodNumber>;
    rooftop_treated_ha: z.ZodOptional<z.ZodNumber>;
    depaved_impervious_pct: z.ZodDefault<z.ZodNumber>;
    overall_sustainability_score: z.ZodDefault<z.ZodNumber>;
    community_cheer_score: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    total_budget_spent: number;
    remaining_budget: number;
    net_cooling_celsius: number;
    net_cooling_fahrenheit: number;
    net_stormwater_retained_m3: number;
    net_stormwater_retained_gallons: number;
    total_area_converted_ha: number;
    depaved_impervious_pct: number;
    overall_sustainability_score: number;
    community_cheer_score: number;
    ground_depaved_ha?: number | undefined;
    rooftop_treated_ha?: number | undefined;
}, {
    total_budget_spent?: number | undefined;
    remaining_budget?: number | undefined;
    net_cooling_celsius?: number | undefined;
    net_cooling_fahrenheit?: number | undefined;
    net_stormwater_retained_m3?: number | undefined;
    net_stormwater_retained_gallons?: number | undefined;
    total_area_converted_ha?: number | undefined;
    ground_depaved_ha?: number | undefined;
    rooftop_treated_ha?: number | undefined;
    depaved_impervious_pct?: number | undefined;
    overall_sustainability_score?: number | undefined;
    community_cheer_score?: number | undefined;
}>;
export type CumulativeMetrics = z.infer<typeof CumulativeMetricsSchema>;
export declare const SessionHistorySchema: z.ZodObject<{
    session_id: z.ZodOptional<z.ZodString>;
    turns: z.ZodArray<z.ZodObject<{
        turn: z.ZodNumber;
        intervention_id: z.ZodEnum<["green_roofs", "pocket_parks", "urban_canopy_trees", "permeable_pavement", "bioswales", "cool_roofs"]>;
        intervention_name: z.ZodString;
        budget_allocated: z.ZodNumber;
        area_converted_ha: z.ZodOptional<z.ZodNumber>;
        surface_temp_drop_celsius: z.ZodOptional<z.ZodNumber>;
        runoff_retained_m3: z.ZodOptional<z.ZodNumber>;
        esa_conversions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        turn: number;
        intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
        intervention_name: string;
        budget_allocated: number;
        area_converted_ha?: number | undefined;
        surface_temp_drop_celsius?: number | undefined;
        runoff_retained_m3?: number | undefined;
        esa_conversions?: Record<string, number> | undefined;
    }, {
        turn: number;
        intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
        intervention_name: string;
        budget_allocated: number;
        area_converted_ha?: number | undefined;
        surface_temp_drop_celsius?: number | undefined;
        runoff_retained_m3?: number | undefined;
        esa_conversions?: Record<string, number> | undefined;
    }>, "many">;
    baseline: z.ZodDefault<z.ZodObject<{
        built_up_pct: z.ZodDefault<z.ZodNumber>;
        tree_cover_pct: z.ZodDefault<z.ZodNumber>;
        grassland_pct: z.ZodDefault<z.ZodNumber>;
        shrubland_pct: z.ZodDefault<z.ZodNumber>;
        bare_soil_pct: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        built_up_pct: number;
        tree_cover_pct: number;
        grassland_pct: number;
        shrubland_pct: number;
        bare_soil_pct: number;
    }, {
        built_up_pct?: number | undefined;
        tree_cover_pct?: number | undefined;
        grassland_pct?: number | undefined;
        shrubland_pct?: number | undefined;
        bare_soil_pct?: number | undefined;
    }>>;
    final_metrics: z.ZodOptional<z.ZodObject<{
        total_budget_spent: z.ZodDefault<z.ZodNumber>;
        remaining_budget: z.ZodDefault<z.ZodNumber>;
        net_cooling_celsius: z.ZodDefault<z.ZodNumber>;
        net_cooling_fahrenheit: z.ZodDefault<z.ZodNumber>;
        net_stormwater_retained_m3: z.ZodDefault<z.ZodNumber>;
        net_stormwater_retained_gallons: z.ZodDefault<z.ZodNumber>;
        total_area_converted_ha: z.ZodDefault<z.ZodNumber>;
        ground_depaved_ha: z.ZodOptional<z.ZodNumber>;
        rooftop_treated_ha: z.ZodOptional<z.ZodNumber>;
        depaved_impervious_pct: z.ZodDefault<z.ZodNumber>;
        overall_sustainability_score: z.ZodDefault<z.ZodNumber>;
        community_cheer_score: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        total_budget_spent: number;
        remaining_budget: number;
        net_cooling_celsius: number;
        net_cooling_fahrenheit: number;
        net_stormwater_retained_m3: number;
        net_stormwater_retained_gallons: number;
        total_area_converted_ha: number;
        depaved_impervious_pct: number;
        overall_sustainability_score: number;
        community_cheer_score: number;
        ground_depaved_ha?: number | undefined;
        rooftop_treated_ha?: number | undefined;
    }, {
        total_budget_spent?: number | undefined;
        remaining_budget?: number | undefined;
        net_cooling_celsius?: number | undefined;
        net_cooling_fahrenheit?: number | undefined;
        net_stormwater_retained_m3?: number | undefined;
        net_stormwater_retained_gallons?: number | undefined;
        total_area_converted_ha?: number | undefined;
        ground_depaved_ha?: number | undefined;
        rooftop_treated_ha?: number | undefined;
        depaved_impervious_pct?: number | undefined;
        overall_sustainability_score?: number | undefined;
        community_cheer_score?: number | undefined;
    }>>;
    learning_gain: z.ZodOptional<z.ZodObject<{
        normalized_gain: z.ZodNumber;
        gain_category: z.ZodString;
        summary: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        normalized_gain: number;
        gain_category: string;
        summary?: string | undefined;
    }, {
        normalized_gain: number;
        gain_category: string;
        summary?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    turns: {
        turn: number;
        intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
        intervention_name: string;
        budget_allocated: number;
        area_converted_ha?: number | undefined;
        surface_temp_drop_celsius?: number | undefined;
        runoff_retained_m3?: number | undefined;
        esa_conversions?: Record<string, number> | undefined;
    }[];
    baseline: {
        built_up_pct: number;
        tree_cover_pct: number;
        grassland_pct: number;
        shrubland_pct: number;
        bare_soil_pct: number;
    };
    session_id?: string | undefined;
    final_metrics?: {
        total_budget_spent: number;
        remaining_budget: number;
        net_cooling_celsius: number;
        net_cooling_fahrenheit: number;
        net_stormwater_retained_m3: number;
        net_stormwater_retained_gallons: number;
        total_area_converted_ha: number;
        depaved_impervious_pct: number;
        overall_sustainability_score: number;
        community_cheer_score: number;
        ground_depaved_ha?: number | undefined;
        rooftop_treated_ha?: number | undefined;
    } | undefined;
    learning_gain?: {
        normalized_gain: number;
        gain_category: string;
        summary?: string | undefined;
    } | undefined;
}, {
    turns: {
        turn: number;
        intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
        intervention_name: string;
        budget_allocated: number;
        area_converted_ha?: number | undefined;
        surface_temp_drop_celsius?: number | undefined;
        runoff_retained_m3?: number | undefined;
        esa_conversions?: Record<string, number> | undefined;
    }[];
    session_id?: string | undefined;
    baseline?: {
        built_up_pct?: number | undefined;
        tree_cover_pct?: number | undefined;
        grassland_pct?: number | undefined;
        shrubland_pct?: number | undefined;
        bare_soil_pct?: number | undefined;
    } | undefined;
    final_metrics?: {
        total_budget_spent?: number | undefined;
        remaining_budget?: number | undefined;
        net_cooling_celsius?: number | undefined;
        net_cooling_fahrenheit?: number | undefined;
        net_stormwater_retained_m3?: number | undefined;
        net_stormwater_retained_gallons?: number | undefined;
        total_area_converted_ha?: number | undefined;
        ground_depaved_ha?: number | undefined;
        rooftop_treated_ha?: number | undefined;
        depaved_impervious_pct?: number | undefined;
        overall_sustainability_score?: number | undefined;
        community_cheer_score?: number | undefined;
    } | undefined;
    learning_gain?: {
        normalized_gain: number;
        gain_category: string;
        summary?: string | undefined;
    } | undefined;
}>;
export type SessionHistory = z.infer<typeof SessionHistorySchema>;
export declare const GenerateYouthResolutionInputSchema: z.ZodObject<{
    author_name: z.ZodString;
    district_name: z.ZodString;
    organization_or_school: z.ZodDefault<z.ZodString>;
    target_body: z.ZodDefault<z.ZodEnum<["City Council", "School Board", "Planning Commission", "County Board of Supervisors", "Parks & Recreation Commission"]>>;
    session_history: z.ZodObject<{
        session_id: z.ZodOptional<z.ZodString>;
        turns: z.ZodArray<z.ZodObject<{
            turn: z.ZodNumber;
            intervention_id: z.ZodEnum<["green_roofs", "pocket_parks", "urban_canopy_trees", "permeable_pavement", "bioswales", "cool_roofs"]>;
            intervention_name: z.ZodString;
            budget_allocated: z.ZodNumber;
            area_converted_ha: z.ZodOptional<z.ZodNumber>;
            surface_temp_drop_celsius: z.ZodOptional<z.ZodNumber>;
            runoff_retained_m3: z.ZodOptional<z.ZodNumber>;
            esa_conversions: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            turn: number;
            intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
            intervention_name: string;
            budget_allocated: number;
            area_converted_ha?: number | undefined;
            surface_temp_drop_celsius?: number | undefined;
            runoff_retained_m3?: number | undefined;
            esa_conversions?: Record<string, number> | undefined;
        }, {
            turn: number;
            intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
            intervention_name: string;
            budget_allocated: number;
            area_converted_ha?: number | undefined;
            surface_temp_drop_celsius?: number | undefined;
            runoff_retained_m3?: number | undefined;
            esa_conversions?: Record<string, number> | undefined;
        }>, "many">;
        baseline: z.ZodDefault<z.ZodObject<{
            built_up_pct: z.ZodDefault<z.ZodNumber>;
            tree_cover_pct: z.ZodDefault<z.ZodNumber>;
            grassland_pct: z.ZodDefault<z.ZodNumber>;
            shrubland_pct: z.ZodDefault<z.ZodNumber>;
            bare_soil_pct: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            built_up_pct: number;
            tree_cover_pct: number;
            grassland_pct: number;
            shrubland_pct: number;
            bare_soil_pct: number;
        }, {
            built_up_pct?: number | undefined;
            tree_cover_pct?: number | undefined;
            grassland_pct?: number | undefined;
            shrubland_pct?: number | undefined;
            bare_soil_pct?: number | undefined;
        }>>;
        final_metrics: z.ZodOptional<z.ZodObject<{
            total_budget_spent: z.ZodDefault<z.ZodNumber>;
            remaining_budget: z.ZodDefault<z.ZodNumber>;
            net_cooling_celsius: z.ZodDefault<z.ZodNumber>;
            net_cooling_fahrenheit: z.ZodDefault<z.ZodNumber>;
            net_stormwater_retained_m3: z.ZodDefault<z.ZodNumber>;
            net_stormwater_retained_gallons: z.ZodDefault<z.ZodNumber>;
            total_area_converted_ha: z.ZodDefault<z.ZodNumber>;
            ground_depaved_ha: z.ZodOptional<z.ZodNumber>;
            rooftop_treated_ha: z.ZodOptional<z.ZodNumber>;
            depaved_impervious_pct: z.ZodDefault<z.ZodNumber>;
            overall_sustainability_score: z.ZodDefault<z.ZodNumber>;
            community_cheer_score: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            total_budget_spent: number;
            remaining_budget: number;
            net_cooling_celsius: number;
            net_cooling_fahrenheit: number;
            net_stormwater_retained_m3: number;
            net_stormwater_retained_gallons: number;
            total_area_converted_ha: number;
            depaved_impervious_pct: number;
            overall_sustainability_score: number;
            community_cheer_score: number;
            ground_depaved_ha?: number | undefined;
            rooftop_treated_ha?: number | undefined;
        }, {
            total_budget_spent?: number | undefined;
            remaining_budget?: number | undefined;
            net_cooling_celsius?: number | undefined;
            net_cooling_fahrenheit?: number | undefined;
            net_stormwater_retained_m3?: number | undefined;
            net_stormwater_retained_gallons?: number | undefined;
            total_area_converted_ha?: number | undefined;
            ground_depaved_ha?: number | undefined;
            rooftop_treated_ha?: number | undefined;
            depaved_impervious_pct?: number | undefined;
            overall_sustainability_score?: number | undefined;
            community_cheer_score?: number | undefined;
        }>>;
        learning_gain: z.ZodOptional<z.ZodObject<{
            normalized_gain: z.ZodNumber;
            gain_category: z.ZodString;
            summary: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            normalized_gain: number;
            gain_category: string;
            summary?: string | undefined;
        }, {
            normalized_gain: number;
            gain_category: string;
            summary?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        turns: {
            turn: number;
            intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
            intervention_name: string;
            budget_allocated: number;
            area_converted_ha?: number | undefined;
            surface_temp_drop_celsius?: number | undefined;
            runoff_retained_m3?: number | undefined;
            esa_conversions?: Record<string, number> | undefined;
        }[];
        baseline: {
            built_up_pct: number;
            tree_cover_pct: number;
            grassland_pct: number;
            shrubland_pct: number;
            bare_soil_pct: number;
        };
        session_id?: string | undefined;
        final_metrics?: {
            total_budget_spent: number;
            remaining_budget: number;
            net_cooling_celsius: number;
            net_cooling_fahrenheit: number;
            net_stormwater_retained_m3: number;
            net_stormwater_retained_gallons: number;
            total_area_converted_ha: number;
            depaved_impervious_pct: number;
            overall_sustainability_score: number;
            community_cheer_score: number;
            ground_depaved_ha?: number | undefined;
            rooftop_treated_ha?: number | undefined;
        } | undefined;
        learning_gain?: {
            normalized_gain: number;
            gain_category: string;
            summary?: string | undefined;
        } | undefined;
    }, {
        turns: {
            turn: number;
            intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
            intervention_name: string;
            budget_allocated: number;
            area_converted_ha?: number | undefined;
            surface_temp_drop_celsius?: number | undefined;
            runoff_retained_m3?: number | undefined;
            esa_conversions?: Record<string, number> | undefined;
        }[];
        session_id?: string | undefined;
        baseline?: {
            built_up_pct?: number | undefined;
            tree_cover_pct?: number | undefined;
            grassland_pct?: number | undefined;
            shrubland_pct?: number | undefined;
            bare_soil_pct?: number | undefined;
        } | undefined;
        final_metrics?: {
            total_budget_spent?: number | undefined;
            remaining_budget?: number | undefined;
            net_cooling_celsius?: number | undefined;
            net_cooling_fahrenheit?: number | undefined;
            net_stormwater_retained_m3?: number | undefined;
            net_stormwater_retained_gallons?: number | undefined;
            total_area_converted_ha?: number | undefined;
            ground_depaved_ha?: number | undefined;
            rooftop_treated_ha?: number | undefined;
            depaved_impervious_pct?: number | undefined;
            overall_sustainability_score?: number | undefined;
            community_cheer_score?: number | undefined;
        } | undefined;
        learning_gain?: {
            normalized_gain: number;
            gain_category: string;
            summary?: string | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    author_name: string;
    district_name: string;
    organization_or_school: string;
    target_body: "City Council" | "School Board" | "Planning Commission" | "County Board of Supervisors" | "Parks & Recreation Commission";
    session_history: {
        turns: {
            turn: number;
            intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
            intervention_name: string;
            budget_allocated: number;
            area_converted_ha?: number | undefined;
            surface_temp_drop_celsius?: number | undefined;
            runoff_retained_m3?: number | undefined;
            esa_conversions?: Record<string, number> | undefined;
        }[];
        baseline: {
            built_up_pct: number;
            tree_cover_pct: number;
            grassland_pct: number;
            shrubland_pct: number;
            bare_soil_pct: number;
        };
        session_id?: string | undefined;
        final_metrics?: {
            total_budget_spent: number;
            remaining_budget: number;
            net_cooling_celsius: number;
            net_cooling_fahrenheit: number;
            net_stormwater_retained_m3: number;
            net_stormwater_retained_gallons: number;
            total_area_converted_ha: number;
            depaved_impervious_pct: number;
            overall_sustainability_score: number;
            community_cheer_score: number;
            ground_depaved_ha?: number | undefined;
            rooftop_treated_ha?: number | undefined;
        } | undefined;
        learning_gain?: {
            normalized_gain: number;
            gain_category: string;
            summary?: string | undefined;
        } | undefined;
    };
}, {
    author_name: string;
    district_name: string;
    session_history: {
        turns: {
            turn: number;
            intervention_id: "green_roofs" | "pocket_parks" | "urban_canopy_trees" | "permeable_pavement" | "bioswales" | "cool_roofs";
            intervention_name: string;
            budget_allocated: number;
            area_converted_ha?: number | undefined;
            surface_temp_drop_celsius?: number | undefined;
            runoff_retained_m3?: number | undefined;
            esa_conversions?: Record<string, number> | undefined;
        }[];
        session_id?: string | undefined;
        baseline?: {
            built_up_pct?: number | undefined;
            tree_cover_pct?: number | undefined;
            grassland_pct?: number | undefined;
            shrubland_pct?: number | undefined;
            bare_soil_pct?: number | undefined;
        } | undefined;
        final_metrics?: {
            total_budget_spent?: number | undefined;
            remaining_budget?: number | undefined;
            net_cooling_celsius?: number | undefined;
            net_cooling_fahrenheit?: number | undefined;
            net_stormwater_retained_m3?: number | undefined;
            net_stormwater_retained_gallons?: number | undefined;
            total_area_converted_ha?: number | undefined;
            ground_depaved_ha?: number | undefined;
            rooftop_treated_ha?: number | undefined;
            depaved_impervious_pct?: number | undefined;
            overall_sustainability_score?: number | undefined;
            community_cheer_score?: number | undefined;
        } | undefined;
        learning_gain?: {
            normalized_gain: number;
            gain_category: string;
            summary?: string | undefined;
        } | undefined;
    };
    organization_or_school?: string | undefined;
    target_body?: "City Council" | "School Board" | "Planning Commission" | "County Board of Supervisors" | "Parks & Recreation Commission" | undefined;
}>;
export type GenerateYouthResolutionInput = z.infer<typeof GenerateYouthResolutionInputSchema>;
export interface ActionableTalkingPoint {
    id: number;
    timeframe: string;
    topic_title: string;
    hook: string;
    evidence_citation: string;
    recommended_script: string;
    policy_demand: string;
}
export interface BiophysicalScorecard {
    total_heat_reduction_display: string;
    total_heat_reduction_c: number;
    total_heat_reduction_f: number;
    total_stormwater_retained_m3: number;
    total_stormwater_retained_gallons: number;
    total_depaved_ha: number;
    ground_depaved_ha: number;
    rooftop_treated_ha: number;
    total_trees_or_greenspace_pct_increase: number;
    un_sdg_15_3_1_avoided_degradation_score: string;
    budget_efficiency_rating: string;
}
export interface YouthResolutionDocument {
    resolution_number: string;
    title: string;
    author_name: string;
    organization_or_school: string;
    district_name: string;
    target_body: string;
    date_formatted: string;
    executive_summary: string;
    whereas_clauses: string[];
    resolved_clauses: string[];
    talking_points: ActionableTalkingPoint[];
    biophysical_scorecard: BiophysicalScorecard;
    sdg_alignment: {
        sdg_goal: string;
        target: string;
        indicator: string;
        framework: string;
        citation: string;
    };
    single_page_html: string;
    resolution_markdown: string;
}
