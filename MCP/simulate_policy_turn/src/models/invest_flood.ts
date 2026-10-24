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
export function calculateInVESTFloodRisk(
  landCover: LandCoverDistribution,
  totalAreaHectares: number = 50,
  designStormDepthMm: number = 50
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

  // Max retention capacity S (mm)
  const sMm = (25400 / compositeCN) - 254;
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
  const retentionEfficiencyPct = (retainedMm / designStormDepthMm) * 100;

  return {
    design_storm_depth_mm: designStormDepthMm,
    composite_curve_number: Number(compositeCN.toFixed(1)),
    max_soil_retention_mm: Number(sMm.toFixed(2)),
    direct_runoff_mm: Number(directRunoffMm.toFixed(2)),
    retained_water_depth_mm: Number(retainedMm.toFixed(2)),
    stormwater_retained_m3: Number(stormwaterRetainedM3.toFixed(1)),
    retention_efficiency_pct: Number(retentionEfficiencyPct.toFixed(1))
  };
}
