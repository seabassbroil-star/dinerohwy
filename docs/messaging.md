# Dinero Hwy — Messaging Guide

The voice for every page, email, ad, and script. If new copy doesn't fit this
sheet, rewrite the copy — not the sheet (or update the sheet deliberately).

## Governing ethos — the five principles behind every word
A calm, value-first backbone drawn from five Stoic ideas. This is **ethos only**:
we live by it, we **never quote the Stoics or use philosophy jargon on
customer-facing pages.** Everything below (investment/growth, AI-leverage, dignity,
honest price) is a tactic in service of these five.
1. **Don't sell fear.** No catastrophizing, no manufactured anxiety or urgency.
   Loss-avoidance lines ("you're losing money," "never miss") get reframed into the
   gain. Calm, present, confident.
2. **The obstacle is the way.** Being offline / "not a computer person" isn't the
   threat to fear — it's the untapped opening and the path to growth. Frame every
   gap as an opportunity.
3. **Ego is the enemy — humility both ways.** Never talk down to the owner; never
   make the copy about us. The customer is the hero; we're the guide who listens.
4. **You become what you think about.** Paint the opportunity vividly — show
   growth, not gloom. Help them see the opening, not the obstacle.
5. **It's how you react.** Agency. Empower the owner's decision and next step —
   they can't change being behind online, but they decide what to do now.

## Who we sell to & how (see docs/go-to-market.md)
- **We sell on the GROUND, in person.** The site does not close deals — its job is
  **credibility + a live demo + something valuable to bring to the conversation.**
  Write every page as proof you'd hand an owner face-to-face, not a cold-lead SaaS.
- **ICP:** approachable, owner-operated local businesses you can walk into and talk
  to the owner — food (taco stands, restaurants, butchers, bakeries), trades/home
  services, auto, shops, personal care. Owner 45+, "doesn't do computers." **Not**
  gated professional offices (lawyers) — slower networking path, deprioritized.
- **Offer sequence:** create **digital value first** (get online / digital real
  estate), **then streamline the bottleneck with AI** (quotes, calls, follow-up).

## Audience
Older, non-technical local business owners. They sense being online matters but
don't want to touch the tech. They buy outcomes and trust people, not features.

## The frame: investment & growth, not thrift
Lead with **upside and ownership**, never "it's cheap." A domain is appreciating
**digital real estate you own, not rent** — pair the number with growth every time
("watch it grow"). The most exciting prospect is an **established business with no
online presence**: capable owners who mastered their trade, not the web. Invisible
online ≠ behind — it's a spring held down, with all the growth still ahead. Treat
"doesn't do computers" with respect: it means they spent their years getting great
at the actual work. Thesis: **"You know your business. We know how to put it
online."** (Number: **~$12/yr** for the land, framed as an investment.)

## Message hierarchy (in this order)
1. **Outcome headline** — money, leads, never missing a customer.
   ("Never miss a lead again." / "Invest $12 a year in digital real estate — and
   watch it grow.")
2. **Fear-killer** — "You don't touch a keyboard. You don't need to understand
   AI either. That's our job."
3. **Credibility layer (the AI stack)** — *how* it's this fast/good/affordable:
   > "We build with the most advanced AI models on Earth — **Claude, ChatGPT,
   > and Grok** — so a small local shop gets big-agency work at a price that
   > makes sense."
4. **Human anchor** — "…with a human you can meet." Houston, face-to-face,
   accountable.
5. **Honest price split** — the land (domain + hosting on Cloudflare, ~$11/yr)
   vs. the building (the site, built by Dinero Hwy, **priced to fit** — simple
   site ↔ full storefront). Never imply $11 buys the site.

## Canonical lines (use verbatim where possible)
- "Software that makes your local business money while you run it."
- "We build the internet part. You collect the dinero."
- "Big-agency quality. Local-shop price."
- "The world's best AI does the heavy lifting. A Houston human does the caring."
- "Powered by Claude · ChatGPT · Grok" (the `AIStack.astro` chip strip)
- "Built with Claude, ChatGPT & Grok — and a human you can meet."
- "Invest $12 a year in digital real estate — and watch it grow."
- "You know your business. We know how to put it online. That's the whole deal."
- "A great business nobody can find online isn't behind — it's untapped."
- "Invest twelve bucks a year in digital real estate. Watch it grow." (commercial super)

## AI framing — dos and don'ts
- **Do** frame AI as *leverage* (power tools), never replacement. Every AI
  mention pairs with a human-accountability beat.
- **Do** name the models in plain text: Claude, ChatGPT, Grok. Named tools read
  as brand-name credibility, like the gear on a contractor's truck.
- **Do** keep AI as the *supporting* proof under outcome-first headlines — AI is
  the "how," never the "what you get."
- **Don't** use OpenAI/Anthropic/xAI logos or wordmark art — text only. No
  implied endorsement or partnership; "we build with" is our tooling choice.
- **Don't** say "AI-generated" about client deliverables — say "built with."
- **Don't** jargon: no "LLMs," "GenAI," "agentic," "frontier" on customer-facing
  pages (fine in the book, which teaches those words on purpose).

## Where it lives in code
- `site/src/components/AIStack.astro` — the reusable chip strip (hero, proof,
  footer). The commercial mirrors it with local `.ai-strip` styles.
- Cloudflare credit and the AI credit sit together in the footer — infrastructure
  and tooling, both named, both honest.

## Canonical lines — added with Episode 2 ("The Machine")
- "The sign gets them in. The machine brings them back."
- "It follows up while you sleep."
- "We run the machine. You collect the dinero."
- Price framing update (owner-confirmed): $12/yr is the sign — they own it with a
  small recurring payment. The build is case-by-case and entirely affordable:
  invite them to reach out, then set expectations fast about what we can and
  can't do. Never a published rate card; never imply $12 buys the site.
