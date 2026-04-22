import { useMemo, useState } from 'react'
import RestaurantCard from '../components/RestaurantCard'
import SearchBar from '../components/SearchBar'
import { getCities, getCuisines, restaurants } from '../data/restaurants'

const ALL = 'Todas'

export default function Restaurants() {
  const [query, setQuery] = useState('')
  const [cuisine, setCuisine] = useState<string>(ALL)
  const [city, setCity] = useState<string>(ALL)
  const [openOnly, setOpenOnly] = useState(false)

  const cuisines = useMemo(() => [ALL, ...getCuisines()], [])
  const cities = useMemo(() => [ALL, ...getCities()], [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return restaurants.filter((r) => {
      if (cuisine !== ALL && r.cuisine !== cuisine) return false
      if (city !== ALL && r.city !== city) return false
      if (openOnly && !r.openNow) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [query, cuisine, city, openOnly])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Restaurantes
        </h1>
        <p className="mt-1 text-slate-600">
          {filtered.length} lugar{filtered.length === 1 ? '' : 'es'} que
          coinciden con tu búsqueda.
        </p>
      </header>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <SearchBar value={query} onChange={setQuery} />
        </div>
        <select
          aria-label="Filtrar por cocina"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        >
          {cuisines.map((c) => (
            <option key={c} value={c}>
              {c === ALL ? 'Todas las cocinas' : c}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar por ciudad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c === ALL ? 'Todas las ciudades' : c}
            </option>
          ))}
        </select>
      </div>

      <label className="mb-6 inline-flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={openOnly}
          onChange={(e) => setOpenOnly(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        Mostrar solo los abiertos ahora
      </label>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">
            No encontramos restaurantes con esos filtros.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setCuisine(ALL)
              setCity(ALL)
              setOpenOnly(false)
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  )
}
