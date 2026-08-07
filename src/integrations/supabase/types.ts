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
      ai_suggestions: {
        Row: {
          created_at: string
          field_key: string
          id: string
          module: string
          reason: string | null
          source_journal_id: string | null
          status: string
          suggested_content: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          field_key: string
          id?: string
          module: string
          reason?: string | null
          source_journal_id?: string | null
          status?: string
          suggested_content: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          field_key?: string
          id?: string
          module?: string
          reason?: string | null
          source_journal_id?: string | null
          status?: string
          suggested_content?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_source_journal_id_fkey"
            columns: ["source_journal_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
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
      classroom_sessions: {
        Row: {
          archetype: string
          board_notes: string | null
          comprehension: number
          created_at: string
          id: string
          status: string
          topic: string
          transcript: Json
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          archetype: string
          board_notes?: string | null
          comprehension?: number
          created_at?: string
          id?: string
          status?: string
          topic: string
          transcript?: Json
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          archetype?: string
          board_notes?: string | null
          comprehension?: number
          created_at?: string
          id?: string
          status?: string
          topic?: string
          transcript?: Json
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      cut_rituals: {
        Row: {
          category: string
          created_at: string
          decision: string
          executed_at: string | null
          id: string
          item: string
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          decision?: string
          executed_at?: string | null
          id?: string
          item: string
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          decision?: string
          executed_at?: string | null
          id?: string
          item?: string
          reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      income_streams: {
        Row: {
          amount: number
          created_at: string
          id: string
          name: string
          notes: string | null
          ref_month: string
          stream_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          ref_month?: string
          stream_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          ref_month?: string
          stream_type?: string
          updated_at?: string
          user_id?: string
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
      jarvis_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
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
      memory_loci: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_cue: string | null
          lat: number | null
          lng: number | null
          locus_name: string
          order_index: number
          palace: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_cue?: string | null
          lat?: number | null
          lng?: number | null
          locus_name: string
          order_index?: number
          palace?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_cue?: string | null
          lat?: number | null
          lng?: number | null
          locus_name?: string
          order_index?: number
          palace?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      metasystems: {
        Row: {
          created_at: string
          id: string
          problem_tag: string | null
          source_chain_id: string | null
          source_subtask_id: string | null
          stages: Json
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          problem_tag?: string | null
          source_chain_id?: string | null
          source_subtask_id?: string | null
          stages?: Json
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          problem_tag?: string | null
          source_chain_id?: string | null
          source_subtask_id?: string | null
          stages?: Json
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metasystems_source_chain_id_fkey"
            columns: ["source_chain_id"]
            isOneToOne: false
            referencedRelation: "operational_chains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metasystems_source_subtask_id_fkey"
            columns: ["source_subtask_id"]
            isOneToOne: false
            referencedRelation: "chain_subtasks"
            referencedColumns: ["id"]
          },
        ]
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
      oficina_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
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
      physical_training_logs: {
        Row: {
          check_date: string
          cold_shower: boolean
          created_at: string
          duration_minutes: number | null
          exercises_done: Json
          id: string
          intensity: number | null
          joint_pain: boolean
          notes: string | null
          pain_notes: string | null
          stretching_done: boolean
          updated_at: string
          user_id: string
          workout_type: string
        }
        Insert: {
          check_date?: string
          cold_shower?: boolean
          created_at?: string
          duration_minutes?: number | null
          exercises_done?: Json
          id?: string
          intensity?: number | null
          joint_pain?: boolean
          notes?: string | null
          pain_notes?: string | null
          stretching_done?: boolean
          updated_at?: string
          user_id: string
          workout_type: string
        }
        Update: {
          check_date?: string
          cold_shower?: boolean
          created_at?: string
          duration_minutes?: number | null
          exercises_done?: Json
          id?: string
          intensity?: number | null
          joint_pain?: boolean
          notes?: string | null
          pain_notes?: string | null
          stretching_done?: boolean
          updated_at?: string
          user_id?: string
          workout_type?: string
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
      reading_blocks: {
        Row: {
          ai_triangulation: string | null
          applied_layer: string | null
          book_id: string
          created_at: string
          critical_layer: string | null
          id: string
          literal_layer: string | null
          page_end: number
          page_start: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_triangulation?: string | null
          applied_layer?: string | null
          book_id: string
          created_at?: string
          critical_layer?: string | null
          id?: string
          literal_layer?: string | null
          page_end: number
          page_start: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_triangulation?: string | null
          applied_layer?: string | null
          book_id?: string
          created_at?: string
          critical_layer?: string | null
          id?: string
          literal_layer?: string | null
          page_end?: number
          page_start?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_blocks_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "reading_books"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_books: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          current_page: number
          id: string
          status: string
          title: string
          total_pages: number
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          current_page?: number
          id?: string
          status?: string
          title: string
          total_pages?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          current_page?: number
          id?: string
          status?: string
          title?: string
          total_pages?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      review_cards: {
        Row: {
          back: string
          created_at: string
          deck: string
          due_at: string
          ease: number
          front: string
          id: string
          interval_days: number
          lapses: number
          reps: number
          source: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          back: string
          created_at?: string
          deck?: string
          due_at?: string
          ease?: number
          front: string
          id?: string
          interval_days?: number
          lapses?: number
          reps?: number
          source?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          back?: string
          created_at?: string
          deck?: string
          due_at?: string
          ease?: number
          front?: string
          id?: string
          interval_days?: number
          lapses?: number
          reps?: number
          source?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shadow_hypotheses: {
        Row: {
          appearances: number
          category: string
          confidence: number
          created_at: string
          description: string | null
          evidence_against: Json
          evidence_for: Json
          first_seen_at: string
          id: string
          last_seen_at: string
          name: string
          related_modules: Json
          related_protocols: Json
          status: string
          trend: string
          triggers: Json
          updated_at: string
          user_id: string
          user_note: string | null
        }
        Insert: {
          appearances?: number
          category: string
          confidence?: number
          created_at?: string
          description?: string | null
          evidence_against?: Json
          evidence_for?: Json
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          name: string
          related_modules?: Json
          related_protocols?: Json
          status?: string
          trend?: string
          triggers?: Json
          updated_at?: string
          user_id: string
          user_note?: string | null
        }
        Update: {
          appearances?: number
          category?: string
          confidence?: number
          created_at?: string
          description?: string | null
          evidence_against?: Json
          evidence_for?: Json
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          name?: string
          related_modules?: Json
          related_protocols?: Json
          status?: string
          trend?: string
          triggers?: Json
          updated_at?: string
          user_id?: string
          user_note?: string | null
        }
        Relationships: []
      }
      system_audits: {
        Row: {
          checklist: Json
          created_at: string
          id: string
          notes: string | null
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          checklist?: Json
          created_at?: string
          id?: string
          notes?: string | null
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          checklist?: Json
          created_at?: string
          id?: string
          notes?: string | null
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trinarius_reflections: {
        Row: {
          answer: string
          created_at: string
          id: string
          mode: string
          question_index: number
          question_text: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer?: string
          created_at?: string
          id?: string
          mode: string
          question_index: number
          question_text: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          mode?: string
          question_index?: number
          question_text?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_data: {
        Row: {
          app_version: string | null
          created_at: string
          data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vocabulary_entries: {
        Row: {
          active_uses: number
          created_at: string
          example: string | null
          exposures: number
          first_seen_at: string
          id: string
          last_exposed_at: string
          level: number
          meaning: string | null
          next_review_at: string
          updated_at: string
          user_id: string
          word: string
        }
        Insert: {
          active_uses?: number
          created_at?: string
          example?: string | null
          exposures?: number
          first_seen_at?: string
          id?: string
          last_exposed_at?: string
          level?: number
          meaning?: string | null
          next_review_at?: string
          updated_at?: string
          user_id: string
          word: string
        }
        Update: {
          active_uses?: number
          created_at?: string
          example?: string | null
          exposures?: number
          first_seen_at?: string
          id?: string
          last_exposed_at?: string
          level?: number
          meaning?: string | null
          next_review_at?: string
          updated_at?: string
          user_id?: string
          word?: string
        }
        Relationships: []
      }
      will_dojo_sessions: {
        Row: {
          category: string
          challenge: string
          completed: boolean
          created_at: string
          discomfort_level: number
          duration_min: number
          id: string
          log_date: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          challenge: string
          completed?: boolean
          created_at?: string
          discomfort_level?: number
          duration_min?: number
          id?: string
          log_date?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          challenge?: string
          completed?: boolean
          created_at?: string
          discomfort_level?: number
          duration_min?: number
          id?: string
          log_date?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
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
