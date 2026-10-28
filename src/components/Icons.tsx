const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const Icon = {
  home: () => <svg viewBox="0 0 24 24" {...P}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>,
  explore: () => <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>,
  characters: () => <svg viewBox="0 0 24 24" {...P}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.5-4 3-6 6.5-6s6 2 6.5 6" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14c3 0 5 1.6 5.5 5" /></svg>,
  wallet: () => <svg viewBox="0 0 24 24" {...P}><path d="M3 8a2 2 0 0 1 2-2h14v4" /><path d="M3 8v10a2 2 0 0 0 2 2h15V10H5a2 2 0 0 1-2-2z" /></svg>,
  mic: () => <svg viewBox="0 0 24 24" {...P} strokeWidth={2}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>,
  micOff: () => <svg viewBox="0 0 24 24" {...P} strokeWidth={2}><path d="M3 3l18 18M9 9v2a3 3 0 0 0 5 2M15 10V6a3 3 0 0 0-6 0" /><path d="M5 11a7 7 0 0 0 11 5.5M12 18v3" /></svg>,
  send: () => <svg viewBox="0 0 24 24" {...P} strokeWidth={2} className="flip"><path d="M4 12l16-8-6 16-2-6z" /></svg>,
  back: () => <svg viewBox="0 0 24 24" {...P} strokeWidth={2} className="flip"><path d="M15 5l-7 7 7 7" /></svg>,
  globe: () => <svg viewBox="0 0 24 24" {...P}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>,
};
