import { executeSimulation, executeYearPlanSimulation } from "../../MCP/simulate_policy_turn/dist/index.js";
import { executeRecordAssessment } from "../../MCP/assessment_delta/dist/index.js";
import { executeGenerateYouthResolution } from "../../MCP/resolution_generator/dist/index.js";
import {
  parseMCPResponse,
  wrapMCPToolCallSync,
  MCPResponseError
} from "./mcpResponseParser.js";
import type { MCPCallToolResponse } from "./mcpResponseParser.js";
import type {
  NeighborhoodState,
  InterventionType,
  SimulationResult,
  YearPlanProject,
  YearPlanSimulationResult,
  LandCoverDistribution
} from "../../MCP/simulate_policy_turn/dist/types.js";
import type {
  AssessmentResponses,
  AssessmentRecordResponse
} from "../../MCP/assessment_delta/dist/types.js";
import type {
  YouthResolutionDocument,
  TurnRecord,
  SessionHistory
} from "../../MCP/resolution_generator/dist/types.js";

export { parseMCPResponse, wrapMCPToolCallSync, MCPResponseError };
export type { MCPCallToolResponse };



export class ValidationError extends Error {
  public field?: string;
  public details?: unknown;

  constructor(message: string, field?: string, details?: unknown) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.details = details;
  }
}


export interface ClientTurnInput {
  turn: number;
  intervention_id: InterventionType;
  budget_allocated: number;
}

export type PolicyTurnInput = ClientTurnInput;

export interface ClientSessionConfig {
  session_id?: string;
  total_area_hectares?: number;
  initial_budget?: number;
  initial_coins?: number;
  budget_currency?: "coins" | "usd";
  initial_land_cover?: LandCoverDistribution;
  author_name?: string;
  district_name?: string;
  organization_or_school?: string;
  target_body?:
    | "City Council"
    | "School Board"
    | "Planning Commission"
    | "County Board of Supervisors"
    | "Parks & Recreation Commission";
}

/**
 * Pre-Flight Budget Validation:
 * Validates budget allocation before calling simulate_policy_turn or simulate_year_plan so player cannot submit
 * a turn or plan where budget_allocated > remaining_budget or exceeds session cap.
 */
export function validateTurnBudget(
  budget_allocated: number,
  remaining_budget: number,
  currency?: "coins" | "usd",
  options?: {
    already_allocated?: number;
    max_budget?: number;
  }
): void {
  const mode = currency ?? (remaining_budget > 500 ? "usd" : "coins");
  const sym = mode === "coins" ? "🪙" : "$";
  if (typeof budget_allocated !== "number" || isNaN(budget_allocated)) {
    throw new ValidationError(
      `Pre-Flight Validation failed: Invalid budget input "${budget_allocated}". Must be a positive number.`,
      "budget_allocated"
    );
  }

  if (budget_allocated <= 0) {
    throw new ValidationError(
      `Pre-Flight Validation failed: Budget allocation must be greater than 0 (received: ${sym}${budget_allocated.toLocaleString()}).`,
      "budget_allocated"
    );
  }

  if (budget_allocated > remaining_budget) {
    throw new ValidationError(
      `Pre-Flight Validation failed: budget_allocated (${sym}${budget_allocated.toLocaleString()}) cannot exceed remaining_budget (${sym}${remaining_budget.toLocaleString()}).`,
      "budget_allocated",
      {
        budget_allocated,
        remaining_budget,
        deficit: budget_allocated - remaining_budget
      }
    );
  }

  // Combined Session / Annual Cap Check:
  if (options?.max_budget !== undefined) {
    const cumulative = (options.already_allocated ?? 0) + budget_allocated;
    if (cumulative > options.max_budget) {
      throw new ValidationError(
        `Pre-Flight Validation failed: Cumulative budget allocation (${sym}${cumulative.toLocaleString()}) exceeds total allowable budget (${sym}${options.max_budget.toLocaleString()}).`,
        "budget_allocated",
        {
          cumulative,
          max_budget: options.max_budget,
          deficit: cumulative - options.max_budget
        }
      );
    }
  }
}

/**
 * TurnGreenClientSession
 * Manages player session state on client side:
 * 1. Stores Turn 0 prior_assessment in client session state and forwards it with Turn 5 post-assessment.
 * 2. Enforces pre-flight budget validation before dispatching turn simulation requests.
 * 3. Records simulation turn history, coordinates assessment scoring, and compiles final youth resolution.
 */
export class TurnGreenClientSession {
  public readonly sessionId: string;
  public authorName: string;
  public districtName: string;
  public organizationOrSchool?: string;
  public targetBody:
    | "City Council"
    | "School Board"
    | "Planning Commission"
    | "County Board of Supervisors"
    | "Parks & Recreation Commission";

