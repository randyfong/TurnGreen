import assert from "node:assert";
import { executeYearPlanSimulation } from "../src/index.js";
import { NeighborhoodState, YearPlanProject } from "../src/types.js";

console.log("=== Testing simulate_year_plan MCP Tool ===");

const baselineState: NeighborhoodState = {
  total_area_hectares: 50,
  remaining_budget: 200000,
  roof_treatment_hectares: 0,
  land_cover: {
    tree_cover_10: 12,
    shrubland_20: 3,
    grassland_30: 8,
    cropland_40: 0,
    built_up_50: 72,
    bare_soil_60: 5,
    water_80: 0
  }
};

// 1. Test empty project list / error handling
console.log("\n[Test 1] Testing empty project list rejection...");
assert.throws(
  () => {
    executeYearPlanSimulation({
      year: 1,
      projects: [],
      current_state: baselineState
    });
  },
  (err: unknown) => {
    return err instanceof Error;
  },
  "Should throw an error when projects array is empty"
);
console.log("✓ Empty project list correctly rejected by schema validation.");

// 2. Test budget overflow validation across total batch spend
console.log("\n[Test 2] Testing budget overflow validation across total batch spend...");
const overBudgetProjects: YearPlanProject[] = [
  { intervention_id: "pocket_parks", budget_allocated: 120000 },
  { intervention_id: "green_roofs", budget_allocated: 90000 } // Total: $210,000 > $200,000
];
assert.throws(
  () => {
    executeYearPlanSimulation({
      year: 1,
      projects: overBudgetProjects,
      current_state: baselineState
    });
  },
  (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    return msg.includes("Budget validation failed") && msg.includes("exceeds remaining budget");
  },
  "Should throw budget overflow error when sum of project budgets exceeds remaining_budget"
);
console.log("✓ Budget overflow ($210,000 requested vs $200,000 available) correctly rejected before execution.");

// 3. Test multi-project combination (e.g. green roofs + pocket parks)
console.log("\n[Test 3] Testing multi-project combination in one year plan...");
const multiProjects: YearPlanProject[] = [
  { intervention_id: "pocket_parks", budget_allocated: 38000, project_name: "Downtown Corner Park" },
  { intervention_id: "green_roofs", budget_allocated: 32000, project_name: "Civic Center Green Roof" },
  { intervention_id: "cool_roofs", budget_allocated: 20000, project_name: "Library Cool Coating" }
];

const planResult = executeYearPlanSimulation({
  year: 1,
  projects: multiProjects,
  current_state: baselineState
});

console.log(`Executed Projects Count: ${planResult.projects_executed.length}`);
assert.strictEqual(planResult.projects_executed.length, 3, "All 3 projects should be executed");

const totalSpent = planResult.total_budget_spent;
assert.strictEqual(totalSpent, 38000 + 32000 + 20000, "Total budget spent must match sum of project allocations");
assert.strictEqual(planResult.next_state.remaining_budget, 200000 - 90000, "Remaining budget must be correctly updated");

console.log(`Total Spent: $${totalSpent.toLocaleString()}, Remaining: $${planResult.next_state.remaining_budget.toLocaleString()}`);
console.log(`Cooling Temp Drop: ${planResult.science_payload.invest_urban_cooling.surface_temp_drop_celsius}°C`);
console.log(`Stormwater Retained: ${planResult.science_payload.invest_urban_flood.stormwater_retained_m3} m³`);
console.log(`Incremental Runoff Reduction: ${planResult.science_payload.invest_urban_flood.incremental_runoff_reduction_m3} m³`);
console.log(`Headline: ${planResult.youth_scorecard.headline}`);
console.log(`Youth Takeaway: ${planResult.youth_scorecard.youth_takeaway}`);
console.log(`Water Analogy: ${planResult.youth_scorecard.water_retention_analogy}`);

// Verify intermediate steps
assert.strictEqual(planResult.science_payload.intermediate_steps?.length, 3, "Must produce 3 intermediate steps");
console.log("✓ Produced 3 intermediate science steps.");

