export const SDG_15_3_1_DATA = {
    goal: "SDG 15: Life on Land",
    target: "Target 15.3: By 2030, combat desertification, restore degraded land and soil, including land affected by desertification, drought and floods, and strive to achieve a land degradation-neutral world.",
    indicator: "Indicator 15.3.1: Proportion of land that is degraded over total land area",
    custodian_agency: "United Nations Convention to Combat Desertification (UNCCD) & UNSD",
    indicator_description: "Indicator 15.3.1 is defined as the amount of land that has suffered degradation over the total land area in a territorial unit. Under UNCCD Good Practice Guidance, land degradation is quantified using the 'One Out, All Out' (1OAO) principle across three fundamental sub-indicators.",
    methodological_source: "UNCCD Trends.Earth Monitoring Framework & UN Statistics Division Global Database API",
    sub_indicators: [
        {
            code: "Sub-Indicator 1: Land Cover and Land Cover Change",
            name: "Land Cover Transitions (ESA WorldCover / IPCC Categories)",
            description: "Measures transitions between 7 standardized land cover classes (Tree-covered, Grassland, Cropland, Wetland, Artificial/Built-up, Bare land, Water bodies). Artificial surface expansion over vegetated land is categorized as degradation.",
            trends_earth_rule: "Transitions from Built-up surfaces (Class 50) back to Vegetated/Tree Canopy (Class 10) or Grassland/Soil (Class 20/30) are evaluated as positive land restoration and avoided artificial land degradation under UNCCD matrix guidelines.",
            game_connection: "In TurnGreen, de-paving asphalt plazas or planting street tree corridors actively transitions grid cells out of Class 50, reversing localized urban land degradation."
        },
        {
            code: "Sub-Indicator 2: Land Productivity Dynamics (LPD)",
            name: "Biomass and Net Primary Productivity (NDVI / Phenology)",
            description: "Monitors the trajectory of photosynthetic biological productivity and standing vegetative biomass over time using satellite vegetation indices (e.g., MODIS, Sentinel-2 NDVI).",
            trends_earth_rule: "Replacing non-evaporative, zero-photosynthesis impervious asphalt with active living biomass (street trees, green roofs, pocket parks) shifts local productivity trajectory from 'Declining/Degraded' to 'Stable' or 'Increasing'.",
            game_connection: "Tree canopy expansion and bioswale installation introduce active photosynthesis and evapotranspiration into urban micro-corridors, registering productive vegetative growth."
        },
        {
            code: "Sub-Indicator 3: Soil Organic Carbon (SOC)",
            name: "Soil Organic Carbon Stocks and Permeability",
            description: "Assesses soil organic carbon storage in the top 30 cm of soil. Sealing soil beneath asphalt and concrete causes drastic loss of organic carbon and halts hydrological infiltration.",
            trends_earth_rule: "Unsealing urban soils through permeable pavement, bioswales, and soil aeration halts soil asphyxiation and re-establishes carbon cycling and organic sponge capacity.",
            game_connection: "Bioswales and permeable plazas re-open sealed ground, allowing infiltration and soil restoration recognized under international land neutrality criteria."
        }
    ]
};
