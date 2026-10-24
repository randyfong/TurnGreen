import { ESA_WORLDCOVER_PROPERTIES } from "../constants/esa_worldcover.js";
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
export function calculateInVESTCooling(landCover, additionalAlbedoBoost = 0) {
    let weightedAlbedo = 0;
    let weightedVegetation = 0;
    let weightedET = 0;
    let totalPct = 0;
    for (const [key, pct] of Object.entries(landCover)) {
        const classKey = key;
        const props = ESA_WORLDCOVER_PROPERTIES[classKey];
        if (props && pct > 0) {
            const weight = pct / 100;
            weightedAlbedo += props.albedo * weight;
            weightedVegetation += props.vegetation_fraction * weight;
            weightedET += props.et_coefficient * weight;
            totalPct += pct;
        }
    }
    // Factor in reflective surface coatings if applied
    weightedAlbedo = Math.min(1.0, weightedAlbedo + additionalAlbedoBoost);
    // InVEST Heat Mitigation Index formula
    const hmi = Number((0.6 * weightedVegetation + 0.2 * weightedET + 0.2 * weightedAlbedo).toFixed(4));
    // Max cooling potential in urban heat island context (~3.8°C drop maximum for pure greenery)
    const maxCoolingPotentialC = 3.8;
    const tempDropC = Number((hmi * maxCoolingPotentialC).toFixed(2));
    const tempDropF = Number((tempDropC * 1.8).toFixed(2));
    return {
        effective_albedo: Number(weightedAlbedo.toFixed(3)),
        vegetation_fraction: Number(weightedVegetation.toFixed(3)),
        et_index: Number(weightedET.toFixed(3)),
        heat_mitigation_index: hmi,
        surface_temperature_drop_c: tempDropC,
        surface_temperature_drop_f: tempDropF
    };
}
