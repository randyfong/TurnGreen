import { LandCoverDistribution } from "../types.js";
export interface FloodMetrics {
    design_storm_depth_mm: number;
    composite_curve_number: number;
    max_soil_retention_mm: number;
    direct_runoff_mm: number;
    retained_water_depth_mm: number;
    stormwater_retained_m3: number;
    retention_efficiency_pct: number;
}
export interface FloodOptions {
    isDrySeason?: boolean;
    droughtPrecipitationMm?: number;
    greenRetentionHectares?: number;
}
export interface DrySeasonFloodMetrics extends FloodMetrics {
    drought_retention_pct: number;
    unretained_drought_runoff_m3: number;
    green_infrastructure_sponge_deficit_m3: number;
}
/**
 * Stanford InVEST Urban Flood Risk Mitigation Model adapted:
 * Uses the USDA SCS-CN (Soil Conservation Service Curve Number) method.
 *
 * Design Storm Depth (P): Default 50 mm (standard 2-year 24-hr severe storm event)
 * Dry Season Storm Depth (P_dry): Default 10 mm (low-precipitation drought shower)
 *
 * 1. Composite Curve Number (CN):
 *    CN = sum(CN_i * Area_fraction_i)
 *    Under dry season conditions without green infrastructure sponge soils, dry crusted ground
 *    and hydrophobic soil surfaces experience reduced initial abstraction capacity (Ia),
 *    while bioswales, pocket parks, and permeable pavement retain up to 100% of light 10mm precipitation.
 *
 * 2. Potential Maximum Soil Water Retention (S in mm):
 *    S = (25400 / CN) - 254
 *
 * 3. Initial Abstraction (Ia in mm):
 *    Ia = 0.2 * S (water absorbed by surface depressions, intercepted by vegetation)
 *
 * 4. Direct Runoff Depth (Q in mm):
 *    If P <= Ia -> Q = 0
 *    If P > Ia  -> Q = (P - 0.2*S)^2 / (P + 0.8*S)
 *
 * 5. Retained Stormwater:
 *    Retained Depth = P - Q
 *    Volume (m3) = (Retained Depth / 1000 m) * Total Area (m2)
 *    1 hectare = 10,000 m2
 */
export declare function calculateInVESTFloodRisk(landCover: LandCoverDistribution, totalAreaHectares?: number, designStormDepthMm?: number, options?: FloodOptions): FloodMetrics;
/**
 * Calculates flood and rainwater retention dynamics during the annual dry season:
 * Evaluates whether light precipitation (P = 10 mm) is fully absorbed by natural sponge soils or lost to surface runoff.
 */
export declare function calculateDrySeasonFloodRisk(landCover: LandCoverDistribution, totalAreaHectares?: number, droughtPrecipitationMm?: number): DrySeasonFloodMetrics;
