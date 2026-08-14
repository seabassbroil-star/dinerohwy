import { emailLayout, emailButton, emailColors as C, escapeHtml } from "./layout";

export interface QuoteEmailCtx {
  siteUrl: string;
  service: string;
  low: number;
  high: number;
  lines: { label: string; value: string }[];
  unsubscribeUrl?: string;
}

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export function quoteEmail(ctx: QuoteEmailCtx): { subject: string; html: string } {
  const rows = ctx.lines
    .map(
      (l) =>
        `<tr><td style="padding:6px 0;color:${C.creamMuted};font-size:14px">${escapeHtml(l.label)}</td>
         <td style="padding:6px 0;color:${C.cream};font-size:14px;font-weight:700;text-align:right">${escapeHtml(l.value)}</td></tr>`,
    )
    .join("");

  return {
    subject: `Your instant quote: ${money(ctx.low)}–${money(ctx.high)}`,
    html: emailLayout({
      title: "Your instant quote",
      previewText: `${ctx.service}: ${money(ctx.low)}–${money(ctx.high)}`,
      siteUrl: ctx.siteUrl,
      unsubscribeUrl: ctx.unsubscribeUrl,
      bodyHtml:
        `<h1 style="margin:0 0 6px;font-size:22px;color:${C.cream}">Here's your instant quote</h1>` +
        `<p style="margin:0 0 16px;color:${C.creamMuted};font-size:14px">for ${escapeHtml(ctx.service)}</p>` +
        `<div style="padding:18px 20px;border:1px solid ${C.rust};border-radius:12px;background:rgba(199,90,49,.10);margin-bottom:18px">
           <div style="font-size:30px;font-weight:800;color:${C.cream};letter-spacing:-.01em">${money(ctx.low)} – ${money(ctx.high)}</div>
           <div style="font-size:12px;color:${C.creamMuted};text-transform:uppercase;letter-spacing:.1em">estimated range</div>
         </div>` +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">${rows}</table>` +
        `<p style="margin:16px 0 0;color:${C.creamMuted};font-size:14px;line-height:1.6">
           This is a sample estimate to show you the experience. Want this exact tool — instant photo quotes, emailed automatically — on your own site?</p>` +
        emailButton(`${ctx.siteUrl}/free`, "Get this for my business") +
        `<p style="margin:0;color:${C.creamMuted};font-size:13px">You just experienced the product. That's the whole idea. 🚦</p>`,
    }),
  };
}
