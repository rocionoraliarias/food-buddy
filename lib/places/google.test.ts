import { afterEach, describe, expect, it, vi } from "vitest";
import {
  autocompletePlaces,
  cachedPlaceDraft,
  draftFromDetails,
  fetchPlaceDetails,
  GooglePlacesError,
} from "./google";

const palermoComponents = [
  { longText: "4827", types: ["street_number"] },
  { longText: "Costa Rica", types: ["route"] },
  { longText: "Palermo", types: ["sublocality_level_1", "sublocality", "political"] },
  { longText: "Buenos Aires", types: ["locality", "political"] },
  { longText: "Argentina", types: ["country", "political"] },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("autocompletePlaces", () => {
  it("returns place predictions and keeps the API key in the header", async () => {
    let seenInit: RequestInit | undefined;
    const fetchMock: typeof fetch = async (_input, init) => {
      seenInit = init;
      return Response.json({
        suggestions: [
          {
            placePrediction: {
              placeId: "ChIJpalermoCafe",
              text: { text: "Cuervo Café, Costa Rica 4827, Palermo" },
              structuredFormat: {
                mainText: { text: "Cuervo Café" },
                secondaryText: { text: "Costa Rica 4827, Palermo" },
              },
            },
          },
          { queryPrediction: { text: { text: "cafés en palermo" } } },
        ],
      });
    };

    const suggestions = await autocompletePlaces("cuervo", "session-1", {
      apiKey: "test-key",
      fetch: fetchMock,
    });

    expect(suggestions).toEqual([
      {
        placeId: "ChIJpalermoCafe",
        name: "Cuervo Café",
        secondary: "Costa Rica 4827, Palermo",
      },
    ]);

    expect(seenInit?.headers).toMatchObject({ "X-Goog-Api-Key": "test-key" });
    expect(JSON.parse(String(seenInit?.body))).toMatchObject({
      input: "cuervo",
      languageCode: "es",
      sessionToken: "session-1",
    });
  });

  it("does not call Google when the key is missing", async () => {
    const fetchMock = vi.fn();
    await expect(
      autocompletePlaces("cuervo", "session-1", { apiKey: "", fetch: fetchMock }),
    ).rejects.toBeInstanceOf(GooglePlacesError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("fetchPlaceDetails", () => {
  it("maps a cafe into a draft and caches it", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toContain("/places/ChIJpalermoCafe");
      expect(String(input)).toContain("sessionToken=session-1");
      return Response.json({
        id: "ChIJpalermoCafe",
        displayName: { text: "Cuervo Café" },
        shortFormattedAddress: "Costa Rica 4827",
        addressComponents: palermoComponents,
        primaryType: "cafe",
      });
    });

    const draft = await fetchPlaceDetails("ChIJpalermoCafe", "session-1", {
      apiKey: "test-key",
      fetch: fetchMock,
    });

    expect(draft).toMatchObject({
      googlePlaceId: "ChIJpalermoCafe",
      name: "Cuervo Café",
      address: "Costa Rica 4827",
      neighborhood: "Palermo",
      city: "Buenos Aires",
      country: "Argentina",
      tags: ["café"],
    });
    expect(cachedPlaceDraft("ChIJpalermoCafe")?.name).toBe("Cuervo Café");
  });

  it("rejects a place id that is not safe to put in a URL", async () => {
    await expect(fetchPlaceDetails("../etc", "session-1", { apiKey: "test-key" })).rejects.toMatchObject({
      code: "invalid",
    });
  });
});

describe("draftFromDetails", () => {
  it("uses the formatted address when there is no street", () => {
    const draft = draftFromDetails({
      id: "ChIJpark",
      displayName: { text: "Bosques de Palermo" },
      formattedAddress: "Santa Fe 4000, Buenos Aires",
      addressComponents: [
        { longText: "Palermo", types: ["sublocality_level_1"] },
        { longText: "Buenos Aires", types: ["locality"] },
        { longText: "Argentina", types: ["country"] },
      ],
      primaryType: "park",
    });

    expect(draft.address).toBe("Santa Fe 4000, Buenos Aires");
    expect(draft.tags).toEqual(["parque"]);
  });
});
