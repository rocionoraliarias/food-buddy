# food-buddy (working title: Share Buddy)

Web app para guardar lugares con etiquetas y compartirlos por **zona + categoría**, sin armar una lista nueva en Google Maps.

El caso que tiene que funcionar primero: filtrar cafés de Palermo y restaurantes de San Telmo, generar un link, abrirlo sin cuenta.

## Estado

Aún no hay aplicación. El plan de arranque está en [`docs/mvp-plan.md`](docs/mvp-plan.md).

**v0** (lo próximo a codear): login con Google, guardar lugares, agrupar por barrio/ciudad, filtrar, compartir link público de solo lectura.

## Stack (cerrado para v0)

Next.js + TypeScript · Tailwind/shadcn · MapLibre + OpenFreeMap · Google Places/Geocoding (server-side) · Neon Postgres + PostGIS · Drizzle · Auth.js (Google)

## Cómo se retoma

1. Leer `docs/mvp-plan.md` secciones 1, 2, 3 y 9.
2. Completar el checklist de Google Cloud / Neon / Vercel (sección 13).
3. Primer PR de código: scaffold (ítem 1 del backlog). No empezar por colaboración, import de URLs ni app nativa.
