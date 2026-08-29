import { describe, expect, it } from "vitest";
import { normalizeDraft } from "../src/index";

describe("normalizeDraft", () => {
  it("strips markup, bounds text, and flags missing prices", () => {
    const draft = normalizeDraft({
      businessName: "<b>Dinero Tacos</b>",
      items: [{ category: "Tacos", name: "<script>Al pastor</script>", description: "Fresh\u0000 pork", priceCents: null, confidence: "medium" }],
      warnings: [],
    }, 0);
    expect(draft.businessName).toBe("b Dinero Tacos /b");
    expect(draft.items[0]).toMatchObject({ name: "script Al pastor /script", priceCents: null, confidence: "medium" });
    expect(draft.warnings).toContain("Review items with missing or uncertain prices.");
    expect(draft.expiresAt).toBe("1970-01-01T00:30:00.000Z");
  });

  it("drops malformed rows and caps unsafe prices", () => {
    const draft = normalizeDraft({ items: [null, { name: "Valid", priceCents: 99_999_999, confidence: "unexpected" }] });
    expect(draft.items).toHaveLength(1);
    expect(draft.items[0].priceCents).toBeNull();
    expect(draft.items[0].confidence).toBe("low");
  });
});
