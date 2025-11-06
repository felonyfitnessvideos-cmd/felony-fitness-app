/**
 * @file supabase/functions/exercise-search/index.ts
 * @description Edge Function to perform a hybrid search for exercises.
 *
 * @project Felony Fitness
 *
 * @workflow
 * 1. Receives a search query from the client application.
 * 2. First, it searches the local `exercises` table in the Supabase database
 * for a case-insensitive match.
 * 3. If local results are found, it returns them immediately, flagged with `source: 'local'`.
 * 4. If no local results are found, it dynamically fetches the comprehensive list of
 * muscle groups from the `muscle_groups` table.
 * 5. It then constructs a detailed prompt for the OpenAI API, instructing the AI to find
 * the exercise and categorize it using the exact muscle group names from the database.
 * 6. The AI's response is parsed and sent back to the client, flagged with `source: 'external'`.
 *
 * This creates a "self-improving" database system. The client application is responsible
 * for saving any new exercises returned from the 'external' source back into the
 * database, so they can be found locally in future searches.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Retrieve the OpenAI API key from environment variables.
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

/**
 * The main server function that handles incoming search requests.
 * @param {Request} req - The incoming HTTP request object, expected to contain a JSON body with a 'query' property.
 * @returns {Response} A JSON response containing the search results or an error.
 */
Deno.serve(async (req) => {
  // Standard handling for CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    let body;
    try {
      body = await req.json();
      console.log('Received request body:', body);
    } catch (jsonErr) {
      console.error('Error parsing JSON body:', jsonErr);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const { query } = body || {};
    if (!query) {
      console.error('Missing query in request body:', body);
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create an admin client to interact with the database using the service role key.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Step 1: Search the local database first for performance and cost-saving. ---
    const { data: localResults, error: localError } = await supabaseAdmin
      .from('exercises')
      .select('*') // Only select from exercises table
      .ilike('name', `%${query}%`) // Case-insensitive search
      .limit(5);

    if (localError) {
      console.error('Supabase exercises query error:', localError);
      throw localError;
    }

    // If local results are found, return them immediately.
    if (localResults.length > 0) {
      return new Response(JSON.stringify({ results: localResults, source: 'local' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // --- Step 2: If no local results, proceed to the AI fallback. ---

    // Dynamically fetch the current list of muscle groups from the database.
    // This makes the prompt adaptable to future changes in the DB schema.
    const { data: muscleGroups, error: muscleError } = await supabaseAdmin
      .from('muscle_groups')
      .select('name');
    if (muscleError) {
      console.error('Supabase muscle_groups query error:', muscleError);
      throw muscleError;
    }
    const muscleGroupList = muscleGroups.map(mg => mg.name);

    // Construct a detailed, structured prompt for the OpenAI API.
    const prompt = `
      Provide details for the exercise "${query}". 
      Classify its primary muscle into ONE of the following specific categories: ${muscleGroupList.join(', ')}.
      Respond in valid JSON with a "results" array containing one object with keys: 
      "name" (string), "type" (enum: 'Strength', 'Cardio', 'Flexibility'), and "primary_muscle" (the chosen category string).
      Example: {"results": [{"name": "Incline Dumbbell Press", "type": "Strength", "primary_muscle": "Upper Chest"}]}
    `;

    // Make the request to the OpenAI Chat Completions endpoint.
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
        temperature: 0.1 // Lower temperature for more deterministic, predictable results.
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API request failed: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const externalResults = JSON.parse(aiData.choices[0].message.content);

    // Return the AI-generated results to the client.
    return new Response(JSON.stringify({ ...externalResults, source: 'external' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    // Generic error handler for any failures in the try block.
    return new Response(JSON.stringify({ error: (err as Error)?.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});