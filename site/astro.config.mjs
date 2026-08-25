// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

// Dinero Hwy — Astro on Cloudflare Pages.
// Static by default (Lighthouse-friendly); only /api/* routes opt into SSR
// via `export const prerender = false`. React is used ONLY for the two
// interactive demo islands (ImageQuote, ReviewApp).
export default defineConfig({
  site: "https://dinerohwy.com",
  output: "static",
  devToolbar: { enabled: false },
  adapter: cloudflare({
    platformProxy: { enabled: true }, // emulates D1/R2 bindings during `astro dev`
    imageService: "compile",
  }),
  integrations: [mdx(), react()],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: { prefixDefaultLocale: false }, // English at /, Spanish at /es/
  },
});
