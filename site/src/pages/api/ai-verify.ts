import type { APIRoute } from "astro";
import { validateContactLead } from "../../lib/sanitize";
import { sendEmail } from "../../lib/email";
import {
  verifyTurnstile,
  rateLimited,
  makeCode,
  makeToken,
  sha256Hex,
  putOtpSession,
} from "../../lib/otp";

// Step 1 of the AI lead-gate: validate the lead, pass Turnstile, rate-limit,
// email a 6-digit code, and hand back an opaque token. NO AI is called here.
export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  const ip = request.headers.get("CF-Connecting-IP") ?? "0.0.0.0";

  const json = (ok: boolean, status: number, body: Record<string, unknown> = {}) =>
    new Response(JSON.stringify({ ok, ...body }), {
      status,
      headers: { "content-type": "application/json" },
    });

  const form = await request.formData().catch(() => null);
  if (!form) return json(false, 400, { message: "Bad request" });

  // Honeypot — silent success.
  if (String(form.get("company") ?? "").trim() !== "") return json(true, 200, { token: makeToken() });

  // Turnstile before anything that costs money (email send).
  const human = await verifyTurnstile(env?.TURNSTILE_SECRET, form.get("cf-turnstile-response"), ip);
  if (!human) return json(false, 403, { message: "Please complete the verification and try again." });

  const { ok, errors, clean } = validateContactLead(
    { name: form.get("name"), email: form.get("email"), phone: form.get("phone") },
    { requireAll: true, skipMessage: true },
  );
  if (!ok) return json(false, 422, { message: errors[0] });

  // Rate limits: cap code-sends per IP and per target email (anti email-bomb).
  if (await rateLimited(env?.AIGATE, `verifyip:${ip}`, 5, 600)) {
    return json(false, 429, { message: "Too many attempts. Please wait a few minutes." });
  }
  if (await rateLimited(env?.AIGATE, `verifyemail:${clean.email}`, 3, 3600)) {
    return json(false, 429, { message: "That email has been sent too many codes. Try again later." });
  }

  const code = makeCode(Math.random());
  const token = makeToken();

  if (env?.AIGATE) {
    await putOtpSession(env.AIGATE, token, {
      codeHash: await sha256Hex(code),
      name: clean.name,
      email: clean.email,
      phone: clean.phone,
      attempts: 0,
      createdSec: Math.floor(Date.now() / 1000),
    });
  }

  // Hidden preheader + spacer: fills the inbox PREVIEW with a decoy line and
  // invisible characters so the code never shows in any snippet — you must open
  // the email to see it. The spacer is zero-width/figure-space chars.
  const preheader =
    `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Open to view your DineroHWY verification code.</div>` +
    `<div style="display:none;max-height:0;overflow:hidden;">` +
    "​ ﻿".repeat(60) +
    `</div>`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#0b2d22;">
      ${preheader}
      <p>Thanks for using the DineroHWY AI Copy Assistant. Open this email to get the verification code that unlocks your results — then enter it on the page.</p>
      <p style="color:#6b6b6b;font-size:13px;">Your code (expires in 10 minutes):</p>
      <p style="font-size:30px;font-weight:900;letter-spacing:4px;margin:8px 0;">${code}</p>
      <p style="color:#6b6b6b;font-size:13px;">If you didn't request this, you can ignore this email.</p>
    </div>`.trim();

  const sent = await sendEmail(env ?? {}, {
    to: clean.email,
    subject: "Your DineroHWY verification code (inside)",
    html,
  });
  if (!sent.ok) {
    console.error("[ai-verify] code email failed", sent.error);
    return json(false, 502, { message: "Couldn't send the code. Please try again." });
  }

  return json(true, 200, { token });
};

export const GET: APIRoute = () => new Response("Method not allowed", { status: 405 });
