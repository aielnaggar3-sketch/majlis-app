"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

export function ClaimOffer({ offerId }: { offerId: string }) {
  const t = useTranslations();
  const [code, setCode] = useState<string>();
  const [busy, setBusy] = useState(false);
  async function claim() {
    setBusy(true);
    try {
      const res = await fetch(`/api/offers/${offerId}/claim`, { method: "POST" });
      if (res.ok) setCode((await res.json()).coupon.code);
    } finally {
      setBusy(false);
    }
  }
  if (code) {
    return (
      <div className="stack" role="status">
        <span className="small muted">{t("venue.code")}</span>
        <b className="num ltr" style={{ fontSize: 22, letterSpacing: 2 }} dir="ltr">{code}</b>
        <Link className="btn small" href="/wallet">{t("venue.claimed")}</Link>
      </div>
    );
  }
  return <button className="btn primary" onClick={claim} disabled={busy}>{t("venue.claim")}</button>;
}
