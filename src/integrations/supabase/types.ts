export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cities: {
        Row: {
          country: string | null
          events_count: number | null
          id: string
          images: Json | null
          info: Json | null
          name: string
          routes_count: number | null
          spots_count: number | null
        }
        Insert: {
          country?: string | null
          events_count?: number | null
          id?: string
          images?: Json | null
          info?: Json | null
          name: string
          routes_count?: number | null
          spots_count?: number | null
        }
        Update: {
          country?: string | null
          events_count?: number | null
          id?: string
          images?: Json | null
          info?: Json | null
          name?: string
          routes_count?: number | null
          spots_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "new_cities_country_fkey"
            columns: ["country"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          cities_count: number | null
          code: string | null
          id: string
          images: string[] | null
          info: Json | null
          name: Json
        }
        Insert: {
          cities_count?: number | null
          code?: string | null
          id?: string
          images?: string[] | null
          info?: Json | null
          name: Json
        }
        Update: {
          cities_count?: number | null
          code?: string | null
          id?: string
          images?: string[] | null
          info?: Json | null
          name?: Json
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          images: Json | null
          info: Json | null
          name: Json
          time: string | null
          type: boolean | null
        }
        Insert: {
          id?: string
          images?: Json | null
          info?: Json | null
          name: Json
          time?: string | null
          type?: boolean | null
        }
        Update: {
          id?: string
          images?: Json | null
          info?: Json | null
          name?: Json
          time?: string | null
          type?: boolean | null
        }
        Relationships: []
      }
      language: {
        Row: {
          code: string
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      route_event: {
        Row: {
          created_at: string | null
          event_id: string
          route_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          route_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          route_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_event_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_event_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          id: string
          name: Json
        }
        Insert: {
          id?: string
          name: Json
        }
        Update: {
          id?: string
          name?: Json
        }
        Relationships: []
      }
      spot_event: {
        Row: {
          created_at: string | null
          event_id: string
          spot_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          spot_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          spot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spot_event_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spot_event_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "spots"
            referencedColumns: ["id"]
          },
        ]
      }
      spot_route: {
        Row: {
          created_at: string | null
          route_id: string
          spot_id: string
        }
        Insert: {
          created_at?: string | null
          route_id: string
          spot_id: string
        }
        Update: {
          created_at?: string | null
          route_id?: string
          spot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spot_route_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spot_route_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "spots"
            referencedColumns: ["id"]
          },
        ]
      }
      spots: {
        Row: {
          city: string | null
          cityeng_old: string | null
          coordinates: Json | null
          created_at: string | null
          id: string
          id_old: number | null
          images: Json | null
          info: Json | null
          name: Json
          point: unknown | null
          type: number | null
        }
        Insert: {
          city?: string | null
          cityeng_old?: string | null
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          id_old?: number | null
          images?: Json | null
          info?: Json | null
          name: Json
          point?: unknown | null
          type?: number | null
        }
        Update: {
          city?: string | null
          cityeng_old?: string | null
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          id_old?: number | null
          images?: Json | null
          info?: Json | null
          name?: Json
          point?: unknown | null
          type?: number | null
        }
        Relationships: []
      }
      spots_backup: {
        Row: {
          city: number | null
          city_uuid: string | null
          cityeng: string | null
          coordinates: Json | null
          created_at: string | null
          id: number | null
          images: string[] | null
          imagesdf: Json | null
          info: Json | null
          latitude: number | null
          longitude: number | null
          name: Json | null
          new_id: string | null
          orderby: number | null
          routes: string[] | null
          spotype: number | null
          spotypeng: string | null
          uuid: string | null
        }
        Insert: {
          city?: number | null
          city_uuid?: string | null
          cityeng?: string | null
          coordinates?: Json | null
          created_at?: string | null
          id?: number | null
          images?: string[] | null
          imagesdf?: Json | null
          info?: Json | null
          latitude?: number | null
          longitude?: number | null
          name?: Json | null
          new_id?: string | null
          orderby?: number | null
          routes?: string[] | null
          spotype?: number | null
          spotypeng?: string | null
          uuid?: string | null
        }
        Update: {
          city?: number | null
          city_uuid?: string | null
          cityeng?: string | null
          coordinates?: Json | null
          created_at?: string | null
          id?: number | null
          images?: string[] | null
          imagesdf?: Json | null
          info?: Json | null
          latitude?: number | null
          longitude?: number | null
          name?: Json | null
          new_id?: string | null
          orderby?: number | null
          routes?: string[] | null
          spotype?: number | null
          spotypeng?: string | null
          uuid?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          city_id: number | null
          created_at: string
          email: string | null
          id: number
          info: string | null
          language: string
          name: string
          password: string | null
          phone: number | null
          pin: number | null
          points: number | null
          role: string | null
          session_token: string | null
          tarif: string | null
          tg_id: number | null
          timezone: string | null
        }
        Insert: {
          city_id?: number | null
          created_at?: string
          email?: string | null
          id?: number
          info?: string | null
          language?: string
          name: string
          password?: string | null
          phone?: number | null
          pin?: number | null
          points?: number | null
          role?: string | null
          session_token?: string | null
          tarif?: string | null
          tg_id?: number | null
          timezone?: string | null
        }
        Update: {
          city_id?: number | null
          created_at?: string
          email?: string | null
          id?: number
          info?: string | null
          language?: string
          name?: string
          password?: string | null
          phone?: number | null
          pin?: number | null
          points?: number | null
          role?: string | null
          session_token?: string | null
          tarif?: string | null
          tg_id?: number | null
          timezone?: string | null
        }
        Relationships: []
      }
      x_sm_bot_documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      x_sm_bot_users: {
        Row: {
          created_at: string
          id: number
          name: string | null
          surname: string | null
          telegram_ID: number | null
          user: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
          surname?: string | null
          telegram_ID?: number | null
          user?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          surname?: string | null
          telegram_ID?: number | null
          user?: string | null
        }
        Relationships: []
      }
      x_sm_chat_history: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      x_sm_text: {
        Row: {
          content: string | null
          created_at: string
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      z_n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      get_public_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      list_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
      }
      match_documents: {
        Args: {
          query_embedding: string
          match_count?: number
          filter?: Json
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      continents:
        | "Africa"
        | "Antarctica"
        | "Asia"
        | "Europe"
        | "Oceania"
        | "North America"
        | "South America"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
