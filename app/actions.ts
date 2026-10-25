"use server";

import { revalidatePath } from "next/cache";
import { createPlace, setPlaceFavorite } from "@/lib/places/store";

export type ActionState = {
  ok: boolean;
  error?: string;
};

export async function addPlaceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    createPlace({
      name: String(formData.get("name") ?? ""),
      address: String(formData.get("address") ?? ""),
      neighborhood: String(formData.get("neighborhood") ?? ""),
      city: String(formData.get("city") ?? ""),
      tags: String(formData.get("tags") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      isFavorite: formData.get("isFavorite") === "on",
    });
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo guardar.",
    };
  }
}

export async function toggleFavoriteAction(id: string, isFavorite: boolean) {
  setPlaceFavorite(id, isFavorite);
  revalidatePath("/");
}
