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
    if (!userId) throw new Error("User ID is required.");

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- 1. Fetch all necessary user data ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [profileRes, metricsRes, nutritionRes, workoutRes] = await Promise.all([
      supabaseAdmin.from('user_profiles').select('dob, sex, daily_calorie_goal, daily_protein_goal').eq('id', userId).single(),
      supabaseAdmin.from('body_metrics').select('weight_lbs, body_fat_percentage').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabaseAdmin.from('nutrition_logs').select('foods(food_name), quantity_consumed').eq('user_id', userId).gte('log_date', sevenDaysAgo.toISOString()),
      supabaseAdmin.from('workout_logs').select('notes, duration_minutes').eq('user_id', userId).gte('created_at', sevenDaysAgo.toISOString())
    ]);

    if (profileRes.error) throw profileRes.error;
    if (metricsRes.error) throw metricsRes.error;
    if (nutritionRes.error) throw nutritionRes.error;
    if (workoutRes.error) throw workoutRes.error;

    if (!profileRes.data) {
      throw new Error("User profile not found. Cannot generate recommendations without goals.");
    }

    // --- 2. Construct the full prompt for the AI ---
    const userProfile = profileRes.data;
    const latestMetrics = metricsRes.data;

    const prompt = `
      You are an expert fitness and nutrition coach for Felony Fitness, an organization helping formerly incarcerated individuals. 
      Your tone should be encouraging, straightforward, and supportive.

      Analyze the following user data from the last 7 days and provide 3 actionable nutrition-related recommendations.

      User Profile:
      - Age: ${calculateAge(userProfile.dob)}
      - Sex: ${userProfile.sex}
      - Weight: ${latestMetrics?.weight_lbs || 'N/A'} lbs
      - Body Fat: ${latestMetrics?.body_fat_percentage || 'N/A'}%

      User Goals:
      - Calories: ${userProfile.daily_calorie_goal}
      - Protein: ${userProfile.daily_protein_goal}g

      Recent Nutrition Logs:
      ${nutritionRes.data.map(log => `- ${log.foods?.food_name || 'Logged food'}: ${log.quantity_consumed} serving(s)`).join('\n')}

      Recent Workouts:
      ${workoutRes.data.map(log => `- ${log.notes || 'Workout'} for ${log.duration_minutes} minutes`).join('\n')}

      Based on this data, provide a response in valid JSON format, focused on nutrition. The response must be a JSON object with two keys: "analysis_summary" and "recommendations".
      Here is the required JSON structure:
      {
        "analysis_summary": "A brief, one-sentence summary of their recent activity and diet.",
        "recommendations": [
          {
            "title": "Nutrition Recommendation Title 1",
            "reason": "Explain WHY this recommendation is important based on their specific data.",
            "action": "Provide a simple, concrete action they can take related to their diet."
          }
        ]
      }
    `;

    // --- 3. Call the OpenAI API ---
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

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error("Error caught in function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});