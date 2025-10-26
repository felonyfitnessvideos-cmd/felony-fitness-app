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
import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY: string | undefined = Deno.env.get('OPENAI_API_KEY');

// --- Types used in this function ---
interface UserProfile {
  dob?: string | null;
  sex?: string | null;
  daily_calorie_goal?: number | null;
  daily_protein_goal?: number | null;
  diet_preference?: string | null;
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
        // Include diet_preference when available so recommendations can respect
        // vegetarian/vegan preferences. If the column is not present in the DB
        // the query will surface an error which the function will report.
        .select('dob, sex, daily_calorie_goal, daily_protein_goal, diet_preference')
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
        // The schema in some deployments stores `food_servings` as a
        // separate table and the `nutrition_logs` row holds a
        // `food_servings_id` reference. Select the log id and the
        // food_servings_id so we can resolve the actual servings in a
        // follow-up query. This is robust across both schemas.
        .select('id, food_servings_id')
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
    // Defensive: if a previous deployment used a nested select that caused
    // a PostgREST error about non-existent expanded columns, re-run a
    // simpler query selecting the raw `food_servings` column. This helps
    // during staged schema rollouts or client/server mismatches.
    if (nutritionRes.error) {
      const msg = String(nutritionRes.error.message || '').toLowerCase();
      if (msg.includes('food_servings_1') || msg.includes('quantity_consumed')) {
        console.warn('Nested nutrition select failed; retrying with raw food_servings select');
        const fallback = await supabase
          .from('nutrition_logs')
          .select('food_servings')
          .eq('user_id', userId)
          .gte('created_at', sevenDaysAgo.toISOString());
        if (fallback.error) throw new Error('Nutrition query failed: ' + (fallback.error.message ?? 'unknown'));
        // replace nutritionRes with fallback shape so downstream code continues
        // to treat nutritionRes.data as an array of rows with food_servings.
        (nutritionRes as any).data = fallback.data;
      } else {
        throw new Error('Nutrition query failed: ' + (nutritionRes.error.message ?? 'unknown'));
      }
    }
    if (workoutRes.error) throw new Error('Workout query failed: ' + (workoutRes.error.message ?? 'unknown'));

    if (!profileRes.data) {
      throw new Error('User profile not found. Cannot generate recommendations without goals.');
    }

  const userProfile = profileRes.data as UserProfile;
  const latestMetrics = metricsRes.data as BodyMetrics | undefined;

    // Build category counts. Support two storage patterns:
    // 1) `nutrition_logs` contains a `food_servings` JSON array on the row.
    // 2) `food_servings` is a separate table and `nutrition_logs` contains
    //    a `food_servings_id` reference. We detect the pattern and fetch
    //    servings accordingly.
    let categoryCounts: Record<string, number> = {};

    const rows = nutritionRes.data || [];
    if (rows.length === 0) {
      categoryCounts = {};
    } else if (Array.isArray(rows) && rows[0] && Object.prototype.hasOwnProperty.call(rows[0], 'food_servings')) {
      // Pattern 1: inline food_servings JSON on each log row
      categoryCounts = (rows as any[]).reduce((acc: Record<string, number>, log: any) => {
        const servings = Array.isArray(log.food_servings) ? log.food_servings : [];
        for (const s of servings) {
          const category = s?.foods?.category ?? 'Uncategorized';
          const qty = Number.isFinite(s?.quantity_consumed) ? s.quantity_consumed : 1;
          acc[category] = (acc[category] ?? 0) + qty;
        }
        return acc;
      }, {} as Record<string, number>);
    } else {
      // Pattern 2: separate food_servings table referenced by food_servings_id
      // Collect all referenced IDs (support single ID or arrays of IDs)
      const ids = new Set<number | string>();
      for (const r of rows) {
        const ref = r?.food_servings_id;
        if (!ref) continue;
        if (Array.isArray(ref)) {
          for (const id of ref) ids.add(id);
        } else if (typeof ref === 'string' && ref.includes(',')) {
          // sometimes stored as comma-separated list
          for (const id of ref.split(',').map(s => s.trim()).filter(Boolean)) ids.add(id);
        } else {
          ids.add(ref);
        }
      }

      const idList = Array.from(ids);
      if (idList.length > 0) {
        // Try to fetch referenced food_servings rows by id.
        const fsRes = await supabase
          .from('food_servings')
          .select('id, quantity_consumed, quantity, qty, foods(name, category), category, food_name, created_at')
          .in('id', idList as any[]);

        if (fsRes.error) {
          // If the direct join fails (schema mismatch), fall back to searching
          // the `food_servings` table by user and time window below.
          console.warn('Direct food_servings lookup by id failed, will try time-window fallback:', String(fsRes.error.message || fsRes.error));
        } else if (fsRes.data && fsRes.data.length > 0) {
          categoryCounts = (fsRes.data || []).reduce((acc: Record<string, number>, s: any) => {
            // determine category field
            const category = s?.foods?.category ?? s?.category ?? s?.food?.category ?? s?.food_name ?? 'Uncategorized';
            const qty = Number.isFinite(s?.quantity_consumed) ? s.quantity_consumed : (Number.isFinite(s?.quantity) ? s.quantity : (Number.isFinite(s?.qty) ? s.qty : 1));
            acc[category] = (acc[category] ?? 0) + qty;
            return acc;
          }, {} as Record<string, number>);
        }
      }

      // If we still have no categoryCounts (schema variant), try a broad fallback:
      // query the food_servings table for entries in the last 7 days for this user.
      if (!Object.keys(categoryCounts).length) {
        try {
          const broad = await supabase
            .from('food_servings')
            .select('id, quantity_consumed, quantity, qty, foods(name, category), category, food_name, user_id, created_at')
            .eq('user_id', userId)
            .gte('created_at', sevenDaysAgo.toISOString());

          if (!broad.error && Array.isArray(broad.data) && broad.data.length > 0) {
            categoryCounts = (broad.data || []).reduce((acc: Record<string, number>, s: any) => {
              const category = s?.foods?.category ?? s?.category ?? s?.food?.category ?? s?.food_name ?? 'Uncategorized';
              const qty = Number.isFinite(s?.quantity_consumed) ? s.quantity_consumed : (Number.isFinite(s?.quantity) ? s.quantity : (Number.isFinite(s?.qty) ? s.qty : 1));
              acc[category] = (acc[category] ?? 0) + qty;
              return acc;
            }, {} as Record<string, number>);
          }
        } catch (broadErr) {
          console.warn('Broad food_servings fallback failed:', String(broadErr));
          // fall through to possibly empty categoryCounts
        }
      }
    }

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
  '- Diet: ' + (userProfile.diet_preference ?? 'None'),
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

