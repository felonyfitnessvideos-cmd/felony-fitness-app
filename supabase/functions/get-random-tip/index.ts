/**
 * Get Random Tip Edge Function
 * 
 * @module get-random-tip
 * @description Returns a random fitness or nutrition tip from the tips database.
 * Provides daily motivation and educational content for users.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-05
 * 
 * @security
 * - JWT authentication required
 * - Public read access to tips table
 * - Returns single random tip per request
 * 
 * @example
 * // Get a random tip
 * const { data, error } = await supabase.functions.invoke('get-random-tip', {
 *   body: {}
 * });
 * 
 * console.log(data.tip); // "Stay hydrated! Drink at least 8 glasses of water daily."
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get count of tips
    const { count, error: countError } = await supabase
      .from('tips')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    if (!count || count === 0) {
      return new Response(
        JSON.stringify({
          tip: 'Stay consistent with your fitness goals!',
          category: 'motivation',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Get random offset
    const randomOffset = Math.floor(Math.random() * count);

    // Fetch single random tip
    const { data: tips, error: tipError } = await supabase
      .from('tips')
      .select('*')
      .range(randomOffset, randomOffset)
      .limit(1);

    if (tipError) {
      throw tipError;
    }

    const tip = tips && tips.length > 0 ? tips[0] : null;

    if (!tip) {
      return new Response(
        JSON.stringify({
          tip: 'Keep pushing towards your goals!',
          category: 'motivation',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify(tip),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in get-random-tip:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
