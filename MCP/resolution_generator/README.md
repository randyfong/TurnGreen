# TurnGreen Resolution Generator MCP Tool (`generate_youth_resolution`)

## Overview
The `generate_youth_resolution` tool is the civic translation engine of the **TurnGreen** platform. It accepts the player's 5-turn simulation history, target district name, and author details to produce a structured, 1-page policy mandate featuring three actionable civic talking points ready for city council or school board public comment.

All metrics are directly grounded in verified scientific frameworks:
* **Urban Cooling:** Stanford Natural Capital Project (InVEST Urban Cooling Model v3.14).
* **Stormwater Hydrology:** USDA Natural Resources Conservation Service (NEH-4 Curve Numbers).
* **Land Degradation Standards:** UN SDG Indicator 15.3.1 & UNCCD Trends.Earth Land Cover Transition Rules (ESA WorldCover 10m).

---

## Tool Specification

* **Name:** `generate_youth_resolution`
* **Transport:** Standard I/O (`stdio`) via `@modelcontextprotocol/sdk`
* **Zero External Auth / Cloud API Key Dependencies:** Runs locally and synchronously for hackathon reliability.

### Input Parameters
```json
{
  "author_name": "Maya Chen",
  "district_name": "District 7 - Southside Heat Basin",
  "organization_or_school": "Lincoln High Climate Action Club",
  "target_body": "City Council",
  "session_history": {
    "session_id": "session-1234",
    "turns": [
      {
        "turn": 1,
        "intervention_id": "urban_canopy_trees",
        "intervention_name": "Street Tree Canopy Planting",
        "budget_allocated": 40000,
        "area_converted_ha": 0.8,
        "surface_temp_drop_celsius": 0.35,
        "runoff_retained_m3": 320
      }
    ],
    "final_metrics": {
      "net_cooling_celsius": 1.55,
      "net_stormwater_retained_m3": 4900,
      "total_area_converted_ha": 3.1
    }
  }
}
```

### Outputs
* **`title` & `resolution_number`:** Formal municipal resolution numbering (e.g., `TG-2026-1086`).
* **`biophysical_scorecard`:** Heat reduction (°C/°F), stormwater volume retained (m³ and gallons), soil de-paved (hectares), and SDG 15.3.1 avoided land degradation alignment.
* **`talking_points`:** 3 distinct timed civic testimony talking points (`0:00 - 0:30`, `0:30 - 1:00`, `1:00 - 1:30`) with hooks, scientific citations, and clear policy demands.
* **`whereas_clauses` & `resolved_clauses`:** Formal legal resolution language ready for municipal submission.
* **`single_page_html`:** Print-ready HTML formatted with `@page { size: letter; margin: 0.38in; }` for seamless 1-page PDF export.
* **`resolution_markdown`:** Rich Markdown for modal dialog display and clipboard copying.

---

## Development & Testing

```bash
# Install dependencies
npm install

# Run automated tests
npm test

# Build production bundle
npm run build

# Start MCP server on stdio
npm start
```
