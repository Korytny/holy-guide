export type Language = "ru" | "en" | "hi";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface City {
  id: string;
  name: string | { [key in Language]?: string };
  description: string | { [key in Language]?: string };
  imageUrl: string;
  country: string;
  // Database fields
  events_count?: number;
  routes_count?: number;
  spots_count?: number;
  info?: any;
  images?: any;
}

export interface Place {
  id: string;
  name: string | { [key in Language]?: string };
  description: string | { [key in Language]?: string };
  imageUrl: string;
  cityId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  // Database fields
  city?: string;
  coordinates?: any;
  info?: any;
  images?: any;
  type?: number;
  point?: unknown;
  created_at?: string;
  // Added new properties to avoid circular references
  events?: string[];
  routes?: string[];
}

export interface Route {
  id: string;
  name: string | { [key in Language]?: string };
  description: string | { [key in Language]?: string };
  imageUrl: string;
  cityId: string;
  placeIds: string[];
  eventIds: string[];
  // Database fields
  info?: any;
  images?: any;
  // Added new properties to avoid circular references
  places?: Place[];
  events?: Event[];
}

export interface Event {
  id: string;
  name: string | { [key in Language]?: string };
  description: string | { [key in Language]?: string };
  imageUrl: string;
  cityId: string;
  placeIds: string[];
  routeIds: string[];
  date?: string;
  // Database fields
  time?: string;
  info?: any;
  images?: any;
  type?: boolean;
  // Added new properties to avoid circular references
  places?: Place[];
  routes?: Route[];
}

export interface LanguageText {
  [key: string]: {
    [lang in Language]: string;
  };
}

export interface UserProfile {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  updatedAt: string;
  cities_like?: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
}
