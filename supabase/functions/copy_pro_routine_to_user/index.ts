/**
 * @file supabase/functions/copy_pro_routine_to_user/index.ts
 * @description Edge Function to copy professional workout routines to user accounts.
 * 
 * This function enables users to add pre-built professional workout routines
 * to their personal routine library. It creates a complete copy of the routine
 * including all exercises, maintaining the original structure while assigning
 * new UUIDs and user ownership.
 * 
 * @project Felony Fitness
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-02
 * 
 * @workflow
 * 1. Receives pro_routine_id and user_id from client
 * 2. Fetches the professional routine from pro_routines table
 * 3. Creates a new workout_routines record with user ownership
 * 4. Copies all exercises from pro_routine_exercises to routine_exercises
 * 5. Generates new UUIDs for all copied records
 * 6. Returns the newly created routine with all exercises
 * 
 * @security
 * - Uses service role for database operations (bypasses RLS)
 * - Validates required parameters before processing
 * - Generates secure UUIDs for all new records
 * 
 * @param {Object} body - Request body
 * @param {string} body.pro_routine_id - UUID of the professional routine to copy
 * @param {string} body.user_id - UUID of the user to assign the routine to
 * 
 * @returns {Response} JSON response with created routine or error
 * @returns {Object} response.body - Response body
 * @returns {Object} response.body.routine - Created workout routine with exercises
 * @returns {string} response.body.error - Error message if copy failed
 * 
 * @example
 * // Request
 * POST /functions/v1/copy_pro_routine_to_user
 * Body: {
 *   pro_routine_id: "abc-123",
 *   user_id: "user-456"
 * }
 * 
 * // Success Response
 * {
 *   routine: {
 *     id: "new-789",
 *     user_id: "user-456",
 *     routine_name: "Full Body Strength",
 *     exercises: [...]
 *   }
 * }
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

/**
 * Generate a secure UUID v4
 * 
 * @function generateUUID
 * @returns {string} - UUID v4 string
 * @description Uses the Web Crypto API to generate cryptographically
 * secure random UUIDs for database records.
 */
function generateUUID() {
  return crypto.randomUUID();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { pro_routine_id, user_id } = await req.json();
    if (!pro_routine_id || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing pro_routine_id or user_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the pro routine
    const { data: proRoutine, error: fetchError } = await supabaseAdmin
      .from('pro_routines')
      .select('*')
      .eq('id', pro_routine_id)
      .single();
    if (fetchError || !proRoutine) {
      return new Response(JSON.stringify({ error: 'Pro routine not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Prepare new routine data
    const newRoutine = {
      ...proRoutine,
      id: generateUUID(),
      user_id,
      category: undefined, // Remove category for user routines
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    delete newRoutine.category;

    // Insert into workout_routines
    const { error: insertError } = await supabaseAdmin
      .from('workout_routines')
      .insert([newRoutine]);
    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