// 4. Validate conservation of land cover (strict 100% check, no rounding bleed)
console.log("\n[Test 4] Validating conservation of land cover (strict 100% check, no rounding bleed)...");
const finalLandCover = planResult.next_state.land_cover;
const totalLandCover = Object.values(finalLandCover).reduce((sum, v) => sum + v, 0);
const roundedTotal = Number(totalLandCover.toFixed(2));

console.log("Final Land Cover Breakdown:");
for (const [k, v] of Object.entries(finalLandCover)) {
  console.log(`  ${k}: ${v}%`);
}
console.log(`Total Land Cover Sum: ${roundedTotal}%`);

assert.strictEqual(roundedTotal, 100.0, "Total land cover percentages must sum strictly to 100.00%");
assert.ok(finalLandCover.built_up_50 < baselineState.land_cover.built_up_50, "Built-up area must decrease after green conversions");
assert.ok(finalLandCover.grassland_30 > baselineState.land_cover.grassland_30, "Grassland must increase from pocket parks / green roofs");
assert.ok(planResult.next_state.roof_treatment_hectares! > 0, "Cool roof retrofit area must be tracked");

console.log("✓ Land cover strictly conserved at 100.00% without rounding bleed.");

// Test 5: Dry Season Annual Dynamics Check
console.log("\n[Test 5] Validating Annual Dry Season Mechanics...");
const dryImpact = planResult.science_payload.dry_season_impact;
assert.ok(dryImpact, "dry_season_impact must be populated in year plan payload");
console.log(`  Drought Precipitation: ${dryImpact.drought_precipitation_mm} mm`);
console.log(`  Drought Cooling Drop: ${dryImpact.drought_temp_drop_celsius}°C`);
console.log(`  Peak Dry-Heat Surface Temp: ${dryImpact.peak_dry_heat_surface_temp_celsius}°C`);
console.log(`  Drought Resilience Score: ${dryImpact.drought_resilience_score}`);
console.log(`  ET Loss under Drought: ${dryImpact.et_loss_pct}%`);
console.log(`  Canopy Resilience Ratio: ${dryImpact.canopy_resilience_ratio}`);
console.log(`  Dry Season Storm Retention: ${dryImpact.drought_retention_pct}%`);
console.log(`  Sponge Description: ${dryImpact.sponge_capacity_description}`);

assert.strictEqual(dryImpact.drought_precipitation_mm, 10, "Dry season precipitation depth must be 10 mm");
assert.ok(dryImpact.et_loss_pct > 0, "Evapotranspiration must experience drought attenuation");
assert.ok(dryImpact.canopy_resilience_ratio > 0, "Canopy deep-root resilience must be quantified");
assert.ok(dryImpact.drought_retention_pct >= 0 && dryImpact.drought_retention_pct <= 100, "Retention pct must be valid");
assert.ok(dryImpact.drought_resilience_score >= 0 && dryImpact.drought_resilience_score <= 100, "Drought resilience score must be 0-100");

// Check youth_scorecard dry_season_impact
const scorecardDry = planResult.youth_scorecard.dry_season_impact;
assert.ok(scorecardDry, "youth_scorecard.dry_season_impact must be populated");
console.log(`  Scorecard Drought Resilience Score: ${scorecardDry.drought_resilience_score}/100`);
console.log(`  Scorecard Dry-Heat Temp Display: ${scorecardDry.temperature_under_dry_heat_display}`);
console.log(`  Scorecard Drought Summary: ${scorecardDry.drought_summary}`);
assert.strictEqual(scorecardDry.drought_resilience_score, dryImpact.drought_resilience_score);
assert.ok(scorecardDry.temperature_under_dry_heat_display.includes("°C"));

console.log("✓ Annual dry season biophysical dynamics & scorecard verified!");

// Test 6: 100-Coin Limit Rejection when Projects Total > 100 Coins
console.log("\n[Test 6] Validating 100-Coin Limit Rejection when projects total > 100 coins...");
const coinNeighborhoodState: NeighborhoodState = {
  total_area_hectares: 50,
  remaining_budget: 100,
  budget_currency: "coins",
  roof_treatment_hectares: 0,
  land_cover: { ...baselineState.land_cover }
};

