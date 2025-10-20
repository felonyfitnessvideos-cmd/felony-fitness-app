// @ts-nocheck
/**
 * generate-nutrition-recommendations
 * Edge Function that returns personalized nutrition recommendations for an
 * authenticated user. Inputs:
 * - Authorization header with a valid access token
 * - SUPABASE_URL and SUPABASE_ANON_KEY available in function env
 * Output: JSON object matching { analysis_summary, recommendations }
 * Errors: returns 401 for auth failures, 503 if OPENAI_API_KEY is missing.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const calculateAge = (dob: string | null) => {
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
      console.error('OPENAI_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('generate-nutrition-recommendations: missing Authorization header');
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const maskedPrefix = authHeader ? (authHeader.split(' ')[1] || '').slice(0, 12) + '...' : null;

    const { data: { user } = {}, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error(JSON.stringify({
        event: 'auth.resolve_user',
        auth_error_message: authError?.message ?? null,
        auth_header_prefix: maskedPrefix,
      }));

      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const userId = user.id;

    // Fetch the last 7 days of relevant data in parallel
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [profileRes, metricsRes, nutritionRes, workoutRes] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('dob, sex, daily_calorie_goal, daily_protein_goal')
        .eq('id', userId)
        .single(),
      supabase
        .from('body_metrics')
        .select('weight_lbs, body_fat_percentage')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('nutrition_logs')
        .select('quantity_consumed, food_servings(foods(name, category))')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString()),
      supabase
        .from('workout_logs')
        .select('notes, duration_minutes')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString()),
    ]);

    if (profileRes.error) throw new Error('Profile query failed: ' + (profileRes.error.message ?? 'unknown'));
    if (metricsRes.error) throw new Error('Metrics query failed: ' + (metricsRes.error.message ?? 'unknown'));
    if (nutritionRes.error) throw new Error('Nutrition query failed: ' + (nutritionRes.error.message ?? 'unknown'));
    if (workoutRes.error) throw new Error('Workout query failed: ' + (workoutRes.error.message ?? 'unknown'));

    if (!profileRes.data) {
      throw new Error('User profile not found. Cannot generate recommendations without goals.');
    }

    const userProfile = profileRes.data;
    const latestMetrics = metricsRes.data;

    const categoryCounts = (nutritionRes.data || []).reduce((acc: Record<string, number>, log: any) => {
      const category = log.food_servings?.foods?.category || 'Uncategorized';
      const quantity = log.quantity_consumed || 0;
      acc[category] = (acc[category] || 0) + quantity;
      return acc;
    }, {});

    const nutritionSummary = Object.entries(categoryCounts)
      .map(([category, count]) => '- ' + category + ': ' + count + ' serving(s)')
      .join('\n');

    const workoutsList = (workoutRes.data || [])
      .map((log: any) => '- ' + (log.notes || 'Workout') + ' for ' + (log.duration_minutes) + ' minutes')
      .join('\n') || 'No workouts logged.';

    const prompt = [
      'You are an expert fitness and nutrition coach for Felony Fitness, an organization helping formerly incarcerated individuals.',
      'Your tone should be encouraging, straightforward, and supportive.',
      'Analyze the following user data from the last 7 days and provide 3 actionable nutrition-related recommendations.',
      'User Profile:',
      '- Age: ' + (calculateAge(userProfile.dob)),
      '- Sex: ' + (userProfile.sex),
      '- Weight: ' + (latestMetrics?.weight_lbs || 'N/A') + ' lbs',
      '- Body Fat: ' + (latestMetrics?.body_fat_percentage || 'N/A') + '%',
      'User Goals:',
      '- Calories: ' + (userProfile.daily_calorie_goal),
      '- Protein: ' + (userProfile.daily_protein_goal) + 'g',
      '7-Day Nutrition Summary (by category):',
      (nutritionSummary || 'No nutrition logged.'),
      'Recent Workouts:',
      workoutsList,
      'Based on this data, provide a response in valid JSON format, focused on nutrition. The response must be a JSON object with two keys: "analysis_summary" and "recommendations".',
      'Here is the required JSON structure:',
      '{',
      '  "analysis_summary": "A brief, one-sentence summary of their recent activity and diet.",',
      '  "recommendations": [',
      '    {',
      '      "title": "Nutrition Recommendation Title 1",',
      '      "reason": "Explain WHY this recommendation is important based on their specific data (e.g., their food category summary).",',
      '      "action": "Provide a simple, concrete action they can take related to their diet."',
      '    }',
      '  ]',
      '}',
    ].join('\n');

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + OPENAI_API_KEY,
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
      const errorText = await aiResponse.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error('AI API request failed');
    }

    const aiData = await aiResponse.json();
    const aiText = aiData?.choices?.[0]?.message?.content;
    if (!aiText) {
      console.error('OpenAI returned missing content', { aiData });
      throw new Error('AI returned an unexpected response');
    }

    let recommendations;
    try {
      recommendations = JSON.parse(aiText);
    } catch (e) {
      console.error('Failed to parse AI JSON', { aiText });
      throw new Error('AI returned unparsable JSON');
    }

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    console.error('Error caught in function:', err?.message ?? String(err));
    return new Response(JSON.stringify({ error: err?.message || 'Internal error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});