# internetdinero — Site Direction & Lead-Gen Strategy

## Context
Brand-new, empty project (`/Users/larrypope/Desktop/internetdinero`). No code exists yet and the user explicitly wants **direction, not code**. internetdinero builds software solutions for local businesses: websites, AI assistants that run/market those websites, an instant-quote plugin, email capture + follow-up marketing, and (future) an online-ordering plugin that prints orders at the store for pickup. A developer-focused SEO QA system is also planned as a future internal tool and potential product. The site must serve two jobs:
1. A **reference/portfolio** ("check out internetdinero.com" + GitHub as a living resume).
2. A **lead-generation machine** for local businesses, eventually backed by a marketing campaign.

Decisions from the user:
- **Language:** English now, architected so Spanish can be added later (the name itself hints at it — future differentiator).
- **Primary conversion:** Email capture (lead magnet → nurture sequence). Quotes/calls are secondary CTAs.
- **Target:** Any local business at first; niche down later based on response.
- **Stack:** My pick.

## Core strategic idea: the site IS the demo
Every product internetdinero sells should be *running live on the site itself*. A business owner shouldn't just read about an AI assistant — they should talk to one. They shouldn't read about email capture — they should get captured and then receive the follow-up sequence, experiencing exactly what their customers would. "This site was built with the same tools we'll build for you" is the whole pitch. This turns a portfolio into proof.

## Positioning
- **One-liner direction:** "Software that makes your local business money while you run it." (dinero = money — lean into it in English copy: "internet + dinero. We build the internet part; you collect the dinero.")
- **Audience:** Local business owners — non-technical, busy, skeptical of agencies, care about phone calls/orders/booked jobs, not tech.
- **Voice:** Plain English, zero jargon, outcome-first ("Never miss a lead again", "Quotes delivered in minutes, not days").
- **Differentiators to hammer:** (1) you build real software, not template sites — GitHub proves it; (2) everything is demoed live; (3) local — you can meet face to face.

## Site architecture (pages & sections)

### Home (the lead-gen workhorse)
1. **Hero:** outcome headline + subhead + primary email-capture CTA (lead magnet, below).
2. **Problem strip:** 3 pains local owners feel (missed calls after hours, slow quotes losing jobs, no follow-up with past customers).
3. **Solutions grid:** Websites · AI Assistants · Instant Quotes · Email Marketing · Online Ordering · SEO QA (each links to its solution page; unreleased products are clearly labeled).
4. **Live demo bar:** persistent AI assistant chat widget on every page — it answers questions about internetdinero AND captures email/phone naturally in conversation. This is the flagship demo.
5. **Proof section:** GitHub showcase (see below) + testimonials as they come.
6. **Final CTA:** email capture again.

### Solution pages (one per product — these are also the SEO pages)
Each follows the same template: pain → how it works (plain English) → **live interactive demo** → what it costs / how to start → email CTA.
- `/websites` — sites that sell, not brochures.
- `/ai-assistants` — the site's own widget is the demo.
- `/instant-quotes` — the quote plugin, embedded live: visitor plays "customer," fills a sample quote form, gets an instant emailed quote → *they just experienced the product and gave you their email*.
- `/email-marketing` — capture + follow-up sequences; show a sample sequence.
- `/online-ordering` — order → print at store → pickup. Mark "coming soon" until built; collect emails as a waitlist (validates demand before you build it).
- `/seo-qa` — future developer SEO QA product. Initially show the vision and, once usable, a live audit/diff demo rather than presenting it as a generic SEO score checker.

### Work / Proof page (`/work`)
- GitHub-as-resume, curated: don't rely on the raw profile — feature 3–6 selected public repos as **cards with screenshots, a one-line business outcome, live demo link, and "view code" link**. Business owners see outcomes; technical evaluators can inspect real code.
- Most production tools may remain private. Represent those with live demos, screenshots, architecture explanations, and case studies without exposing source; publish small standalone examples or reusable components only when they strengthen the portfolio.
- GitHub is the supporting proof of professional engineering, not a required application integration. The internetdinero site demonstrates the tools; selected public code substantiates the work.
- As real client projects land, this page evolves into case studies (before/after, numbers).

### Free-resources page (`/free`) — the lead-magnet hub
See lead magnets below. Each magnet = its own capture form = its own email tag for targeted follow-up.

### "Get Online" animated explainer (`/get-online` + featured on Home)
- An **in-page animated section built in code** (SVG/CSS/JS scroll- or click-driven) walking a business owner through how easy it is to get online with Cloudflare: pick a domain → point it at your new site → live in minutes, fast and secure.
- Cloudflare linked simply as the domain + hosting provider used (here and in the footer) — credit, not a pitch.
- Doubles as a portfolio proof piece: "we build animations like this for your site too."
- **Later:** export/produce a shareable .mp4 version of the same animation for the marketing campaign (social posts, the Report Card follow-up emails).

