import { useRef, useState } from "react";
import {
  type Pin,
  type ReviewMeta,
  toMarkdown,
  toGithubIssue,
  download,
  copy,
} from "./export";
import "./ReviewApp.css";

const PRIORITIES: Pin["priority"][] = ["must", "should", "nice"];
const PIN_GLYPH: Record<Pin["priority"], string> = { must: "!", should: "•", nice: "·" };

export default function ReviewApp() {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [meta, setMeta] = useState<ReviewMeta>({ title: "", pageUrl: "" });
  const [toast, setToast] = useState("");
  const nextId = useRef(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setImgUrl(URL.createObjectURL(f));
    setPins([]);
    if (!meta.title) setMeta((m) => ({ ...m, title: f.name.replace(/\.[^.]+$/, "") }));
  }

  function onCanvasClick(e: React.MouseEvent) {
    const el = canvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPins((prev) => [...prev, { id: nextId.current++, x, y, note: "", priority: "should" }]);
  }

  const updatePin = (id: number, patch: Partial<Pin>) =>
    setPins((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const removePin = (id: number) => setPins((prev) => prev.filter((p) => p.id !== id));

  async function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function copyMarkdown() {
    const ok = await copy(toMarkdown(meta, pins));
    flash(ok ? "Markdown copied to clipboard ✅" : "Copy failed — try download");
  }
  async function copyIssue() {
    const ok = await copy(JSON.stringify(toGithubIssue(meta, pins), null, 2));
    flash(ok ? "GitHub issue JSON copied ✅" : "Copy failed — try download");
  }
  function downloadMd() {
    download(`review-${(meta.title || "page").replace(/\s+/g, "-").toLowerCase()}.md`, toMarkdown(meta, pins));
    flash("Markdown downloaded ✅");
  }

  return (
    <div className="ra">
      <div className="ra-meta">
        <input
          type="text"
          placeholder="Page name (e.g. Home hero)"
          value={meta.title}
          onChange={(e) => setMeta({ ...meta, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Page URL (optional)"
          value={meta.pageUrl}
          onChange={(e) => setMeta({ ...meta, pageUrl: e.target.value })}
        />
      </div>

      <div className="ra-stage">
        {imgUrl ? (
          <div className="ra-canvas" ref={canvasRef} onClick={onCanvasClick}>
            <img src={imgUrl} alt="Screenshot under review" />
            {pins.map((pin, i) => (
              <span
                key={pin.id}
                className={`ra-pin ${pin.priority}`}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                title={pin.note || `Note ${i + 1}`}
                onClick={(e) => e.stopPropagation()}
              >
                <span>{i + 1}</span>
              </span>
            ))}
          </div>
        ) : (
          <label className="ra-drop">
            <input type="file" accept="image/*" onChange={onPick} />
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--rust-light)" }}>
              <path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
            </svg>
            <span>Upload a screenshot from your phone</span>
            <small>Then tap the image to drop notes</small>
          </label>
        )}
      </div>

      {imgUrl && <p className="ra-hint">Tap the screenshot to drop a numbered pin. {pins.length} note{pins.length === 1 ? "" : "s"} so far.</p>}

      {pins.length > 0 && (
        <div className="ra-list">
          {pins.map((pin, i) => (
            <div className="ra-note" key={pin.id}>
              <span className="ra-note-n">{i + 1}</span>
              <textarea
                placeholder="What needs to change here?"
                value={pin.note}
                onChange={(e) => updatePin(pin.id, { note: e.target.value })}
              />
              <select value={pin.priority} onChange={(e) => updatePin(pin.id, { priority: e.target.value as Pin["priority"] })}>
                {PRIORITIES.map((pr) => (
                  <option key={pr} value={pr}>{pr === "must" ? "Must" : pr === "should" ? "Should" : "Nice"}</option>
                ))}
              </select>
              <button type="button" aria-label="Delete note" onClick={() => removePin(pin.id)}>×</button>
            </div>
          ))}
        </div>
      )}

      {pins.length > 0 && (
        <div className="ra-actions">
          <button className="btn btn-primary" type="button" onClick={copyMarkdown}>Copy Markdown</button>
          <button className="btn btn-ghost" type="button" onClick={downloadMd}>Download .md</button>
          <button className="btn btn-ghost" type="button" onClick={copyIssue}>Copy GitHub issue</button>
          {toast && <p className="ra-toast">{toast}</p>}
        </div>
      )}
    </div>
  );
}
