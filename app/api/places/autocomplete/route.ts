import { NextResponse } from "next/server";
import { autocompletePlaces, googleErrorResponse } from "@/lib/places/google";

export const dynamic = "force-dynamic";

const hits: number[] = [];

function tooManyRequests() {
  const now = Date.now();
  while (hits.length > 0 && now - hits[0] > 60_000) hits.shift();
  if (hits.length >= 30) return true;
  hits.push(now);
  return false;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const sessionToken = (url.searchParams.get("sessionToken") ?? "").slice(0, 128);

  if (query.trim().length < 2) {
    return NextResponse.json({ suggestions: [] });
  }
  if (tooManyRequests()) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Demasiadas búsquedas. Esperá un momento." } },
      { status: 429 },
    );
  }

  try {
    const suggestions = await autocompletePlaces(query, sessionToken);
    return NextResponse.json({ suggestions });
  } catch (error) {
    const { status, body } = googleErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
