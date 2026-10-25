import { LandCoverDistribution } from "../types.js";
export interface CoolingMetrics {
    effective_albedo: number;
    vegetation_fraction: number;
    et_index: number;
    heat_mitigation_index: number;
    surface_temperature_drop_c: number;
    surface_temperature_drop_f: number;
}
export interface CoolingOptions {
    additionalAlbedoBoost?: number;
    isDrySeason?: boolean;
    droughtStressFactor?: number;
}
export interface DrySeasonCoolingMetrics extends CoolingMetrics {
    drought_stress_factor: number;
    shallow_veg_et_attenuation: number;
    canopy_et_retention_ratio: number;
    et_loss_pct: number;
}
/**
 * Stanford InVEST Urban Cooling Model equations adapted for policy simulation:
 *
 * 1. Area-weighted Albedo (A): Reflectance of surfaces (0 to 1).
 * 2. Area-weighted Vegetation Fraction (Fv): Fraction covered by living plants/canopy.
 * 3. Area-weighted Evapotranspiration Index (ET_I): Cooling capacity through moisture release.
 *
 * Heat Mitigation Index (HMI):
 *   HMI = 0.6 * Fv + 0.2 * ET_I + 0.2 * A
 *
 * In dry seasons:
 *   - Soil moisture deficits attenuate ET capacity, especially in shallow-root vegetation (grassland, cropland, shrubs).
 *   - Deep-root canopy trees (tree_cover_10) exhibit high drought resilience and retain transpiration via deep groundwater access.
 *   - Shallow vegetation without water retention infrastructure experiences substantial ET attenuation.
 */
export declare function calculateInVESTCooling(landCover: LandCoverDistribution, additionalAlbedoBoost?: number, options?: CoolingOptions): CoolingMetrics;
/**
 * Calculates cooling metrics under severe annual dry season stress:
 * Demonstrates the comparative cooling stability of deep-root canopy trees vs shallow turf.
 */
export declare function calculateDrySeasonCooling(landCover: LandCoverDistribution, additionalAlbedoBoost?: number, droughtStressFactor?: number): DrySeasonCoolingMetrics;
