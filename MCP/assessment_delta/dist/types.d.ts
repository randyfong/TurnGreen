import { z } from "zod";
export declare const AssessmentResponsesSchema: z.ZodObject<{
    q1_canopy_flooding: z.ZodNumber;
    q2_pavement_heat: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    q1_canopy_flooding: number;
    q2_pavement_heat: number;
}, {
    q1_canopy_flooding: number;
    q2_pavement_heat: number;
}>;
export type AssessmentResponses = z.infer<typeof AssessmentResponsesSchema>;
export declare const RecordAssessmentInputSchema: z.ZodObject<{
    session_id: z.ZodString;
    turn: z.ZodUnion<[z.ZodLiteral<0>, z.ZodLiteral<5>]>;
    responses: z.ZodObject<{
        q1_canopy_flooding: z.ZodNumber;
        q2_pavement_heat: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        q1_canopy_flooding: number;
        q2_pavement_heat: number;
    }, {
        q1_canopy_flooding: number;
        q2_pavement_heat: number;
    }>;
    prior_assessment: z.ZodOptional<z.ZodObject<{
        q1_canopy_flooding: z.ZodNumber;
        q2_pavement_heat: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        q1_canopy_flooding: number;
        q2_pavement_heat: number;
    }, {
        q1_canopy_flooding: number;
        q2_pavement_heat: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    session_id: string;
    turn: 0 | 5;
    responses: {
        q1_canopy_flooding: number;
        q2_pavement_heat: number;
    };
    prior_assessment?: {
        q1_canopy_flooding: number;
        q2_pavement_heat: number;
    } | undefined;
}, {
    session_id: string;
    turn: 0 | 5;
    responses: {
        q1_canopy_flooding: number;
        q2_pavement_heat: number;
    };
    prior_assessment?: {
        q1_canopy_flooding: number;
        q2_pavement_heat: number;
    } | undefined;
}>;
export type RecordAssessmentInput = z.infer<typeof RecordAssessmentInputSchema>;
export interface QuestionGain {
    question_id: string;
    question_text: string;
    pre_score: number;
    post_score: number;
    raw_delta: number;
    max_possible_gain: number;
    normalized_gain: number;
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
    average_normalized_gain: number;
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
