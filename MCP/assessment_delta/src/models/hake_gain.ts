import {
  AssessmentResponses,
  CognitiveGainResult,
  QuestionGain
} from "../types.js";

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
export function calculateHakeGain(pre: number, post: number, maxScore: number = 5): number {
  if (pre >= maxScore) {
    // If student already started at maximum score and stayed at maximum score
    return post >= maxScore ? 1.0 : (post - pre) / (maxScore - 1);
  }
  const maxPossibleGain = maxScore - pre;
  const actualGain = post - pre;
  const g = actualGain / maxPossibleGain;
  // Round to 3 decimal places
  return Number(g.toFixed(3));
}

export function classifyGainBand(
  avgGain: number
): "High Gain" | "Medium Gain" | "Low Gain" | "Zero or Negative Gain" {
  if (avgGain >= 0.7) return "High Gain";
  if (avgGain >= 0.3) return "Medium Gain";
  if (avgGain > 0) return "Low Gain";
  return "Zero or Negative Gain";
}

export function evaluateCognitiveDelta(
  sessionId: string,
  preResponses: AssessmentResponses,
  postResponses: AssessmentResponses
): CognitiveGainResult {
  const breakdown: QuestionGain[] = [];
  let totalPre = 0;
  let totalPost = 0;
  let totalMaxGain = 0;

  for (const q of ASSESSMENT_QUESTIONS) {
    const qKey = q.id as keyof AssessmentResponses;
    const preScore = preResponses[qKey];
    const postScore = postResponses[qKey];
    const rawDelta = postScore - preScore;
    const maxGain = q.maxScore - preScore;
    const g = calculateHakeGain(preScore, postScore, q.maxScore);

    totalPre += preScore;
    totalPost += postScore;
    totalMaxGain += Math.max(0, maxGain);

    breakdown.push({
      question_id: q.id,
      question_text: q.text,
      pre_score: preScore,
      post_score: postScore,
      raw_delta: rawDelta,
      max_possible_gain: maxGain,
      normalized_gain: g
    });
  }

  const totalRawDelta = totalPost - totalPre;
  const totalMaxScore = ASSESSMENT_QUESTIONS.length * 5;

  let overallGain: number;
  if (totalPre >= totalMaxScore) {
    overallGain = totalPost >= totalMaxScore ? 1.0 : (totalPost - totalPre) / (totalMaxScore - 2);
  } else if (totalMaxGain === 0) {
    overallGain = 1.0;
  } else {
    overallGain = Number((totalRawDelta / totalMaxGain).toFixed(3));
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
    gain_category: classifyGainBand(overallGain),
    question_breakdown: breakdown
  };
}
