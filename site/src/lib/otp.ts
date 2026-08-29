// Shared helpers for the AI lead-gate: Turnstile verify, KV-backed rate limiting,
// a daily AI budget cap, and email-OTP sessions. All state lives in one KV
// namespace (env.AIGATE) under key prefixes. Pure-ish: KV in, decisions out.

export interface GateEnv {
  AIGATE?: KVNamespace;
  TURNSTILE_SECRET?: string;
}

// ---- Turnstile ----------------------------------------------------------------

/**
 * Verify a Turnstile token server-side. Fails closed. If no secret is configured
 * (local dev), returns true so the flow can be exercised without a real token.
 */
export async function verifyTurnstile(
  secret: string | undefined,
  token: unknown,
  remoteip?: string | null,
): Promise<boolean> {
  if (!secret) return true; // dev bypass — production always has the secret
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteip) body.set("remoteip", remoteip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) return false;
    const data = (await r.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// ---- Rate limiting (fixed window in KV) --------------------------------------

/**
 * Increment a counter keyed by `key`, returning whether it's now over `limit`
 * within `windowSec`. KV is eventually consistent, so this caps sustained abuse
 * rather than being exact — good enough for a public tool.
 */
export async function rateLimited(
  kv: KVNamespace | undefined,
  key: string,
  limit: number,
  windowSec: number,
): Promise<boolean> {
  if (!kv) return false;
  const k = `rl:${key}`;
  const current = parseInt((await kv.get(k)) ?? "0", 10) || 0;
  if (current >= limit) return true;
  await kv.put(k, String(current + 1), { expirationTtl: windowSec });
  return false;
}

// ---- Daily AI budget cap ------------------------------------------------------

const DAY_SECONDS = 86_400;

/** Day bucket key from a unix-seconds timestamp (passed in — Date.now varies by env). */
function dayKey(nowSec: number): string {
  return `budget:${Math.floor(nowSec / DAY_SECONDS)}`;
}

/** True if the global daily AI-call ceiling is already reached. */
export async function overDailyBudget(
  kv: KVNamespace | undefined,
  nowSec: number,
  dailyMax: number,
): Promise<boolean> {
  if (!kv) return false;
  const used = parseInt((await kv.get(dayKey(nowSec))) ?? "0", 10) || 0;
  return used >= dailyMax;
}

/** Record one AI call against today's budget. */
export async function spendDailyBudget(kv: KVNamespace | undefined, nowSec: number): Promise<void> {
  if (!kv) return;
  const k = dayKey(nowSec);
  const used = parseInt((await kv.get(k)) ?? "0", 10) || 0;
  await kv.put(k, String(used + 1), { expirationTtl: DAY_SECONDS * 2 });
}

// ---- Email OTP sessions -------------------------------------------------------

export interface OtpSession {
  codeHash: string;
  name: string;
  email: string;
  phone: string;
  attempts: number;
  createdSec: number;
}

const OTP_TTL_SEC = 600; // 10 minutes
export const OTP_MAX_ATTEMPTS = 5;

/** Cryptographically random 6-digit numeric verification code. */
export function makeCode(): string {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return String(values[0] % 1_000_000).padStart(6, "0");
}

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Opaque random token id for the client to hold between the two steps. */
export function makeToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export async function putOtpSession(
  kv: KVNamespace,
  token: string,
  session: OtpSession,
): Promise<void> {
  await kv.put(`otp:${token}`, JSON.stringify(session), { expirationTtl: OTP_TTL_SEC });
}

export async function getOtpSession(
  kv: KVNamespace,
  token: string,
): Promise<OtpSession | null> {
  const raw = await kv.get(`otp:${token}`);
  return raw ? (JSON.parse(raw) as OtpSession) : null;
}

export async function bumpOtpAttempts(
  kv: KVNamespace,
  token: string,
  session: OtpSession,
): Promise<void> {
  await kv.put(`otp:${token}`, JSON.stringify({ ...session, attempts: session.attempts + 1 }), {
    expirationTtl: OTP_TTL_SEC,
  });
}

export async function deleteOtpSession(kv: KVNamespace, token: string): Promise<void> {
  await kv.delete(`otp:${token}`);
}
