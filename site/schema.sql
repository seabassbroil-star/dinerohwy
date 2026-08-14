-- Dinero Hwy — leads + email sequence engine (Cloudflare D1 / SQLite)
-- Apply locally:  wrangler d1 execute dinerohwy-leads --local  --file=./schema.sql
-- Apply remote:   wrangler d1 execute dinerohwy-leads --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS leads (
  id            TEXT PRIMARY KEY,          -- crypto.randomUUID()
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  business      TEXT,
  lang          TEXT NOT NULL DEFAULT 'en',
  magnet        TEXT,                      -- report-card | quote-demo | waitlist | ...
  source        TEXT,                      -- page/context the capture came from
  seq_step      INTEGER NOT NULL DEFAULT 0,-- 0 = Day0 sent, 1 = Day2 sent, ...
  next_send_at  INTEGER,                   -- unix seconds of next due email (NULL = sequence done)
  created_at    INTEGER NOT NULL,
  unsubscribed  INTEGER NOT NULL DEFAULT 0
);

-- The mailer cron queries this hot path: due, still-subscribed leads.
CREATE INDEX IF NOT EXISTS idx_leads_due
  ON leads (next_send_at)
  WHERE unsubscribed = 0;

CREATE TABLE IF NOT EXISTS email_events (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id  TEXT NOT NULL,
  kind     TEXT NOT NULL,                  -- day0 | day2 | day5 | day9 | quote | error
  at       INTEGER NOT NULL,
  detail   TEXT,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

CREATE INDEX IF NOT EXISTS idx_events_lead ON email_events (lead_id);
