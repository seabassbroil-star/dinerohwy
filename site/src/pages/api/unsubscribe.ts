import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  const id = new URL(request.url).searchParams.get("id");

  if (id && env?.DB) {
    try {
      await env.DB.prepare(
        `UPDATE leads SET unsubscribed = 1, next_send_at = NULL WHERE id = ?1`,
      )
        .bind(id)
        .run();
    } catch (err) {
      console.error("[unsubscribe] failed", err);
    }
  }

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed</title>
<style>body{margin:0;min-height:100svh;display:grid;place-items:center;background:#061b14;color:#f4eedc;font-family:Inter,Segoe UI,Arial,sans-serif;text-align:center;padding:1rem}
a{color:#db6e42}</style></head><body><div>
<h1 style="letter-spacing:-.02em">You're unsubscribed.</h1>
<p style="color:#c9c5b7">You won't get any more emails from us. No hard feelings.</p>
<p><a href="/">← Back to Dinero Hwy</a></p></div></body></html>`;

  return new Response(html, { status: 200, headers: { "content-type": "text/html" } });
};
