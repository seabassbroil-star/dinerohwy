// Internal email-sending Worker. Pages Functions can't use the send_email
// binding, so this Worker holds it and the site calls us over a private
// service binding (no public route, no API token anywhere).
//
// Contract: POST JSON { to, from, fromName?, subject, html, text?, replyTo? }
// → { ok, messageId? } | { ok:false, error }

interface SendEmailBinding {
  send(msg: {
    to: string | string[];
    from: { email: string; name?: string } | string;
    subject: string;
    html?: string;
    text?: string;
    replyTo?: string;
  }): Promise<{ messageId?: string }>;
}

interface Env {
  EMAIL: SendEmailBinding;
}

// Defense-in-depth even though there is no public route: only ever send as our
// own domain, bound sizes, POST-only.
const FROM_DOMAIN = "@dinerohwy.com";
const MAX_BODY = 256 * 1024;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") return json(405, { ok: false, error: "method" });

    const raw = await request.text();
    if (raw.length > MAX_BODY) return json(413, { ok: false, error: "too large" });

    let body: {
      to?: unknown; from?: unknown; fromName?: unknown;
      subject?: unknown; html?: unknown; text?: unknown; replyTo?: unknown;
    };
    try {
      body = JSON.parse(raw);
    } catch {
      return json(400, { ok: false, error: "bad json" });
    }

    const to = typeof body.to === "string" ? body.to : "";
    const from = typeof body.from === "string" ? body.from : "";
    const subject = typeof body.subject === "string" ? body.subject : "";
    const html = typeof body.html === "string" ? body.html : "";

    if (!to || !subject || !html) return json(422, { ok: false, error: "missing fields" });
    if (!from.toLowerCase().endsWith(FROM_DOMAIN)) {
      return json(422, { ok: false, error: "sender domain not allowed" });
    }

    try {
      const res = await env.EMAIL.send({
        to,
        from: { email: from, name: typeof body.fromName === "string" ? body.fromName : undefined },
        subject,
        html,
        text: typeof body.text === "string" ? body.text : undefined,
        ...(typeof body.replyTo === "string" && body.replyTo ? { replyTo: body.replyTo } : {}),
      });
      return json(200, { ok: true, messageId: res?.messageId });
    } catch (err) {
      const e = err as { code?: string; message?: string };
      console.error("[email-sender] send failed", e.code, e.message);
      return json(502, { ok: false, error: e.code ?? String(err) });
    }
  },
} satisfies ExportedHandler<Env>;
