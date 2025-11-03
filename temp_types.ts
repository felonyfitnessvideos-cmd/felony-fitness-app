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
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      body_metrics: {
        Row: {
          body_fat_percentage: number | null
          created_at: string
          id: number
          user_id: string
          weight_lbs: number | null
        }
        Insert: {
          body_fat_percentage?: number | null
          created_at?: string
          id?: never
          user_id: string
          weight_lbs?: number | null
        }
        Update: {
          body_fat_percentage?: number | null
          created_at?: string
          id?: never
          user_id?: string
          weight_lbs?: number | null
        }
        Relationships: []
      }
      cycle_sessions: {
        Row: {
          created_at: string | null
          day_index: number | null
          id: string
          is_complete: boolean
          is_deload: boolean | null
          mesocycle_id: string
          planned_volume_multiplier: number | null
          routine_id: string | null
          scheduled_date: string
          status: string | null
          updated_at: string | null
          user_id: string
          week_index: number
        }
        Insert: {
          created_at?: string | null
          day_index?: number | null
          id?: string
          is_complete?: boolean
          is_deload?: boolean | null
          mesocycle_id: string
          planned_volume_multiplier?: number | null
          routine_id?: string | null
          scheduled_date: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          week_index: number
        }
        Update: {
          created_at?: string | null
          day_index?: number | null
          id?: string
          is_complete?: boolean
          is_deload?: boolean | null
          mesocycle_id?: string
          planned_volume_multiplier?: number | null
          routine_id?: string | null
          scheduled_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          week_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "cycle_sessions_mesocycle_id_fkey"
            columns: ["mesocycle_id"]
            isOneToOne: false
            referencedRelation: "mesocycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_sessions_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "workout_routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          body: string
          created_at: string | null
          id: string
          recipients_count: number | null
          subject: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          recipients_count?: number | null
          subject: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          recipients_count?: number | null
          subject?: string
        }
        Relationships: []
      }
      email_events: {
        Row: {
          campaign_id: string | null
          clicked_url: string | null
          created_at: string | null
          event_type: string
          id: string
          user_email: string
        }
        Insert: {
          campaign_id?: string | null
          clicked_url?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          user_email: string
        }
        Update: {
          campaign_id?: string | null
          clicked_url?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          name: string
          subject: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          name: string
          subject?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      exercise_muscle_groups: {
        Row: {
          exercise_id: string
          muscle_group_id: string
        }
        Insert: {
          exercise_id: string
          muscle_group_id: string
        }
        Update: {
          exercise_id?: string
          muscle_group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_muscle_groups_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_muscle_groups_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category_id: number | null
          description: string | null
          id: string
          muscle_group_id: string | null
          name: string
          thumbnail_url: string | null
          type: Database["public"]["Enums"]["exercise_type"] | null
        }
        Insert: {
          category_id?: number | null
          description?: string | null
          id?: string
          muscle_group_id?: string | null
          name: string
          thumbnail_url?: string | null
          type?: Database["public"]["Enums"]["exercise_type"] | null
        }
        Update: {
          category_id?: number | null
          description?: string | null
          id?: string
          muscle_group_id?: string | null
          name?: string
          thumbnail_url?: string | null
          type?: Database["public"]["Enums"]["exercise_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_muscle_group_id_fkey"
            columns: ["muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      food_servings: {
        Row: {
          calories: number | null
          carbs_g: number | null
          fat_g: number | null
          food_id: number
          id: number
          protein_g: number | null
          serving_description: string
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          food_id: number
          id?: never
          protein_g?: number | null
          serving_description: string
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          food_id?: number
          id?: never
          protein_g?: number | null
          serving_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_servings_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          category: string | null
          data_sources: string[] | null
          enrichment_status: string | null
          id: number
          last_enrichment: string | null
          name: string
          pdcaas_score: number | null
          quality_score: number | null
        }
        Insert: {
          category?: string | null
          data_sources?: string[] | null
          enrichment_status?: string | null
          id?: never
          last_enrichment?: string | null
          name: string
          pdcaas_score?: number | null
          quality_score?: number | null
        }
        Update: {
          category?: string | null
          data_sources?: string[] | null
          enrichment_status?: string | null
          id?: never
          last_enrichment?: string | null
          name?: string
          pdcaas_score?: number | null
          quality_score?: number | null
        }
        Relationships: []
      }
      foods_old: {
        Row: {
          calories_per_serving: number | null
          carbs_g_per_serving: number | null
          fat_g_per_serving: number | null
          food_name: string
          id: string
          pdcaas_score: number | null
          protein_g_per_serving: number | null
        }
        Insert: {
          calories_per_serving?: number | null
          carbs_g_per_serving?: number | null
          fat_g_per_serving?: number | null
          food_name: string
          id?: string
          pdcaas_score?: number | null
          protein_g_per_serving?: number | null
        }
        Update: {
          calories_per_serving?: number | null
          carbs_g_per_serving?: number | null
          fat_g_per_serving?: number | null
          food_name?: string
          id?: string
          pdcaas_score?: number | null
          protein_g_per_serving?: number | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          current_value: number | null
          goal_description: string
          id: string
          target_date: string | null
          target_value: number | null
          user_id: string | null
        }
        Insert: {
          current_value?: number | null
          goal_description: string
          id?: string
          target_date?: string | null
          target_value?: number | null
          user_id?: string | null
        }
        Update: {
          current_value?: number | null
          goal_description?: string
          id?: string
          target_date?: string | null
          target_value?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      macrocycles: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "macrocycles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_foods: {
        Row: {
          created_at: string | null
          food_servings_id: number | null
          id: string
          meal_id: string | null
          notes: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          food_servings_id?: number | null
          id?: string
          meal_id?: string | null
          notes?: string | null
          quantity?: number
        }
        Update: {
          created_at?: string | null
          food_servings_id?: number | null
          id?: string
          meal_id?: string | null
          notes?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_foods_food_servings_id_fkey"
            columns: ["food_servings_id"]
            isOneToOne: false
            referencedRelation: "food_servings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_foods_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_entries: {
        Row: {
          created_at: string | null
          id: string
          is_logged: boolean | null
          logged_at: string | null
          meal_id: string | null
          meal_type: string
          notes: string | null
          plan_date: string
          servings: number | null
          weekly_meal_plan_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_logged?: boolean | null
          logged_at?: string | null
          meal_id?: string | null
          meal_type: string
          notes?: string | null
          plan_date: string
          servings?: number | null
          weekly_meal_plan_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_logged?: boolean | null
          logged_at?: string | null
          meal_id?: string | null
          meal_type?: string
          notes?: string | null
          plan_date?: string
          servings?: number | null
          weekly_meal_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_entries_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_entries_weekly_meal_plan_id_fkey"
            columns: ["weekly_meal_plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          category: string | null
          cook_time: number | null
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          id: string
          image_url: string | null
          instructions: string | null
          is_premade: boolean | null
          name: string
          prep_time: number | null
          serving_size: number | null
          serving_unit: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          cook_time?: number | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_premade?: boolean | null
          name: string
          prep_time?: number | null
          serving_size?: number | null
          serving_unit?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          cook_time?: number | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_premade?: boolean | null
          name?: string
          prep_time?: number | null
          serving_size?: number | null
          serving_unit?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mesocycle_weeks: {
        Row: {
          day_index: number | null
          day_type: string | null
          id: string
          mesocycle_id: string
          notes: string | null
          routine_id: string | null
          session_order: number | null
          week_index: number
        }
        Insert: {
          day_index?: number | null
          day_type?: string | null
          id?: string
          mesocycle_id: string
          notes?: string | null
          routine_id?: string | null
          session_order?: number | null
          week_index: number
        }
        Update: {
          day_index?: number | null
          day_type?: string | null
          id?: string
          mesocycle_id?: string
          notes?: string | null
          routine_id?: string | null
          session_order?: number | null
          week_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "mesocycle_weeks_mesocycle_id_fkey"
            columns: ["mesocycle_id"]
            isOneToOne: false
            referencedRelation: "mesocycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mesocycle_weeks_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "workout_routines"
            referencedColumns: ["id"]
          },
        ]
      }
      mesocycles: {
        Row: {
          created_at: string | null
          end_date: string | null
          focus: string | null
          id: string
          macrocycle_id: string | null
          name: string
          notes: string | null
          start_date: string | null
          updated_at: string | null
          user_id: string
          weeks: number
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          focus?: string | null
          id?: string
          macrocycle_id?: string | null
          name: string
          notes?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id: string
          weeks?: number
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          focus?: string | null
          id?: string
          macrocycle_id?: string | null
          name?: string
          notes?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
          weeks?: number
        }
        Relationships: [
          {
            foreignKeyName: "mesocycles_macrocycle_id_fkey"
            columns: ["macrocycle_id"]
            isOneToOne: false
            referencedRelation: "macrocycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mesocycles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      motivational_quotes: {
        Row: {
          id: number
          quote: string | null
        }
        Insert: {
          id?: number
          quote?: string | null
        }
        Update: {
          id?: number
          quote?: string | null
        }
        Relationships: []
      }
      muscle_groups: {
        Row: {
          id: string
          name: string
          parent_muscle_group_id: string | null
        }
        Insert: {
          id?: string
          name: string
          parent_muscle_group_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          parent_muscle_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "muscle_groups_parent_muscle_group_id_fkey"
            columns: ["parent_muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_queue: {
        Row: {
          created_at: string | null
          data: Json
          error_message: string | null
          id: string
          recipient_id: string
          retry_count: number | null
          scheduled_for: string
          sent_at: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data: Json
          error_message?: string | null
          id?: string
          recipient_id: string
          retry_count?: number | null
          scheduled_for: string
          sent_at?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          error_message?: string | null
          id?: string
          recipient_id?: string
          retry_count?: number | null
          scheduled_for?: string
          sent_at?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      nutrition_enrichment_queue: {
        Row: {
          attempts: number | null
          created_at: string | null
          enrichment_type: string
          error_message: string | null
          food_id: number | null
          id: number
          priority: number | null
          processed_at: string | null
          status: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          enrichment_type?: string
          error_message?: string | null
          food_id?: number | null
          id?: number
          priority?: number | null
          processed_at?: string | null
          status?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          enrichment_type?: string
          error_message?: string | null
          food_id?: number | null
          id?: number
          priority?: number | null
          processed_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_enrichment_queue_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_logs: {
        Row: {
          created_at: string | null
          food_id: number | null
          food_serving_id: number | null
          id: string
          log_date: string | null
          meal_type: string | null
          quantity_consumed: number | null
          user_id: string | null
          water_oz_consumed: number | null
        }
        Insert: {
          created_at?: string | null
          food_id?: number | null
          food_serving_id?: number | null
          id?: string
          log_date?: string | null
          meal_type?: string | null
          quantity_consumed?: number | null
          user_id?: string | null
          water_oz_consumed?: number | null
        }
        Update: {
          created_at?: string | null
          food_id?: number | null
          food_serving_id?: number | null
          id?: string
          log_date?: string | null
          meal_type?: string | null
          quantity_consumed?: number | null
          user_id?: string | null
          water_oz_consumed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_logs_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_logs_food_serving_id_fkey"
            columns: ["food_serving_id"]
            isOneToOne: false
            referencedRelation: "food_servings"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_tips: {
        Row: {
          id: string
          tip_text: string
        }
        Insert: {
          id?: string
          tip_text: string
        }
        Update: {
          id?: string
          tip_text?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          description: string | null
          id: string
          name: string
          price: number | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          price?: number | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      pro_routines: {
        Row: {
          category: Database["public"]["Enums"]["routine_category"] | null
          created_at: string
          description: string | null
          exercises: Json
          id: string
          name: string
          recommended_for:
            | Database["public"]["Enums"]["gender_recommendation"]
            | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["routine_category"] | null
          created_at?: string
          description?: string | null
          exercises: Json
          id?: string
          name: string
          recommended_for?:
            | Database["public"]["Enums"]["gender_recommendation"]
            | null
        }
        Update: {
          category?: Database["public"]["Enums"]["routine_category"] | null
          created_at?: string
          description?: string | null
          exercises?: Json
          id?: string
          name?: string
          recommended_for?:
            | Database["public"]["Enums"]["gender_recommendation"]
            | null
        }
        Relationships: []
      }
      program_routines: {
        Row: {
          created_at: string | null
          day_number: number | null
          description: string | null
          difficulty_level: string | null
          equipment_needed: string[] | null
          estimated_duration_minutes: number | null
          exercises: Json | null
          id: string
          name: string
          program_id: string
          updated_at: string | null
          week_number: number | null
        }
        Insert: {
          created_at?: string | null
          day_number?: number | null
          description?: string | null
          difficulty_level?: string | null
          equipment_needed?: string[] | null
          estimated_duration_minutes?: number | null
          exercises?: Json | null
          id?: string
          name: string
          program_id: string
          updated_at?: string | null
          week_number?: number | null
        }
        Update: {
          created_at?: string | null
          day_number?: number | null
          description?: string | null
          difficulty_level?: string | null
          equipment_needed?: string[] | null
          estimated_duration_minutes?: number | null
          exercises?: Json | null
          id?: string
          name?: string
          program_id?: string
          updated_at?: string | null
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "program_routines_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          estimated_weeks: number | null
          id: string
          is_active: boolean | null
          name: string
          target_muscle_groups: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_weeks?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          target_muscle_groups?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_weeks?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          target_muscle_groups?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          exercise_id: string
          exercise_order: number | null
          reps: string | null
          routine_id: string
          sets: number | null
          target_sets: number | null
        }
        Insert: {
          exercise_id: string
          exercise_order?: number | null
          reps?: string | null
          routine_id: string
          sets?: number | null
          target_sets?: number | null
        }
        Update: {
          exercise_id?: string
          exercise_order?: number | null
          reps?: string | null
          routine_id?: string
          sets?: number | null
          target_sets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_exercises_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "workout_routines"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_routines: {
        Row: {
          client_id: string
          created_at: string | null
          estimated_duration_minutes: number | null
          google_calendar_event_id: string | null
          id: string
          notes: string | null
          reminder_sent: boolean | null
          routine_id: string | null
          routine_name: string
          start_time: string
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          estimated_duration_minutes?: number | null
          google_calendar_event_id?: string | null
          id?: string
          notes?: string | null
          reminder_sent?: boolean | null
          routine_id?: string | null
          routine_name: string
          start_time: string
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          estimated_duration_minutes?: number | null
          google_calendar_event_id?: string | null
          id?: string
          notes?: string | null
          reminder_sent?: boolean | null
          routine_id?: string | null
          routine_name?: string
          start_time?: string
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "program_routines"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_meals: {
        Row: {
          created_at: string | null
          custom_name: string | null
          id: string
          is_favorite: boolean | null
          meal_id: string | null
          notes: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_name?: string | null
          id?: string
          is_favorite?: boolean | null
          meal_id?: string | null
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_name?: string | null
          id?: string
          is_favorite?: boolean | null
          meal_id?: string | null
          notes?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_meals_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          current_plan_id: string | null
          daily_calorie_goal: number | null
          daily_carb_goal: number | null
          daily_fat_goal: number | null
          daily_protein_goal: number | null
          daily_step_goal: number | null
          daily_water_goal_oz: number | null
          diet_preference: string | null
          dob: string | null
          id: string
          sex: string | null
          theme: string | null
        }
        Insert: {
          created_at?: string | null
          current_plan_id?: string | null
          daily_calorie_goal?: number | null
          daily_carb_goal?: number | null
          daily_fat_goal?: number | null
          daily_protein_goal?: number | null
          daily_step_goal?: number | null
          daily_water_goal_oz?: number | null
          diet_preference?: string | null
          dob?: string | null
          id: string
          sex?: string | null
          theme?: string | null
        }
        Update: {
          created_at?: string | null
          current_plan_id?: string | null
          daily_calorie_goal?: number | null
          daily_carb_goal?: number | null
          daily_fat_goal?: number | null
          daily_protein_goal?: number | null
          daily_step_goal?: number | null
          daily_water_goal_oz?: number | null
          diet_preference?: string | null
          dob?: string | null
          id?: string
          sex?: string | null
          theme?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_current_plan_id_fkey"
            columns: ["current_plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tags: {
        Row: {
          tag_id: string
          user_id: string
        }
        Insert: {
          tag_id: string
          user_id: string
        }
        Update: {
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_unsubscribed: boolean | null
          phone_number: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_unsubscribed?: boolean | null
          phone_number?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_unsubscribed?: boolean | null
          phone_number?: string | null
        }
        Relationships: []
      }
      weekly_meal_plans: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          start_date: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          start_date: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          start_date?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      workout_log_entries: {
        Row: {
          created_at: string | null
          exercise_id: string | null
          id: string
          log_id: string | null
          notes: string | null
          reps_completed: number | null
          set_number: number
          weight_lifted_lbs: number | null
        }
        Insert: {
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          log_id?: string | null
          notes?: string | null
          reps_completed?: number | null
          set_number: number
          weight_lifted_lbs?: number | null
        }
        Update: {
          created_at?: string | null
          exercise_id?: string | null
          id?: string
          log_id?: string | null
          notes?: string | null
          reps_completed?: number | null
          set_number?: number
          weight_lifted_lbs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_log_entries_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_log_entries_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          calories_burned: number | null
          created_at: string
          cycle_session_id: string | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          is_complete: boolean | null
          log_date: string | null
          notes: string | null
          routine_id: string | null
          user_id: string | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          cycle_session_id?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          is_complete?: boolean | null
          log_date?: string | null
          notes?: string | null
          routine_id?: string | null
          user_id?: string | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          cycle_session_id?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          is_complete?: boolean | null
          log_date?: string | null
          notes?: string | null
          routine_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_cycle_session_fkey"
            columns: ["cycle_session_id"]
            isOneToOne: false
            referencedRelation: "cycle_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "workout_routines"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_routines: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          routine_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          routine_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          routine_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_nutrition_log_details: {
        Row: {
          created_at: string | null
          food_name: string | null
          id: string | null
          meal_type: string | null
          pdcaas_score: number | null
          quantity_consumed: number | null
          serving_description: string | null
          total_calories: number | null
          total_protein: number | null
          user_id: string | null
          water_oz_consumed: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_exercise_to_log: {
        Args: {
          p_exercise_id?: number
          p_external_exercise?: Json
          p_reps: number
          p_sets: number
          p_user_id: string
          p_weight_lbs: number
          p_workout_log_id: number
        }
        Returns: undefined
      }
      calculate_daily_1rm: {
        Args: { p_user_id: string }
        Returns: {
          log_date: string
          muscle_group: string
          value: number
        }[]
      }
      calculate_daily_set_volume: {
        Args: { p_user_id: string }
        Returns: {
          log_date: string
          muscle_group: string
          value: number
        }[]
      }
      calculate_daily_weight_volume: {
        Args: { p_user_id: string }
        Returns: {
          log_date: string
          muscle_group: string
          value: number
        }[]
      }
      calculate_exercise_1rm: {
        Args: { p_exercise_id: string; p_user_id: string }
        Returns: {
          log_date: string
          value: number
        }[]
      }
      calculate_exercise_set_volume: {
        Args: { p_exercise_id: string; p_user_id: string }
        Returns: {
          log_date: string
          value: number
        }[]
      }
      calculate_exercise_weight_volume: {
        Args: { p_exercise_id: string; p_user_id: string }
        Returns: {
          log_date: string
          value: number
        }[]
      }
      cleanup_old_notifications: { Args: never; Returns: number }
      copy_pro_routine_to_user: {
        Args: { p_pro_routine_id: string }
        Returns: string
      }
      delete_workout_set: { Args: { p_entry_id: string }; Returns: undefined }
      find_duplicate_foods: {
        Args: { search_name: string; similarity_threshold?: number }
        Returns: {
          food_id: number
          food_name: string
          similarity_score: number
        }[]
      }
      get_daily_meal_plan_nutrition: {
        Args: { plan_uuid: string; target_date: string }
        Returns: {
          calories: number
          carbs: number
          fat: number
          fiber: number
          protein: number
          sugar: number
        }[]
      }
      get_daily_nutrition_totals: {
        Args: { p_date: string; p_user_id: string }
        Returns: {
          total_calories: number
          total_carbs: number
          total_fat: number
          total_protein: number
          total_water: number
        }[]
      }
      get_enrichment_status: {
        Args: never
        Returns: {
          avg_priority: number
          count: number
          status: string
        }[]
      }
      get_entries_for_last_session:
        | {
            Args: {
              p_exercise_id: string
              p_routine_id: string
              p_user_id: string
            }
            Returns: {
              created_at: string | null
              exercise_id: string | null
              id: string
              log_id: string | null
              notes: string | null
              reps_completed: number | null
              set_number: number
              weight_lifted_lbs: number | null
            }[]
            SetofOptions: {
              from: "*"
              to: "workout_log_entries"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: { p_exercise_id: string; p_user_id: string }
            Returns: {
              reps_completed: number
              set_number: number
              weight_lifted_lbs: number
            }[]
          }
      get_last_workout_for_exercises: {
        Args: { p_exercise_ids: string[]; p_user_id: string }
        Returns: {
          exercise_id: string
          reps_completed: number
          set_number: number
          weight_lifted_lbs: number
        }[]
      }
      get_meal_nutrition: {
        Args: { meal_uuid: string }
        Returns: {
          calories: number
          carbs: number
          fat: number
          fiber: number
          protein: number
          sugar: number
        }[]
      }
      get_random_quote: {
        Args: never
        Returns: {
          quote: string
        }[]
      }
      get_random_tip: {
        Args: never
        Returns: {
          tip_text: string
        }[]
      }
      get_todays_latest_workout: {
        Args: { p_user_id: string }
        Returns: {
          calories_burned: number
          duration_minutes: number
          notes: string
        }[]
      }
      log_food_item: {
        Args: {
          p_external_food?: Json
          p_food_serving_id?: number
          p_meal_type?: string
          p_quantity_consumed?: number
          p_user_id: string
        }
        Returns: Json
      }
      process_enrichment_queue: {
        Args: { batch_size?: number }
        Returns: {
          error_count: number
          message: string
          processed_count: number
          success_count: number
        }[]
      }
      replace_routine_exercises: {
        Args: { p_items: Json; p_name: string; p_routine_id: string }
        Returns: undefined
      }
      retry_failed_enrichments: { Args: never; Returns: number }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      suggest_food_category: { Args: { food_name: string }; Returns: string }
      test_routine_reminders: {
        Args: never
        Returns: {
          notification_created: boolean
          routine_id: string
          routine_name: string
          start_time: string
        }[]
      }
      trigger_routine_reminders: { Args: never; Returns: undefined }
      update_workout_set: {
        Args: { p_entry_id: string; p_reps: number; p_weight: number }
        Returns: undefined
      }
      validate_nutrition_data: { Args: { food_data: Json }; Returns: Json }
    }
    Enums: {
      exercise_type: "Strength" | "Cardio" | "Flexibility"
      gender_recommendation: "Male" | "Female" | "Unisex"
      routine_category:
        | "Strength"
        | "Hypertrophy"
        | "Endurance"
        | "Challenges"
        | "Interval"
        | "Bodyweight Beast"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      exercise_type: ["Strength", "Cardio", "Flexibility"],
      gender_recommendation: ["Male", "Female", "Unisex"],
      routine_category: [
        "Strength",
        "Hypertrophy",
        "Endurance",
        "Challenges",
        "Interval",
        "Bodyweight Beast",
      ],
    },
  },
} as const
