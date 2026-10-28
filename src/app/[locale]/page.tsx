import { useLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Avatar, Scene } from "@/components/Art";
import { AppShell } from "@/components/AppShell";
import { CharacterCard } from "@/components/CharacterCard";
import { Icon } from "@/components/Icons";
import { VenueCard } from "@/components/VenueCard";
import { CHARACTERS, FREE_INTRO, VENUES, characterById, venueById } from "@/domain/catalog";
import type { Locale } from "@/domain/types";
import { Link } from "@/i18n/navigation";
import { publicCharacter } from "@/server/public";

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale(use(params).locale);
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const rec = venueById("nile")!;
  const recC = characterById(rec.characterIds[0])!;
  const sponsor = VENUES.find((v) => v.access === "sponsored" && v.offer);
  return (
    <AppShell title={t("nav.home")} current="home">
      <section className="hero">
        <div className="copy">
          <div className="eyebrow">{t("home.freeOnUs")}</div>
          <h1>{t("home.greeting")}</h1>
          <p className="muted">{t("home.freeSub", { minutes: FREE_INTRO.minutes })}</p>
          <div className="row">
            <Avatar look={recC.look} size={44} ring="var(--sunk)" />
            <div><b>{recC.name[locale]}</b><div className="small muted">{recC.role[locale]} · {rec.name[locale]}</div></div>
          </div>
          <div className="row">
            <Link className="btn primary" href={`/venues/${rec.id}`}><Icon.mic />{t("home.quickStart")}</Link>
            <Link className="btn" href="/explore">{t("home.customize")}</Link>
          </div>
          <p className="small muted">{t("app.aiNote")}</p>
        </div>
        <div className="art"><Scene venue={rec} /><div className="glow" /></div>
      </section>

      <section>
        <div className="section-head"><h2>{t("home.placesTonight")}</h2><Link className="btn ghost small" href="/explore">{t("home.seeAll")}</Link></div>
        <div className="grid">{VENUES.filter((v) => v.access !== "sponsored").slice(0, 4).map((v) => <VenueCard key={v.id} venue={v} />)}</div>
      </section>

      {sponsor?.offer && (
        <section className="banner sponsor">
          <span className="tag sponsored">{t("access.sponsored")}</span>
          <span style={{ flex: 1 }}>{sponsor.name[locale]}: {sponsor.offer.title[locale]}</span>
          <Link className="btn small" href={`/venues/${sponsor.id}`}>{t("home.seeAll")}</Link>
        </section>
      )}

      <section>
        <div className="section-head"><h2>{t("home.meetCharacters")}</h2><Link className="btn ghost small" href="/characters">{t("home.seeAll")}</Link></div>
        <div className="grid">{CHARACTERS.slice(0, 4).map((c) => <CharacterCard key={c.id} character={publicCharacter(c)} />)}</div>
      </section>
    </AppShell>
  );
}
