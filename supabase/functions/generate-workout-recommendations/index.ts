/**
 * @file supabase/functions/generate-workout-recommendations/index.ts
 * @description Edge Function that generates personalized workout recommendations using OpenAI.
 * 
 * @project Felony Fitness
 * 
 * @workflow
 * 1. Authenticates user via Supabase auth token
 * 2. Fetches user profile (goals, activity level, nutrition targets)
 * 3. Fetches recent body metrics (weight, body fat %)
 * 4. Fetches workout history (last 7 days)
 * 5. Fetches nutrition logs and food servings (last 7 days)
 * 6. Calculates average daily nutrition intake
 * 7. Constructs detailed prompt for OpenAI with all context
 * 8. Returns AI-generated analysis and actionable recommendations
 * 
 * @critical_fixes
 * - 2025-11-06: Split nutrition_logs query to avoid RLS issues with nested JOINs
 * - 2025-11-06: Changed 'dob' to 'date_of_birth' to match database schema
 * - 2025-11-06: Added fitness_goal, activity_level, and all macro goals
 * - 2025-11-06: Fixed variable naming conflict (recentNutrition used twice)
 * - 2025-02-26: Optimized DB queries to use indexed 'log_date'/'measurement_date' instead of 'created_at'.
 *               Added max_tokens to OpenAI request to prevent timeouts.
 * 
 * @note This file runs on Deno inside Supabase Edge Functions and uses Deno globals.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// --- Types used in this function ---
interface UserProfile {
    date_of_birth: string | null;
    sex: string | null;
    fitness_goal: string | null;
    activity_level: string | null;
    daily_calorie_goal: number | null;
    daily_protein_goal: number | null;
    daily_carb_goal: number | null;
    daily_fat_goal: number | null;
}

interface BodyMetrics {
    weight_lbs: number | null;
    body_fat_percentage: number | null;
}

interface WorkoutLog {
    notes: string | null;
    duration_minutes: number | null;
    log_date: string;
}

interface NutritionLog {
    quantity_consumed: number;
    food_id: number;
    log_date: string;
}

interface Food {
    id: number;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
}

/**
 * Calculate user's age from date of birth.
 */
