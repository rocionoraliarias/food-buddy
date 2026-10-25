# food-buddy (working title: Share Buddy)

Web app para guardar lugares con etiquetas y compartirlos por zona + categoría.

## Estado

Slice en curso: **lista de lugares + favorito** (marcar / desmarcar, también al guardar).

Todavía no hay login, mapa ni compartir. Persistencia local con SQLite (`data/dev.db`) para poder desarrollar sin Neon ni Google Places.

Plan completo: [`docs/mvp-plan.md`](docs/mvp-plan.md).

## Desarrollo

```bash
npm install
npm test
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). La primera carga siembra cuatro lugares de Palermo y San Telmo.

- Agregar un lugar (nombre obligatorio).
- Checkbox **Guardar como favorito** al crear.
- Estrella en cada fila para agregar o quitar de favoritos.
- Filtro **Todos / Favoritos**.