### About + Contact
- About: local angle, face, story — trust for local buyers. Contact: form + the AI assistant.

## The email-capture engine (primary conversion)
- **Flagship lead magnet:** **"Free Website & Google Report Card"** — visitor enters business name + email; they get a graded audit of their website/Google presence with 3 specific fixes. Start manual/semi-automated (you produce it; great sales-conversation starter), then let the future SEO QA system automate and deepen it. This magnet works for *any* local business, matching the broad targeting.
- **Secondary magnets** (add over time, one per niche/product): "5 reasons customers pick your competitor" checklist; ordering-plugin waitlist; quote-plugin sample demo (form itself captures email).
- **Follow-up sequence (per magnet):** Day 0 deliver magnet → Day 2 quick-win tip → Day 5 relevant demo ("talk to the assistant on our site") → Day 9 soft offer (free 15-min chat) → then a monthly local-business-tips newsletter. Every email demonstrates the email-marketing product by existing.
- **Capture everywhere:** hero, footer, exit/scroll prompt, inside the AI chat, inside every demo.

## Future product: developer SEO QA system
This is an eventual product, not part of the first site build. Build it for internal use first so internetdinero can validate it across its own sites before deciding whether to sell it to developers and agencies.

### Product thesis
- Do not build another one-time SEO checker. Build a version-aware QA system that explains what changed between two website versions: **"This code change improved these 13 things and broke these 2 things."**
- Keep three kinds of evidence separate: crawl findings (what exists on the site), version diffs (what changed), and outcome data (what happened afterward in search and performance).
- Close the loop later with Google Search Console: connect a technical fix to subsequent changes in impressions, clicks, CTR, and average position. Treat correlation as evidence, not automatic proof of causation.
- Let users name target keywords or phrases. Obtain rankings through a compliant search-results data provider, crawl the leading pages, and compare observable content and technical patterns to identify opportunities. Do not make direct Google-result scraping a core dependency.

### Intended architecture
```text
User starts audit
       ↓
Astro dashboard → Cloudflare Worker API creates audit job
       ↓
Cloudflare Queue distributes URLs
       ↓
TypeScript crawler workers parse HTML with Cheerio
       ↓
Cloudflare D1 stores audits, page findings, and version diffs
       ↓
Dashboard reports improvements, regressions, and unresolved issues
```

- Prefer D1 for the first Cloudflare-native version and straightforward local development; reconsider Postgres only if later scale or analytics requirements justify the operational change.
- Add Google PageSpeed API data for performance checks.
- Add JavaScript-rendered crawling later with Playwright or Cloudflare Browser Rendering after the static-HTML crawler is reliable.
- Add Google Search Console authorization and outcome correlation after audit history and diffs are trustworthy.
- The simple public Report Card remains the local-business lead magnet; the deeper dashboard becomes an internal QA tool and potential developer/agency product.

## Tech recommendation (for when building starts — no code yet)
- **Astro + one global CSS file, deployed on Cloudflare Pages (free).** Rationale: outputs plain fast static HTML (great Lighthouse = great local SEO), supports the user's stated global-CSS approach, component templates keep the 5+ solution pages consistent, has first-class i18n routing for the future Spanish version, and content collections make the SEO/blog pages cheap to add. The repo itself is portfolio-quality.
- **Backends as portfolio pieces:** email capture endpoint, quote-plugin API, AI assistant, and eventual SEO QA API on **Cloudflare Workers**. Keep production tools private when appropriate; publish selected repositories or self-contained examples on `/work` so the infrastructure still supports the portfolio.
- **Email sending:** start with a free-tier ESP (e.g. MailerLite/Brevo) for sequences; graduate to Cloudflare Email/custom as the email-marketing product matures.
- Design system: global CSS custom properties (colors, spacing, type scale) so client demo sites can later be re-skinned from the same base — again, dogfooding.

## Brand & design direction
**Identity: premium dark + money green.** Dark, high-end feel (near-black base with a subtle green tint, e.g. `#070B09`) with a rich money-green accent (`#31D286` / deep `#17925B`) used sparingly for glow, CTAs, and highlights. Light/white text (`#EDF3EE`). This positions internetdinero as high-value software, and doubles as instant dev-cred for the GitHub audience.

