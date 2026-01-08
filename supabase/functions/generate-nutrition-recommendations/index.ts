/**
 * @file supabase/functions/generate-nutrition-recommendations/index.ts
 * @description Edge Function that generates personalized nutrition recommendations using OpenAI.
 * 
 * @project Felony Fitness
 * 
 * @workflow
 * 1. Authenticates user via Supabase auth token (Authorization header)
 * 2. Fetches user profile (goals, dietary preferences, activity level)
 * 3. Fetches recent body metrics (weight, body fat %)
 * 4. Fetches nutrition logs and resolves food servings (last 7 days)
 * 5. Fetches workout history for context (last 7 days)
 * 6. Aggregates food consumption by category
 * 7. Constructs detailed prompt for OpenAI with nutrition focus
 * 8. Returns AI-generated analysis and actionable nutrition recommendations
 * 
 * @critical_fixes
 * - 2025-11-06: Changed 'dob' to 'date_of_birth' to match database schema
 * - 2025-11-06: Added fitness_goal, activity_level, daily_carb_goal, daily_fat_goal
 * - 2025-11-06: Enhanced TypeScript interfaces for new fields
 * 
 * @note This file runs on Deno inside Supabase Edge Functions and uses Deno globals.
 * @note Nutrition logs query avoids nested JOINs to prevent RLS issues.
 */

// Minimal local type shims so TypeScript can check this Deno-run file.
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

// @ts-expect-error: CDN ESM import used in Deno runtime; local types are not available.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY: string | undefined = Deno.env.get('OPENAI_API_KEY');

// --- Types used in this function ---
interface UserProfile {
  date_of_birth?: string | null;
  sex?: string | null;
  daily_calorie_goal?: number | null;
  daily_protein_goal?: number | null;
  daily_carb_goal?: number | null;
  daily_fat_goal?: number | null;
  diet_preference?: string | null;
  fitness_goal?: string | null;
  activity_level?: string | null;
}

interface BodyMetrics {
  weight_lbs?: number | null;
  body_fat_percentage?: number | null;
}

interface Food {
  id: number;
  name?: string | null;
  category?: string | null;
}

interface NutritionLog {
  food_id: number;
  quantity_consumed: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface WorkoutLog {
  notes?: string | null;
  duration_minutes?: number | null;
}

/**
 * Calculate user's age from date of birth.
 */
const calculateAge = (dob: string | null | undefined): number | null => {
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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('Service configuration error: OPENAI_API_KEY is not set.');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await (supabase as unknown).auth.getUser();
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

    const [profileRes, metricsRes, nutritionRes, workoutRes] = await Promise.all([
      supabase.from('user_profiles').select('date_of_birth, sex, daily_calorie_goal, daily_protein_goal, diet_preference, fitness_goal, activity_level, daily_carb_goal, daily_fat_goal').eq('id', userId).single(),
      supabase.from('body_metrics').select('weight_lbs, body_fat_percentage').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('nutrition_logs').select('quantity_consumed, calories, protein_g, carbs_g, fat_g, food_id').eq('user_id', userId).gte('log_date', dateStr).not('food_id', 'is', null),
      supabase.from('workout_logs').select('notes, duration_minutes').eq('user_id', userId).gte('created_at', sevenDaysAgo.toISOString()),
    ]);

    if (profileRes.error) throw new Error(`Profile query failed: ${profileRes.error.message}`);
    if (metricsRes.error) throw new Error(`Metrics query failed: ${metricsRes.error.message}`);
    if (nutritionRes.error) throw new Error(`Nutrition query failed: ${nutritionRes.error.message}`);
    if (workoutRes.error) throw new Error(`Workout query failed: ${workoutRes.error.message}`);
    if (!profileRes.data) throw new Error('User profile not found.');

    const userProfile = profileRes.data as UserProfile;
    const latestMetrics = metricsRes.data as BodyMetrics | null;
    const nutritionLogs = (nutritionRes.data || []) as NutritionLog[];
    const workoutLogs = (workoutRes.data || []) as WorkoutLog[];

    const macroTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const log of nutritionLogs) {
      const qty = log.quantity_consumed ?? 1;
      macroTotals.calories += (log.calories ?? 0) * qty;
      macroTotals.protein += (log.protein_g ?? 0) * qty;
      macroTotals.carbs += (log.carbs_g ?? 0) * qty;
      macroTotals.fat += (log.fat_g ?? 0) * qty;
    }

