# Plan de desarrollo — Share Buddy (working title)

> App web responsive para guardar, organizar y compartir lugares. El diferenciador frente a Google Maps es filtrar y compartir por **zona + etiqueta**, sin armar listas nuevas.

Este documento es el plan **para empezar a codear**. La visión de producto (benchmark, perfil emocional, itinerarios, app nativa) queda al final como backlog, no como bloqueo.

---

## 0. Cómo se mejora el plan original para poder desarrollar

El plan de mayo era correcto como brief, pero no era un plan de arranque. Estos eran los frenos:

| Problema | Cambio |
|---|---|
| El "MVP" mezclaba el caso norte (compartir cafés de Palermo) con colaboración, realtime, contactos, OG images, magic link, Redis, Sentry y PostHog. | Se parte en **v0 (slice vertical)** → **MVP** → **después**. Solo v0 se implementa ahora. |
| Stack con alternativas abiertas (Prisma vs Drizzle, Neon vs Supabase, Nominatim vs Mapbox, tRPC vs REST, MapLibre vs Google Maps JS). | Decisiones **cerradas**. Se documenta qué se puede cambiar después. |
| Fase 0 pedía Trello, Figma y benchmark antes de código. | Discovery en paralelo. El primer código es el slice, no un spike descartable. |
| Reverse geocoding con polígonos OSM y clustering. | En v0 el barrio es un **string denormalizado**. Sin polígonos. |
| Auth email + Google, fotos, markdown, long-press, modos de perfil. | Auth **solo Google**. El resto sale del v0. |
| Colaboración tipo Docs en el MVP. | Fuera de v0. El caso norte no la necesita: un link público de solo lectura alcanza. |

**Regla de corte:** si no es necesario para el flujo Palermo + San Telmo, no entra en v0.

---

## 1. Caso norte (único criterio de "¿ya sirve?")

> Una persona en Buenos Aires comparte con una amiga que viaja **cafés de Palermo** y **restaurantes de San Telmo**. Filtra por barrio + etiqueta, genera un link, lo manda. La amiga abre el link **sin registrarse** y ve mapa + lista.

Criterios de aceptación de v0 (todo o nada):

1. Puedo entrar con Google.
2. Puedo buscar un lugar real (POI) y guardarlo con nombre, notas y etiquetas libres (`café`, `restaurante`).
3. Al guardar, el lugar queda con `neighborhood`, `city`, `country` (aunque el barrio sea aproximado).
4. Puedo ver mis lugares en **mapa** y en **lista**, agrupados por ciudad → barrio.
5. Puedo filtrar por etiqueta y por barrio al mismo tiempo.
6. Con esos filtros activos, genero un link `/m/{slug}`.
7. Una sesión incógnito abre ese link y ve el mapa interactivo + la lista, sin login.
8. El dueño puede dejar de publicar el link (ocultarlo).

Si eso funciona en staging, el producto ya demuestra el diferenciador. Todo lo demás espera.

---

## 2. Alcance por capas

### v0 — slice vertical (ahora)

- Login con Google.
- Guardar lugar desde buscador de Places (proxy server-side).
- Etiquetas libres del usuario (chips + crear al vuelo).
- Reverse geocode al guardar → `neighborhood` / `city` / `country` como texto. Override manual del barrio.
- Home: mapa a pantalla completa + panel (bottom sheet en mobile, sidebar en desktop) con lista filtrable.
- Filtros: texto, etiquetas (multi), ciudad, barrio.
- Compartir la **selección actual** (filtros o checkboxes) como mapa `link_only` (quien tiene el URL lo ve).
- Página pública `/m/{slug}`: mapa + lista + autor + etiquetas. Sin login.
- Despublicar / borrar el mapa compartido.

### MVP (después de que v0 esté en staging con usuarios reales)

- Pegar link de Google Maps e importar un lugar.
- Selección multi-lugar explícita (además del atajo "compartir filtros").
- Visibilidad `public` vs `link_only` (v0 solo usa `link_only`).
- Reacciones simples en el mapa compartido (requiere login): *probémoslo* / *ya fui*.
- Clusters en el mapa cuando hay muchos pins.
- Título y descripción editables del mapa compartido.
- Página "Mis mapas compartidos".

