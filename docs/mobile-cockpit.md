# The Mobile Cockpit

The workflow for reviewing and adjusting the live site from your phone. The
whole point: you see the site *live*, exactly as customers do, and adjust from
there — instead of guessing on a laptop.

## The loop

1. **Look.** Open the live site (or a branch preview) on your iPhone.
2. **Capture.** Screenshot whatever feels off.
3. **Annotate.** Open [`/review-app`](https://dinerohwy.com/review-app) on the
   phone, upload the screenshot, and tap to drop numbered notes with a
   priority (must / should / nice).
4. **Export.** Tap **Copy GitHub issue** (or Copy/Download Markdown). Everything
   is generated in-browser — nothing is uploaded.
5. **Turn into work.** Paste into a GitHub issue, or hand the Markdown to
   whoever (or whatever) is editing. Small copy/style tweaks can be made
   directly by editing the relevant `.astro`/`.md` file.
6. **Ship.** Commit to a **feature branch** and push:
   ```bash
   git checkout -b tweak/hero-copy
   git commit -am "Hero: tighten headline per phone review"
   git push -u origin tweak/hero-copy
   ```
7. **Preview.** Cloudflare Pages auto-builds a preview deployment at a unique
   `*.dinerohwy.pages.dev` URL for that branch.
8. **Re-check on the phone.** Open the preview URL, confirm the fix looks right
   in the real environment.
9. **Publish.** Merge the branch to `main` → production deploys automatically.

## Why this beats editing on a laptop

- You're reviewing the *rendered, deployed* page on a real phone — the same
  surface your customers use — not a dev server on a big screen.
- Notes are anchored to exact spots on the actual screenshot, so nothing gets
  lost in translation.
- The review tool you use is the same one clients get. Dogfooding is the pitch.

## Influencing projects from the phone

Two levers, both git-backed so everything is reviewable:

- **Content**: most page copy lives in `.astro` files under `site/src/pages/`
  and (soon) `.mdx` under `site/src/content/`. Edit text directly; push; preview.
- **Structure/behavior**: components under `site/src/components/` and demos
  under `site/src/demos/`.

## Prerequisite

The Pages↔GitHub connection in [provisioning.md](./provisioning.md) §5 is what
makes steps 7–9 automatic. Until that's connected, deploy manually with
`npm run deploy` from `site/`.

## Later (Phase 2+)

A `/api/review` endpoint can push the exported issue straight to the GitHub
Issues API with a server-held token, collapsing steps 4–5 into one tap.
