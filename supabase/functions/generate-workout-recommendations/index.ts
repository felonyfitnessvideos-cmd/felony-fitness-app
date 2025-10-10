import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// Helper function to calculate age from date of birth
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
    const { userId } = await req.json();
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- 1. Fetch all necessary user data ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // --- START: MODIFICATION ---
    // Corrected the nutrition_logs query to use the proper relationship and column names.
    const [profileRes, metricsRes, workoutRes, nutritionRes] = await Promise.all([
      supabaseAdmin.from('user_profiles').select('dob, sex, daily_calorie_goal, daily_protein_goal').eq('id', userId).single(),
      supabaseAdmin.from('body_metrics').select('weight_lbs, body_fat_percentage').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabaseAdmin.from('workout_logs').select('notes, duration_minutes, created_at').eq('user_id', userId).gte('created_at', sevenDaysAgo.toISOString()).order('created_at', { ascending: false }),
      supabaseAdmin.from('nutrition_logs')
        .select('quantity_consumed, food_servings(calories, protein_g)')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString())
    ]);
    // --- END: MODIFICATION ---

    if (profileRes.error) throw profileRes.error;
    if (metricsRes.error) throw metricsRes.error;
    if (workoutRes.error) throw workoutRes.error;
    if (nutritionRes.error) throw nutritionRes.error;
    
    if (!profileRes.data) {
      throw new Error("User profile not found. Cannot generate recommendations without goals.");
    }

    // --- 2. Process and summarize the data ---
    const userProfile = profileRes.data;
    const latestMetrics = metricsRes.data;
    const recentWorkouts = workoutRes.data;
    const recentNutrition = nutritionRes.data;
    
    // --- START: MODIFICATION ---
    // Corrected the data processing to match the new query structure.
    const foodLogs = recentNutrition.filter(log => log.food_servings);
    const totalDays = 7;

    const avgCalories = foodLogs.reduce((sum, log) => sum + (log.food_servings?.calories || 0) * log.quantity_consumed, 0) / totalDays;
    const avgProtein = foodLogs.reduce((sum, log) => sum + (log.food_servings?.protein_g || 0) * log.quantity_consumed, 0) / totalDays;
    // --- END: MODIFICATION ---

    const summary = {
      profile: `Age: ${calculateAge(userProfile.dob)}, Sex: ${userProfile.sex}, Weight: ${latestMetrics?.weight_lbs || 'N/A'} lbs, Body Fat: ${latestMetrics?.body_fat_percentage || 'N/A'}%`,
      goals: `Calorie Goal: ${userProfile.daily_calorie_goal}, Protein Goal: ${userProfile.daily_protein_goal}g`,
      avgIntake: `Avg Daily Intake (last 7 days): ${Math.round(avgCalories)} calories, ${Math.round(avgProtein)}g protein`,
      workouts: `Completed ${recentWorkouts.length} workouts in the last 7 days.`,
      workoutList: recentWorkouts.map(w => `- ${w.notes || 'Unnamed Workout'} (${w.duration_minutes} mins)`).join('\n') || 'No workouts logged.'
    };

    // --- 3. Construct the prompt for the AI with the new data ---
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
      throw new Error(`AI API request failed: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const recommendations = JSON.parse(aiData.choices[0].message.content);

    // --- 5. Return the recommendations ---
    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
