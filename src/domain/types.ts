/** A string in every supported locale. `ar` is Egyptian Arabic. */
export type Localized = { en: string; ar: string };

export type Locale = "ar" | "en";

export type Access = "free" | "premium" | "sponsored";

export type CategoryId = "cafe" | "lounge" | "landmark" | "pro" | "learn" | "culture" | "studio";

export type Emotion = "joy" | "curious" | "thoughtful" | "concern" | "surprise" | "neutral";

export type SessionType = "private" | "group" | "learning" | "social";

export type PlanId = "free" | "plus" | "pro";

export type Currency = "EGP" | "USD";

/** Money in minor units (piastres / cents) so arithmetic stays exact. */
export type Money = { amount: number; currency: Currency };

export type AvatarLook = { skin: number; hair: number; hairColor: number; shirt: number };

export interface Character {
  id: string;
  name: Localized;
  role: Localized;
  bio: Localized;
  expertise: Localized;
  boundaries: Localized;
  /** Server-side persona text. Never sent to the client. */
  style: string;
  greeting: Localized;
  premium: boolean;
  look: AvatarLook;
  voice: { pitch: number; rate: number; ar?: string; en?: string };
}

export interface Offer {
  id: string;
  title: Localized;
  terms: Localized;
  validDays: number;
}

export interface Venue {
  id: string;
  category: CategoryId;
  access: Access;
  name: Localized;
  description: Localized;
  ambience: Localized;
  art: string;
  palette: [string, string, string];
  characterIds: string[];
  topicIds: string[];
  partner?: { name: string; address: Localized; hours: Localized; url?: string };
  offer?: Offer;
}

export interface Topic {
  id: string;
  label: Localized;
  sensitive?: boolean;
}

export interface Plan {
  id: PlanId;
  name: Localized;
  price: Record<Currency, number>;
  minutesPerMonth: number;
  maxCharacters: number;
  premiumAccess: boolean;
}
