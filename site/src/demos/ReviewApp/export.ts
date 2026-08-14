// Turn annotation pins into shippable artifacts: a Markdown checklist and a
// GitHub-issue-ready payload. This is the bridge in the mobile-cockpit loop —
// review on the phone, export here, paste into a git workflow.

export interface Pin {
  id: number;
  x: number; // 0..100 (% of image width)
  y: number; // 0..100 (% of image height)
  note: string;
  priority: "must" | "should" | "nice";
}

export interface ReviewMeta {
  title: string;
  pageUrl: string;
}

const PRIORITY_LABEL: Record<Pin["priority"], string> = {
  must: "🔴 Must-fix",
  should: "🟡 Should-fix",
  nice: "🟢 Nice-to-have",
};

export function toMarkdown(meta: ReviewMeta, pins: Pin[]): string {
  const header =
    `# Review: ${meta.title || "Untitled page"}\n\n` +
    (meta.pageUrl ? `**Page:** ${meta.pageUrl}\n\n` : "") +
    `**${pins.length} note${pins.length === 1 ? "" : "s"}**\n\n`;

  if (!pins.length) return header + "_No notes yet._\n";

  const items = pins
    .map((pin, i) => {
      const loc = `at ${Math.round(pin.x)}%, ${Math.round(pin.y)}%`;
      const note = pin.note.trim() || "_(no description)_";
      return `- [ ] **#${i + 1}** ${PRIORITY_LABEL[pin.priority]} — ${note} \`(${loc})\``;
    })
    .join("\n");

  return header + items + "\n";
}

export function toGithubIssue(meta: ReviewMeta, pins: Pin[]) {
  const mustCount = pins.filter((p) => p.priority === "must").length;
  return {
    title: `Review: ${meta.title || "page"} — ${pins.length} note${pins.length === 1 ? "" : "s"}${
      mustCount ? ` (${mustCount} must-fix)` : ""
    }`,
    body: toMarkdown(meta, pins),
    labels: ["review", ...(mustCount ? ["must-fix"] : [])],
  };
}

export function download(filename: string, text: string, type = "text/markdown") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
