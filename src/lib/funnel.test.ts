import { describe, expect, it } from "vitest";
import { stageConversionRates } from "./funnel";

const stages = [{ id: "novo" }, { id: "contato" }, { id: "proposta" }];

describe("stageConversionRates", () => {
  it("counts a deal as having passed through every stage before its current one", () => {
    const deals = [
      { stage_id: "novo", status: "open" },
      { stage_id: "contato", status: "open" },
      { stage_id: "proposta", status: "open" },
      { stage_id: "proposta", status: "open" },
    ];
    expect(stageConversionRates(stages, deals)).toEqual([100, 75, 67]);
  });

  it("treats won deals as having reached the last stage, so no rate passes 100%", () => {
    const deals = [
      { stage_id: "novo", status: "open" },
      { stage_id: "proposta", status: "won" },
      { stage_id: "proposta", status: "won" },
    ];
    const rates = stageConversionRates(stages, deals);
    expect(rates.every((r) => r <= 100)).toBe(true);
    expect(rates).toEqual([100, 67, 100]);
  });

  it("returns zero instead of dividing by zero when a stage is empty", () => {
    expect(stageConversionRates(stages, [])).toEqual([100, 0, 0]);
  });
});
