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
    sessions = new Map();
    ttlMs;
    constructor(ttlMinutes = 240) {
        this.ttlMs = ttlMinutes * 60 * 1000;
    }
    cleanExpiredSessions() {
        const now = Date.now();
        for (const [id, data] of this.sessions.entries()) {
            if (now - data.lastUpdatedAt > this.ttlMs) {
                this.sessions.delete(id);
            }
        }
    }
    savePreAssessment(sessionId, responses) {
        this.cleanExpiredSessions();
        const existing = this.sessions.get(sessionId);
        const now = Date.now();
        if (existing) {
            existing.preAssessment = { ...responses };
            existing.lastUpdatedAt = now;
        }
        else {
            this.sessions.set(sessionId, {
                sessionId,
                createdAt: now,
                lastUpdatedAt: now,
                preAssessment: { ...responses }
            });
        }
    }
    savePostAssessment(sessionId, responses) {
        this.cleanExpiredSessions();
        const existing = this.sessions.get(sessionId);
        const now = Date.now();
        if (existing) {
            existing.postAssessment = { ...responses };
            existing.lastUpdatedAt = now;
        }
        else {
            this.sessions.set(sessionId, {
                sessionId,
                createdAt: now,
                lastUpdatedAt: now,
                postAssessment: { ...responses }
            });
        }
    }
    getSession(sessionId) {
        this.cleanExpiredSessions();
        return this.sessions.get(sessionId);
    }
    clearSession(sessionId) {
        return this.sessions.delete(sessionId);
    }
    activeSessionCount() {
        this.cleanExpiredSessions();
        return this.sessions.size;
    }
}
export const sessionStore = new InMemorySessionStore();
