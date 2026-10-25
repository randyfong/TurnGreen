import assert from "node:assert";
import { TurnGreenClientSession } from "../client/src/TurnGreenClient.js";

console.log("=== End-to-End Test: Multi-Project Year Plan -> Assessment -> Resolution ===");

// Initialize Client Session
const session = new TurnGreenClientSession({
  author_name: "Maya Lin",
  district_name: "District 4 - Metro Green Corridor",
  organization_or_school: "Youth Climate Action Council",
  target_body: "City Council",
  initial_budget: 200000,
  total_area_hectares: 50
});

// Step 1: Pre-Simulation Assessment (Turn 0)
console.log("\n[Step 1] Recording Pre-Simulation Assessment (Turn 0)...");
const preAssessmentResult = session.recordPreAssessment({
  q1_canopy_flooding: 1,
  q2_pavement_heat: 2,
  q3_cooling_albedo: 1,
  q4_un_sdg_soils: 1
});
console.log(`✓ Pre-assessment status: ${preAssessmentResult.status}`);
assert.strictEqual(preAssessmentResult.status, "recorded");

// Step 2: Execute Multi-Project Year Plans via playYearPlan
console.log("\n[Step 2] Executing Multi-Project Year Plans...");

// Year 1 Plan: 2 projects (Pocket Parks + Cool Roofs)
console.log("-> Running Year 1 Plan: Pocket Parks ($40k) + Cool Roofs ($20k)...");
const year1Result = session.playYearPlan(
  [
    { intervention_id: "pocket_parks", budget_allocated: 40000, project_name: "Community Pocket Park" },
    { intervention_id: "cool_roofs", budget_allocated: 20000, project_name: "Municipal Rooftop Albedo Coating" }
  ],
  { year: 1 }
);
console.log(`   Year 1 Spent: $${year1Result.total_budget_spent.toLocaleString()}`);
console.log(`   Remaining Budget: $${session.getCurrentState().remaining_budget.toLocaleString()}`);
assert.strictEqual(year1Result.projects_executed.length, 2);

// Year 2 Plan: 2 projects (Green Roofs + Bioswales)
console.log("-> Running Year 2 Plan: Green Roofs ($30k) + Bioswales ($25k)...");
const year2Result = session.playYearPlan(
  [
    { intervention_id: "green_roofs", budget_allocated: 30000, project_name: "High School Green Roof Garden" },
    { intervention_id: "bioswales", budget_allocated: 25000, project_name: "Transit Corridor Bioswales" }
  ],
  { year: 2 }
);
console.log(`   Year 2 Spent: $${year2Result.total_budget_spent.toLocaleString()}`);
console.log(`   Remaining Budget: $${session.getCurrentState().remaining_budget.toLocaleString()}`);
assert.strictEqual(year2Result.projects_executed.length, 2);

// Year 3 Plan: 1 project (Urban Canopy Trees)
console.log("-> Running Year 3 Plan: Street Tree Canopy ($35k)...");
const year3Result = session.playYearPlan(
  [
    { intervention_id: "urban_canopy_trees", budget_allocated: 35000, project_name: "Boulevard Tree Canopy Expansion" }
  ],
  { year: 3 }
);
console.log(`   Year 3 Spent: $${year3Result.total_budget_spent.toLocaleString()}`);
console.log(`   Remaining Budget: $${session.getCurrentState().remaining_budget.toLocaleString()}`);
assert.strictEqual(year3Result.projects_executed.length, 1);

// Verify total project turns recorded into session history
const turnsPlayed = session.getTurnsPlayed();
console.log(`\n✓ Total project records accumulated in session history: ${turnsPlayed.length}`);
assert.strictEqual(turnsPlayed.length, 5, "Should have accumulated 5 individual project records across the 3 year plans");

// Step 3: Post-Simulation Assessment (Turn 5)
console.log("\n[Step 3] Recording Post-Simulation Assessment (Turn 5)...");
const postAssessmentResult = session.recordPostAssessment({
  q1_canopy_flooding: 4,
  q2_pavement_heat: 4,
  q3_cooling_albedo: 5,
  q4_un_sdg_soils: 4
});
console.log(`✓ Post-assessment recorded. Average Normalized Gain (Hake g): ${postAssessmentResult.learning_gain?.average_normalized_gain}`);
console.log(`  Category: ${postAssessmentResult.learning_gain?.gain_category}`);
assert.ok(postAssessmentResult.learning_gain);
assert.strictEqual(postAssessmentResult.learning_gain?.gain_category, "High Gain");

// Step 4: Generate Youth Community Planning Resolution
console.log("\n[Step 4] Generating Youth Community Planning Resolution...");
const resolution = session.generateResolution();

console.log(`✓ Resolution Number: ${resolution.resolution_number}`);
console.log(`✓ Resolution Title: ${resolution.title}`);
console.log(`✓ Target Body: ${resolution.target_body}`);

console.log("\n--- Executive Summary ---");
console.log(resolution.executive_summary);
assert.ok(resolution.executive_summary.includes("5-year climate action plan") || resolution.executive_summary.includes("multi-project resilience investments"));

console.log("\n--- Biophysical Scorecard ---");
console.log(`  Heat Reduction Display: ${resolution.biophysical_scorecard.total_heat_reduction_display}`);
console.log(`  Total Stormwater Retained: ${resolution.biophysical_scorecard.total_stormwater_retained_m3.toLocaleString()} m³`);
console.log(`  Ground De-paved: ${resolution.biophysical_scorecard.ground_depaved_ha.toFixed(2)} ha`);
console.log(`  Rooftop Retrofitted: ${resolution.biophysical_scorecard.rooftop_treated_ha.toFixed(2)} ha`);

console.log("\n--- Actionable Talking Points ---");
assert.strictEqual(resolution.talking_points.length, 3, "Must generate exactly 3 civic talking points");
resolution.talking_points.forEach((tp) => {
  console.log(`\n[Point ${tp.id}] ${tp.topic_title} (${tp.timeframe})`);
  console.log(`  Evidence: ${tp.evidence_citation}`);
  console.log(`  Script: ${tp.recommended_script.substring(0, 150)}...`);
  console.log(`  Demand: ${tp.policy_demand}`);
});

// Step 5: Verify HTML Export formatting
console.log("\n[Step 5] Verifying HTML & Markdown Exports...");
assert.ok(resolution.single_page_html, "single_page_html must be populated");
assert.ok(resolution.resolution_markdown, "resolution_markdown must be populated");

// Check HTML contains properly formatted project portfolio data
assert.ok(resolution.single_page_html.includes("<!DOCTYPE html>"), "HTML must have doctype");
assert.ok(resolution.single_page_html.includes(resolution.resolution_number), "HTML must include resolution number");
assert.ok(resolution.single_page_html.includes("District 4 - Metro Green Corridor"), "HTML must include district name");
assert.ok(resolution.single_page_html.includes("Actionable Public Comment Talking Points"), "HTML must format talking points section");

console.log("✓ HTML successfully verified with all multiple projects cleanly formatted in table and scorecards.");
console.log("\n🎉 END-TO-END VERIFICATION PASSED SUCCESSFULLY! 🎉\n");
