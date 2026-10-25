import { InterventionConfig, InterventionType, LandCoverDistribution } from "../types.js";
/**
 * Baseline parameters per ESA WorldCover Class:
 * - cn: USDA SCS Runoff Curve Number (Hydrologic Soil Group B/C urban default)
 * - albedo: Solar reflectance (0.0 to 1.0)
 * - et_coefficient (Kc / ET_I index): Evapotranspiration index contribution (0.0 to 1.0)
 * - vegetation_fraction (Fv): Fraction of living vegetative cover (0.0 to 1.0)
 */
export interface ESAClassProperties {
    name: string;
    cn: number;
    albedo: number;
    et_coefficient: number;
    vegetation_fraction: number;
}
export declare const ESA_WORLDCOVER_PROPERTIES: Record<keyof LandCoverDistribution, ESAClassProperties>;
/**
 * Standard Policies available in TurnGreen
 * unit_cost_usd_per_pct: Cost in USD to convert 1% of a standard 50-hectare neighborhood
 * cost_coins_per_pct: Cost in coins (from 100-coin total budget) to convert 1% of neighborhood area
 */
export declare const POLICY_INTERVENTIONS: Record<InterventionType, InterventionConfig>;
export declare const CANONICAL_PROJECT_EXECUTION_ORDER: Record<InterventionType, number>;
