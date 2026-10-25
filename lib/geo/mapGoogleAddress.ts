export type GoogleAddressComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

export type MappedAddress = {
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  country: string | null;
};

function textOf(components: GoogleAddressComponent[], type: string): string | null {
  const match = components.find((component) => component.types?.includes(type));
  const value = match?.longText?.trim();
  return value ? value : null;
}

function firstOf(components: GoogleAddressComponent[], types: string[]): string | null {
  for (const type of types) {
    const value = textOf(components, type);
    if (value) return value;
  }
  return null;
}

export function mapGoogleAddress(components: GoogleAddressComponent[]): MappedAddress {
  const route = textOf(components, "route");
  const streetNumber = textOf(components, "street_number");
  const address = route && streetNumber ? `${route} ${streetNumber}` : route;

  return {
    address,
    neighborhood: firstOf(components, ["sublocality_level_1", "sublocality", "neighborhood"]),
    city: firstOf(components, ["locality", "administrative_area_level_2"]),
    country: textOf(components, "country"),
  };
}
