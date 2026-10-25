import { NextResponse } from "next/server";
import {
  cachedPlaceDraft,
  fetchPlaceDetails,
  googleErrorResponse,
} from "@/lib/places/google";
import { parseTags } from "@/lib/places/parseTags";
import { createPlace } from "@/lib/places/store";

export const dynamic = "force-dynamic";

type SaveBody = {
  placeId?: unknown;
  sessionToken?: unknown;
  isFavorite?: unknown;
  tags?: unknown;
};

export async function POST(request: Request) {
  let body: SaveBody;
  try {
    body = (await request.json()) as SaveBody;
  } catch {
    return NextResponse.json(
      { error: { code: "invalid", message: "El pedido no es válido." } },
      { status: 400 },
    );
  }

  const placeId = typeof body.placeId === "string" ? body.placeId : "";
  const sessionToken = typeof body.sessionToken === "string" ? body.sessionToken.slice(0, 128) : "";
  const extraTags = typeof body.tags === "string" ? body.tags : "";

  try {
    const draft = cachedPlaceDraft(placeId) ?? (await fetchPlaceDetails(placeId, sessionToken));
    const place = createPlace({
      name: draft.name,
      address: draft.address ?? undefined,
      neighborhood: draft.neighborhood ?? undefined,
      city: draft.city ?? undefined,
      country: draft.country ?? undefined,
      tags: parseTags([...draft.tags, ...parseTags(extraTags)]),
      isFavorite: body.isFavorite === true,
      googlePlaceId: draft.googlePlaceId,
    });
    return NextResponse.json({ place });
  } catch (error) {
    if (error instanceof Error && /ya está guardado/i.test(error.message)) {
      return NextResponse.json(
        { error: { code: "duplicate", message: error.message } },
        { status: 409 },
      );
    }
    if (error instanceof Error && /nombre/i.test(error.message)) {
      return NextResponse.json(
        { error: { code: "invalid", message: error.message } },
        { status: 400 },
      );
    }
    const { status, body: errorBody } = googleErrorResponse(error);
    return NextResponse.json(errorBody, { status });
  }
}
