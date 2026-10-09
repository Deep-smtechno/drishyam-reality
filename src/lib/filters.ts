import type { Property } from "./types";
import { locationParts } from "./options";
/** "Adajan" matches "Adajan, Surat"; a full value such as "Adajan, Surat" must match exactly. */
export function matchesLocation(location: string, wanted: string) {
  const want = wanted.trim().toLowerCase();
  if (want.includes(",")) return location.trim().toLowerCase() === want;
  return locationParts(location).some((part) => part.toLowerCase() === want);
}
export function filterProperties(
  properties: Property[],
  query: URLSearchParams,
) {
  let items = properties.filter(
    (p) =>
      (!query.get("q") ||
        `${p.title} ${p.location} ${p.type}`
          .toLowerCase()
          .includes(query.get("q")!.toLowerCase())) &&
      (!query.get("category") || p.category === query.get("category")) &&
      (!query.get("location") ||
        matchesLocation(p.location, query.get("location")!)) &&
      (!query.get("type") || p.type === query.get("type")) &&
      (!query.get("condition") || p.condition === query.get("condition")) &&
      (!query.get("beds") || p.bedrooms >= Number(query.get("beds"))) &&
      (!query.get("min") || p.price >= Number(query.get("min"))) &&
      (!query.get("max") || p.price <= Number(query.get("max"))) &&
      (!query.get("areaMin") || p.area >= Number(query.get("areaMin"))) &&
      (!query.get("areaMax") || p.area <= Number(query.get("areaMax"))) &&
      (!query.get("furnishing") || p.furnishing === query.get("furnishing")) &&
      (!query.get("possession") || p.possession === query.get("possession")),
  );
  switch (query.get("sort")) {
    case "price-asc":
      items = items.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      items = items.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      items = items.sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );
      break;
    default:
      items = items.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
  return items;
}
export function similarProperties(current: Property, properties: Property[]) {
  const score = (p: Property) =>
    (p.category === current.category ? 5 : 0) +
    (p.location === current.location ? 4 : 0) +
    (p.type === current.type ? 3 : 0) +
    (Math.abs(p.price - current.price) / Math.max(current.price, 1) < 0.3
      ? 2
      : 0) +
    (Math.abs(p.area - current.area) / Math.max(current.area, 1) < 0.3
      ? 1
      : 0) +
    (p.bedrooms === current.bedrooms ? 1 : 0);
  return properties
    .filter((p) => p.id !== current.id && p.status === "Available")
    .sort((a, b) => score(b) - score(a))
    .slice(0, 3);
}
