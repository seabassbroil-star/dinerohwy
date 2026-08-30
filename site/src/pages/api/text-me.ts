import type { APIRoute } from "astro";
import { validateContactLead } from "../../lib/sanitize";
import { sendEmail } from "../../lib/email";

// Server-rendered on Cloudflare Pages (sends via Cloudflare Email at request time).
export const prerender = false;

// The destination inbox is NEVER hardcoded here — it comes from the LEAD_INBOX
// secret so the real address stays out of source/git and off the client.
// Local: set it in site/.dev.vars (gitignored). Production:
//   npx wrangler pages secret put LEAD_INBOX --project-name dinerohwy

// Escape for safe embedding in the notification email body. The allowlist in
// validateTextLead already strips <>&, so this is defense-in-depth.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");

  const respond = (ok: boolean, status = ok ? 200 : 400, message?: string) => {
    if (wantsJson) {
      return new Response(JSON.stringify({ ok, message }), {
        status,
        headers: { "content-type": "application/json" },
      });
    }
    // No-JS fallback: success → thank-you, failure → home with an error flag.
    return new Response(null, {
      status: 303,
      headers: { location: ok ? "/thank-you" : "/?error=1" },
    });
  };

  const form = await request.formData().catch(() => null);
  if (!form) return respond(false, 400, "Bad request");

  // Honeypot: real users never see or fill `company`. If it's populated, treat
  // it as a bot — report success but do nothing.
  if (String(form.get("company") ?? "").trim() !== "") {
    return respond(true, 200);
  }

  // Intent is a fixed allowlist compared to a literal — no user text reaches the
  // subject/body, so no injection surface. Defaults to a general contact lead.
  const isQuote = String(form.get("intent") ?? "").trim() === "quote";
  const leadKind = isQuote ? "quote" : "contact";

  const { ok, errors, clean } = validateContactLead({
    name: form.get("name"),
    phone: form.get("phone"),
    email: form.get("email"),
    message: form.get("message"),
  });

  if (!ok) {
    return respond(false, 422, errors[0] ?? "Please check the form and try again.");
  }

  const to = env?.LEAD_INBOX?.trim();
  if (!to) {
    // Misconfiguration — don't silently drop a real lead. Fail visibly so it's
    // caught in testing rather than losing submissions in production.
    console.error("[text-me] LEAD_INBOX not configured");
    return respond(false, 500, "Couldn't send that right now. Please try again.");
  }

  const prettyPhone = clean.phone
    ? `(${clean.phone.slice(0, 3)}) ${clean.phone.slice(3, 6)}-${clean.phone.slice(6)}`
    : "";
  const contactRows = [
    prettyPhone && `<p style="margin:0 0 6px;"><strong>Phone:</strong> ${escapeHtml(prettyPhone)}</p>`,
    clean.email && `<p style="margin:0 0 6px;"><strong>Email:</strong> ${escapeHtml(clean.email)}</p>`,
  ]
    .filter(Boolean)
    .join("\n      ");
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#0b2d22;">
      <h2 style="margin:0 0 12px;">New ${leadKind} lead</h2>
      <p style="margin:0 0 6px;"><strong>Name:</strong> ${escapeHtml(clean.name)}</p>
      ${contactRows}
      <p style="margin:0 0 6px;"><strong>Their situation:</strong></p>
      <p style="margin:0 0 12px;padding:10px 12px;background:#f4eedc;border-radius:8px;">${escapeHtml(clean.message)}</p>
      <p style="margin:0;color:#6b6b6b;font-size:13px;">Sent from the DineroHWY site.</p>
    </div>`.trim();

  try {
    const sent = await sendEmail(env ?? {}, {
      to,
      subject: `New ${leadKind} lead — ${clean.name}`,
      html,
      // Reply-to their address when given. Safe: the value passed a strict email
      // regex (no whitespace/CRLF possible), and never touches To/From.
      ...(clean.email ? { replyTo: clean.email } : {}),
    });
    if (!sent.ok) {
      console.error("[text-me] send failed", sent.error);
      // Don't leak infra state to the visitor; the retry advice is generic.
      return respond(false, 502, "Couldn't send that right now. Please try again.");
    }
    return respond(true, 200);
  } catch (err) {
    console.error("[text-me] failed", err);
    return respond(false, 502, "Couldn't send that right now. Please try again.");
  }
};

// Reject non-POST politely.
export const GET: APIRoute = () =>
  new Response("Method not allowed", { status: 405 });
