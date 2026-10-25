import { AddPlaceForm } from "@/components/AddPlaceForm";
import { GooglePlaceSearch } from "@/components/GooglePlaceSearch";
import { PlaceList } from "@/components/PlaceList";
import { listPlaces, seedPlacesIfEmpty } from "@/lib/places/store";

export const dynamic = "force-dynamic";

export default function Home() {
  seedPlacesIfEmpty();
  const places = listPlaces();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Share Buddy
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Lugares guardados
        </h1>
        <p className="text-sm text-zinc-600">
          Buscá un lugar en Google o cargalo a mano. La estrella lo marca como favorito.
        </p>
      </header>
      <GooglePlaceSearch />
      <AddPlaceForm />
      <PlaceList places={places} />
    </div>
  );
}
