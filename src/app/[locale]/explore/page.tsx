import { useLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { AppShell } from "@/components/AppShell";
import { VenueCard } from "@/components/VenueCard";
import { CATEGORIES, VENUES } from "@/domain/catalog";
import { searchVenues } from "@/domain/search";
import type { Locale } from "@/domain/types";
import { Link } from "@/i18n/navigation";

type Search = { q?: string; category?: string; access?: string };

export default function ExplorePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Search> }) {
  setRequestLocale(use(params).locale);
  const sp = use(searchParams);
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const q = sp.q ?? "";
  const category = sp.category && sp.category in CATEGORIES ? sp.category : undefined;
  const access = sp.access && ["free", "premium", "sponsored"].includes(sp.access) ? sp.access : undefined;
  const list = searchVenues(VENUES, q, { category, access });
  const href = (patch: Search) => {
    const next = { q: q || undefined, category, access, ...patch };
    const query = Object.fromEntries(Object.entries(next).filter(([, v]) => v)) as Record<string, string>;
    return { pathname: "/explore" as const, query };
  };

  return (
    <AppShell title={t("nav.explore")} current="explore">
      <div className="stack">
        <form action="" method="get" role="search">
          {category && <input type="hidden" name="category" value={category} />}
          {access && <input type="hidden" name="access" value={access} />}
          <input className="input" type="search" name="q" defaultValue={q} placeholder={t("explore.searchPlaceholder")} aria-label={t("explore.searchPlaceholder")} />
        </form>
        <div className="chips" role="group">
          <Link className="chip" href={href({ category: undefined })} aria-pressed={!category}>{t("access.all")}</Link>
          {Object.entries(CATEGORIES).map(([id, label]) => (
            <Link key={id} className="chip" href={href({ category: id })} aria-pressed={category === id}>{label[locale]}</Link>
          ))}
        </div>
        <div className="chips" role="group">
          {(["all", "free", "premium", "sponsored"] as const).map((a) => (
            <Link key={a} className="chip" href={href({ access: a === "all" ? undefined : a })} aria-pressed={(access ?? "all") === a}>{t(`access.${a}`)}</Link>
          ))}
        </div>
        <div className="muted small" aria-live="polite">{t("explore.results", { count: list.length })}</div>
      </div>
      {list.length ? (
        <div className="grid">{list.map((v) => <VenueCard key={v.id} venue={v} />)}</div>
      ) : (
        <div className="card empty">{t("explore.noResults")}</div>
      )}
    </AppShell>
  );
}
