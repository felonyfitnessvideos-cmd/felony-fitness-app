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
  public: {
    Tables: {
      body_metrics: {
        Row: {
          body_fat_percentage: number | null
          created_at: string | null
          id: string
          measurement_date: string | null
          muscle_mass_lbs: number | null
          notes: string | null
          user_id: string | null
          weight_lbs: number | null
        }
        Insert: {
          body_fat_percentage?: number | null
          created_at?: string | null
          id?: string
          measurement_date?: string | null
          muscle_mass_lbs?: number | null
          notes?: string | null
          user_id?: string | null
          weight_lbs?: number | null
        }
        Update: {
          body_fat_percentage?: number | null
          created_at?: string | null
          id?: string
          measurement_date?: string | null
          muscle_mass_lbs?: number | null
          notes?: string | null
          user_id?: string | null
          weight_lbs?: number | null
        }
        Relationships: []
      }
      bug_report_replies: {
        Row: {
          bug_report_id: string
          created_at: string | null
          id: string
          is_admin_reply: boolean | null
          message_text: string
          user_id: string
        }
        Insert: {
          bug_report_id: string
          created_at?: string | null
          id?: string
          is_admin_reply?: boolean | null
          message_text: string
          user_id: string
        }
        Update: {
          bug_report_id?: string
          created_at?: string | null
          id?: string
          is_admin_reply?: boolean | null
          message_text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bug_report_replies_bug_report_id_fkey"
            columns: ["bug_report_id"]
            isOneToOne: false
            referencedRelation: "bug_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      bug_reports: {
        Row: {
          admin_notes: string | null
          browser_info: Json | null
          category: string | null
          created_at: string | null
          id: string
          message_text: string
          priority: string | null
          resolved_at: string | null
          resolved_by: string | null
          screenshot_url: string | null
          status: string
          ticket_id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          browser_info?: Json | null
          category?: string | null
          created_at?: string | null
          id?: string
          message_text: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          screenshot_url?: string | null
          status?: string
          ticket_id?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          browser_info?: Json | null
          category?: string | null
          created_at?: string | null
          id?: string
          message_text?: string
          priority?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          screenshot_url?: string | null
          status?: string
          ticket_id?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cycle_sessions: {
        Row: {
          actual_date: string | null
          created_at: string | null
          day_index: number | null
          id: string
          is_complete: boolean | null
          is_deload: boolean | null
          mesocycle_id: string | null
          planned_intensity: number | null
          planned_volume_multiplier: number | null
          routine_id: string | null
          scheduled_date: string
          session_type: string | null
          updated_at: string | null
          user_id: string | null
          week_index: number | null
        }
        Insert: {
          actual_date?: string | null
          created_at?: string | null
          day_index?: number | null
          id?: string
          is_complete?: boolean | null
          is_deload?: boolean | null
          mesocycle_id?: string | null
          planned_intensity?: number | null
          planned_volume_multiplier?: number | null
          routine_id?: string | null
          scheduled_date: string
          session_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          week_index?: number | null
        }
        Update: {
          actual_date?: string | null
          created_at?: string | null
          day_index?: number | null
          id?: string
          is_complete?: boolean | null
          is_deload?: boolean | null
          mesocycle_id?: string | null
          planned_intensity?: number | null
          planned_volume_multiplier?: number | null
          routine_id?: string | null
          scheduled_date?: string
          session_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          week_index?: number | null
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
        ]
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string | null
          needs_response: boolean | null
          read_at: string | null
          recipient_id: string | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          needs_response?: boolean | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          needs_response?: boolean | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
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
          recipients_count: number
          subject: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          recipients_count?: number
          subject: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          recipients_count?: number
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
          user_email: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_url?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          user_email?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_url?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          user_email?: string | null
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
          body: string
          created_at: string | null
          id: string
          name: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          name: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          name?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          equipment_needed: string | null
          exercise_type: string | null
          id: string
          instructions: string | null
          name: string
          primary_muscle: string | null
          secondary_muscle: string | null
          tertiary_muscle: string | null
          thumbnail_url: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          equipment_needed?: string | null
          exercise_type?: string | null
          id?: string
          instructions?: string | null
          name: string
          primary_muscle?: string | null
          secondary_muscle?: string | null
          tertiary_muscle?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          equipment_needed?: string | null
          exercise_type?: string | null
          id?: string
          instructions?: string | null
          name?: string
          primary_muscle?: string | null
          secondary_muscle?: string | null
          tertiary_muscle?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      food_servings: {
        Row: {
          brand: string | null
          calcium_mg: number | null
          calories: number | null
          carbs_g: number | null
          category: string | null
          copper_mg: number | null
          created_at: string | null
          data_sources: string | null
          enrichment_status: string | null
          fat_g: number | null
          fiber_g: number | null
          folate_mcg: number | null
          food_name: string
          id: string
          iron_mg: number | null
          is_verified: boolean | null
          last_enrichment: string | null
          magnesium_mg: number | null
          niacin_mg: number | null
          pdcaas_score: number | null
          phosphorus_mg: number | null
          potassium_mg: number | null
          protein_g: number | null
          quality_score: number | null
          riboflavin_mg: number | null
          selenium_mcg: number | null
          serving_description: string | null
          sodium_mg: number | null
          source: string | null
          sugar_g: number | null
          thiamin_mg: number | null
          updated_at: string | null
          vitamin_a_mcg: number | null
          vitamin_b12_mcg: number | null
          vitamin_b6_mg: number | null
          vitamin_c_mg: number | null
          vitamin_e_mg: number | null
          vitamin_k_mcg: number | null
          zinc_mg: number | null
        }
        Insert: {
          brand?: string | null
          calcium_mg?: number | null
          calories?: number | null
          carbs_g?: number | null
          category?: string | null
          copper_mg?: number | null
          created_at?: string | null
          data_sources?: string | null
          enrichment_status?: string | null
          fat_g?: number | null
          fiber_g?: number | null
          folate_mcg?: number | null
          food_name: string
          id?: string
          iron_mg?: number | null
          is_verified?: boolean | null
          last_enrichment?: string | null
          magnesium_mg?: number | null
          niacin_mg?: number | null
          pdcaas_score?: number | null
          phosphorus_mg?: number | null
          potassium_mg?: number | null
          protein_g?: number | null
          quality_score?: number | null
          riboflavin_mg?: number | null
          selenium_mcg?: number | null
          serving_description?: string | null
          sodium_mg?: number | null
          source?: string | null
          sugar_g?: number | null
          thiamin_mg?: number | null
          updated_at?: string | null
          vitamin_a_mcg?: number | null
          vitamin_b12_mcg?: number | null
          vitamin_b6_mg?: number | null
          vitamin_c_mg?: number | null
          vitamin_e_mg?: number | null
          vitamin_k_mcg?: number | null
          zinc_mg?: number | null
        }
        Update: {
          brand?: string | null
          calcium_mg?: number | null
          calories?: number | null
          carbs_g?: number | null
          category?: string | null
          copper_mg?: number | null
          created_at?: string | null
          data_sources?: string | null
          enrichment_status?: string | null
          fat_g?: number | null
          fiber_g?: number | null
          folate_mcg?: number | null
          food_name?: string
          id?: string
          iron_mg?: number | null
          is_verified?: boolean | null
          last_enrichment?: string | null
          magnesium_mg?: number | null
          niacin_mg?: number | null
          pdcaas_score?: number | null
          phosphorus_mg?: number | null
          potassium_mg?: number | null
          protein_g?: number | null
          quality_score?: number | null
          riboflavin_mg?: number | null
          selenium_mcg?: number | null
          serving_description?: string | null
          sodium_mg?: number | null
          source?: string | null
          sugar_g?: number | null
          thiamin_mg?: number | null
          updated_at?: string | null
          vitamin_a_mcg?: number | null
          vitamin_b12_mcg?: number | null
          vitamin_b6_mg?: number | null
          vitamin_c_mg?: number | null
          vitamin_e_mg?: number | null
          vitamin_k_mcg?: number | null
          zinc_mg?: number | null
        }
        Relationships: []
      }
      foods: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string | null
          data_sources: string | null
          enrichment_status: string | null
          id: string
          last_enrichment: string | null
          name: string
          quality_score: number | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string | null
          data_sources?: string | null
          enrichment_status?: string | null
          id?: string
          last_enrichment?: string | null
          name: string
          quality_score?: number | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string | null
          data_sources?: string | null
          enrichment_status?: string | null
          id?: string
          last_enrichment?: string | null
          name?: string
          quality_score?: number | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          goal_description: string | null
          id: string
          isWeightGoal: boolean | null
          notes: string | null
          status: string | null
          target_date: string | null
          target_value: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          goal_description?: string | null
          id?: string
          isWeightGoal?: boolean | null
          notes?: string | null
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          goal_description?: string | null
          id?: string
          isWeightGoal?: boolean | null
          notes?: string | null
          status?: string | null
          target_date?: string | null
          target_value?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      meal_foods: {
        Row: {
          created_at: string | null
          food_servings_id: string | null
          id: string
          meal_id: string | null
          notes: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          food_servings_id?: string | null
          id?: string
          meal_id?: string | null
          notes?: string | null
          quantity?: number
        }
        Update: {
          created_at?: string | null
          food_servings_id?: string | null
          id?: string
          meal_id?: string | null
          notes?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_foods_food_serving_id_fkey"
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
      meals: {
        Row: {
          category: string | null
          cook_time_minutes: number | null
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          id: string
          image_url: string | null
          instructions: string | null
          is_favorite: boolean | null
          is_premade: boolean | null
          is_public: boolean | null
          name: string
          prep_time_minutes: number | null
          serving_size: number | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          cook_time_minutes?: number | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_favorite?: boolean | null
          is_premade?: boolean | null
          is_public?: boolean | null
          name: string
          prep_time_minutes?: number | null
          serving_size?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          cook_time_minutes?: number | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_favorite?: boolean | null
          is_premade?: boolean | null
          is_public?: boolean | null
          name?: string
          prep_time_minutes?: number | null
          serving_size?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mesocycle_weeks: {
        Row: {
          created_at: string | null
          day_index: number | null
          deload: boolean | null
          id: string
          mesocycle_id: string | null
          notes: string | null
          routine_id: string | null
          session_order: number | null
          week_index: number | null
        }
        Insert: {
          created_at?: string | null
          day_index?: number | null
          deload?: boolean | null
          id?: string
          mesocycle_id?: string | null
          notes?: string | null
          routine_id?: string | null
          session_order?: number | null
          week_index?: number | null
        }
        Update: {
          created_at?: string | null
          day_index?: number | null
          deload?: boolean | null
          id?: string
          mesocycle_id?: string | null
          notes?: string | null
          routine_id?: string | null
          session_order?: number | null
          week_index?: number | null
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
          description: string | null
          end_date: string | null
          focus: string | null
          id: string
          is_active: boolean | null
          is_complete: boolean | null
          name: string
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          weeks: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          focus?: string | null
          id?: string
          is_active?: boolean | null
          is_complete?: boolean | null
          name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          weeks?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          focus?: string | null
          id?: string
          is_active?: boolean | null
          is_complete?: boolean | null
          name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          weeks?: number | null
        }
        Relationships: []
      }
      muscle_groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          primary_muscle: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          primary_muscle?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          primary_muscle?: string | null
        }
        Relationships: []
      }
      nutrition_enrichment_queue: {
        Row: {
          changes_made: Json | null
          completed_at: string | null
          created_at: string | null
          enrichment_type: string | null
          error_message: string | null
          food_id: string
          id: string
          priority: number | null
          quality_score_after: number | null
          quality_score_before: number | null
          retry_count: number | null
          started_at: string | null
          status: string
        }
        Insert: {
          changes_made?: Json | null
          completed_at?: string | null
          created_at?: string | null
          enrichment_type?: string | null
          error_message?: string | null
          food_id: string
          id?: string
          priority?: number | null
          quality_score_after?: number | null
          quality_score_before?: number | null
          retry_count?: number | null
          started_at?: string | null
          status?: string
        }
        Update: {
          changes_made?: Json | null
          completed_at?: string | null
          created_at?: string | null
          enrichment_type?: string | null
          error_message?: string | null
          food_id?: string
          id?: string
          priority?: number | null
          quality_score_after?: number | null
          quality_score_before?: number | null
          retry_count?: number | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_enrichment_queue_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "food_servings"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_logs: {
        Row: {
          calories: number | null
          carbs_g: number | null
          created_at: string | null
          fat_g: number | null
          food_serving_id: string | null
          id: string
          log_date: string | null
          meal_type: string | null
          notes: string | null
          protein_g: number | null
          quantity_consumed: number | null
          user_id: string | null
          water_oz_consumed: number | null
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string | null
          fat_g?: number | null
          food_serving_id?: string | null
          id?: string
          log_date?: string | null
          meal_type?: string | null
          notes?: string | null
          protein_g?: number | null
          quantity_consumed?: number | null
          user_id?: string | null
          water_oz_consumed?: number | null
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string | null
          fat_g?: number | null
          food_serving_id?: string | null
          id?: string
          log_date?: string | null
          meal_type?: string | null
          notes?: string | null
          protein_g?: number | null
          quantity_consumed?: number | null
          user_id?: string | null
          water_oz_consumed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_logs_food_serving_id_fkey"
            columns: ["food_serving_id"]
            isOneToOne: false
            referencedRelation: "food_servings"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_pipeline_status: {
        Row: {
          average_quality_score: number | null
          completed_today: number | null
          failed_today: number | null
          foods_below_threshold: number | null
          id: string
          last_enrichment_run: string | null
          last_updated: string | null
          processing_count: number | null
          queue_size: number | null
          total_enriched: number | null
          total_foods: number | null
          total_pending: number | null
          total_verified: number | null
        }
        Insert: {
          average_quality_score?: number | null
          completed_today?: number | null
          failed_today?: number | null
          foods_below_threshold?: number | null
          id?: string
          last_enrichment_run?: string | null
          last_updated?: string | null
          processing_count?: number | null
          queue_size?: number | null
          total_enriched?: number | null
          total_foods?: number | null
          total_pending?: number | null
          total_verified?: number | null
        }
        Update: {
          average_quality_score?: number | null
          completed_today?: number | null
          failed_today?: number | null
          foods_below_threshold?: number | null
          id?: string
          last_enrichment_run?: string | null
          last_updated?: string | null
          processing_count?: number | null
          queue_size?: number | null
          total_enriched?: number | null
          total_foods?: number | null
          total_pending?: number | null
          total_verified?: number | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          id: number
          plan_name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          plan_name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          plan_name?: string | null
        }
        Relationships: []
      }
      pro_routines: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          estimated_duration_minutes: number | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string | null
          routine_name: string | null
          routine_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_minutes?: number | null
          id: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string | null
          routine_name?: string | null
          routine_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string | null
          routine_name?: string | null
          routine_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          estimated_weeks: number | null
          exercise_pool: Json | null
          id: string
          is_active: boolean | null
          is_template: boolean | null
          name: string | null
          program_type: string | null
          target_muscle_groups: string[] | null
          trainer_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_weeks?: number | null
          exercise_pool?: Json | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          name?: string | null
          program_type?: string | null
          target_muscle_groups?: string[] | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_weeks?: number | null
          exercise_pool?: Json | null
          id?: string
          is_active?: boolean | null
          is_template?: boolean | null
          name?: string | null
          program_type?: string | null
          target_muscle_groups?: string[] | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      routine_exercises: {
        Row: {
          created_at: string | null
          exercise_id: string | null
          exercise_order: number
          id: string
          is_warmup: boolean | null
          notes: string | null
          reps: string | null
          rest_seconds: number | null
          routine_id: string | null
          sets: number | null
          target_intensity_pct: number | null
          target_reps: string | null
          target_sets: number
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          exercise_id?: string | null
          exercise_order?: number
          id?: string
          is_warmup?: boolean | null
          notes?: string | null
          reps?: string | null
          rest_seconds?: number | null
          routine_id?: string | null
          sets?: number | null
          target_intensity_pct?: number | null
          target_reps?: string | null
          target_sets?: number
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          exercise_id?: string | null
          exercise_order?: number
          id?: string
          is_warmup?: boolean | null
          notes?: string | null
          reps?: string | null
          rest_seconds?: number | null
          routine_id?: string | null
          sets?: number | null
          target_intensity_pct?: number | null
          target_reps?: string | null
          target_sets?: number
          weight_kg?: number | null
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
          client_email: string | null
          client_name: string | null
          completed_at: string | null
          created_at: string | null
          duration_minutes: number | null
          google_event_id: string | null
          id: string
          is_completed: boolean | null
          is_recurring: boolean | null
          notes: string | null
          recurrence_end_date: string | null
          recurrence_rule: string | null
          routine_id: string
          scheduled_date: string
          scheduled_time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          google_event_id?: string | null
          id?: string
          is_completed?: boolean | null
          is_recurring?: boolean | null
          notes?: string | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          routine_id: string
          scheduled_date: string
          scheduled_time?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          google_event_id?: string | null
          id?: string
          is_completed?: boolean | null
          is_recurring?: boolean | null
          notes?: string | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          routine_id?: string
          scheduled_date?: string
          scheduled_time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_routines_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "workout_routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_routines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      trainer_clients: {
        Row: {
          assigned_program_id: string | null
          client_id: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          generated_routine_ids: string[] | null
          id: string
          is_unsubscribed: boolean | null
          notes: string | null
          program_name: string | null
          status: string | null
          tags: string[] | null
          trainer_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_program_id?: string | null
          client_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          generated_routine_ids?: string[] | null
          id?: string
          is_unsubscribed?: boolean | null
          notes?: string | null
          program_name?: string | null
          status?: string | null
          tags?: string[] | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_program_id?: string | null
          client_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          generated_routine_ids?: string[] | null
          id?: string
          is_unsubscribed?: boolean | null
          notes?: string | null
          program_name?: string | null
          status?: string | null
          tags?: string[] | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_clients_assigned_program_id_fkey"
            columns: ["assigned_program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_clients_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_email_templates: {
        Row: {
          body: string
          created_at: string | null
          id: string
          name: string
          subject: string
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          name: string
          subject: string
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          name?: string
          subject?: string
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trainer_group_tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_meal_foods: {
        Row: {
          created_at: string | null
          food_servings_id: string | null
          id: string
          notes: string | null
          quantity: number
          user_meal_id: string
        }
        Insert: {
          created_at?: string | null
          food_servings_id?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          user_meal_id: string
        }
        Update: {
          created_at?: string | null
          food_servings_id?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          user_meal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_meal_foods_food_servings_id_fkey"
            columns: ["food_servings_id"]
            isOneToOne: false
            referencedRelation: "food_servings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_meal_foods_user_meal_id_fkey"
            columns: ["user_meal_id"]
            isOneToOne: false
            referencedRelation: "user_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_meals: {
        Row: {
          category: string | null
          cook_time_minutes: number | null
          created_at: string | null
          custom_name: string | null
          description: string | null
          difficulty_level: number | null
          id: string
          image_url: string | null
          instructions: string | null
          is_favorite: boolean | null
          meal_id: string | null
          name: string
          prep_time_minutes: number | null
          serving_size: number | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          cook_time_minutes?: number | null
          created_at?: string | null
          custom_name?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_favorite?: boolean | null
          meal_id?: string | null
          name?: string
          prep_time_minutes?: number | null
          serving_size?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          cook_time_minutes?: number | null
          created_at?: string | null
          custom_name?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          is_favorite?: boolean | null
          meal_id?: string | null
          name?: string
          prep_time_minutes?: number | null
          serving_size?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          activity_level: string | null
          address: string | null
          city: string | null
          created_at: string | null
          current_weight_lbs: number | null
          daily_calorie_goal: number | null
          daily_carb_goal: number | null
          daily_carb_goal_g: number | null
          daily_fat_goal: number | null
          daily_fat_goal_g: number | null
          daily_protein_goal: number | null
          daily_protein_goal_g: number | null
          daily_water_goal: number | null
          daily_water_goal_oz: number | null
          date_of_birth: string | null
          diet_preference: string | null
          email: string | null
          first_name: string | null
          fitness_goal: string | null
          height_cm: number | null
          id: string
          is_admin: boolean | null
          is_beta: boolean | null
          is_client: boolean | null
          is_trainer: boolean | null
          last_name: string | null
          phone: string | null
          plan_type: number | null
          sex: string | null
          state: string | null
          target_weight_lbs: number | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
          weight_lbs: number | null
          zip_code: string | null
        }
        Insert: {
          activity_level?: string | null
          address?: string | null
          city?: string | null
          created_at?: string | null
          current_weight_lbs?: number | null
          daily_calorie_goal?: number | null
          daily_carb_goal?: number | null
          daily_carb_goal_g?: number | null
          daily_fat_goal?: number | null
          daily_fat_goal_g?: number | null
          daily_protein_goal?: number | null
          daily_protein_goal_g?: number | null
          daily_water_goal?: number | null
          daily_water_goal_oz?: number | null
          date_of_birth?: string | null
          diet_preference?: string | null
          email?: string | null
          first_name?: string | null
          fitness_goal?: string | null
          height_cm?: number | null
          id: string
          is_admin?: boolean | null
          is_beta?: boolean | null
          is_client?: boolean | null
          is_trainer?: boolean | null
          last_name?: string | null
          phone?: string | null
          plan_type?: number | null
          sex?: string | null
          state?: string | null
          target_weight_lbs?: number | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight_lbs?: number | null
          zip_code?: string | null
        }
        Update: {
          activity_level?: string | null
          address?: string | null
          city?: string | null
          created_at?: string | null
          current_weight_lbs?: number | null
          daily_calorie_goal?: number | null
          daily_carb_goal?: number | null
          daily_carb_goal_g?: number | null
          daily_fat_goal?: number | null
          daily_fat_goal_g?: number | null
          daily_protein_goal?: number | null
          daily_protein_goal_g?: number | null
          daily_water_goal?: number | null
          daily_water_goal_oz?: number | null
          date_of_birth?: string | null
          diet_preference?: string | null
          email?: string | null
          first_name?: string | null
          fitness_goal?: string | null
          height_cm?: number | null
          id?: string
          is_admin?: boolean | null
          is_beta?: boolean | null
          is_client?: boolean | null
          is_trainer?: boolean | null
          last_name?: string | null
          phone?: string | null
          plan_type?: number | null
          sex?: string | null
          state?: string | null
          target_weight_lbs?: number | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight_lbs?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_plan_type_fkey"
            columns: ["plan_type"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tags: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          tag_id: string | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          tag_id?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          tag_id?: string | null
          user_id?: string | null
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
          email: string | null
          full_name: string | null
          id: string
          is_unsubscribed: boolean | null
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_unsubscribed?: boolean | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_unsubscribed?: boolean | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      weekly_meal_plan_entries: {
        Row: {
          created_at: string | null
          id: string
          meal_id: string
          meal_type: string
          notes: string | null
          plan_date: string
          plan_id: string
          servings: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meal_id: string
          meal_type: string
          notes?: string | null
          plan_date: string
          plan_id: string
          servings?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meal_id?: string
          meal_type?: string
          notes?: string | null
          plan_date?: string
          plan_id?: string
          servings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_meal_plan_entries_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_meal_plan_entries_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_meal_plans: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_log_entries: {
        Row: {
          completed: boolean | null
          created_at: string | null
          distance_meters: number | null
          duration_seconds: number | null
          exercise_id: string | null
          id: string
          log_id: string | null
          notes: string | null
          reps: number | null
          reps_completed: number | null
          rpe_rating: number | null
          set_number: number
          weight_lbs: number | null
          weight_lifted_kg: number | null
          workout_log_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_id?: string | null
          id?: string
          log_id?: string | null
          notes?: string | null
          reps?: number | null
          reps_completed?: number | null
          rpe_rating?: number | null
          set_number: number
          weight_lbs?: number | null
          weight_lifted_kg?: number | null
          workout_log_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_id?: string | null
          id?: string
          log_id?: string | null
          notes?: string | null
          reps?: number | null
          reps_completed?: number | null
          rpe_rating?: number | null
          set_number?: number
          weight_lbs?: number | null
          weight_lifted_kg?: number | null
          workout_log_id?: string | null
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
            foreignKeyName: "workout_log_entries_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          calories_burned: number | null
          created_at: string | null
          cycle_session_id: string | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          is_complete: boolean | null
          log_date: string
          mood_rating: number | null
          notes: string | null
          routine_id: string | null
          started_at: string | null
          total_reps: number | null
          total_volume_kg: number | null
          user_id: string | null
          workout_name: string | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string | null
          cycle_session_id?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          is_complete?: boolean | null
          log_date?: string
          mood_rating?: number | null
          notes?: string | null
          routine_id?: string | null
          started_at?: string | null
          total_reps?: number | null
          total_volume_kg?: number | null
          user_id?: string | null
          workout_name?: string | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string | null
          cycle_session_id?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          is_complete?: boolean | null
          log_date?: string
          mood_rating?: number | null
          notes?: string | null
          routine_id?: string | null
          started_at?: string | null
          total_reps?: number | null
          total_volume_kg?: number | null
          user_id?: string | null
          workout_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_cycle_session_id_fkey"
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
          description: string | null
          difficulty_level: string | null
          estimated_duration_minutes: number | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string | null
          routine_name: string
          routine_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string | null
          routine_name: string
          routine_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string | null
          routine_name?: string
          routine_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_tag_to_client: {
        Args: { p_client_id: string; p_tag_id: string }
        Returns: boolean
      }
      get_clients_by_tag: {
        Args: { p_tag_id: string }
        Returns: {
          client_id: string
          email: string
          full_name: string
          tags: string[]
        }[]
      }
      get_conversations: {
        Args: never
        Returns: {
          conversation_user_id: string
          conversation_user_name: string
          is_trainer: boolean
          last_message: string
          last_message_time: string
          unread_count: number
        }[]
      }
      get_enrichment_status: {
        Args: never
        Returns: {
          avg_quality_after: number
          avg_quality_before: number
          count: number
          status: string
          total_improvements: number
        }[]
      }
      get_quality_distribution: {
        Args: never
        Returns: {
          count: number
          percentage: number
          quality_range: string
        }[]
      }
      get_random_tip: {
        Args: never
        Returns: {
          category: string
          tip: string
        }[]
      }
      get_user_tags: {
        Args: { target_user_id?: string }
        Returns: {
          assigned_at: string
          assigned_by: string
          tag_color: string
          tag_description: string
          tag_id: string
          tag_name: string
        }[]
      }
      log_food_item: {
        Args: {
          p_external_food?: Json
          p_food_serving_id?: string
          p_log_date?: string
          p_meal_type?: string
          p_quantity_consumed?: number
          p_user_id?: string
        }
        Returns: Json
      }
      refresh_pipeline_status: { Args: never; Returns: undefined }
      remove_tag_from_client: {
        Args: { p_client_id: string; p_tag_id: string }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unsubscribe_from_trainer_emails: {
        Args: { p_email: string }
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
