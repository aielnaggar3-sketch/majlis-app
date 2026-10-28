# Majlis · مجلس

Sit in a virtual place (a café on the Nile, the pyramids at sunset, a founders' loft) and talk out loud with AI characters. Arabic (Egyptian dialect) is the default language, with full right-to-left layout; English is the second language.

اقعد في مكان افتراضي، قهوة على النيل أو الهرم وقت المغربية، واتكلم بصوتك مع شخصيات ذكاء اصطناعي. اللغة الأساسية عربي باللهجة المصرية، والإنجليزي لغة تانية.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 (redirects to /ar)
```

No keys are needed. Without them:

| Piece | Without a key | With a key |
|---|---|---|
| Character replies | Scripted demo lines (the room says so) | Claude, set `ANTHROPIC_API_KEY` |
| Voice | The browser's own speech recognition and voices (best in Chrome; quality varies) | Azure Speech or ElevenLabs, see `src/server/voice` |
| Storage | In-memory, resets on restart | Postgres schema and seed are ready; the Postgres store is the next step |
| Payments | Paid sessions show the price and stop at "payments aren't connected yet" | Stripe and Paymob, not built yet |

Copy `.env.example` to `.env.local` to add keys. Never commit `.env.local`.

## Checks

```bash
npm run typecheck
npm test           # domain rules, prompts, safety screen, Arabic search, translation parity
npm run build
```

CI runs all three on every push and pull request.

## What's in this build

- Screens: home, explore (Arabic-aware search and filters), venue page with a session builder and live price quote, the voice room (captions, mic, typing fallback, per-character mute, timer), session summary, characters and the coupon wallet.
- Rules enforced on the server: the price is re-quoted when a session starts, the free intro is one 15-minute session with up to 2 characters in a free venue, subscription minutes are deducted up front, and coupons turn "redeemed" only when the partner confirms.
- Every character tells the user it is AI in its first line, and the system prompt keeps it that way.
- A dev partner endpoint (`POST /api/partner/redeem`, header `x-partner-token`) stands in for the sponsor portal.

Not yet built: sign-in, the Postgres-backed store, payments, the admin and sponsor portals, and server-side voice. The design prototype covers the portals. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the layout and the plan.
