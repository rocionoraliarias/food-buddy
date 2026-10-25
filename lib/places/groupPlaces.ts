import type { Place, PlaceGroup } from "./types";

const UNGROUPED_CITY = "Sin ciudad";
const UNGROUPED_NEIGHBORHOOD = "Sin barrio";

export function groupPlaces(places: Place[]): PlaceGroup[] {
  const buckets = new Map<string, PlaceGroup>();

  for (const place of places) {
    const city = place.city?.trim() || UNGROUPED_CITY;
    const neighborhood = place.neighborhood?.trim() || UNGROUPED_NEIGHBORHOOD;
    const key = `${city.toLowerCase()}::${neighborhood.toLowerCase()}`;
    const existing = buckets.get(key);

    if (existing) {
      existing.places.push(place);
    } else {
      buckets.set(key, { city, neighborhood, places: [place] });
    }
  }

  for (const group of buckets.values()) {
    group.places.sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return a.name.localeCompare(b.name, "es");
    });
  }

  return [...buckets.values()].sort((a, b) => {
    const city = a.city.localeCompare(b.city, "es");
    if (city !== 0) return city;
    return a.neighborhood.localeCompare(b.neighborhood, "es");
  });
}

export function filterPlaces(
  places: Place[],
  filter: "all" | "favorites",
): Place[] {
  if (filter === "favorites") return places.filter((place) => place.isFavorite);
  return places;
}
