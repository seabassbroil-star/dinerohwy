# Island Breeze — the Galveston aggregator on fromgalveston.com (Loop B showcase)

**Not a "beach report."** It's a fast, live **aggregator / island dashboard** —
one clean page that pulls the island's real-time info into a single place. Reads
as *engineering*, which is the point: it's a public proof piece that Dinero Hwy
builds real software. **fromgalveston.com is interlinked with dinerohwy.com**
(each links to the other; "built by Dinero Hwy" credit on it).

## What it aggregates (auto-pulled data, not a manual post)
Live island conditions + logistics in one glance:
- **Water & beach:** water temp, surf, tide chart, beach-flag status, UV.
- **Weather:** now + today's outlook.
- **Logistics:** cruise-ship days, what's open now, parking/traffic pressure.
- **Events:** what's on today/this week.
(Source from real feeds/APIs — NOAA/NWS tides & weather, public flag/beach data,
events — so it updates itself. Automatable > a folksy manual report.)

## Why it works
- **Genuinely useful** to locals and the 8.9M yearly visitors → real traffic.
- **SEO wedge:** freshness/recency is the one axis a brand-new, zero-authority
  domain can win — an auto-updating aggregator of question-shaped island queries
  ("galveston water temp / beach flags / what's open") ranks by simply being fresh
  and comprehensive. Keep dated/archivable URLs + submit to GSC day one.
- **Proof piece:** the cleanest live demo of Dinero Hwy's engineering; the QR/
  sticker showcase destination (Loop B in `docs/marketing/galveston.md`).
- **Single-variable SEO testbed** for the future SEO Assistant's crawl-diff loop —
  one page, changing on a known cadence, with GSC as the outcome signal.

## Interlink model
**Status: DEFERRED — don't wire live cross-links yet.** Both sites are still being
optimized; interlink both directions **once both are complete.** Plan:
- `dinerohwy.com/galveston` → links to Island Breeze as live proof ("we built this").
- `fromgalveston.com` → subtle "Built by Dinero Hwy · get your business found"
  credit → back to `/galveston`. Visitors get value first, then discover us.

## Build shape (when greenlit)
- Same Astro + Cloudflare stack; scheduled Worker pulls the feeds and caches;
  static-fast page + dated archive routes. Fits the mobile-cockpit loop.
- Wire Google Search Console; log impressions/clicks/position per query.

## Name — LOCKED: **Island Breeze**
The Galveston aggregator is **Island Breeze**, live at **fromgalveston.com**.
Warm, island-native name over a clean, fast, engineered dashboard — the contrast
is the charm. Tagline direction: "Island Breeze — Galveston, live." Never call it
a "report."
