# Provisioning — one-time setup

The code is done; these are the manual Cloudflare steps that wire it to
real infrastructure. Run everything from `site/` unless noted.

## 1. Create the leads database (D1)

```bash
cd site
npx wrangler d1 create dinerohwy-leads
```

Copy the printed `database_id` into **both**:
- `site/wrangler.jsonc` → `d1_databases[0].database_id`
- `workers/mailer/wrangler.jsonc` → `d1_databases[0].database_id`  ← must be the SAME id

Apply the schema (local for dev, remote for production):

```bash
npx wrangler d1 execute dinerohwy-leads --local  --file=./schema.sql
npx wrangler d1 execute dinerohwy-leads --remote --file=./schema.sql
```

## 2. Create the uploads bucket (R2)

```bash
npx wrangler r2 bucket create dinerohwy-uploads
```

## 3. Email sending (Cloudflare Email Sending REST API)

The site sends via the Cloudflare Email Sending REST API. Pages Functions **cannot**
use the tokenless `send_email` binding, so `site/src/lib/email.ts` calls the REST
endpoint (`POST /accounts/{id}/email/sending/send`) with a scoped API token.

1. **Onboard the sending domain.** Dashboard → **Email Service** → **Email Sending**
   → **Onboard Domain** → `dinerohwy.com` → *Add records and onboard*. Since DNS is
   on Cloudflare, this auto-adds SPF + DKIM (the records that make mail land). The
   Email Sending product must be enabled on the account first (it's open beta).
2. **Confirm the sender.** `MAIL_FROM` in `site/wrangler.jsonc` must use that
   onboarded domain (`Dinero Hwy <hello@dinerohwy.com>`). `CLOUDFLARE_ACCOUNT_ID`
   is also a `var` there (not secret).
3. **Create an API token.** My Profile → API Tokens → Create → permission
   **Account → Email Sending → Edit**.
4. **Set the secrets.** The token is a secret; `LEAD_INBOX` is where "text me"
   submissions are forwarded:

```bash
# from site/  (Pages)
npx wrangler pages secret put CLOUDFLARE_API_TOKEN --project-name dinerohwy
npx wrangler pages secret put LEAD_INBOX          --project-name dinerohwy   # e.g. you@example.com
```

For the **mailer** (Day 2/5/9 follow-ups — separate deploy unit) to send too, set
the same three on that worker and add `MAIL_FROM` + `CLOUDFLARE_ACCOUNT_ID` to
`workers/mailer/wrangler.jsonc`:

```bash
cd ../workers/mailer
npx wrangler secret put CLOUDFLARE_API_TOKEN
```

Until the token is set, sends are logged (not delivered) — so **in production a
form will report success but no email goes out**. Deploy only after the token is set.

> Local real-send test: put `CLOUDFLARE_API_TOKEN` in `site/.dev.vars` (gitignored)
> and run `npm run dev`. Without it, dev just logs `[email:dev] would send …`.

## 4. Deploy

```bash
# site (Pages)
cd site && npm run deploy         # astro build && wrangler pages deploy ./dist

# mailer (cron Worker)
cd ../workers/mailer && npm run deploy
```

## 5. Connect the repo to Pages (enables the mobile-cockpit preview loop)

In the Cloudflare dashboard → Workers & Pages → `dinerohwy` → Settings → Builds:
- Connect the GitHub repo.
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `site`
- Production branch: `main`

Now every push to a branch gets a preview URL; `main` deploys production.
See [mobile-cockpit.md](./mobile-cockpit.md).

## Local dev quick reference

```bash
cd site
npm run dev        # astro dev, D1/R2 emulated via platformProxy
npm run preview    # build + wrangler pages dev ./dist (exercises the real worker)
```

## Placeholders to replace

| Placeholder | File | Replace with |
|---|---|---|
| `PLACEHOLDER-run-wrangler-d1-create` | `site/wrangler.jsonc`, `workers/mailer/wrangler.jsonc` | real D1 `database_id` |
| `CLOUDFLARE_API_TOKEN` (secret) | both deploy units | token with Email Sending: Edit |
| `LEAD_INBOX` (secret) | site (Pages) | inbox for "text me" leads (set ✓) |
| GitHub remote | repo | your `git remote add origin …` |
