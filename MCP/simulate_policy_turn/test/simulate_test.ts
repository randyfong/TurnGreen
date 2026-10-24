import { executeSimulation } from "../src/index.js";

function runTest() {
  console.log("=== Testing simulate_policy_turn MCP Tool ===");

  const initialState = {
    total_area_hectares: 50,
    remaining_budget: 200000,
    land_cover: {
      tree_cover_10: 10,
      shrubland_20: 5,
      grassland_30: 5,
      cropland_40: 0,
      built_up_50: 75,
      bare_soil_60: 5,
      water_80: 0
    }
  };

  console.log("\n[Turn 1] Deploying Pocket Parks ($38,000 budget)...");
  const turn1Result = executeSimulation({
    turn: 1,
    intervention_id: "pocket_parks",
    budget_allocated: 38000,
    current_state: initialState
  });

  console.log("Turn 1 Headline:", turn1Result.player_summary.headline);
  console.log("Turn 1 Temp Drop:", turn1Result.player_summary.temperature_drop_display);
  console.log("Turn 1 Water Analogy:", turn1Result.player_summary.water_retention_analogy);
  console.log("Turn 1 Cooling Score:", turn1Result.player_metrics.cooling_score);
  console.log("Turn 1 Flood Resilience:", turn1Result.player_metrics.flood_resilience_score);
  console.log("Turn 1 Remaining Budget: $" + turn1Result.next_state.remaining_budget);
  console.log("Turn 1 Prior CN:", turn1Result.science_payload.invest_urban_flood.prior_composite_cn, "-> Post CN:", turn1Result.science_payload.invest_urban_flood.post_composite_cn);

  console.log("\n[Turn 2] Deploying Street Tree Canopy ($30,000 budget)...");
  const turn2Result = executeSimulation({
    turn: 2,
    intervention_id: "urban_canopy_trees",
    budget_allocated: 30000,
    current_state: turn1Result.next_state
  });

  console.log("Turn 2 Headline:", turn2Result.player_summary.headline);
  console.log("Turn 2 Temp Drop:", turn2Result.player_summary.temperature_drop_display);
  console.log("Turn 2 Remaining Budget: $" + turn2Result.next_state.remaining_budget);
  console.log("Turn 2 Tree Cover Shift:", turn2Result.science_payload.esa_worldcover_shifts.tree_cover_10);
  console.log("Turn 2 Built-up Shift:", turn2Result.science_payload.esa_worldcover_shifts.built_up_50);

  console.log("\n=== Test successfully completed! ===");
}

runTest();
