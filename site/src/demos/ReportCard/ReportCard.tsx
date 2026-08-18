import { useState } from "react";
import "./ReportCard.css";

interface Check { id: string; label: string; status: "pass" | "warn" | "fail"; detail: string; }
interface Fix { title: string; why: string; }
interface Report {
  reachable: boolean; url: string | null; score: number; grade: string;
  headline: string; summary: string; checks: Check[]; fixes: Fix[];
}

export default function ReportCard() {
  const [business, setBusiness] = useState("");
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [report, setReport] = useState<Report | null>(null);
  const [err, setErr] = useState("");
  const [emailed, setEmailed] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!url.trim()) { setErr("Enter your website (or type 'none' if you don't have one yet)."); return; }
    setState("running");
    const fd = new FormData();
    fd.set("url", url.trim().toLowerCase() === "none" ? "" : url);
    fd.set("business", business);
    if (email) { fd.set("email", email); setEmailed(true); }
    try {
      const res = await fetch("/api/report", { method: "POST", body: fd });
      const data = await res.json();
      if (data?.ok && data.report) { setReport(data.report); setState("done"); }
      else { setState("error"); setErr("Couldn't grade that — check the address and try again."); }
    } catch {
      setState("error"); setErr("Network hiccup — try again.");
    }
  }

  function reset() { setReport(null); setState("idle"); setEmailed(false); }

  if (state === "done" && report) {
    return (
      <div className="rc-result">
        <div className="rc-top">
          <div className="rc-grade" data-g={report.grade}>
            <b>{report.grade}</b>
            {report.reachable && <span>{report.score}/100</span>}
          </div>
          <div>
            <p className="rc-headline">{report.headline}</p>
            <p className="rc-summary">{report.summary}</p>
            {report.url && <span className="rc-url">{report.url}</span>}
          </div>
        </div>

        {report.checks.length > 0 && (
          <div className="rc-checks">
            {report.checks.map((c) => (
              <div className="rc-check" key={c.id}>
                <span className={`rc-dot ${c.status}`} />
                <span className="rc-check-label">{c.label}</span>
                <span style={{ fontSize: 12, color: "var(--cream-muted)" }}>
                  {c.status === "pass" ? "✓" : c.status === "warn" ? "!" : "✕"}
                </span>
                <span className="rc-check-detail">{c.detail}</span>
              </div>
            ))}
          </div>
        )}

        <div className="rc-fixes">
          <h3>Your top 3 fixes</h3>
          {report.fixes.map((f, i) => (
            <div className="rc-fix" key={i}>
              <span className="rc-fix-n">{i + 1}</span>
              <div><b>{f.title}</b><p>{f.why}</p></div>
            </div>
          ))}
        </div>

        <div className="rc-cta">
          <b>Want these fixes done for you?</b>
          <p style={{ margin: 0, color: "var(--cream-muted)", fontSize: "var(--step--1)" }}>
            {emailed
              ? "We've got your email — we'll follow up with the full report and what it'd take. No pressure."
              : "That's what we do — local, built by hand. Leave your email and we'll send the full report plus what it'd take."}
          </p>
          {!emailed && (
            <div className="rc-actions">
              <input className="rc-note-input" style={{ flex: "1 1 200px", padding: ".75rem .9rem", font: "inherit", color: "var(--cream)", background: "rgba(6,27,20,.55)", border: "1px solid var(--line-strong)", borderRadius: "9px" }}
                type="email" placeholder="you@yourbusiness.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="btn btn-primary" type="button" onClick={() => { if (email) { const fd = new FormData(); fd.set("url", report.url ?? ""); fd.set("business", business); fd.set("email", email); fetch("/api/report", { method: "POST", body: fd }); setEmailed(true); } }}>
                Send me the full report
              </button>
            </div>
          )}
          {emailed && <p className="rc-sent">✅ Sent — check your inbox.</p>}
          <button className="rc-again" type="button" onClick={reset}>Grade another business</button>
        </div>
      </div>
    );
  }

  return (
    <form className="rc-form" onSubmit={run}>
      <div className="rc-row">
        <input type="text" placeholder="Business name (optional)" value={business} onChange={(e) => setBusiness(e.target.value)} />
        <input type="text" placeholder="Your website (e.g. cruzmeats.com)" value={url} onChange={(e) => setUrl(e.target.value)} required />
      </div>
      <div className="rc-row">
        <input type="email" placeholder="Email me the full report (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn btn-primary" type="submit" disabled={state === "running"}>
          {state === "running" ? "Grading…" : "Grade my business — free"}
        </button>
      </div>
      {err && <p className="rc-err">{err}</p>}
      <p className="rc-note">No website yet? Type <b>none</b> — the report will show what showing up would do for you.</p>
    </form>
  );
}
