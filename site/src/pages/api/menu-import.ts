import type { APIRoute } from "astro";
import { rateLimited, verifyTurnstile } from "../../lib/otp";

export const prerender = false;

const MAX_BODY_BYTES = 5_500_000;
const COOKIE = "dh_menu_session";
const SESSION_SECONDS = 30 * 60;

function json(status: number, body: Record<string, unknown>, cookie?: string): Response {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (cookie) headers.set("Set-Cookie", cookie);
  return new Response(JSON.stringify(body), { status, headers });
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomSessionId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function signSession(id: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(id))));
}

async function validSession(raw: string, secret: string): Promise<string | null> {
  const [id, signature] = raw.split(".");
  if (!/^[a-f0-9]{32}$/.test(id || "") || !/^[A-Za-z0-9_-]{40,50}$/.test(signature || "")) return null;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const decode = (value: string) => {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
    return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  };
  return await crypto.subtle.verify("HMAC", key, decode(signature), new TextEncoder().encode(id)) ? id : null;
}

function cookieValue(request: Request): string {
  const entry = (request.headers.get("Cookie") || "").split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`));
  return entry?.slice(COOKIE.length + 1) || "";
}

async function getSession(request: Request, secret: string): Promise<{ id: string; cookie?: string }> {
  const existing = await validSession(cookieValue(request), secret);
  if (existing) return { id: existing };
  const id = randomSessionId();
  const signature = await signSession(id, secret);
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return { id, cookie: `${COOKIE}=${id}.${signature}; Path=/api/menu-import; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure}` };
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  const requestId = crypto.randomUUID();
  const started = Date.now();
  const fail = (status: number, message: string, reason: string, cookie?: string) => {
    console.log(JSON.stringify({ event: "menu_import_gateway", requestId, status, reason, durationMs: Date.now() - started }));
    return json(status, { ok: false, message, requestId }, cookie);
  };

  const requestOrigin = request.headers.get("Origin");
  const ownOrigin = new URL(request.url).origin;
  const fetchSite = request.headers.get("Sec-Fetch-Site");
  if ((requestOrigin && requestOrigin !== ownOrigin) || (fetchSite && fetchSite !== "same-origin")) {
    return fail(403, "Forbidden.", "cross_origin");
  }
  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > MAX_BODY_BYTES) return fail(413, "That file is too large.", "body_too_large");
  if (!env?.MENU_IMPORT) return fail(503, "Menu import is not configured yet.", "missing_service");

  const production = new URL(request.url).hostname !== "localhost" && !new URL(request.url).hostname.endsWith(".localhost");
  const secret = env.MENU_SESSION_SECRET || (!production ? "local-menu-session-development-only" : "");
  if (!secret) return fail(503, "Menu import is not configured yet.", "missing_session_secret");
  const session = await getSession(request, secret);

  const form = await request.formData().catch(() => null);
  if (!form) return fail(400, "Invalid upload.", "invalid_form", session.cookie);
  if (String(form.get("company") || "").trim()) return fail(400, "Invalid upload.", "honeypot", session.cookie);
  const file = form.get("menu");
  if (!(file instanceof File)) return fail(400, "Choose a menu image, PDF, or CSV.", "missing_file", session.cookie);
  if (file.size === 0 || file.size > 5_000_000) return fail(413, "The sanitized menu must be 5 MB or smaller.", "file_too_large", session.cookie);

  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const human = await verifyTurnstile(env.TURNSTILE_SECRET, form.get("cf-turnstile-response"), ip);
  if (!human) return fail(403, "Complete the security check and try again.", "turnstile", session.cookie);
  if (await rateLimited(env.AIGATE, `menu-ip:${ip}`, 10, 600)) return fail(429, "Too many uploads from this network. Please wait ten minutes.", "ip_rate", session.cookie);
  if (await rateLimited(env.AIGATE, `menu-session:${session.id}`, 10, 3600)) return fail(429, "This preview has reached its hourly limit.", "session_rate", session.cookie);

  const internalForm = new FormData();
  internalForm.set("menu", file, "sanitized-menu");
  const internalRequest = new Request("https://menu-import.internal/import", {
    method: "POST",
    headers: {
      "X-Dinero-Internal": "menu-import-v1",
      "X-Dinero-Menu-Session": session.id,
      "X-Dinero-Request-Id": requestId,
    },
    body: internalForm,
  });

  try {
    const response = await env.MENU_IMPORT.fetch(internalRequest);
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    headers.set("X-Content-Type-Options", "nosniff");
    if (session.cookie) headers.set("Set-Cookie", session.cookie);
    console.log(JSON.stringify({ event: "menu_import_gateway", requestId, status: response.status, reason: "complete", durationMs: Date.now() - started }));
    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    console.error(JSON.stringify({ event: "menu_import_gateway", requestId, status: 503, reason: "service_unavailable", errorType: error instanceof Error ? error.name : "unknown", durationMs: Date.now() - started }));
    return json(503, { ok: false, message: "Menu import is temporarily unavailable.", requestId }, session.cookie);
  }
};

export const GET: APIRoute = () => json(405, { ok: false, message: "Method not allowed." });
