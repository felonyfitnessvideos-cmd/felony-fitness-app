// FILE: supabase/functions/generate-workout-recommendations/index.ts
// DESCRIPTION: Corrected to use 'log_date' for the nutrition_logs table.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [profileRes, workoutRes, nutritionRes] = await Promise.all([
      supabaseAdmin.from('user_profiles').select('daily_calorie_goal, daily_protein_goal, daily_water_goal_oz').eq('id', userId).single(),
      supabaseAdmin.from('workout_logs').select('notes, duration_minutes, created_at').eq('user_id', userId).gte('created_at', sevenDaysAgo.toISOString()).order('created_at', { ascending: false }),
      // CORRECTED: Changed 'created_at' to 'log_date' to match your table schema.
      supabaseAdmin.from('nutrition_logs').select('foods(calories_per_serving, protein_g_per_serving), quantity_consumed').eq('user_id', userId).gte('log_date', sevenDaysAgo.toISOString())
    ]);

    if (profileRes.error) throw profileRes.error;
    if (workoutRes.error) throw workoutRes.error;
    if (nutritionRes.error) throw nutritionRes.error;

    const userProfile = profileRes.data;
    const recentWorkouts = workoutRes.data;
    const recentNutrition = nutritionRes.data;

    const avgCalories = recentNutrition.reduce((sum, log) => sum + (log.foods?.calories_per_serving || 0) * log.quantity_consumed, 0) / 7;
    const avgProtein = recentNutrition.reduce((sum, log) => sum + (log.foods?.protein_g_per_serving || 0) * log.quantity_consumed, 0) / 7;

    const summary = {
      goals: `Calorie Goal: ${userProfile.daily_calorie_goal}, Protein Goal: ${userProfile.daily_protein_goal}g`,
      avgIntake: `Avg Daily Intake (last 7 days): ${Math.round(avgCalories)} calories, ${Math.round(avgProtein)}g protein`,
      workouts: `Completed ${recentWorkouts.length} workouts in the last 7 days.`,
      workoutList: recentWorkouts.map(w => `- ${w.notes} (${w.duration_minutes} mins)`).join('\n')
    };

    const prompt = `
      You are a fitness and nutrition expert for the app "Felony Fitness".
      Analyze the following user data and provide 3-4 actionable recommendations to help them reach their goals.
      The user is justice-impacted, so adopt a supportive, empowering, and straightforward tone.
      
      User Data:
      - Goals: ${summary.goals}
      - 7-Day Average Nutrition: ${summary.avgIntake}
      - 7-Day Workout Summary: ${summary.workouts}
      - Recent Workouts:
      ${summary.workoutList}
      
      Based on this data, provide an overall analysis summary and a list of specific recommendations.
      Your response must be in JSON format, like this example:
      {
        "analysis_summary": "A brief, one-paragraph summary of their current progress and areas for improvement.",
        "recommendations": [
          {
            "title": "Recommendation Title 1",
            "reason": "Explain why this recommendation is being made based on their data.",
            "action": "Provide a clear, simple, actionable step the user can take."
          }
        ]
      }
    `;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      console.error("AI API request failed with body:", errorBody);
      throw new Error(`AI API request failed`);
    }

    const aiData = await aiResponse.json();
    const recommendations = JSON.parse(aiData.choices[0].message.content);

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error("Error caught in function:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});