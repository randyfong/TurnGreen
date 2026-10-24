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
export const RecordAssessmentInputSchema = z.object({
    session_id: z
        .string()
        .min(1, "Session ID must be non-empty")
        .describe("Anonymous session identifier isolated from PII for FERPA / student privacy compliance"),
    turn: z
        .union([z.literal(0), z.literal(5)])
        .describe("Turn number: 0 for pre-simulation baseline, 5 for post-simulation evaluation"),
    responses: AssessmentResponsesSchema,
    prior_assessment: AssessmentResponsesSchema.optional().describe("Optional pre-assessment baseline passed from client to support fully stateless operation")
});
