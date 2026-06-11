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
      ai_reports: {
        Row: {
          content: string
          created_at: string
          id: string
          metrics: Json | null
          scope: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metrics?: Json | null
          scope?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metrics?: Json | null
          scope?: string
          user_id?: string
        }
        Relationships: []
      }
      chain_subtasks: {
        Row: {
          chain_id: string
          code: string
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          module: string | null
          order_index: number
          status: string
          title: string
          unlocks_subtask_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chain_id: string
          code: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          module?: string | null
          order_index?: number
          status?: string
          title: string
          unlocks_subtask_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chain_id?: string
          code?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          module?: string | null
          order_index?: number
          status?: string
          title?: string
          unlocks_subtask_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chain_subtasks_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "operational_chains"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checkins: {
        Row: {
          ai_summary: string | null
          bottleneck: string | null
          check_date: string
          created_at: string
          discomfort: string | null
          energy: number | null
          focus: number | null
          id: string
          main_mission: string | null
          mood: number | null
          notes: string | null
          operational_mode: string | null
          sleep_quality: number | null
          stress: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          bottleneck?: string | null
          check_date?: string
          created_at?: string
          discomfort?: string | null
          energy?: number | null
          focus?: number | null
          id?: string
          main_mission?: string | null
          mood?: number | null
          notes?: string | null
          operational_mode?: string | null
          sleep_quality?: number | null
          stress?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          bottleneck?: string | null
          check_date?: string
          created_at?: string
          discomfort?: string | null
          energy?: number | null
          focus?: number | null
          id?: string
          main_mission?: string | null
          mood?: number | null
          notes?: string | null
          operational_mode?: string | null
          sleep_quality?: number | null
          stress?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emergent_insights: {
        Row: {
          category: string
          content: string
          created_at: string
          feedback_note: string | null
          feedback_rating: number | null
          feedback_useful: boolean | null
          id: string
          insight_type: string
          pattern_data: Json | null
          severity: string
          source_scope: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          feedback_note?: string | null
          feedback_rating?: number | null
          feedback_useful?: boolean | null
          id?: string
          insight_type?: string
          pattern_data?: Json | null
          severity?: string
          source_scope?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          feedback_note?: string | null
          feedback_rating?: number | null
          feedback_useful?: boolean | null
          id?: string
          insight_type?: string
          pattern_data?: Json | null
          severity?: string
          source_scope?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      field_versions: {
        Row: {
          content: string
          created_at: string
          field_key: string
          id: string
          module: string
          user_id: string
          version: number
        }
        Insert: {
          content?: string
          created_at?: string
          field_key: string
          id?: string
          module: string
          user_id: string
          version?: number
        }
        Update: {
          content?: string
          created_at?: string
          field_key?: string
          id?: string
          module?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      hydration_logs: {
        Row: {
          amount_ml: number
          consumed_at: string
          created_at: string
          id: string
          note: string | null
          user_id: string
        }
        Insert: {
          amount_ml: number
          consumed_at?: string
          created_at?: string
          id?: string
          note?: string | null
          user_id: string
        }
        Update: {
          amount_ml?: number
          consumed_at?: string
          created_at?: string
          id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      identity: {
        Row: {
          archetype: string | null
          central_phrase: string | null
          existential_mission: string | null
          future_identity: string | null
          moral_code: string | null
          philosophy: string | null
          principles: string | null
          strengths: string | null
          updated_at: string
          user_id: string
          values_text: string | null
          weaknesses: string | null
          worldview: string | null
        }
        Insert: {
          archetype?: string | null
          central_phrase?: string | null
          existential_mission?: string | null
          future_identity?: string | null
          moral_code?: string | null
          philosophy?: string | null
          principles?: string | null
          strengths?: string | null
          updated_at?: string
          user_id: string
          values_text?: string | null
          weaknesses?: string | null
          worldview?: string | null
        }
        Update: {
          archetype?: string | null
          central_phrase?: string | null
          existential_mission?: string | null
          future_identity?: string | null
          moral_code?: string | null
          philosophy?: string | null
          principles?: string | null
          strengths?: string | null
          updated_at?: string
          user_id?: string
          values_text?: string | null
          weaknesses?: string | null
          worldview?: string | null
        }
        Relationships: []
      }
      jarvis_insights: {
        Row: {
          created_at: string
          description: string | null
          id: string
          kind: string
          metadata: Json | null
          severity: string
          source_module: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          kind: string
          metadata?: Json | null
          severity?: string
          source_module?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          metadata?: Json | null
          severity?: string
          source_module?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          module: string
          tags: string[] | null
          title: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          module?: string
          tags?: string[] | null
          title?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          module?: string
          tags?: string[] | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mission_completions: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          mission_id: string
          notes: string | null
          quality: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          mission_id: string
          notes?: string | null
          quality?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          mission_id?: string
          notes?: string | null
          quality?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_completions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_at: string | null
          id: string
          last_completed_at: string | null
          recurrence: string
          status: Database["public"]["Enums"]["mission_status"]
          streak: number
          title: string
          type: Database["public"]["Enums"]["mission_type"]
          user_id: string
          xp: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          last_completed_at?: string | null
          recurrence?: string
          status?: Database["public"]["Enums"]["mission_status"]
          streak?: number
          title: string
          type?: Database["public"]["Enums"]["mission_type"]
          user_id: string
          xp?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          last_completed_at?: string | null
          recurrence?: string
          status?: Database["public"]["Enums"]["mission_status"]
          streak?: number
          title?: string
          type?: Database["public"]["Enums"]["mission_type"]
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      ooda_entries: {
        Row: {
          act: string
          comfort_zone: number
          counter_argument: string
          created_at: string
          data_integrity: boolean
          decide: string
          id: string
          integrity_note: string | null
          observe: string
          orient: string
          tag: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          act?: string
          comfort_zone?: number
          counter_argument?: string
          created_at?: string
          data_integrity?: boolean
          decide?: string
          id?: string
          integrity_note?: string | null
          observe?: string
          orient?: string
          tag?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          act?: string
          comfort_zone?: number
          counter_argument?: string
          created_at?: string
          data_integrity?: boolean
          decide?: string
          id?: string
          integrity_note?: string | null
          observe?: string
          orient?: string
          tag?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      operational_chains: {
        Row: {
          archived_at: string | null
          code: string
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          primary_module: string | null
          priority: number
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          code: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          primary_module?: string | null
          priority?: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          code?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          primary_module?: string | null
          priority?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          central_phrase: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          central_phrase?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          central_phrase?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      mission_status: "active" | "done" | "failed" | "archived"
      mission_type:
        | "daily"
        | "weekly"
        | "campaign"
        | "side"
        | "challenge"
        | "project"
        | "cognitive"
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
      mission_status: ["active", "done", "failed", "archived"],
      mission_type: [
        "daily",
        "weekly",
        "campaign",
        "side",
        "challenge",
        "project",
        "cognitive",
      ],
    },
  },
} as const
