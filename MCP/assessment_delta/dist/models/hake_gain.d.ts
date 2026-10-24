import { AssessmentResponses, CognitiveGainResult } from "../types.js";
export declare const ASSESSMENT_QUESTIONS: {
    id: string;
    text: string;
    minScore: number;
    maxScore: number;
}[];
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
export declare function calculateHakeGain(pre: number, post: number, maxScore?: number): number;
export declare function classifyGainBand(avgGain: number): "High Gain" | "Medium Gain" | "Low Gain" | "Zero or Negative Gain";
export declare function evaluateCognitiveDelta(sessionId: string, preResponses: AssessmentResponses, postResponses: AssessmentResponses): CognitiveGainResult;
