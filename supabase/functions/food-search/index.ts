/**
 * @file supabase/functions/food-search/index.ts
 * @description Edge Function to perform a hybrid search for food items.
 *
 * @project Felony Fitness
 *
 * @workflow
 * 1. Receives a search query from the client application.
 * 2. It first performs a case-insensitive search on the local `foods` table in the database.
 * This local search is fast, free, and personalized to foods the user has logged before.
 * 3. If any matching foods are found locally, it returns them immediately, flagged with `source: 'local'`.
 * The result includes the food's details and all its associated serving sizes.
 * 4. If no local results are found, it calls the OpenAI API as a fallback.
 * 5. It constructs a prompt asking the AI for nutritional information for the query,
 * requesting up to three common serving sizes.
 * 6. The AI's JSON response is parsed and sent back to the client, flagged with `source: 'external'`.
 *
 * This function enables a "self-improving" database. The client app is responsible for
 * saving any new food selected from an 'external' source back into the database via the
 * `log_food_item` RPC function. This ensures that the next time the user searches for that
 * food, it will be found in the fast local search.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Retrieve the OpenAI API key from environment variables.
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

/**
 * The main server function that handles incoming food search requests.
 * @param {Request} req - The incoming HTTP request object, expected to contain a JSON body with a 'query' property.
 * @returns {Response} A JSON response containing the search results or an error.
 */
Deno.serve(async (req) => {
  // Standard handling for CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query) {
      throw new Error("Search query is required.");
    }

    // Create an admin client to interact with the database using the service role key.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Step 1: Search your local database first ---
    const { data: localResults, error: localError } = await supabaseAdmin
      .from('foods')
      .select('*, food_servings(*)') // Select the food and all its related servings
      .ilike('name', `%${query}%`)   // Case-insensitive search
      .limit(5);

    if (localError) {
      throw localError;
    }

    // If we find good results locally, return them.
    if (localResults.length > 0) {
      return new Response(JSON.stringify({ results: localResults, source: 'local' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // --- Step 2: If no local results, call OpenAI API as a fallback ---
    const prompt = `Provide nutritional info for "${query}". Give up to 3 common serving sizes. Format as clean, valid JSON like this: {"results": [{"name": string, "serving_description": string, "calories": int, "protein_g": int}]}`;

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
            temperature: 0.2 // A low temperature for factual, consistent nutrition data.
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
    return new Response(JSON.stringify({ error: err.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
    });
  }
});