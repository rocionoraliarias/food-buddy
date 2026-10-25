"use client";

import { useTransition } from "react";
import { toggleFavoriteAction } from "@/app/actions";

type FavoriteButtonProps = {
  placeId: string;
  isFavorite: boolean;
  placeName: string;
};

export function FavoriteButton({
  placeId,
  isFavorite,
  placeName,
}: FavoriteButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          void toggleFavoriteAction(placeId, !isFavorite);
        });
      }}
      aria-pressed={isFavorite}
      aria-label={
        isFavorite
          ? `Quitar ${placeName} de favoritos`
          : `Agregar ${placeName} a favoritos`
      }
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl leading-none transition-colors hover:bg-amber-50 disabled:opacity-50"
    >
      <span aria-hidden="true">{isFavorite ? "★" : "☆"}</span>
    </button>
  );
}
