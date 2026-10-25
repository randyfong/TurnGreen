import { executeSimulation } from "../MCP/simulate_policy_turn/src/index.js";
import { executeRecordAssessment } from "../MCP/assessment_delta/src/index.js";
import { executeGenerateYouthResolution } from "../MCP/resolution_generator/src/index.js";

function runEdgeCaseVerification() {
  console.log("================================================================================");
  console.log("            TURNGREEN EDGE CASE & BIOPHYSICAL FIDELITY VERIFICATION             ");
  console.log("================================================================================\n");

  let allPassed = true;

  // ---------------------------------------------------------------------------
  // Edge Case 1: 5/5 -> 5/5 Assessment (Ceiling Effect)
  // ---------------------------------------------------------------------------
  console.log("--> [Edge Case 1] Verifying 5/5 -> 5/5 assessment does NOT report 100% gain...");
  try {
    const ceilingResult = executeRecordAssessment({
      session_id: "edge-ceiling-session",
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

    const gain = ceilingResult.learning_gain?.average_normalized_gain;
    const gainType = ceilingResult.learning_gain?.gain_type;
    const gainCategory = ceilingResult.learning_gain?.gain_category;
    const explanation = ceilingResult.learning_gain?.gain_explanation;

    console.log(`    Observed average_normalized_gain: ${gain}`);
    console.log(`    Observed gain_type: ${gainType}`);
    console.log(`    Observed gain_category: ${gainCategory}`);
    console.log(`    Observed explanation: "${explanation}"`);

    if (gain === 1.0 || gain === 1) {
      console.error("FAIL: 5/5 -> 5/5 incorrectly reported 1.0 (100%) gain!");
      allPassed = false;
    } else if (gain === 0.0 && gainType === "ceiling_effect" && gainCategory === "Ceiling Effect") {
      console.log("    [PASS] Correctly handled ceiling effect (normalized_gain = 0.0, gain_type = 'ceiling_effect').\n");
    } else {
      console.error(`FAIL: Unexpected ceiling response: gain=${gain}, type=${gainType}`);
      allPassed = false;
    }
  } catch (err: any) {
    console.error("FAIL: Exception during ceiling test:", err);
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // Edge Case 2: Turn 5 assessment without baseline
  // ---------------------------------------------------------------------------
  console.log("--> [Edge Case 2] Verifying Turn 5 assessment without baseline returns clean error...");
  try {
    executeRecordAssessment({
      session_id: "unrecorded-session-" + Date.now(),
      turn: 5,
      responses: {
        q1_canopy_flooding: 4,
        q2_pavement_heat: 4
      }
    });
    console.error("FAIL: Turn 5 assessment succeeded without baseline!");
    allPassed = false;
  } catch (err: any) {
    const message = err.message || String(err);
    console.log(`    Caught expected error message: "${message}"`);
    if (message.includes("Baseline assessment required before calculating learning gain")) {
      console.log("    [PASS] Clean validation error thrown for missing Turn 0 baseline.\n");
    } else {
      console.error("FAIL: Error caught but message did not match expected baseline requirement.");
      allPassed = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Edge Case 3: Turn 3 cool roof -> Turn 4 next turn albedo persistence
  // ---------------------------------------------------------------------------
  console.log("--> [Edge Case 3] Verifying Turn 3 cool roof albedo persists into Turn 4...");
  const baseLandCover = {
    tree_cover_10: 10,
    shrubland_20: 0,
    grassland_30: 10,
    cropland_40: 0,
    built_up_50: 75,
    bare_soil_60: 5,
    water_80: 0
  };

  // Turn 1: Trees
  const t1 = executeSimulation({
    turn: 1,
    intervention_id: "urban_canopy_trees",
    budget_allocated: 50000,
    current_state: {
      total_area_hectares: 50,
      remaining_budget: 300000,
      roof_treatment_hectares: 0,
      land_cover: baseLandCover
    }
  });

  // Turn 2: Permeable Pavement
  const t2 = executeSimulation({
    turn: 2,
    intervention_id: "permeable_pavement",
    budget_allocated: 40000,
    current_state: t1.next_state
  });

  // Turn 3: Cool Roofs ($45,000)
  const t3 = executeSimulation({
    turn: 3,
    intervention_id: "cool_roofs",
    budget_allocated: 45000,
    current_state: t2.next_state
  });

  const t3PriorAlbedo = t3.science_payload.invest_urban_cooling.effective_albedo.prior;
  const t3PostAlbedo = t3.science_payload.invest_urban_cooling.effective_albedo.post;
  const t3RoofsHa = t3.next_state.roof_treatment_hectares;
  console.log(`    Turn 3 Cool Roofs: Prior albedo = ${t3PriorAlbedo} -> Post albedo = ${t3PostAlbedo}`);
  console.log(`    Turn 3 next_state.roof_treatment_hectares = ${t3RoofsHa} ha`);

  // Turn 4: Bioswales ($26,000) - different intervention
  const t4 = executeSimulation({
    turn: 4,
    intervention_id: "bioswales",
    budget_allocated: 26000,
    current_state: t3.next_state
  });

  const t4PriorAlbedo = t4.science_payload.invest_urban_cooling.effective_albedo.prior;
  const t4RoofsHa = t4.next_state.roof_treatment_hectares;
  console.log(`    Turn 4 Bioswales:  Prior albedo = ${t4PriorAlbedo} (expected = ${t3PostAlbedo})`);
  console.log(`    Turn 4 next_state.roof_treatment_hectares = ${t4RoofsHa} ha`);

  if (t4PriorAlbedo === t3PostAlbedo && t4PriorAlbedo > 0.158) {
    console.log(`    [PASS] Albedo boost (${t4PriorAlbedo}) successfully persisted into Turn 4!`);
  } else {
    console.error(`FAIL: Albedo reset! Expected ${t3PostAlbedo}, got ${t4PriorAlbedo}`);
    allPassed = false;
  }

  if (t4RoofsHa === t3RoofsHa && (t4RoofsHa ?? 0) > 0) {
    console.log(`    [PASS] Cumulative roof treatment area (${t4RoofsHa} ha) successfully preserved.\n`);
  } else {
    console.error(`FAIL: roof_treatment_hectares was lost! Expected ${t3RoofsHa}, got ${t4RoofsHa}`);
    allPassed = false;
  }

  // ---------------------------------------------------------------------------
  // Edge Case 4: Resolution Generation fidelity & un-inflated numbers
  // ---------------------------------------------------------------------------
  console.log("--> [Edge Case 4] Verifying resolution output: realistic runoff, correct net de-paving, no hallucinations...");
  // Complete Turn 5 to have a realistic 5-turn history
  const t5 = executeSimulation({
    turn: 5,
    intervention_id: "pocket_parks",
    budget_allocated: 38000,
    current_state: t4.next_state
  });

  const turnsPlayed = [
    {
      turn: 1,
      intervention_id: "urban_canopy_trees" as const,
      intervention_name: t1.intervention.name,
      budget_allocated: t1.intervention.budget_allocated,
      area_converted_ha: t1.intervention.area_converted_hectares,
      surface_temp_drop_celsius: t1.science_payload.invest_urban_cooling.surface_temp_drop_celsius,
      runoff_retained_m3: t1.science_payload.invest_urban_flood.stormwater_retained_m3
    },
    {
      turn: 2,
      intervention_id: "permeable_pavement" as const,
      intervention_name: t2.intervention.name,
      budget_allocated: t2.intervention.budget_allocated,
      area_converted_ha: t2.intervention.area_converted_hectares,
      surface_temp_drop_celsius: t2.science_payload.invest_urban_cooling.surface_temp_drop_celsius,
      runoff_retained_m3: t2.science_payload.invest_urban_flood.stormwater_retained_m3
    },
    {
      turn: 3,
      intervention_id: "cool_roofs" as const,
      intervention_name: t3.intervention.name,
      budget_allocated: t3.intervention.budget_allocated,
      area_converted_ha: t3.intervention.area_converted_hectares,
      surface_temp_drop_celsius: t3.science_payload.invest_urban_cooling.surface_temp_drop_celsius,
      runoff_retained_m3: t3.science_payload.invest_urban_flood.stormwater_retained_m3
    },
    {
      turn: 4,
      intervention_id: "bioswales" as const,
      intervention_name: t4.intervention.name,
      budget_allocated: t4.intervention.budget_allocated,
      area_converted_ha: t4.intervention.area_converted_hectares,
      surface_temp_drop_celsius: t4.science_payload.invest_urban_cooling.surface_temp_drop_celsius,
      runoff_retained_m3: t4.science_payload.invest_urban_flood.stormwater_retained_m3
    },
    {
      turn: 5,
      intervention_id: "pocket_parks" as const,
      intervention_name: t5.intervention.name,
      budget_allocated: t5.intervention.budget_allocated,
      area_converted_ha: t5.intervention.area_converted_hectares,
      surface_temp_drop_celsius: t5.science_payload.invest_urban_cooling.surface_temp_drop_celsius,
      runoff_retained_m3: t5.science_payload.invest_urban_flood.stormwater_retained_m3
    }
  ];

  const resolutionOutput = executeGenerateYouthResolution({
    author_name: "Amara Patel",
    district_name: "District 4 - Metro Valley",
    target_body: "City Council",
    session_history: {
      session_id: "edge-test-session",
      turns: turnsPlayed
    }
  });

  const scorecard = resolutionOutput.biophysical_scorecard;
  const markdown = resolutionOutput.resolution_markdown;
  const points = resolutionOutput.talking_points;

  console.log(`    Scorecard Stormwater Retained: ${scorecard.total_stormwater_retained_m3} m³ (${scorecard.total_stormwater_retained_gallons} gal)`);
  console.log(`    Ground de-paved: ${scorecard.ground_depaved_ha} ha`);
  console.log(`    Rooftop treated: ${scorecard.rooftop_treated_ha} ha`);

  // Check 4a: Runoff numbers are single-storm / peak, not summed 5 times into >70,000+ m³
  const sumOfTurnsRunoff = turnsPlayed.reduce((acc, t) => acc + (t.runoff_retained_m3 ?? 0), 0);
  console.log(`    Sum of all 5 snapshot storms = ${sumOfTurnsRunoff.toFixed(1)} m³`);

  if (scorecard.total_stormwater_retained_m3 < sumOfTurnsRunoff && scorecard.total_stormwater_retained_m3 <= 25000) {
    console.log(`    [PASS] Runoff retained is realistic single-storm volume (${scorecard.total_stormwater_retained_m3} m³), NOT summed across turns (${sumOfTurnsRunoff.toFixed(1)} m³).`);
  } else {
    console.error(`FAIL: Runoff volume appears to be summed across turns: ${scorecard.total_stormwater_retained_m3}`);
    allPassed = false;
  }

  // Check 4b: Ground de-paved and rooftop treated are separated
  if (scorecard.ground_depaved_ha > 0 && scorecard.rooftop_treated_ha > 0) {
    console.log(`    [PASS] Distinction preserved: ${scorecard.ground_depaved_ha} ha ground de-paved vs ${scorecard.rooftop_treated_ha} ha rooftop retrofits.`);
  } else {
    console.error("FAIL: Ground and rooftop areas not properly separated in scorecard.");
    allPassed = false;
  }

  // Check 4c: Unique asphalt de-paving fidelity (ground_depaved_ha <= net built-up reduction)
  // Bare-soil conversion and gross overlapping work must NOT be counted as unique asphalt removal
  const baselineBuiltUpPct = baseLandCover.built_up_50; // 75%
  const finalBuiltUpPct = t5.next_state.land_cover.built_up_50;
  const netBuiltUpReductionHa = Number((((baselineBuiltUpPct - finalBuiltUpPct) / 100) * 50).toFixed(2));
  const grossGroundWorkHa = turnsPlayed
    .filter((t) => t.intervention_id !== "cool_roofs" && t.intervention_id !== "green_roofs")
    .reduce((acc, t) => acc + (t.area_converted_ha ?? 0), 0);

  console.log(`    Built-up shift: ${baselineBuiltUpPct}% -> ${finalBuiltUpPct}% (Net Built-up Reduction: ${netBuiltUpReductionHa} ha)`);
  console.log(`    Gross Ground Interventions: ${grossGroundWorkHa.toFixed(2)} ha`);
  console.log(`    Scorecard Ground De-Paved: ${scorecard.ground_depaved_ha} ha`);

  if (scorecard.ground_depaved_ha <= netBuiltUpReductionHa && scorecard.ground_depaved_ha < grossGroundWorkHa) {
    console.log(`    [PASS] Ground de-paved (${scorecard.ground_depaved_ha} ha) <= Net Built-up Reduction (${netBuiltUpReductionHa} ha) and strictly less than gross ground footprint (${grossGroundWorkHa.toFixed(2)} ha). No bare-soil inflation.`);
  } else {
    console.error(`FAIL: Ground de-paved (${scorecard.ground_depaved_ha} ha) exceeds net built-up reduction (${netBuiltUpReductionHa} ha) or inflates gross ground work (${grossGroundWorkHa} ha).`);
    allPassed = false;
  }

  // Check 4c: No hallucinated assertions in markdown or talking points
  const hallucinationStrings = [
    "$3.40",
    "3.40 per $1",
    "100-meter cooling buffer",
    "100 meter cooling",
    "Youth Environmental Action Committee",
    "asthma admissions"
  ];

  let foundHallucination = false;
  for (const phrase of hallucinationStrings) {
    if (markdown.includes(phrase)) {
      console.error(`FAIL: Found unsupported text "${phrase}" in markdown!`);
      foundHallucination = true;
    }
    for (const pt of points) {
      if (pt.recommended_script.includes(phrase) || pt.hook.includes(phrase)) {
        console.error(`FAIL: Found unsupported text "${phrase}" in talking points!`);
        foundHallucination = true;
      }
    }
  }

  if (!foundHallucination) {
    console.log("    [PASS] Verified zero hallucinated economic ($3.40/$1), fictitious health, or buffer claims.");
  } else {
    allPassed = false;
  }

  // Check 4d: Defaults to player's district when org is omitted
  if (resolutionOutput.organization_or_school === "Youth Climate Delegates of District 4 - Metro Valley") {
    console.log(`    [PASS] Graceful delegation naming: "${resolutionOutput.organization_or_school}".\n`);
  } else {
    console.error(`FAIL: Unexpected organization text: ${resolutionOutput.organization_or_school}`);
    allPassed = false;
  }

  console.log("================================================================================");
  if (allPassed) {
    console.log("          ALL 4 EDGE CASES VERIFIED & STRICTLY PASSING CONSTRAINTS!             ");
  } else {
    console.error("                  SOME EDGE CASE ASSERTIONS FAILED!                           ");
  }
  console.log("================================================================================");
}

runEdgeCaseVerification();
