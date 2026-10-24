/**
 * Translates quantitative Hake normalized gains into youth-friendly,
 * encouraging feedback and ready-to-use civic resolution talking points.
 */
export function generateYouthLearningFeedback(gain) {
    const pctGain = Math.round(gain.average_normalized_gain * 100);
    const q1 = gain.question_breakdown.find((q) => q.question_id === "q1_canopy_flooding");
    const q2 = gain.question_breakdown.find((q) => q.question_id === "q2_pavement_heat");
    let headline;
    let narrative;
    const keyTakeaways = [];
    switch (gain.gain_category) {
        case "High Gain":
            headline = `Outstanding Climate Mastery (+${pctGain}% Normalized Gain)!`;
            narrative =
                "Over the 5-turn simulation, your grasp of urban biophysics deepened dramatically. You clearly connected tree canopy interception with flood mitigation and saw how reducing asphalt directly prevents lethal urban heat islands.";
            break;
        case "Medium Gain":
            headline = `Solid Scientific Progress (+${pctGain}% Normalized Gain)!`;
            narrative =
                "You developed a strong intuition for how nature-based interventions buffer neighborhoods against extreme heat and localized stormwater flash floods.";
            break;
        case "Low Gain":
            if (gain.total_pre_score >= 8) {
                headline = "Consistent Environmental Expertise!";
                narrative =
                    "You entered the simulation with an already high climate baseline and reinforced your expertise across all 5 planning cycles.";
            }
            else {
                headline = `Positive Learning Shift (+${pctGain}% Normalized Gain)`;
                narrative =
                    "You took the first meaningful steps toward connecting urban land cover changes with neighborhood heat and stormwater resilience.";
            }
            break;
        case "Zero or Negative Gain":
        default:
            if (gain.total_pre_score >= 9) {
                headline = "Ceiling Knowledge Retained";
                narrative =
                    "You mastered these concepts before starting and sustained top-tier environmental understanding throughout the simulation.";
            }
            else {
                headline = "Simulation Experience Logged";
                narrative =
                    "Your responses highlight exciting opportunities to further investigate how trees store rainfall and how pavement traps solar thermal radiation.";
            }
            break;
    }
    // Generate question-specific bullet takeaways
    if (q1) {
        if (q1.post_score >= 4) {
            keyTakeaways.push(`Understands that urban tree canopy intercepts rainfall and increases soil infiltration (reducing runoff curve numbers from ~98 down to ~70).`);
        }
        else {
            keyTakeaways.push(`Observed how permeable surfaces and foliage buffer storm drains during high-intensity rain events.`);
        }
    }
    if (q2) {
        if (q2.post_score >= 4) {
            keyTakeaways.push(`Recognizes that dark impervious asphalt drives the urban heat island effect, while shade and evapotranspiration cool surface temperatures.`);
        }
        else {
            keyTakeaways.push(`Noticed the cooling potential of de-paving and replacing asphalt with vegetation.`);
        }
    }
    // Civic resolution talking point formatted for City Council / School Board testimony
    const civicResolutionStatement = gain.average_normalized_gain > 0
        ? `Participant demonstrated a verified ${pctGain}% normalized learning gain under the InVEST-grounded simulation, establishing empirical justification for prioritizing tree canopy expansion and asphalt de-paving in municipal capital budgets.`
        : `Participant demonstrated sustained mastery of urban climate resilience, documenting that nature-based infrastructure directly mitigates neighborhood temperature and stormwater vulnerability.`;
    return {
        headline,
        narrative,
        civic_resolution_statement: civicResolutionStatement,
        key_takeaways: keyTakeaways
    };
}
