# PROJECT_SPEC.md: Youth Climate Resilience Simulation & Civic Action Engine

## 1. Project Overview & Core Mission
A lightweight, web-based micro-simulation game designed for young adults (ages 15–24) to solve urban climate vulnerabilities over a 5-turn planning horizon. The application combines verifiable geospatial science with intuitive, non-technical player feedback, ending in a concrete civic advocacy document ready for local public comment.

---

## 2. Strict Hackathon Constraints & Guardrails
* **Development Timeline:** Rapid delivery (<48-hour build) prioritizing low architectural complexity.
* **No Heavy 3D Engines:** Strictly avoid Unity WebGL, Unreal Engine, or heavy three-dimensional asset pipelines. The frontend must be a fast-loading 2D Single Page Application (SPA).
* **Zero Spatial Jargon on the HUD:** Never expose raw GIS terms on the primary interface.
  * Instead of *Impervious Surface Ratio (ISR)*, display **"Summer Neighborhood Temperature"** and **"Flood Risk on Heavy Rain Days"**.
* **Zero-Auth Pre-Baked Data:** Do not require end-user API signups or live authentication to external cloud GIS platforms. All spatial baselines and coefficient matrices run locally.
* **Evidence Traceability:** Every metric change must tie directly to verified scientific models via an on-demand slide-out drawer.
* **Civic Call-to-Action:** The final session output must produce a downloadable 1-page Youth Community Planning Resolution.
* **Measurable Learning Gains:** Pre- and post-simulation micro-assessments must quantify user knowledge shift without manual grading.

---

## 3. System Architecture & Responsibilities

### A. MCP Server Layer (FastMCP via Standard I/O)
The MCP server acts as the game's biophysical calculation engine, evidence library, evaluation recorder, and civic document compiler. It exposes four specific tools:
1. **Turn Simulation Tool (`simulate_policy_turn`)**:
   * Accepts current turn number (1 to 5), selected policy intervention, and allocated budget.
   * Calculates shifts in neighborhood temperature and stormwater retention based on land cover conversions.
   * Returns abstracted player-facing metrics alongside scientific metadata.
2. **Science Reference Tool (`get_science_explanation`)**:
   * Accepts a topic identifier.
   * Returns authoritative documentation and citations for the in-game drawer.
3. **Assessment Delta Tool (`record_assessment_score`)**:
   * Accepts player rating scores for pre-simulation (Turn 0) and post-simulation (Turn 5).
   * Calculates normalized cognitive learning gains between turns.
4. **Resolution Generator Tool (`generate_youth_resolution`)**:
   * Accepts the player's session history, district name, and author name.
   * Outputs a structured 1-page policy mandate featuring three actionable talking points.

### B. Frontend SPA Layer
* Built using a modern component framework and responsive styling.
* Houses an interactive 2D grid representing neighborhood land use parcels.
* Contains a reactive Heads-Up Display (HUD) showing accessible environmental metrics and remaining budget.
* Provides a slide-out "Science Behind This" drawer triggered by metric tooltips.
* Renders pre- and post-assessment modal dialogues and handles one-click PDF printing for the final resolution.

---

## 4. Scientific Grounding & Platform Mapping

| Component | Backing Platform / Framework | Concrete Implementation Rule |
| :--- | :--- | :--- |
| **Land Cover Baseline** | **ESA WorldCover (10m Resolution)** | Map the grid using standardized classes: Class 50 (*Built-up*), Class 10 (*Tree cover*), and Class 20 (*Grassland*). Interventions visually and mathematically transition Class 50 into Class 10 or 20. |
| **Urban Cooling** | **Stanford Natural Capital Project (InVEST Urban Cooling Model)** | Model cooling using canopy shade and evapotranspiration decay principles, linking budget spent to incremental heat reduction in Celsius. |
| **Urban Hydrology** | **InVEST Flood Risk Mitigation (USDA-SCS Curve Numbers)** | Calculate surface runoff reduction by transitioning impervious surfaces (Curve Number ~98) to natural or permeable ground (Curve Number ~70). |
| **Land Degradation Standards** | **UNCCD Trends.Earth & UN SDG Indicator 15.3.1** | Frame canopy expansion and soil de-paving as avoided artificial land degradation under international reporting rules. |

