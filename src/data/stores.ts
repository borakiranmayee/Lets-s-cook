import type { Store } from "@/lib/types";

/**
 * Best-effort estimates of what each store usually stocks. Stock varies by
 * location, so edit these lists freely.
 *
 * - Indian stores carry everything.
 * - Other stores carry every regular ingredient except `doesNotCarry`, and
 *   only the specialty ingredients (marked `specialty` in ingredients.ts)
 *   listed in `alsoCarries`.
 */
export const stores: Store[] = [
  { id: "patel-brothers", name: "Patel Brothers", type: "indian", carriesAll: true },
  { id: "indian-grocery", name: "Local Indian Grocery", type: "indian", carriesAll: true },
  {
    id: "kroger",
    name: "Kroger",
    type: "mainstream",
    alsoCarries: ["paneer", "tamarind", "besan"],
    doesNotCarry: ["mutton"],
  },
  {
    id: "walmart",
    name: "Walmart",
    type: "mainstream",
    alsoCarries: ["paneer", "atta", "tamarind"],
    doesNotCarry: ["mutton"],
  },
  {
    id: "target",
    name: "Target",
    type: "mainstream",
    alsoCarries: [],
    doesNotCarry: ["mutton", "okra", "fish", "green-cardamom", "mustard-seeds", "fenugreek-seeds", "dried-red-chili", "masoor-dal", "rava"],
  },
  {
    id: "costco",
    name: "Costco",
    type: "warehouse",
    alsoCarries: [],
    doesNotCarry: [
      "okra", "eggplant", "cabbage", "green-chili", "cilantro", "mint",
      "mutton", "masoor-dal", "rava", "maida",
      "mustard-seeds", "bay-leaf", "cloves", "green-cardamom", "dried-red-chili", "fenugreek-seeds",
      "coriander-powder", "cumin-powder", "garam-masala", "cumin-seeds",
      "sesame-seeds", "coconut-oil", "cream",
    ],
  },
];
