"use client";

import { useActionState, useEffect, useRef } from "react";
import { addPlaceAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: false };

export function AddPlaceForm() {
  const [state, formAction, pending] = useActionState(addPlaceAction, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-zinc-900">Agregar lugar</h2>
        <p className="text-xs text-zinc-500">Nombre obligatorio. El resto es opcional.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-zinc-700">Nombre</span>
          <input
            required
            name="name"
            placeholder="Cuervo Café"
            className="rounded-lg border border-zinc-200 px-3 py-2 outline-none ring-zinc-400 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Barrio</span>
          <input
            name="neighborhood"
            placeholder="Palermo"
            className="rounded-lg border border-zinc-200 px-3 py-2 outline-none ring-zinc-400 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Ciudad</span>
          <input
            name="city"
            defaultValue="Buenos Aires"
            className="rounded-lg border border-zinc-200 px-3 py-2 outline-none ring-zinc-400 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-zinc-700">Dirección</span>
          <input
            name="address"
            placeholder="Costa Rica 4827"
            className="rounded-lg border border-zinc-200 px-3 py-2 outline-none ring-zinc-400 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-zinc-700">Etiquetas</span>
          <input
            name="tags"
            placeholder="café, brunch, terraza"
            className="rounded-lg border border-zinc-200 px-3 py-2 outline-none ring-zinc-400 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-zinc-700">Notas</span>
          <textarea
            name="notes"
            rows={2}
            placeholder="Lo que querés recordar de este lugar"
            className="rounded-lg border border-zinc-200 px-3 py-2 outline-none ring-zinc-400 focus:ring-2"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800">
          <input
            type="checkbox"
            name="isFavorite"
            className="size-4 accent-amber-500"
          />
          Guardar como favorito
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar lugar"}
        </button>
      </div>

      {state.error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
