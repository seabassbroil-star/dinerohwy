// Email sending, abstracted behind one function so the transport is swappable.
// Transport: Cloudflare Email Sending REST API (Pages Functions can't use the
// tokenless `send_email` binding, so we call the REST endpoint with a scoped
// Cloudflare API token). If the token/account aren't configured (local dev),
// it logs and reports success so capture flows can be exercised offline.
//
// Required env:
//   CLOUDFLARE_ACCOUNT_ID  (var — not secret)
//   CLOUDFLARE_API_TOKEN   (secret — Email Sending: Edit)
//   MAIL_FROM              (var — "Name <addr@dinerohwy.com>"; domain must be
//                           onboarded to Email Sending)

export interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string; // "Name <email>" or bare "email"
  replyTo?: string;
}

export interface EmailEnv {
  /** Service binding to the internal `dinerohwy-email` Worker (tokenless path). */
  EMAIL_SENDER?: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  MAIL_FROM?: string;
  RESEND_FROM?: string; // back-compat alias for the from string
}

const DEFAULT_FROM = "Dinero Hwy <contact@dinerohwy.com>";

/** Parse "Name <email>" (or a bare address) into the REST API's from object. */
function parseFrom(input: string): { address: string; name?: string } {
  const m = input.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (m) {
    const name = m[1].replace(/^["']|["']$/g, "").trim();
    return { address: m[2].trim(), name: name || undefined };
  }
  return { address: input.trim() };
}

/** Minimal HTML → text fallback for the plain-text alternative (deliverability). */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function sendEmail(
  env: EmailEnv,
  { to, subject, html, text, from, replyTo }: SendArgs,
): Promise<{ ok: boolean; id?: string; skipped?: boolean; error?: string }> {
  const fromStr = from ?? env.MAIL_FROM ?? env.RESEND_FROM ?? DEFAULT_FROM;
  const plain = text ?? htmlToText(html);

  // Preferred path: the internal email Worker via service binding — tokenless,
  // no credentials anywhere. (Pages Functions can't hold the send_email
  // binding themselves, so the Worker holds it for us.)
  if (env.EMAIL_SENDER) {
    try {
      const parsed = parseFrom(fromStr);
      const res = await env.EMAIL_SENDER.fetch("https://email/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          to,
          from: parsed.address,
          fromName: parsed.name,
          subject,
          html,
          text: plain,
          ...(replyTo ? { replyTo } : {}),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; messageId?: string; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        console.error(`[email] sender worker failed ${res.status}: ${data?.error ?? "?"}`);
        return { ok: false, error: data?.error ?? `${res.status}` };
      }
      return { ok: true, id: data.messageId };
    } catch (err) {
      console.error("[email] sender worker unreachable", err);
      return { ok: false, error: String(err) };
    }
  }

  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID) {
    console.log(`[email:dev] would send "${subject}" to ${to} from ${fromStr}`);
    return { ok: true, skipped: true };
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/email/sending/send`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        from: parseFrom(fromStr),
        subject,
        html,
        text: plain,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    const data = (await res.json().catch(() => null)) as
      | { success?: boolean; errors?: { code?: number; message?: string }[] }
      | null;

    if (!res.ok || !data?.success) {
      const detail = data?.errors?.map((e) => `${e.code}:${e.message}`).join("; ") || `${res.status}`;
      console.error(`[email] Cloudflare send failed ${res.status}: ${detail}`);
      return { ok: false, error: detail };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] send failed", err);
    return { ok: false, error: String(err) };
  }
}
