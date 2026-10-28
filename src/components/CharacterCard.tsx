import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/domain/types";
import type { PublicCharacter } from "@/server/public";
import { Avatar } from "./Art";

export function CharacterCard({ character }: { character: PublicCharacter }) {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  return (
    <article className="card ccard">
      <div className="top">
        <Avatar look={character.look} size={56} ring="var(--sunk)" />
        <div><h3>{character.name[locale]}</h3><div className="muted small">{character.role[locale]}</div></div>
      </div>
      <p className="small muted">{character.bio[locale]}</p>
      <div className="row" style={{ gap: 6 }}>
        <span className="tag ai">{t("session.ai")}</span>
        <span className={`tag ${character.premium ? "premium" : "free"}`}>{t(character.premium ? "access.premium" : "access.free")}</span>
      </div>
      <p className="small muted">{t("characters.boundaries")}: {character.boundaries[locale]}</p>
    </article>
  );
}
