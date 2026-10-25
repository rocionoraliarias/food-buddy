import { describe, expect, it } from "vitest";
import { mapGoogleAddress, type GoogleAddressComponent } from "./mapGoogleAddress";

function component(longText: string, ...types: string[]): GoogleAddressComponent {
  return { longText, shortText: longText, types };
}

describe("mapGoogleAddress", () => {
  it("maps a Palermo address from sublocality", () => {
    const mapped = mapGoogleAddress([
      component("4827", "street_number"),
      component("Costa Rica", "route"),
      component("Palermo", "sublocality_level_1", "sublocality", "political"),
      component("Buenos Aires", "locality", "political"),
      component("Ciudad Autónoma de Buenos Aires", "administrative_area_level_1", "political"),
      component("Argentina", "country", "political"),
    ]);

    expect(mapped).toEqual({
      address: "Costa Rica 4827",
      neighborhood: "Palermo",
      city: "Buenos Aires",
      country: "Argentina",
    });
  });

  it("maps San Telmo the same way", () => {
    const mapped = mapGoogleAddress([
      component("599", "street_number"),
      component("Carlos Calvo", "route"),
      component("San Telmo", "sublocality_level_1", "sublocality", "political"),
      component("Buenos Aires", "locality", "political"),
      component("Argentina", "country", "political"),
    ]);

    expect(mapped.neighborhood).toBe("San Telmo");
    expect(mapped.city).toBe("Buenos Aires");
    expect(mapped.address).toBe("Carlos Calvo 599");
  });

  it("falls back to neighborhood when there is no sublocality", () => {
    const mapped = mapGoogleAddress([
      component("120", "street_number"),
      component("Rua Garrett", "route"),
      component("Chiado", "neighborhood", "political"),
      component("Lisboa", "locality", "political"),
      component("Portugal", "country", "political"),
    ]);

    expect(mapped).toMatchObject({
      address: "Rua Garrett 120",
      neighborhood: "Chiado",
      city: "Lisboa",
      country: "Portugal",
    });
  });

  it("prefers sublocality over a broader neighborhood and locality over admin area", () => {
    const mapped = mapGoogleAddress([
      component("12", "street_number"),
      component("Carrer de Verdi", "route"),
      component("Vila de Gràcia", "neighborhood", "political"),
      component("Gràcia", "sublocality_level_1", "sublocality", "political"),
      component("Barcelonès", "administrative_area_level_2", "political"),
      component("Barcelona", "locality", "political"),
      component("España", "country", "political"),
    ]);

    expect(mapped.neighborhood).toBe("Gràcia");
    expect(mapped.city).toBe("Barcelona");
    expect(mapped.country).toBe("España");
  });

  it("leaves neighborhood empty when Google has no barrio", () => {
    const mapped = mapGoogleAddress([
      component("Córdoba", "route"),
      component("Rosario", "locality", "political"),
      component("Argentina", "country", "political"),
    ]);

    expect(mapped.neighborhood).toBeNull();
    expect(mapped.city).toBe("Rosario");
    expect(mapped.address).toBe("Córdoba");
  });
});
