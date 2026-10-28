import { useLocale, useTranslations } from "next-intl";
import { CATEGORIES, characterById } from "@/domain/catalog";
import type { Locale, Venue } from "@/domain/types";
import { Link } from "@/i18n/navigation";
import { Avatar, Scene } from "./Art";

export function AccessTag({ access }: { access: Venue["access"] }) {
  const t = useTranslations("access");
  return <span className={`tag ${access}`}>{t(access)}</span>;
}

export function VenueCard({ venue }: { venue: Venue }) {
  const locale = useLocale() as Locale;
  return (
    <Link href={`/venues/${venue.id}`} className="card vcard">
      <div className="art">
        <Scene venue={venue} />
        <div className="glow" />
        <div className="badges"><AccessTag access={venue.access} /></div>
      </div>
      <div className="body">
        <h3>{venue.name[locale]}</h3>
        <div className="meta">
          <span>{CATEGORIES[venue.category][locale]}</span>
          <span aria-hidden="true">·</span>
          <span className="row" style={{ gap: 0 }}>
            {venue.characterIds.slice(0, 3).map((id) => <Avatar key={id} look={characterById(id)!.look} size={24} ring="var(--sunk)" />)}
          </span>
        </div>
        <p className="muted small">{venue.description[locale]}</p>
      </div>
    </Link>
  );
}