    const categoryCounts: Record<string, number> = {};
    const foodIds = nutritionLogs.map(log => log.food_id).filter((id): id is number => id !== null);

    if (foodIds.length > 0) {
      const { data: foodsData } = await supabase.from('foods').select('id, category, name').in('id', foodIds);
      const foods = (foodsData || []) as Food[];
      const categoryMap = new Map(foods.map(f => [f.id, f.category || f.name || 'Uncategorized']));

      for (const log of nutritionLogs) {
        const category = categoryMap.get(log.food_id);
        if (category) {
          const qty = log.quantity_consumed ?? 1;
          categoryCounts[category] = (categoryCounts[category] || 0) + qty;
        }
      }
    }

    const nutritionSummary = Object.entries(categoryCounts).map(([cat, count]) => `- ${cat}: ${count} serving(s)`).join('\n');
    const macroSummary = `7-Day Macro Totals:\n- Calories: ${Math.round(macroTotals.calories)}\n- Protein: ${Math.round(macroTotals.protein)}g\n- Carbs: ${Math.round(macroTotals.carbs)}g\n- Fat: ${Math.round(macroTotals.fat)}g`;
    const workoutsList = workoutLogs.map(log => `- ${log.notes || 'Workout'} for ${log.duration_minutes ?? 'unknown'} minutes`).join('\n') || 'No workouts logged.';

    const prompt = [
      'You are an expert fitness and nutrition coach for Felony Fitness, an organization helping formerly incarcerated individuals.',
      'Your tone should be encouraging, straightforward, and supportive.',
      'Analyze the following user data from the last 7 days and provide 3 actionable nutrition-related recommendations.',
      'User Profile:',
      `- Age: ${calculateAge(userProfile.date_of_birth)}, Sex: ${userProfile.sex || 'N/A'}`,
      `- Weight: ${latestMetrics?.weight_lbs || 'N/A'} lbs, Body Fat: ${latestMetrics?.body_fat_percentage || 'N/A'}%`,
      `- Fitness Goal: ${userProfile.fitness_goal || 'N/A'}, Activity Level: ${userProfile.activity_level || 'N/A'}`,
      'User Goals:',
      `- Calories: ${userProfile.daily_calorie_goal || 'N/A'}, Protein: ${userProfile.daily_protein_goal || 'N/A'}g, Carbs: ${userProfile.daily_carb_goal || 'N/A'}g, Fats: ${userProfile.daily_fat_goal || 'N/A'}g`,
      `- Diet: ${userProfile.diet_preference || 'None'}`,
      macroSummary,
      '7-Day Nutrition Summary (by category):',
      nutritionSummary || 'No nutrition logged.',
      'Recent Workouts:',
      workoutsList,
      'Your response must be in valid JSON format: { "analysis_summary": "...", "recommendations": [{"title": "...", "reason": "...", "action": "..."}] }'
    ].join('\n');

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' }, temperature: 0.7 }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI API request failed: ${errorText}`);
    }

    const aiData: unknown = await aiResponse.json();
    const recommendations = JSON.parse((aiData as { choices?: Array<{ message?: { content?: string } }> }).choices?.[0]?.message?.content || '{}');

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (_err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = _err as any;
    console.error(`Function error: ${err.stack ?? err.message}`);
    const clientMessage = err.message.includes('profile') ? 'Invalid request' : 'Internal server error';
    const status = err.message.includes('profile') ? 400 : 502;

    return new Response(JSON.stringify({ error: clientMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    });
  }
});
