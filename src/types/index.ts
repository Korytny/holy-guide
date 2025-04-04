
export type Language = "ru" | "en" | "hi";

export interface City {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  country: string;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cityId: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Route {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cityId: string;
  placeIds: string[];
  eventIds: string[];
}

export interface Event {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cityId: string;
  placeIds: string[];
  routeIds: string[];
  date?: string;
}

export interface LanguageText {
  [key: string]: {
    [lang in Language]: string;
  };
}
