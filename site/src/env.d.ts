/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  UPLOADS: R2Bucket;
  RESEND_API_KEY: string;
  RESEND_FROM: string;
  SITE_URL: string;
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
