import type { APIRoute } from "astro";
import { auditHtml, normalizeUrl, type FetchMeta } from "../../lib/report";
import { upsertLead, isValidEmail } from "../../lib/leads";

export const prerender = false;

const UA = "Mozilla/5.0 (compatible; DineroHwyReportCard/1.0; +https://dinerohwy.com)";

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  const form = await request.formData().catch(() => null);
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

  if (!form) return json({ ok: false, message: "Bad request" }, 400);

  const rawUrl = String(form.get("url") ?? "");
  const url = normalizeUrl(rawUrl);
  const email = String(form.get("email") ?? "").trim();
  const business = String(form.get("business") ?? "").trim();

  // Fetch the site (server-side avoids CORS), with a timeout.
  let meta: FetchMeta = { reachable: false, finalUrl: url, https: false, status: 0, elapsedMs: 0, bytes: 0 };
  let html = "";
  if (url) {
    const started = Date.now();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(url, {
        headers: { "user-agent": UA, accept: "text/html" },
        redirect: "follow",
        signal: ctrl.signal,
      });
      html = await res.text();
      const finalUrl = res.url || url;
      meta = {
        reachable: res.ok || (res.status >= 200 && res.status < 400),
        finalUrl,
        https: finalUrl.startsWith("https://"),
        status: res.status,
        elapsedMs: Date.now() - started,
        bytes: html.length,
      };
    } catch (err) {
      meta = { reachable: false, finalUrl: url, https: false, status: 0, elapsedMs: Date.now() - started, bytes: 0, error: String(err) };
    } finally {
      clearTimeout(timer);
    }
  }

  const report = auditHtml(html, meta);

  // Capture the lead if they left an email (value delivered first — see GTM).
  if (env?.DB && isValidEmail(email)) {
    try {
      await upsertLead(env.DB, {
        email,
        business: business || null,
        magnet: "report-card",
        source: `report-card-tool${report.grade !== "—" ? `:${report.grade}` : ""}`,
      });
    } catch (err) {
      console.error("[report] lead upsert failed", err);
    }
  }

  return json({ ok: true, report });
};

export const GET: APIRoute = () => new Response("Method not allowed", { status: 405 });
