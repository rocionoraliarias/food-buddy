import { NextResponse } from "next/server";
import { fetchPlaceDetails, googleErrorResponse } from "@/lib/places/google";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const placeId = url.searchParams.get("placeId") ?? "";
  const sessionToken = (url.searchParams.get("sessionToken") ?? "").slice(0, 128);

  try {
    const place = await fetchPlaceDetails(placeId, sessionToken);
    return NextResponse.json({ place });
  } catch (error) {
    const { status, body } = googleErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
