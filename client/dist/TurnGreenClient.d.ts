import type { NeighborhoodState, InterventionType, SimulationResult, LandCoverDistribution } from "../../MCP/simulate_policy_turn/dist/types.js";
import type { AssessmentResponses, AssessmentRecordResponse } from "../../MCP/assessment_delta/dist/types.js";
import type { YouthResolutionDocument, TurnRecord } from "../../MCP/resolution_generator/dist/types.js";
export declare class ValidationError extends Error {
    field?: string;
    details?: unknown;
    constructor(message: string, field?: string, details?: unknown);
}
export interface ClientTurnInput {
    turn: number;
    intervention_id: InterventionType;
    budget_allocated: number;
}
export interface ClientSessionConfig {
    session_id?: string;
    total_area_hectares?: number;
    initial_budget?: number;
    initial_land_cover?: LandCoverDistribution;
    author_name?: string;
    district_name?: string;
    organization_or_school?: string;
    target_body?: "City Council" | "School Board" | "Planning Commission" | "County Board of Supervisors" | "Parks & Recreation Commission";
}
/**
 * Pre-Flight Budget Validation:
 * Validates budget allocation before calling simulate_policy_turn so player cannot submit
 * a turn where budget_allocated > remaining_budget.
 */
export declare function validateTurnBudget(budget_allocated: number, remaining_budget: number): void;
/**
 * TurnGreenClientSession
 * Manages player session state on client side:
 * 1. Stores Turn 0 prior_assessment in client session state and forwards it with Turn 5 post-assessment.
 * 2. Enforces pre-flight budget validation before dispatching turn simulation requests.
 * 3. Records simulation turn history, coordinates assessment scoring, and compiles final youth resolution.
 */
export declare class TurnGreenClientSession {
    readonly sessionId: string;
    authorName: string;
    districtName: string;
    organizationOrSchool?: string;
    targetBody: "City Council" | "School Board" | "Planning Commission" | "County Board of Supervisors" | "Parks & Recreation Commission";
    private priorAssessment;
    private postAssessment;
    private learningGainResult;
    private currentState;
    private initialLandCover;
    private turnsPlayed;
    private currentTurnNumber;
    constructor(config?: ClientSessionConfig);
    getSessionId(): string;
    getCurrentState(): Readonly<NeighborhoodState>;
    getRemainingBudget(): number;
    getCurrentTurn(): number;
    getPriorAssessment(): Readonly<AssessmentResponses> | null;
    getPostAssessment(): Readonly<AssessmentResponses> | null;
    getTurnsPlayed(): ReadonlyArray<TurnRecord>;
    /**
     * Pre-simulation Turn 0 Assessment:
     * Stores prior_assessment in client session state and records baseline with assessment_delta.
     */
    recordPreAssessment(responses: AssessmentResponses): AssessmentRecordResponse;
    /**
     * Post-simulation Turn 5 Assessment:
     * Forwards client-stored prior_assessment along with Turn 5 responses.
     * Throws ValidationError if prior_assessment is missing in client session state.
     */
    recordPostAssessment(responses: AssessmentResponses): AssessmentRecordResponse;
    /**
     * Pre-Flight Validation & Simulation Turn Execution:
     * 1. Validates turn sequencing (must be turn + 1).
     * 2. Validates budget input so player cannot submit a turn with budget_allocated > remaining_budget.
     * 3. Dispatches simulation, updates client state, and records turn record for resolution compiler.
     */
    submitTurn(input: ClientTurnInput): SimulationResult;
    /**
     * Compiles the 1-page Youth Community Planning Resolution from the 5-turn session history.
     */
    generateResolution(options?: {
        author_name?: string;
        district_name?: string;
        organization_or_school?: string;
        target_body?: "City Council" | "School Board" | "Planning Commission" | "County Board of Supervisors" | "Parks & Recreation Commission";
    }): YouthResolutionDocument;
}
