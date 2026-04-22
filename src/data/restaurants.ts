import type { Restaurant } from '../types/restaurant'

export const restaurants: Restaurant[] = [
  {
    id: 'la-parrilla-del-sur',
    name: 'La Parrilla del Sur',
    cuisine: 'Argentina',
    city: 'Buenos Aires',
    address: 'Av. Corrientes 1234',
    rating: 4.7,
    priceLevel: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    tags: ['Asado', 'Carnes', 'Vino'],
    description:
      'Parrilla tradicional con cortes premium, ambiente acogedor y carta de vinos de Mendoza.',
    openNow: true,
  },
  {
    id: 'sakura-sushi',
    name: 'Sakura Sushi',
    cuisine: 'Japonesa',
    city: 'Buenos Aires',
    address: 'Av. Santa Fe 4567',
    rating: 4.5,
    priceLevel: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
    tags: ['Sushi', 'Ramen', 'Sake'],
    description:
      'Sushi omakase con pescado fresco y ramen casero. Ideal para una cena tranquila.',
    openNow: true,
  },
  {
    id: 'trattoria-bella-napoli',
    name: 'Trattoria Bella Napoli',
    cuisine: 'Italiana',
    city: 'Buenos Aires',
    address: 'Palermo Soho, Honduras 5000',
    rating: 4.6,
    priceLevel: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    tags: ['Pizza', 'Pasta', 'Familiar'],
    description:
      'Pizzas napolitanas a la leña y pastas hechas a mano. Receta familiar de tres generaciones.',
    openNow: false,
  },
  {
    id: 'el-taco-loco',
    name: 'El Taco Loco',
    cuisine: 'Mexicana',
    city: 'Córdoba',
    address: 'Nueva Córdoba, Achaval Rodríguez 200',
    rating: 4.3,
    priceLevel: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    tags: ['Tacos', 'Margaritas', 'Informal'],
    description:
      'Tacos al pastor, quesadillas y margaritas en un ambiente colorido y divertido.',
    openNow: true,
  },
  {
    id: 'green-garden',
    name: 'Green Garden',
    cuisine: 'Vegetariana',
    city: 'Rosario',
    address: 'Bv. Oroño 900',
    rating: 4.8,
    priceLevel: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
    tags: ['Vegano', 'Bowls', 'Brunch'],
    description:
      'Cocina de plantas con ingredientes de estación. Bowls, brunch y jugos prensados en frío.',
    openNow: true,
  },
  {
    id: 'le-petit-bistrot',
    name: 'Le Petit Bistrot',
    cuisine: 'Francesa',
    city: 'Buenos Aires',
    address: 'Recoleta, Vicente López 1500',
    rating: 4.4,
    priceLevel: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    tags: ['Steak frites', 'Vinos', 'Romántico'],
    description:
      'Bistró clásico francés con steak frites, coq au vin y una carta de vinos curada.',
    openNow: true,
  },
  {
    id: 'burger-factory',
    name: 'Burger Factory',
    cuisine: 'Americana',
    city: 'Córdoba',
    address: 'Güemes, Belgrano 700',
    rating: 4.2,
    priceLevel: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    tags: ['Burgers', 'Cerveza', 'Papas'],
    description:
      'Smash burgers con pan artesanal, papas rústicas y cervezas de productores locales.',
    openNow: true,
  },
  {
    id: 'casa-del-mar',
    name: 'Casa del Mar',
    cuisine: 'Mariscos',
    city: 'Mar del Plata',
    address: 'Rambla Bristol 100',
    rating: 4.9,
    priceLevel: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    tags: ['Pescado', 'Vista al mar', 'Especial'],
    description:
      'Pescados y mariscos frescos del día con vista directa al mar. Reserva recomendada.',
    openNow: false,
  },
]

export function getRestaurantById(id: string): Restaurant | undefined {
  return restaurants.find((r) => r.id === id)
}

export function getCuisines(): string[] {
  return Array.from(new Set(restaurants.map((r) => r.cuisine))).sort()
}

export function getCities(): string[] {
  return Array.from(new Set(restaurants.map((r) => r.city))).sort()
}
