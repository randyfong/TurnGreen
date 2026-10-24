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
class InMemorySessionStore {
  private sessions = new Map<string, SessionData>();
  private readonly ttlMs: number;

  constructor(ttlMinutes: number = 240) {
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  private cleanExpiredSessions(): void {
    const now = Date.now();
    for (const [id, data] of this.sessions.entries()) {
      if (now - data.lastUpdatedAt > this.ttlMs) {
        this.sessions.delete(id);
      }
    }
  }

  public savePreAssessment(sessionId: string, responses: AssessmentResponses): void {
    this.cleanExpiredSessions();
    const existing = this.sessions.get(sessionId);
    const now = Date.now();

    if (existing) {
      existing.preAssessment = { ...responses };
      existing.lastUpdatedAt = now;
    } else {
      this.sessions.set(sessionId, {
        sessionId,
        createdAt: now,
        lastUpdatedAt: now,
        preAssessment: { ...responses }
      });
    }
  }

  public savePostAssessment(sessionId: string, responses: AssessmentResponses): void {
    this.cleanExpiredSessions();
    const existing = this.sessions.get(sessionId);
    const now = Date.now();

    if (existing) {
      existing.postAssessment = { ...responses };
      existing.lastUpdatedAt = now;
    } else {
      this.sessions.set(sessionId, {
        sessionId,
        createdAt: now,
        lastUpdatedAt: now,
        postAssessment: { ...responses }
      });
    }
  }

  public getSession(sessionId: string): SessionData | undefined {
    this.cleanExpiredSessions();
    return this.sessions.get(sessionId);
  }

  public clearSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  public activeSessionCount(): number {
    this.cleanExpiredSessions();
    return this.sessions.size;
  }
}

export const sessionStore = new InMemorySessionStore();
