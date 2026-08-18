# Galveston Launch Playbook (bootstrapped, ground-first)

**Why Galveston:** 8.9M visitors/yr, $1.3B spent, 1 in 3 island jobs is tourism
([Visit Galveston 2024](https://www.visitgalveston.com/annual-report-2024/)). The
businesses serving those visitors **live or die by being found online** — a dense,
walkable concentration of the exact ICP (`docs/go-to-market.md`).

The Seawall's millions are **tourists, not buyers of web services.** So we don't
sell to the crowd — we use the crowd to make island **owners** find us.

## Two loops

### Loop A — B2B ground game (this is the money)
Walk the districts, talk to owners, leave value. The taco-stand motion, concentrated.
- **Where:** The Strand (Historic District), Seawall Blvd (restaurants, rentals,
  watersports, souvenir), Postoffice St, Pier 21, 25th St. Target owner-operated:
  restaurants, food stands, boutiques, coffee/ice-cream, tour & fishing charters,
  bike/scooter/umbrella rentals, salons.
- **The move:** walk in, ask for the owner, lead with the **free Report Card**
  (value first), leave a **card**. Don't pitch a build on day one.
- **30-second script:** *"Hey — I build websites for Galveston businesses, local.
  I put together a free 'Report Card' that shows how well visitors can find you
  online and 3 quick fixes. No charge, no pitch. Want me to run yours? Here's my
  card — scan it or I'll email it over."* → then, if it lands, the bottleneck
  conversation (missed calls, no online ordering/booking).
- **Sequence (locked GTM):** **create digital value first** (the Report Card, then
  a real site) → **then streamline the bottleneck with AI.**

### Loop B — Consumer showcase (the amplifier)
**Island Breeze** — a live Galveston aggregator on **fromgalveston.com**
(water/tide/flags/weather, what's open, events — auto-pulled; see
`docs/fromgalveston-aggregator.md`), **interlinked with dinerohwy.com/galveston**.
Put **QR stickers** where locals/tourists are; scans get real value first, then
discover Dinero Hwy built it → seeds brand + shows owners what you can do. (It's a
proof piece of the engineering — not a corny "report.")
- **Placement (permission first!):** coffee-shop community boards, laundromats,
  bike-rental counters, short-term-rental welcome binders, chamber boards. Ask
  businesses to display a card/sticker — that itself starts a Loop-A conversation.

## The assets (built — in `site/public/assets/qr/` + `design/print/`)
- **`/galveston`** landing page — the destination for all QR/cards.
- **Business cards** (`design/print/galveston-cards.html`) — Loop A hand-offs.
- **Round stickers** — Loop B placement.
- **UTM QR codes** — `qr-card`, `qr-sticker`, `qr-seawall`, `qr-strand`
  (`utm_source=…` → `/galveston`). Use the right one per placement so scans are
  attributable.

## Tracking (know what actually works)
- Each placement = its own `utm_source`; `/galveston` rewrites the capture
  `source` to `galveston-<utm>` → lands in D1. Weekly: `wrangler d1 execute
  dinerohwy-leads --command "SELECT source, COUNT(*) FROM leads GROUP BY source"`.
- Double down on the placement/street that produces conversations; drop the rest.

## First-week checklist
1. Print 100 cards + 25 stickers from `design/print/galveston-cards.html`.
2. Walk The Strand + one Seawall block; goal = **10 owner conversations**, leave a
   card at each, run 3 Report Cards.
3. Place 5 stickers (with permission) at coffee/rental spots.
4. Post the offer into 2 Galveston FB groups (`cross-platform.md`).
5. Friday: check D1 sources, note which street/placement converted, plan week 2.

## Legal / respect
Only place stickers on **permitted surfaces / with owner permission** — never
public property or someone's storefront without asking. The ask itself is a warm open.
