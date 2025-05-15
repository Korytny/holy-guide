export type Language = "ru" | "en" | "hi";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type LocalizedText = { [key in Language]?: string };

export interface CityFromDB {
  id: string;
  name: Json;
  image_url?: string;
  country: string;
  events_count?: number;
  routes_count?: number;
  spots_count?: number;
  info?: Json;
  images?: Json;
  created_at?: string;
  updated_at?: string;
}

export interface City {
  id: string;
  name: LocalizedText;
  imageUrl: string;
  country: string;
  eventsCount?: number;
  routesCount?: number;
  spotsCount?: number;
  info?: Record<string, any>;
  images?: any;
  createdAt: Date;
  updatedAt: Date;
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
  order?: number; // Added order field for routes
  routesCount?: number;
  eventsCount?: number;
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

export interface MapLocation extends Partial<Place> {
  id: string;
  name: string | { [key in Language]?: string };
  location: {
    latitude: number;
    longitude: number;
    };
  order?: number; // Also added here for consistency
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
  routes_like?: string[];
  events_like?: string[];
  places_like?: string[]; // Added
}

// Import and EXPORT Session type from supabase-js
import { Session } from '@supabase/supabase-js';
export type { Session }; // Export the Session type

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null; // This is the UserProfile from your DB
  session: Session | null; // Add Supabase Session object
}

export interface PlannedItem {
  type: 'city' | 'place' | 'route' | 'event';
  data: City | Place | Route | Event;
  city_id_for_grouping: string; // To associate items with a city in the plan
  date?: string; // Optional: for specific date planning
  time?: string; // Optional: for specific time planning
}
