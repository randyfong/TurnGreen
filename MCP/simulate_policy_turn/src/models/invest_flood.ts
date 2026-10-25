import { ESA_WORLDCOVER_PROPERTIES } from "../constants/esa_worldcover.js";
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
  droughtPrecipitationMm?: number; // Default: 10 mm in dry season
  greenRetentionHectares?: number; // Total hectares with bioswales/permeable/parks
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
export function calculateInVESTFloodRisk(
  landCover: LandCoverDistribution,
  totalAreaHectares: number = 50,
  designStormDepthMm: number = 50,
  options?: FloodOptions
): FloodMetrics {
  let compositeCN = 0;

  for (const [key, pct] of Object.entries(landCover)) {
    const classKey = key as keyof LandCoverDistribution;
    const props = ESA_WORLDCOVER_PROPERTIES[classKey];
    if (props && pct > 0) {
      compositeCN += props.cn * (pct / 100);
    }
  }

  compositeCN = Math.min(100, Math.max(30, compositeCN));

  // In dry season, baked bare soil and degraded pavement surfaces become crusty/hydrophobic
  // slightly shifting effective CN upward if degraded bare soil/impervious dominates without green infrastructure
  let effectiveCN = compositeCN;
  if (options?.isDrySeason) {
    const degradedRatio = ((landCover.built_up_50 ?? 0) + (landCover.bare_soil_60 ?? 0)) / 100;
    const greenSpongeRatio = ((landCover.tree_cover_10 ?? 0) + (landCover.grassland_30 ?? 0) + (landCover.shrubland_20 ?? 0)) / 100;
    // Crusting penalty up to +2 CN when degraded > 70% without green infrastructure
    if (degradedRatio > 0.6 && greenSpongeRatio < 0.3) {
      effectiveCN = Math.min(99, effectiveCN + 1.8 * (degradedRatio - greenSpongeRatio));
    }
  }

  // Max retention capacity S (mm)
  const sMm = (25400 / effectiveCN) - 254;
  const initialAbstraction = 0.2 * sMm;

  let directRunoffMm = 0;
  if (designStormDepthMm > initialAbstraction) {
    const numerator = Math.pow(designStormDepthMm - initialAbstraction, 2);
    const denominator = designStormDepthMm + 0.8 * sMm;
    directRunoffMm = numerator / denominator;
  }

  const retainedMm = Math.max(0, designStormDepthMm - directRunoffMm);
  const totalAreaM2 = totalAreaHectares * 10000;
  const stormwaterRetainedM3 = (retainedMm / 1000) * totalAreaM2;
  const retentionEfficiencyPct = designStormDepthMm > 0 ? (retainedMm / designStormDepthMm) * 100 : 100;

  return {
    design_storm_depth_mm: designStormDepthMm,
    composite_curve_number: Number(effectiveCN.toFixed(1)),
    max_soil_retention_mm: Number(sMm.toFixed(2)),
    direct_runoff_mm: Number(directRunoffMm.toFixed(2)),
    retained_water_depth_mm: Number(retainedMm.toFixed(2)),
    stormwater_retained_m3: Number(stormwaterRetainedM3.toFixed(1)),
    retention_efficiency_pct: Number(retentionEfficiencyPct.toFixed(1))
  };
}

/**
 * Calculates flood and rainwater retention dynamics during the annual dry season:
 * Evaluates whether light precipitation (P = 10 mm) is fully absorbed by natural sponge soils or lost to surface runoff.
 */
export function calculateDrySeasonFloodRisk(
  landCover: LandCoverDistribution,
  totalAreaHectares: number = 50,
  droughtPrecipitationMm: number = 10
): DrySeasonFloodMetrics {
  const result = calculateInVESTFloodRisk(landCover, totalAreaHectares, droughtPrecipitationMm, {
    isDrySeason: true,
    droughtPrecipitationMm
  });

  const totalDroughtWaterVolumeM3 = (droughtPrecipitationMm / 1000) * (totalAreaHectares * 10000);
  const unretainedM3 = Math.max(0, totalDroughtWaterVolumeM3 - result.stormwater_retained_m3);
  const retentionPct = totalDroughtWaterVolumeM3 > 0
    ? Number(((result.stormwater_retained_m3 / totalDroughtWaterVolumeM3) * 100).toFixed(1))
    : 100;

  return {
    ...result,
    drought_retention_pct: retentionPct,
    unretained_drought_runoff_m3: Number(unretainedM3.toFixed(1)),
    green_infrastructure_sponge_deficit_m3: Number(unretainedM3.toFixed(1))
  };
}
