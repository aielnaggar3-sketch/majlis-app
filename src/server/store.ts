import { randomUUID } from "node:crypto";
import type { Coupon } from "@/domain/coupons";
import type { Currency, Locale, PlanId, SessionType } from "@/domain/types";
import type { Quote } from "@/domain/pricing";
import type { SessionSummary, Turn } from "./ai/types";

export interface UserRecord {
  id: string;
  name: string;
  locale: Locale;
  region: string;
  currency: Currency;
  plan: PlanId;
  minutesLeft: number;
  freeSessionUsed: boolean;
  contactVerified: boolean;
  createdAt: Date;
  /** Persistent memory across sessions is opt-in. */
  memoryConsent: boolean;
}

export interface SessionRecord {
  id: string;
  userId: string;
  venueId: string;
  topic: string;
  type: SessionType;
  locale: Locale;
  characterIds: string[];
  mutedIds: string[];
  durationMin: number;
  quote: Quote;
  status: "active" | "ended";
  startedAt: Date;
  endedAt?: Date;
  turns: Turn[];
  summary?: SessionSummary;
}

export interface AuditEntry {
  at: Date;
  actorId: string;
  action: string;
  entity: string;
}

/**
 * Persistence boundary. `MemoryStore` backs local development and tests; the Postgres
 * implementation (schema in src/db/schema.ts) replaces it once DATABASE_URL is set up.
 */
export interface Store {
  getUser(id: string): Promise<UserRecord | undefined>;
  createUser(partial: Partial<UserRecord>): Promise<UserRecord>;
  updateUser(id: string, patch: Partial<UserRecord>): Promise<UserRecord>;
  createSession(s: Omit<SessionRecord, "id" | "startedAt" | "turns" | "status" | "mutedIds">): Promise<SessionRecord>;
  getSession(id: string): Promise<SessionRecord | undefined>;
  updateSession(id: string, patch: Partial<SessionRecord>): Promise<SessionRecord>;
  listSessions(userId: string): Promise<SessionRecord[]>;
  saveCoupon(c: Coupon): Promise<Coupon>;
  getCoupon(code: string): Promise<Coupon | undefined>;
  listCoupons(userId: string): Promise<Coupon[]>;
  audit(entry: Omit<AuditEntry, "at">): Promise<void>;
}

class MemoryStore implements Store {
  users = new Map<string, UserRecord>();
  sessions = new Map<string, SessionRecord>();
  coupons = new Map<string, Coupon>();
  log: AuditEntry[] = [];

  async getUser(id: string) {
    return this.users.get(id);
  }
  async createUser(partial: Partial<UserRecord>) {
    const u: UserRecord = {
      id: randomUUID(), name: "", locale: "ar", region: "EG", currency: "EGP", plan: "free", minutesLeft: 0,
      freeSessionUsed: false, contactVerified: true, createdAt: new Date(), memoryConsent: false, ...partial,
    };
    this.users.set(u.id, u);
    return u;
  }
  async updateUser(id: string, patch: Partial<UserRecord>) {
    const u = { ...this.users.get(id)!, ...patch };
    this.users.set(id, u);
    return u;
  }
  async createSession(s: Omit<SessionRecord, "id" | "startedAt" | "turns" | "status" | "mutedIds">) {
    const rec: SessionRecord = { ...s, id: randomUUID(), startedAt: new Date(), turns: [], status: "active", mutedIds: [] };
    this.sessions.set(rec.id, rec);
    return rec;
  }
  async getSession(id: string) {
    return this.sessions.get(id);
  }
  async updateSession(id: string, patch: Partial<SessionRecord>) {
    const s = { ...this.sessions.get(id)!, ...patch };
    this.sessions.set(id, s);
    return s;
  }
  async listSessions(userId: string) {
    return [...this.sessions.values()].filter((s) => s.userId === userId);
  }
  async saveCoupon(c: Coupon) {
    this.coupons.set(c.code, c);
    return c;
  }
  async getCoupon(code: string) {
    return this.coupons.get(code);
  }
  async listCoupons(userId: string) {
    return [...this.coupons.values()].filter((c) => c.userId === userId);
  }
  async audit(entry: Omit<AuditEntry, "at">) {
    this.log.unshift({ ...entry, at: new Date() });
  }
}

// Survive dev-server hot reloads.
const g = globalThis as unknown as { __majlisStore?: Store };
export function getStore(): Store {
  if (!g.__majlisStore) g.__majlisStore = new MemoryStore();
  return g.__majlisStore;
}
export function resetStoreForTests() {
  g.__majlisStore = new MemoryStore();
}
