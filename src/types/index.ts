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
  location: Location; // Use defined Location type
  order?: number; 
  rating?: number; 
  routesCount?: number;
  eventsCount?: number;
  city?: string;
  coordinates?: any;
  info?: any;
  images?: any;
  type?: number;
  point?: unknown;
  created_at?: string;
  events?: string[];
  routes?: string[];
}

export interface MapLocation extends Partial<Place> {
  id: string;
  name: string | { [key in Language]?: string };
  location: Location; // Use defined Location type
  order?: number; 
  rating?: number; 
  city?: string;
  coordinates?: any;
  info?: any;
  images?: any;
  type?: number;
  point?: unknown;
  created_at?: string;
  events?: string[];
  routes?: string[];
}

export interface Route {
  id: string;
  name: string | { [key in Language]?: string };
  description: string | { [key in Language]?: string };
  imageUrl: string;
  city_id: string[];
  placeIds: string[];
  eventIds: string[];
  info?: any;
  images?: any;
  places?: Place[];
  events?: Event[];
}

// Types for GuruPlanner filters
export type EventType = "festival" | "practice" | "retreat" | "vipassana" | "puja" | "lecture" | "guru_festival";
export type EventCulture = "atheism" | "hinduism" | "christianity" | "judaism" | "islam" | "advaita" | "syncretism";

export interface Event {
  id: string;
  name: string | { [key in Language]?: string };
  description: string | { [key in Language]?: string };
  imageUrl: string;
  cityId?: string | null;
  placeIds: string[];
  routeIds: string[];
  date?: string;
  time?: string;
  duration?: number;
  info?: any;
  images?: any;
  eventTypeField?: EventType; 
  hasOnlineStream?: boolean; 
  cultureField?: EventCulture; 
  location?: Location; 
  places?: Place[];
  routes?: Route[];
  price?: number;
  maxParticipants?: number;
  isRecurring?: boolean;
  recurrencePattern?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
  places_like?: string[];
}

import { Session } from '@supabase/supabase-js';
export type { Session };

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null; 
  session: Session | null; 
}

export interface Location {
    latitude: number;
    longitude: number;
}

export interface PlannedItem {
  type: 'city' | 'place' | 'route' | 'event';
  data: City | Place | Route | Event;
  city_id_for_grouping: string; 
  date?: string; 
  time?: string; 
  order?: number; 
  orderIndex: number; 
}
