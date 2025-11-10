/**
 * @file supabase/functions/replace-routine-exercises/index.ts
 * @description Edge Function to replace all exercises in a workout routine.
 * 
 * This function replaces the deprecated `replace_routine_exercises` RPC function,
 * providing a more reliable way to update workout routines with proper error handling
 * and RLS (Row Level Security) policy enforcement.
 * 
 * @project Felony Fitness
 * 
 * @workflow
 * 1. Validates that the user is authenticated via Authorization header
 * 2. Validates required parameters (routine_id, routine_name, exercises array)
 * 3. Updates the routine name in the workout_routines table
 * 4. Deletes all existing exercises for this routine from routine_exercises table
 * 5. Inserts the new set of exercises with their order and target sets
 * 
 * @security
 * - Requires valid JWT token in Authorization header
 * - Enforces RLS policies: user can only modify their own routines
 * - Uses user's authentication context for all database operations
 * 
 * @param {Object} body - Request body containing routine data
 * @param {string} body.p_routine_id - UUID of the routine to update
 * @param {string} body.p_name - New name for the routine
 * @param {Array<Object>} body.p_items - Array of exercises to add to the routine
 * @param {string} body.p_items[].exercise_id - UUID of the exercise
 * @param {number} body.p_items[].target_sets - Number of sets for this exercise
 * @param {number} body.p_items[].exercise_order - Position order in the routine (0-indexed)
 * 
 * @returns {Response} JSON response with success status or detailed error message
 * @returns {Object} response.body - Response body
 * @returns {boolean} response.body.success - True if operation succeeded
 * @returns {string} response.body.error - Error message if operation failed
 * 
 * @example
 * // Request
 * POST /functions/v1/replace-routine-exercises
 * Headers: { Authorization: "Bearer <jwt_token>" }
 * Body: {
 *   p_routine_id: "123e4567-e89b-12d3-a456-426614174000",
 *   p_name: "Upper Body Workout",
 *   p_items: [
 *     { exercise_id: "abc...", target_sets: 3, exercise_order: 0 },
 *     { exercise_id: "def...", target_sets: 4, exercise_order: 1 }
 *   ]
 * }
 * 
 * // Success Response (200)
 * { success: true }
 * 
 * // Error Response (400/401/500)
 * { error: "Insert failed: new row violates row-level security policy" }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * CORS headers for cross-origin requests.
 * Allows requests from any origin with POST method and standard headers.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests (OPTIONS method)
  // Returns 204 No Content with CORS headers to allow browser preflight checks
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Verify authentication - JWT token must be present in Authorization header
    // This token is forwarded to Supabase client for RLS policy enforcement
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const payload = await req.json();
    const { p_routine_id, p_name, p_items } = payload;

    // Validate required fields
    if (!p_routine_id || !p_name || !Array.isArray(p_items)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's authentication context
    // This ensures all database operations respect RLS policies for the authenticated user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Step 1: Update the routine name
    // RLS policy ensures user can only update their own routines
    const { error: routineError } = await supabase
      .from("workout_routines")
      .update({ routine_name: p_name })
      .eq("id", p_routine_id);
    if (routineError) {
      return new Response(
        JSON.stringify({ error: `Routine update failed: ${routineError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Prepare new exercises for insertion
    // Map items BEFORE deleting to ensure data is valid
    let itemsToInsert: any[] = [];
    if (p_items.length > 0) {
      itemsToInsert = p_items.map((item: any) => ({
        routine_id: p_routine_id,
        exercise_id: item.exercise_id,
        target_sets: item.target_sets,
        target_reps: item.target_reps || '8-12',
        exercise_order: item.exercise_order,
        is_warmup: item.is_warmup || false
      }));
    }

    // Step 3: Insert new exercises FIRST (with temporary order offset)
    // This ensures exercises exist before we delete old ones
    // Prevents data loss if insert fails due to network/validation errors
    if (itemsToInsert.length > 0) {
      // Add 1000 to exercise_order to avoid conflicts with existing exercises
      const tempItems = itemsToInsert.map(item => ({
        ...item,
        exercise_order: item.exercise_order + 1000
      }));
      
      console.log(`Inserting ${tempItems.length} exercises with temp orders:`, tempItems);
      
      const { error: insertError } = await supabase
        .from("routine_exercises")
        .insert(tempItems);
      
      if (insertError) {
        console.error("Insert error:", insertError);
        // CRITICAL: If insert fails, don't delete old exercises
        // User keeps their existing routine intact
        return new Response(
          JSON.stringify({ error: `Insert failed: ${insertError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("Insert successful, proceeding to delete old exercises");
    }

    // Step 4: Delete OLD exercises (only after new ones are safely inserted)
    // This ensures we always have exercises in the routine
    console.log(`Deleting old exercises for routine ${p_routine_id} with order < 1000`);
    
    const { error: deleteError } = await supabase
      .from("routine_exercises")
      .delete()
      .eq("routine_id", p_routine_id)
      .lt("exercise_order", 1000); // Only delete exercises with original order numbers
    
    if (deleteError) {
      console.error("Delete error:", deleteError);
      // Rollback: Delete the newly inserted exercises since delete of old ones failed
      await supabase
        .from("routine_exercises")
        .delete()
        .eq("routine_id", p_routine_id)
        .gte("exercise_order", 1000);
      
      return new Response(
        JSON.stringify({ error: `Delete failed: ${deleteError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Delete successful, proceeding to update orders");

    // Step 5: Fetch all newly inserted exercises and update their orders one by one
    // We need to use the database ID to uniquely identify each row since exercise_id can repeat
    if (itemsToInsert.length > 0) {
      const { data: insertedExercises, error: fetchError } = await supabase
        .from("routine_exercises")
        .select("id, exercise_id, exercise_order")
        .eq("routine_id", p_routine_id)
        .gte("exercise_order", 1000)
        .order("exercise_order", { ascending: true });
      
      console.log(`Fetched ${insertedExercises?.length || 0} exercises to update orders`);
      
      if (fetchError) {
        console.error("Failed to fetch inserted exercises:", fetchError);
        return new Response(
          JSON.stringify({ error: `Failed to fetch inserted exercises: ${fetchError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (insertedExercises && insertedExercises.length > 0) {
        // Update each exercise's order using its unique database ID
        for (let i = 0; i < insertedExercises.length; i++) {
          const dbRow = insertedExercises[i];
          console.log(`Updating row ${dbRow.id}: order ${dbRow.exercise_order} -> ${i}`);
          
          const { error: updateError } = await supabase
            .from("routine_exercises")
            .update({ exercise_order: i }) // Use array index as the correct order
            .eq("id", dbRow.id); // Use database ID (primary key) for exact match
          
          if (updateError) {
            console.error(`Failed to update order for row ${dbRow.id}:`, updateError);
            return new Response(
              JSON.stringify({ error: `Failed to update exercise order: ${updateError.message}` }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        console.log("All orders updated successfully");
      }
    }

    // Success - all operations completed successfully
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    // Catch-all error handler for unexpected errors (JSON parsing, network issues, etc.)
    return new Response(
      JSON.stringify({ error: err?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
