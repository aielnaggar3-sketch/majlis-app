"use client";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { intlLocale } from "@/domain/money";
import type { Locale, Localized } from "@/domain/types";

type CouponView = { code: string; offerId: string; status: "claimed" | "redeemed" | "expired"; expiresAt: string };

export function WalletList({ offers }: { offers: Record<string, { venue: Localized; title: Localized }> }) {
  const t = useTranslations("wallet");
  const locale = useLocale() as Locale;
  const [coupons, setCoupons] = useState<CouponView[]>();
  useEffect(() => {
    fetch("/api/wallet").then((r) => r.json()).then((d) => setCoupons(d.coupons)).catch(() => setCoupons([]));
  }, []);
  if (!coupons) return <p className="muted">{t("loading")}</p>;
  if (!coupons.length) return <div className="card empty">{t("empty")}</div>;
  const date = new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: "medium" });
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
      {coupons.map((c) => {
        const o = offers[c.offerId];
        return (
          <article key={c.code} className="card pad stack" style={{ opacity: c.status === "claimed" ? 1 : 0.6 }}>
            <span className={`tag ${c.status === "claimed" ? "free" : ""}`} style={{ alignSelf: "flex-start" }}>{t(c.status)}</span>
            {o && <><b>{o.venue[locale]}</b><span className="small">{o.title[locale]}</span></>}
            <b className="num" dir="ltr" style={{ fontSize: 20, letterSpacing: 2 }}>{c.code}</b>
            <span className="small muted">{t("expires", { date: date.format(new Date(c.expiresAt)) })}</span>
          </article>
        );
      })}
    </div>
  );
}
