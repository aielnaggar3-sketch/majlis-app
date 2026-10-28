"use client";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Icon } from "./Icons";

export function LanguageSwitch() {
  const locale = useLocale();
  const t = useTranslations("app");
  const router = useRouter();
  const pathname = usePathname();
  return (
    <button className="btn small" onClick={() => router.replace(pathname, { locale: locale === "ar" ? "en" : "ar" })}>
      <Icon.globe />
      {t("switchLanguage")}
    </button>
  );
}
