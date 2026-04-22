import { Link } from 'react-router-dom'
import RestaurantCard from '../components/RestaurantCard'
import { restaurants } from '../data/restaurants'

export default function Home() {
  const featured = [...restaurants]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-50 via-white to-amber-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-800">
              <span aria-hidden>✨</span> Tu próximo plato favorito, cerca de ti
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Encuentra el restaurante perfecto con{' '}
              <span className="text-brand-600">Food Buddy</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Descubre lugares por tipo de cocina, ciudad y presupuesto. Filtra,
              compara y guarda tus favoritos para no olvidar dónde querías
              volver.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/restaurants"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Explorar restaurantes
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Cómo funciona
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Destacados de la semana
            </h2>
            <p className="mt-1 text-slate-600">
              Los mejor puntuados por la comunidad.
            </p>
          </div>
          <Link
            to="/restaurants"
            className="hidden text-sm font-semibold text-brand-600 hover:text-brand-700 sm:inline"
          >
            Ver todos →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </section>
    </div>
  )
}
