/**
 * UN Sustainable Development Goal 15.3.1 and UNCCD Land Degradation Neutrality (LDN) Standards
 * Reference metadata and statutory framing for TurnGreen youth resolutions.
 */

export interface SDGTargetStandard {
  goal: string;
  target: string;
  indicator: string;
  custodian: string;
  trends_earth_metric: string;
  legal_precedent_framing: string;
  scientific_citation: string;
}

export const UN_SDG_15_3_1_STANDARD: SDGTargetStandard = {
  goal: "UN SDG 15: Life on Land",
  target: "Target 15.3: By 2030, combat desertification, restore degraded land and soil, and strive to achieve a land degradation-neutral world",
  indicator: "Indicator 15.3.1: Proportion of land that is degraded over total land area",
  custodian: "United Nations Convention to Combat Desertification (UNCCD)",
  trends_earth_metric: "Sub-Indicator 1: Land Cover and Land Cover Change (ESA WorldCover Transition Matrix)",
  legal_precedent_framing:
    "Transitioning impervious built-up infrastructure (ESA Class 50) into functional tree canopy (ESA Class 10) or vegetated permeable open space (ESA Class 20/30) constitutes avoided artificial land degradation and fulfills sub-national commitments to Land Degradation Neutrality (LDN).",
  scientific_citation:
    "UNCCD. (2021). Good Practice Guidance for SDG Indicator 15.3.1 (Version 2.0). United Nations Convention to Combat Desertification, Bonn, Germany."
};

export const INVEST_COOLING_STANDARD = {
  model: "Stanford Natural Capital Project (InVEST Urban Cooling Model v3.14)",
  citation: "Zawadzka, J. et al. (2021). Modeling urban heat mitigation using InVEST. Stanford University.",
  principle: "Evapotranspiration and shade-induced cooling decay over a 100m buffer zone."
};

export const INVEST_FLOOD_STANDARD = {
  model: "InVEST Urban Flood Risk Mitigation (USDA Natural Resources Conservation Service NEH-4)",
  citation: "USDA-NRCS. (2004). National Engineering Handbook, Part 630: Hydrology.",
  principle: "Runoff reduction governed by transition from impervious surfaces (CN 98) to vegetated soil (CN 68-74)."
};
