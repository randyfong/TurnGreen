# simulate_policy_turn MCP Tool

A Model Context Protocol (MCP) tool for **TurnGreen** that evaluates urban policy interventions across a 5-turn gameplay loop.

The tool bridges youth-friendly gameplay mechanics with equations adapted from:
- **Stanford InVEST Urban Cooling Model** ($HMI$, vegetative fraction, evapotranspiration, albedo $\rightarrow \Delta T$)
- **Stanford InVEST Urban Flood Risk Mitigation Model** (USDA SCS-CN Curve Number runoff retention)
- Grounded in **ESA WorldCover 10m** Land Cover Classification

---

## 🛠️ Tool Definition: `simulate_policy_turn`

This tool is **stateless**. The caller passes in the current turn, selected intervention, allocated budget, and current neighborhood land cover state. The tool responds with the updated state, youth-accessible scorecards, and a scientific payload.

### Inputs
* `turn` *(integer, 1–5)*: Turn sequence.
* `intervention_id` *(string)*: One of:
  - `green_roofs`: Living vegetative roof systems
  - `pocket_parks`: Small community parks replacing asphalt
  - `urban_canopy_trees`: Street tree canopy expansion
  - `permeable_pavement`: Porous asphalt and permeable pavers
  - `bioswales`: Vegetated stormwater runoff channels
  - `cool_roofs`: High-albedo reflective coatings
* `budget_allocated` *(number)*: Budget spent in USD.
* `current_state` *(object)*:
  - `total_area_hectares` *(number, default: 50)*
  - `remaining_budget` *(number, default: 200000)*
  - `land_cover` *(object)*: ESA WorldCover percentages (summing to 100):
    - `tree_cover_10`, `shrubland_20`, `grassland_30`, `cropland_40`, `built_up_50`, `bare_soil_60`, `water_80`

### Outputs
- `next_state`: Updated budget and new land cover distribution.
- `player_summary`: Kid-accessible analogies (e.g. Olympic swimming pools / bathtubs of water soaked up, cooling stars, neighborhood vibes).
- `player_metrics`: 0–100 scores for sustainability, cooling, flood resilience, and community cheer.
- `science_payload`: Detailed InVEST HMI values, SCS Curve Numbers, runoff depths ($mm$), total stormwater retained ($m^3$), and ESA shift matrices.

---

## 🚀 Running & Testing

### Install Dependencies
```bash
npm install
```

### Run Integration Test
```bash
npm run test
```

### Build for Production
```bash
npm run build
```

### Run MCP Server (Stdio)
```bash
npm start
```
