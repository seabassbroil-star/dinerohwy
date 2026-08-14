// Pure, client-side estimate rules. Shared by the ImageQuote island (instant
// on-page number) and /api/quote (emailed copy) so both agree. This is a
// believable sample model — a real deployment swaps in the business's pricing.

export interface QuoteService {
  id: string;
  label: string;
  unit: "sqft" | "job";
  base: number; // $ per unit
  min: number; // floor price
}

export const SERVICES: QuoteService[] = [
  { id: "pressure-washing", label: "Pressure washing", unit: "sqft", base: 0.35, min: 180 },
  { id: "concrete", label: "Concrete / driveway", unit: "sqft", base: 8.5, min: 900 },
  { id: "lawn-landscape", label: "Lawn & landscaping", unit: "sqft", base: 0.9, min: 120 },
  { id: "painting", label: "Painting", unit: "sqft", base: 3.2, min: 400 },
  { id: "roofing-repair", label: "Roof repair", unit: "job", base: 650, min: 350 },
  { id: "handyman", label: "General handyman", unit: "job", base: 240, min: 120 },
];

export const CONDITIONS = [
  { id: "good", label: "Good shape", mult: 0.9 },
  { id: "average", label: "Average", mult: 1.0 },
  { id: "rough", label: "Pretty rough", mult: 1.3 },
] as const;

export const URGENCIES = [
  { id: "flexible", label: "Flexible", add: 0 },
  { id: "this-week", label: "This week", add: 0.1 },
  { id: "asap", label: "ASAP / emergency", add: 0.25 },
] as const;

export interface QuoteInput {
  serviceId: string;
  size: number; // sq ft (ignored for per-job services)
  conditionId: string;
  urgencyId: string;
}

export interface QuoteResult {
  low: number;
  high: number;
  service: string;
  lines: { label: string; value: string }[];
}

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export function estimate(input: QuoteInput): QuoteResult | null {
  const svc = SERVICES.find((s) => s.id === input.serviceId);
  const cond = CONDITIONS.find((c) => c.id === input.conditionId) ?? CONDITIONS[1];
  const urg = URGENCIES.find((u) => u.id === input.urgencyId) ?? URGENCIES[0];
  if (!svc) return null;

  const size = svc.unit === "sqft" ? Math.max(0, input.size || 0) : 1;
  let base = svc.unit === "sqft" ? svc.base * size : svc.base;
  base *= cond.mult;
  base *= 1 + urg.add;
  base = Math.max(base, svc.min);

  const low = base * 0.9;
  const high = base * 1.18;

  const lines = [
    { label: "Service", value: svc.label },
    ...(svc.unit === "sqft" ? [{ label: "Size", value: `${size.toLocaleString("en-US")} sq ft` }] : []),
    { label: "Condition", value: cond.label },
    { label: "Timeline", value: urg.label },
  ];

  return { low: Math.round(low), high: Math.round(high), service: svc.label, lines };
}

export function formatRange(r: QuoteResult): string {
  return `${money(r.low)} – ${money(r.high)}`;
}
