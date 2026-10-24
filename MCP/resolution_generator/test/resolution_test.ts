import assert from "node:assert";
import { executeGenerateYouthResolution } from "../src/index.js";

console.log("=== Testing TurnGreen resolution_generator MCP Tool ===");

const sampleInput = {
  author_name: "Maya Chen",
  district_name: "District 7 - Southside Heat Basin",
  organization_or_school: "Lincoln High Climate Action Club",
  target_body: "City Council" as const,
  session_history: {
    session_id: "test-session-maya-001",
    baseline: {
      built_up_pct: 74,
      tree_cover_pct: 10,
      grassland_pct: 8,
      shrubland_pct: 3,
      bare_soil_pct: 5
    },
    turns: [
      {
        turn: 1,
        intervention_id: "urban_canopy_trees" as const,
        intervention_name: "Street Tree Canopy Planting",
        budget_allocated: 40000,
        area_converted_ha: 0.8,
        surface_temp_drop_celsius: 0.35,
        runoff_retained_m3: 320
      },
      {
        turn: 2,
        intervention_id: "permeable_pavement" as const,
        intervention_name: "Permeable Plaza De-Paving",
        budget_allocated: 45000,
        area_converted_ha: 0.6,
        surface_temp_drop_celsius: 0.2,
        runoff_retained_m3: 1100
      },
      {
        turn: 3,
        intervention_id: "bioswales" as const,
        intervention_name: "Curbside Bioswales",
        budget_allocated: 35000,
        area_converted_ha: 0.5,
        surface_temp_drop_celsius: 0.25,
        runoff_retained_m3: 1850
      },
      {
        turn: 4,
        intervention_id: "green_roofs" as const,
        intervention_name: "Civic Green Roof Retrofits",
        budget_allocated: 50000,
        area_converted_ha: 0.7,
        surface_temp_drop_celsius: 0.45,
        runoff_retained_m3: 980
      },
      {
        turn: 5,
        intervention_id: "pocket_parks" as const,
        intervention_name: "Micro Pocket Parks",
        budget_allocated: 30000,
        area_converted_ha: 0.5,
        surface_temp_drop_celsius: 0.3,
        runoff_retained_m3: 650
      }
    ],
    final_metrics: {
      total_budget_spent: 200000,
      remaining_budget: 0,
      net_cooling_celsius: 1.55,
      net_cooling_fahrenheit: 2.79,
      net_stormwater_retained_m3: 4900,
      net_stormwater_retained_gallons: 1294443,
      total_area_converted_ha: 3.1,
      depaved_impervious_pct: 6.2,
      overall_sustainability_score: 88,
      community_cheer_score: 92
    },
    learning_gain: {
      normalized_gain: 0.75,
      gain_category: "High Gain (g >= 0.7)",
      summary: "Exceptional mastery of nature-based infrastructure trade-offs."
    }
  }
};

try {
  const result = executeGenerateYouthResolution(sampleInput);

  console.log("\n[PASS] Generated Resolution Number:", result.resolution_number);
  console.log("[PASS] Title:", result.title);
  console.log("[PASS] Target Body:", result.target_body);
  console.log("[PASS] Scorecard Display:", result.biophysical_scorecard.total_heat_reduction_display);
  console.log("[PASS] Stormwater Retained (m3):", result.biophysical_scorecard.total_stormwater_retained_m3);
  console.log("[PASS] Stormwater Retained (gal):", result.biophysical_scorecard.total_stormwater_retained_gallons);

  // Assertions
  assert.strictEqual(result.author_name, "Maya Chen");
  assert.strictEqual(result.district_name, "District 7 - Southside Heat Basin");
  assert.strictEqual(result.talking_points.length, 3, "Must generate exactly 3 talking points");

  console.log("\n--- Generated 3 Actionable Talking Points ---");
  result.talking_points.forEach((tp) => {
    console.log(`\n[Point ${tp.id}] ${tp.topic_title} (${tp.timeframe})`);
    console.log(`Hook: ${tp.hook}`);
    console.log(`Evidence Citation: ${tp.evidence_citation}`);
    console.log(`Script: ${tp.recommended_script}`);
    console.log(`Demand: ${tp.policy_demand}`);
    assert(tp.recommended_script.length > 50, "Script should be substantive");
    assert(tp.policy_demand.length > 20, "Demand should be clear");
  });

  // Verify HTML output
  assert(result.single_page_html.includes("<!DOCTYPE html>"), "Must include HTML doctype");
  assert(result.single_page_html.includes("@page {"), "Must include CSS print @page rules");
  assert(result.single_page_html.includes("Youth Climate Resilience Mandate"), "HTML title check");

  // Verify Markdown output
  assert(result.resolution_markdown.includes("# YOUTH CLIMATE RESILIENCE MANDATE"), "Markdown title check");
  assert(result.resolution_markdown.includes("WHEREAS"), "Markdown whereas check");
  assert(result.resolution_markdown.includes("NOW, THEREFORE, BE IT RESOLVED"), "Markdown resolved check");

  console.log("\n[SUCCESS] All Resolution Generator MCP test assertions passed!");
} catch (err) {
  console.error("\n[FAIL] Test error:", err);
  process.exit(1);
}
