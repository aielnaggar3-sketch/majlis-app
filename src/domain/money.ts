import type { Currency, Locale, Money } from "./types";

export const money = (amount: number, currency: Currency): Money => ({ amount, currency });

/** Intl locale tag for formatting. Arabic uses Western digits unless the user opts into Eastern Arabic digits. */
export function intlLocale(locale: Locale, easternDigits = false): string {
  if (locale === "ar") return easternDigits ? "ar-EG" : "ar-EG-u-nu-latn";
  return "en-US";
}

export function formatMoney(m: Money, locale: Locale, easternDigits = false): string {
  const major = m.amount / 100;
  return new Intl.NumberFormat(intlLocale(locale, easternDigits), {
    style: "currency",
    currency: m.currency,
    maximumFractionDigits: m.currency === "EGP" ? 0 : 2,
  }).format(major);
}
