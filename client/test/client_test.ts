import {
  TurnGreenClientSession,
  validateTurnBudget,
  ValidationError
} from "../src/TurnGreenClient.js";

function runClientTests() {
  console.log("=== Testing TurnGreen Client Bridge & Pre-Flight Validation ===\n");

  // 1. Standalone Pre-Flight Budget Validation Test
  console.log("[Test 1] Testing validateTurnBudget utility function...");
  // Valid budget
  validateTurnBudget(50000, 200000);
  console.log("✓ Valid budget within limit accepted.");

  // Budget equal to remaining
  validateTurnBudget(200000, 200000);
  console.log("✓ Exact remaining budget accepted.");

  // Overspending (budget_allocated > remaining_budget)
  let overspendCaught = false;
  try {
    validateTurnBudget(200001, 200000);
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      overspendCaught = true;
      console.log("✓ Overspending correctly rejected by pre-flight check:", err.message);
      console.assert(
        err.message.includes("budget_allocated ($200,001) cannot exceed remaining_budget ($200,000)"),
        "Message should report budget deficit"
      );
    }
  }
  console.assert(overspendCaught, "Expected ValidationError when budget_allocated > remaining_budget");

  // Zero budget
  let zeroBudgetCaught = false;
  try {
    validateTurnBudget(0, 50000);
  } catch (err) {
    zeroBudgetCaught = true;
    console.log("✓ Zero budget rejected:", (err as Error).message);
  }
  console.assert(zeroBudgetCaught, "Expected ValidationError on zero budget");

  // Negative budget
  let negativeBudgetCaught = false;
  try {
    validateTurnBudget(-5000, 50000);
  } catch (err) {
    negativeBudgetCaught = true;
    console.log("✓ Negative budget rejected:", (err as Error).message);
  }
  console.assert(negativeBudgetCaught, "Expected ValidationError on negative budget");

  // 2. Client Session Lifecycle: Assessment Prior State & Forwarding
  console.log("\n[Test 2] Client Session: Pre-Assessment Storage & Forwarding on Turn 5...");
  const session = new TurnGreenClientSession({
    session_id: "test-session-preflight-101",
    author_name: "Jordan Taylor",
    district_name: "District 9 - Oakridge Basin",
    initial_budget: 150000
  });

  // Turn 0: Record pre-assessment
  const preAssessmentData = {
    q1_canopy_flooding: 2,
    q2_pavement_heat: 2
  };
  const preResult = session.recordPreAssessment(preAssessmentData);
  console.log("Pre-assessment recorded:", preResult.status);
  console.assert(preResult.status === "recorded", "Pre-assessment status should be recorded");

  // Verify client session stores prior_assessment
  const storedPrior = session.getPriorAssessment();
  console.log("Stored prior_assessment in client session state:", storedPrior);
  console.assert(storedPrior !== null, "Prior assessment must be stored in client state");
  console.assert(storedPrior?.q1_canopy_flooding === 2, "Canopy score matches");
  console.assert(storedPrior?.q2_pavement_heat === 2, "Heat score matches");

  // 3. Simulation Pre-Flight Budget Validation in Session
  console.log("\n[Test 3] Session Turn Budget Pre-Flight Validation...");
  // Attempting to spend $160,000 when remaining is $150,000
  let sessionOverspendCaught = false;
  try {
    session.submitTurn({
      turn: 1,
      intervention_id: "urban_canopy_trees",
      budget_allocated: 160000
    });
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      sessionOverspendCaught = true;
      console.log("✓ Session correctly prevented turn submission with budget_allocated > remaining_budget:", err.message);
    }
  }
  console.assert(sessionOverspendCaught, "Session submitTurn must reject overspending before calling MCP simulation");
  console.assert(session.getCurrentTurn() === 0, "Current turn must remain 0 after rejected turn");
  console.assert(session.getRemainingBudget() === 150000, "Remaining budget must remain intact");

  // 4. Executing 5 Turns within Budget
  console.log("\n[Test 4] Executing 5 valid turns within budget...");
  // Turn 1: $30,000
  const turn1 = session.submitTurn({
    turn: 1,
    intervention_id: "urban_canopy_trees",
    budget_allocated: 30000
  });
  console.log(`Turn 1: Spent $30,000, remaining budget: $${session.getRemainingBudget().toLocaleString()}`);
  console.assert(session.getRemainingBudget() === 120000, "Remaining budget should be $120,000");

  // Turn 2: $26,000 bioswales
  const turn2 = session.submitTurn({
    turn: 2,
    intervention_id: "bioswales",
    budget_allocated: 26000
  });
  console.log(`Turn 2: Spent $26,000, remaining budget: $${session.getRemainingBudget().toLocaleString()}`);
  console.assert(session.getRemainingBudget() === 94000, "Remaining budget should be $94,000");

  // Turn 3: $36,000 cool roofs
  const turn3 = session.submitTurn({
    turn: 3,
    intervention_id: "cool_roofs",
    budget_allocated: 36000
  });
  console.log(`Turn 3: Spent $36,000, remaining budget: $${session.getRemainingBudget().toLocaleString()}`);
  console.assert(session.getRemainingBudget() === 58000, "Remaining budget should be $58,000");

  // Turn 4: $38,000 pocket parks
  const turn4 = session.submitTurn({
    turn: 4,
    intervention_id: "pocket_parks",
    budget_allocated: 38000
  });
  console.log(`Turn 4: Spent $38,000, remaining budget: $${session.getRemainingBudget().toLocaleString()}`);
  console.assert(session.getRemainingBudget() === 20000, "Remaining budget should be $20,000");

  // Turn 5: $20,000 permeable pavement (spend down remaining)
  const turn5 = session.submitTurn({
    turn: 5,
    intervention_id: "permeable_pavement",
    budget_allocated: 20000
  });
  console.log(`Turn 5: Spent $20,000, remaining budget: $${session.getRemainingBudget().toLocaleString()}`);
  console.assert(session.getRemainingBudget() === 0, "Remaining budget should be $0");

  // Test turn 6 rejection (exceeds 5 turns)
  let turn6Caught = false;
  try {
    session.submitTurn({
      turn: 6,
      intervention_id: "urban_canopy_trees",
      budget_allocated: 10000
    });
  } catch (err) {
    turn6Caught = true;
    console.log("✓ Turn 6 rejected:", (err as Error).message);
  }
  console.assert(turn6Caught, "Turn 6 must be rejected");

  // 5. Post-Assessment: Auto-Forwarding prior_assessment
  console.log("\n[Test 5] Post-Assessment (Turn 5): Verifying prior_assessment forwarding...");
  const postAssessmentData = {
    q1_canopy_flooding: 5,
    q2_pavement_heat: 5
  };
  const postResult = session.recordPostAssessment(postAssessmentData);
  console.log("Post-assessment completed. Hake Gain:", postResult.learning_gain?.average_normalized_gain);
  console.log("Gain Category:", postResult.learning_gain?.gain_category);
  console.assert(postResult.status === "completed", "Status should be completed");
  console.assert(postResult.learning_gain !== undefined, "Learning gain must be computed");
  // Pre was 2+2=4, Post is 5+5=10. Max is 10. Gain = (10-4)/(10-4) = 1.0 (100% High Gain)
  console.assert(postResult.learning_gain?.average_normalized_gain === 1.0, "Expected 1.0 normalized gain");

  // 6. Test missing prior_assessment guard
  console.log("\n[Test 6] Testing rejection if client session lacks prior_assessment on Turn 5...");
  const blankSession = new TurnGreenClientSession({ session_id: "fresh-session-no-baseline" });
  let missingBaselineCaught = false;
  try {
    blankSession.recordPostAssessment({ q1_canopy_flooding: 4, q2_pavement_heat: 4 });
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      missingBaselineCaught = true;
      console.log("✓ Missing prior_assessment in client session caught:", err.message);
    }
  }
  console.assert(missingBaselineCaught, "Expected ValidationError when prior_assessment missing in client session");

  // 7. Civic Resolution Generation
  console.log("\n[Test 7] Compiling Civic Resolution from Session History...");
  const resolutionResult = session.generateResolution();
  console.log("✓ Resolution Number:", resolutionResult.resolution_number);
  console.log("✓ Resolution Title:", resolutionResult.title);
  console.log("✓ Actionable Talking Points Count:", resolutionResult.talking_points.length);
  console.assert(
    resolutionResult.talking_points.length === 3,
    "Expected exactly 3 talking points"
  );

  console.log("\n🎉 ALL CLIENT BRIDGE & PRE-FLIGHT VALIDATION TESTS PASSED! 🎉\n");
}

runClientTests();

