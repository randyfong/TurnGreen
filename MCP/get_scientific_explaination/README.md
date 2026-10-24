# TurnGreen Science Reference MCP Tool (`get_science_explanation`)

Authoritative scientific documentation and citations MCP server for **TurnGreen: Youth Climate Resilience Simulation**.

## Overview
Connects in-game actions, interventions, and metrics to verified international standards and peer-reviewed biophysical models:
* **UN Statistics Division (UNSD) SDG Global Database**: Target 15.3, Indicator 15.3.1 (*Proportion of land that is degraded over total land area*).
* **UNCCD Trends.Earth Registry**: Three sub-indicator rules:
  1. *Land Cover Transitions* (ESA WorldCover 10m baseline).
  2. *Land Productivity Dynamics* (Biomass & NDVI trajectory).
  3. *Soil Organic Carbon* (De-sealing urban soil).
* **Stanford Natural Capital Project InVEST Models**:
  * *Urban Cooling Model v3.14* ($HMI = 0.6 \cdot ET_r + 0.2 \cdot Albedo + 0.2 \cdot Shade$).
  * *Urban Flood Risk Mitigation Model* (USDA SCS-CN hydrology equations).

## Tools Provided

### 1. `get_science_explanation`
Accepts a topic or intervention identifier and returns formatted scientific explanations, equations, UN SDG alignment, and peer-reviewed citations ready for the HUD slide-out drawer.

#### Input Schema:
```json
{
  "topic_id": "sdg_15_3_1",
  "audience": "all" // "youth" | "technical" | "all"
}
```

#### Available Topics & Aliases:
- `sdg_15_3_1` (aliases: `sdg_15`, `trends_earth`, `ldn`, `land_degradation`)
- `invest_urban_cooling` (aliases: `cooling_model`, `heat_mitigation_index`, `hmi`, `evapotranspiration`)
- `invest_flood_risk` (aliases: `flood_model`, `scs_cn`, `curve_number`, `stormwater`)
- `esa_worldcover` (aliases: `land_cover`, `built_up`)
- `urban_canopy_trees` (aliases: `trees`, `canopy`)
- `permeable_pavement` (aliases: `depaving`, `permeable`)
- `bioswales` (aliases: `rain_gardens`)
- `green_roofs` (alias: `green_roof`)
- `cool_roofs` (alias: `cool_roof`)
- `pocket_parks` (alias: `parks`)

### 2. `list_science_topics`
Returns a catalog of all registered topics, their categories, titles, and citation counts.

## Development & Testing

```bash
# Install dependencies
npm install

# Run automated verification tests
npm test

# Build production bundle
npm run build

# Start stdio server
npm start
```
