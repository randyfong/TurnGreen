import { z } from "zod";

export const AssessmentResponsesSchema = z.object({
  q1_canopy_flooding: z
    .number()
    .min(1, "Score must be at least 1")
    .max(5, "Score must be at most 5")
    .describe("Impact score (1-5) for: How much impact does neighborhood tree canopy have on local street flooding?"),
  q2_pavement_heat: z
    .number()
    .min(1, "Score must be at least 1")
    .max(5, "Score must be at most 5")
    .describe("Impact score (1-5) for: How much impact does asphalt pavement have on neighborhood heatwaves?")
});

export type AssessmentResponses = z.infer<typeof AssessmentResponsesSchema>;

export const RecordAssessmentInputSchema = z.object({
  session_id: z
    .string()
    .min(1, "Session ID must be non-empty")
    .describe("Anonymous session identifier isolated from PII for FERPA / student privacy compliance"),
  turn: z
    .union([z.literal(0), z.literal(5)])
    .describe("Turn number: 0 for pre-simulation baseline, 5 for post-simulation evaluation"),
  responses: AssessmentResponsesSchema,
  prior_assessment: AssessmentResponsesSchema.optional().describe(
    "Optional pre-assessment baseline passed from client to support fully stateless operation"
  )
});

export type RecordAssessmentInput = z.infer<typeof RecordAssessmentInputSchema>;

export interface QuestionGain {
  question_id: string;
  question_text: string;
  pre_score: number;
  post_score: number;
  raw_delta: number;
  max_possible_gain: number;
  normalized_gain: number; // Hake's g (0 for ceiling)
  gain_type?: "standard" | "ceiling_effect";
}

export interface CognitiveGainResult {
  session_id: string;
  assessment_completed: boolean;
  pre_turn: number;
  post_turn: number;
  total_pre_score: number;
  total_post_score: number;
  total_raw_delta: number;
  max_possible_gain: number;
  average_normalized_gain: number; // Overall Hake's g (0 to 1, or 0.0 for ceiling)
  gain_type: "standard" | "ceiling_effect";
  gain_category: "High Gain" | "Medium Gain" | "Low Gain" | "Zero or Negative Gain" | "Ceiling Effect";
  gain_explanation?: string;
  question_breakdown: QuestionGain[];
}

export interface YouthLearningFeedback {
  headline: string;
  narrative: string;
  civic_resolution_statement: string;
  key_takeaways: string[];
}

export interface AssessmentRecordResponse {
  status: "recorded" | "completed";
  turn: 0 | 5;
  session_id: string;
  message: string;
  baseline_recorded?: AssessmentResponses;
  learning_gain?: CognitiveGainResult;
  youth_feedback?: YouthLearningFeedback;
  privacy_compliance: {
    framework: "FERPA / COPPA Minimalist Local Memory";
    pii_retained: false;
    data_retention: "Ephemeral in-memory local state session";
  };
}