const calculateAge = (dob: string | null): number | null => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// --- Main Function ---
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { user }, error: authError } = await (supabase as any).auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    const userId = user.id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    const [profileRes, metricsRes, workoutRes, nutritionRes] = await Promise.all([
      supabase.from('user_profiles').select('date_of_birth, sex, fitness_goal, activity_level, daily_calorie_goal, daily_protein_goal, daily_carb_goal, daily_fat_goal').eq('id', userId).single(),
      supabase.from('body_metrics').select('weight_lbs, body_fat_percentage').eq('user_id', userId).order('measurement_date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('workout_logs').select('notes, duration_minutes, log_date').eq('user_id', userId).gte('log_date', dateStr).gt('duration_minutes', 0),
      supabase.from('nutrition_logs').select('quantity_consumed, food_id, log_date').eq('user_id', userId).gte('log_date', dateStr)
    ]);

    if (profileRes.error) throw new Error(`Profile query failed: ${profileRes.error.message}`);
    if (metricsRes.error) throw new Error(`Metrics query failed: ${metricsRes.error.message}`);
    if (workoutRes.error) throw new Error(`Workout query failed: ${workoutRes.error.message}`);
    if (nutritionRes.error) throw new Error(`Nutrition query failed: ${nutritionRes.error.message}`);
    if (!profileRes.data) throw new Error("User profile not found. Cannot generate recommendations without goals.");

    const userProfile = profileRes.data as UserProfile;
    const latestMetrics = metricsRes.data as BodyMetrics | null;
    const recentWorkouts = (workoutRes.data || []) as WorkoutLog[];
    const nutritionLogsRaw = (nutritionRes.data || []) as NutritionLog[];

    const foodIds = [...new Set(nutritionLogsRaw.map(log => log.food_id).filter(Boolean))];
    let foodsMap: Record<number, Food> = {};

    if (foodIds.length > 0) {
      const { data: foodsData, error: foodsError } = await supabase.from('foods').select('id, calories, protein_g, carbs_g, fat_g').in('id', foodIds);
      if (foodsError) console.warn('Foods query failed:', foodsError?.message);
      if (foodsData) {
        foodsMap = Object.fromEntries(foodsData.map((f: Food) => [f.id, f]));
      }
    }

    const nutritionLogsWithFood = nutritionLogsRaw.map(log => ({ ...log, food: log.food_id ? foodsMap[log.food_id] : null }));

    const totalDays = 7;
    const avgCalories = nutritionLogsWithFood.reduce((sum, log) => sum + (log.food?.calories || 0) * log.quantity_consumed, 0) / totalDays;
    const avgProtein = nutritionLogsWithFood.reduce((sum, log) => sum + (log.food?.protein_g || 0) * log.quantity_consumed, 0) / totalDays;
    const avgCarbs = nutritionLogsWithFood.reduce((sum, log) => sum + (log.food?.carbs_g || 0) * log.quantity_consumed, 0) / totalDays;
    const avgFats = nutritionLogsWithFood.reduce((sum, log) => sum + (log.food?.fat_g || 0) * log.quantity_consumed, 0) / totalDays;

    const formatGoal = (goal: string | null): string => !goal ? 'Not set' : goal.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const formatActivityLevel = (level: string | null): string => !level ? 'Not set' : level.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const summary = {
      profile: `Age: ${calculateAge(userProfile.date_of_birth)}, Sex: ${userProfile.sex}, Weight: ${latestMetrics?.weight_lbs || 'N/A'} lbs, Body Fat: ${latestMetrics?.body_fat_percentage || 'N/A'}%`,
      fitnessGoal: `Fitness Goal: ${formatGoal(userProfile.fitness_goal)}, Activity Level: ${formatActivityLevel(userProfile.activity_level)}`,
      nutritionGoals: `Daily Goals - Calories: ${userProfile.daily_calorie_goal || 'Not set'}, Protein: ${userProfile.daily_protein_goal || 'Not set'}g, Carbs: ${userProfile.daily_carb_goal || 'Not set'}g, Fats: ${userProfile.daily_fat_goal || 'Not set'}g`,
      avgIntake: `Avg Daily Intake (last 7 days): ${Math.round(avgCalories)} calories, ${Math.round(avgProtein)}g protein, ${Math.round(avgCarbs)}g carbs, ${Math.round(avgFats)}g fats`,
      workouts: `Completed ${recentWorkouts.length} workouts in the last 7 days.`,
      workoutList: recentWorkouts.map(w => `- ${w.notes || 'Unnamed Workout'} (${w.duration_minutes} mins)`).join('\n') || 'No workouts logged.'
    };

    const prompt = `
      You are a fitness and nutrition expert for the app "Felony Fitness".
      Analyze the following user data and provide 3-4 actionable workout-related recommendations.
      The user is justice-impacted, so adopt a supportive, empowering, and straightforward tone.
      
      User Data:
      - Profile Metrics: ${summary.profile}
      - Fitness Goals: ${summary.fitnessGoal}
      - Nutrition Goals: ${summary.nutritionGoals}
      - 7-Day Average Nutrition Intake: ${summary.avgIntake}
      - 7-Day Workout Summary: ${summary.workouts}
      - Recent Workouts:
      ${summary.workoutList}
      
      Based on this data, provide an overall analysis summary and a list of specific recommendations focused on their training.
      Your response must be in valid JSON format, like this example:
      {
        "analysis_summary": "...",
        "recommendations": [
          {
            "title": "...",
            "reason": "...",
            "action": "..."
          }
        ]
      }
    `;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' }, temperature: 0.7, max_tokens: 1500 }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI API request failed: ${errorText}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aiData: any = await aiResponse.json();
    const recommendations = JSON.parse(aiData.choices[0].message.content);

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (_err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = _err as any;
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
