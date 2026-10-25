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
 * In dry seasons:
 *   - Soil moisture deficits attenuate ET capacity, especially in shallow-root vegetation (grassland, cropland, shrubs).
 *   - Deep-root canopy trees (tree_cover_10) exhibit high drought resilience and retain transpiration via deep groundwater access.
 *   - Shallow vegetation without water retention infrastructure experiences substantial ET attenuation.
 */
export function calculateInVESTCooling(landCover, additionalAlbedoBoost = 0, options) {
    let weightedAlbedo = 0;
    let weightedVegetation = 0;
    let weightedET = 0;
    let totalPct = 0;
    const isDrySeason = options?.isDrySeason ?? false;
    const droughtFactor = isDrySeason ? (options?.droughtStressFactor ?? 0.5) : 0;
    for (const [key, pct] of Object.entries(landCover)) {
        const classKey = key;
        const props = ESA_WORLDCOVER_PROPERTIES[classKey];
        if (props && pct > 0) {
            const weight = pct / 100;
            weightedAlbedo += props.albedo * weight;
            // In dry season, living vegetation fraction suffers minor browning on shallow turf
            let vegFraction = props.vegetation_fraction;
            let etCoeff = props.et_coefficient;
            if (isDrySeason) {
                if (classKey === "tree_cover_10") {
                    // Deep-root trees retain 85-95% ET resilience
                    etCoeff = props.et_coefficient * (1 - droughtFactor * 0.15);
                }
                else if (classKey === "grassland_30" || classKey === "cropland_40") {
                    // Shallow grasses & crops suffer up to 50-60% ET loss under moisture deficit
                    etCoeff = props.et_coefficient * (1 - droughtFactor * 0.55);
                    vegFraction = Math.max(0.1, props.vegetation_fraction * (1 - droughtFactor * 0.25));
                }
                else if (classKey === "shrubland_20") {
                    // Moderate root shrubs retain intermediate resilience
                    etCoeff = props.et_coefficient * (1 - droughtFactor * 0.35);
                }
                else if (classKey === "water_80") {
                    // Evaporation from water bodies remains high in dry heat
                    etCoeff = props.et_coefficient;
                }
            }
            weightedVegetation += vegFraction * weight;
            weightedET += etCoeff * weight;
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
/**
 * Calculates cooling metrics under severe annual dry season stress:
 * Demonstrates the comparative cooling stability of deep-root canopy trees vs shallow turf.
 */
export function calculateDrySeasonCooling(landCover, additionalAlbedoBoost = 0, droughtStressFactor = 0.5) {
    const normal = calculateInVESTCooling(landCover, additionalAlbedoBoost, { isDrySeason: false });
    const dry = calculateInVESTCooling(landCover, additionalAlbedoBoost, {
        isDrySeason: true,
        droughtStressFactor
    });
    const etLossPct = normal.et_index > 0
        ? Number((((normal.et_index - dry.et_index) / normal.et_index) * 100).toFixed(1))
        : 0;
    // Canopy ET retention ratio: deep root tree fraction relative to shallow grass/shrub
    const treeWeight = (landCover.tree_cover_10 ?? 0) / 100;
    const shallowWeight = ((landCover.grassland_30 ?? 0) + (landCover.cropland_40 ?? 0)) / 100;
    const canopyRetentionRatio = Number(((treeWeight * 0.9 + 0.1) / (shallowWeight * 0.5 + treeWeight * 0.9 + 0.1)).toFixed(2));
    return {
        ...dry,
        drought_stress_factor: droughtStressFactor,
        shallow_veg_et_attenuation: Number((droughtStressFactor * 0.55).toFixed(2)),
        canopy_et_retention_ratio: canopyRetentionRatio,
        et_loss_pct: etLossPct
    };
}
