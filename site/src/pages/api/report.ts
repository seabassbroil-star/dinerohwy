import type { APIRoute } from "astro";
import { auditHtml, normalizeUrl, type FetchMeta } from "../../lib/report";
import { isValidEmail, upsertLead } from "../../lib/leads";

export const prerender = false;

const USER_AGENT = "Mozilla/5.0 (compatible; DineroHwyReportCard/1.0; +https://dinerohwy.com)";
const TIMEOUT_MS = 8000;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const form = await request.formData().catch(() => null);
  if (!form) return json({ ok: false, message: "Bad request" }, 400);

  // Cap raw input lengths before use (defense against oversized payloads).
  const url = normalizeUrl(String(form.get("url") ?? "").slice(0, 512));
  const email = String(form.get("email") ?? "").trim().slice(0, 120);
  const business = String(form.get("business") ?? "").trim().slice(0, 64);

  let html = "";
  let meta: FetchMeta = {
    reachable: false,
    finalUrl: url,
    https: false,
    status: 0,
    elapsedMs: 0,
    bytes: 0,
  };

  if (url) {
    const started = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": USER_AGENT },
      });
      html = await response.text();
      meta = {
        reachable: response.ok,
        finalUrl: response.url,
        https: response.url.startsWith("https://"),
        status: response.status,
        elapsedMs: Date.now() - started,
        bytes: new TextEncoder().encode(html).length,
      };
    } catch (error) {
      meta = {
        ...meta,
        elapsedMs: Date.now() - started,
        error: error instanceof Error ? error.message : "Fetch failed",
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  const report = auditHtml(html, meta);
  const env = locals.runtime?.env;

  if (env?.DB && isValidEmail(email)) {
    try {
      await upsertLead(env.DB, {
        email,
        business: business || null,
        magnet: "report-card",
        source: `report-card-tool:${report.grade}`,
      });
    } catch (error) {
      console.error("report-card lead capture failed", error);
    }
  }

  return json({ ok: true, report });
};

export const GET: APIRoute = () => new Response("Method not allowed", { status: 405 });
