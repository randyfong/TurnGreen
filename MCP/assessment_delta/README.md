# Assessment Delta MCP Server (`record_assessment_score`)

This MCP server implements the **Assessment Delta Tool** specified in `PROJECT_SPEC.md` for **TurnGreen (Youth Climate Resilience Simulation & Civic Action Engine)**.

## Core Capabilities
1. **Turn 0 Pre-Simulation Baseline Recording**:
   - Collects 5-point Likert ratings on climate vulnerabilities (neighborhood tree canopy on flooding & asphalt pavement on heatwaves).
   - Stores baseline data anonymously in an isolated in-memory session store.
2. **Turn 5 Post-Simulation Evaluation**:
   - Collects identical post-simulation ratings.
   - Computes Hake's normalized cognitive gain ($g$):
     $$g = \frac{\text{Post} - \text{Pre}}{\text{Max Possible} - \text{Pre}}$$
   - Categorizes learning shifts (*High Gain*, *Medium Gain*, *Low Gain*, *Zero/Negative*).
   - Generates youth-friendly takeaways and an empirical statement tailored for the **Youth Community Planning Resolution**.
3. **FERPA / COPPA Student Privacy Compliance**:
   - Pure in-memory session isolation.
   - Strictly anonymous session IDs; zero personally identifiable student data (PII) is retained or transmitted to external endpoints.
   - Fully supports a stateless mode where clients pass `prior_assessment` directly.

## Installation & Running

```bash
cd MCP/assessment_delta
npm install
npm run build
npm test
```

## MCP Tool Definition

### `record_assessment_score`
- **Parameters**:
  - `session_id` (string): Anonymous session identifier.
  - `turn` (0 or 5): Pre-assessment (0) or Post-assessment (5).
  - `responses` (object):
    - `q1_canopy_flooding` (1–5 integer)
    - `q2_pavement_heat` (1–5 integer)
  - `prior_assessment` (optional object): Pass-through baseline for stateless evaluation.
