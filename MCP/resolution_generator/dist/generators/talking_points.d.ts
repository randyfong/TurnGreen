import { ActionableTalkingPoint, BiophysicalScorecard, TurnRecord } from "../types.js";
/**
 * Synthesizes three high-impact, 60-90 second verbal talking points
 * formatted for municipal public comment sessions (e.g. City Council or School Board 2-minute limits).
 */
export declare function buildActionableTalkingPoints(authorName: string, districtName: string, targetBody: string, turns: TurnRecord[], scorecard: BiophysicalScorecard): ActionableTalkingPoint[];
