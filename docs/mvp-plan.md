# Plan del MVP — Share Buddy (working title)

> App web responsive para guardar, organizar y compartir lugares, superando las limitaciones de Google Maps en filtros geográficos, agrupación automática y sharing segmentado.

---

## 1. Visión y objetivo

**Problema a resolver:** Google Maps permite guardar lugares en listas, pero no permite:
- Filtrar lugares guardados por zona geográfica sin crear listas manualmente.
- Agrupar automáticamente por barrio / ciudad / país.
- Compartir múltiples lugares de listas diferentes en un único link.
- Buscar dentro de los lugares guardados por combinación de categoría + zona.
- Crear mini-mapas temáticos compartibles.

**Objetivo del MVP:** Permitir que una persona guarde, organice y comparta lugares con sus contactos de manera fluida, con foco en:
1. Etiquetado y agrupación automática por zona.
2. Sharing por selección (zona + etiqueta + listas múltiples).
3. Colaboración simple en mapas compartidos.

**Caso de uso guía (north star):**
> Una persona en Buenos Aires quiere compartirle a una amiga que viaja sus cafés favoritos de Palermo y restaurantes de San Telmo. Selecciona barrios + etiquetas, genera un link, lo envía. La amiga abre el link y ve un mini-mapa interactivo sin necesidad de registrarse.

---

## 2. Alcance del MVP (in / out)

### Dentro del MVP (Fase 1)
- Autenticación (email + OAuth Google).
- Guardar lugar manualmente (nombre, dirección, notas, etiquetas).
- Importar lugar desde link de Google Maps (parseo de URL → place lookup).
- Etiquetas personalizadas libres (folksonomy con autocompletado).
- Agrupación automática por barrio / ciudad / país vía reverse geocoding.
- Vista mapa + vista lista, con filtros por etiqueta y por zona.
- Búsqueda interna combinando texto + etiqueta + zona.
- Compartir selección (múltiples lugares de distintas listas) → link único.
- Vista pública del link compartido (preview sin login obligatorio).
- Control de privacidad por link (público / contactos específicos).
- Colaboración básica: contactos invitados pueden agregar lugares al mapa compartido.
- Reacciones simples ("probémoslo", "ya fui") sobre lugares compartidos.

### Fuera del MVP (Fase 2+)
- Generación automática de itinerarios.
- Modo offline.
- Feed social / perfiles públicos descubribles.
- Integraciones con Uber, reservas, Calendar.
- Recomendaciones predictivas con ML.
- App nativa (la Fase 1.5 contempla WebView wrapper Android/iOS).
- Importación masiva desde Google Maps Takeout (evaluar para fase 1.5).

---

## 3. Stack técnico propuesto

| Capa | Tecnología | Razón |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | Web responsive, SSR para previews de links compartidos (OG tags), buena DX. |
| UI | Tailwind CSS + shadcn/ui | Velocidad de iteración, componentes accesibles. |
| Mapas | MapLibre GL JS + tiles de MapTiler / Protomaps | Open source, sin lock-in con Google, costos predecibles. Google Maps JS API queda como alternativa si se prioriza familiaridad visual. |
| Geocoding / Places | Google Places API (search, place details, photos) | Mejor cobertura de POIs y reseñas; necesario para importar desde links de Maps. |
| Reverse geocoding (barrio/ciudad/país) | Nominatim self-hosted o Mapbox | Costo controlado vs. Google. Decisión a tomar tras benchmark de calidad por país (clave para AR/ES/PT). |
| Backend / API | Next.js Route Handlers + tRPC (o REST con Zod) | Monorepo simple, tipado end-to-end. |
| Base de datos | PostgreSQL + PostGIS | Consultas geoespaciales nativas (radio, polígono, intersección con barrio). |
| ORM | Prisma | Migraciones limpias. Requiere extensión manual para PostGIS o usar Drizzle si se necesita más control SQL. |
| Auth | Auth.js (NextAuth) | Email magic link + Google OAuth listos. |
| Hosting app | Vercel | Edge functions, deploys atómicos. |
| DB hosting | Neon o Supabase | Postgres serverless con PostGIS habilitado. Supabase suma auth/storage si se quiere consolidar. |
| Storage de imágenes | Cloudflare R2 o Supabase Storage | Para fotos subidas por el usuario. |
| Cache | Redis (Upstash) | Cache de geocoding y previews de links. |
| Analytics | PostHog | Funnel del flujo de guardado y compartir. |
| Error tracking | Sentry | — |

