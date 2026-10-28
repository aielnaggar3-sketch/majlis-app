"use client";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale, Localized, Venue } from "@/domain/types";
import { Link } from "@/i18n/navigation";
import type { SessionSummary, Turn } from "@/server/ai/types";
import type { PublicCharacter } from "@/server/public";
import { Avatar, Scene } from "./Art";
import { Icon } from "./Icons";

type VenueView = Pick<Venue, "id" | "art" | "palette"> & { name: Localized };
type SessionView = {
  id: string; venueId: string; topic: string; locale: Locale; characterIds: string[]; mutedIds: string[];
  durationMin: number; status: "active" | "ended"; startedAt: string; turns: Turn[]; summary?: SessionSummary;
};
type Line = Turn & { sys?: boolean };
type VoiceState = "connecting" | "listening" | "user" | "thinking" | "speaking" | "micblocked";

// Minimal Web Speech recognition typing; Chrome and Safari still ship it prefixed.
type Recognition = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
};
function makeRecognition(): Recognition | undefined {
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  const R = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return R ? new R() : undefined;
}

const speechLang = (l: Locale) => (l === "ar" ? "ar-EG" : "en-US");

/**
 * The live room. Voice runs in the browser for now (Web Speech in, speechSynthesis out),
 * so it works with no paid keys; the server-side gateway in src/server/voice replaces it
 * when Azure or ElevenLabs credentials are configured.
 */
