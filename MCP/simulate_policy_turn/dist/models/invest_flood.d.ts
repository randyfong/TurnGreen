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
/**
 * Stanford InVEST Urban Flood Risk Mitigation Model adapted:
 * Uses the USDA SCS-CN (Soil Conservation Service Curve Number) method.
 *
 * Design Storm Depth (P): Default 50 mm (standard 2-year 24-hr severe storm event)
 *
 * 1. Composite Curve Number (CN):
 *    CN = sum(CN_i * Area_fraction_i)
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
export declare function calculateInVESTFloodRisk(landCover: LandCoverDistribution, totalAreaHectares?: number, designStormDepthMm?: number): FloodMetrics;
