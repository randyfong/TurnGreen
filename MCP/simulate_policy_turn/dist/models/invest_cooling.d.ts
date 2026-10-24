import { LandCoverDistribution } from "../types.js";
export interface CoolingMetrics {
    effective_albedo: number;
    vegetation_fraction: number;
    et_index: number;
    heat_mitigation_index: number;
    surface_temperature_drop_c: number;
    surface_temperature_drop_f: number;
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
 * Temperature Relief (Delta T):
 *   In Stanford InVEST, air temperature reduction is modeled as:
 *   Delta T = (T_max - T_ref) * (1 - HMI) or cooling delta = HMI * T_mitigation_potential
 *   In warm summer conditions (e.g. 35°C urban baseline), high HMI can reduce microclimate
 *   temperatures by up to 3.5°C (6.3°F).
 */
export declare function calculateInVESTCooling(landCover: LandCoverDistribution, additionalAlbedoBoost?: number): CoolingMetrics;
