import { describe, expect, it } from "vitest";
import { deserializeTags, parseTags, serializeTags } from "./parseTags";

describe("parseTags", () => {
  it("normalizes, trims and dedupes", () => {
    expect(parseTags("Café, brunch, café, ")).toEqual(["café", "brunch"]);
  });

  it("accepts arrays", () => {
    expect(parseTags(["Restaurante", " restaurante "])).toEqual(["restaurante"]);
  });
});

describe("serializeTags", () => {
  it("roundtrips JSON", () => {
    const json = serializeTags(["café", "terraza"]);
    expect(deserializeTags(json)).toEqual(["café", "terraza"]);
  });
});