**Costos clave a monitorear:**
- Google Places API: ~$17 por 1.000 Place Details, ~$32 por 1.000 Autocomplete sessions. Mitigación: cache agresivo + sessions tokens + límite por usuario/día.
- Reverse geocoding: si se usa Google, $5 por 1.000. Alternativa Nominatim self-hosted reduce a costo de VM.

---

## 4. Modelo de datos (núcleo)

```
User
  id, email, name, avatar_url, created_at
  preferred_lang, profile_mode (explorer | local | traveler | foodie)

Place
  id, owner_id (FK User), source (manual | google_import)
  google_place_id (nullable), name, address
  location (geography Point, SRID 4326)
  notes (text)
  created_at, visited_at (nullable)
  -- denormalizado al guardar para queries rápidas:
  neighborhood, city, country, country_code

Tag
  id, owner_id, name, color
  UNIQUE (owner_id, lower(name))

PlaceTag
  place_id, tag_id

SharedMap
  id (slug pública), owner_id, title, description
  visibility (public | link_only | contacts)
  created_at, expires_at (nullable)
  cover_image_url

SharedMapPlace
  shared_map_id, place_id, added_by_user_id, added_at
  -- permite que un colaborador agregue su propio Place al mapa compartido

SharedMapCollaborator
  shared_map_id, user_id, role (viewer | contributor), invited_at

Reaction
  id, shared_map_id, place_id, user_id (nullable para anónimos), type (try | been | love), comment (nullable)
```

**Decisiones clave:**
- `location` como `geography(Point, 4326)` para usar índices GIST y queries `ST_DWithin`, `ST_Within(polygon_barrio)`.
- Denormalizar `neighborhood/city/country` al momento de guardar evita reverse-geocoding en cada query.
- `SharedMap` con slug → la URL pública es `/m/{slug}` (corta, copy-pasteable).
- Reacciones permiten `user_id NULL` para soportar el flujo "ver sin registrarse" con identidad opcional vía cookie.

---

## 5. Funcionalidades del MVP — desglose

### 5.1 Guardado de lugares
- **Manual:** botón "+" siempre visible sobre el mapa → bottom sheet con buscador (Places Autocomplete) → seleccionar resultado → asignar etiquetas (chips con autocompletado de las del usuario) → guardar.
- **Importar de Google Maps:** pegar link (formatos cortos `maps.app.goo.gl`, `goo.gl/maps`, URLs largas con `@lat,lng` o `!3d!4d`) → backend resuelve redirect, extrae coords o place_id, hace Place Details → muestra preview → confirmar.
- **Notas:** campo libre, soporte de markdown ligero.
- **Pin contextual:** long-press en mapa para guardar coordenada arbitraria (sin Place de Google).

### 5.2 Organización automática
- Al guardar, job síncrono (o async con optimistic update) hace reverse geocoding y popula `neighborhood/city/country`.
- Vista "Mis lugares" agrupada por defecto por ciudad → barrio (acordeón colapsable).
- Vista mapa con clusters por zoom; ícono distinto por etiqueta dominante.
- Filtros combinables: etiquetas (multi-select), ciudad, barrio, visitado / pendiente.
- Buscador único que parsea: texto + tag chips + zona seleccionada.

