"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GooglePlaceDraft, PlaceSuggestion } from "@/lib/places/google";

type ApiError = { error?: { message?: string } };

function newSessionToken() {
  return crypto.randomUUID();
}

async function readError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as ApiError;
    return body.error?.message || fallback;
  } catch {
    return fallback;
  }
}

export function GooglePlaceSearch() {
  const router = useRouter();
  const listId = useId();
  const sessionToken = useRef(newSessionToken());
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [settledQuery, setSettledQuery] = useState("");
  const [selected, setSelected] = useState<GooglePlaceDraft | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [tags, setTags] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (selected || trimmed.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSettledQuery("");
    const timer = window.setTimeout(() => {
      setSearching(true);
      setError(null);
      const params = new URLSearchParams({
        q: trimmed,
        sessionToken: sessionToken.current,
      });
      void fetch(`/api/places/autocomplete?${params}`, { signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error(await readError(response, "No se pudo buscar."));
          return response.json() as Promise<{ suggestions: PlaceSuggestion[] }>;
        })
        .then((body) => {
          setSuggestions(body.suggestions);
          setSettledQuery(trimmed);
          setSearching(false);
        })
        .catch((reason: unknown) => {
          if (reason instanceof DOMException && reason.name === "AbortError") return;
          setSuggestions([]);
          setSearching(false);
          setError(reason instanceof Error ? reason.message : "No se pudo buscar.");
        });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, selected]);

  async function choose(suggestion: PlaceSuggestion) {
    setLoadingDetails(true);
    setError(null);
    setSuggestions([]);
    const params = new URLSearchParams({
      placeId: suggestion.placeId,
      sessionToken: sessionToken.current,
    });
    try {
      const response = await fetch(`/api/places/details?${params}`);
      if (!response.ok) throw new Error(await readError(response, "No se pudo leer el lugar."));
      const body = (await response.json()) as { place: GooglePlaceDraft };
      setSelected(body.place);
      setQuery(body.place.name);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo leer el lugar.");
    } finally {
      setLoadingDetails(false);
    }
  }

  function resetSelection() {
    setSelected(null);
    setQuery("");
    setTags("");
    setIsFavorite(false);
    setSuggestions([]);
    sessionToken.current = newSessionToken();
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/places/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: selected.googlePlaceId,
          sessionToken: sessionToken.current,
          isFavorite,
          tags,
        }),
      });
      if (!response.ok) throw new Error(await readError(response, "No se pudo guardar."));
      resetSelection();
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  const location = selected
    ? [selected.address, selected.neighborhood, selected.city].filter(Boolean).join(" · ")
    : "";

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-1">
        <h2 className="text-base font-semibold text-zinc-900">Agregar desde Google</h2>
        <p className="text-xs text-zinc-500">
          Buscá el lugar y guardalo con la dirección y el barrio que devuelve Google.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm" htmlFor={`${listId}-query`}>
        <span className="font-medium text-zinc-700">Buscar</span>
        <input
          id={`${listId}-query`}
          value={query}
          role="combobox"
          aria-expanded={suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder="Cuervo Café, Palermo"
          disabled={Boolean(selected) || loadingDetails}
          onChange={(event) => setQuery(event.target.value)}
          className="rounded-lg border border-zinc-200 px-3 py-2 outline-none ring-zinc-400 focus:ring-2 disabled:bg-zinc-50"
        />
      </label>

      {searching ? <p className="mt-2 text-sm text-zinc-500">Buscando…</p> : null}
      {loadingDetails ? <p className="mt-2 text-sm text-zinc-500">Leyendo el lugar…</p> : null}

      {suggestions.length > 0 ? (
        <ul id={listId} role="listbox" className="mt-2 flex flex-col overflow-hidden rounded-xl border border-zinc-200">
          {suggestions.map((suggestion) => (
            <li key={suggestion.placeId}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => void choose(suggestion)}
                className="flex w-full flex-col gap-0.5 px-3 py-3 text-left hover:bg-zinc-50"
              >
                <span className="text-sm font-medium text-zinc-900">{suggestion.name}</span>
                {suggestion.secondary ? (
                  <span className="text-xs text-zinc-500">{suggestion.secondary}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!searching && !selected && settledQuery === query.trim() && suggestions.length === 0 && !error ? (
        <p className="mt-2 text-sm text-zinc-500">No encontré lugares con ese nombre.</p>
      ) : null}

      {selected ? (
        <div className="mt-3 flex flex-col gap-3 rounded-xl bg-zinc-50 p-3">
          <div>
            <p className="font-medium text-zinc-900">{selected.name}</p>
            {location ? <p className="text-sm text-zinc-500">{location}</p> : null}
            {selected.tags.length > 0 ? (
              <p className="mt-1 text-xs text-zinc-500">Etiqueta de Google: {selected.tags.join(", ")}</p>
            ) : null}
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-700">Etiquetas</span>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="brunch, terraza"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 outline-none ring-zinc-400 focus:ring-2"
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(event) => setIsFavorite(event.target.checked)}
                className="size-4 accent-amber-500"
              />
              Guardar como favorito
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetSelection}
                className="rounded-full px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-200"
              >
                Elegir otro
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Guardar lugar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
