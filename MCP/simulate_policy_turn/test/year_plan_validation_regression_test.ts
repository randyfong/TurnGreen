import assert from "node:assert";
import { executeYearPlanSimulation, validateYearPlan } from "../src/index.js";
import { NeighborhoodState, SimulationPlanError, YearPlanProject } from "../src/types.js";

console.log("=== Running Year Plan Validation & Regression Test Suite ===\n");

const baseNeighborhoodState: NeighborhoodState = {
  total_area_hectares: 50,
  remaining_budget: 200000,
  budget_currency: "usd",
  roof_treatment_hectares: 0,
  land_cover: {
    tree_cover_10: 12,
    shrubland_20: 3,
    grassland_30: 8,
    cropland_40: 0,
    built_up_50: 72,
    bare_soil_60: 5,
    water_80: 0
  },
  baseline_land_cover: {
    tree_cover_10: 12,
    shrubland_20: 3,
    grassland_30: 8,
    cropland_40: 0,
    built_up_50: 72,
    bare_soil_60: 5,
    water_80: 0
  }
};

// 1. Exact-limit spending: Plan requesting exactly annual_budget_limit ($1,000) succeeds without capping or error
console.log("[Test 1] Exact-limit spending: Plan requesting exactly annual_budget_limit ($1,000)...");
{
  const exactSpendingProjects: YearPlanProject[] = [
    { intervention_id: "cool_roofs", budget_allocated: 400, project_name: "School Cool Roof" },
    { intervention_id: "urban_canopy_trees", budget_allocated: 600, project_name: "Community Trees" }
  ];

  const result = executeYearPlanSimulation({
    year: 1,
    annual_budget_limit: 1000,
    projects: exactSpendingProjects,
    current_state: {
      ...baseNeighborhoodState,
      remaining_budget: 1000
    }
  });

  assert.strictEqual(result.total_budget_spent, 1000, "Must spend exactly $1,000 without error");
  assert.strictEqual(result.next_state.remaining_budget, 0, "Remaining budget must be exactly 0");
  assert.strictEqual(result.projects_executed.length, 2, "Both projects executed");
  assert.strictEqual(result.projects_executed[0].budget_capped, false, "First project must not be capped");
  assert.strictEqual(result.projects_executed[1].budget_capped, false, "Second project must not be capped");
  console.log("✓ Exact $1,000 budget limit successfully executed without capping.");
}

// 2. Overspending limits:
// 2a. Exceeding annual_budget_limit triggers ANNUAL_BUDGET_EXCEEDED
console.log("\n[Test 2a] Overspending annual_budget_limit triggers ANNUAL_BUDGET_EXCEEDED...");
{
  let annualLimitCaught = false;
  try {
    executeYearPlanSimulation({
      year: 1,
      annual_budget_limit: 1000,
      projects: [
        { intervention_id: "pocket_parks", budget_allocated: 600 },
        { intervention_id: "bioswales", budget_allocated: 450 } // Total: 1050 > 1000
      ],
      current_state: baseNeighborhoodState // remaining_budget is 200,000
    });
  } catch (err: unknown) {
    if (err instanceof SimulationPlanError) {
      annualLimitCaught = true;
      assert.strictEqual(err.detail.error_code, "ANNUAL_BUDGET_EXCEEDED");
      assert.ok(err.detail.message.includes("exceeds maximum annual budget limit"));
      console.log(`✓ Caught expected ANNUAL_BUDGET_EXCEEDED: ${err.detail.message}`);
    }
  }
  assert.ok(annualLimitCaught, "Must throw SimulationPlanError with code ANNUAL_BUDGET_EXCEEDED");
}

// 2b. Exceeding remaining_budget triggers REMAINING_BUDGET_EXCEEDED
console.log("\n[Test 2b] Overspending remaining_budget triggers REMAINING_BUDGET_EXCEEDED...");
{
  let remainingBudgetCaught = false;
  try {
    executeYearPlanSimulation({
      year: 1,
      annual_budget_limit: 5000,
      projects: [
        { intervention_id: "pocket_parks", budget_allocated: 800 },
        { intervention_id: "bioswales", budget_allocated: 400 } // Total: 1200 > remaining 1000
      ],
      current_state: {
        ...baseNeighborhoodState,
        remaining_budget: 1000
      }
    });
  } catch (err: unknown) {
    if (err instanceof SimulationPlanError) {
      remainingBudgetCaught = true;
      assert.strictEqual(err.detail.error_code, "REMAINING_BUDGET_EXCEEDED");
      assert.ok(err.detail.message.includes("exceeds remaining budget"));
      console.log(`✓ Caught expected REMAINING_BUDGET_EXCEEDED: ${err.detail.message}`);
    }
  }
  assert.ok(remainingBudgetCaught, "Must throw SimulationPlanError with code REMAINING_BUDGET_EXCEEDED");
}

