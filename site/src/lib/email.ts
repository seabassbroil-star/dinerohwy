// Email sending, abstracted behind one function so the provider is swappable
// (Resend today; Cloudflare Email later). If no API key is configured (local
// dev), it logs and reports success so capture flows can be exercised offline.

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface EmailEnv {
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
}

export async function sendEmail(
  env: EmailEnv,
  { to, subject, html, from, replyTo }: SendArgs,
): Promise<{ ok: boolean; id?: string; skipped?: boolean; error?: string }> {
  const sender = from ?? env.RESEND_FROM ?? "Dinero Hwy <hello@dinerohwy.com>";

  if (!env.RESEND_API_KEY) {
    console.log(`[email:dev] would send "${subject}" to ${to} from ${sender}`);
    return { ok: true, skipped: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error(`[email] Resend ${res.status}: ${error}`);
      return { ok: false, error: `${res.status}` };
    }
    const data = (await res.json()) as { id?: string };
    return { ok: true, id: data.id };
  } catch (err) {
    console.error("[email] send failed", err);
    return { ok: false, error: String(err) };
  }
}
