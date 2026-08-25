# Dinero Hwy 🚦

**Software that makes your local business money while you run it.**

Dinero Hwy builds websites and automation for local businesses. The core idea:
**the site is the demo, the code is the proof.** Every tool runs live on the
site, and the source is public here — a business owner can *use* the tool, and a
developer can *read* how it's built.

This repo is a real reference build on the full Cloudflare platform — Pages,
Workers, D1, KV, R2, Browser Rendering, Workers AI, and Email — not a template.

---

## What's live

| Tool | What it does | Try it | Built with |
|---|---|---|---|
| **Website Report Card** | Grades a business site: real headless-Chrome **screenshot**, load metrics, 11 trust/SEO signals, and an **AI-written** next-step summary | [`/report-card`](https://dinerohwy.com/report-card) | Browser Rendering Worker + Workers AI |
| **AI Copy Assistant** | Drafts SEO description, Google post, and review replies — gated behind **email-verified** contact capture | [`/tools/ai-copy`](https://dinerohwy.com/tools/ai-copy) | Workers AI + KV (OTP) + Turnstile |
| **Contact / lead capture** | Hardened form (allowlist inputs, phone-or-email); each lead emailed to the owner | site-wide | Pages Fn + email Worker |
| **Email engine** | Capture → welcome → cron **Day 2/5/9** follow-up sequence; replies to `contact@` route back to the inbox | — | D1 + Email Sending + Email Routing |

## Security posture

- **Allowlist input sanitizing**, server-authoritative, one `LIMITS` source (client `maxlength` mirrors it).
- **Turnstile + per-IP / per-email rate limits + a daily AI budget cap** on the paid endpoints.
- **Email-OTP verification** (6-digit, hashed in KV, 5-try lockout) before the AI tool runs.
- **Tokenless email** and **SSRF-guarded** rendering via private, no-public-URL Workers.
- Secrets live only in Cloudflare + a gitignored `.dev.vars` — never in the repo.

## Architecture

```
Visitor ─► Astro (Cloudflare Pages, static, zero JS framework)
             ▼
          /api/* (Pages Functions)
             ├─ D1   (leads + email_events)
             ├─ KV   (OTP sessions, rate limits, AI budget)
             ├─ Workers AI (copy + report summaries)
             └─ service bindings (private, no public URL):
                  ├─ workers/email-sender  → Cloudflare Email Sending (tokenless)
                  └─ workers/render        → Browser Rendering (screenshots/metrics)

workers/mailer (cron) ─► same D1 ─► email        daily follow-up sequence
Email Routing: contact@dinerohwy.com ─► owner inbox
```

Multiple deploy units because **Pages can't host cron, Browser Rendering, or the
email binding** — those live in standalone Workers, reached over service bindings.

**Stack:** Astro 5 · `@astrojs/cloudflare` · Pages / Workers / D1 / KV / R2 ·
Browser Rendering · Workers AI · Email Sending + Routing · Turnstile · one
design-token system.

## Repo layout

```
site/                    Astro app + API routes → Cloudflare Pages
  src/
    styles/              design tokens + highway/route motifs
    components/          Header, Footer, Icon, RouteBackground, TextMe (contact)
    lib/                 report audit, sanitize/validate, email, leads, otp
    pages/ pages/api/    pages + report / ai-verify / ai-draft / subscribe endpoints
  schema.sql             D1 tables
workers/
  email-sender/          tokenless email (send_email binding)
  render/                Browser Rendering (screenshots + metrics)
  mailer/                cron Worker: the Day 2/5/9 follow-up sequence
docs/                    provisioning, messaging, go-to-market, grading
design/                  brand system + logo SVGs (source of truth)
```

## Run it

```bash
cd site
npm install
npm run dev        # astro dev — D1/KV emulated locally
npm run build      # static build → dist/
npm run deploy     # build + wrangler pages deploy
```

First-time infra setup (D1, KV, R2, Email Sending/Routing, Turnstile, Pages) is in
[`docs/provisioning.md`](docs/provisioning.md).

---

Galveston, Texas · built on **Cloudflare**.
