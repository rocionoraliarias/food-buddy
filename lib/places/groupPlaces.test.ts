import { describe, expect, it } from "vitest";
import { filterPlaces, groupPlaces } from "./groupPlaces";
import type { Place } from "./types";

function place(partial: Partial<Place> & Pick<Place, "id" | "name">): Place {
  return {
    address: null,
    notes: null,
    neighborhood: null,
    city: null,
    country: "Argentina",
    tags: [],
    isFavorite: false,
    createdAt: 1,
    ...partial,
  };
}

describe("groupPlaces", () => {
  it("groups by city and neighborhood and puts favorites first", () => {
    const groups = groupPlaces([
      place({ id: "1", name: "B", neighborhood: "Palermo", city: "Buenos Aires" }),
      place({
        id: "2",
        name: "A",
        neighborhood: "Palermo",
        city: "Buenos Aires",
        isFavorite: true,
      }),
      place({
        id: "3",
        name: "C",
        neighborhood: "San Telmo",
        city: "Buenos Aires",
      }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].neighborhood).toBe("Palermo");
    expect(groups[0].places.map((item) => item.name)).toEqual(["A", "B"]);
    expect(groups[1].neighborhood).toBe("San Telmo");
  });
});

describe("filterPlaces", () => {
  it("keeps only favorites", () => {
    const places = [
      place({ id: "1", name: "A", isFavorite: true }),
      place({ id: "2", name: "B", isFavorite: false }),
    ];
    expect(filterPlaces(places, "favorites").map((item) => item.id)).toEqual(["1"]);
  });
});
