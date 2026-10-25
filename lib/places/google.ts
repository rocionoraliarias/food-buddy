import { mapGoogleAddress, type GoogleAddressComponent } from "@/lib/geo/mapGoogleAddress";
import { parseTags } from "./parseTags";

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const DETAILS_TTL_MS = 10 * 60 * 1000;
const CABA_BIAS = {
  circle: {
    center: { latitude: -34.6037, longitude: -58.3816 },
    radius: 25000,
  },
};

const PRIMARY_TYPE_TAGS: Record<string, string> = {
  cafe: "café",
  coffee_shop: "café",
  restaurant: "restaurante",
  meal_takeaway: "restaurante",
  meal_delivery: "restaurante",
  bar: "bar",
  wine_bar: "bar",
  bakery: "panadería",
  park: "parque",
  museum: "museo",
};

export type PlaceSuggestion = {
  placeId: string;
  name: string;
  secondary: string;
};

export type GooglePlaceDraft = {
  googlePlaceId: string;
  name: string;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  country: string | null;
  tags: string[];
};

export class GooglePlacesError extends Error {
  constructor(
    readonly code: "missing_api_key" | "upstream" | "not_found" | "invalid",
    message: string,
  ) {
    super(message);
  }
}

type FetchLike = typeof fetch;

type GoogleClientOptions = {
  fetch?: FetchLike;
  apiKey?: string;
};

type AutocompleteBody = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: { text?: string };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }>;
};

type DetailsBody = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  addressComponents?: GoogleAddressComponent[];
  primaryType?: string;
};

const detailsCache = new Map<string, { savedAt: number; draft: GooglePlaceDraft }>();

export function cachePlaceDraft(draft: GooglePlaceDraft) {
  detailsCache.set(draft.googlePlaceId, { savedAt: Date.now(), draft });
}

export function cachedPlaceDraft(placeId: string): GooglePlaceDraft | null {
  const hit = detailsCache.get(placeId);
  if (!hit) return null;
  if (Date.now() - hit.savedAt > DETAILS_TTL_MS) {
    detailsCache.delete(placeId);
    return null;
  }
  return hit.draft;
}

export function googleErrorResponse(error: unknown): {
  status: number;
  body: { error: { code: string; message: string } };
} {
  if (error instanceof GooglePlacesError) {
    const status =
      error.code === "missing_api_key"
        ? 503
        : error.code === "not_found"
          ? 404
          : error.code === "invalid"
            ? 400
            : 502;
    return { status, body: { error: { code: error.code, message: error.message } } };
  }
  return {
    status: 500,
    body: { error: { code: "internal", message: "No se pudo hablar con Google." } },
  };
}

function apiKeyFrom(options?: GoogleClientOptions): string {
  const apiKey = options?.apiKey ?? process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey?.trim()) {
    throw new GooglePlacesError(
      "missing_api_key",
      "Falta GOOGLE_MAPS_API_KEY para buscar en Google.",
    );
  }
  return apiKey.trim();
}

async function readGoogle<T>(response: Response): Promise<T> {
  if (response.ok) return (await response.json()) as T;
  if (response.status === 403 || response.status === 401) {
    throw new GooglePlacesError(
      "upstream",
      "La clave de Google no tiene Places API habilitada.",
    );
  }
  if (response.status === 404) {
    throw new GooglePlacesError("not_found", "Google no encontró ese lugar.");
  }
  throw new GooglePlacesError("upstream", "Google no respondió. Probá de nuevo.");
}

export function parseSuggestions(body: AutocompleteBody): PlaceSuggestion[] {
  const suggestions: PlaceSuggestion[] = [];
  for (const suggestion of body.suggestions ?? []) {
    const prediction = suggestion.placePrediction;
    const placeId = prediction?.placeId?.trim();
    const name =
      prediction?.structuredFormat?.mainText?.text?.trim() ||
      prediction?.text?.text?.trim();
    if (!placeId || !name) continue;
    suggestions.push({
      placeId,
      name,
      secondary: prediction?.structuredFormat?.secondaryText?.text?.trim() ?? "",
    });
  }
  return suggestions;
}

export function draftFromDetails(body: DetailsBody): GooglePlaceDraft {
  const googlePlaceId = body.id?.trim();
  const name = body.displayName?.text?.trim();
  if (!googlePlaceId || !name) {
    throw new GooglePlacesError("not_found", "Google no devolvió un lugar usable.");
  }

  const mapped = mapGoogleAddress(body.addressComponents ?? []);
  const primaryTag = body.primaryType ? PRIMARY_TYPE_TAGS[body.primaryType] : undefined;

  return {
    googlePlaceId,
    name,
    address:
      mapped.address ??
      (body.shortFormattedAddress?.trim() || body.formattedAddress?.trim() || null),
    neighborhood: mapped.neighborhood,
    city: mapped.city,
    country: mapped.country,
    tags: parseTags(primaryTag ? [primaryTag] : []),
  };
}

export async function autocompletePlaces(
  input: string,
  sessionToken: string,
  options?: GoogleClientOptions,
): Promise<PlaceSuggestion[]> {
  const query = input.trim();
  if (query.length < 2) return [];

  const apiKey = apiKeyFrom(options);
  const fetchImpl = options?.fetch ?? fetch;
  const response = await fetchImpl(AUTOCOMPLETE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
    },
    body: JSON.stringify({
      input: query,
      languageCode: "es",
      regionCode: "AR",
      sessionToken,
      locationBias: CABA_BIAS,
    }),
  });

  return parseSuggestions(await readGoogle<AutocompleteBody>(response));
}

export async function fetchPlaceDetails(
  placeId: string,
  sessionToken: string,
  options?: GoogleClientOptions,
): Promise<GooglePlaceDraft> {
  if (!/^[A-Za-z0-9_-]{8,255}$/.test(placeId)) {
    throw new GooglePlacesError("invalid", "Ese identificador de Google no es válido.");
  }

  const apiKey = apiKeyFrom(options);
  const fetchImpl = options?.fetch ?? fetch;
  const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`);
  url.searchParams.set("languageCode", "es");
  url.searchParams.set("regionCode", "AR");
  if (sessionToken) url.searchParams.set("sessionToken", sessionToken);

  const response = await fetchImpl(url, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "id,displayName,formattedAddress,shortFormattedAddress,addressComponents,primaryType",
    },
  });

  const draft = draftFromDetails(await readGoogle<DetailsBody>(response));
  cachePlaceDraft(draft);
  return draft;
}
