import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { AppShell } from "@/components/AppShell";
import { CharacterCard } from "@/components/CharacterCard";
import { CHARACTERS } from "@/domain/catalog";
import { publicCharacter } from "@/server/public";

export default function CharactersPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale(use(params).locale);
  const t = useTranslations();
  return (
    <AppShell title={t("nav.characters")} current="characters">
      <p className="muted small">{t("characters.disclosure")}</p>
      <div className="grid">{CHARACTERS.map((c) => <CharacterCard key={c.id} character={publicCharacter(c)} />)}</div>
    </AppShell>
  );
}
