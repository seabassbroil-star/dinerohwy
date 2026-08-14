// The Day0 → Day9 follow-up sequence. Each builder returns { subject, html }.
// Keyed by the `kind` stored in SEQUENCE (leads.ts) so the mailer can look up
// the right step by seq_step. Every email demonstrates the email-marketing
// product simply by existing.
import { emailLayout, emailButton, emailColors as C, escapeHtml } from "./layout";

export interface SeqCtx {
  siteUrl: string;
  name?: string | null;
  business?: string | null;
  unsubscribeUrl?: string;
}

type Builder = (ctx: SeqCtx) => { subject: string; html: string };

const p = (text: string) =>
  `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${C.cream}">${text}</p>`;
const muted = (text: string) =>
  `<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:${C.creamMuted}">${text}</p>`;

function greet(ctx: SeqCtx): string {
  const who = ctx.business || ctx.name;
  return who ? `Hey ${escapeHtml(who)},` : "Hey there,";
}

export const sequence: Record<string, Builder> = {
  day0: (ctx) => ({
    subject: "Your free Website & Google Report Card 🚦",
    html: emailLayout({
      title: "Your Report Card",
      previewText: "Your business, graded — plus 3 fixes you can make this week.",
      siteUrl: ctx.siteUrl,
      unsubscribeUrl: ctx.unsubscribeUrl,
      bodyHtml:
        `<h1 style="margin:0 0 12px;font-size:24px;color:${C.cream}">Your Report Card is on the way 🚦</h1>` +
        p(`${greet(ctx)} thanks for asking for your free Website &amp; Google Report Card.`) +
        p(`We're grading your online presence right now and will follow up with your score and <strong>3 specific fixes</strong> you can make this week — no jargon, no pitch.`) +
        muted(`While you wait, meet the tools we build. Every one runs live on our site so you can try it yourself:`) +
        emailButton(`${ctx.siteUrl}/#tools`, "See the live tools") +
        muted(`Just reply to this email if you want us to prioritize anything specific.`),
    }),
  }),

  day2: (ctx) => ({
    subject: "One quick win for your business this week",
    html: emailLayout({
      title: "A quick win",
      previewText: "The fastest way to stop losing after-hours customers.",
      siteUrl: ctx.siteUrl,
      unsubscribeUrl: ctx.unsubscribeUrl,
      bodyHtml:
        `<h1 style="margin:0 0 12px;font-size:22px;color:${C.cream}">A 10-minute win</h1>` +
        p(`${greet(ctx)} here's the single fastest fix for most local businesses: capture people who show up after hours.`) +
        p(`Most visitors who can't reach you simply leave. A tiny "get a callback" box on your site turns those silent bounces into real leads — automatically.`) +
        emailButton(`${ctx.siteUrl}/image-quote`, "See instant-capture in action") +
        muted(`Tomorrow's tip: why a fast quote beats a cheap quote.`),
    }),
  }),

  day5: (ctx) => ({
    subject: "Talk to the assistant on our site",
    html: emailLayout({
      title: "Try the assistant",
      previewText: "See exactly what your customers would experience.",
      siteUrl: ctx.siteUrl,
      unsubscribeUrl: ctx.unsubscribeUrl,
      bodyHtml:
        `<h1 style="margin:0 0 12px;font-size:22px;color:${C.cream}">Play the customer for a minute</h1>` +
        p(`${greet(ctx)} the best way to understand what we build is to be the customer.`) +
        p(`Upload a photo to our instant-quote demo and watch a price come back in minutes. That's the exact experience your customers would get — on your site.`) +
        emailButton(`${ctx.siteUrl}/image-quote`, "Try the quote demo") +
        muted(`It takes 60 seconds and you'll see why this converts.`),
    }),
  }),

  day9: (ctx) => ({
    subject: "Free 15-minute chat?",
    html: emailLayout({
      title: "Let's talk",
      previewText: "No pitch — just 15 minutes on what would move the needle.",
      siteUrl: ctx.siteUrl,
      unsubscribeUrl: ctx.unsubscribeUrl,
      bodyHtml:
        `<h1 style="margin:0 0 12px;font-size:22px;color:${C.cream}">Want a hand putting this to work?</h1>` +
        p(`${greet(ctx)} if any of this looked useful, let's spend 15 minutes on your business specifically — what's leaking money and the one thing worth fixing first.`) +
        p(`No pressure and no pitch. Just useful.`) +
        emailButton(`${ctx.siteUrl}/contact`, "Grab a free 15-min chat") +
        muted(`Prefer email? Just reply to this one.`),
    }),
  }),
};
