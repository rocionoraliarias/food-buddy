export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Acerca de Food Buddy
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Food Buddy te ayuda a descubrir restaurantes en tu ciudad. Filtra por
        tipo de cocina, presupuesto y horario para encontrar el lugar perfecto
        para cada ocasión.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">
        Cómo funciona
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-6 text-slate-700">
        <li>Buscá por nombre, cocina o ciudad.</li>
        <li>Filtrá por horario y presupuesto.</li>
        <li>Abrí el detalle para ver dirección, tags y descripción.</li>
      </ol>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">
        Tecnologías
      </h2>
      <ul className="mt-3 list-disc space-y-1 pl-6 text-slate-700">
        <li>React + TypeScript con Vite</li>
        <li>Tailwind CSS para los estilos</li>
        <li>React Router para la navegación</li>
      </ul>
    </div>
  )
}
