# Architecture

## Layout

```
src/
  domain/        Pure rules with no I/O: catalogue, pricing, free-session eligibility, coupons, Arabic search, money.
  server/
    ai/          Character "brain": Claude (anthropic.ts) or scripted fallback, prompt + output schema, input safety screen.
    voice/       Speech-to-text and text-to-speech provider interfaces. "browser" today; Azure / ElevenLabs next.
    store.ts     Persistence interface. MemoryStore today; Postgres implementation next (schema in src/db).
    sessions.ts  Request schema, quoting, opening lines, conversation context.
    public.ts    What the client may see (character persona prompts never leave the server).
  db/            Drizzle schema, client and seed for Postgres.
  i18n/          next-intl routing: /ar (default, RTL) and /en.
  app/
    [locale]/    Pages.
    api/         Route handlers.
  components/    UI. Client components never import the catalogue, so persona prompts stay server-side.
messages/        ar.json (Egyptian Arabic) and en.json. A test keeps their keys and placeholders in sync.
```

## A turn in the voice room

1. The browser turns speech into text (Web Speech, `ar-EG` or `en-US`), or the user types.
2. `POST /api/sessions/:id/turns` checks ownership and time left, then runs the safety screen (length, crisis phrases in English and Egyptian Arabic).
3. The brain gets the cached system prompt (rules, cast, Egyptian-dialect instruction) and the last 16 turns, and returns JSON turns that match a schema. Unknown or muted speakers are dropped; group sessions get two turns.
4. The browser speaks each turn with that character's voice settings and shows captions.

If Claude declines a request, the route returns no turns rather than an error. If the API fails, the user sees "the character couldn't answer" and can try again.

## Adding a language

Add the locale in `src/i18n/routing.ts`, add `messages/<locale>.json`, fill the content fields in the catalogue (the parity test will point at gaps), map voices per character, and add the locale to `RTL_LOCALES` if it is right-to-left.

## Next steps

1. Postgres-backed `Store` and sign-in (email or phone OTP), replacing the anonymous cookie.
2. Server-side voice through LiveKit with Azure Speech (Egyptian Arabic voices) or ElevenLabs.
3. Payments: Paymob for Egypt, Stripe elsewhere, with webhooks granting entitlements.
4. Admin (content, RBAC, moderation queue) and the sponsor portal (campaigns, coupon confirmation, reporting).
