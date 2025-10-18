/**
 * @file supabase/functions/generate-workout-recommendations/index.ts
 * @description Edge Function to generate personalized workout recommendations for a user.
 *
 * @project Felony Fitness
 *
 * @workflow
 * 1. SECURELY derives the user's ID from their authentication token.
 * 2. Fetches a comprehensive set of user data using RLS.
 * 3. It processes and summarizes this data into a human-readable format.
 * 4. It constructs a detailed prompt for the OpenAI API.
 * 5. The AI analyzes the data and returns a structured JSON object.
 * 6. The function parses the AI's response and sends it back to the client.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const calculateAge = (dob) => {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // **SECURITY FIX: Create a user-scoped client to enforce RLS**
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // **SECURITY FIX: Securely get the user from the JWT**
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    const userId = user.id; // Use the secure, server-derived user ID

    // --- 1. Fetch all necessary user data in parallel for efficiency. ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [profileRes, metricsRes, workoutRes, nutritionRes] = await Promise.all([
      supabase.from('user_profiles').select('dob, sex, daily_calorie_goal, daily_protein_goal').eq('id', userId).single(),
      supabase.from('body_metrics').select('weight_lbs, body_fat_percentage').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('workout_logs').select('notes, duration_minutes, created_at').eq('user_id', userId).gte('created_at', sevenDaysAgo.toISOString()).gt('duration_minutes', 0),
      supabase.from('nutrition_logs').select('quantity_consumed, food_servings(calories, protein_g)').eq('user_id', userId).gte('created_at', sevenDaysAgo.toISOString())
    ]);

    if (profileRes.error) throw profileRes.error;
    if (metricsRes.error) throw metricsRes.error;
    if (workoutRes.error) throw workoutRes.error;
    if (nutritionRes.error) throw nutritionRes.error;
    if (!profileRes.data) {
      throw new Error("User profile not found. Cannot generate recommendations without goals.");
    }

    // --- 2. Process and summarize the fetched data for the AI prompt. ---
    const userProfile = profileRes.data;
    const latestMetrics = metricsRes.data;
    const recentWorkouts = workoutRes.data || [];
    const recentNutrition = nutritionRes.data || [];

    const foodLogs = recentNutrition.filter((log) => log.food_servings);
    const totalDays = 7;
    const avgCalories = foodLogs.reduce((sum, log) => sum + (log.food_servings?.calories || 0) * log.quantity_consumed, 0) / totalDays;
    const avgProtein = foodLogs.reduce((sum, log) => sum + (log.food_servings?.protein_g || 0) * log.quantity_consumed, 0) / totalDays;

    const summary = {
      profile: `Age: ${calculateAge(userProfile.dob)}, Sex: ${userProfile.sex}, Weight: ${latestMetrics?.weight_lbs || 'N/A'} lbs, Body Fat: ${latestMetrics?.body_fat_percentage || 'N/A'}%`,
      goals: `Calorie Goal: ${userProfile.daily_calorie_goal}, Protein Goal: ${userProfile.daily_protein_goal}g`,
      avgIntake: `Avg Daily Intake (last 7 days): ${Math.round(avgCalories)} calories, ${Math.round(avgProtein)}g protein`,
      workouts: `Completed ${recentWorkouts.length} workouts in the last 7 days.`,
      workoutList: recentWorkouts.map((w) => `- ${w.notes || 'Unnamed Workout'} (${w.duration_minutes} mins)`).join('\n') || 'No workouts logged.'
    };

    // --- 3. Construct the full prompt for the AI. ---
    const prompt = `
      You are a fitness and nutrition expert for the app "Felony Fitness".
      Analyze the following user data and provide 3-4 actionable workout-related recommendations.
      The user is justice-impacted, so adopt a supportive, empowering, and straightforward tone.
      
      User Data:
      - Profile Metrics: ${summary.profile}
      - Goals: ${summary.goals}
      - 7-Day Average Nutrition: ${summary.avgIntake}
      - 7-Day Workout Summary: ${summary.workouts}
      - Recent Workouts:
      ${summary.workoutList}
      
      Based on this data, provide an overall analysis summary and a list of specific recommendations focused on their training.
      Your response must be in valid JSON format, like this example:
      {
        "analysis_summary": "A brief, one-paragraph summary of their current training progress and areas for improvement.",
        "recommendations": [
          {
            "title": "Workout Recommendation Title 1",
            "reason": "Explain why this recommendation is being made based on their data (e.g., 'Your nutrition is solid, but your workout frequency could be higher to meet your goals.').",
            "action": "Provide a clear, simple, actionable step related to their workouts (e.g., 'Try adding one more full-body workout session this week.')."
          }
        ]
      }
    `;

    // --- 4. Call the OpenAI API ---
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API request failed: ${await aiResponse.text()}`);
    }
    const aiData = await aiResponse.json();
    const recommendations = JSON.parse(aiData.choices[0].message.content);

    // --- 5. Return the final recommendations to the client. ---
    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});