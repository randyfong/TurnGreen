import { AssessmentResponses } from "../types.js";
interface SessionData {
    sessionId: string;
    createdAt: number;
    lastUpdatedAt: number;
    preAssessment?: AssessmentResponses;
    postAssessment?: AssessmentResponses;
}
/**
 * In-Memory FERPA / COPPA Compliant Isolated Session Store.
 *
 * Characteristics:
 * - Isolated within the local process memory.
 * - Does not send data to external APIs, databases, or analytics vendors.
 * - Keys solely on anonymous session IDs without student PII (names, emails, IDs).
 * - Implements automatic expiration (TTL: default 4 hours) to prevent unbounded memory growth.
 */
declare class InMemorySessionStore {
    private sessions;
    private readonly ttlMs;
    constructor(ttlMinutes?: number);
    private cleanExpiredSessions;
    savePreAssessment(sessionId: string, responses: AssessmentResponses): void;
    savePostAssessment(sessionId: string, responses: AssessmentResponses): void;
    getSession(sessionId: string): SessionData | undefined;
    clearSession(sessionId: string): boolean;
    activeSessionCount(): number;
}
export declare const sessionStore: InMemorySessionStore;
export {};
