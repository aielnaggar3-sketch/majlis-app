"use client";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { formatMoney } from "@/domain/money";
import type { Quote } from "@/domain/pricing";
import type { Locale, SessionType } from "@/domain/types";
import { useRouter } from "@/i18n/navigation";
import type { PublicCharacter } from "@/server/public";
import { Avatar } from "./Art";
import { Icon } from "./Icons";

const TYPES: SessionType[] = ["private", "group", "learning", "social"];
const MAX_CHARACTERS = 4;

/** Topic, characters, type and duration, with a live server quote before the user enters. */
export function SessionBuilder({ venueId, characters, topics, durations }: {
  venueId: string;
  characters: PublicCharacter[];
  topics: { id: string; label: string }[];
  durations: number[];
}) {
  const t = useTranslations("builder");
  const ta = useTranslations("access");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [topicId, setTopicId] = useState<string | undefined>(topics[0]?.id);
  const [customTopic, setCustomTopic] = useState("");
  const [characterIds, setCharacterIds] = useState<string[]>([characters[0].id]);
  const [type, setType] = useState<SessionType>("private");
  const [durationMin, setDuration] = useState(durations[0]);
  const [quote, setQuote] = useState<Quote>();
  const [state, setState] = useState<"idle" | "checking" | "starting" | "failed">("idle");

  const body = { venueId, characterIds, type, durationMin, topicId: customTopic.trim() ? undefined : topicId, customTopic: customTopic.trim() || undefined, locale };

  useEffect(() => {
    const ctrl = new AbortController();
    setState("checking");
    const timer = setTimeout(() => {
      fetch("/api/sessions/quote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => { setQuote(d.quote); setState("idle"); })
        .catch(() => {});
    }, 150);
    return () => { clearTimeout(timer); ctrl.abort(); };
    // Re-quote whenever a priced choice changes; the topic text does not affect price.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueId, characterIds.join(","), type, durationMin]);

  function toggle(id: string) {
    setCharacterIds((cur) => {
      if (cur.includes(id)) return cur.length > 1 ? cur.filter((x) => x !== id) : cur;
      return cur.length < MAX_CHARACTERS ? [...cur, id] : cur;
    });
  }
  useEffect(() => {
    if (type === "group" && characterIds.length < 2) setType("private");
  }, [type, characterIds.length]);

  async function enter() {
    setState("starting");
    const res = await fetch("/api/sessions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (res.status === 201) {
      const { id } = await res.json();
      router.push(`/session/${id}`);
      return;
    }
    setState("failed");
  }

  const canEnter = quote && (quote.kind === "free_intro" || quote.kind === "subscription") && state === "idle";

  return (
    <div className="stack">
      <div className="field">
        <label>{t("topic")}</label>
        <div className="chips">
          {topics.map((x) => (
            <button key={x.id} type="button" className="chip" aria-pressed={!customTopic.trim() && topicId === x.id} onClick={() => { setTopicId(x.id); setCustomTopic(""); }}>{x.label}</button>
          ))}
        </div>
        <input className="input" value={customTopic} maxLength={140} onChange={(e) => setCustomTopic(e.target.value)} placeholder={t("ownTopic")} aria-label={t("ownTopic")} />
      </div>

      <div className="field">
        <label>{t("characters")}</label>
        <p className="muted small">{t("maxChars", { n: MAX_CHARACTERS })}</p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
          {characters.map((c) => {
            const on = characterIds.includes(c.id);
            return (
              <button key={c.id} type="button" className="cselect" aria-pressed={on} onClick={() => toggle(c.id)}>
                <Avatar look={c.look} size={44} ring="var(--sunk)" />
                <div>
                  <b>{c.name[locale]}</b> {c.premium && <span className="tag premium">{ta("premium")}</span>}
                  <div className="small muted">{c.role[locale]}</div>
                </div>
                <span className="check" aria-hidden="true">{on ? "✓" : ""}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="field">
        <label>{t("type")}</label>
        <div className="chips">
          {TYPES.map((k) => {
            const locked = k === "group" && characterIds.length < 2;
            return (
              <button key={k} type="button" className="chip" aria-pressed={type === k} disabled={locked} title={locked ? t("groupLocked") : undefined} onClick={() => setType(k)}>{t(`types.${k}`)}</button>
            );
          })}
        </div>
      </div>

      <div className="field">
        <label>{t("duration")}</label>
        <div className="chips">
          {durations.map((m) => (
            <button key={m} type="button" className="chip" aria-pressed={durationMin === m} onClick={() => setDuration(m)}>{t("minutes", { n: m })}</button>
          ))}
        </div>
      </div>

      <div className="card pad pricebox" aria-live="polite">
        <h3>{t("review")}</h3>
        <QuoteLines quote={quote} checking={state === "checking"} />
        {state === "failed" && <p className="small" role="alert">{t("failed")}</p>}
        <button className="btn primary" disabled={!canEnter} onClick={enter}>
          <Icon.mic />
          {state === "starting" ? t("starting") : quote?.kind === "pay" ? t("pay", { price: formatMoney(quote.total, locale) }) : t("enter")}
        </button>
        {quote?.kind === "pay" && <p className="small muted">{t("paymentsSoon")}</p>}
      </div>
    </div>
  );
}

function QuoteLines({ quote, checking }: { quote?: Quote; checking: boolean }) {
  const t = useTranslations("builder");
  const locale = useLocale() as Locale;
  if (!quote || checking) return <p className="small muted">{t("checking")}</p>;
  if (quote.kind === "invalid") return <p className="small" role="alert">{t("invalid", { reason: t(`invalidReasons.${quote.reason}`) })}</p>;
  return (
    <>
      <div className="line">
        <span>{quote.kind === "free_intro" ? t("freeIntro") : quote.kind === "subscription" ? t("included") : t(`reasons.${quote.reason}`)}</span>
        <span className="num">{t("minutes", { n: quote.minutes })}</span>
      </div>
      {quote.kind === "subscription" && <div className="line small muted"><span>{t("minutesLeft", { n: quote.minutesLeftAfter })}</span></div>}
      <div className="line total"><span>{t("total")}</span><span className="num">{formatMoney(quote.total, locale)}</span></div>
    </>
  );
}
