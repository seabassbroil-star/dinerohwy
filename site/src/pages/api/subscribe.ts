import type { APIRoute } from "astro";
import { upsertLead, logEvent, isValidEmail } from "../../lib/leads";
import { sendEmail } from "../../lib/email";
import { sequence } from "../../emails/sequence";

// Server-rendered on Cloudflare Pages (needs D1 + Resend at request time).
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  const form = await request.formData().catch(() => null);
  const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");

  const respond = (ok: boolean, status = ok ? 200 : 400, message?: string) => {
    if (wantsJson) {
      return new Response(JSON.stringify({ ok, message }), {
        status,
        headers: { "content-type": "application/json" },
      });
    }
    // No-JS fallback: redirect to the thank-you (or back with an error flag).
    return new Response(null, {
      status: 303,
      headers: { location: ok ? "/thank-you" : "/free?error=1" },
    });
  };

  if (!form) return respond(false, 400, "Bad request");

  const email = String(form.get("email") ?? "").trim();
  if (!isValidEmail(email)) return respond(false, 422, "Please enter a valid email.");

  if (!env?.DB) {
    // Misconfiguration (e.g. D1 not bound). Don't hard-fail the visitor.
    console.error("[subscribe] DB binding missing");
    return respond(true, 200);
  }

  const input = {
    email,
    name: (form.get("name") as string) || null,
    business: (form.get("business") as string) || null,
    lang: (form.get("lang") as string) || "en",
    magnet: (form.get("magnet") as string) || "report-card",
    source: (form.get("source") as string) || "unknown",
  };

  try {
    const { id } = await upsertLead(env.DB, input);
    const siteUrl = env.SITE_URL ?? new URL(request.url).origin;
    const unsubscribeUrl = `${siteUrl}/api/unsubscribe?id=${id}`;
    const { subject, html } = sequence.day0({
      siteUrl,
      name: input.name,
      business: input.business,
      unsubscribeUrl,
    });

    const sent = await sendEmail(env, { to: email, subject, html });
    await logEvent(env.DB, id, sent.ok ? "day0" : "error", sent.error);
    return respond(true, 200);
  } catch (err) {
    console.error("[subscribe] failed", err);
    return respond(false, 500, "Something went wrong. Please try again.");
  }
};

// Reject non-POST politely.
export const GET: APIRoute = () =>
  new Response("Method not allowed", { status: 405 });
