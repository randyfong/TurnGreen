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

## 🛠️ Tool Definition: `simulate_year_plan`

Simulates an entire year's climate action plan containing a list of multiple urban policy interventions in TurnGreen.

### Architectural Responsibilities & Statelessness
1. **Stateless Execution:** The simulation MCP server is completely stateless. It does not persist player sessions or database state. **Saving the completed year's state remains strictly the game backend's responsibility.**
2. **Dry-Season Mechanics:** The game backend is responsible for applying random game events (such as summer heat wave vegetation-loss events) to `current_state.land_cover` **prior** to calling the MCP tool. The simulation MCP's dry-season metrics describe modeled biophysical conditions under current land cover; they do not replace or trigger game events.
3. **Deterministic Execution Ordering:** Regardless of the order of projects in the input array, projects are deterministically executed according to canonical ecological staging:
   ```
   1. permeable_pavement  (de-paving / civil ground prep)
   2. bioswales           (stormwater drainage routing)
   3. pocket_parks        (surface vegetation & soil conversion)
   4. urban_canopy_trees  (tree canopy layer)
   5. green_roofs         (rooftop green infrastructure)
   6. cool_roofs          (high-albedo reflective coatings)
   ```
   Each project in `projects_executed` returns:
   - `original_index`: 0-based index of the project in the input array.
   - `executed_index`: 0-based index in the canonical execution order.

### Inputs
* `year` *(integer, optional, 1–5)*: Year or turn identifier.
* `annual_budget_limit` *(number, optional)*: Annual budget limit in dollars or coins (e.g., $1,000 = 100 coins).
* `max_annual_budget` *(number, optional)*: Alias for `annual_budget_limit` for backward compatibility.
* `projects` *(array of objects)*: List of projects to execute. Each project contains:
  - `intervention_id`: One of the 6 policy interventions.
  - `budget_allocated`: Strictly positive budget allocation.
  - `project_name` *(optional string)*: Custom project title.
* `current_state` *(object)*: Current neighborhood state, remaining budget, and land cover percentages.

### Pre-Flight Plan Validation & Structured Errors
The tool fails fast before any biophysical calculation or state mutation. If any project or budget limit is invalid, no partial result is returned. The tool responds with structured error details:
- `EMPTY_PLAN`: Projects list is empty.
- `INVALID_PROJECT`: Unknown or invalid intervention ID.
- `NON_POSITIVE_BUDGET`: Budget allocated is $\le 0$ or NaN.
- `DUPLICATE_PROJECT_TYPE`: Multiple projects with the same intervention type (policy: combine into a single project).
- `ANNUAL_BUDGET_EXCEEDED`: Total requested budget exceeds `annual_budget_limit`.
- `REMAINING_BUDGET_EXCEEDED`: Total requested budget exceeds `current_state.remaining_budget`.

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
