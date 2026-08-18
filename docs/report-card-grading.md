# Report Card — Grading Spec

The canonical grading system for the free **Website & Google Report Card**. This
is the reference we build against (`site/src/lib/report.ts` + `/api/report.ts`).

## Principles
1. **Owner-friendly front, rigor underneath.** What the owner sees is simple: one
   grade, five plain-English lever scores, and the top 3 fixes. The depth lives in
   an optional "full detail" appendix — enough to prove we're real developers.
2. **Grade GROWTH, not hygiene.** Every signal maps to a lever that moves money
   for a local business, not a generic web checklist.
3. **Never fake data.** We only report what we actually measured. Anything that
   needs a data source we haven't connected shows **"not yet measured"** — it is
   *excluded* from the grade, never guessed. (Especially Google/keyword data.)
4. **Honest about limits.** JS-rendered sites are flagged ("grade may be
   conservative"). We say what we checked and what we didn't.
5. **Voice:** opportunity over fear, plain language, dignity (`docs/messaging.md`).

## The 5 growth levers (the local-business money journey)
The overall grade is a weighted roll-up of five lever scores.

| Lever | What it answers | Weight |
|---|---|---|
| **1. Get Found** | Can people discover you at all? (SEO, local, speed) | 30 |
| **2. Get Chosen** | Once found, do they trust & pick you? (credibility) | 20 |
| **3. Get Contacted** | Can they act? (call, book, quote, directions) | 25 |
| **4. Get Measured** | Can you even see your leads? (analytics) | 10 |
| **5. Keep Them** | Do past customers come back? (capture, follow-up) | 15 |

Owner sees each lever as a word + short bar: *Strong / Good / Needs work / Missing*.

## Checks by lever
`Phase`: **1** = free/now, **PSI** = free + Google PageSpeed key, **Render** =
Cloudflare Browser Rendering (JS sites), **API** = Places/rankings, **GSC** = Search
Console. `pts` sum to the lever weight.

### 1 · Get Found — 30
| Check | Owner meaning | How detected | pts | Phase |
|---|---|---|---|---|
| Secure (HTTPS) | "Not secure" scares people off | final URL protocol | 4 | 1 |
| Works on phones | Most visitors are mobile; Google indexes mobile-first | viewport meta + Lighthouse mobile | 5 | 1 |
| Loads fast (Core Web Vitals) | Speed is a Google ranking factor | PageSpeed Insights (LCP/CLS/INP) | 6 | PSI |
| Indexable | Google is allowed to list you | robots.txt, `noindex`, sitemap.xml | 4 | 1 |
| Title & search description | Your headline in Google results | `<title>` + meta description | 4 | 1 |
| Findable locally | Show up in "near me" / the map | GBP presence, NAP, `LocalBusiness` schema, embedded map | 5 | 1 + API |
| Valid structured data | Google understands what you are | parse & validate JSON-LD | 2 | 1 |

### 2 · Get Chosen — 20
| Check | Owner meaning | How detected | pts | Phase |
|---|---|---|---|---|
| Clear offer up top | They know what you do in 2 seconds | `<h1>` + subhead present & meaningful | 5 | 1 |
| Reviews / ratings shown | Social proof drives the choice | stars/rating markup, review widgets, GBP rating | 5 | 1 + API |
| Trust signals | Photos, about, credentials, guarantees | detect about/gallery/license/guarantee sections | 5 | 1 |
| Quality & polish | Looks legit, no broken/mixed content | Lighthouse best-practices, mixed-content, console errors | 5 | PSI/Render |

### 3 · Get Contacted — 25
| Check | Owner meaning | How detected | pts | Phase |
|---|---|---|---|---|
| Tap-to-call | One tap = a phone call (highest-value button) | `tel:` link | 6 | 1 |
| Primary action button | Book / quote / order, above the fold | CTA detection near top | 6 | 1 |
| Hours + address + directions | Answers the two questions everyone asks | address block, hours, maps link | 5 | 1 |
| Working contact/quote form | A way to reach you that isn't a phone call | form + inputs present | 4 | 1 |
| Lead capture present | You catch the ones who aren't ready to call | email/phone field | 4 | 1 |

### 4 · Get Measured — 10
| Check | Owner meaning | How detected | pts | Phase |
|---|---|---|---|---|
| Analytics installed | You can see who's visiting | GA4/GTM/Pixel script detection | 6 | 1 |
| Lead/call tracking | You can prove what works | call-tracking / conversion tags | 4 | 1 |

### 5 · Keep Them — 15
| Check | Owner meaning | How detected | pts | Phase |
|---|---|---|---|---|
| Email/SMS capture | Turn one visit into repeat business | signup form / newsletter | 6 | 1 |
| Follow-up mechanism | Reasons to come back | newsletter/offers/loyalty detected | 4 | 1 |
| Social profiles linked | Another way to stay top-of-mind | social links | 3 | 1 |
| Repeat/booking path | Easy to buy again | "book again"/account/order-history hints | 2 | 1 |

**Total = 100.**

## Scoring
- Each check → **pass / warn / fail** = full / half / zero of its `pts`.
- **N/A handling:** a check whose data source isn't connected yet is marked
  *not yet measured* and **removed from the denominator** — we never penalize (or
  credit) for something we didn't actually check. The report shows each lever as
  *fully measured* or *partially measured* so the grade is honest.
- Lever score = its checks' points ÷ its measured points. Overall = weighted sum
  of lever scores, rescaled to measured weight.
- **Grade:** A ≥ 90 · B ≥ 80 · C ≥ 70 · D ≥ 60 · F < 60 · "—" if no reachable site.
- **No-website case:** returns the opportunity report (getting online is fix #1).

## What the OWNER sees (front)
1. **Grade** (letter + score) + a one-line, opportunity-framed verdict.
2. **Five lever bars** — Found / Chosen / Contacted / Measured / Keep — each a
   word (Strong/Good/Needs work/Missing).
3. **Top 3 fixes** — ranked by **impact × effort**, plain English, phrased as gains.
4. **"Want these done for you?"** capture.
5. Optional **"See the full detail"** → the technical appendix (collapsed by default).

## What's UNDERNEATH (technical appendix — proves we're real devs)
Every check with status + the raw evidence (the exact tag/header/metric found),
the methodology, Lighthouse/CWV numbers, crawl coverage (pages scanned), and any
limitations (e.g., "rendered with JS off — X may be understated"). This is the part
a technical evaluator (or a competitor's web guy) can't poke holes in.

## Output ranking = the actionable plan
- Each finding carries **impact** (which lever, how many pts) and **effort**
  (trivial / moderate / build). The top-3 = highest impact × lowest effort.
- Findings are grouped as: **crawl findings** (what exists) vs **version diffs**
  (what changed, once we re-run) vs **outcomes** (what happened in search, via GSC).
  Never blur the three (PLAN.md rule).

## Build phases (how each check becomes real)
- **Phase 1 — free, now:** replace regex with **`HTMLRewriter`**; multi-page crawl
  (home + sitemap + contact/services); robots/sitemap/indexability; security
  headers; structured-data validity; detect analytics / CTAs / reviews / capture;
  **flag JS-heavy sites.** Lights up most Get-Contacted / Measured / Keep checks.
- **Phase 2 — free + Google key:** **PageSpeed Insights API** → real Core Web
  Vitals + Lighthouse (perf/SEO/a11y/best-practices). Fixes the speed/quality gap.
- **Phase 3 — render JS:** Cloudflare **Browser Rendering** for the rendered DOM
  (kills the "big JS site under-graded" problem) + **axe-core** accessibility.
- **Phase 4 — local dominance:** **Places API** (GBP presence, reviews, hours, NAP)
  + a compliant **rankings provider** (keywords/competitors — never scrape Google).
- **Phase 5 — outcomes:** **Search Console** OAuth per client + **re-run & diff**
  over time ("improved 13, broke 2"). This is the SEO-QA product.

## Current state (v1, today) mapped to this spec
The live tool runs ~11 Phase-1 checks (HTTPS, mobile, tap-to-call, title,
description, local-ish, h1, social, alt, favicon, crude speed) via regex on
single-page HTML. Under this spec that's a **partial** Get-Found / Get-Chosen /
Get-Contacted read, with Measured + Keep + real speed still to come. Next build:
Phase 1 upgrade (HTMLRewriter + the missing detectors + honest N/A), then Phase 2.
