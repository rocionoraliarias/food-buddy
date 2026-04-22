import { Link } from 'react-router-dom'
import type { Restaurant } from '../types/restaurant'

interface Props {
  restaurant: Restaurant
}

function priceString(level: Restaurant['priceLevel']): string {
  return '$'.repeat(level)
}

export default function RestaurantCard({ restaurant }: Props) {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span
          className={[
            'absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs font-semibold',
            restaurant.openNow
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-slate-200 text-slate-700',
          ].join(' ')}
        >
          {restaurant.openNow ? 'Abierto ahora' : 'Cerrado'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900">
            {restaurant.name}
          </h3>
          <span className="shrink-0 text-sm font-medium text-slate-500">
            {priceString(restaurant.priceLevel)}
          </span>
        </div>
        <p className="text-sm text-slate-500">
          {restaurant.cuisine} · {restaurant.city}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
            <span aria-hidden>★</span>
            {restaurant.rating.toFixed(1)}
          </span>
          <span className="text-sm font-medium text-brand-600 group-hover:text-brand-700">
            Ver detalle →
          </span>
        </div>
      </div>
    </Link>
  )
}