### 5.3 Compartir
- Modo selección: tap-largo o botón "Seleccionar" → checkboxes en lista y mapa.
- Atajo: "Compartir todos los X en Y" (etiqueta + zona) desde los filtros activos.
- Generar `SharedMap` → modal con link, toggle de visibilidad, opción de agregar título y portada.
- Página pública `/m/{slug}` con SSR para OG image (mapa renderizado server-side con número de lugares + ciudad).
- Sin registro obligatorio para ver. Para reaccionar/agregar lugar pide login (magic link rápido).

### 5.4 Colaboración
- Owner invita por email o link "puede agregar".
- Colaborador agrega Place desde su propio repositorio (o nuevo) → aparece en el mapa con avatar del autor.
- Reacciones por lugar: emoji-quick (`probémoslo` / `ya fui` / `❤️`) + comentario opcional.
- Realtime: WebSocket o Postgres Changes (Supabase) para refrescar el mapa compartido si dos personas lo editan a la vez. Fallback a polling cada 30s si se decide simplificar.

---

## 6. UX — principios de diseño (alineado al brief)

Resumen aplicado al MVP, priorizado:

1. **Mapa como superficie principal:** el mapa ocupa 100% del viewport; todo lo demás flota en bottom sheets (mobile) o paneles laterales (desktop).
2. **2 toques para guardar:** evitar pantallas de confirmación; usar microfeedback (pin que "salta" + haptic).
3. **2 pasos para compartir:** seleccionar → link generado (sin wizard).
4. **Acciones contextuales:** "Compartir" solo aparece sobre lugares ya guardados; "Guardar" no aparece sobre los que ya están.
5. **Anticipación:** autocompletar etiquetas y sugerir "¿agrupar los X cafés de Palermo?" cuando hay 3+ lugares con misma etiqueta + barrio.
6. **Microcopys neutros:** "Guardado", "Compartido" — sin emojis decorativos por defecto.
7. **Modo exploración:** arrastrar/zoom en el mapa filtra dinámicamente la lista visible (lo que está en el viewport).
8. **Previews limpios:** link compartido abre con preview rich (OG image generada con mapa + N lugares + etiquetas dominantes).

### Pantallas mínimas del MVP
1. Onboarding / login (1 paso, magic link o Google).
2. Home = mapa con mis lugares + bottom sheet con lista filtrable.
3. Ficha de lugar (detalle + edición + acciones).
4. Modo selección + modal "Compartir".
5. Página pública de mapa compartido `/m/{slug}`.
6. Mis mapas compartidos (gestión, revocar links).
7. Perfil mínimo (datos, modo de uso, lugares guardados/visitados/compartidos como contador).

---

## 7. Roadmap por fases

### Fase 0 — Discovery (previo a código)
- Benchmark detallado de Mapstr, Pindrop, Life360, Foursquare, Swarm: matriz de features, UX patterns, modelo de monetización.
- Crear tablero Trello/Notion (ya iniciado: `trello.com/b/IKLxXq1r/share-buddy`).
- Definir identidad visual mínima (logo, paleta, tipografía) — no es bloqueante para empezar.
- Validar decisión Google Maps API vs MapLibre con un spike técnico de 1-2 días.

### Fase 1 — MVP Web Responsive
Iteraciones sugeridas (cada una termina en deploy a staging):

**Sprint A — Fundaciones**
- Setup repo, CI, deploy en Vercel.
- Schema DB + PostGIS habilitado.
- Auth (magic link + Google).
- Página home con mapa MapLibre vacío + bottom sheet vacío.

**Sprint B — Guardado**
- Crear Place manual con Places Autocomplete.
- Importar desde link de Google Maps (resolver redirects, parsear).
- Etiquetas con autocompletado.
- Reverse geocoding y denormalización de zona.

**Sprint C — Organización y vista**
- Vista lista agrupada por ciudad/barrio.
- Filtros (etiqueta + zona + estado).
- Búsqueda interna combinada.
- Clusters en el mapa.

