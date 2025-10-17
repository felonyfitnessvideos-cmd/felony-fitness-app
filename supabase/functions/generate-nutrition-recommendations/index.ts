/**
 * @file supabase/functions/generate-nutrition-recommendations/index.ts
 * @description Edge Function to generate personalized nutrition recommendations for a user.
 *
 * @project Felony Fitness
 *
 * @workflow
 * 1. Receives a `userId` from the client application.
 * 2. Fetches the user's profile (for goals, age, sex), latest body metrics (weight, body fat),
 * and all nutrition and workout logs from the last 7 days.
 * 3. It processes the raw nutrition logs, grouping them by food category (e.g., 'Fruits',
 * 'Meat, Poultry & Fish') and counting the number of servings for each.
 * 4. A detailed prompt is constructed for the OpenAI API. This prompt includes the user's
 * profile, goals, and a summary of their recent dietary habits and workouts.
 * 5. It instructs the AI to act as an expert fitness coach for the app, providing a brief
 * analysis and a list of actionable nutrition recommendations in a specific JSON format.
 * 6. The AI's JSON response is parsed and sent back to the client application to be displayed.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Retrieve the OpenAI API key from environment variables.
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

/**
 * A helper function to calculate a person's age based on their date of birth.
 * @param {string | null} dob - The date of birth string (e.g., "YYYY-MM-DD").
 * @returns {number | null} The calculated age, or null if the DOB is not provided.
 */
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

/**
 * The main server function that handles incoming recommendation requests.
 * @param {Request} req - The incoming HTTP request, expected to contain a JSON body with a `userId`.
 * @returns {Response} A JSON response containing the AI-generated recommendations or an error.
 */
Deno.serve(async (req) => {
  // Standard handling for CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    if (!userId) throw new Error("User ID is required.");

    // Create an admin client to interact with the database.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- 1. Fetch all necessary user data in parallel for efficiency. ---
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [profileRes, metricsRes, nutritionRes, workoutRes] = await Promise.all([
      supabaseAdmin.from('user_profiles').select('dob, sex, daily_calorie_goal, daily_protein_goal').eq('id', userId).single(),
      supabaseAdmin.from('body_metrics').select('weight_lbs, body_fat_percentage').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      // Fetch nutrition logs with the food's category for better analysis.
      supabaseAdmin.from('nutrition_logs')
        .select('quantity_consumed, food_servings(foods(name, category))') 
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString()),
      supabaseAdmin.from('workout_logs').select('notes, duration_minutes').eq('user_id', userId).gte('created_at', sevenDaysAgo.toISOString())
    ]);

    // Error handling for each database query.
    if (profileRes.error) throw profileRes.error;
    if (metricsRes.error) throw metricsRes.error;
    if (nutritionRes.error) throw nutritionRes.error;
    if (workoutRes.error) throw workoutRes.error;
    if (!profileRes.data) {
      throw new Error("User profile not found. Cannot generate recommendations without goals.");
    }

    const userProfile = profileRes.data;
    const latestMetrics = metricsRes.data;

    // --- 2. Process and summarize the fetched data for the AI prompt. ---
    
    // Group nutrition logs by category and count servings.
    const categoryCounts = nutritionRes.data.reduce((acc, log) => {
      const category = log.food_servings?.foods?.category || 'Uncategorized';
      const quantity = log.quantity_consumed || 0;
      acc[category] = (acc[category] || 0) + quantity;
      return acc;
    }, {});

    // Format the summary into a human-readable string for the prompt.
    const nutritionSummary = Object.entries(categoryCounts)
      .map(([category, count]) => `- ${category}: ${count} serving(s)`)
      .join('\n');

    // --- 3. Construct the full prompt for the AI. ---
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

      7-Day Nutrition Summary (by category):
      ${nutritionSummary || 'No nutrition logged.'}

      Recent Workouts:
      ${workoutRes.data.map((log) => `- ${log.notes || 'Workout'} for ${log.duration_minutes} minutes`).join('\n') || 'No workouts logged.'}

      Based on this data, provide a response in valid JSON format, focused on nutrition. The response must be a JSON object with two keys: "analysis_summary" and "recommendations".
      Here is the required JSON structure:
      {
        "analysis_summary": "A brief, one-sentence summary of their recent activity and diet.",
        "recommendations": [
          {
            "title": "Nutrition Recommendation Title 1",
            "reason": "Explain WHY this recommendation is important based on their specific data (e.g., their food category summary).",
            "action": "Provide a simple, concrete action they can take related to their diet."
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
        temperature: 0.7 // A higher temperature allows for more creative and varied recommendations.
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
    // Generic error handler.
    console.error("Error caught in function:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});