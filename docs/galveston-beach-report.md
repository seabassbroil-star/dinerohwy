# Galveston Beach Report — SEO test track

A parallel property and the first live test subject for the SEO Assistant.
Documented now; **build is a later phase** (needs domain confirmation — do you
own `fromgalveston.com`?).

## The thesis

Ship a daily-ish **beach conditions** page at
`fromgalveston.com/beach-report/` — water color, seaweed, temp, tide, jellyfish,
flag status. Nobody "owns" those question-shaped queries, and **freshness** is
the one ranking axis a brand-new, zero-authority domain can win by simply
showing up consistently.

## Rules that make it work

- **Real photo 4×/week** (Mon/Wed/Fri/Sun). Shoot it; don't fake it.
- **Stamp the actual capture date** — never claim "today" when it's stale. The
  honest timestamp is the trust signal *and* the freshness signal.
- **Archive each day to a dated child URL** (e.g. `/beach-report/2026-08-14/`)
  so history accumulates and becomes internally linkable.
- **Submit to Google Search Console on day one.**
- After ~10 days, **let real impression data pick the next pages** instead of
  guessing.
- Keep it in a **subfolder, not a new domain** — the authority has to land on
  the property you're actually selling directory listings from.

## Why it's also the SEO Assistant's test subject

It's the cleanest possible **single-variable experiment**: one page, changing on
a known cadence, with a real outcome signal (GSC). That's the ideal input for
the SEO Assistant's crawl-diff loop — "this change improved these things, broke
these" — validated on our own property before it's ever sold.

## Rough build shape (when greenlit)

- Same Astro + Cloudflare Pages stack; a `/beach-report/` route + dated archive
  pages generated from a small content collection (one entry per capture day).
- A lightweight capture form (phone photo + the day's readings) → commit an
  entry → auto-deploy. Fits the mobile-cockpit loop.
- Wire GSC; begin logging impressions/clicks/CTR/position per URL.
- Feed the crawl history into the SEO Assistant's diff engine.

## Open question

- **Do you own `fromgalveston.com`?** If not, that's step zero. If yes, confirm
  and this moves from doc to build.
