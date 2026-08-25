# Target Customer — who we build content for

> Companion to `go-to-market.md` (who/where we sell) and `messaging.md` (how we sound).
> This doc: **who exactly the customer is, what we say to them, and how the funnel works end to end.**
> Every new page, ad, and email gets checked against this before it ships.

## The one-line customer

**An established business with real revenue, that mastered its trade — not the web — doesn't want the computer hassle, and loves money.**

Bridge to the GTM ICP (`go-to-market.md`): owner-operated, walk-in approachable, food / trades / auto / shops / personal care, owner typically 45+, Houston–Galveston ground game. "Established with revenue" is the filter that matters: we are not chasing startups or side hustles. We want businesses that already win offline — because for them, the internet is pure upside, not a gamble.

## What they believe (write copy from inside their head)

- They buy **outcomes and trust**, not features. Phone ringing, jobs booked, money in the drawer.
- "I don't do computers" isn't a weakness — it means they spent those years mastering the actual work. Copy always respects this (never talks down; see messaging.md).
- Word of mouth got them here, and word of mouth feels like the ceiling. They suspect there's more out there; they don't know how to reach it without the hassle.
- They've been burned or bored by agency pitches. Jargon reads as a scam signal.

## The pitch

**"$12 a year for an advertising sign that never comes down."**

That's the door. They *own* their spot — digital real estate, held with a small recurring payment, on Cloudflare, at cost. Simple, honest, no tricks.

Then the build cost gets **sprinkled in honestly, not hidden**:
- Every project is different — the site and the machine behind it are **priced to fit**, and entirely affordable.
- We don't publish a rate card; we invite them to **reach out** and we set expectations fast — what we can do, what we can't, and what it'll roughly take. First conversation, straight answers.
- Rule from messaging.md still governs: **never imply the $12 buys the site.** The $12 is the land; the building is the work.

## Objections → answers (all gain-framed, per the voice sheet)

| They say | We say |
|---|---|
| "All my business is word of mouth." | "Perfect — that means people already love the work. We give word of mouth a place to land, and a memory. It works while you sleep." |
| "I don't do computers." | "You don't touch a keyboard. That's the whole point — you stay the expert at your trade; the internet part is our trade." |
| "What's this really going to cost me?" | "Twelve bucks a year for your sign — you own it. The site? Every business is different. We'll look at yours and tell you straight, fast, what it takes and what you'd get." |
| "Is this AI stuff going to embarrass me?" | "We build with the best tools on Earth — Claude, ChatGPT, Grok — and a human you can meet checks everything. Nothing goes out you haven't seen." |
| "I'm too busy for this." | "That's exactly why it exists. It answers, quotes, and follows up while you run the shop." |
| "I don't have photos or videos for a website." | "If you have nothing, we can improve things a lot with a simple phone shoot — or refer a pro at the right price. Most shops need less than they think." |

## Services the content should picture (the full agency)

The commercials and pages should, over time, dramatize the whole machine — not just the sign:

1. **The sign** — domain + hosting, $12/yr, they own it. (Episode 1: `/get-online`)
2. **The site** — built for them, priced to fit, approve-don't-build.
3. **Analytics** — see every customer who found you, where from, what they wanted.
4. **Social spread** — one post carried down every road out of town (feed, search, maps, reviews).
5. **Follow-up / drip** — leads get an answer and a Day 0/2/5/9 follow-up sequence automatically (this is live code on our own site — `src/lib/leads.ts`).
6. **Content** — simple photo/video: iPhone-grade shoots we do, or a referred pro at the right price.
7. **Orchestration** — all of it tuned to *their* business and run as one funnel. Customizable at every point. (Episode 2: `/the-machine`)

**Tool → funnel stage map:**

| Stage | Asset | Status |
|---|---|---|
| Door-opener / magnet | Free Website & Google Report Card | LIVE |
| Pitch / demo (bring to the table) | Episode 1 "The Sign" (`/get-online`), Episode 2 "The Machine" (`/the-machine`) | LIVE |
| Live proof | Image Quote, Review App, the drip itself | LIVE |
| Mid-funnel | Email sequence Day 0/2/5/9 | LIVE |
| Targeting & expansion | SEO Assistant, Intel Assistant | COMING SOON |
| Trust layer | `/about`, `/work` (Xavier) | LIVE |
| Close | **In person.** The site is never the closer. | — |

## Campaign discipline

- **Hybrid 1x1x1** (from PLAN.md): the site stays broad; every outbound push is one avatar × one offer × one channel, with its own landing variant and email tag so it's measurable.
- **Reputation first.** Low-hanging fruit, do right by each business, and win the next job from the last one. We'd rather over-deliver for ten businesses than pitch a hundred.
- The in-person discovery method (how we learn a business's best customers and aim the machine) is **private** — it lives in `discovery-playbook.md` and never appears in public copy.