- **Name treatment:** one word, lowercase — `internet` in white, **`dinero` in the green accent** (or bolder weight). The money meaning pops without saying it.
- **Logo — DONE (Texas street-sign family).** After a long exploration (rounds preserved in `design/logo-*-round/` and on the review artifact), the brand landed on a **green street-sign reading "Dinero" beside a gold Texas silhouette** with **HWY** centered on the state and a cream star at **Galveston** (home turf; ties to the real town of Dinero, TX). Compact 2:1 plate. The Texas outline is traced from US Census boundary data through a Lambert conformal conic projection, then Douglas–Peucker–simplified to two tiers (`design/dinerohwy-brand/texas-silhouette.svg`). Family in `design/dinerohwy-brand/` (source of truth, mirrored to `site/public/assets/`): primary 400×200 (gold Texas), square mark/favicon 240×240 (**cream** Texas + gold star, inverted for small-size contrast), one-color (outline Texas), apparel (fabric-weave filter). All text outlined to `<path>` from **Avenir Next Condensed Bold**. Coin gold `#D9B36A` stays logo-only. Earlier flat-sign (H-star, black HWY tab) and "internetdinero" explorations are superseded.
- **Homepage layout — CHOSEN (direction B): bold & centered** — big centered headline ("Never miss a lead again."), wide green gradient glow behind the hero, centered email-capture form, and a **monospace stat strip** under the hero (e.g. "3 min avg quote delivery · 24/7 AI assistant · 100% of leads followed up").
- Mockups reference: https://claude.ai/code/artifact/67e6626f-c5e1-4f6e-a0b9-4614a5d47b47 (scratchpad file `id-design-directions.html`). Palette/typography tokens shown there are the starting global CSS tokens.
- **Coin gold (#D9B36A) is a logo-only detail** — never a second UI accent.
- **Typography:** a confident modern grotesque/geometric sans for headings and UI; optional monospace touches (stats, code-flavored details) for subtle dev credibility.
- **Global CSS system:** all colors/spacing/type as CSS custom properties (`--bg`, `--accent`, `--text`, scale tokens) in the one global stylesheet — the same token system later re-skins client demo sites (dogfooding the "design system" pitch).
- **Motion:** restrained glow/hover effects and the scroll-driven Get Online animation carry the premium feel; keep page weight low so Lighthouse stays ≥95.
- **Balance check:** premium dark can feel cold to non-technical local owners — offset with plain-English copy, warm photography/your face on About, and friendly microcopy. Dark = premium, not intimidating.
- **Accessibility:** green-on-dark must hold ≥4.5:1 contrast for text; test the accent for both text and non-text uses.

## Campaign discipline: hybrid 1x1x1
The **site stays broad** (full portfolio + general Report Card magnet — it's the reference/resume), but **every campaign push runs 1x1x1**: one avatar × one offer × one channel per push. Example: push #1 = home-service businesses × Report Card × local Facebook groups; run it until it clearly works or clearly doesn't before changing any variable. Each push gets its own landing page variant (same template, avatar-specific headline/pains) and its own email tag so results are measurable per push. Whichever avatar/channel combo wins becomes the Phase 4 niche-down.

## Marketing / rollout phases
1. **Phase 1 — Reference site:** Home, /work with 2–3 polished repos, About, basic email capture wired to a real list. Good enough to say "check out my site."
2. **Phase 2 — Demo depth:** AI assistant widget live, quote-plugin demo page live, "Get Online with Cloudflare" animated section live, Report Card magnet + 4-email sequence running.
3. **Phase 3 — Local campaigns (1x1x1 pushes):** Google Business Profile for internetdinero, 8–10 local-SEO landing/blog pages ("[service] for [your city] businesses"), then sequential campaign pushes — each one avatar × the Report Card offer × one channel (local Facebook groups, door-to-door, chamber events) with its own landing page + email tag. Every audit delivered = warm sales conversation. Produce the shareable .mp4 version of the Get Online animation for social posts.
4. **Phase 4 — Niche down:** double down on whichever niche responded (restaurants → ordering plugin; home services → quote plugin); add Spanish version as a market differentiator.
5. **Future product track — SEO QA:** build the crawler and audit history for internal use, add version-to-version regression reporting, then add PageSpeed, JavaScript rendering, Search Console outcome correlation, and keyword/competitor research in that order. Validate it on internetdinero projects before considering a developer/agency release.

## Verification (when implementation eventually happens)
- Each phase ships something publicly checkable: page renders on the live Cloudflare Pages URL, email capture round-trips to a real inbox with the sequence firing, AI widget answers product questions, quote demo delivers an emailed quote end-to-end.
- Lighthouse ≥ 95 on mobile for Home and solution pages (local SEO depends on it).
- When the SEO QA track begins, verify that a controlled site change produces the expected audit diff, URL jobs can fail/retry without losing the audit, and historical results remain comparable across deployments.

## Immediate next steps (still no code)
1. Approve/adjust this direction.
2. Decide the flagship lead magnet wording ("Report Card" vs alternatives).
3. First build target when ready: Phase 1 skeleton (Astro + global CSS + Home + /work + capture form).
