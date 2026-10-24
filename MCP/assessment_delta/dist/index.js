import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { evaluateCognitiveDelta } from "./models/hake_gain.js";
import { sessionStore } from "./store/session_store.js";
import { generateYouthLearningFeedback } from "./translators/youth_feedback.js";
import { RecordAssessmentInputSchema } from "./types.js";
const RECORD_ASSESSMENT_SCORE_TOOL = {
    name: "record_assessment_score",
    description: "Records player rating scores for pre-simulation (Turn 0) and post-simulation (Turn 5) micro-assessments on a 5-point Likert scale. Calculates normalized cognitive learning gains (Hake's g) without sending personal student data to third parties, ensuring strict FERPA/COPPA student privacy compliance via isolated in-memory session management.",
    inputSchema: {
        type: "object",
        properties: {
            session_id: {
                type: "string",
                description: "Anonymous player or classroom session identifier (UUID or pseudo-random string without PII)"
            },
            turn: {
                type: "integer",
                enum: [0, 5],
                description: "0 for pre-simulation baseline assessment, 5 for post-simulation completion assessment"
            },
            responses: {
                type: "object",
                description: "5-point Likert slider ratings (1 = Minimal impact, 5 = Decisive impact)",
                properties: {
                    q1_canopy_flooding: {
                        type: "number",
                        minimum: 1,
                        maximum: 5,
                        description: "Rating for: How much impact does neighborhood tree canopy have on local street flooding?"
                    },
                    q2_pavement_heat: {
                        type: "number",
                        minimum: 1,
                        maximum: 5,
                        description: "Rating for: How much impact does asphalt pavement have on neighborhood heatwaves?"
                    }
                },
                required: ["q1_canopy_flooding", "q2_pavement_heat"]
            },
            prior_assessment: {
                type: "object",
                description: "Optional client-passed baseline assessment (enables completely stateless evaluation if preferred by client)",
                properties: {
                    q1_canopy_flooding: { type: "number", minimum: 1, maximum: 5 },
                    q2_pavement_heat: { type: "number", minimum: 1, maximum: 5 }
                },
                required: ["q1_canopy_flooding", "q2_pavement_heat"]
            }
        },
        required: ["session_id", "turn", "responses"]
    }
};
export function executeRecordAssessment(inputRaw) {
    const parsed = RecordAssessmentInputSchema.parse(inputRaw);
    const { session_id, turn, responses, prior_assessment } = parsed;
    if (turn === 0) {
        // Record baseline in isolated in-memory store
        sessionStore.savePreAssessment(session_id, responses);
        return {
            status: "recorded",
            turn: 0,
            session_id,
            message: "Baseline Turn 0 assessment successfully recorded in FERPA-isolated session store. Ready for Turn 1 simulation.",
            baseline_recorded: responses,
            privacy_compliance: {
                framework: "FERPA / COPPA Minimalist Local Memory",
                pii_retained: false,
                data_retention: "Ephemeral in-memory local state session"
            }
        };
    }
    // Turn 5: Post-simulation evaluation
    let preBaseline = prior_assessment;
    if (!preBaseline) {
        const session = sessionStore.getSession(session_id);
        preBaseline = session?.preAssessment;
    }
    if (!preBaseline) {
        // Fallback if client did not call turn 0 and did not pass prior_assessment: default baseline 1
        preBaseline = {
            q1_canopy_flooding: 1,
            q2_pavement_heat: 1
        };
    }
    // Save post assessment
    sessionStore.savePostAssessment(session_id, responses);
    // Calculate Hake's normalized gain
    const cognitiveGain = evaluateCognitiveDelta(session_id, preBaseline, responses);
    const feedback = generateYouthLearningFeedback(cognitiveGain);
    return {
        status: "completed",
        turn: 5,
        session_id,
        message: `Post-simulation assessment recorded. Normalized learning gain computed (${cognitiveGain.gain_category}: ${(cognitiveGain.average_normalized_gain * 100).toFixed(1)}%).`,
        learning_gain: cognitiveGain,
        youth_feedback: feedback,
        privacy_compliance: {
            framework: "FERPA / COPPA Minimalist Local Memory",
            pii_retained: false,
            data_retention: "Ephemeral in-memory local state session"
        }
    };
}
async function startServer() {
    const server = new Server({
        name: "assessment-delta-server",
        version: "1.0.0"
    }, {
        capabilities: {
            tools: {}
        }
    });
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [RECORD_ASSESSMENT_SCORE_TOOL]
        };
    });
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        if (request.params.name === "record_assessment_score") {
            try {
                const result = executeRecordAssessment(request.params.arguments);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            }
            catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: `Assessment error: ${errorMsg}`
                        }
                    ]
                };
            }
        }
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: `Unknown tool name: ${request.params.name}`
                }
            ]
        };
    });
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("assessment_delta MCP Server running on stdio");
}
if (process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js")) {
    startServer().catch((err) => {
        console.error("Fatal server error:", err);
        process.exit(1);
    });
}
