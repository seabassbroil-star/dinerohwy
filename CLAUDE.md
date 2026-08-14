# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Dinero Hwy** (`dinerohwy`) builds websites and automation for local businesses. The pitch: "Software that makes your local business money while you run it" — internet + dinero. The strategic core is that **the site itself is the demo** — every product sold (instant-quote plugin, review app, AI assistant, email capture) runs live on the site as proof, not just described.

Current state: a full **Astro site on Cloudflare Pages** with working email capture, an instant-quote demo, a review-app demo, and a cron-driven follow-up email engine. See `README.md` for the feature/roadmap overview and `docs/provisioning.md` for infra setup.

> **Naming note:** `PLAN.md` predates a rebrand and still says "internetdinero." The live brand is **Dinero Hwy**. Treat `PLAN.md` as strategic direction only; the code/brand/palette below are canonical where they differ from it.
>
> The original single-file coming-soon page is preserved at `design/coming-soon-reference.html`.

## Commands

All web work is in `site/`. Run from there:

```bash
npm run dev      # astro dev — D1/R2 bindings emulated via platformProxy
npm run build    # astro build → dist/ (static + /api worker)
npm run preview  # build + `wrangler pages dev ./dist` (exercises the real worker)
npm run deploy   # build + wrangler pages deploy ./dist --project-name dinerohwy
```

The follow-up mailer is a **separate deploy unit** in `workers/mailer/` (`npm run deploy` / `npm run check` for a dry-run). There is no test runner or linter configured; `npm run build` is the compile/type gate.

Local D1 for dev: `npx wrangler d1 execute dinerohwy-leads --local --file=./schema.sql` (from `site/`), then query with `--local --command "SELECT …"`.

## Architecture (the big picture)

- **Astro 5 + `@astrojs/cloudflare`, `output: "static"`.** Pages prerender to HTML (Lighthouse ≥95 is a requirement — local SEO depends on it). Only files under `src/pages/api/` set `export const prerender = false` and run as Pages Functions; `dist/_routes.json` routes `/api/*` to the worker and serves everything else static.
- **React is islands-only.** The only client JS comes from two interactive demos — `src/demos/ImageQuote` and `src/demos/ReviewApp` — hydrated with `client:visible`. Everything else is zero-JS `.astro`. Keep it that way: don't add framework components to static pages.
- **Two deploy units, one D1.** Cloudflare Pages has **no cron**, so the email follow-up sequence lives in a standalone Worker (`workers/mailer/`) with a Cron Trigger, binding the **same** D1 database (`dinerohwy-leads`). Both `wrangler.jsonc` files must carry the same `database_id`. The mailer imports the site's shared logic via relative paths (`../../site/src/...`) so the funnel has one source of truth.
- **Email flow:** capture → `/api/subscribe` upserts a lead in D1 and sends Day0 via `src/lib/email.ts` (Resend wrapper); the mailer cron sends Day2/5/9 by reading `SEQUENCE` in `src/lib/leads.ts` and advancing `seq_step`/`next_send_at`. Templates are inline-CSS HTML in `src/emails/` (email clients ignore `<style>`/SVG). If `RESEND_API_KEY` is unset (dev), sends are logged, not delivered.
- **Quote flow:** `src/demos/ImageQuote/quote-math.ts` is pure and shared — the island shows the instant estimate and `/api/quote` **recomputes it server-side** (never trusts client numbers) before uploading the photo to R2 and emailing the quote.
- **i18n:** Astro native, `prefixDefaultLocale: false` → English at `/`, Spanish at `/es/`. Helpers in `src/i18n/ui.ts` (`getLangFromUrl`, `useT`, `localizedPath`, `alternatePath`); strings in `en.json`/`es.json`.

## Design system & conventions

- **Tokens live in `src/styles/tokens.css`** (`--forest-950…700`, `--cream #f4eedc`, `--rust #c75a31`, type/space/radius scales). Extend tokens; don't hardcode values. The token set is intentional dogfooding — meant to re-skin client demo sites.
- **Brand = green street-sign / highway.** Backgrounds use the motif system in `src/styles/motifs.css` (42px grid, directional "route" lines, diamond waypoints, rust route-bar, clip-path star) via `RouteBackground.astro`. Desktop-forward; density reduced on mobile / reduced-motion.
- **Icons** are line-based on a 24px grid in `src/icons/index.ts`, rendered by `Icon.astro` (`currentColor`). Add new glyphs to the map.
- **Reused components:** `EmailCapture` (progressive-enhanced form, works without JS; used in hero/footer/demos), `DemoFrame` (live vs coming-soon chrome + waitlist capture), `SolutionCard`, `PainStrip`, `StatStrip`, `ProductLayout` (pain → how → demo → CTA template).
- **Logo SVGs** in `site/public/assets/` render their wordmark with live `<text>` in **Arial Narrow** — distorts off-Windows. Outline to `<path>` before relying on them at scale (flagged in the plan).
- **Security headers** are in `public/_headers` (edit there, not in HTML); assets get a 7-day cache.

## Docs

`docs/provisioning.md` (D1/R2/Resend/Pages setup + placeholders to replace), `docs/mobile-cockpit.md` (phone review→annotate→ship loop), `docs/galveston-beach-report.md` (SEO test track), `docs/outreach/cloudflare.md` (drafted partner email — not sent). `PLAN.md` holds the broader strategy and future SEO-QA product vision.
