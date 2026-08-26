import type { APIRoute } from "astro";
import { lettersOnly, validateContactLead } from "../../lib/sanitize";
import { sendEmail } from "../../lib/email";
import { rateLimited } from "../../lib/otp";

// Booking demo proxy → the BOOKING Durable Object Worker (service binding).
// GET  /api/booking            → live slots
// POST /api/booking (reset)    → reseed the demo room
// POST /api/booking (book)     → book a slot, then email owner + visitor
export const prerender = false;

const json = (ok: boolean, status: number, body: Record<string, unknown> = {}) =>
  new Response(JSON.stringify({ ok, ...body }), {
    status,
    headers: { "content-type": "application/json" },
  });

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime?.env;
  if (!env?.BOOKING) return json(false, 503, { message: "Booking isn't configured." });
  const res = await env.BOOKING.fetch("https://booking/slots");
  return new Response(res.body, { status: res.status, headers: { "content-type": "application/json" } });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  const ip = request.headers.get("CF-Connecting-IP") ?? "0.0.0.0";
  if (!env?.BOOKING) return json(false, 503, { message: "Booking isn't configured." });

  const form = await request.formData().catch(() => null);
  if (!form) return json(false, 400, { message: "Bad request" });

  const action = String(form.get("action") ?? "book");

  if (action === "reset") {
    const res = await env.BOOKING.fetch("https://booking/reset", { method: "POST" });
    return new Response(res.body, { status: res.status, headers: { "content-type": "application/json" } });
  }

  // Rate-limit bookings per IP (a booking fires emails).
  if (await rateLimited(env.AIGATE, `bookip:${ip}`, 5, 300)) {
    return json(false, 429, { message: "Too many booking attempts — try again shortly." });
  }

  const slot = String(form.get("slot") ?? "").slice(0, 40);
  const name = lettersOnly(form.get("name")).slice(0, 50);
  // Contact is optional here; if an email is given we confirm to the visitor.
  const { clean } = validateContactLead(
    { name, email: form.get("email"), phone: form.get("phone") },
    { requireAll: false, skipMessage: true },
  );
  if (name.length < 2) return json(false, 422, { message: "Enter your name (letters only)." });
  if (!slot) return json(false, 422, { message: "Pick a time slot." });

  const res = await env.BOOKING.fetch("https://booking/book", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slot, name }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean; slot?: { label?: string }; slots?: unknown; error?: string;
  };
  if (!res.ok || !data.ok) {
    return json(false, res.status === 409 ? 409 : 422, { message: data.error ?? "Couldn't book that slot." });
  }

  const when = data.slot?.label ?? slot;
  // Owner alert (best-effort; never blocks the confirmation).
  try {
    await sendEmail(env, {
      to: env.LEAD_INBOX || "",
      subject: `New booking — ${name}`,
      html: `<p><strong>${name}</strong> booked <strong>${when}</strong>.${clean.email ? ` Email: ${clean.email}.` : ""}${clean.phone ? ` Phone: ${clean.phone}.` : ""}</p>`,
    });
  } catch (err) {
    console.error("[booking] owner alert failed", err);
  }
  // Visitor confirmation if they gave an email.
  if (clean.email) {
    try {
      await sendEmail(env, {
        to: clean.email,
        subject: "Your booking is confirmed",
        html: `<p>Hi ${name}, your appointment for <strong>${when}</strong> is confirmed. See you then!</p><p style="color:#6b6b6b;font-size:13px;">Booked via DineroHWY.</p>`,
      });
    } catch (err) {
      console.error("[booking] visitor confirm failed", err);
    }
  }

  return json(true, 200, { slot: data.slot, slots: data.slots, confirmed: when });
};