---

## 5. End-to-End User Experience & Flow

### Turn 0: Baseline & Pre-Assessment
* The player selects a target neighborhood profile (e.g., high density, low current canopy).
* A prompt displays two 5-point Likert slider questions:
  1. *How much impact does neighborhood tree canopy have on local street flooding?*
  2. *How much impact does asphalt pavement have on neighborhood heatwaves?*
* The MCP server stores these baseline ratings under the player's session ID.

### Turns 1 through 5: Strategic Planning Loop
* The player is provided with a fixed 5-year budget pool.
* Each turn, the player chooses from distinct natural infrastructure policies:
  * **Urban Canopy Expansion** (street tree planting, park shade).
  * **Permeable Public Plazas** (de-paving asphalt, bioswale installation).
  * **Cool Surface & Green Roof Retrofits**.
* The player allocates funds and applies the policy to grid zones.
* The MCP engine updates:
  * **Summer Neighborhood Temperature:** Visualized as degrees cooled (e.g., `-1.2°C during heatwaves`).
  * **Heavy Rain Flood Risk:** Visualized as percent reduction in street water depth.
  * **Neighborhood Happiness Score:** Reflecting community approval.
  * **Remaining Budget**.
* Clicking any metric expands the **"Science Behind This"** drawer to reveal the exact InVEST model coefficients and ESA WorldCover conversions behind the shift.

### Turn 5 Conclusion: Post-Assessment & Civic Translation
* The player retakes the identical 2-question micro-assessment.
* The MCP server computes normalized learning deltas and confirms completion.
* The application unlocks the **Youth Community Planning Resolution**:
  * Displays an executive summary of the player's 5-year policy tradeoffs.
  * Surfaces three actionable talking points tailored for school boards or city council open comment sessions.
  * Provides a direct single-page printable/PDF export.

---

## 6. Antigravity Prompting Instructions
When directing Antigravity to build this application:
1. **Instruct the agent to set up the MCP server first** using the local managed environment, confirming that all four tools return valid structured responses.
2. **Instruct the agent to scaffold the frontend interface second**, wiring the UI buttons to the MCP tools without adding complex multiplayer or 3D graphics libraries.
3. **Verify the evaluation flow third**, confirming that pre/post deltas are recorded accurately and the PDF resolution formats neatly onto a single page.

# Platform-to-Tool Mapping

| Tool Name | Platform / Source Accessed | Access Method & Endpoint | Core Data Retrieved / Used |
| :--- | :--- | :--- | :--- |
| `simulate_policy_turn` | ESA WorldCover & Natural Capital InVEST | STAC API via `planetary-computer` / AWS Open Data S3 bucket + InVEST Python SDK (`natcap.invest`) | Fetches 10 m baseline tiles (Class 50: Built-up, Class 10: Trees, Class 20: Grass) and runs the InVEST Urban Cooling / Runoff Retention equations. |
| `get_science_explanation` | Natural Capital Project Docs & UNCCD SDG Repository | Cached static metadata schema / UN SDG Open API | Standard coefficient tables, evapotranspiration indices ($ET_r$), Curve Numbers ($CN$), and official SDG 15.3.1 sub-indicator metadata. |
| `generate_youth_resolution` | UNCCD Land Degradation Neutrality (LDN) Platform & Local Municipal Open Data | UNCCD Good Practice Guidance DB + Local City Council Agenda API (e.g., Legistar / Socrata) | Real-world policy alignment text, target-setting metrics for SDG 15.3.1, and localized civic talking points. |
| `record_assessment_score` | Internal Evaluation Store / SQLite | Local state storage (or optional LRS via xAPI) | Pre/post Likert responses and cognitive delta calculations (isolated from public platforms for student privacy). |