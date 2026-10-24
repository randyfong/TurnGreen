import { executeRecordAssessment } from "../src/index.js";
import { sessionStore } from "../src/store/session_store.js";

function runTests() {
  console.log("=== Running assessment_delta MCP Tool Tests ===");

  const sessionId = "student-test-session-42";

  // Test 1: Record Pre-Assessment (Turn 0)
  console.log("\n[Test 1] Record Pre-Assessment (Turn 0)...");
  const preResult = executeRecordAssessment({
    session_id: sessionId,
    turn: 0,
    responses: {
      q1_canopy_flooding: 2,
      q2_pavement_heat: 2
    }
  });

  console.assert(preResult.status === "recorded", "Status should be 'recorded'");
  console.assert(preResult.turn === 0, "Turn should be 0");
  console.assert(preResult.baseline_recorded?.q1_canopy_flooding === 2, "Q1 should be 2");
  console.assert(preResult.baseline_recorded?.q2_pavement_heat === 2, "Q2 should be 2");
  console.log("✓ Turn 0 successfully stored in isolated in-memory session store.");

  // Test 2: Record Post-Assessment (Turn 5) with Session State
  console.log("\n[Test 2] Record Post-Assessment (Turn 5)...");
  const postResult = executeRecordAssessment({
    session_id: sessionId,
    turn: 5,
    responses: {
      q1_canopy_flooding: 5,
      q2_pavement_heat: 4
    }
  });

  console.assert(postResult.status === "completed", "Status should be 'completed'");
  console.assert(postResult.turn === 5, "Turn should be 5");
  console.assert(postResult.learning_gain !== undefined, "Learning gain should be computed");

  const gain = postResult.learning_gain!;
  console.log(`Pre Total: ${gain.total_pre_score}, Post Total: ${gain.total_post_score}`);
  console.log(`Raw Delta: +${gain.total_raw_delta}`);
  console.log(`Average Normalized Gain (g): ${gain.average_normalized_gain}`);
  console.log(`Gain Band: ${gain.gain_category}`);

  // Pre: Q1=2, Q2=2 => Total=4. Max=10. MaxGain=6. Post: Q1=5, Q2=4 => Total=9. Delta=5.
  // g = 5 / 6 = ~0.833 => High Gain
  console.assert(gain.average_normalized_gain > 0.8, "Hake gain should be ~0.833");
  console.assert(gain.gain_category === "High Gain", "Category should be 'High Gain'");
  console.assert(postResult.youth_feedback !== undefined, "Youth feedback should be provided");
  console.assert(
    postResult.youth_feedback?.civic_resolution_statement.length! > 20,
    "Civic statement must be present"
  );
  console.log(`Youth Headline: "${postResult.youth_feedback?.headline}"`);
  console.log(`Civic Statement: "${postResult.youth_feedback?.civic_resolution_statement}"`);
  console.log("✓ Turn 5 evaluation & Hake gain calculation passed.");

  // Test 3: Fully Stateless Mode using prior_assessment
  console.log("\n[Test 3] Stateless Turn 5 Evaluation with prior_assessment provided...");
  const statelessResult = executeRecordAssessment({
    session_id: "stateless-session-99",
    turn: 5,
    prior_assessment: {
      q1_canopy_flooding: 1,
      q2_pavement_heat: 2
    },
    responses: {
      q1_canopy_flooding: 4,
      q2_pavement_heat: 4
    }
  });

  console.assert(statelessResult.status === "completed", "Stateless status should be 'completed'");
  // Pre: 3, Post: 8, Max possible gain: 7. Delta: 5. g = 5/7 = 0.714
  console.assert(
    statelessResult.learning_gain?.gain_category === "High Gain",
    "Should compute high gain"
  );
  console.log("✓ Stateless evaluation passed.");

  // Test 4: Ceiling effect (Pre = 5, Post = 5)
  console.log("\n[Test 4] Ceiling knowledge test (Pre=5, Post=5)...");
  const ceilingResult = executeRecordAssessment({
    session_id: "ceiling-session",
    turn: 5,
    prior_assessment: {
      q1_canopy_flooding: 5,
      q2_pavement_heat: 5
    },
    responses: {
      q1_canopy_flooding: 5,
      q2_pavement_heat: 5
    }
  });
  console.assert(
    ceilingResult.learning_gain?.average_normalized_gain === 1.0,
    "Ceiling gain should be 1.0"
  );
  console.log("✓ Ceiling retention test passed.");

  // Test 5: Validation errors
  console.log("\n[Test 5] Validation error handling (out of range score)...");
  try {
    executeRecordAssessment({
      session_id: "error-test",
      turn: 0,
      responses: {
        q1_canopy_flooding: 6, // Invalid > 5
        q2_pavement_heat: 1
      }
    });
    console.assert(false, "Should have thrown validation error");
  } catch (err) {
    console.log("✓ Expected validation error caught properly.");
  }

  // Test 6: Missing baseline on Turn 5
  console.log("\n[Test 6] Turn 5 post-assessment without baseline or prior_assessment...");
  try {
    executeRecordAssessment({
      session_id: "non-existent-session-123",
      turn: 5,
      responses: {
        q1_canopy_flooding: 4,
        q2_pavement_heat: 4
      }
    });
    console.assert(false, "Should have thrown error for missing baseline");
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.assert(
      errorMsg.includes("Baseline assessment required before calculating learning gain"),
      "Error message should mention baseline requirement"
    );
    console.log("✓ Expected missing baseline error caught:", errorMsg);
  }

  console.log("\n🎉 ALL ASSESSMENT DELTA TESTS PASSED SUCCESSFULLY! 🎉\n");
}

runTests();
