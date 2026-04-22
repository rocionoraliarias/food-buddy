import { Link, useParams } from 'react-router-dom'
import { getRestaurantById } from '../data/restaurants'

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>()
  const restaurant = id ? getRestaurantById(id) : undefined

  if (!restaurant) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Restaurante no encontrado
        </h1>
        <p className="mt-2 text-slate-600">
          El lugar que buscas no existe o fue removido.
        </p>
        <Link
          to="/restaurants"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Volver al listado
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <Link
        to="/restaurants"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        ← Volver
      </Link>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="aspect-[16/7] overflow-hidden bg-slate-100">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {restaurant.name}
              </h1>
              <p className="mt-1 text-slate-600">
                {restaurant.cuisine} · {restaurant.city}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                <span aria-hidden>★</span>
                {restaurant.rating.toFixed(1)}
              </span>
              <span
                className={[
                  'rounded-full px-3 py-1 text-sm font-semibold',
                  restaurant.openNow
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700',
                ].join(' ')}
              >
                {restaurant.openNow ? 'Abierto ahora' : 'Cerrado'}
              </span>
            </div>
          </div>
          <p className="mt-6 text-base leading-relaxed text-slate-700">
            {restaurant.description}
          </p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Dirección
              </dt>
              <dd className="mt-1 text-slate-800">{restaurant.address}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rango de precio
              </dt>
              <dd className="mt-1 text-slate-800">
                {'$'.repeat(restaurant.priceLevel)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Etiquetas
              </dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {restaurant.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  )
}
