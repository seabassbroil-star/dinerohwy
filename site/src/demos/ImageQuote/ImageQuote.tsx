import { useMemo, useRef, useState } from "react";
import {
  SERVICES,
  CONDITIONS,
  URGENCIES,
  estimate,
  formatRange,
} from "./quote-math";
import "./ImageQuote.css";

export default function ImageQuote() {
  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [size, setSize] = useState(400);
  const [conditionId, setConditionId] = useState("average");
  const [urgencyId, setUrgencyId] = useState("flexible");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const fileInput = useRef<HTMLInputElement>(null);

  const service = SERVICES.find((s) => s.id === serviceId)!;
  const result = useMemo(
    () => estimate({ serviceId, size, conditionId, urgencyId }),
    [serviceId, size, conditionId, urgencyId],
  );

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!result) return;
    setState("sending");
    const fd = new FormData();
    fd.set("email", email);
    fd.set("serviceId", serviceId);
    fd.set("service", service.label);
    fd.set("size", String(size));
    fd.set("conditionId", conditionId);
    fd.set("urgencyId", urgencyId);
    fd.set("low", String(result.low));
    fd.set("high", String(result.high));
    if (file) fd.set("photo", file);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="iq">
      <div className="iq-grid">
        <label className="iq-drop" aria-label="Upload a photo">
          <input ref={fileInput} type="file" accept="image/*" onChange={onPick} />
          {previewUrl ? (
            <span className="iq-preview">
              <img src={previewUrl} alt="Your uploaded job" />
            </span>
          ) : (
            <>
              <svg className="iq-drop-icon" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4" /><path d="m7 9 5-5 5 5" />
                <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
              </svg>
              <span>Tap to add a photo of the job</span>
              <small>(optional — helps us quote accurately)</small>
            </>
          )}
        </label>

        <div className="iq-fields">
          <label className="iq-label">
            What do you need?
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              {SERVICES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>

          {service.unit === "sqft" && (
            <label className="iq-label">
              Approx. size (sq ft)
              <input
                type="number"
                min={0}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </label>
          )}

          <label className="iq-label">
            Condition
            <select value={conditionId} onChange={(e) => setConditionId(e.target.value)}>
              {CONDITIONS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>

          <label className="iq-label">
            How soon?
            <select value={urgencyId} onChange={(e) => setUrgencyId(e.target.value)}>
              {URGENCIES.map((u) => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {result && (
        <div className="iq-result">
          <div className="iq-range">
            {formatRange(result)}
            <small>Instant estimate</small>
          </div>
          <ul className="iq-lines">
            {result.lines.map((l) => (
              <li key={l.label}><span>{l.label}</span><b>{l.value}</b></li>
            ))}
          </ul>
        </div>
      )}

      {state === "sent" ? (
        <p className="iq-status ok">
          ✅ Done — your quote is in your inbox. That's exactly what your customers would experience.
        </p>
      ) : (
        <form className="iq-send" onSubmit={onSubmit}>
          <div className="iq-send-row">
            <input
              type="email"
              required
              placeholder="Email me this quote"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={state === "sending"}>
              {state === "sending" ? "Sending…" : "Email me this quote"}
            </button>
          </div>
          {state === "error" && <p className="iq-status err">Hmm, that didn't go through. Try again?</p>}
          <p className="iq-note">This is a live sample tool. You'll get a real email — no spam, unsubscribe anytime.</p>
        </form>
      )}
    </div>
  );
}
