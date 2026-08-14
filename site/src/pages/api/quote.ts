import type { APIRoute } from "astro";
import { upsertLead, logEvent, isValidEmail } from "../../lib/leads";
import { sendEmail } from "../../lib/email";
import { quoteEmail } from "../../emails/quote-copy";
import { estimate } from "../../demos/ImageQuote/quote-math";

export const prerender = false;

const MAX_UPLOAD = 8 * 1024 * 1024; // 8 MB

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");
  const json = (ok: boolean, status: number, message?: string) =>
    new Response(JSON.stringify({ ok, message }), {
      status,
      headers: { "content-type": "application/json" },
    });

  const form = await request.formData().catch(() => null);
  if (!form) return json(false, 400, "Bad request");

  const email = String(form.get("email") ?? "").trim();
  if (!isValidEmail(email)) return json(false, 422, "Valid email required");

  // Recompute the estimate server-side from the raw inputs (never trust the
  // client's numbers) so the emailed quote is authoritative.
  const result = estimate({
    serviceId: String(form.get("serviceId") ?? ""),
    size: Number(form.get("size") ?? 0),
    conditionId: String(form.get("conditionId") ?? "average"),
    urgencyId: String(form.get("urgencyId") ?? "flexible"),
  });
  if (!result) return json(false, 422, "Unknown service");

  if (!env?.DB) {
    console.error("[quote] DB binding missing");
    return json(true, 200); // don't punish the visitor for our misconfig
  }

  try {
    const { id } = await upsertLead(env.DB, {
      email,
      magnet: "quote-demo",
      source: "image-quote",
    });

    // Store the uploaded photo in R2 (optional).
    const photo = form.get("photo");
    if (photo instanceof File && photo.size > 0 && photo.size <= MAX_UPLOAD && env.UPLOADS) {
      const ext = (photo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const key = `quotes/${id}/${Date.now()}.${ext}`;
      await env.UPLOADS.put(key, photo.stream(), {
        httpMetadata: { contentType: photo.type || "image/jpeg" },
      });
      await logEvent(env.DB, id, "quote-photo", key);
    }

    const siteUrl = env.SITE_URL ?? new URL(request.url).origin;
    const { subject, html } = quoteEmail({
      siteUrl,
      service: result.service,
      low: result.low,
      high: result.high,
      lines: result.lines,
      unsubscribeUrl: `${siteUrl}/api/unsubscribe?id=${id}`,
    });

    const sent = await sendEmail(env, { to: email, subject, html });
    await logEvent(env.DB, id, sent.ok ? "quote" : "error", sent.error);
    return json(true, 200);
  } catch (err) {
    console.error("[quote] failed", err);
    return json(false, 500, "Something went wrong");
  }
};

export const GET: APIRoute = () => new Response("Method not allowed", { status: 405 });