// 3. Invalid projects & nonpositive budgets:
// 3a. Budget <= 0 triggers NON_POSITIVE_BUDGET with offending project_index
console.log("\n[Test 3a] Nonpositive budget (<= 0) triggers NON_POSITIVE_BUDGET with project_index...");
{
  let nonpositiveCaught = false;
  try {
    executeYearPlanSimulation({
      year: 1,
      projects: [
        { intervention_id: "permeable_pavement", budget_allocated: 1000, project_name: "Alley Pavers" },
        { intervention_id: "bioswales", budget_allocated: 0, project_name: "Drainage Swale" } // Index 1 invalid
      ],
      current_state: baseNeighborhoodState
    });
  } catch (err: unknown) {
    if (err instanceof SimulationPlanError) {
      nonpositiveCaught = true;
      assert.strictEqual(err.detail.error_code, "NON_POSITIVE_BUDGET");
      assert.strictEqual(err.detail.project_index, 1);
      assert.strictEqual(err.detail.project_name, "Drainage Swale");
      console.log(`✓ Caught NON_POSITIVE_BUDGET at project index ${err.detail.project_index}: ${err.detail.message}`);
    }
  }
  assert.ok(nonpositiveCaught, "Must throw NON_POSITIVE_BUDGET for budget_allocated <= 0");

  let negativeCaught = false;
  try {
    executeYearPlanSimulation({
      year: 1,
      projects: [
        { intervention_id: "permeable_pavement", budget_allocated: -500, project_name: "Bad Project" }
      ],
      current_state: baseNeighborhoodState
    });
  } catch (err: unknown) {
    if (err instanceof SimulationPlanError) {
      negativeCaught = true;
      assert.strictEqual(err.detail.error_code, "NON_POSITIVE_BUDGET");
      assert.strictEqual(err.detail.project_index, 0);
    }
  }
  assert.ok(negativeCaught, "Must throw NON_POSITIVE_BUDGET for negative budget");
}

// 3b. Unknown intervention ID triggers INVALID_PROJECT with project_index
console.log("\n[Test 3b] Unknown intervention ID triggers INVALID_PROJECT with project_index...");
{
  let invalidProjectCaught = false;
  try {
    executeYearPlanSimulation({
      year: 1,
      projects: [
        { intervention_id: "permeable_pavement", budget_allocated: 500 },
        { intervention_id: "solar_panels_unknown" as any, budget_allocated: 600, project_name: "Rooftop Solar" }
      ],
      current_state: baseNeighborhoodState
    });
  } catch (err: unknown) {
    if (err instanceof SimulationPlanError) {
      invalidProjectCaught = true;
      assert.strictEqual(err.detail.error_code, "INVALID_PROJECT");
      assert.strictEqual(err.detail.project_index, 1);
      assert.strictEqual(err.detail.project_name, "Rooftop Solar");
      assert.ok(err.detail.message.includes("solar_panels_unknown"));
      console.log(`✓ Caught INVALID_PROJECT at index ${err.detail.project_index}: ${err.detail.message}`);
    }
  }
  assert.ok(invalidProjectCaught, "Must throw INVALID_PROJECT for unknown intervention ID");
}

// 4. Duplicate handling: Test duplicate detection
console.log("\n[Test 4] Duplicate handling: duplicate intervention_id triggers DUPLICATE_PROJECT_TYPE...");
{
  let duplicateCaught = false;
  try {
    executeYearPlanSimulation({
      year: 1,
      projects: [
        { intervention_id: "pocket_parks", budget_allocated: 500, project_name: "Park A" },
        { intervention_id: "cool_roofs", budget_allocated: 300, project_name: "Roof B" },
        { intervention_id: "pocket_parks", budget_allocated: 400, project_name: "Park C" } // Duplicate at index 2
      ],
      current_state: baseNeighborhoodState
    });
  } catch (err: unknown) {
    if (err instanceof SimulationPlanError) {
      duplicateCaught = true;
      assert.strictEqual(err.detail.error_code, "DUPLICATE_PROJECT_TYPE");
      assert.strictEqual(err.detail.project_index, 2);
      assert.strictEqual(err.detail.project_name, "Park C");
      assert.ok(err.detail.message.includes("Duplicate project intervention 'pocket_parks' found"));
      console.log(`✓ Caught DUPLICATE_PROJECT_TYPE at index ${err.detail.project_index}: ${err.detail.message}`);
    }
  }
  assert.ok(duplicateCaught, "Must throw DUPLICATE_PROJECT_TYPE when duplicate project types are submitted");
}

