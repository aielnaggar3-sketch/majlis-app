import { defineRouting } from "next-intl/routing";

// Egyptian Arabic is the default. Adding a language = add it here, add messages/<locale>.json,
// fill the content fields, and map its speech voices.
export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
});

export const RTL_LOCALES = new Set(["ar"]);
export const dirFor = (locale: string) => (RTL_LOCALES.has(locale) ? "rtl" : "ltr");
