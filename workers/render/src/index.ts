// Internal rendering Worker. Pages Functions can't hold the Browser Rendering
// binding, so this Worker does — reached only via the site's RENDER service
// binding. Given a URL it returns a real screenshot + practical load metrics
// (and, once R2 is enabled, a branded PDF).
//
// Contract: POST { url } → { ok, screenshot(b64 png), metrics, finalUrl } | { ok:false }
import puppeteer from "@cloudflare/puppeteer";

interface Env {
  BROWSER: Fetcher;
}

interface Metrics {
  reachable: boolean;
  finalUrl: string | null;
  status: number;
  https: boolean;
  loadMs: number;
  bytes: number;
  mobileViewport: boolean;
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/** Base64 without spreading the whole array into fromCharCode (stack-safe for big PNGs). */
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** Only allow http(s) to a public host — never let this fetch internal addresses (SSRF guard). */
function safeUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  const host = u.hostname.toLowerCase();
  if (!host.includes(".")) return null;
  // Block obvious internal/loopback/metadata targets.
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === "metadata.google.internal"
  ) {
    return null;
  }
  return u.toString();
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") return json(405, { ok: false, error: "method" });

    let body: { url?: unknown };
    try {
      body = await request.json();
    } catch {
      return json(400, { ok: false, error: "bad json" });
    }
    const url = safeUrl(body.url);
    if (!url) return json(422, { ok: false, error: "bad url" });

    let browser;
    try {
      browser = await puppeteer.launch(env.BROWSER);
      const page = await browser.newPage();
      await page.setViewport({ width: 390, height: 780, isMobile: true }); // grade the phone view

      const t0 = Date.now();
      const resp = await page.goto(url, { waitUntil: "networkidle0", timeout: 20_000 }).catch(() => null);
      const loadMs = Date.now() - t0;

      const html = await page.content().catch(() => "");
      const finalUrl = page.url();
      const screenshot = (await page.screenshot({ type: "png" })) as Uint8Array;

      const metrics: Metrics = {
        reachable: !!resp,
        finalUrl,
        status: resp?.status() ?? 0,
        https: finalUrl.startsWith("https://"),
        loadMs,
        bytes: html.length,
        mobileViewport: /<meta[^>]+name=["']viewport["']/i.test(html.slice(0, 200_000)),
      };

      return json(200, {
        ok: true,
        screenshot: toBase64(screenshot),
        metrics,
        html: html.slice(0, 200_000), // let the caller reuse auditHtml() on the rendered DOM
      });
    } catch (err) {
      console.error("[render] failed", err);
      return json(502, { ok: false, error: String(err) });
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  },
} satisfies ExportedHandler<Env>;