### Fuera (no se diseña ni se schema-premature)

- Colaboración (invitar, agregar lugares ajenos, realtime).
- Contactos, feed, perfiles, modos explorer/foodie.
- Magic link de email, fotos subidas por el usuario.
- Polígonos de barrios, radio en metros, OSM admin_level.
- Itinerarios, offline, WebView, Takeout, Uber/Calendar.
- Redis, PostHog, Sentry (se agregan cuando haya tráfico o el primer error en prod lo pida).

---

## 3. Stack cerrado

Una opción por capa. El criterio es **menos piezas el día 1**, no la arquitectura final.

| Capa | Elección | Por qué | Se puede cambiar después |
|---|---|---|---|
| App | Next.js (App Router) + TypeScript | SSR del link público, un solo repo. | — |
| UI | Tailwind + shadcn/ui | Velocidad. | — |
| Mapas | MapLibre GL JS + tiles de [OpenFreeMap](https://openfreemap.org/) | Cero costo de tiles al arrancar, sin API key de Google Maps JS. | MapTiler si hace falta estilo/SLA. |
| Places / autocomplete / details | **Google Places API (New)**, solo desde el servidor | Cobertura de POIs. El cliente nunca ve la API key. | — |
| Reverse geocode | Google Geocoding API, cacheado por `place_id` o por lat/lng redondeado a 4 decimales | En CABA el `sublocality` suele ser el barrio (Palermo, San Telmo). Suficiente para v0. | Photon/Nominatim si el costo duele. |
| API | Route Handlers + Zod | Menos ceremonia que tRPC en un equipo chico. | tRPC más adelante si duele el tipado. |
| DB | Neon Postgres **con PostGIS** | `geography(Point)` desde el día 1, sin migración dolorosa. | Supabase si se quiere auth+realtime juntos. |
| ORM | **Drizzle** | PostGIS y SQL crudo sin pelear con Prisma. | — |
| Auth | Auth.js + **Google OAuth** | Un proveedor. Nada de SMTP. | Magic link cuando haga falta. |
| Hosting | Vercel | Encaja con Next. | — |
| Tests | Vitest (parsers, filtros, geocode mapping) + Playwright del caso norte | El import de URLs y el mapeo barrio/ciudad se rompen en silencio. | — |

**No se instala en v0:** Redis, Prisma, Supabase, Capacitor, i18n framework, upload de imágenes, websockets.

**Variables de entorno mínimas:**

```
DATABASE_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
GOOGLE_MAPS_API_KEY=          # server only, Places + Geocoding
NEXT_PUBLIC_MAP_STYLE_URL=    # ej. https://tiles.openfreemap.org/styles/liberty
```

---

## 4. Arquitectura de la app v0

### Rutas

```
/                    → redirect a /app si hay sesión, sino landing + CTA login
/login               → botón Google
/app                 → mapa + panel de "mis lugares" (única pantalla logueada de v0)
/m/[slug]            → mapa compartido público (SSR de metadatos básicos)
```

No hay `/settings`, `/profile` ni `/maps` en v0. Despublicar vive como acción en el modal de compartir (lista corta de links creados, en el mismo sheet).

### Layout de `/app`

- El mapa ocupa todo el viewport.
- Acciones permanentes (una fila, siempre visibles): **Buscar/guardar**, **Filtros**, **Compartir**.
- Panel flotante con la lista. En mobile: bottom sheet (peek → half → full). En desktop: columna izquierda ~380px.
- Guardar y compartir **no navegan** a otra ruta: son sheets sobre el mapa.

### Flujo de datos

```
Browser  --autocomplete query-->  /api/places/autocomplete
Browser  --placeId------------>  /api/places/details
Server   --Places API--------->  Google
Server   --Geocoding API------>  Google  (si details no trae barrio usable)
Server   --INSERT place------->  Neon
Browser  --GET /api/places---->  lista del usuario (filtro querystring)
Browser  --POST /api/maps----->  crea SharedMap + copia de place ids
Anon     --GET /m/[slug]------>  SSR + GET /api/maps/[slug]
```

Places y Geocoding **nunca** se llaman desde el browser. Así se controla cuota y se cachea.

### Cache de Google (sin Redis)

Tabla `google_place_cache`:

- `google_place_id` PK
- `payload` JSONB (details)
- `fetched_at`

Tabla `geocode_cache`:

- `lat4`, `lng4` (numeric redondeado) o `google_place_id`
- `neighborhood`, `city`, `country`, `country_code`
- `raw` JSONB
- `fetched_at`

TTL blando: 30 días. Si hay hit, no se cobra la API.

---

## 5. Modelo de datos v0

Solo lo que se lee y escribe en el slice. PostGIS desde la primera migración.

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
  id            TEXT PRIMARY KEY,          -- Auth.js id
  email         TEXT NOT NULL UNIQUE,
  name          TEXT,
  image         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auth.js tables (users/accounts/sessions) las genera el adapter;
-- este `users` de app puede ser la misma fila si se usa el adapter de Drizzle.

CREATE TABLE places (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source          TEXT NOT NULL CHECK (source IN ('google')),
  google_place_id TEXT,
  name            TEXT NOT NULL,
  address         TEXT,
  location        GEOGRAPHY(Point, 4326) NOT NULL,
  notes           TEXT,
  neighborhood    TEXT,          -- overrideable
  city            TEXT,
  country         TEXT,
  country_code    CHAR(2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX places_owner_idx ON places (owner_id);
CREATE INDEX places_location_gix ON places USING GIST (location);
CREATE INDEX places_owner_city_nbh_idx ON places (owner_id, city, neighborhood);

CREATE TABLE tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  UNIQUE (owner_id, lower(name))
);

CREATE TABLE place_tags (
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  tag_id   UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (place_id, tag_id)
);

CREATE TABLE shared_maps (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,       -- nanoid 10 chars, url-safe
  owner_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,              -- default: "Cafés en Palermo" desde filtros
  visibility   TEXT NOT NULL DEFAULT 'link_only'
               CHECK (visibility IN ('link_only')),
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE shared_map_places (
  shared_map_id UUID NOT NULL REFERENCES shared_maps(id) ON DELETE CASCADE,
  place_id      UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  PRIMARY KEY (shared_map_id, place_id)
);

CREATE TABLE google_place_cache (
  google_place_id TEXT PRIMARY KEY,
  payload         JSONB NOT NULL,
  fetched_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE geocode_cache (
  google_place_id TEXT PRIMARY KEY,
  neighborhood    TEXT,
  city            TEXT,
  country         TEXT,
  country_code    CHAR(2),
  raw             JSONB NOT NULL,
  fetched_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Decisiones que no se reabren en v0:**

- Un `Place` pertenece a un solo `owner`. Compartir **copia la referencia** a `shared_map_places`; no duplica el row. Si el dueño borra el lugar, desaparece del mapa compartido (aceptable en v0; snapshot se hace en el MVP si molesta).
- No hay `visited_at`, `profile_mode`, `expires_at`, reacciones ni colaboradores.
- `visibility` solo `link_only`. No hay ACL por contacto.
- Barrio es texto, no FK a polígono.

**Mapeo de Geocoding → barrio (CABA primero):**

1. `sublocality_level_1` o `sublocality`
2. si vacío, `neighborhood`
3. si vacío, dejar `neighborhood = null` y mostrar "Sin barrio" + botón "Asignar"

Ciudad: `locality` o `administrative_area_level_2`. País: `country`.

Esto se testea con fixtures de respuestas reales de Palermo, San Telmo, Lisboa y Barcelona — no a ojo.

---

## 6. Contratos de API v0

Todos JSON. Errores `{ error: { code, message } }`. Auth por cookie de sesión salvo `GET /api/maps/:slug`.

| Método | Path | Qué hace |
|---|---|---|
| GET | `/api/places/autocomplete?q=` | Proxy Places Autocomplete (session token generado en server, 1 por sheet abierto). |
| GET | `/api/places/details?placeId=` | Details + geocode cacheado. No persiste todavía. |
| GET | `/api/places?q=&tag=&city=&neighborhood=` | Lugares del usuario. |
| POST | `/api/places` | `{ placeId, notes, tags[] }` → inserta. |
| PATCH | `/api/places/:id` | notas, tags, neighborhood override. |
| DELETE | `/api/places/:id` | — |
| GET | `/api/tags` | tags del usuario (para chips). |
| POST | `/api/maps` | `{ title?, placeIds[] }` → `{ slug, url }`. |
| GET | `/api/maps/:slug` | público si `is_published`. |
| POST | `/api/maps/:slug/unpublish` | dueño. |

Rate limit barato en v0: 30 autocomplete / usuario / minuto en el route handler (contador en memoria del instance; suficiente en preview).

---

## 7. UX mínima (sin Figma bloqueante)

No se espera un design system. Se arranca con shadcn + estos principios, copiados del brief y recortados:

1. Mapa = 100% de la pantalla. Todo lo demás flota.
2. Guardar: abrir sheet → elegir resultado de autocomplete → tags → listo. Sin pantalla de confirmación.
3. Compartir: con filtros activos, un tap "Compartir estos N" → copia el link. Segundo camino: checkboxes.
4. El link público no pide cuenta.
5. Copy neutro: "Guardado", "Link copiado".
6. Mobile-first. Desktop es el mismo árbol de componentes, no otra app.

Pantallas reales de v0: **login**, **app (mapa+lista)**, **sheet guardar**, **sheet compartir**, **página pública**.

Identidad visual: paleta default de shadcn (zinc + un acento). Logo y marca **después**.

---

## 8. Estructura de repo al scaffold

Monorepo no. Un Next.js en la raíz:

```
app/
  (auth)/login/page.tsx
  (app)/app/page.tsx
  m/[slug]/page.tsx
  api/...
  layout.tsx
components/
  map/MapView.tsx          # único mount de MapLibre
  place/SaveSheet.tsx
  place/PlaceList.tsx
  share/ShareSheet.tsx
lib/
  db/schema.ts             # Drizzle
  geo/mapGoogleAddress.ts  # fixtures testeadas
  places/google.ts         # client server-side
  auth.ts
drizzle/
  0001_init.sql
e2e/
  north-star.spec.ts
```

Un solo componente de mapa. La lista y el mapa comparten estado de filtros (URL query: `?tag=cafe&neighborhood=Palermo`) para que un refresh y un link interno no pierdan el contexto. **El mapa compartido se genera a partir de esos query params + ids seleccionados.**

---

## 9. Backlog ordenado (esto se codea, en este orden)

Cada ítem termina mergeable. No se empieza el siguiente si el anterior no está en `main` o en un PR revisable.

### Semana de cimientos (P0)

1. Scaffold Next.js + Tailwind + shadcn + ESLint + Vitest.
2. Neon + PostGIS + Drizzle + migración `0001_init`.
3. Auth.js + Google + tabla `users` ligada al adapter. Ruta `/login` y guard de `/app`.
4. `MapView` con OpenFreeMap, geolocalización del browser (fallback: centro en CABA `-34.60, -58.38`).
5. Deploy de preview en Vercel (env vars). A partir de acá, cada PR tiene URL.

### Guardado (P0)

6. Proxy `autocomplete` + `details` con cache tables.
7. `SaveSheet`: buscar → preview (nombre, dirección, barrio inferido) → tags → POST `/api/places`.
8. Pintar pins del usuario en el mapa. Click de pin abre ficha mínima (nombre, tags, notas, editar barrio).
9. `PlaceList` agrupada ciudad → barrio. Vacío: CTA "Guardá el primer lugar".
10. Mapper `mapGoogleAddress` con fixtures Palermo / San Telmo / Lisboa Chiado / Barcelona Gràcia. Override manual.

### Filtros + share (P0 — cierra el caso norte)

11. Query params de filtro. Lista y mapa se recortan juntos.
12. `POST /api/maps` desde "Compartir estos N". Copy-to-clipboard.
13. `/m/[slug]` pública: mismos `MapView` + lista, read-only, sin sheet de guardar.
14. Unpublish.
15. Playwright del caso norte (seed de 4 lugares, filtrar, compartir, abrir en contexto anónimo).

### Hecho cuando

El e2e del punto 15 pasa en CI y en el preview se puede ejecutar el caso norte a mano.

### Cola inmediata post-v0 (P1, no mezclar)

- Importar desde URL de Google Maps (parser + tests por formato corto/largo).
- Checkboxes de selección cruzando filtros.
- Clusters.
- Reacciones con login.
- "Mis mapas".
- Título auto: `"{Tag} en {Barrio}"` editable.

---

## 10. Costos y cuotas (decisiones operativas)

Google Places (New) + Geocoding son el único costo variable de v0.

- Autocomplete siempre con `sessionToken` (un token por apertura del SaveSheet).
- Details una vez por `placeId`; después, cache.
- Geocoding una vez por `placeId`; después, cache.
- No hay fotos de Places en v0 (Photo SKU es caro y no aporta al caso norte).
- Tope de cortesía en código: 60 details/usuario/día; si se pasa, el SaveSheet dice "probá más tarde" — no se deja abierta la API.

Tiles: OpenFreeMap, $0.

Neon + Vercel: free tier alcanza para desarrollo y beta chica.

---

## 11. Riesgos que sí importan el día 1

| Riesgo | Qué hacemos en v0 |
|---|---|
| Barrio mal inferido (Google a veces devuelve "Recoleta" para un punto en Barrio Norte, etc.) | Override manual + fixtures. No se construye un gazetteer. |
| Cuota de Places | Cache + session token + tope por usuario. Key solo server-side, HTTP referrer no alcanza. |
| MapLibre en Safari / bottom sheet vs teclado | Probar el SaveSheet en mobile real (o Chrome device mode) antes de dar v0 por cerrado. |
| Borrar un Place rompe mapas compartidos | Aceptado. Documentado. Snapshot en P1 si duele. |
| Scope creep (colaboración, perfiles, itinerarios) | Esta sección 2 es la lista blanca. Si no está en v0, no entra al PR. |

Lo que **no** es riesgo de arranque: lock-in de tiles (MapLibre se cambia de style URL), falta de Figma, falta de Trello.

---

## 12. Qué no esperar del primer código

- No va a haber identidad de marca.
- No va a haber import masivo desde Google.
- No va a haber app iOS/Android.
- No va a haber "inteligencia" de sugerencias.
- El barrio no va a ser un polígono pintado.

El primer código existe para **probar el diferenciador** con gente real: filtrar Palermo + café + San Telmo + restaurante y mandar un link.

---

## 13. Primer commit de código (cuando se retome implementación)

No más docs. El siguiente PR de producto debería ser el ítem 1 del backlog: scaffold Next.js en la raíz, con README de setup local (Neon, Google OAuth callback `http://localhost:3000/api/auth/callback/google`, enable Places + Geocoding en el mismo proyecto de Google Cloud).

Checklist local antes de ese PR:

- [ ] Proyecto de Google Cloud con Places API (New) y Geocoding API.
- [ ] OAuth client (Web) con los redirect URIs de local y de Vercel.
- [ ] Neon project con `CREATE EXTENSION postgis;`.
- [ ] Cuenta Vercel ligada al repo.

---

## Anexo A — Visión que se conserva (no implementar)

Sigue valiendo, pero no guía tickets de v0:

- Colaboración tipo Google Docs para planes.
- Exploración inversa (ver lugares de contactos).
- Itinerarios "48h en Lisboa", stories, widgets.
- Perfil con modos, timeline de viajes, personalización de mapa.
- WebView Android/iOS una vez que el MVP web esté cubierto.

## Anexo B — Benchmark (en paralelo, no bloquea)

| App | Robar | Ignorar en v0 |
|---|---|---|
| Mapstr | Preview del link sin registro, URLs cortas | Red social |
| Pindrop | Mini-mapa temático como unidad de share | Curaduría editorial |
| Foursquare | Nombres de categorías como *sugerencias* de tags, no taxonomía | Check-in pesado |
| Swarm | Microfeedback al guardar | Gamificación |
| Life360 | — | Realtime de personas; no aplica |

Tablero Trello existente: `https://trello.com/b/IKLxXq1r/share-buddy`. Si se usa, las únicas columnas útiles ahora son **v0 P0** con los 15 ítems de la sección 9. El resto del tablero no define el orden de código.
