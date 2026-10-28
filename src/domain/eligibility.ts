// Free introductory session eligibility. Every rule is configurable from admin;
// the defaults mirror the plan's "Monetization and sponsorship" section.

export interface FreeSessionRules {
  requireVerifiedContact: boolean;
  onePerDevice: boolean;
  blockDisposableEmail: boolean;
  /** Days after sign-up during which the free session can be used. 0 = no expiry. */
  expiresAfterDays: number;
  /** ISO country codes allowed; empty = everywhere. */
  allowedRegions: string[];
}

export const DEFAULT_FREE_RULES: FreeSessionRules = {
  requireVerifiedContact: true,
  onePerDevice: true,
  blockDisposableEmail: true,
  expiresAfterDays: 14,
  allowedRegions: [],
};

export interface EligibilityInput {
  freeSessionUsed: boolean;
  contactVerified: boolean;
  email?: string;
  signedUpAt: Date;
  region: string;
  /** Whether another account on this device already used a free session. */
  deviceAlreadyUsed: boolean;
  now?: Date;
}

export type IneligibleReason =
  | "already_used"
  | "unverified"
  | "disposable_email"
  | "device_used"
  | "expired"
  | "region";

const DISPOSABLE_DOMAINS = new Set(["mailinator.com", "10minutemail.com", "guerrillamail.com", "tempmail.com", "yopmail.com"]);

export function checkFreeSession(
  input: EligibilityInput,
  rules: FreeSessionRules = DEFAULT_FREE_RULES,
): { eligible: true } | { eligible: false; reason: IneligibleReason } {
  const now = input.now ?? new Date();
  if (input.freeSessionUsed) return { eligible: false, reason: "already_used" };
  if (rules.requireVerifiedContact && !input.contactVerified) return { eligible: false, reason: "unverified" };
  const domain = input.email?.split("@")[1]?.toLowerCase();
  if (rules.blockDisposableEmail && domain && DISPOSABLE_DOMAINS.has(domain)) return { eligible: false, reason: "disposable_email" };
  if (rules.onePerDevice && input.deviceAlreadyUsed) return { eligible: false, reason: "device_used" };
  if (rules.expiresAfterDays > 0) {
    const ageDays = (now.getTime() - input.signedUpAt.getTime()) / 86_400_000;
    if (ageDays > rules.expiresAfterDays) return { eligible: false, reason: "expired" };
  }
  if (rules.allowedRegions.length && !rules.allowedRegions.includes(input.region.toUpperCase())) {
    return { eligible: false, reason: "region" };
  }
  return { eligible: true };
}
