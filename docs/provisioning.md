# Provisioning — one-time setup

The code is done; these are the manual Cloudflare/Resend steps that wire it to
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

## 3. Email sending (Resend)

1. Create a Resend account, add and **verify the sending domain** (`dinerohwy.com`)
   — this is the DNS step that sets SPF/DKIM/DMARC so mail actually lands.
2. Confirm the `RESEND_FROM` in `site/wrangler.jsonc` and `workers/mailer/wrangler.jsonc`
   uses that verified domain.
3. Set the API key as a secret in **both** deploy units:

```bash
# from site/
npx wrangler pages secret put RESEND_API_KEY --project-name dinerohwy
# from workers/mailer/
cd ../workers/mailer && npx wrangler secret put RESEND_API_KEY
```

Until the key is set, sends are logged (not delivered) so flows still work in dev.

> Swapping to Cloudflare Email later only touches `site/src/lib/email.ts`.

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
| `RESEND_API_KEY` (secret) | both deploy units | Resend key |
| GitHub remote | repo | your `git remote add origin …` |
