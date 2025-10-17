import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Search query is required.");

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Step 1: Search your local database first ---
    const { data: localResults, error: localError } = await supabaseAdmin
      .from('exercises')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(5);

    if (localError) throw localError;

    // If we find good results locally, return them.
    if (localResults.length > 0) {
      return new Response(JSON.stringify({ results: localResults, source: 'local' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // --- Step 2: If no local results, call OpenAI API ---
    const prompt = `Provide details for the exercise "${query}". Respond in valid JSON with a "results" array containing one object with keys: "name" (string), "type" (enum: 'Strength', 'Cardio', 'Flexibility'), and "primary_muscle" (string). Example: {"results": [{"name": "Barbell Bench Press", "type": "Strength", "primary_muscle": "Chest"}]}`;

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
            temperature: 0.2
        })
    });

    if (!aiResponse.ok) {
        throw new Error(`AI API request failed: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const externalResults = JSON.parse(aiData.choices[0].message.content);

    return new Response(JSON.stringify({ ...externalResults, source: 'external' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
    });
  }
});