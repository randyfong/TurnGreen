import { executeSimulation } from "../MCP/simulate_policy_turn/src/index.js";
import { executeGetScienceExplanation, executeListTopics } from "../MCP/get_scientific_explaination/src/index.js";
import { executeRecordAssessment } from "../MCP/assessment_delta/src/index.js";

import { executeGenerateYouthResolution } from "../MCP/resolution_generator/src/index.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ToolRecord {
  kind: string;
  args: any;
  result: {
    isError?: boolean;
    content: Array<{ type: string; text: string }>;
  };
}

async function captureResponses() {
  console.log("=== Capturing live responses from all 4 TurnGreen MCP tools ===");
  const records: ToolRecord[] = [];

  // 1. Initial 5-turn simulation chain
  let currentState: any = {
    total_area_hectares: 50,
    remaining_budget: 500000,
    roof_treatment_hectares: 0,
    land_cover: {
      tree_cover_10: 10,
      shrubland_20: 0,
      grassland_30: 10,
      cropland_40: 0,
      built_up_50: 75,
      bare_soil_60: 5,
      water_80: 0
    }
  };

  const interventions: Array<{ id: string; budget: number }> = [
    { id: "urban_canopy_trees", budget: 100000 },
    { id: "bioswales", budget: 100000 },
    { id: "cool_roofs", budget: 100000 },
    { id: "permeable_pavement", budget: 100000 },
    { id: "urban_canopy_trees", budget: 100000 }
  ];

  const simulationTurns: any[] = [];

  for (let turn = 1; turn <= 5; turn++) {
    const { id, budget } = interventions[turn - 1];
    const args = {
      turn,
      intervention_id: id,
      budget_allocated: budget,
      current_state: currentState
    };

    try {
      const res = executeSimulation(args);
      records.push({
        kind: "simulation",
        args,
        result: {
          content: [{ type: "text", text: JSON.stringify(res, null, 2) }]
        }
      });
      currentState = res.next_state;
      simulationTurns.push({
        turn,
        intervention_id: id,
        intervention_name: res.intervention.name,
        budget_allocated: res.intervention.budget_allocated,
        area_converted_ha: res.intervention.area_converted_hectares,
        surface_temp_drop_celsius: res.science_payload.invest_urban_cooling.surface_temp_drop_celsius,
        runoff_retained_m3: res.science_payload.invest_urban_flood.stormwater_retained_m3
      });
    } catch (err: any) {
      records.push({
        kind: "simulation",
        args,
        result: {
          isError: true,
          content: [{ type: "text", text: err.message }]
        }
      });
    }
  }

  // 2. Science Tool: topics & explanation
  try {
    const topicsRes = executeListTopics();
    records.push({
      kind: "topics",
      args: {},
      result: {
        content: [{ type: "text", text: JSON.stringify(topicsRes, null, 2) }]
      }
    });
  } catch (err: any) {

    records.push({
      kind: "topics",
      args: {},
      result: { isError: true, content: [{ type: "text", text: err.message }] }
    });
  }

  try {
    const scienceRes = executeGetScienceExplanation({ topic_id: "urban_canopy_trees", audience: "all" });
    records.push({
      kind: "science",
      args: { topic_id: "urban_canopy_trees", audience: "all" },
      result: {
        content: [{ type: "text", text: JSON.stringify(scienceRes, null, 2) }]
      }
    });
  } catch (err: any) {
    records.push({
      kind: "science",
      args: { topic_id: "urban_canopy_trees", audience: "all" },
      result: { isError: true, content: [{ type: "text", text: err.message }] }
    });
  }

  // 3. Assessment: Turn 0 baseline & Turn 5 post-assessment
  const sessionId = "validation-session-2026";
  try {
    const baselineRes = executeRecordAssessment({
      session_id: sessionId,
      turn: 0,
      responses: { q1_canopy_flooding: 2, q2_pavement_heat: 2 }
    });
    records.push({
      kind: "assessment",
      args: { session_id: sessionId, turn: 0, responses: { q1_canopy_flooding: 2, q2_pavement_heat: 2 } },
      result: {
        content: [{ type: "text", text: JSON.stringify(baselineRes, null, 2) }]
      }
    });
  } catch (err: any) {
    records.push({
      kind: "assessment",
      args: { session_id: sessionId, turn: 0 },
      result: { isError: true, content: [{ type: "text", text: err.message }] }
    });
  }

  let postGain: any = null;
  try {
    const postRes = executeRecordAssessment({
      session_id: sessionId,
      turn: 5,
      prior_assessment: { q1_canopy_flooding: 2, q2_pavement_heat: 2 },
      responses: { q1_canopy_flooding: 4, q2_pavement_heat: 5 }
    });
    postGain = postRes.learning_gain;
    records.push({
      kind: "post",
      args: {
        session_id: sessionId,
        turn: 5,
        prior_assessment: { q1_canopy_flooding: 2, q2_pavement_heat: 2 },
        responses: { q1_canopy_flooding: 4, q2_pavement_heat: 5 }
      },
      result: {
        content: [{ type: "text", text: JSON.stringify(postRes, null, 2) }]
      }
    });
  } catch (err: any) {
    records.push({
      kind: "post",
      args: { session_id: sessionId, turn: 5 },
      result: { isError: true, content: [{ type: "text", text: err.message }] }
    });
  }

  // 4. Resolution Generator
  try {
    const resolutionRes = executeGenerateYouthResolution({
      author_name: "Maya Chen",
      district_name: "District 7 - Southside Heat Basin",
      organization_or_school: "Youth Climate Action Network",
      target_body: "City Council",
      session_history: {
        session_id: sessionId,
        turns: simulationTurns,
        learning_gain: postGain
          ? {
              normalized_gain: postGain.average_normalized_gain,
              gain_category: postGain.gain_category,
              summary: postGain.gain_explanation
            }
          : undefined
      }
    });
    records.push({
      kind: "resolution",
      args: { author_name: "Maya Chen", district_name: "District 7 - Southside Heat Basin" },
      result: {
        content: [{ type: "text", text: JSON.stringify(resolutionRes, null, 2) }]
      }
    });
  } catch (err: any) {
    records.push({
      kind: "resolution",
      args: {},
      result: { isError: true, content: [{ type: "text", text: err.message }] }
    });
  }

  // 5. Expected Error Envelopes
  // A. Invalid score (> 5)
  try {
    executeRecordAssessment({
      session_id: "error-sess",
      turn: 0,
      responses: { q1_canopy_flooding: 6, q2_pavement_heat: 2 } as any
    });
    records.push({ kind: "invalid-score", args: {}, result: { content: [{ type: "text", text: "UNEXPECTED_SUCCESS" }] } });
  } catch (err: any) {
    records.push({
      kind: "invalid-score",
      args: {},
      result: { isError: true, content: [{ type: "text", text: `Assessment error: ${err.message}` }] }
    });
  }

  // B. Unknown science topic
  try {
    executeGetScienceExplanation({ topic_id: "quantum_tunneling" });
    records.push({ kind: "unknown-topic", args: {}, result: { content: [{ type: "text", text: "UNEXPECTED_SUCCESS" }] } });
  } catch (err: any) {
    records.push({
      kind: "unknown-topic",
      args: {},
      result: { isError: true, content: [{ type: "text", text: `Science error: ${err.message}` }] }
    });
  }

  // C. Invalid simulation turn (> 5)
  try {
    executeSimulation({
      turn: 6,
      intervention_id: "urban_canopy_trees",
      budget_allocated: 50000,
      current_state: currentState
    } as any);
    records.push({ kind: "invalid-turn", args: {}, result: { content: [{ type: "text", text: "UNEXPECTED_SUCCESS" }] } });
  } catch (err: any) {
    records.push({
      kind: "invalid-turn",
      args: {},
      result: { isError: true, content: [{ type: "text", text: `Simulation error: ${err.message}` }] }
    });
  }

  // Output to turngreen-tool-responses.json
  const outputFile = path.join(__dirname, "turngreen-tool-responses.json");
  const payload = {
    captured_on: "2026-10-24",
    scope: "Live MCP calls; verified diagnostic response capture",
    records
  };

  fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2), "utf8");
  console.log(`✓ Saved ${records.length} tool records to ${outputFile}`);
}

captureResponses().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
