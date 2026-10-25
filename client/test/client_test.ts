import {
  TurnGreenClientSession,
  validateTurnBudget,
  ValidationError,
  parseMCPResponse,
  MCPResponseError
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

  // 8. Explicit MCP Response Contract Handling (isError check before parsing content[0].text as JSON)
  console.log("\n[Test 8] MCP Response Contract Handling: isError check before parsing JSON...");


  // Case A: Valid MCP response parsing JSON content
  const validMCPResponse = {
    content: [
      {
        type: "text",
        text: JSON.stringify({ status: "ok", test_metric: 42 })
      }
    ]
  };
  const parsedValid = parseMCPResponse<{ status: string; test_metric: number }>(validMCPResponse);
  console.log("✓ Successfully parsed valid MCP JSON response:", parsedValid);
  console.assert(parsedValid.status === "ok" && parsedValid.test_metric === 42, "Parsed payload matches");

  // Case B: isError is true with plain text content that is NOT valid JSON
  const errorMCPResponse = {
    isError: true,
    content: [
      {
        type: "text",
        text: "Simulation error: Requested budget ($600,000) exceeds maximum allowable limit"
      }
    ]
  };

  let errorCaught = false;
  try {
    // Should NOT throw SyntaxError from JSON.parse; should throw MCPResponseError because isError is checked first!
    parseMCPResponse(errorMCPResponse);
  } catch (err: unknown) {
    if (err instanceof MCPResponseError) {
      errorCaught = true;
      console.log("✓ isError correctly intercepted before JSON parsing:", err.message);
      console.assert(
        err.message.includes("Simulation error: Requested budget ($600,000)"),
        "Error message should preserve tool plain text error"
      );
      console.assert(err.response.isError === true, "Response object preserved on error");
    }
  }
  console.assert(errorCaught, "Expected MCPResponseError to be thrown without JSON parsing crash");

  // Case C: Malformed JSON on a non-error response
  console.log("\n[Test 9] MCP Response Contract: Malformed JSON on non-error response...");
  const malformedMCPResponse = {
    content: [
      {
        type: "text",
        text: "NOT_VALID_JSON_STRING {{"
      }
    ]
  };
  let malformedCaught = false;
  try {
    parseMCPResponse(malformedMCPResponse);
  } catch (err: unknown) {
    if (err instanceof MCPResponseError) {
      malformedCaught = true;
      console.log("✓ Malformed non-error JSON caught with diagnostic context:", err.message);
      console.assert(err.message.includes("Failed to parse MCP response content[0].text as JSON"), "Clear message");
    }
  }
  console.assert(malformedCaught, "Expected MCPResponseError on malformed JSON");

  // 10. Explicit Score & Metric Mapping Test:
  // Map average_normalized_gain from record_assessment_score directly into generate_youth_resolution's learning_gain.normalized_gain
  console.log("\n[Test 10] Score & Metric Mapping: average_normalized_gain -> learning_gain.normalized_gain...");
  const mappingSession = new TurnGreenClientSession({
    session_id: "metric-mapping-session-42",
    author_name: "Taylor Reed",
    district_name: "Ward 5 - Metro Basin",
    initial_budget: 100000
  });

  // Pre-assessment: Q1=1, Q2=2 (Total = 3, Max possible = 10, room for gain = 7)
  mappingSession.recordPreAssessment({ q1_canopy_flooding: 1, q2_pavement_heat: 2 });

  // Play Turn 1
  mappingSession.submitTurn({
    turn: 1,
    intervention_id: "urban_canopy_trees",
    budget_allocated: 30000
  });

  // Post-assessment: Q1=4, Q2=5 (Total = 9, Gain = 6/7 = ~0.857)
  const postAssessmentRes = mappingSession.recordPostAssessment({ q1_canopy_flooding: 4, q2_pavement_heat: 5 });
  const rawHakeGain = postAssessmentRes.learning_gain?.average_normalized_gain;
  console.log("record_assessment_score average_normalized_gain:", rawHakeGain);
  console.assert(rawHakeGain !== undefined && rawHakeGain > 0.85, "Gain should be ~0.857");

  // Verify getMappedLearningGain() directly maps average_normalized_gain
  const mappedGain = mappingSession.getMappedLearningGain();
  console.log("Mapped learning_gain for resolution:", mappedGain);
  console.assert(
    mappedGain?.normalized_gain === rawHakeGain,
    `Expected mapped normalized_gain (${mappedGain?.normalized_gain}) to strictly equal rawHakeGain (${rawHakeGain})`
  );
  console.assert(
    mappedGain?.gain_category === postAssessmentRes.learning_gain?.gain_category,
    "Category matches"
  );

  // Test 11: 100-Coin Session Budget Pre-Flight Enforcement
  console.log("\n[Test 11] Coin Budget Mode: Verifying 100-Coin Budget Pre-Flight Enforcement...");
  const coinSession = new TurnGreenClientSession({
    initial_coins: 100,
    district_name: "District 2 - Riverview"
  });
  console.assert(coinSession.getCurrentState().remaining_budget === 100, "Initial coin budget must be 100");
  console.assert(coinSession.getCurrentState().budget_currency === "coins", "Currency must be 'coins'");

  // Verify rejection when exceeding remaining coin budget
  let coinOverspendCaught = false;
  try {
    coinSession.playYearPlan([
      { intervention_id: "pocket_parks", budget_allocated: 60 },
      { intervention_id: "green_roofs", budget_allocated: 45 } // Total 105 > 100
    ]);
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      coinOverspendCaught = true;
      console.log("✓ 100-coin overspend correctly rejected by pre-flight validation:", err.message);
      console.assert(
        err.message.includes("budget_allocated (🪙105) cannot exceed remaining_budget (🪙100)"),
        "Error message should use coin symbol and values"
      );
    }
  }
  console.assert(coinOverspendCaught, "Expected ValidationError when total coins > 100");

  // Verify successful execution with valid coin plan
  const coinPlanResult = coinSession.playYearPlan([
    { intervention_id: "pocket_parks", budget_allocated: 40 },
    { intervention_id: "cool_roofs", budget_allocated: 24 } // Total 64 <= 100
  ]);
  console.log(`✓ Coin plan executed. Spent: 🪙${coinPlanResult.total_budget_spent}, Remaining: 🪙${coinSession.getRemainingBudget()}`);
  console.assert(coinSession.getRemainingBudget() === 36, "Remaining coins should be 36");
  console.assert(coinSession.getTotalBudgetSpent() === 64, "Total budget spent should be 64 coins");

  // Verify second year plan exceeding cumulative remaining 36 coins
  let year2OverspendCaught = false;
  try {
    coinSession.playYearPlan([
      { intervention_id: "bioswales", budget_allocated: 40 } // 40 > remaining 36
    ]);
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      year2OverspendCaught = true;
      console.log("✓ Second year overspend correctly caught:", err.message);
      console.assert(
        err.message.includes("budget_allocated (🪙40) cannot exceed remaining_budget (🪙36)"),
        "Should reject year 2 plan exceeding remaining coins"
      );
    }
  }
  console.assert(year2OverspendCaught, "Expected ValidationError on Year 2 plan overspend");

  // Verify second year plan succeeding within remaining 36 coins
  coinSession.playYearPlan([
    { intervention_id: "bioswales", budget_allocated: 30 }
  ]);
  console.assert(coinSession.getRemainingBudget() === 6, "Remaining coins should be 6");
  // Test 12: Verify getAnnualHistory() & getTurnsPlayed() Dry-Season & Coin Metric Exposure
  console.log("\n[Test 12] Dry-Season & Coin Metrics Exposure in getAnnualHistory() & getTurnsPlayed()...");
  const annualHistory = coinSession.getAnnualHistory();
  console.log(`✓ Annual history records count: ${annualHistory.length}`);
  console.assert(annualHistory.length === 2, "Expected exactly 2 annual plan records in history");

  // Check Year 1 annual record
  const year1Record = annualHistory[0];
  console.log("✓ Year 1 Record:", {
    year: year1Record.year,
    currency: year1Record.budget_currency,
    spent: year1Record.total_spent,
    remaining: year1Record.remaining_budget,
    dry_season_impact: year1Record.dry_season_impact
  });
  console.assert(year1Record.year === 1, "Year 1 plan record year must be 1");
  console.assert(year1Record.budget_currency === "coins", "Currency must be 'coins'");
  console.assert(year1Record.total_spent === 64, "Year 1 spent coins should be 64");
  console.assert(year1Record.remaining_budget === 36, "Year 1 remaining coins should be 36");
  console.assert(year1Record.dry_season_impact !== undefined, "Year 1 must record dry_season_impact");
  console.assert(
    typeof year1Record.dry_season_impact?.drought_resilience_score === "number" &&
    year1Record.dry_season_impact.drought_resilience_score > 0,
    "Drought resilience score must be a positive number"
  );
  console.assert(
    year1Record.dry_season_impact?.drought_precipitation_mm === 10,
    "Drought precipitation should be 10 mm"
  );
  console.assert(
    year1Record.dry_season_impact?.temperature_under_dry_heat_display.includes("°C"),
    "Temperature under dry heat should be formatted in °C"
  );

  // Check getTurnsPlayed() exposure of dry season impact
  const turnsPlayed = coinSession.getTurnsPlayed();
  console.log(`✓ turnsPlayed count: ${turnsPlayed.length}`);
  console.assert(turnsPlayed.length === 3, "Expected 3 individual project turns recorded across 2 years");
  const recordedTurn1 = turnsPlayed[0];
  console.assert(recordedTurn1.budget_currency === "coins", "Turn 1 budget currency must be coins");
  console.assert(recordedTurn1.dry_season_impact !== undefined, "Turn 1 must expose dry_season_impact");
  console.assert(
    recordedTurn1.dry_season_impact?.drought_resilience_score === year1Record.dry_season_impact?.drought_resilience_score,
    "Turn 1 dry season score must match Year 1 annual record"
  );

  // Test 13: Client-Side Annual Budget Pre-Flight Check (annual_budget_limit)
  console.log("\n[Test 13] Annual Budget Pre-Flight Check (annual_budget_limit)...");
  const annualLimitSession = new TurnGreenClientSession({ initial_coins: 100, budget_currency: "coins" });
  let annualLimitCaught = false;
  try {
    annualLimitSession.playYearPlan(
      [
        { intervention_id: "pocket_parks", budget_allocated: 20 },
        { intervention_id: "urban_canopy_trees", budget_allocated: 15 }
      ],
      { year: 1, annual_budget_limit: 25 } // 35 requested vs 25 annual limit (even though 100 available)
    );
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      annualLimitCaught = true;
      console.log("✓ Annual budget pre-flight rejection caught:", err.message);
      console.assert(
        err.message.includes("exceeds annual budget limit (🪙25)"),
        "Error message should mention annual budget limit"
      );
    }
  }
  console.assert(annualLimitCaught, "playYearPlan must reject batch plans exceeding annual_budget_limit before dispatch");

  // Test 14: Atomic Save-After-Success and Rollback Handling
  console.log("\n[Test 14] Testing Atomic Save-After-Success & Rollback Handling...");
  let sessionSaveCallbackInvoked = false;
  let savedSnapshot: any = null;

  const transactionalSession = new TurnGreenClientSession({
    initial_coins: 100,
    budget_currency: "coins",
    on_session_saved: (state) => {
      sessionSaveCallbackInvoked = true;
      savedSnapshot = state;
    }
  });

  const stateBeforeAttempt = JSON.parse(JSON.stringify(transactionalSession.getCurrentState()));
  const turnsBeforeAttempt = transactionalSession.getTurnsPlayed().length;
  const historyBeforeAttempt = transactionalSession.getAnnualHistory().length;

  // Attempt a plan that fails during simulation (e.g., invalid intervention)
  let transactionFailed = false;
  try {
    transactionalSession.playYearPlan(
      [
        { intervention_id: "pocket_parks", budget_allocated: 20 },
        { intervention_id: "invalid_intervention" as any, budget_allocated: 20 }
      ],
      { year: 1 }
    );
  } catch (err: unknown) {
    transactionFailed = true;
    console.log("✓ Expected simulation failure caught:", (err as Error).message);
  }

  console.assert(transactionFailed, "Transaction must fail and catch error");
  console.assert(!sessionSaveCallbackInvoked, "onSessionSaved callback must NOT be called on failure");
  console.assert(
    JSON.stringify(transactionalSession.getCurrentState()) === JSON.stringify(stateBeforeAttempt),
    "Client state must be completely unmutated after failed plan execution"
  );
  console.assert(
    transactionalSession.getTurnsPlayed().length === turnsBeforeAttempt,
    "turnsPlayed must remain completely untouched on failed plan"
  );
  console.assert(
    transactionalSession.getAnnualHistory().length === historyBeforeAttempt,
    "annualHistory must remain completely untouched on failed plan"
  );
  console.log("✓ Atomic rollback verified: state, turns, and annual history were preserved.");

  // Now execute a valid plan and verify atomic commit and onSessionSaved invocation
  const validPlanResult = transactionalSession.playYearPlan(
    [
      { intervention_id: "pocket_parks", budget_allocated: 20 },
      { intervention_id: "cool_roofs", budget_allocated: 16 }
    ],
    { year: 1 }
  );

  console.assert(sessionSaveCallbackInvoked, "onSessionSaved must be invoked after successful execution");
  console.assert(savedSnapshot !== null, "Saved snapshot payload must be populated");
  console.assert(savedSnapshot.current_turn === 1, "Saved snapshot turn should be 1");
  console.assert(savedSnapshot.remaining_budget === 64, "Saved snapshot remaining budget should be 64");
  console.assert(transactionalSession.getTurnsPlayed().length === 2, "2 turns recorded on success");
  console.assert(transactionalSession.getAnnualHistory().length === 1, "1 annual history recorded on success");
  console.log("✓ Save-after-success handling verified: onSessionSaved called with updated session snapshot.");

  console.log("\n🎉 ALL TESTS (PRE-FLIGHT, RESPONSE CONTRACT, SCORE MAPPING, COIN BUDGET, DRY-SEASON METRICS, ANNUAL BUDGET, ATOMIC ROLLBACK) PASSED! 🎉\n");
}

runClientTests();



