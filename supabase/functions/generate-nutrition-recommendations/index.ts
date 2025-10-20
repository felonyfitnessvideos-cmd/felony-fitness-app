/**
 * generate-nutrition-recommendations
 * Edge Function that returns personalized nutrition recommendations for an
 * authenticated user. Inputs:
 * - Authorization header with a valid access token
 * - SUPABASE_URL and SUPABASE_ANON_KEY available in function env
 * Output: JSON object matching { analysis_summary, recommendations }
 * Errors: returns 401 for auth failures, 503 if OPENAI_API_KEY is missing.
 */

// Minimal local type shims so TypeScript can check this Deno-run file.
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

// @ts-expect-error: CDN ESM import used in Deno runtime; local types are not available.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors';

const OPENAI_API_KEY: string | undefined = Deno.env.get('OPENAI_API_KEY');

// --- Types used in this function ---
interface UserProfile {
  dob?: string | null;
  sex?: string | null;
  daily_calorie_goal?: number | null;
  daily_protein_goal?: number | null;
}

interface BodyMetrics {
  weight_lbs?: number | null;
  body_fat_percentage?: number | null;
}

interface Food {
  name?: string | null;
  category?: string | null;
}

interface FoodServing {
  quantity_consumed?: number | null;
  foods?: Food | null;
}

interface NutritionLogEntry {
  food_servings?: FoodServing[] | null;
}

const calculateAge = (dob: string | null | undefined) => {
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

    const rawAuth = req.headers.get('Authorization') || '';
    const match = rawAuth.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      console.warn('generate-nutrition-recommendations: invalid or missing Authorization header');
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer realm="supabase", error="invalid_token"',
        },
        status: 401,
      });
    }

    const accessToken = match[1];
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    // Fail fast if environment is misconfigured to avoid obscure runtime failures
    const missingEnv: string[] = [];
    if (!supabaseUrl) missingEnv.push('SUPABASE_URL');
    if (!supabaseAnonKey) missingEnv.push('SUPABASE_ANON_KEY');
    if (missingEnv.length) {
      console.error('Missing environment variables for function:', missingEnv.join(', '));
      return new Response(JSON.stringify({ error: 'Service configuration error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Pass a normalized Authorization header with the extracted token only
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: 'Bearer ' + accessToken } },
    });

    const maskedPrefix = accessToken.slice(0, 12) + '...';

  // Supabase client library types are not available here; cast to any for typed destructuring.
  const { data: { user } = {}, error: authError }: { data?: { user?: any }, error?: any } = await (supabase as any).auth.getUser();
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
        // food_servings is stored as an array of servings; select per-serving quantity and food metadata
        .select('food_servings(quantity_consumed, foods(name, category))')
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

  const userProfile = profileRes.data as UserProfile;
  const latestMetrics = metricsRes.data as BodyMetrics | undefined;

    const categoryCounts = (nutritionRes.data || []).reduce((acc: Record<string, number>, log: any) => {
      const servings = Array.isArray(log.food_servings) ? log.food_servings : [];
      for (const s of servings) {
        const category = s?.foods?.category ?? 'Uncategorized';
        const qty = Number.isFinite(s?.quantity_consumed) ? s.quantity_consumed : 1;
        acc[category] = (acc[category] ?? 0) + qty;
      }
      return acc;
    }, {} as Record<string, number>);

    const nutritionSummary = Object.entries(categoryCounts)
      .map(([category, count]) => '- ' + category + ': ' + count + ' serving(s)')
      .join('\n');

    const workoutsList = (workoutRes.data || [])
      .map((log: any) => {
        const notes = log?.notes || 'Workout';
        // Use nullish coalescing so 0 is preserved but null/undefined become 'unknown'
        const duration = log?.duration_minutes ?? 'unknown';
        return `- ${notes} for ${duration} minutes`;
      })
      .join('\n') || 'No workouts logged.';

    const prompt = [
      'You are an expert fitness and nutrition coach for Felony Fitness, an organization helping formerly incarcerated individuals.',
      'Your tone should be encouraging, straightforward, and supportive.',
      'Analyze the following user data from the last 7 days and provide 3 actionable nutrition-related recommendations.',
      'User Profile:',
      '- Age: ' + (calculateAge(userProfile.dob)),
      '- Sex: ' + (userProfile.sex ?? 'Unknown'),
      '- Weight: ' + (latestMetrics?.weight_lbs || 'N/A') + ' lbs',
      '- Body Fat: ' + (latestMetrics?.body_fat_percentage || 'N/A') + '%',
      'User Goals:',
      '- Calories: ' + (userProfile.daily_calorie_goal ?? 'N/A'),
      '- Protein: ' + (userProfile.daily_protein_goal ?? 'N/A') + 'g',
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
      console.error('OpenAI API error status:', aiResponse.status, 'length:', errorText?.length ?? 0);
      throw new Error('AI API request failed');
    }

    const aiData = await aiResponse.json();
    const aiText = aiData?.choices?.[0]?.message?.content;
    if (!aiText) {
      console.error('OpenAI returned missing content; choice count:', (aiData?.choices || []).length);
      throw new Error('AI returned an unexpected response');
    }

    let recommendations;
    try {
      recommendations = JSON.parse(aiText);
    } catch (e) {
      console.error('Failed to parse AI JSON; length:', (aiText || '').length, e);
      throw new Error('AI returned unparsable JSON');
    }

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    // Log the full error server-side (including stack) for operators.
    console.error('Function error:', err?.stack ?? err?.message ?? String(err));

    // Map well-known error messages to appropriate HTTP statuses.
    const msg = String(err?.message || 'Internal error').toLowerCase();
    let status = 500;
    let clientMessage = 'Internal server error';

    if (msg.includes('profile query failed') || msg.includes('user profile not found') || msg.includes('invalid')) {
      status = 400;
      clientMessage = 'Invalid request';
    } else if (msg.includes('ai api request failed') || msg.includes('ai returned')) {
      status = 502;
      clientMessage = 'Upstream service unavailable';
    } else if (msg.includes('service configuration error')) {
      status = 500;
      clientMessage = 'Service configuration error';
    }

    return new Response(JSON.stringify({ error: clientMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    });
  }
});