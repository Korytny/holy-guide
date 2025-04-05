
export type Language = "ru" | "en" | "hi";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface City {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  country: string;
  // Database fields
  events_count?: number;
  routes_count?: number;
  spots_count?: number;
  info?: Json;
  images?: Json;
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
  // Database fields
  city?: string;
  coordinates?: Json;
  info?: Json;
  images?: Json;
  type?: number;
  point?: unknown;
  created_at?: string;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cityId: string;
  placeIds: string[];
  eventIds: string[];
  // Database fields
  info?: Json;
  images?: Json;
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
  // Database fields
  time?: string;
  info?: Json;
  images?: Json;
  type?: boolean;
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
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
}
