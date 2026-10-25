import { calculateDrySeasonCooling } from "./models/invest_cooling.js";
import { calculateDrySeasonFloodRisk } from "./models/invest_flood.js";
import { LandCoverDistribution, SimulationResult, YearPlanInput, YearPlanSimulationResult } from "./types.js";
export declare function executeSimulation(inputRaw: unknown): SimulationResult;
export interface AnnualDrySeasonResult {
    drySeasonCooling: ReturnType<typeof calculateDrySeasonCooling>;
    drySeasonFlood: ReturnType<typeof calculateDrySeasonFloodRisk>;
    drought_resilience_score: number;
    peak_dry_heat_surface_temp_celsius: number;
    temperature_under_dry_heat_display: string;
    drought_summary: string;
}
/**
 * Executes the annual climate dry season stress phase exactly once per year plan:
 * 1. Evaluates low precipitation (P = 10 mm) infiltration and crusting risk.
 * 2. Evaluates high-temperature evapotranspiration attenuation across shallow vs deep-root vegetation.
 * 3. Derives drought resilience score and temperature under peak dry-heat stress.
 *
 * ARCHITECTURAL BOUNDARY:
 * - The simulation MCP tool is stateless and models dry-season biophysical stress under current land cover;
 *   it does NOT generate random game events or replace game-backend event systems.
 * - The game backend is responsible for applying vegetation-loss events to current_state.land_cover prior to calling this tool.
 * - Persisting and saving the completed year's state remains strictly the game backend's responsibility.
 */
export declare function applyAnnualDrySeason(workingLandCover: LandCoverDistribution, options: {
    totalAreaHectares: number;
    roofTreatmentHa?: number;
    accumulatedAlbedoBoost?: number;
    droughtStressFactor?: number;
    droughtPrecipitationMm?: number;
}): AnnualDrySeasonResult;
export declare function validateYearPlan(rawInput: unknown): YearPlanInput;
export declare function executeYearPlanSimulation(args: unknown): YearPlanSimulationResult;