    // Temporary debug response: if caller includes ?debug=1 or header x-debug: true
    // return a safe, non-sensitive snapshot of computed inputs (no secrets).
    try {
      const url = new URL(req.url);
      const debugQuery = url.searchParams.get('debug') === '1';
      const debugHeader = (req.headers.get('x-debug') || '').toLowerCase() === 'true';
      const debugMode = debugQuery || debugHeader;
      if (debugMode) {
        // Build a small, safe debug payload (avoid PII like full DOB or tokens).
        const safeProfile = {
          daily_calorie_goal: userProfile.daily_calorie_goal ?? null,
          daily_protein_goal: userProfile.daily_protein_goal ?? null,
          diet_preference: userProfile.diet_preference ?? null,
        };

        const debugPayload = {
          debug: true,
          user_id: userId,
          profile: safeProfile,
          nutrition_summary_preview: nutritionSummary.slice(0, 2000),
          recent_workouts_preview: workoutsList.slice(0, 2000),
          prompt_preview: prompt.slice(0, 2000),
        };

        return new Response(JSON.stringify(debugPayload), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    } catch (dbgErr) {
      // If debug path check fails for any reason, continue to normal flow.
      // Use String(...) to avoid relying on dbgErr having a `message` property.
      console.warn('Debug path check failed:', String(dbgErr));
    }

    // Call OpenAI. Be defensive: capture status and body to help debug
    // transient upstream issues. Do NOT log API keys or full responses.
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
      // Include some diagnostic context in logs and return a 502 to the client.
      const errorText = await aiResponse.text();
      const truncated = (errorText || '').slice(0, 2000);
      console.error('OpenAI API error', { status: aiResponse.status, bodyPreviewLength: truncated.length });
      console.error('OpenAI API body preview:', truncated);
      return new Response(JSON.stringify({ error: 'Upstream AI service error', detail: `OpenAI status ${aiResponse.status}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502,
      });
    }

    const aiData = await aiResponse.json().catch((e) => {
      console.error('OpenAI JSON parse error:', e?.message ?? e);
      return null;
    });
    const aiText = aiData?.choices?.[0]?.message?.content;
    if (!aiText) {
      console.error('OpenAI returned missing content; choice count:', (aiData?.choices || []).length);
      return new Response(JSON.stringify({ error: 'AI returned unexpected response' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502,
      });
    }

    let recommendations;
    try {
      recommendations = JSON.parse(aiText);
    } catch (e) {
      // Log a preview of the AI text to help debugging, but avoid logging secrets.
      const preview = (aiText || '').slice(0, 2000);
      console.error('Failed to parse AI JSON; preview length:', preview.length);
      console.error('AI text preview:', preview);
      return new Response(JSON.stringify({ error: 'AI returned unparsable JSON' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 502,
      });
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