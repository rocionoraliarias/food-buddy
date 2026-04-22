# Food Buddy 🍴

App web para descubrir restaurantes. Buscá por nombre, cocina o ciudad,
filtrá por horario y abrí el detalle de cada lugar.

## Stack

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) +
  [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- ESLint + Prettier

## Desarrollo

```bash
npm install
npm run dev
```

Abrir http://localhost:5173.

## Scripts

| Comando           | Descripción                                 |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con HMR              |
| `npm run build`   | Type-check + build de producción en `dist/` |
| `npm run preview` | Previsualiza el build de producción         |
| `npm run lint`    | Corre ESLint sobre todo el proyecto         |
| `npm run format`  | Formatea el código con Prettier             |

## Estructura

```
src/
├── components/     # Navbar, RestaurantCard, SearchBar
├── data/           # restaurantes de ejemplo
├── pages/          # Home, Restaurants, RestaurantDetail, About, NotFound
├── types/          # Tipos TypeScript
├── App.tsx         # Router raíz
└── main.tsx        # Entry point
```

## Datos

Los restaurantes actuales son **datos de ejemplo** en
`src/data/restaurants.ts`. En una próxima iteración se reemplazará por una
API real (p. ej. Google Places, Foursquare o un backend propio).
