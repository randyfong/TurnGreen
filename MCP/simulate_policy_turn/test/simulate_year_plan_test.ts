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
console.log("\n🎉 ALL SIMULATE_YEAR_PLAN UNIT TESTS PASSED! 🎉\n");