// 5. Reversed input order & execution indices:
// Canonical order: permeable_pavement (1) -> bioswales (2) -> pocket_parks (3) -> urban_canopy_trees (4) -> cool_roofs (6)
console.log("\n[Test 5] Reversed input order & execution indices verification...");
{
  const reversedInputProjects: YearPlanProject[] = [
    { intervention_id: "cool_roofs", budget_allocated: 2000, project_name: "Input Project 0 (Cool Roofs)" },
    { intervention_id: "urban_canopy_trees", budget_allocated: 3000, project_name: "Input Project 1 (Canopy Trees)" },
    { intervention_id: "permeable_pavement", budget_allocated: 4000, project_name: "Input Project 2 (Permeable Pavement)" }
  ];

  const result = executeYearPlanSimulation({
    year: 1,
    projects: reversedInputProjects,
    current_state: baseNeighborhoodState
  });

  assert.strictEqual(result.projects_executed.length, 3);

  // Executed 0 should be permeable_pavement (canonical 1), which was original_index 2
  const exec0 = result.projects_executed[0];
  assert.strictEqual(exec0.intervention_id, "permeable_pavement");
  assert.strictEqual(exec0.original_index, 2);
  assert.strictEqual(exec0.executed_index, 0);

  // Executed 1 should be urban_canopy_trees (canonical 4), which was original_index 1
  const exec1 = result.projects_executed[1];
  assert.strictEqual(exec1.intervention_id, "urban_canopy_trees");
  assert.strictEqual(exec1.original_index, 1);
  assert.strictEqual(exec1.executed_index, 1);

  // Executed 2 should be cool_roofs (canonical 6), which was original_index 0
  const exec2 = result.projects_executed[2];
  assert.strictEqual(exec2.intervention_id, "cool_roofs");
  assert.strictEqual(exec2.original_index, 0);
  assert.strictEqual(exec2.executed_index, 2);

  console.log("✓ Projects correctly reordered according to canonical ecological staging:");
  result.projects_executed.forEach((p) => {
    console.log(`   Executed #${p.executed_index}: ${p.intervention_id} (original input index: ${p.original_index})`);
  });
}

// 6. Combined metrics separation:
// Verify total retained water, village baseline improvement, annual plan incremental runoff reduction, and plan temp drop
console.log("\n[Test 6] Combined metrics separation: distinguishing total, baseline improvement, and annual incremental...");
{
  const testProjects: YearPlanProject[] = [
    { intervention_id: "pocket_parks", budget_allocated: 25000 },
    { intervention_id: "bioswales", budget_allocated: 15000 }
  ];

  const result = executeYearPlanSimulation({
    year: 1,
    projects: testProjects,
    current_state: baseNeighborhoodState
  });

  const flood = result.science_payload.invest_urban_flood;
  const cooling = result.science_payload.invest_urban_cooling;

  // Verify fields are distinct and present
  assert.strictEqual(typeof flood.design_storm_total_retained_m3, "number");
  assert.strictEqual(typeof flood.cumulative_retained_improvement_m3, "number");
  assert.strictEqual(typeof flood.annual_plan_incremental_runoff_reduction_m3, "number");
  assert.strictEqual(typeof cooling.annual_plan_temp_drop_celsius, "number");

  assert.ok(flood.design_storm_total_retained_m3 > 0, "design_storm_total_retained_m3 must be positive");
  assert.ok(flood.cumulative_retained_improvement_m3 >= 0, "cumulative_retained_improvement_m3 must be >= 0");
  assert.ok(flood.annual_plan_incremental_runoff_reduction_m3 > 0, "annual_plan_incremental_runoff_reduction_m3 must be > 0");
  assert.ok(cooling.annual_plan_temp_drop_celsius > 0, "annual_plan_temp_drop_celsius must be > 0");

  console.log(`✓ Total stormwater retained after plan: ${flood.design_storm_total_retained_m3.toLocaleString()} m³`);
  console.log(`✓ Improvement vs Turn 0 baseline: ${flood.cumulative_retained_improvement_m3.toLocaleString()} m³`);
  console.log(`✓ Incremental avoided runoff this year: ${flood.annual_plan_incremental_runoff_reduction_m3.toLocaleString()} m³`);
  console.log(`✓ Cooling temp drop this year: ${cooling.annual_plan_temp_drop_celsius}°C`);

  // Verify intermediate steps exist and match length
  assert.strictEqual(result.science_payload.intermediate_steps?.length, 2);
}

// 7. Unchanged input state after failure:
// Verify that throwing on validation guarantees no mutated state or partial plan
console.log("\n[Test 7] Unchanged input state after validation failure...");
{
  const immutableLandCover = {
    tree_cover_10: 12,
    shrubland_20: 3,
    grassland_30: 8,
    cropland_40: 0,
    built_up_50: 72,
    bare_soil_60: 5,
    water_80: 0
  };
  const testInput = {
    year: 1,
    annual_budget_limit: 500,
    projects: [
      { intervention_id: "cool_roofs" as const, budget_allocated: 300 },
      { intervention_id: "urban_canopy_trees" as const, budget_allocated: 400 } // Total: 700 > 500
    ],
    current_state: {
      total_area_hectares: 50,
      remaining_budget: 100000,
      roof_treatment_hectares: 0,
      land_cover: { ...immutableLandCover }
    }
  };

  const beforeJson = JSON.stringify(testInput);

  let errorThrown = false;
  try {
    executeYearPlanSimulation(testInput);
  } catch (err: unknown) {
    errorThrown = true;
  }
  assert.ok(errorThrown, "Should fail on annual budget limit check");

  const afterJson = JSON.stringify(testInput);
  assert.strictEqual(afterJson, beforeJson, "Input state must remain 100% strictly identical and unmutated");
  console.log("✓ Input object verified completely untouched and unmutated after failure.");
}

console.log("\n🎉 ALL REGRESSION TESTS PASSED! 🎉\n");
