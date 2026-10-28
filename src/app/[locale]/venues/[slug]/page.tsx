import { notFound } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { AppShell } from "@/components/AppShell";
import { Scene } from "@/components/Art";
import { CharacterCard } from "@/components/CharacterCard";
import { ClaimOffer } from "@/components/ClaimOffer";
import { Icon } from "@/components/Icons";
import { SessionBuilder } from "@/components/SessionBuilder";
import { AccessTag } from "@/components/VenueCard";
import { CATEGORIES, CHARACTERS, TOPICS, VENUES, characterById, venueById } from "@/domain/catalog";
import { DURATIONS } from "@/domain/pricing";
import type { Locale } from "@/domain/types";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { publicCharacter } from "@/server/public";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => VENUES.map((v) => ({ locale, slug: v.id })));
}

export default function VenuePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: l, slug } = use(params);
  setRequestLocale(l);
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const venue = venueById(slug);
  if (!venue) notFound();
  const here = venue.characterIds.map((id) => characterById(id)!);
  // Venue characters first, then everyone else, so the builder can add guests.
  const pool = [...here, ...CHARACTERS.filter((c) => !venue.characterIds.includes(c.id))].map(publicCharacter);
  const topics = [...venue.topicIds.map((id) => TOPICS.find((x) => x.id === id)!), ...TOPICS.filter((x) => !venue.topicIds.includes(x.id))];

  return (
    <AppShell title={venue.name[locale]}>
      <div><Link className="btn ghost small" href="/explore"><Icon.back />{t("venue.back")}</Link></div>
      <section className="card" style={{ overflow: "hidden" }}>
        <div className="art" style={{ aspectRatio: "21/8", borderRadius: 0 }}>
          <Scene venue={venue} /><div className="glow" />
          <div className="badges"><AccessTag access={venue.access} /></div>
        </div>
        <div className="pad stack">
          <div className="eyebrow">{CATEGORIES[venue.category][locale]}</div>
          <h1>{venue.name[locale]}</h1>
          <p>{venue.description[locale]}</p>
          <p className="small muted"><b>{t("venue.atmosphere")}:</b> {venue.ambience[locale]}</p>
        </div>
      </section>

      {venue.access === "sponsored" && (
        <div className="banner sponsor"><span className="tag sponsored">{t("access.sponsored")}</span><span>{t("venue.sponsoredNote")}</span></div>
      )}

      <div className="two">
        <section className="stack">
          <h2>{t("venue.whoHere")}</h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
            {here.map((c) => <CharacterCard key={c.id} character={publicCharacter(c)} />)}
          </div>
        </section>
        {venue.offer && venue.partner && (
          <aside className="stack">
            <h2>{t("venue.offer")}</h2>
            <div className="card pad stack">
              <span className="tag sponsored" style={{ alignSelf: "flex-start" }}>{t("access.sponsored")}</span>
              <h3>{venue.offer.title[locale]}</h3>
              <p className="small muted">{venue.offer.terms[locale]}</p>
              <ClaimOffer offerId={venue.offer.id} />
            </div>
            <div className="card pad stack">
              <h3>{t("venue.realVenue")}</h3>
              <dl className="kv">
                <dt>{t("venue.address")}</dt><dd>{venue.partner.address[locale]}</dd>
                <dt>{t("venue.hours")}</dt><dd>{venue.partner.hours[locale]}</dd>
              </dl>
              {venue.partner.url && <a className="btn small" href={venue.partner.url} target="_blank" rel="noopener noreferrer">{t("venue.site")}</a>}
            </div>
          </aside>
        )}
      </div>

      <section className="card pad stack" id="start">
        <h2>{t("venue.start")}</h2>
        <SessionBuilder
          venueId={venue.id}
          characters={pool}
          topics={topics.map((x) => ({ id: x.id, label: x.label[locale] }))}
          durations={[...DURATIONS]}
        />
      </section>
    </AppShell>
  );
}