export function SessionRoom({ id, characters, venues }: { id: string; characters: PublicCharacter[]; venues: VenueView[] }) {
  const t = useTranslations("session");
  const tn = useTranslations("nav");
  const uiLocale = useLocale() as Locale;
  const [session, setSession] = useState<SessionView>();
  const [phase, setPhase] = useState<"loading" | "notfound" | "live" | "ending" | "ended">("loading");
  const [brain, setBrain] = useState<string>();
  const [lines, setLines] = useState<Line[]>([]);
  const [voice, setVoice] = useState<VoiceState>("connecting");
  const [speaking, setSpeaking] = useState<string>();
  const [muted, setMuted] = useState<string[]>([]);
  const [crisis, setCrisis] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [draft, setDraft] = useState("");
  const [left, setLeft] = useState(0);
  const [summary, setSummary] = useState<SessionSummary>();
  const recog = useRef<Recognition | undefined>(undefined);
  const linesEl = useRef<HTMLDivElement>(null);
  const alive = useRef(true);

  const charById = useCallback((cid: string) => characters.find((c) => c.id === cid), [characters]);

  const speak = useCallback(
    (turn: Turn, locale: Locale) =>
      new Promise<void>((resolve) => {
        const c = charById(turn.speaker);
        const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
        if (!synth || !c) return setTimeout(resolve, Math.min(6000, 600 + turn.text.length * 45));
        const u = new SpeechSynthesisUtterance(turn.text);
        u.lang = speechLang(locale);
        const preferred = c.voice[locale];
        const voices = synth.getVoices();
        u.voice = voices.find((v) => v.name === preferred) ?? voices.find((v) => v.lang === u.lang) ?? voices.find((v) => v.lang.startsWith(locale)) ?? null;
        u.pitch = c.voice.pitch;
        u.rate = c.voice.rate;
        u.onend = u.onerror = () => resolve();
        synth.speak(u);
      }),
    [charById],
  );

  const play = useCallback(
    async (turns: Turn[], locale: Locale) => {
      for (const turn of turns) {
        if (!alive.current) return;
        setLines((l) => [...l, turn]);
        setSpeaking(turn.speaker);
        setVoice("speaking");
        await speak(turn, locale);
      }
      setSpeaking(undefined);
      if (alive.current) setVoice((v) => (v === "micblocked" ? v : "listening"));
    },
    [speak],
  );

  // Load the session and play the opening lines.
  useEffect(() => {
    alive.current = true;
    fetch(`/api/sessions/${id}`)
      .then(async (r) => {
        if (!r.ok) return setPhase("notfound");
        const d = (await r.json()) as { session: SessionView; brain: string };
        setSession(d.session);
        setBrain(d.brain);
        setMuted(d.session.mutedIds);
        if (d.session.status === "ended") {
          setLines(d.session.turns);
          setSummary(d.session.summary);
          return setPhase("ended");
        }
        setPhase("live");
        play(d.session.turns, d.session.locale);
      })
      .catch(() => setPhase("notfound"));
    return () => {
      alive.current = false;
      window.speechSynthesis?.cancel();
      recog.current?.abort();
    };
  }, [id, play]);

  useEffect(() => {
    linesEl.current?.scrollTo({ top: linesEl.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  const end = useCallback(async () => {
    if (!session) return;
    alive.current = false;
    window.speechSynthesis?.cancel();
    recog.current?.abort();
    setPhase("ending");
    const r = await fetch(`/api/sessions/${session.id}/end`, { method: "POST" });
    if (r.ok) setSummary((await r.json()).summary);
    setPhase("ended");
  }, [session]);

  // Countdown from the server's start time, so a reload doesn't reset the clock.
  useEffect(() => {
    if (!session || phase !== "live") return;
    const endsAt = new Date(session.startedAt).getTime() + session.durationMin * 60_000;
    const tick = () => {
      const s = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) end();
    };
    tick();
    const h = setInterval(tick, 1000);
    return () => clearInterval(h);
  }, [session, phase, end]);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!session || !clean || voice === "thinking" || voice === "speaking") return;
      setDraft("");
      setLines((l) => [...l, { speaker: "user", text: clean }]);
      setVoice("thinking");
      const r = await fetch(`/api/sessions/${session.id}/turns`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: clean }) });
      if (r.status === 409) {
        setLines((l) => [...l, { speaker: "system", text: t("timeUp"), sys: true }]);
        return end();
      }
      if (!r.ok) {
        setLines((l) => [...l, { speaker: "system", text: t("unavailable"), sys: true }]);
        return setVoice("listening");
      }
      const d = (await r.json()) as { turns: Turn[]; crisis: boolean };
      if (d.crisis) setCrisis(true);
      await play(d.turns, session.locale);
    },
    [session, voice, play, end, t],
  );

  function toggleMic() {
    if (!session) return;
    if (voice === "user") return recog.current?.stop();
    const r = recog.current ?? makeRecognition();
    if (!r) return setVoice("micblocked");
    recog.current = r;
    r.lang = speechLang(session.locale);
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e) => {
      const said = Array.from(e.results).map((res) => res[0].transcript).join(" ");
      send(said);
    };
    r.onerror = (e) => setVoice(e.error === "not-allowed" || e.error === "service-not-allowed" ? "micblocked" : "listening");
    r.onend = () => setVoice((v) => (v === "user" ? "listening" : v));
    try {
      r.start();
      setVoice("user");
    } catch {
      setVoice("micblocked");
    }
  }

  async function toggleMute(cid: string) {
    if (!session) return;
    const next = muted.includes(cid) ? muted.filter((m) => m !== cid) : [...muted, cid];
    setMuted(next);
    await fetch(`/api/sessions/${session.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ mutedIds: next }) });
  }

  if (phase === "loading") return <div className="session"><div className="pad">{t("connecting")}</div></div>;
  if (phase === "notfound" || !session) {
    return <div className="card empty" style={{ margin: 24 }}>{t("notFound")}<Link className="btn" href="/">{t("another")}</Link></div>;
  }

  const venue = venues.find((v) => v.id === session.venueId)!;
  const cast = session.characterIds.map(charById).filter((c): c is PublicCharacter => Boolean(c));
  const size = cast.length > 2 ? 96 : 120;
  const name = (cid: string) => (cid === "user" ? t("you") : charById(cid)?.name[uiLocale] ?? "");

  if (phase === "ending" || phase === "ended") {
    return (
      <main className="content" style={{ maxWidth: 900, margin: "0 auto" }}>
        <section className="card pad stack">
          <div className="eyebrow">{venue.name[uiLocale]}</div>
          <h1>{session.topic}</h1>
          <div className="row">{cast.map((c) => <Avatar key={c.id} look={c.look} size={48} ring="var(--sunk)" />)}</div>
          <h2>{t("summary")}</h2>
          {summary ? (
            <div className="stack" dir={session.locale === "ar" ? "rtl" : "ltr"}>
              <p>{summary.summary}</p>
              <h3>{t("covered")}</h3>
              <ul style={{ margin: 0, paddingInlineStart: 20 }}>{summary.covered.map((x, i) => <li key={i}>{x}</li>)}</ul>
              <h3>{t("next")}</h3>
              <ul style={{ margin: 0, paddingInlineStart: 20 }}>{summary.next.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </div>
          ) : (
            <p className="muted">{t("writing")}</p>
          )}
          <div className="row">
            <Link className="btn primary" href={`/venues/${venue.id}#start`}>{t("another")}</Link>
            <Link className="btn" href="/">{tn("home")}</Link>
          </div>
        </section>
      </main>
    );
  }

  const stateLabel: Record<VoiceState, string> = {
    connecting: t("connecting"),
    listening: t("listening"),
    user: t("listening"),
    thinking: t("thinking"),
    speaking: speaking ? t("speaking", { name: name(speaking) }) : t("thinking"),
    micblocked: t("micBlocked"),
  };
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="session" role="region" aria-label={venue.name[uiLocale]}>
      <div className="shead">
        <button className="sbtn" onClick={end} aria-label={t("end")}><Icon.back /></button>
        <div className="t"><b>{venue.name[uiLocale]}</b><span>{session.topic}</span></div>
        {brain === "scripted" && <span className="small" id="aimode" style={{ opacity: 0.7 }}>{t("scripted")}</span>}
        <span className="timer num" dir="ltr" aria-label={t("left", { time: `${mm}:${ss}` })}>{mm}:{ss}</span>
      </div>

      <div className="stagewrap">
        <div className="stage">
          <Scene venue={venue} />
          <div className="dim" />
          <div className="cast">
            {cast.map((c) => (
              <div key={c.id} className={`actor ${speaking === c.id ? "speaking" : ""} ${muted.includes(c.id) ? "muted" : ""}`}>
                <div className="ring"><Avatar look={c.look} size={size} /></div>
                <div className="nm">
                  {c.name[uiLocale]}<span className="tag">{t("ai")}</span>
                  <button className="sbtn" style={{ width: 26, height: 26, border: 0, background: "none" }} aria-pressed={muted.includes(c.id)}
                    aria-label={t(muted.includes(c.id) ? "unmute" : "mute", { name: c.name[uiLocale] })} onClick={() => toggleMute(c.id)}>
                    {muted.includes(c.id) ? <Icon.micOff /> : <Icon.mic />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="feed" hidden={!captions} aria-label={t("captions")}>
          <div className="fh"><span>{t("captions")}</span></div>
          <div className="lines" ref={linesEl} aria-live="polite" dir={session.locale === "ar" ? "rtl" : "ltr"}>
            {lines.map((l, i) => (
              <div key={i} className={`cap ${l.speaker === "user" ? "me" : ""} ${l.sys ? "sys" : ""}`}>
                <div><div className="who">{l.sys ? "" : name(l.speaker)}</div><div className="txt">{l.text}</div></div>
              </div>
            ))}
            {crisis && <div className="cap sys" role="alert"><div className="txt">{t("crisis")}</div></div>}
          </div>
        </aside>
      </div>

      <div className="voicebar">
        <div className="vrow">
          <div className="state" data-s={voice} role="status"><i className="dot" /><span>{stateLabel[voice]}</span></div>
          <div className={`wave ${voice === "speaking" || voice === "user" ? "on" : ""}`} aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <i key={i} />)}</div>
        </div>
        <div className="vrow">
          <button className={`mic ${voice === "user" ? "live" : ""} ${voice === "micblocked" ? "blocked" : ""}`} onClick={toggleMic} aria-label={t("mic")} aria-pressed={voice === "user"}>
            {voice === "micblocked" ? <Icon.micOff /> : <Icon.mic />}
          </button>
          <form className="say" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t("placeholder")} aria-label={t("placeholder")} autoComplete="off" maxLength={1200} />
            <button className="sbtn" type="submit" aria-label={t("send")} style={{ width: 44, height: 44 }}><Icon.send /></button>
          </form>
        </div>
        <div className="vrow" style={{ justifyContent: "space-between" }}>
          <div className="ctrls">
            <button className="sbtn" aria-pressed={captions} aria-label={t("captions")} onClick={() => setCaptions((c) => !c)}>CC</button>
          </div>
          <button className="endbtn" onClick={end}>{t("end")}</button>
        </div>
      </div>
    </div>
  );
}
