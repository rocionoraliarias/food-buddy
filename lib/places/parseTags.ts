export function parseTags(input: string[] | string | undefined): string[] {
  const raw = Array.isArray(input) ? input : (input ?? "").split(/[,;]/);
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const value of raw) {
    const tag = value.trim().toLowerCase();
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    tags.push(tag);
  }

  return tags;
}

export function serializeTags(tags: string[]): string {
  return JSON.stringify(parseTags(tags));
}

export function deserializeTags(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parseTags(parsed.filter((item) => typeof item === "string"));
  } catch {
    return parseTags(value);
  }
}
