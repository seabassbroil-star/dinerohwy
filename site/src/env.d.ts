/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  UPLOADS: R2Bucket;
  AI: Ai;
  AIGATE: KVNamespace; // OTP sessions + rate-limit + budget counters for the AI gate
  EMAIL_SENDER: Fetcher; // service binding → workers/email-sender (tokenless email)
  RENDER: Fetcher; // service binding → workers/render (Browser Rendering)
  TURNSTILE_SITEKEY: string; // public — embedded in the widget
  TURNSTILE_SECRET: string; // secret — server-side siteverify
  CLOUDFLARE_ACCOUNT_ID: string; // var — for the Email Sending REST API
  CLOUDFLARE_API_TOKEN: string; // secret — Email Sending: Edit
  MAIL_FROM: string; // "Name <addr@dinerohwy.com>" (onboarded sending domain)
  SITE_URL: string;
  LEAD_INBOX: string; // where "text me" submissions are forwarded
}

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