**Sprint D — Compartir**
- Modo selección multi-lugar.
- Generación de SharedMap + link.
- Página pública `/m/{slug}` con SSR + OG image.
- Control de visibilidad.

**Sprint E — Colaboración**
- Invitar colaboradores.
- Agregar lugar a mapa compartido.
- Reacciones y comentarios.
- Realtime básico (o polling).

**Sprint F — Pulido**
- Onboarding.
- Perfil + contadores.
- Accesibilidad (a11y audit).
- Performance (Lighthouse > 90 en mobile).
- Analytics + Sentry.
- Beta cerrada con ~20 usuarios.

### Fase 1.5 — WebView wrapper
- Capacitor (o Expo + WebView) para empaquetar la web como app Android/iOS.
- Permisos nativos: geolocalización en background, share sheet nativo, deep links de `maps.app.goo.gl`.
- Publicación interna en TestFlight / Internal Testing.

### Fase 2 — Diferenciadores
- Itinerarios automáticos.
- Modo offline (cache de tiles + Service Worker para datos del usuario).
- Feed social opcional (follow, descubrimiento de mapas públicos).
- Importación masiva desde Google Takeout.
- Sugerencias predictivas básicas.

---

## 8. Métricas de éxito del MVP

| Métrica | Meta inicial |
|---|---|
| Activación (usuarios que guardan ≥1 lugar) | 70% de los registros |
| Retención semana 2 | ≥30% |
| Promedio de lugares guardados / usuario activo | ≥10 en 30 días |
| Mapas compartidos generados / usuario activo | ≥1 en 30 días |
| Clics en links compartidos / mapa | ≥3 |
| Tiempo del flujo "guardar lugar" | < 10s |
| Tiempo del flujo "compartir selección" | < 15s |

---

## 9. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Costos de Google Places API se disparan | Cache agresivo en Redis, session tokens, límite por usuario/día, considerar Mapbox/Nominatim para reverse geocoding. |
| Calidad de barrios en reverse geocoding varía por país | Benchmark previo en AR, ES, PT, MX. Permitir override manual del barrio por el usuario. |
| Importar links de Google Maps es frágil (formatos cambian) | Tests de integración por formato, fallback a "no se pudo importar, ingresá manualmente". |
| Polígonos de barrios no son consistentes | Usar dataset OSM `admin_level=10` y guardar versionado; permitir barrios "personalizados" del usuario. |
| UX de compartir confusa (privacidad mal entendida) | Microcopys claros, preview de "qué van a ver" antes de generar el link. |
| Lock-in con Google Maps tiles | Stack base en MapLibre desde el día 1; Places API como dato, no como render. |
| Adopción baja sin red social inicial | Foco en utility puro (sharing 1-a-1) antes de feed. El share link es el motor de growth orgánico. |

---

## 10. Próximos pasos accionables

1. Validar este plan con el equipo y marcar ajustes.
2. Completar el benchmark de competidores en el Trello.
3. Spike técnico: prototipo "hello map" con MapLibre + Places Autocomplete + import de un link de Google Maps. Tiempo: corto y acotado, sirve para confirmar stack.
4. Definir wireframes de las 7 pantallas mínimas (Figma).
5. Crear backlog por sprint en Trello a partir del desglose de Fase 1.
6. Setup de proyecto en Vercel + Neon/Supabase + Sentry + PostHog.
7. Empezar Sprint A.

---

## Anexo — Benchmark a completar

| App | Qué hace mejor | Qué le falta | Patrón UX a robar |
|---|---|---|---|
| Mapstr | URLs limpias, social ligero | Filtros geográficos débiles | Preview sin registro |
| Pindrop | Curaduría temática | Poca colaboración | Mini-mapas temáticos |
| Life360 | Realtime de personas | No es de lugares | Realtime stack |
| Foursquare | Categorización rica | UX cargada | Taxonomía de POIs |
| Swarm | Check-ins gamificados | Pesa más en visitas que en planificación | Microinteracciones de check-in |
