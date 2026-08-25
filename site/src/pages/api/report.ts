import type { APIRoute } from "astro";
import { auditHtml, normalizeUrl, type FetchMeta } from "../../lib/report";
import { isValidEmail, upsertLead } from "../../lib/leads";
import { rateLimited } from "../../lib/otp";

export const prerender = false;

const USER_AGENT = "Mozilla/5.0 (compatible; DineroHwyReportCard/1.0; +https://dinerohwy.com)";
const TIMEOUT_MS = 8000;
const MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime?.env;
  const ip = request.headers.get("CF-Connecting-IP") ?? "0.0.0.0";

  const form = await request.formData().catch(() => null);
  if (!form) return json({ ok: false, message: "Bad request" }, 400);

  // Rate limit: a browser render per call is expensive — cap per IP.
  if (await rateLimited(env?.AIGATE, `reportip:${ip}`, 6, 60)) {
    return json({ ok: false, message: "Slow down a moment and try again." }, 429);
  }

  // Cap raw input lengths before use (defense against oversized payloads).
  const url = normalizeUrl(String(form.get("url") ?? "").slice(0, 512));
  const email = String(form.get("email") ?? "").trim().slice(0, 120);
  const business = String(form.get("business") ?? "").trim().slice(0, 64);

  let html = "";
  let screenshot: string | null = null;
  let meta: FetchMeta = {
    reachable: false,
    finalUrl: url,
    https: false,
    status: 0,
    elapsedMs: 0,
    bytes: 0,
  };

  // Primary: the render Worker (real headless-Chrome screenshot + rendered DOM +
  // real load metrics). Falls back to a plain fetch if it's unavailable.
  let rendered = false;
  if (url && env?.RENDER) {
    try {
      const r = await env.RENDER.fetch("https://render/shot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await r.json()) as {
        ok?: boolean; screenshot?: string; html?: string;
        metrics?: { reachable: boolean; finalUrl: string; https: boolean; status: number; loadMs: number; bytes: number };
      };
      if (r.ok && data.ok && data.metrics) {
        rendered = true;
        html = data.html ?? "";
        screenshot = data.screenshot ?? null;
        meta = {
          reachable: data.metrics.reachable,
          finalUrl: data.metrics.finalUrl,
          https: data.metrics.https,
          status: data.metrics.status,
          elapsedMs: data.metrics.loadMs,
          bytes: data.metrics.bytes,
        };
      }
    } catch (error) {
      console.error("[report] render worker failed, falling back", error);
    }
  }

  if (url && !rendered) {
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

  // AI-written, business-specific next steps from the concrete issues found.
  let aiSummary: string | null = null;
  const AI = env?.AI as { run: (m: string, o: unknown) => Promise<{ response?: string }> } | undefined;
  if (AI && report.reachable && report.fixes.length) {
    try {
      const issues = report.fixes.map((f) => f.title).join("; ");
      const who = business ? `the local business "${business}"` : "this local business";
      const out = await AI.run(MODEL, {
        messages: [
          {
            role: "system",
            content:
              "You are a friendly local-business web consultant. In 2-3 warm, plain-English " +
              "sentences, encourage the owner and explain what to tackle first and why it wins " +
              "them customers. No jargon, no lists, no preamble — just the advice.",
          },
          { role: "user", content: `Site issues for ${who}: ${issues}. Score: ${report.score}/100 (${report.grade}).` },
        ],
        max_tokens: 220,
      });
      aiSummary = (out?.response ?? "").trim().replace(/^["']+|["']+$/g, "").slice(0, 700) || null;
    } catch (error) {
      console.error("[report] AI summary failed", error);
    }
  }

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

  return json({ ok: true, report, screenshot, aiSummary });
};

export const GET: APIRoute = () => new Response("Method not allowed", { status: 405 });
