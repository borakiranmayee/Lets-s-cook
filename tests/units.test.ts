import { describe, expect, it } from "vitest";
import { combineAmounts, formatAmount, formatAmounts, scaleAmount } from "@/lib/units";

describe("scaleAmount", () => {
  it("scales and rounds to measurable steps", () => {
    expect(scaleAmount({ qty: 1, unit: "cup" }, 1.5)).toEqual({ qty: 1.5, unit: "cup" });
    expect(scaleAmount({ qty: 1, unit: "piece" }, 0.6)).toEqual({ qty: 0.5, unit: "piece" });
    expect(scaleAmount({ qty: 4, unit: "clove" }, 1.3)).toEqual({ qty: 5, unit: "clove" });
    expect(scaleAmount({ qty: 300, unit: "g" }, 1.5)).toEqual({ qty: 450, unit: "g" });
    expect(scaleAmount({ qty: 0, unit: "to taste" }, 3)).toEqual({ qty: 0, unit: "to taste" });
  });
});

describe("combineAmounts", () => {
  it("adds volumes across units and picks a friendly unit", () => {
    // 2 tbsp + 3 tsp = 45 ml = 3 tbsp
    expect(combineAmounts([{ qty: 2, unit: "tbsp" }, { qty: 3, unit: "tsp" }])).toEqual([{ qty: 3, unit: "tbsp" }]);
    // 1 cup + 0.5 cup = 1.5 cups
    expect(combineAmounts([{ qty: 1, unit: "cup" }, { qty: 0.5, unit: "cup" }])).toEqual([{ qty: 1.5, unit: "cup" }]);
    // 5 tbsp is not a clean cup fraction, so it stays in tbsp
    expect(combineAmounts([{ qty: 3, unit: "tbsp" }, { qty: 2, unit: "tbsp" }])).toEqual([{ qty: 5, unit: "tbsp" }]);
    // 4 tbsp = ¼ cup
    expect(combineAmounts([{ qty: 4, unit: "tbsp" }])).toEqual([{ qty: 0.25, unit: "cup" }]);
    // 4 tsp doesn't fit tbsp cleanly
    expect(combineAmounts([{ qty: 4, unit: "tsp" }])).toEqual([{ qty: 4, unit: "tsp" }]);
  });

  it("converts grams to kg and keeps count units separate", () => {
    expect(combineAmounts([{ qty: 750, unit: "g" }, { qty: 500, unit: "g" }, { qty: 2, unit: "piece" }])).toEqual([
      { qty: 1.3, unit: "kg" },
      { qty: 2, unit: "piece" },
    ]);
  });

  it("drops 'to taste' when there is a real amount", () => {
    expect(combineAmounts([{ qty: 0, unit: "to taste" }, { qty: 1, unit: "pinch" }])).toEqual([{ qty: 1, unit: "pinch" }]);
    expect(combineAmounts([{ qty: 0, unit: "to taste" }])).toEqual([{ qty: 0, unit: "to taste" }]);
  });
});

describe("formatAmount", () => {
  it("uses fractions and plurals", () => {
    expect(formatAmount({ qty: 1.5, unit: "cup" })).toBe("1½ cups");
    expect(formatAmount({ qty: 0.25, unit: "tsp" })).toBe("¼ tsp");
    expect(formatAmount({ qty: 3, unit: "piece" })).toBe("3");
    expect(formatAmount({ qty: 2, unit: "clove" })).toBe("2 cloves");
    expect(formatAmounts([{ qty: 1, unit: "inch" }, { qty: 2, unit: "piece" }])).toBe("1 inch + 2");
  });
});

describe("scaleAmount piece rounding", () => {
  it("rounds 2+ pieces to whole numbers but keeps halves for small counts", () => {
    expect(scaleAmount({ qty: 3, unit: "piece" }, 1.5)).toEqual({ qty: 5, unit: "piece" });
    expect(scaleAmount({ qty: 1, unit: "piece" }, 1.5)).toEqual({ qty: 1.5, unit: "piece" });
  });
});
