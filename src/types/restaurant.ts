export type PriceLevel = 1 | 2 | 3 | 4

export interface Restaurant {
  id: string
  name: string
  cuisine: string
  city: string
  address: string
  rating: number
  priceLevel: PriceLevel
  imageUrl: string
  tags: string[]
  description: string
  openNow: boolean
}
