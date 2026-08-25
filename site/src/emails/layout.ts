// Shared HTML email shell. Email clients ignore <style>/custom properties and
// SVG, so everything is table-based with inline styles and brand colors are
// hardcoded from the design tokens. A text wordmark stands in for the logo
// (SVG doesn't render in Gmail/Outlook).

const C = {
  ink: "#061b14",
  green: "#0b2d22",
  greenLite: "#103b2d",
  cream: "#f4eedc",
  creamMuted: "#c9c5b7",
  rust: "#c75a31",
  line: "#345e4d",
};

export interface LayoutArgs {
  title: string;
  previewText?: string;
  bodyHtml: string;
  siteUrl: string;
  unsubscribeUrl?: string;
}

export function emailLayout({ title, previewText, bodyHtml, siteUrl, unsubscribeUrl }: LayoutArgs): string {
  const preview = previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(previewText)}</div>`
    : "";
  const unsub = unsubscribeUrl
    ? `<a href="${unsubscribeUrl}" style="color:${C.creamMuted};text-decoration:underline">unsubscribe</a>`
    : "";

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${C.ink};color:${C.cream};font-family:Inter,Segoe UI,Arial,sans-serif;">
${preview}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.ink};padding:24px 12px">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.green};border:1px solid ${C.line};border-radius:16px;overflow:hidden">
      <tr><td style="padding:22px 28px;border-bottom:1px solid ${C.line}">
        <a href="${siteUrl}" style="text-decoration:none;font-size:20px;font-weight:800;letter-spacing:-.02em;color:${C.cream}">
          Dinero <span style="color:${C.rust}">Hwy</span>
        </a>
      </td></tr>
      <tr><td style="padding:28px">
        ${bodyHtml}
      </td></tr>
      <tr><td style="padding:20px 28px;border-top:1px solid ${C.line};font-size:12px;color:${C.creamMuted}">
        DineroHWY · Galveston, Texas · Ecuador branch<br>
        Software that makes your local business money while you run it.<br>
        ${unsub ? `<span style="display:inline-block;margin-top:8px">${unsub}</span>` : ""}
      </td></tr>
    </table>
    <div style="font-size:11px;color:${C.creamMuted};margin-top:14px">Domain &amp; hosting on Cloudflare</div>
  </td></tr>
</table>
</body></html>`;
}

/** Rust CTA button as a bulletproof-ish table. */
export function emailButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0">
    <tr><td style="border-radius:9px;background:${C.rust}">
      <a href="${href}" style="display:inline-block;padding:13px 22px;font-size:15px;font-weight:800;color:${C.cream};text-decoration:none;border-radius:9px">${escapeHtml(label)}</a>
    </td></tr></table>`;
}

export const emailColors = C;

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
