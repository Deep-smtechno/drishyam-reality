import type { Property } from "./types";
import { formatPrice } from "./demo";
export type FilterOption = { value: string; label: string; count: number };
const order = {
  category: ["Residential", "Commercial", "Land"],
  type: [
    "Apartment",
    "Villa / Bungalow",
    "Office",
    "Shop / Showroom",
    "Industrial",
    "Land / Plot",
  ],
  condition: ["New", "Resale"],
  furnishing: ["Unfurnished", "Semi-furnished", "Furnished"],
  possession: ["Ready to move", "Under construction", "Immediate"],
};
/** The places a property can be found under: "Adajan, Surat" belongs to both "Adajan" and "Surat". */
export function locationParts(location: string) {
  return location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}
function tally(values: string[], preferred: string[] = []): FilterOption[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const rank = (v: string) => {
    const i = preferred.indexOf(v);
    return i === -1 ? preferred.length : i;
  };
  return [...counts.entries()]
    .sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, label: value, count }));
}
const budgetSteps = [
  2500000, 5000000, 7500000, 10000000, 15000000, 20000000, 30000000, 50000000,
  100000000,
];
/**
 * Builds every filter list from the properties themselves, so a new area, category or
 * type appears as soon as a property uses it and an unused one never leads to an empty page.
 */
export function buildFilterOptions(properties: Property[]) {
  const locationCounts = new Map<string, Set<string>>();
  for (const p of properties)
    for (const part of locationParts(p.location)) {
      if (!locationCounts.has(part)) locationCounts.set(part, new Set());
      locationCounts.get(part)!.add(p.id);
    }
  const location = [...locationCounts.entries()]
    .map(([value, ids]) => ({ value, label: value, count: ids.size }))
    .sort((a, b) => a.value.localeCompare(b.value));
  const prices = properties.map((p) => p.price).filter((n) => n > 0);
  const maxPrice = Math.max(0, ...prices);
  const budget: FilterOption[] = [];
  for (const step of budgetSteps) {
    const count = prices.filter((n) => n <= step).length;
    if (count > 0)
      budget.push({
        value: String(step),
        label: `Up to ${formatPrice(step)}`,
        count,
      });
    if (step >= maxPrice) break;
  }
  const maxBeds = Math.min(
    5,
    Math.max(0, ...properties.map((p) => p.bedrooms)),
  );
  const beds: FilterOption[] = Array.from({ length: maxBeds }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1}+ bedroom${i ? "s" : ""}`,
    count: properties.filter((p) => p.bedrooms >= i + 1).length,
  }));
  return {
    location,
    category: tally(
      properties.map((p) => p.category),
      order.category,
    ),
    type: tally(
      properties.map((p) => p.type),
      order.type,
    ),
    condition: tally(
      properties.map((p) => p.condition),
      order.condition,
    ),
    furnishing: tally(
      properties.map((p) => p.furnishing),
      order.furnishing,
    ),
    possession: tally(
      properties.map((p) => p.possession),
      order.possession,
    ),
    beds,
    budget,
  };
}
export type FilterOptions = ReturnType<typeof buildFilterOptions>;
