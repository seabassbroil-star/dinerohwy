// Shared lead + email-sequence logic. Imported by /api/subscribe (Pages)
// and, in spirit, mirrored by workers/mailer (which reuses this schedule).

export const DAY = 86_400; // seconds

/**
 * Follow-up cadence. Index === seq_step that has JUST been sent.
 * `nextInDays` is how long until the NEXT step is due (null = sequence done).
 *   step 0 = Day0 welcome (sent on signup)  → next in 2 days
 *   step 1 = Day2 tip                        → next in 3 days
 *   step 2 = Day5 demo nudge                 → next in 4 days
 *   step 3 = Day9 soft offer                 → done
 */
export const SEQUENCE: { kind: string; nextInDays: number | null }[] = [
  { kind: "day0", nextInDays: 2 },
  { kind: "day2", nextInDays: 3 },
  { kind: "day5", nextInDays: 4 },
  { kind: "day9", nextInDays: null },
];

export interface LeadInput {
  email: string;
  name?: string | null;
  business?: string | null;
  lang?: string;
  magnet?: string;
  source?: string;
}

export interface LeadRow {
  id: string;
  email: string;
  name: string | null;
  business: string | null;
  lang: string;
  magnet: string | null;
  source: string | null;
  seq_step: number;
  next_send_at: number | null;
  created_at: number;
  unsubscribed: number;
}

export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email) && email.length <= 254;
}

/**
 * Insert a new lead (or refresh an existing one) and set it at the start of
 * the sequence. Returns the lead id and whether it was newly created.
 * Existing leads are re-armed at Day0 so re-submitting a magnet re-triggers it,
 * but we never resurrect an unsubscribed contact.
 */
export async function upsertLead(
  db: D1Database,
  input: LeadInput,
): Promise<{ id: string; isNew: boolean }> {
  const now = nowSeconds();
  const nextAt = now + SEQUENCE[0].nextInDays! * DAY;
  const id = crypto.randomUUID();
  const email = input.email.trim().toLowerCase();

  const result = await db
    .prepare(
      `INSERT INTO leads (id, email, name, business, lang, magnet, source, seq_step, next_send_at, created_at, unsubscribed)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0, ?8, ?9, 0)
       ON CONFLICT(email) DO UPDATE SET
         name         = COALESCE(excluded.name, leads.name),
         business     = COALESCE(excluded.business, leads.business),
         magnet       = excluded.magnet,
         source       = excluded.source,
         seq_step     = 0,
         next_send_at = CASE WHEN leads.unsubscribed = 1 THEN NULL ELSE ?8 END
       RETURNING id, created_at`,
    )
    .bind(
      id,
      email,
      input.name ?? null,
      input.business ?? null,
      input.lang ?? "en",
      input.magnet ?? null,
      input.source ?? null,
      nextAt,
      now,
    )
    .first<{ id: string; created_at: number }>();

  const returnedId = result?.id ?? id;
  return { id: returnedId, isNew: result?.created_at === now };
}

export async function logEvent(
  db: D1Database,
  leadId: string,
  kind: string,
  detail?: string,
): Promise<void> {
  await db
    .prepare(`INSERT INTO email_events (lead_id, kind, at, detail) VALUES (?1, ?2, ?3, ?4)`)
    .bind(leadId, kind, nowSeconds(), detail ?? null)
    .run();
}
