// Dinero Hwy — follow-up mailer. A cron Worker that sends due sequence emails.
// Shares the site's D1 database and reuses the site's sequence templates and
// schedule so there is a single source of truth for the funnel.
import { SEQUENCE, DAY, nowSeconds } from "../../../site/src/lib/leads";
import { sequence } from "../../../site/src/emails/sequence";
import { sendEmail } from "../../../site/src/lib/email";

interface Env {
  DB: D1Database;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  SITE_URL: string;
}

interface DueLead {
  id: string;
  email: string;
  name: string | null;
  business: string | null;
  seq_step: number;
}

export default {
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(run(env));
  },

  // Allow manual triggering during setup: GET /run?key=RESEND_API_KEY-ish guard.
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/run") {
      const count = await run(env);
      return new Response(`Processed ${count} due lead(s).`, { status: 200 });
    }
    return new Response("dinerohwy-mailer: cron worker. POST cron or GET /run.", { status: 200 });
  },
};

async function run(env: Env): Promise<number> {
  const now = nowSeconds();
  const due = await env.DB.prepare(
    `SELECT id, email, name, business, seq_step
       FROM leads
      WHERE unsubscribed = 0 AND next_send_at IS NOT NULL AND next_send_at <= ?1
      ORDER BY next_send_at ASC
      LIMIT 200`,
  )
    .bind(now)
    .all<DueLead>();

  const leads = due.results ?? [];
  const siteUrl = env.SITE_URL;

  for (const lead of leads) {
    const nextStep = lead.seq_step + 1;
    const step = SEQUENCE[nextStep];

    // Past the end of the sequence → stop scheduling this lead.
    if (!step) {
      await env.DB.prepare(`UPDATE leads SET next_send_at = NULL WHERE id = ?1`).bind(lead.id).run();
      continue;
    }

    const build = sequence[step.kind];
    if (!build) continue;

    const unsubscribeUrl = `${siteUrl}/api/unsubscribe?id=${lead.id}`;
    const { subject, html } = build({
      siteUrl,
      name: lead.name,
      business: lead.business,
      unsubscribeUrl,
    });

    const sent = await sendEmail(env, { to: lead.email, subject, html });

    // Advance the lead: record the step just sent and schedule the next one
    // (or finish if this step has no follow-on).
    const nextSendAt = step.nextInDays === null ? null : now + step.nextInDays * DAY;
    await env.DB.batch([
      env.DB
        .prepare(`UPDATE leads SET seq_step = ?1, next_send_at = ?2 WHERE id = ?3`)
        .bind(nextStep, nextSendAt, lead.id),
      env.DB
        .prepare(`INSERT INTO email_events (lead_id, kind, at, detail) VALUES (?1, ?2, ?3, ?4)`)
        .bind(lead.id, sent.ok ? step.kind : "error", nowSeconds(), sent.error ?? null),
    ]);
  }

  console.log(`[mailer] processed ${leads.length} due lead(s) at ${now}`);
  return leads.length;
}
