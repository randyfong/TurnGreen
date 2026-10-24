export const ASSESSMENT_QUESTIONS = [
    {
        id: "q1_canopy_flooding",
        text: "How much impact does neighborhood tree canopy have on local street flooding?",
        minScore: 1,
        maxScore: 5
    },
    {
        id: "q2_pavement_heat",
        text: "How much impact does asphalt pavement have on neighborhood heatwaves?",
        minScore: 1,
        maxScore: 5
    }
];
/**
 * Calculates Hake's Normalized Learning Gain (g)
 * Formula: g = (Post - Pre) / (MaxPossible - Pre)
 *
 * Literature Standards (Hake, R. R., 1998):
 * - High Gain: g >= 0.70
 * - Medium Gain: 0.30 <= g < 0.70
 * - Low Gain: 0.0 < g < 0.30
 * - Zero/Negative: g <= 0.0
 */
/**
 * Calculates Hake's Normalized Learning Gain (g)
 * Formula: g = (Post - Pre) / (MaxPossible - Pre)
 *
 * Literature Standards (Hake, R. R., 1998):
 * - High Gain: g >= 0.70
 * - Medium Gain: 0.30 <= g < 0.70
 * - Low Gain: 0.0 < g < 0.30
 * - Zero/Negative: g <= 0.0
 *
 * When pre == maxScore, there is no measurable room for improvement (ceiling effect).
 */
export function calculateHakeGain(pre, post, maxScore = 5) {
    if (pre >= maxScore) {
        // If student already started at maximum score:
        // If post is also at maximum, raw delta is 0 and possible gain is 0 -> ceiling effect (gain 0.0)
        // If post declined, report negative gain relative to (maxScore - 1)
        if (post >= maxScore) {
            return { g: 0.0, isCeiling: true };
        }
        return { g: Number(((post - pre) / (maxScore - 1)).toFixed(3)), isCeiling: false };
    }
    const maxPossibleGain = maxScore - pre;
    const actualGain = post - pre;
    const g = actualGain / maxPossibleGain;
    return { g: Number(g.toFixed(3)), isCeiling: false };
}
export function classifyGainBand(avgGain, isCeiling = false) {
    if (isCeiling)
        return "Ceiling Effect";
    if (avgGain >= 0.7)
        return "High Gain";
    if (avgGain >= 0.3)
        return "Medium Gain";
    if (avgGain > 0)
        return "Low Gain";
    return "Zero or Negative Gain";
}
export function evaluateCognitiveDelta(sessionId, preResponses, postResponses) {
    const breakdown = [];
    let totalPre = 0;
    let totalPost = 0;
    let totalMaxGain = 0;
    for (const q of ASSESSMENT_QUESTIONS) {
        const qKey = q.id;
        const preScore = preResponses[qKey];
        const postScore = postResponses[qKey];
        const rawDelta = postScore - preScore;
        const maxGain = Math.max(0, q.maxScore - preScore);
        const { g, isCeiling } = calculateHakeGain(preScore, postScore, q.maxScore);
        totalPre += preScore;
        totalPost += postScore;
        totalMaxGain += maxGain;
        breakdown.push({
            question_id: q.id,
            question_text: q.text,
            pre_score: preScore,
            post_score: postScore,
            raw_delta: rawDelta,
            max_possible_gain: maxGain,
            normalized_gain: g,
            gain_type: isCeiling ? "ceiling_effect" : "standard"
        });
    }
    const totalRawDelta = totalPost - totalPre;
    const totalMaxScore = ASSESSMENT_QUESTIONS.length * 5;
    let overallGain;
    let isOverallCeiling = false;
    let gainExplanation;
    if (totalPre >= totalMaxScore && totalPost >= totalMaxScore) {
        // Both baseline and post are at maximum possible scores
        overallGain = 0.0;
        isOverallCeiling = true;
        gainExplanation = "Mastery at baseline; ceiling reached. Zero raw change and zero measurable room for gain.";
    }
    else if (totalMaxGain === 0) {
        overallGain = 0.0;
        isOverallCeiling = true;
        gainExplanation = "Mastery at baseline; ceiling reached.";
    }
    else {
        overallGain = Number((totalRawDelta / totalMaxGain).toFixed(3));
        gainExplanation = undefined;
    }
    return {
        session_id: sessionId,
        assessment_completed: true,
        pre_turn: 0,
        post_turn: 5,
        total_pre_score: totalPre,
        total_post_score: totalPost,
        total_raw_delta: totalRawDelta,
        max_possible_gain: totalMaxGain,
        average_normalized_gain: overallGain,
        gain_type: isOverallCeiling ? "ceiling_effect" : "standard",
        gain_category: classifyGainBand(overallGain, isOverallCeiling),
        ...(gainExplanation ? { gain_explanation: gainExplanation } : {}),
        question_breakdown: breakdown
    };
}
