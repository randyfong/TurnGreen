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

export const ESA_WORLDCOVER_PROPERTIES: Record<keyof LandCoverDistribution, ESAClassProperties> = {
  tree_cover_10: {
    name: "Tree Cover (Canopy)",
    cn: 55, // Forest / dense woods in fair-good condition
    albedo: 0.18,
    et_coefficient: 1.0,
    vegetation_fraction: 0.95
  },
  shrubland_20: {
    name: "Shrubland / Bushes",
    cn: 65,
    albedo: 0.20,
    et_coefficient: 0.75,
    vegetation_fraction: 0.80
  },
  grassland_30: {
    name: "Grassland / Lawn / Parks",
    cn: 68, // Open space in good condition
    albedo: 0.23,
    et_coefficient: 0.70,
    vegetation_fraction: 0.85
  },
  cropland_40: {
    name: "Urban Agriculture / Cropland",
    cn: 72,
    albedo: 0.20,
    et_coefficient: 0.65,
    vegetation_fraction: 0.75
  },
  built_up_50: {
    name: "Built-up (Impervious Asphalt & Roofs)",
    cn: 98, // Impervious surfaces, standard roofs & paved roads
    albedo: 0.12, // Dark asphalt & standard roofing
    et_coefficient: 0.05,
    vegetation_fraction: 0.02
  },
  bare_soil_60: {
    name: "Bare / Sparse Vegetation",
    cn: 82,
    albedo: 0.25,
    et_coefficient: 0.15,
    vegetation_fraction: 0.10
  },
  water_80: {
    name: "Water Bodies",
    cn: 100, // Direct precipitation
    albedo: 0.06,
    et_coefficient: 1.0,
    vegetation_fraction: 0.0
  }
};

/**
 * Standard Policies available in TurnGreen
 * unit_cost_usd_per_pct: Cost in USD to convert 1% of a standard 50-hectare neighborhood
 * cost_coins_per_pct: Cost in coins (from 100-coin total budget) to convert 1% of neighborhood area
 */
export const POLICY_INTERVENTIONS: Record<InterventionType, InterventionConfig> = {
  green_roofs: {
    id: "green_roofs",
    name: "Living Green Roofs",
    description: "Install extensive sedum and vegetative green roof systems on commercial and public buildings.",
    unit_cost_usd_per_pct: 12000,
    cost_coins_per_pct: 15, // 15 coins per 1%
    conversions: {
      built_up_50: -1.0,
      grassland_30: 1.0 // Green roofs behave similar to high-retention managed turf/grassland
    },
    albedo_boost: 0.05
  },
  pocket_parks: {
    id: "pocket_parks",
    name: "Neighborhood Pocket Parks",
    description: "Replace abandoned parking lots and corner asphalt plots with community pocket parks with trees and flowerbeds.",
    unit_cost_usd_per_pct: 9500,
    cost_coins_per_pct: 20, // 20 coins per 1%
    conversions: {
      built_up_50: -1.0,
      grassland_30: 0.5,
      tree_cover_10: 0.5
    }
  },
  urban_canopy_trees: {
    id: "urban_canopy_trees",
    name: "Street Tree Canopy Expansion",
    description: "Plant native shade trees along boulevards, sidewalks, and parking medians.",
    unit_cost_usd_per_pct: 7500,
    cost_coins_per_pct: 12, // 12 coins per 1%
    conversions: {
      built_up_50: -0.7,
      bare_soil_60: -0.3,
      tree_cover_10: 1.0
    }
  },
  permeable_pavement: {
    id: "permeable_pavement",
    name: "Permeable Pavement & Porous Asphalt",
    description: "Retrofit alleys, walkways, and parking surfaces with permeable pavers that let rainwater percolate.",
    unit_cost_usd_per_pct: 8000,
    cost_coins_per_pct: 10, // 10 coins per 1%
    conversions: {
      built_up_50: -1.0,
      shrubland_20: 0.3,
      bare_soil_60: 0.7 // Infiltration dynamics shift towards permeable soil
    },
    albedo_boost: 0.08
  },
  bioswales: {
    id: "bioswales",
    name: "Rain Gardens & Roadside Bioswales",
    description: "Construct vegetated channels designed to slow, clean, and absorb urban stormwater runoff.",
    unit_cost_usd_per_pct: 6500,
    cost_coins_per_pct: 10, // 10 coins per 1%
    conversions: {
      built_up_50: -0.8,
      bare_soil_60: -0.2,
      shrubland_20: 0.6,
      grassland_30: 0.4
    }
  },
  cool_roofs: {
    id: "cool_roofs",
    name: "Reflective Cool Roofs & White Pavement",
    description: "Coat dark roofs and pavements with high-albedo solar-reflective materials to deflect heat.",
    unit_cost_usd_per_pct: 4500,
    cost_coins_per_pct: 8, // 8 coins per 1%
    conversions: {
      // Keeps physical built-up footprint, but dramatically improves albedo
    },
    albedo_boost: 0.35
  }
};

export const CANONICAL_PROJECT_EXECUTION_ORDER: Record<InterventionType, number> = {
  permeable_pavement: 1, // de-paving / civil ground prep first
  bioswales: 2,          // stormwater drainage routing
  pocket_parks: 3,       // surface vegetation and soil conversion
  urban_canopy_trees: 4, // tree canopy layer
  green_roofs: 5,        // rooftop green infrastructure
  cool_roofs: 6          // rooftop high-albedo coatings
};

