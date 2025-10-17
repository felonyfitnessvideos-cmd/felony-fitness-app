import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// Define the static UUIDs for your exercise categories
const CATEGORY_IDS = {
  Strength: 'c8f3a3a8-e1c7-4b3c-9b4d-9e1b2a3c4d5e',
  Cardio: 'b3a3a3a8-e1c7-4b3c-9b4d-9e1b2a3c4d5f',
  Flexibility: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5g'
};

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
    
    // Dynamically fetch your detailed muscle group list
    const { data: muscleGroups, error: muscleError } = await supabaseAdmin
      .from('muscle_groups')
      .select('name');
    if (muscleError) throw muscleError;
    const muscleGroupList = muscleGroups.map(mg => mg.name);

    // Step 1: Search your local database first
    const { data: localResults, error: localError } = await supabaseAdmin
      .from('exercises')
      .select('*, exercise_muscle_groups(*, muscle_groups(*))')
      .ilike('name', `%${query}%`)
      .limit(5);
    if (localError) throw localError;

    if (localResults.length > 0) {
      return new Response(JSON.stringify({ results: localResults, source: 'local' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Step 2: Call OpenAI with a more detailed prompt
    const prompt = `
      Provide details for the exercise "${query}".
      - "description": A concise, one-sentence description of how to perform the exercise.
      - "primary_muscle": Classify its main muscle into ONE of the following specific categories: ${muscleGroupList.join(', ')}.
      - "category_id": Classify the exercise type. Use '${CATEGORY_IDS.Strength}' for Strength, '${CATEGORY_IDS.Cardio}' for Cardio, or '${CATEGORY_IDS.Flexibility}' for Flexibility.
      Respond in valid JSON: {"results": [{"name": string, "description": string, "primary_muscle": string, "category_id": UUID}]}
    `;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.1
        })
    });

    if (!aiResponse.ok) throw new Error(`AI API request failed: ${await aiResponse.text()}`);

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