  private priorAssessment: AssessmentResponses | null = null;
  private postAssessment: AssessmentResponses | null = null;
  private learningGainResult: AssessmentRecordResponse["learning_gain"] | null = null;

  private currentState: NeighborhoodState;
  private initialLandCover: LandCoverDistribution;
  private initialMaxBudget: number;
  private turnsPlayed: TurnRecord[] = [];
  private currentTurnNumber: number = 0;

  constructor(config: ClientSessionConfig = {}) {
    this.sessionId = config.session_id || `turngreen-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.authorName = config.author_name || "Youth Delegate";
    this.districtName = config.district_name || "District 1 - Urban Center";
    this.organizationOrSchool = config.organization_or_school;
    this.targetBody = config.target_body || "City Council";

    this.initialLandCover = config.initial_land_cover || {
      tree_cover_10: 12,
      shrubland_20: 3,
      grassland_30: 8,
      cropland_40: 0,
      built_up_50: 72,
      bare_soil_60: 5,
      water_80: 0
    };

    // Determine currency and initial budget: default to coins with 100 coins
    let budgetCurrency: "coins" | "usd" = config.budget_currency ?? (config.initial_budget !== undefined ? "usd" : "coins");
    let startingBudget: number;
    if (config.initial_coins !== undefined) {
      startingBudget = config.initial_coins;
      budgetCurrency = "coins";
    } else if (config.initial_budget !== undefined) {
      startingBudget = config.initial_budget;
    } else {
      startingBudget = budgetCurrency === "coins" ? 100 : 200000;
    }

    this.initialMaxBudget = startingBudget;

    this.currentState = {
      total_area_hectares: config.total_area_hectares || 50,
      remaining_budget: startingBudget,
      budget_currency: budgetCurrency,
      roof_treatment_hectares: 0,
      land_cover: { ...this.initialLandCover },
      baseline_land_cover: { ...this.initialLandCover }
    };
  }

  // --- Session State Getters ---

  public getSessionId(): string {
    return this.sessionId;
  }

  public getCurrentState(): Readonly<NeighborhoodState> {
    return { ...this.currentState };
  }

  public getRemainingBudget(): number {
    return this.currentState.remaining_budget;
  }

  public getInitialMaxBudget(): number {
    return this.initialMaxBudget;
  }

  public getTotalBudgetSpent(): number {
    return this.turnsPlayed.reduce((sum, t) => sum + t.budget_allocated, 0);
  }

  public getCurrentTurn(): number {
    return this.currentTurnNumber;
  }

  public getPriorAssessment(): Readonly<AssessmentResponses> | null {
    return this.priorAssessment ? { ...this.priorAssessment } : null;
  }

  public getPostAssessment(): Readonly<AssessmentResponses> | null {
    return this.postAssessment ? { ...this.postAssessment } : null;
  }

  public getTurnsPlayed(): ReadonlyArray<TurnRecord> {
    return [...this.turnsPlayed];
  }

  public getLearningGainResult(): Readonly<AssessmentRecordResponse["learning_gain"]> | null {
    return this.learningGainResult ? { ...this.learningGainResult } : null;
  }

  /**
   * Score & Metric Mapping:
   * Maps average_normalized_gain directly from record_assessment_score into
   * generate_youth_resolution's learning_gain.normalized_gain.
   */
  public getMappedLearningGain(): SessionHistory["learning_gain"] {
    if (!this.learningGainResult) {
      return undefined;
    }
    return {
      normalized_gain: this.learningGainResult.average_normalized_gain,
      gain_category: this.learningGainResult.gain_category,
      summary: this.learningGainResult.gain_explanation || `Category: ${this.learningGainResult.gain_category}`
    };
  }


  // --- Assessment Lifecycle ---

  /**
   * Pre-simulation Turn 0 Assessment:
   * Stores prior_assessment in client session state and records baseline with assessment_delta.
   * Tool response is wrapped in MCP response contract checking isError before JSON parsing.
   */
  public recordPreAssessment(responses: AssessmentResponses): AssessmentRecordResponse {
    // 1. Store in client session state
    this.priorAssessment = { ...responses };

    // 2. Dispatch to assessment_delta tool wrapped in MCP response contract
    const result = wrapMCPToolCallSync<AssessmentRecordResponse>(() => {
      try {
        const payload = executeRecordAssessment({
          session_id: this.sessionId,
          turn: 0,
          responses: this.priorAssessment
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(payload)
            }
          ]
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: "text", text: `Assessment error: ${message}` }]
        };
      }
    });

    return result;
  }

  /**
   * Post-simulation Turn 5 Assessment:
   * Forwards client-stored prior_assessment along with Turn 5 responses.
   * Throws ValidationError if prior_assessment is missing in client session state.
   * Tool response is wrapped in MCP response contract checking isError before JSON parsing.
   */
  public recordPostAssessment(responses: AssessmentResponses): AssessmentRecordResponse {
    if (!this.priorAssessment) {
      throw new ValidationError(
        "Pre-Flight Validation failed: Cannot submit Turn 5 post-assessment without prior_assessment in client session state.",
        "prior_assessment"
      );
    }

    this.postAssessment = { ...responses };

    // Forward stored prior_assessment explicitly to ensure reliable evaluation and stateless recovery
    const result = wrapMCPToolCallSync<AssessmentRecordResponse>(() => {
      try {
        const payload = executeRecordAssessment({
          session_id: this.sessionId,
          turn: 5,
          prior_assessment: this.priorAssessment,
          responses: this.postAssessment
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(payload)
            }
          ]
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: "text", text: `Assessment error: ${message}` }]
        };
      }
    });

    this.learningGainResult = result.learning_gain || null;
    return result;
  }


  // --- Simulation Lifecycle ---

  /**
   * Pre-Flight Validation & Simulation Turn Execution:
   * 1. Validates turn sequencing (must be turn + 1).
   * 2. Validates budget input so player cannot submit a turn with budget_allocated > remaining_budget.
   * 3. Dispatches simulation, updates client state, and records turn record for resolution compiler.
   */
  public submitTurn(input: ClientTurnInput): SimulationResult {
    const expectedTurn = this.currentTurnNumber + 1;
    if (input.turn !== expectedTurn) {
      throw new ValidationError(
        `Invalid turn sequence: current turn is ${this.currentTurnNumber}, expected turn ${expectedTurn}. Received: ${input.turn}.`,
        "turn"
      );
    }

    if (input.turn > 5) {
      throw new ValidationError(
        `Pre-Flight Validation failed: Maximum simulation turns (5) reached. Simulation is complete.`,
        "turn"
      );
    }

    // Strict Pre-Flight Budget Validation:
    // Reject before calling simulate_policy_turn if allocated exceeds remaining budget or total session budget
    validateTurnBudget(
      input.budget_allocated,
      this.currentState.remaining_budget,
      this.currentState.budget_currency ?? "coins",
      {
        already_allocated: this.getTotalBudgetSpent(),
        max_budget: this.initialMaxBudget
      }
    );

    // Call simulation engine wrapped in MCP response contract
    const simResult = wrapMCPToolCallSync<SimulationResult>(() => {
      try {
        const payload = executeSimulation({
          turn: input.turn,
          intervention_id: input.intervention_id,
          budget_allocated: input.budget_allocated,
          current_state: this.currentState
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(payload)
            }
          ]
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: "text", text: `Simulation error: ${message}` }]
        };
      }
    });

    // Update client session state
    this.currentTurnNumber = input.turn;
    this.currentState = { ...simResult.next_state };

    // Record turn for civic resolution compiler
    const turnRecord: TurnRecord = {
      turn: input.turn,
      intervention_id: input.intervention_id,
      intervention_name: simResult.intervention.name,
      budget_allocated: simResult.intervention.budget_allocated,
      area_converted_ha: simResult.intervention.area_converted_hectares,
      surface_temp_drop_celsius: simResult.science_payload.invest_urban_cooling.surface_temp_drop_celsius,
      runoff_retained_m3: simResult.science_payload.invest_urban_flood.stormwater_retained_m3,
      esa_conversions: Object.fromEntries(
        Object.entries(simResult.science_payload.esa_worldcover_shifts).map(([k, v]) => [k, v.delta_pct])
      )
    };
    this.turnsPlayed.push(turnRecord);

    return simResult;
  }

  /**
   * Legacy 1-action turn simulation:
   * Alias / wrapper for submitTurn to ensure complete backwards compatibility.
   */
  public playTurn(input: PolicyTurnInput): SimulationResult {
    return this.submitTurn(input);
  }

  /**
   * Batch Year Plan Simulation:
   * Accepts a list of multiple projects/interventions to execute within a single year plan.
   * Performs pre-flight validation verifying total batch budget <= remaining_budget and cumulative spend <= max_budget.
   * Calls simulate_year_plan via MCP response contract.
   * Records individual project sub-records into turnsPlayed so resolution_generator receives all project actions.
   */
  public playYearPlan(projects: YearPlanProject[], options?: { year?: number }): YearPlanSimulationResult {
    if (!Array.isArray(projects) || projects.length === 0) {
      throw new ValidationError(
        "Pre-Flight Validation failed: projects must be a non-empty array of interventions.",
        "projects"
      );
    }

    const yearNumber = options?.year ?? Math.min(5, this.currentTurnNumber + 1);
    const sym = (this.currentState.budget_currency ?? "coins") === "coins" ? "🪙" : "$";

    // Pre-flight batch budget validation
    const totalBatchBudget = projects.reduce((sum, p) => {
      if (typeof p.budget_allocated !== "number" || isNaN(p.budget_allocated) || p.budget_allocated <= 0) {
        throw new ValidationError(
          `Pre-Flight Validation failed: Project "${p.intervention_id}" has invalid budget "${p.budget_allocated}". Must be a positive number.`,
          "budget_allocated"
        );
      }
      return sum + p.budget_allocated;
    }, 0);

    // Validate both against remaining_budget and against cumulative session budget limit
    validateTurnBudget(
      totalBatchBudget,
      this.currentState.remaining_budget,
      this.currentState.budget_currency ?? "coins",
      {
        already_allocated: this.getTotalBudgetSpent(),
        max_budget: this.initialMaxBudget
      }
    );

    // Call simulate_year_plan MCP engine wrapped in response contract
    const planResult = wrapMCPToolCallSync<YearPlanSimulationResult>(() => {
      try {
        const payload = executeYearPlanSimulation({
          year: yearNumber,
          projects,
          current_state: this.currentState
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(payload)
            }
          ]
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: "text", text: `Year plan simulation error: ${message}` }]
        };
      }
    });

    // Update client session state
    this.currentTurnNumber = yearNumber;
    this.currentState = { ...planResult.next_state };

    // Record each executed project into turnsPlayed for downstream resolution generator
    const intermediateSteps = planResult.science_payload.intermediate_steps ?? [];
    planResult.projects_executed.forEach((proj, idx) => {
      const step = intermediateSteps[idx];
      const turnRecord: TurnRecord = {
        turn: Math.min(5, this.turnsPlayed.length + 1),
        intervention_id: proj.intervention_id,
        intervention_name: proj.project_name || proj.intervention_name,
        budget_allocated: proj.budget_allocated,
        area_converted_ha: proj.area_converted_hectares,
        surface_temp_drop_celsius: step?.post_step_temp_drop_celsius ?? planResult.science_payload.invest_urban_cooling.surface_temp_drop_celsius,
        runoff_retained_m3: step?.post_step_stormwater_retained_m3 ?? planResult.science_payload.invest_urban_flood.stormwater_retained_m3,
        esa_conversions: Object.fromEntries(
          Object.entries(planResult.science_payload.cumulative_esa_worldcover_shifts).map(([k, v]) => [k, v.delta_pct])
        )
      };
      this.turnsPlayed.push(turnRecord);
    });

    return planResult;
  }

  // --- Civic Resolution Generation ---

  /**
   * Compiles the 1-page Youth Community Planning Resolution from the 5-turn session history.
   * Wrapped in MCP response contract checking isError before JSON parsing.
   */
  public generateResolution(options: {
    author_name?: string;
    district_name?: string;
    organization_or_school?: string;
    target_body?:
      | "City Council"
      | "School Board"
      | "Planning Commission"
      | "County Board of Supervisors"
      | "Parks & Recreation Commission";
  } = {}): YouthResolutionDocument {
    if (this.turnsPlayed.length === 0) {
      throw new ValidationError("Cannot generate resolution: No simulation turns have been played yet.");
    }

    const sessionHistory: SessionHistory = {
      session_id: this.sessionId,
      turns: this.turnsPlayed,
      baseline: {
        built_up_pct: this.initialLandCover.built_up_50,
        tree_cover_pct: this.initialLandCover.tree_cover_10,
        grassland_pct: this.initialLandCover.grassland_30,
        shrubland_pct: this.initialLandCover.shrubland_20,
        bare_soil_pct: this.initialLandCover.bare_soil_60
      },
      // Score & Metric Mapping: Maps average_normalized_gain directly to learning_gain.normalized_gain
      learning_gain: this.getMappedLearningGain()
    };


    return wrapMCPToolCallSync<YouthResolutionDocument>(() => {
      try {
        const payload = executeGenerateYouthResolution({
          author_name: options.author_name || this.authorName,
          district_name: options.district_name || this.districtName,
          organization_or_school: options.organization_or_school || this.organizationOrSchool,
          target_body: options.target_body || this.targetBody,
          session_history: sessionHistory
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(payload)
            }
          ]
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          isError: true,
          content: [{ type: "text", text: `Resolution generator error: ${message}` }]
        };
      }
    });
  }
}


