import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { type AppDb, getDb } from "@/lib/db/client";
import { places } from "@/lib/db/schema";
import { deserializeTags, parseTags, serializeTags } from "./parseTags";
import type { NewPlaceInput, Place } from "./types";

function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toPlace(row: typeof places.$inferSelect): Place {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    notes: row.notes,
    neighborhood: row.neighborhood,
    city: row.city,
    country: row.country,
    tags: deserializeTags(row.tags),
    isFavorite: row.isFavorite,
    createdAt: row.createdAt,
  };
}

export function listPlaces(db: AppDb = getDb()): Place[] {
  return db.select().from(places).orderBy(desc(places.createdAt)).all().map(toPlace);
}

export function createPlace(input: NewPlaceInput, db: AppDb = getDb()): Place {
  const name = input.name.trim();
  if (!name) {
    throw new Error("El nombre es obligatorio.");
  }

  const googlePlaceId = emptyToNull(input.googlePlaceId);
  if (googlePlaceId) {
    const duplicate = db
      .select()
      .from(places)
      .where(eq(places.googlePlaceId, googlePlaceId))
      .get();
    if (duplicate) {
      throw new Error("Ese lugar de Google ya está guardado.");
    }
  }

  const id = nanoid(12);
  const createdAt = Date.now();

  db.insert(places)
    .values({
      id,
      name,
      address: emptyToNull(input.address),
      notes: emptyToNull(input.notes),
      neighborhood: emptyToNull(input.neighborhood),
      city: emptyToNull(input.city),
      country: emptyToNull(input.country) ?? "Argentina",
      tags: serializeTags(parseTags(input.tags)),
      isFavorite: Boolean(input.isFavorite),
      googlePlaceId,
      createdAt,
    })
    .run();

  const row = db.select().from(places).where(eq(places.id, id)).get();
  if (!row) throw new Error("No se pudo guardar el lugar.");
  return toPlace(row);
}

export function setPlaceFavorite(
  id: string,
  isFavorite: boolean,
  db: AppDb = getDb(),
): Place {
  const existing = db.select().from(places).where(eq(places.id, id)).get();
  if (!existing) {
    throw new Error("Lugar no encontrado.");
  }

  db.update(places).set({ isFavorite }).where(eq(places.id, id)).run();
  const row = db.select().from(places).where(eq(places.id, id)).get();
  if (!row) throw new Error("Lugar no encontrado.");
  return toPlace(row);
}

export function seedPlacesIfEmpty(db: AppDb = getDb()) {
  const existing = db.select().from(places).all();
  if (existing.length > 0) return;

  const samples: NewPlaceInput[] = [
    {
      name: "Cuervo Café",
      address: "Costa Rica 4827",
      neighborhood: "Palermo",
      city: "Buenos Aires",
      tags: ["café", "brunch"],
      notes: "Buenos flat whites.",
      isFavorite: true,
    },
    {
      name: "Lattente",
      address: "Thames 1891",
      neighborhood: "Palermo",
      city: "Buenos Aires",
      tags: ["café"],
      isFavorite: false,
    },
    {
      name: "El Federal",
      address: "Carlos Calvo 599",
      neighborhood: "San Telmo",
      city: "Buenos Aires",
      tags: ["restaurante"],
      notes: "Clásico para llevar a visitas.",
      isFavorite: true,
    },
    {
      name: "Café San Juan",
      address: "Av. San Juan 450",
      neighborhood: "San Telmo",
      city: "Buenos Aires",
      tags: ["restaurante"],
      isFavorite: false,
    },
  ];

  for (const sample of samples) {
    createPlace(sample, db);
  }
}
