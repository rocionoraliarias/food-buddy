import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createDb } from "@/lib/db/client";
import { createPlace, listPlaces, seedPlacesIfEmpty, setPlaceFavorite } from "./store";

const tempDirs: string[] = [];

function tempDb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "places-"));
  tempDirs.push(dir);
  return createDb(path.join(dir, "test.db"));
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("place store", () => {
  it("creates a place with optional favorite", () => {
    const db = tempDb();
    const saved = createPlace(
      {
        name: "  Cuervo Café ",
        neighborhood: "Palermo",
        city: "Buenos Aires",
        tags: "café, brunch",
        isFavorite: true,
      },
      db,
    );

    expect(saved.name).toBe("Cuervo Café");
    expect(saved.isFavorite).toBe(true);
    expect(saved.tags).toEqual(["café", "brunch"]);
    expect(listPlaces(db)).toHaveLength(1);
  });

  it("rejects a place without a name", () => {
    const db = tempDb();
    expect(() => createPlace({ name: "   " }, db)).toThrow(/nombre/i);
  });

  it("toggles favorite on and off", () => {
    const db = tempDb();
    const saved = createPlace({ name: "El Federal", isFavorite: false }, db);
    expect(setPlaceFavorite(saved.id, true, db).isFavorite).toBe(true);
    expect(setPlaceFavorite(saved.id, false, db).isFavorite).toBe(false);
  });

  it("seeds sample places once", () => {
    const db = tempDb();
    seedPlacesIfEmpty(db);
    seedPlacesIfEmpty(db);
    const places = listPlaces(db);
    expect(places).toHaveLength(4);
    expect(places.filter((place) => place.isFavorite)).toHaveLength(2);
  });
});
