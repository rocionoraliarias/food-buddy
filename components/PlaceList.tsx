"use client";

import { useMemo, useState } from "react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { filterPlaces, groupPlaces } from "@/lib/places/groupPlaces";
import type { Place } from "@/lib/places/types";

type PlaceListProps = {
  places: Place[];
};

export function PlaceList({ places }: PlaceListProps) {
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const visible = useMemo(() => filterPlaces(places, filter), [places, filter]);
  const groups = useMemo(() => groupPlaces(visible), [visible]);
  const favoriteCount = places.filter((place) => place.isFavorite).length;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-zinc-900">
          {filter === "favorites" ? "Favoritos" : "Mis lugares"}
          <span className="ml-2 font-normal text-zinc-500">
            {visible.length}
          </span>
        </h2>
        <div className="flex rounded-full border border-zinc-200 bg-white p-1 text-sm">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1 ${
              filter === "all" ? "bg-zinc-900 text-white" : "text-zinc-600"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFilter("favorites")}
            className={`rounded-full px-3 py-1 ${
              filter === "favorites" ? "bg-zinc-900 text-white" : "text-zinc-600"
            }`}
          >
            Favoritos ({favoriteCount})
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-500">
          {filter === "favorites"
            ? "Todavía no marcaste ningún favorito. Tocá la estrella de un lugar para agregarlo."
            : "Todavía no hay lugares. Agregá el primero con el formulario de arriba."}
        </p>
      ) : (
        groups.map((group) => (
          <div key={`${group.city}-${group.neighborhood}`} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {group.neighborhood}
              <span className="font-normal"> · {group.city}</span>
            </h3>
            <ul className="flex flex-col gap-2">
              {group.places.map((place) => (
                <li
                  key={place.id}
                  className="flex items-start gap-2 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm"
                >
                  <FavoriteButton
                    placeId={place.id}
                    isFavorite={place.isFavorite}
                    placeName={place.name}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-900">{place.name}</p>
                    <p className="text-sm text-zinc-500">
                      {[place.address, place.neighborhood].filter(Boolean).join(" · ")}
                    </p>
                    {place.notes ? (
                      <p className="mt-1 text-sm text-zinc-600">{place.notes}</p>
                    ) : null}
                    {place.tags.length > 0 ? (
                      <ul className="mt-2 flex flex-wrap gap-1">
                        {place.tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
