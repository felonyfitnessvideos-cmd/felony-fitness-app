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
      cycle_sessions: {
        Row: {
          actual_date: string | null
          created_at: string | null
          day_index: number | null
          id: string
          is_complete: boolean | null
          mesocycle_id: string | null
          planned_intensity: number | null
          routine_id: string | null
          scheduled_date: string
          session_type: string | null
          updated_at: string | null
          user_id: string | null
          week_index: number
        }
        Insert: {
          actual_date?: string | null
          created_at?: string | null
          day_index?: number | null
          id?: string
          is_complete?: boolean | null
          mesocycle_id?: string | null
          planned_intensity?: number | null
          routine_id?: string | null
          scheduled_date: string
          session_type?: string | null
          updated_at?: string | null
          user_id?: string | null
          week_index: number
        }
        Update: {
          actual_date?: string | null
          created_at?: string | null
          day_index?: number | null
          id?: string
          is_complete?: boolean | null
          mesocycle_id?: string | null
          planned_intensity?: number | null
          routine_id?: string | null
          scheduled_date?: string
          session_type?: string | null
          updated_at?: string | null
          user_id?: string | null
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
        ]
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          message_type: string | null
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
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      exercise_muscle_groups: {
        Row: {
          exercise_id: string
          involvement_type: string | null
          muscle_group_id: string
        }
        Insert: {
          exercise_id: string
          involvement_type?: string | null
          muscle_group_id: string
        }
        Update: {
          exercise_id?: string
          involvement_type?: string | null
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
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          equipment: string | null
          exercise_type: string | null
          id: string
          instructions: string | null
          is_bodyweight: boolean | null
          name: string
          primary_muscle_group_id: string | null
          secondary_muscle_group_id: string | null
          tertiary_muscle_group_id: string | null
          thumbnail_url: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          equipment?: string | null
          exercise_type?: string | null
          id?: string
          instructions?: string | null
          is_bodyweight?: boolean | null
          name: string
          primary_muscle_group_id?: string | null
          secondary_muscle_group_id?: string | null
          tertiary_muscle_group_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          equipment?: string | null
          exercise_type?: string | null
          id?: string
          instructions?: string | null
          is_bodyweight?: boolean | null
          name?: string
          primary_muscle_group_id?: string | null
          secondary_muscle_group_id?: string | null
          tertiary_muscle_group_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_primary_muscle_group_id_fkey"
            columns: ["primary_muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_secondary_muscle_group_id_fkey"
            columns: ["secondary_muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_tertiary_muscle_group_id_fkey"
            columns: ["tertiary_muscle_group_id"]
            isOneToOne: false
            referencedRelation: "muscle_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      food_servings: {
        Row: {
          calcium_mg: number | null
          calories: number | null
          carbs_g: number | null
          created_at: string | null
          fat_g: number | null
          fiber_g: number | null
          food_id: number | null
          id: number
          iron_mg: number | null
          protein_g: number | null
          serving_description: string
          sodium_mg: number | null
          sugar_g: number | null
          vitamin_c_mg: number | null
        }
        Insert: {
          calcium_mg?: number | null
          calories?: number | null
          carbs_g?: number | null
          created_at?: string | null
          fat_g?: number | null
          fiber_g?: number | null
          food_id?: number | null
          id?: number
          iron_mg?: number | null
          protein_g?: number | null
          serving_description: string
          sodium_mg?: number | null
          sugar_g?: number | null
          vitamin_c_mg?: number | null
        }
        Update: {
          calcium_mg?: number | null
          calories?: number | null
          carbs_g?: number | null
          created_at?: string | null
          fat_g?: number | null
          fiber_g?: number | null
          food_id?: number | null
          id?: number
          iron_mg?: number | null
          protein_g?: number | null
          serving_description?: string
          sodium_mg?: number | null
          sugar_g?: number | null
          vitamin_c_mg?: number | null
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
          brand: string | null
          category: string | null
          created_at: string | null
          data_sources: string[] | null
          id: number
          last_updated: string | null
          name: string
          quality_score: number | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string | null
          data_sources?: string[] | null
          id?: number
          last_updated?: string | null
          name: string
          quality_score?: number | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string | null
          data_sources?: string[] | null
          id?: number
          last_updated?: string | null
          name?: string
          quality_score?: number | null
        }
        Relationships: []
      }
      meal_foods: {
        Row: {
          created_at: string | null
          food_serving_id: number | null
          id: string
          meal_id: string | null
          notes: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          food_serving_id?: number | null
          id?: string
          meal_id?: string | null
          notes?: string | null
          quantity?: number
        }
        Update: {
          created_at?: string | null
          food_serving_id?: number | null
          id?: string
          meal_id?: string | null
          notes?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_foods_food_serving_id_fkey"
            columns: ["food_serving_id"]
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
          meal_type: string | null
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
          meal_type?: string | null
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
          meal_type?: string | null
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
          cook_time_minutes: number | null
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          id: string
          image_url: string | null
          instructions: string | null
          is_favorite: boolean | null
          is_public: boolean | null
          name: string
          prep_time_minutes: number | null
          serving_size: number | null
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
          is_public?: boolean | null
          name: string
          prep_time_minutes?: number | null
          serving_size?: number | null
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
          is_public?: boolean | null
          name?: string
          prep_time_minutes?: number | null
          serving_size?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mesocycles: {
        Row: {
          created_at: string | null
          cycle_order: number | null
          description: string | null
          end_date: string | null
          focus: string | null
          id: string
          is_active: boolean | null
          is_complete: boolean | null
          name: string
          program_id: string | null
          start_date: string | null
          updated_at: string | null
          user_id: string | null
          weeks: number
        }
        Insert: {
          created_at?: string | null
          cycle_order?: number | null
          description?: string | null
          end_date?: string | null
          focus?: string | null
          id?: string
          is_active?: boolean | null
          is_complete?: boolean | null
          name: string
          program_id?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          weeks: number
        }
        Update: {
          created_at?: string | null
          cycle_order?: number | null
          description?: string | null
          end_date?: string | null
          focus?: string | null
          id?: string
          is_active?: boolean | null
          is_complete?: boolean | null
          name?: string
          program_id?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          weeks?: number
        }
        Relationships: [
          {
            foreignKeyName: "mesocycles_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      muscle_groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_muscle_group_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_muscle_group_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
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
      nutrition_logs: {
        Row: {
          created_at: string | null
          custom_calories: number | null
          custom_carbs_g: number | null
          custom_fat_g: number | null
          custom_food_name: string | null
          custom_protein_g: number | null
          food_id: number | null
          food_serving_id: number | null
          id: string
          log_date: string
          meal_type: string | null
          notes: string | null
          quantity_consumed: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_calories?: number | null
          custom_carbs_g?: number | null
          custom_fat_g?: number | null
          custom_food_name?: string | null
          custom_protein_g?: number | null
          food_id?: number | null
          food_serving_id?: number | null
          id?: string
          log_date?: string
          meal_type?: string | null
          notes?: string | null
          quantity_consumed?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_calories?: number | null
          custom_carbs_g?: number | null
          custom_fat_g?: number | null
          custom_food_name?: string | null
          custom_protein_g?: number | null
          food_id?: number | null
          food_serving_id?: number | null
          id?: string
          log_date?: string
          meal_type?: string | null
          notes?: string | null
          quantity_consumed?: number
          user_id?: string | null
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
      routine_exercises: {
        Row: {
          created_at: string | null
          exercise_id: string | null
          exercise_order: number
          id: string
          notes: string | null
          reps: string | null
          rest_seconds: number | null
          routine_id: string | null
          sets: number
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          exercise_id?: string | null
          exercise_order?: number
          id?: string
          notes?: string | null
          reps?: string | null
          rest_seconds?: number | null
          routine_id?: string | null
          sets?: number
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          exercise_id?: string | null
          exercise_order?: number
          id?: string
          notes?: string | null
          reps?: string | null
          rest_seconds?: number | null
          routine_id?: string | null
          sets?: number
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
          client_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          status: string | null
          trainer_id: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      training_programs: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          is_complete: boolean | null
          name: string
          program_type: string | null
          start_date: string | null
          total_weeks: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_complete?: boolean | null
          name: string
          program_type?: string | null
          start_date?: string | null
          total_weeks?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_complete?: boolean | null
          name?: string
          program_type?: string | null
          start_date?: string | null
          total_weeks?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          activity_level: string | null
          created_at: string | null
          current_weight_kg: number | null
          daily_calorie_goal: number | null
          daily_carb_goal_g: number | null
          daily_fat_goal_g: number | null
          daily_protein_goal_g: number | null
          daily_water_goal_oz: number | null
          date_of_birth: string | null
          diet_preference: string | null
          email: string | null
          first_name: string | null
          fitness_goal: string | null
          height_cm: number | null
          id: string
          last_name: string | null
          sex: string | null
          target_weight_kg: number | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activity_level?: string | null
          created_at?: string | null
          current_weight_kg?: number | null
          daily_calorie_goal?: number | null
          daily_carb_goal_g?: number | null
          daily_fat_goal_g?: number | null
          daily_protein_goal_g?: number | null
          daily_water_goal_oz?: number | null
          date_of_birth?: string | null
          diet_preference?: string | null
          email?: string | null
          first_name?: string | null
          fitness_goal?: string | null
          height_cm?: number | null
          id: string
          last_name?: string | null
          sex?: string | null
          target_weight_kg?: number | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activity_level?: string | null
          created_at?: string | null
          current_weight_kg?: number | null
          daily_calorie_goal?: number | null
          daily_carb_goal_g?: number | null
          daily_fat_goal_g?: number | null
          daily_protein_goal_g?: number | null
          daily_water_goal_oz?: number | null
          date_of_birth?: string | null
          diet_preference?: string | null
          email?: string | null
          first_name?: string | null
          fitness_goal?: string | null
          height_cm?: number | null
          id?: string
          last_name?: string | null
          sex?: string | null
          target_weight_kg?: number | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
        ]
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
          completed: boolean | null
          created_at: string | null
          distance_meters: number | null
          duration_seconds: number | null
          exercise_id: string | null
          id: string
          log_id: string | null
          notes: string | null
          reps_completed: number | null
          rpe_rating: number | null
          set_number: number
          weight_lifted_kg: number | null
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
          reps_completed?: number | null
          rpe_rating?: number | null
          set_number: number
          weight_lifted_kg?: number | null
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
          reps_completed?: number | null
          rpe_rating?: number | null
          set_number?: number
          weight_lifted_kg?: number | null
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
          created_at: string | null
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
          difficulty_level: number | null
          estimated_duration_minutes: number | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string
          routine_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name: string
          routine_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string
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
      add_client_to_trainer: {
        Args: { client_user_id: string; trainer_user_id: string }
        Returns: Json
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
      ensure_user_profile: { Args: { user_uuid: string }; Returns: string }
      get_trainer_clients: {
        Args: { trainer_user_id: string }
        Returns: {
          client_id: string
          email: string
          first_name: string
          last_message_at: string
          last_name: string
          relationship_created_at: string
          relationship_status: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
