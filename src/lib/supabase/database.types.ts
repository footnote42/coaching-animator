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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      animation_versions: {
        Row: {
          animation_id: string
          created_at: string
          created_by: string | null
          id: string
          major_version: number
          minor_version: number
          payload: Json
          version_number: string
        }
        Insert: {
          animation_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          major_version: number
          minor_version: number
          payload: Json
          version_number: string
        }
        Update: {
          animation_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          major_version?: number
          minor_version?: number
          payload?: Json
          version_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "animation_versions_animation_id_fkey"
            columns: ["animation_id"]
            isOneToOne: false
            referencedRelation: "saved_animations"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          added_at: string
          animation_id: string
          collection_id: string
          id: string
        }
        Insert: {
          added_at?: string
          animation_id: string
          collection_id: string
          id?: string
        }
        Update: {
          added_at?: string
          animation_id?: string
          collection_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_animation_id_fkey"
            columns: ["animation_id"]
            isOneToOne: false
            referencedRelation: "saved_animations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          action_taken: string | null
          animation_id: string
          created_at: string | null
          details: string | null
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          action_taken?: string | null
          animation_id: string
          created_at?: string | null
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          action_taken?: string | null
          animation_id?: string
          created_at?: string | null
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_animation_id_fkey"
            columns: ["animation_id"]
            isOneToOne: false
            referencedRelation: "saved_animations"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_blocklist: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          severity: string
          word: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          severity: string
          word: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          severity?: string
          word?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number | null
          key: string
          window_start: string | null
        }
        Insert: {
          count?: number | null
          key: string
          window_start?: string | null
        }
        Update: {
          count?: number | null
          key?: string
          window_start?: string | null
        }
        Relationships: []
      }
      practices: {
        Row: {
          created_at: string
          description: string | null
          id: string
          owner_id: string
          schema_version: number
          script: Json
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          owner_id: string
          schema_version: number
          script: Json
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          owner_id?: string
          schema_version?: number
          script?: Json
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      saved_animations: {
        Row: {
          animation_type: string
          coaching_notes: string | null
          created_at: string | null
          current_version: string
          description: string | null
          duration_ms: number
          endorsed_by: string | null
          frame_count: number
          hidden_at: string | null
          hidden_reason: string | null
          id: string
          is_progression: boolean
          parent_animation_id: string | null
          payload: Json
          preview_entities: Json | null
          progression_count: number
          progression_order: number | null
          remix_count: number
          remixed_from_id: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          upvote_count: number | null
          user_id: string
          video_url: string | null
          view_count: number | null
          visibility: string
        }
        Insert: {
          animation_type?: string
          coaching_notes?: string | null
          created_at?: string | null
          current_version?: string
          description?: string | null
          duration_ms: number
          endorsed_by?: string | null
          frame_count: number
          hidden_at?: string | null
          hidden_reason?: string | null
          id?: string
          is_progression?: boolean
          parent_animation_id?: string | null
          payload: Json
          preview_entities?: Json | null
          progression_count?: number
          progression_order?: number | null
          remix_count?: number
          remixed_from_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          upvote_count?: number | null
          user_id: string
          video_url?: string | null
          view_count?: number | null
          visibility?: string
        }
        Update: {
          animation_type?: string
          coaching_notes?: string | null
          created_at?: string | null
          current_version?: string
          description?: string | null
          duration_ms?: number
          endorsed_by?: string | null
          frame_count?: number
          hidden_at?: string | null
          hidden_reason?: string | null
          id?: string
          is_progression?: boolean
          parent_animation_id?: string | null
          payload?: Json
          preview_entities?: Json | null
          progression_count?: number
          progression_order?: number | null
          remix_count?: number
          remixed_from_id?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          upvote_count?: number | null
          user_id?: string
          video_url?: string | null
          view_count?: number | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_animations_parent_animation_id_fkey"
            columns: ["parent_animation_id"]
            isOneToOne: false
            referencedRelation: "saved_animations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_animations_remixed_from_id_fkey"
            columns: ["remixed_from_id"]
            isOneToOne: false
            referencedRelation: "saved_animations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_animations_user_id_fkey_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      upvotes: {
        Row: {
          animation_id: string
          created_at: string | null
          user_id: string
        }
        Insert: {
          animation_id: string
          created_at?: string | null
          user_id: string
        }
        Update: {
          animation_id?: string
          created_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upvotes_animation_id_fkey"
            columns: ["animation_id"]
            isOneToOne: false
            referencedRelation: "saved_animations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          animation_count: number | null
          ban_reason: string | null
          banned_at: string | null
          club_badge_url: string | null
          club_name: string | null
          created_at: string | null
          display_name: string | null
          id: string
          max_animations: number
          primary_strip_color: string | null
          role: string | null
          secondary_strip_color: string | null
          updated_at: string | null
        }
        Insert: {
          animation_count?: number | null
          ban_reason?: string | null
          banned_at?: string | null
          club_badge_url?: string | null
          club_name?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          max_animations?: number
          primary_strip_color?: string | null
          role?: string | null
          secondary_strip_color?: string | null
          updated_at?: string | null
        }
        Update: {
          animation_count?: number | null
          ban_reason?: string | null
          banned_at?: string | null
          club_badge_url?: string | null
          club_name?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          max_animations?: number
          primary_strip_color?: string | null
          role?: string | null
          secondary_strip_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_rate_limits: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
