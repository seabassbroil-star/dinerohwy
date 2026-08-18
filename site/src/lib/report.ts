// The free "Website & Google Report Card" — an honest, automated audit of a
// local business's website. Pure logic: given the fetched HTML + fetch metadata,
// it grades ~11 real signals and returns a letter grade + the top 3 fixes.
// No external APIs, no faked data. Copy is opportunity-framed (see docs/messaging.md).

export type CheckStatus = "pass" | "warn" | "fail";

export interface Check {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  weight: number;
}

export interface Fix {
  title: string;
  why: string;
}

export interface ReportResult {
  ok: boolean;
  url: string | null;
  reachable: boolean;
  score: number; // 0-100
  grade: string; // A / B / C / D / F / —
  checks: Check[];
  fixes: Fix[];
  headline: string;
  summary: string;
}

export interface FetchMeta {
  reachable: boolean;
  finalUrl: string | null;
  https: boolean;
  status: number;
  elapsedMs: number;
  bytes: number;
  error?: string;
}

const has = (re: RegExp, s: string) => re.test(s);

function firstMatch(re: RegExp, s: string): string | null {
  const m = s.match(re);
  return m ? (m[1] ?? "").trim() : null;
}

/** Normalize a user-typed site into a URL (adds https:// if missing). */
export function normalizeUrl(input: string): string | null {
  const t = (input || "").trim();
  if (!t) return null;
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Run the audit against fetched HTML + metadata. Pure — no I/O. */
export function auditHtml(html: string, meta: FetchMeta): ReportResult {
  // Business had no reachable website — that's the report, and the #1 opportunity.
  if (!meta.reachable) {
    return {
      ok: true,
      url: meta.finalUrl,
      reachable: false,
      score: 0,
      grade: "—",
      headline: "We couldn't find a working website.",
      summary:
        "That's not bad news — it's the biggest opportunity on this page. Right now, the people searching for a business like yours can't find you online. Getting a fast, findable site up is the single move that changes that.",
      checks: [],
      fixes: [
        { title: "Get a real website online", why: "It's the one thing standing between you and every customer who searches before they buy. This is where the growth is." },
        { title: "Claim your spot on Google", why: "A Google Business Profile puts you on the map — literally — when people search nearby." },
        { title: "Make it easy to call or book", why: "A tap-to-call button and clear hours turn a searcher into a customer on the spot." },
      ],
    };
  }

  const head = html.slice(0, 200_000); // audit the head/body head, cap work
  const title = firstMatch(/<title[^>]*>([^<]*)<\/title>/i, head);
  const desc = firstMatch(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i, head)
    ?? firstMatch(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i, head);

  const imgCount = (html.match(/<img\b/gi) || []).length;
  const imgAlt = (html.match(/<img\b[^>]*\balt=/gi) || []).length;

  const checks: Check[] = [
    {
      id: "https", label: "Secure (HTTPS)", weight: 14,
      status: meta.https ? "pass" : "fail",
      detail: meta.https ? "Your site is served securely." : "No HTTPS — browsers flag this as 'not secure'.",
    },
    {
      id: "mobile", label: "Works on phones", weight: 13,
      status: has(/<meta[^>]+name=["']viewport["']/i, head) ? "pass" : "fail",
      detail: has(/<meta[^>]+name=["']viewport["']/i, head)
        ? "Set up to resize for phones." : "No mobile setup — most visitors are on a phone.",
    },
    {
      id: "call", label: "Easy to call", weight: 13,
      status: has(/href=["']tel:/i, html) ? "pass" : "fail",
      detail: has(/href=["']tel:/i, html)
        ? "A tap-to-call link is present." : "No tap-to-call — visitors can't call you in one tap.",
    },
    {
      id: "title", label: "Page title", weight: 10,
      status: title ? (title.length >= 10 && title.length <= 65 ? "pass" : "warn") : "fail",
      detail: title ? `“${title.slice(0, 70)}”` : "No page title — Google shows this in results.",
    },
    {
      id: "desc", label: "Search description", weight: 9,
      status: desc ? (desc.length >= 50 && desc.length <= 165 ? "pass" : "warn") : "fail",
      detail: desc ? "A search description is set." : "No description — Google guesses what you do.",
    },
    {
      id: "local", label: "Findable locally", weight: 10,
      status: has(/google\.com\/maps|maps\.google|schema\.org\/LocalBusiness|"?address"?|itemprop=["']address/i, html)
        ? "pass" : "warn",
      detail: "Address / map / local business info that helps you show up nearby.",
    },
    {
      id: "h1", label: "Clear headline", weight: 7,
      status: has(/<h1[\s>]/i, html) ? "pass" : "warn",
      detail: has(/<h1[\s>]/i, html) ? "A main headline is present." : "No clear headline for visitors (or Google).",
    },
    {
      id: "social", label: "Shareable (social)", weight: 6,
      status: has(/<meta[^>]+property=["']og:(title|image)/i, head) ? "pass" : "warn",
      detail: "Preview info for when your link is shared on Facebook, texts, etc.",
    },
    {
      id: "alt", label: "Accessible images", weight: 6,
      status: imgCount === 0 ? "warn" : imgAlt / imgCount >= 0.6 ? "pass" : "warn",
      detail: imgCount === 0 ? "No images found." : `${imgAlt}/${imgCount} images have alt text.`,
    },
    {
      id: "favicon", label: "Branded tab icon", weight: 4,
      status: has(/<link[^>]+rel=["'][^"']*icon/i, head) ? "pass" : "warn",
      detail: "The little icon in the browser tab — a small trust signal.",
    },
    {
      id: "speed", label: "Loads fast & light", weight: 8,
      status: meta.elapsedMs < 1500 && meta.bytes < 1_500_000 ? "pass"
        : meta.elapsedMs < 3500 && meta.bytes < 3_000_000 ? "warn" : "fail",
      detail: `Responded in ${(meta.elapsedMs / 1000).toFixed(1)}s, ${(meta.bytes / 1024).toFixed(0)} KB.`,
    },
  ];

  const gained = checks.reduce((a, c) => a + (c.status === "pass" ? c.weight : c.status === "warn" ? c.weight * 0.5 : 0), 0);
  const total = checks.reduce((a, c) => a + c.weight, 0);
  const score = Math.round((gained / total) * 100);
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";

  const FIX_COPY: Record<string, Fix> = {
    https: { title: "Turn on HTTPS", why: "Browsers label sites without it 'not secure' — it scares customers off before they read a word. It's usually free." },
    mobile: { title: "Make it work on phones", why: "Most of your visitors are on a phone. If it doesn't fit their screen, they leave." },
    call: { title: "Add a tap-to-call button", why: "For a local business this is the highest-value button there is — one tap and they're calling you." },
    title: { title: "Fix your page title", why: "It's the headline Google shows in results. A clear one wins the click." },
    desc: { title: "Write a search description", why: "It's your ad copy on Google. Say what you do and where — in one line." },
    local: { title: "Add your address & map", why: "It's how you show up when people search 'near me'. Add it plus a Google Business Profile." },
    h1: { title: "Add a clear headline", why: "Tell a visitor what you do the second they land — no guessing." },
    social: { title: "Set up link previews", why: "So when someone shares you on Facebook or texts your link, it looks legit." },
    alt: { title: "Describe your images", why: "Helps Google understand your photos and keeps the site accessible." },
    favicon: { title: "Add a tab icon", why: "A small branded touch that makes you look established." },
    speed: { title: "Speed the site up", why: "Every extra second loading costs you visitors. Lighter pages keep them." },
  };

  const fixes = checks
    .filter((c) => c.status !== "pass")
    .sort((a, b) => (a.status === "fail" ? 1 : 0.5) * b.weight - (b.status === "fail" ? 1 : 0.5) * a.weight)
    .slice(0, 3)
    .map((c) => FIX_COPY[c.id])
    .filter(Boolean);

  const headline =
    grade === "A" ? "Strong — your site is doing its job." :
    grade === "B" ? "Good bones, a few quick wins." :
    grade === "C" ? "Solid start — real room to grow." :
    grade === "D" ? "There's a lot of upside here." :
    "Big opportunity — let's turn this around.";

  const summary =
    score >= 80
      ? "You're most of the way there. The fixes below are small changes that punch above their weight."
      : "Nothing here is hard to fix — and each one below directly helps more customers find and choose you.";

  return { ok: true, url: meta.finalUrl, reachable: true, score, grade, checks, fixes, headline, summary };
}
