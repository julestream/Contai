export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_notes: {
        Row: {
          artwork_id: string | null
          created_at: string
          id: string
          note: string
          profile_id: string | null
          reservation_id: string | null
        }
        Insert: {
          artwork_id?: string | null
          created_at?: string
          id?: string
          note: string
          profile_id?: string | null
          reservation_id?: string | null
        }
        Update: {
          artwork_id?: string | null
          created_at?: string
          id?: string
          note?: string
          profile_id?: string | null
          reservation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_notes_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_notes_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      artworks: {
        Row: {
          artist_id: string
          artist_level: string | null
          colours: string[] | null
          created_at: string
          depth_cm: number | null
          framed: boolean | null
          height_cm: number | null
          id: string
          images: Json | null
          materials: string[] | null
          medium: string | null
          mood: string[] | null
          original_or_print: string | null
          pickup_address: string | null
          pickup_area: string | null
          pickup_method: string | null
          price_huf: number
          reservation_fee_huf: number | null
          size_category: string | null
          status: Database["public"]["Enums"]["artwork_status"] | null
          style: string | null
          title: string
          type_of_art: string | null
          width_cm: number | null
          year: number | null
        }
        Insert: {
          artist_id: string
          artist_level?: string | null
          colours?: string[] | null
          created_at?: string
          depth_cm?: number | null
          framed?: boolean | null
          height_cm?: number | null
          id?: string
          images?: Json | null
          materials?: string[] | null
          medium?: string | null
          mood?: string[] | null
          original_or_print?: string | null
          pickup_address?: string | null
          pickup_area?: string | null
          pickup_method?: string | null
          price_huf: number
          reservation_fee_huf?: number | null
          size_category?: string | null
          status?: Database["public"]["Enums"]["artwork_status"] | null
          style?: string | null
          title: string
          type_of_art?: string | null
          width_cm?: number | null
          year?: number | null
        }
        Update: {
          artist_id?: string
          artist_level?: string | null
          colours?: string[] | null
          created_at?: string
          depth_cm?: number | null
          framed?: boolean | null
          height_cm?: number | null
          id?: string
          images?: Json | null
          materials?: string[] | null
          medium?: string | null
          mood?: string[] | null
          original_or_print?: string | null
          pickup_address?: string | null
          pickup_area?: string | null
          pickup_method?: string | null
          price_huf?: number
          reservation_fee_huf?: number | null
          size_category?: string | null
          status?: Database["public"]["Enums"]["artwork_status"] | null
          style?: string | null
          title?: string
          type_of_art?: string | null
          width_cm?: number | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          awarded_at: string
          badge_type: string
          id: string
          profile_id: string
        }
        Insert: {
          awarded_at?: string
          badge_type: string
          id?: string
          profile_id: string
        }
        Update: {
          awarded_at?: string
          badge_type?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          artist_id: string
          artwork_id: string
          buyer_id: string
          created_at: string
          id: string
          last_message_at: string | null
        }
        Insert: {
          artist_id: string
          artwork_id: string
          buyer_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
        }
        Update: {
          artist_id?: string
          artwork_id?: string
          buyer_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          artwork_id: string
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          artwork_id: string
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          artwork_id?: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          artist_statement: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          mediums: string[] | null
          pickup_area: string | null
          role: string
          stripe_account_id: string | null
        }
        Insert: {
          artist_statement?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          mediums?: string[] | null
          pickup_area?: string | null
          role?: string
          stripe_account_id?: string | null
        }
        Update: {
          artist_statement?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          mediums?: string[] | null
          pickup_area?: string | null
          role?: string
          stripe_account_id?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: {
          artwork_id: string
          buyer_id: string
          created_at: string
          handoff_code: string | null
          id: string
          issue_notes: string | null
          issue_reported_at: string | null
          issue_type: string | null
          reservation_expires_at: string | null
          reservation_fee_huf: number | null
          status: Database["public"]["Enums"]["reservation_status"] | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          artwork_id: string
          buyer_id: string
          created_at?: string
          handoff_code?: string | null
          id?: string
          issue_notes?: string | null
          issue_reported_at?: string | null
          issue_type?: string | null
          reservation_expires_at?: string | null
          reservation_fee_huf?: number | null
          status?: Database["public"]["Enums"]["reservation_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          artwork_id?: string
          buyer_id?: string
          created_at?: string
          handoff_code?: string | null
          id?: string
          issue_notes?: string | null
          issue_reported_at?: string | null
          issue_type?: string | null
          reservation_expires_at?: string | null
          reservation_fee_huf?: number | null
          status?: Database["public"]["Enums"]["reservation_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_documents: {
        Row: {
          created_at: string
          document_type: string
          id: string
          notes: string | null
          profile_id: string
          status: string | null
          storage_path: string
        }
        Insert: {
          created_at?: string
          document_type: string
          id?: string
          notes?: string | null
          profile_id: string
          status?: string | null
          storage_path: string
        }
        Update: {
          created_at?: string
          document_type?: string
          id?: string
          notes?: string | null
          profile_id?: string
          status?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      artwork_status:
        | "draft"
        | "under_review"
        | "live"
        | "reserved"
        | "sold"
        | "rejected"
      reservation_status:
        | "reserved"
        | "reservation_paid"
        | "scheduling_in_progress"
        | "ready_for_pickup"
        | "handoff_completed"
        | "reservation_expired"
        | "refunded"
        | "buyer_issue_reported"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      artwork_status: [
        "draft",
        "under_review",
        "live",
        "reserved",
        "sold",
        "rejected",
      ],
      reservation_status: [
        "reserved",
        "reservation_paid",
        "scheduling_in_progress",
        "ready_for_pickup",
        "handoff_completed",
        "reservation_expired",
        "refunded",
        "buyer_issue_reported",
      ],
    },
  },
} as const
