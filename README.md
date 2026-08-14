# Dinero Hwy 🚦

**Software that makes your local business money while you run it.**
*internet + dinero — we build the internet part, you collect the dinero.*

Dinero Hwy builds websites and automation for local businesses. The core idea:
**the site is the demo.** Every tool we sell runs live on this site, so a
business owner doesn't read about an AI quote tool — they use one, get a real
emailed quote, and become a captured lead in the process.

This repo is also a working reference build: a fast Astro site on Cloudflare
Pages, backed by real Workers, D1, and R2 — not a template.

---

## What's live

| Area | What it does | Real code |
|---|---|---|
| **Home** | Hero, pain strip, live-tools grid, proof, capture | zero-JS, static |
| **Instant Quotes** (`/image-quote`) | Upload a photo → instant on-page estimate → emailed quote → lead captured | React island + `/api/quote` + R2 |
| **Review App** (`/review-app`) | Screenshot → drop annotation pins → export Markdown / GitHub issue. The mobile cockpit. | React island, in-browser |
| **Email engine** | Capture → D1 → Day0 email; a cron Worker runs the Day2/5/9 follow-up sequence | `/api/subscribe`, D1, Resend, `workers/mailer` |
| **The book** (`/book/chapter-one`) | "Agentic AI, explained like you're a kid" — a playable look→think→do demo | interactive |
| **Xavier** (`/es/xavier`) | First case study, in Spanish (i18n ready) | Astro i18n |

## Architecture

```
Visitor ─► Astro (Cloudflare Pages, static)
             │  interactive islands: ImageQuote, ReviewApp (React)
             ▼
          /api/* (Pages Functions, SSR)
             ├─ D1  (leads + email_events)
             ├─ R2  (photo uploads)
             └─ Resend (transactional email)

workers/mailer (separate cron Worker) ─► same D1 ─► Resend
   daily: send due follow-up steps, advance the sequence
```

Two deploy units because **Cloudflare Pages has no cron** — the follow-up
sequence needs a standalone Worker with a Cron Trigger, sharing the D1 database.

**Stack:** Astro 5 · `@astrojs/cloudflare` · Cloudflare Pages / Workers / D1 / R2 ·
React (islands only) · Resend · one global-CSS design-token system.

## Repo layout

```
site/                 Astro app + API routes  → Cloudflare Pages
  src/
    styles/           design tokens + highway/route motifs
    components/       Header, Footer, EmailCapture, Icon, DemoFrame, RouteBackground…
    demos/            ImageQuote, ReviewApp (React islands)
    lib/ emails/      D1 helpers, Resend wrapper, email sequence templates
    pages/ pages/api/ routes + subscribe/quote/unsubscribe endpoints
    content/ i18n/    book chapters, case studies, en/es strings
  schema.sql          D1 tables
workers/mailer/       cron Worker: the follow-up email sequence
docs/                 provisioning, mobile-cockpit, Galveston SEO, outreach
design/               brand system + logo SVGs (source of truth)
```

## Run it

```bash
cd site
npm install
npm run dev        # astro dev — D1/R2 emulated locally
npm run build      # static build → dist/
npm run deploy     # build + wrangler pages deploy
```

First-time infrastructure setup (D1, R2, Resend, Pages↔GitHub) is in
[`docs/provisioning.md`](docs/provisioning.md).

## Design system

One global token set (`site/src/styles/tokens.css`) — forest greens, cream, a
rust street-sign star — reused across the whole site and meant to re-skin client
demo sites from the same base. Backgrounds use a "highway" motif system (grid,
routes, waypoints) for directional flow. Line icons live in `src/icons/`.

## Roadmap

- ✅ Phase 1 — design system, home, email capture + Day0, instant-quote demo
- ✅ Phase 1.5 — mailer cron (Day2/5/9 sequence)
- ✅ Phase 2 (partial) — review-app cockpit, product/case-study pages
- ⏳ Phase 3 — book chapters as MDX with per-section demos, full `/es` mirror
- ⏳ Later — Intel assistant (AI chat), SEO Assistant + Galveston test page,
  online-ordering plugin, `/api/review` → GitHub issues

---

Houston, Texas · Domain & hosting on **Cloudflare**.
