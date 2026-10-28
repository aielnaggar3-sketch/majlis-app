import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { AppShell } from "@/components/AppShell";
import { WalletList } from "@/components/WalletList";
import { VENUES } from "@/domain/catalog";

export default function WalletPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale(use(params).locale);
  const t = useTranslations();
  // Offer and venue names only; the client component never imports the catalogue.
  const offers = Object.fromEntries(VENUES.filter((v) => v.offer).map((v) => [v.offer!.id, { venue: v.name, title: v.offer!.title }]));
  return (
    <AppShell title={t("nav.wallet")} current="wallet">
      <h1>{t("wallet.title")}</h1>
      <p className="muted small">{t("wallet.note")}</p>
      <WalletList offers={offers} />
    </AppShell>
  );
}
