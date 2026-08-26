// Booking demo. A single Durable Object ("demo") holds live slot state so every
// visitor sees the same availability in real time. Reached only via the Pages
// site's BOOKING service binding (no public URL). The site handles emails.
//
// Routes: GET /slots · POST /book {slot,name} · POST /reset

interface Slot {
  id: string;
  label: string;
  taken: boolean;
  by?: string;
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

function seedSlots(): Slot[] {
  const out: Slot[] = [];
  const now = Date.now();
  const times = ["9:00 AM", "1:00 PM", "4:00 PM"];
  for (let d = 1; d <= 3; d++) {
    const dt = new Date(now + d * 86_400_000);
    const day = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    for (const t of times) {
      out.push({ id: `${d}-${t.replace(/[^0-9A-Za-z]/g, "")}`, label: `${day} · ${t}`, taken: false });
    }
  }
  return out;
}

export class BookingRoom {
  state: DurableObjectState;
  constructor(state: DurableObjectState) {
    this.state = state;
  }

  private async slots(): Promise<Slot[]> {
    let slots = (await this.state.storage.get<Slot[]>("slots")) ?? null;
    if (!slots) {
      slots = seedSlots();
      await this.state.storage.put("slots", slots);
    }
    return slots;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname.endsWith("/slots")) {
      return json(200, { ok: true, slots: await this.slots() });
    }

    if (request.method === "POST" && url.pathname.endsWith("/reset")) {
      const slots = seedSlots();
      await this.state.storage.put("slots", slots);
      return json(200, { ok: true, slots });
    }

    if (request.method === "POST" && url.pathname.endsWith("/book")) {
      const body = (await request.json().catch(() => ({}))) as { slot?: string; name?: string };
      const slots = await this.slots();
      const i = slots.findIndex((s) => s.id === body.slot);
      if (i < 0) return json(422, { ok: false, error: "unknown slot" });
      if (slots[i].taken) return json(409, { ok: false, error: "That slot was just taken — pick another." });
      slots[i] = { ...slots[i], taken: true, by: (body.name ?? "").slice(0, 50) };
      await this.state.storage.put("slots", slots);
      return json(200, { ok: true, slot: slots[i], slots });
    }

    return json(404, { ok: false, error: "not found" });
  }
}

interface Env {
  ROOM: DurableObjectNamespace;
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    // Everyone shares the one "demo" room.
    const id = env.ROOM.idFromName("demo");
    return env.ROOM.get(id).fetch(request);
  },
} satisfies ExportedHandler<Env>;