const overCoinProjects: YearPlanProject[] = [
  { intervention_id: "pocket_parks", budget_allocated: 60 },
  { intervention_id: "green_roofs", budget_allocated: 45 } // Total: 105 coins > 100 coins
];

assert.throws(
  () => {
    executeYearPlanSimulation({
      year: 1,
      projects: overCoinProjects,
      current_state: coinNeighborhoodState
    });
  },
  (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    return msg.includes("Budget validation failed") &&
           msg.includes("🪙105") &&
           msg.includes("🪙100");
  },
  "Should throw error rejecting year plan when total coins exceed 100 coins"
);
console.log("✓ 100-coin limit rejection verified: 🪙105 requested vs 🪙100 available correctly rejected.");

// Test 7: Dry Season Runs Exactly Once Per Year Plan Execution
console.log("\n[Test 7] Validating Dry Season runs exactly once per year plan execution...");
// Execute a year plan with 3 distinct projects
const threeProjectPlan: YearPlanProject[] = [
  { intervention_id: "pocket_parks", budget_allocated: 30 },
  { intervention_id: "urban_canopy_trees", budget_allocated: 24 },
  { intervention_id: "cool_roofs", budget_allocated: 16 }
];

const threeProjectResult = executeYearPlanSimulation({
  year: 1,
  projects: threeProjectPlan,
  current_state: coinNeighborhoodState
});

// Verify 3 projects executed and 3 intermediate steps were produced
assert.strictEqual(threeProjectResult.projects_executed.length, 3, "Expected 3 projects executed");
assert.strictEqual(threeProjectResult.science_payload.intermediate_steps?.length, 3, "Expected 3 intermediate science steps");

// Intermediate steps model standard wet/design storm conditions and do NOT attach intermediate dry seasons
for (const step of threeProjectResult.science_payload.intermediate_steps ?? []) {
  assert.strictEqual((step as any).dry_season_impact, undefined, "Intermediate steps must not execute dry seasons");
}

// Exactly one macro dry_season_impact is populated at the annual plan level
assert.ok(threeProjectResult.science_payload.dry_season_impact, "Annual science payload must have dry_season_impact");
assert.ok(threeProjectResult.youth_scorecard.dry_season_impact, "Youth scorecard must have dry_season_impact");
assert.strictEqual(
  threeProjectResult.science_payload.dry_season_impact.drought_precipitation_mm,
  10,
  "Annual dry season must be evaluated at 10 mm drought baseline"
);
console.log("✓ Exactly one annual dry season cycle executed across all 3 projects in the year plan.");

// Test 8: Atomic Rollback / Failure Verification when Any Intermediate Project Fails
console.log("\n[Test 8] Validating Atomic Rollback / Failure when any project in year plan fails...");

// Copy state before attempting failed plan
const preExecutionState: NeighborhoodState = JSON.parse(JSON.stringify(coinNeighborhoodState));

// Create a plan where project 1 is valid, but project 2 is invalid or exceeds bounds
const failingProjects = [
  { intervention_id: "pocket_parks", budget_allocated: 20 },
  { intervention_id: "invalid_intervention_id" as any, budget_allocated: 20 }
];

let failureThrown = false;
try {
  executeYearPlanSimulation({
    year: 1,
    projects: failingProjects,
    current_state: coinNeighborhoodState
  });
} catch (err: unknown) {
  failureThrown = true;
  console.log("✓ Error successfully caught during year plan execution:", (err as Error).message);
}

assert.ok(failureThrown, "executeYearPlanSimulation must throw an error when an intermediate project is invalid");

// Verify that the caller's neighborhood state was untouched / not partially mutated
assert.deepStrictEqual(
  coinNeighborhoodState,
  preExecutionState,
  "Current state must remain completely unaltered when year plan simulation fails (atomic guarantee)"
);
console.log("✓ State immutability & atomic failure verified: input state was not mutated by partial execution.");

console.log("\n🎉 ALL SIMULATE_YEAR_PLAN UNIT TESTS PASSED! 🎉\n");
