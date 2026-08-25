# CLAUDE.md

Guidance for Claude Code working in this repo.

## What this is

**Dinero Hwy** (`dinerohwy`) builds websites + automation for local businesses —
"Software that makes your local business money while you run it." Sales happen
**in person, on the ground**; the site is credibility + a live demo, not a cold
closer (see `docs/go-to-market.md`, the governing GTM strategy).

Two things are actually live and wired:
1. **The Report Card grader** — a free, honest website audit (the demo/lead magnet).
2. **The email engine** — capture → welcome → 3-step follow-up sequence.

Everything else on the site is static marketing/portfolio pages.

## Current state & known gaps

- **Live product surfaces are only the two above.** No quote demo, no review app —
  those were removed. Don't reintroduce them without being asked.
- **The lead funnel is unfinished:** email/business are **optional** on the Report
  Card, so visitors can get the full result without becoming a lead. Capturing
  leads before promotion/indexing is the intended next build.
- **Vestigial config — don't trust it:** `astro.config.mjs` still registers the
  `react` integration and i18n (`en`/`es`), but there are **no React islands, no
  `.tsx` files, and no `/es/` routes** — the site is zero-JS-framework and
  English-only in practice. `src/components/EmailCapture.astro` and `src/i18n/*`
  exist but are **orphaned** (imported nowhere / unreachable). R2 is commented out
  in `site/wrangler.jsonc`. Treat all of these as dead code, not features.

## Commands

All web work is in `site/`. Run from there:

```bash
npm run dev      # astro dev — D1 emulated via platformProxy
npm run build    # astro build → dist/ (static + /api worker). THE compile/type gate.
npm run preview  # build + `wrangler pages dev ./dist` (exercises the real worker)
npm run deploy   # build + wrangler pages deploy ./dist --project-name dinerohwy
```

No test runner or linter — `npm run build` is the only gate.
Local D1: `npx wrangler d1 execute dinerohwy-leads --local --file=./schema.sql`
(from `site/`), then query with `--local --command "SELECT …"`.

The follow-up mailer is a **separate deploy unit** in `workers/mailer/`
(`npm run deploy` / `npm run check` for a dry-run).

## Architecture (the non-obvious parts)

- **Astro 5 + `@astrojs/cloudflare`, `output: "static"`.** Pages prerender to HTML
  (Lighthouse ≥95 is a requirement — local SEO depends on it). Only files under
  `src/pages/api/` set `export const prerender = false` and run as Pages Functions;
  `dist/_routes.json` routes `/api/*` to the worker, everything else static.
- **Two deploy units, one D1.** Cloudflare Pages has **no cron**, so the email
  sequence lives in a standalone Worker (`workers/mailer/`) with a Cron Trigger
  (`0 14 * * *`, ~9am Galveston), binding the **same** D1 (`dinerohwy-leads`,
  id `434ee08c-6679-41e4-9c31-457dfec1b3ed`). Both `wrangler.jsonc` must carry
  that id. The mailer imports the site's shared logic via relative paths
  (`../../../site/src/...`) so the funnel has one source of truth.
- **Report Card flow:** `report-card.astro` (a vanilla `<script>`, not React)
  POSTs to `/api/report`, which does a real server-side `fetch` of the URL then
  calls `auditHtml` in `src/lib/report.ts` — pure logic grading 11 weighted
  signals → score/grade/top-3 fixes. No external API. A lead is upserted **only**
  if the visitor entered a valid email.
- **Email flow:** capture → `/api/subscribe` upserts a lead in D1 and sends Day0
  via `src/lib/email.ts` (Resend wrapper). The mailer cron sends Day2/5/9 by
  reading `SEQUENCE` in `src/lib/leads.ts` and advancing `seq_step`/`next_send_at`;
  `/api/unsubscribe?id=` opts out. Templates are inline-CSS HTML in `src/emails/`.
  If `RESEND_API_KEY` is unset (dev), sends are logged, not delivered.
- **Data model:** `site/schema.sql` — `leads` (email-unique, `seq_step`,
  `next_send_at`, `unsubscribed`) + `email_events`. `upsertLead` never resurrects
  an unsubscribed contact.

## Pages & components

- **Pages** (`src/pages/`): `index`, `about`, `report-card`, `thank-you`
  (noindex), `tools`, `portfolio/{index,dinerohwy,fromgalveston}`.
- **Components** (`src/components/`, 5): `Header`, `Footer`,
  `Icon` (glyphs from `src/icons/index.ts`, `currentColor`, 24px grid),
  `RouteBackground` (decorative highway grid + SVG routes; used once in
  `BaseLayout.astro`), and `EmailCapture` (progressive-enhanced form → orphaned).

## Design system

- **Tokens in `src/styles/tokens.css`** — forest ramp (`--forest-950…600`),
  `--cream #f4eedc`, `--rust #c75a31` (+ light/deep), Inter/condensed/mono fonts,
  type (`--step--1…4`) / space / radius / container (1080px) scales.
  **Extend tokens; don't hardcode values.**
- **Brand = green highway street-sign.** Background motifs in `src/styles/motifs.css`
  (42px grid, SVG route lines, diamond waypoints, rust route-bar, clip-path star),
  rendered by `RouteBackground.astro`. Density drops on mobile / reduced-motion.
- **Rust `#c75a31` is reserved for CTAs, wayfinding, and the logo badge** — not a
  general UI accent.
- **Logo SVGs** live in `site/public/assets/` (source of truth mirrored in
  `design/dinerohwy-brand/`), with all text outlined to `<path>`. Bump the `?v=`
  cache-buster on every reference when the art changes.

## Voice & strategy (read before copy work)

- **`docs/go-to-market.md`** governs GTM: ICP = approachable owner-operated local
  businesses (owner 45+, "doesn't do computers"); sell in person; create digital
  value first, then streamline the bottleneck with AI.
- **`docs/messaging.md`** holds voice/ethos rules (outcome-first, human
  accountability, honest/opportunity framing — see `lib/report.ts` copy).
- **`PLAN.md`** is broader strategic direction and predates the rebrand
  ("internetdinero"); treat it as vision, not current-state truth.

## Docs

`docs/provisioning.md` (D1/Resend/Pages setup), `docs/report-card-grading.md`,
`docs/mobile-cockpit.md`, `docs/go-to-market.md`, `docs/messaging.md`.
