import { describe, expect, it } from "vitest";
import { buildShoppingList } from "@/lib/shopping";

describe("buildShoppingList", () => {
  const list = buildShoppingList({
    items: [
      { recipeId: "dal-tadka", servings: 4 },
      { recipeId: "jeera-rice", servings: 8 },
    ],
    pantry: ["cumin-seeds", "ghee"],
    stores: ["kroger"],
  });
  const items = list.categories.flatMap((c) => c.items);
  const find = (id: string) => items.find((i) => i.id === id)!;

  it("combines quantities across recipes and scales by servings", () => {
    // dal tadka 1 tsp + jeera rice 1.5 tsp × 2 = 4 tsp
    expect(find("cumin-seeds").quantity).toBe("4 tsp");
    expect(find("cumin-seeds").usedIn).toEqual(["Dal Tadka", "Jeera Rice"]);
    expect(find("basmati-rice").quantity).toBe("3 cups");
  });

  it("marks pantry items so they can be shown struck through", () => {
    expect(find("ghee").inPantry).toBe(true);
    expect(find("onion").inPantry).toBe(false);
    expect(list.summary).toEqual({ totalItems: items.length, inPantry: 2, toBuy: items.length - 2 });
  });

  it("leaves out staples and flags optional items", () => {
    expect(items.some((i) => i.id === "salt" || i.id === "water")).toBe(false);
    expect(list.assumedAtHome).toEqual(["Salt", "Water"]);
    expect(find("cilantro").optional).toBe(true);
    expect(find("onion").optional).toBe(false);
  });

  it("groups by category and says where to buy", () => {
    expect(list.categories[0].category.id).toBe("vegetables");
    expect(find("onion").availableAt).toEqual(["Kroger"]);
    expect(list.notSoldAtChosenStores).toEqual(["Toor Dal"]);
  });

  it("reports unknown recipes", () => {
    expect(buildShoppingList({ items: [{ recipeId: "pizza", servings: 2 }] }).unknownRecipes).toEqual(["pizza"]);
  });
});
