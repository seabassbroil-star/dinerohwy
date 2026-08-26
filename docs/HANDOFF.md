# Session handoff — current state & recovery (2026-08-25)

> Read this first. It's the ground truth after a long session that got tangled on
> Cloudflare accounts. All code is safe; the live deploy needs one recovery step.

## TL;DR
- **All code is built, committed, and on GitHub** (`main` @ `7b24906`). Nothing is lost.
- **The live deploy is currently BROKEN:** the `dinero-hwy` Cloudflare **Pages project was
  deleted by mistake** (it's one hyphen away from the old `dinerohwy` project). Recreate it
  with a single `wrangler pages deploy`.
- **The database, KV, all Workers, Turnstile, and email are intact** — those are separate
  resources and were NOT deleted.

## Accounts (this caused the whole mess)
- **codingsavage@proton.me** — account `8b01460b2f34f38394390c132bf49b99` — **THE HOME.**
  Holds the `dinerohwy.com` DNS zone, Email Sending + Routing, D1, KV, all 4 Workers, and the
  `dinero-hwy` Pages project (deleted — must be redeployed).
- **fromgalveston@proton.me** — account `d5f7ab0c6e4f19d0bb3a2a3654dc1f17` — **OLD.** Holds the
  old `dinerohwy` Pages project (`dinerohwy.pages.dev`) that still serves the OLD site and still
  holds the `dinerohwy.com` custom domain.
- **Naming trap:** `dinero-hwy` (hyphen, NEW, codingsavage) vs `dinerohwy` (no hyphen, OLD,
  fromgalveston). The domain is `dinerohwy.com`. Deleting/attaching the wrong one is the trap.

## Intact resources (do NOT recreate)
- **D1:** `dinerohwy-leads` — `f1de8e22-29f3-43a9-83c9-47c1f7243893`
- **KV:** `AIGATE` — `72fba8d2bf2c48d9ba48be410566c7bb`
- **Workers:** `dinerohwy-email` (tokenless send_email), `dinerohwy-render` (Browser Rendering),
  `dinerohwy-booking` (Durable Object), `dinerohwy-mailer` (daily cron follow-up)
- **Turnstile widget sitekey:** `0x4AAAAAAEawGmmRMkt49lED`
  (secret via `wrangler turnstile widget get 0x4AAAAAAEawGmmRMkt49lED`)
- **Email:** Sending onboarded for `dinerohwy.com`; Routing `contact@dinerohwy.com` → inbox.

## Recovery steps
1. **Auth non-interactively** with the API token being created (name "claude", codingsavage):
   `export CLOUDFLARE_API_TOKEN=$(cat ~/.cf-token); export CLOUDFLARE_ACCOUNT_ID=8b01460b2f34f38394390c132bf49b99`
2. **Recreate the Pages project:** `cd site && npm run build && npx wrangler pages deploy ./dist --project-name dinero-hwy`
   (bindings in `site/wrangler.jsonc` re-apply automatically: DB, AIGATE, AI, and the
   EMAIL_SENDER/RENDER/BOOKING service bindings).
3. **Re-set secrets** on the project: `LEAD_INBOX=Codingsavage@proton.me` and `TURNSTILE_SECRET`
   (from the widget). NOTE: `CLOUDFLARE_API_TOKEN` is NOT needed as a Pages secret — email now
   goes through the `EMAIL_SENDER` service binding, not the REST API.
4. **Redeploy** so secrets apply, then verify `dinero-hwy.pages.dev`.
5. **Domain:** free `dinerohwy.com` from the OLD `dinerohwy` project (fromgalveston → Settings →
   Domains → remove, or delete that project), then attach `dinerohwy.com` to `dinero-hwy`
   (codingsavage). DNS auto-configures (zone is in codingsavage).

## Verify (content, not HTTP status — both projects 200 everything via a catch-all)
- NEW homepage has a `nav-contact` button + a `/showcase` link; OLD one doesn't.
- `/report-card` returns a screenshot + AI summary; `/api/ai-verify` → 403 without a Turnstile
  token; contact form validates; `/booking-demo` loads live slots.

## What's built (all live once redeployed)
Report Card v2 (real screenshot + metrics + AI summary) · AI Copy Assistant (email-OTP +
Turnstile + per-IP/email rate limits + daily AI budget cap) · hardened Contact form · Services
page · real-time Booking demo (Durable Object) · Showcase page · email engine (tokenless send,
inbound routing, cron Day 2/5/9 follow-up). **Deploys are MANUAL — GitHub does not auto-deploy.**
