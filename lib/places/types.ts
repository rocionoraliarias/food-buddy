export type Place = {
  id: string;
  name: string;
  address: string | null;
  notes: string | null;
  neighborhood: string | null;
  city: string | null;
  country: string | null;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
};

export type NewPlaceInput = {
  name: string;
  address?: string;
  notes?: string;
  neighborhood?: string;
  city?: string;
  country?: string;
  tags?: string[] | string;
  isFavorite?: boolean;
};

export type PlaceGroup = {
  city: string;
  neighborhood: string;
  places: Place[];
};
