import { boolean, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Translatable text is stored as {"en": "...", "ar": "..."} so adding a language is a data change.
type Localized = Record<string, string>;

export const accessEnum = pgEnum("access", ["free", "premium", "sponsored"]);
export const contentStatusEnum = pgEnum("content_status", ["draft", "review", "published", "suspended", "archived"]);
export const planEnum = pgEnum("plan", ["free", "plus", "pro"]);
export const sessionTypeEnum = pgEnum("session_type", ["private", "group", "learning", "social"]);
export const sessionStatusEnum = pgEnum("session_status", ["active", "ended"]);
export const entitlementKindEnum = pgEnum("entitlement_kind", ["free_intro", "subscription", "pass"]);
export const couponStatusEnum = pgEnum("coupon_status", ["claimed", "redeemed", "expired"]);
export const roleEnum = pgEnum("role", ["user", "super_admin", "editor", "reviewer", "commerce", "trust_safety", "analyst", "partner_owner", "partner_member"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique(),
  phone: text("phone").unique(),
  contactVerified: boolean("contact_verified").notNull().default(false),
  name: text("name").notNull().default(""),
  locale: text("locale").notNull().default("ar"),
  region: text("region").notNull().default("EG"),
  currency: text("currency").notNull().default("EGP"),
  avatar: jsonb("avatar").$type<{ skin: number; hair: number; hairColor: number; shirt: number }>(),
  role: roleEnum("role").notNull().default("user"),
  partnerId: uuid("partner_id"),
  memoryConsentAt: timestamp("memory_consent_at", { withTimezone: true }),
  freeSessionUsedAt: timestamp("free_session_used_at", { withTimezone: true }),
  deviceFingerprint: text("device_fingerprint"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const venues = pgTable("venues", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  access: accessEnum("access").notNull().default("free"),
  status: contentStatusEnum("status").notNull().default("draft"),
  version: integer("version").notNull().default(1),
  name: jsonb("name").$type<Localized>().notNull(),
  description: jsonb("description").$type<Localized>().notNull(),
  ambience: jsonb("ambience").$type<Localized>().notNull(),
  /** Per-locale translation review state, e.g. {"en":"reviewed","ar":"machine"}. Publishing requires all "reviewed". */
  translationStatus: jsonb("translation_status").$type<Record<string, "machine" | "draft" | "reviewed">>().notNull(),
  art: jsonb("art").$type<{ scene: string; palette: string[]; imageUrl?: string; ambientAudioUrl?: string }>().notNull(),
  partnerId: uuid("partner_id"),
  geo: jsonb("geo").$type<{ lat: number; lng: number; address: Localized; hours?: Localized; url?: string }>(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const characters = pgTable("characters", {
  id: text("id").primaryKey(),
  status: contentStatusEnum("status").notNull().default("draft"),
  version: integer("version").notNull().default(1),
  name: jsonb("name").$type<Localized>().notNull(),
  role: jsonb("role").$type<Localized>().notNull(),
  bio: jsonb("bio").$type<Localized>().notNull(),
  expertise: jsonb("expertise").$type<Localized>().notNull(),
  boundaries: jsonb("boundaries").$type<Localized>().notNull(),
  greeting: jsonb("greeting").$type<Localized>().notNull(),
  /** Server-only persona text. */
  style: text("style").notNull(),
  /** Arabic dialect for speech, e.g. "ar-EG". */
  dialect: text("dialect").notNull().default("ar-EG"),
  voices: jsonb("voices").$type<Record<string, { provider: string; voiceId: string }>>().notNull(),
  look: jsonb("look").$type<{ skin: number; hair: number; hairColor: number; shirt: number }>().notNull(),
  premium: boolean("premium").notNull().default(false),
  knowledgeSourceIds: jsonb("knowledge_source_ids").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const venueCharacters = pgTable(
  "venue_characters",
  { venueId: text("venue_id").notNull().references(() => venues.id), characterId: text("character_id").notNull().references(() => characters.id) },
  (t) => [primaryKey({ columns: [t.venueId, t.characterId] })],
);

export const topics = pgTable("topics", {
  id: text("id").primaryKey(),
  label: jsonb("label").$type<Localized>().notNull(),
  category: text("category"),
  sensitive: boolean("sensitive").notNull().default(false),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  plan: planEnum("plan").notNull(),
  status: text("status").notNull(), // active | past_due | cancelled
  currency: text("currency").notNull(),
  priceMinor: integer("price_minor").notNull(),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }).notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  provider: text("provider").notNull(), // stripe | paymob | apple | google
  providerRef: text("provider_ref").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** What a user may spend on sessions. Checked before every session start and each billed minute. */
export const entitlements = pgTable("entitlements", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  kind: entitlementKindEnum("kind").notNull(),
  minutesTotal: integer("minutes_total").notNull(),
  minutesUsed: integer("minutes_used").notNull().default(0),
  maxCharacters: integer("max_characters").notNull(),
  premiumAccess: boolean("premium_access").notNull().default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id),
});

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id),
    venueId: text("venue_id").notNull().references(() => venues.id),
    topic: text("topic").notNull(),
    type: sessionTypeEnum("type").notNull(),
    locale: text("locale").notNull(),
    characterIds: jsonb("character_ids").$type<string[]>().notNull(),
    durationMin: integer("duration_min").notNull(),
    billedSeconds: integer("billed_seconds").notNull().default(0),
    entitlementId: uuid("entitlement_id").references(() => entitlements.id),
    status: sessionStatusEnum("status").notNull().default("active"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    aiCostMicros: integer("ai_cost_micros").notNull().default(0),
    rating: integer("rating"),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** Transcript turns. Deleted after 30 days unless the user saved the session. Never exposed to partners. */
export const turns = pgTable(
  "turns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
    speaker: text("speaker").notNull(),
    text: text("text").notNull(),
    emotion: text("emotion"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    deleteAfter: timestamp("delete_after", { withTimezone: true }),
  },
  (t) => [index("turns_session_idx").on(t.sessionId)],
);

export const summaries = pgTable("summaries", {
  sessionId: uuid("session_id").primaryKey().references(() => sessions.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  covered: jsonb("covered").$type<string[]>().notNull(),
  next: jsonb("next").$type<string[]>().notNull(),
  savedByUser: boolean("saved_by_user").notNull().default(false),
});

export const memories = pgTable("memories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  characterId: text("character_id").notNull().references(() => characters.id),
  fact: text("fact").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const partners = pgTable("partners", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  brandRightsConfirmedAt: timestamp("brand_rights_confirmed_at", { withTimezone: true }),
});

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  partnerId: uuid("partner_id").notNull().references(() => partners.id),
  name: text("name").notNull(),
  status: contentStatusEnum("status").notNull().default("draft"),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  budgetMinor: integer("budget_minor"),
  currency: text("currency"),
});

export const offers = pgTable("offers", {
  id: text("id").primaryKey(),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id),
  venueId: text("venue_id").notNull().references(() => venues.id),
  title: jsonb("title").$type<Localized>().notNull(),
  terms: jsonb("terms").$type<Localized>().notNull(),
  codeType: text("code_type").notNull().default("unique_qr"), // unique_qr | static | pos
  validDays: integer("valid_days").notNull(),
  cap: integer("cap"),
});

export const coupons = pgTable(
  "coupons",
  {
    code: text("code").primaryKey(),
    offerId: text("offer_id").notNull().references(() => offers.id),
    venueId: text("venue_id").notNull().references(() => venues.id),
    userId: uuid("user_id").notNull().references(() => users.id),
    status: couponStatusEnum("status").notNull().default("claimed"),
    claimedAt: timestamp("claimed_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
    redeemedBy: uuid("redeemed_by"),
  },
  (t) => [index("coupons_user_idx").on(t.userId)],
);

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  actorId: uuid("actor_id"),
  role: text("role"),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  before: jsonb("before"),
  after: jsonb("after"),
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").references(() => sessions.id),
  reporterId: uuid("reporter_id").references(() => users.id),
  reason: text("reason").notNull(),
  /** Only the flagged excerpt, never the whole transcript. */
  excerpt: text("excerpt"),
  severity: text("severity").notNull().default("low"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
