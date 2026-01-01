/**
 * @file supabase/functions/update-workout-set/index.ts
 * @description Edge Function to update workout set entry data with authentication and RLS enforcement.
 * 
 * This function safely updates a workout log entry (set) in the workout_log_entries
 * table. It allows modification of weight lifted and reps completed while enforcing
 * security by verifying the user owns the workout log that contains the entry.
 * 
 * @project Felony Fitness
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-05
 * 
 * @workflow
 * 1. Validates user authentication via Authorization header
 * 2. Receives entry_id, weight, and reps data
 * 3. Verifies the entry belongs to a workout log owned by the authenticated user
 * 4. Updates the entry in workout_log_entries table
 * 5. Returns updated entry data or detailed error message
 * 
 * @security
 * - Requires valid JWT token in Authorization header
 * - Uses RLS policies to ensure user can only update their own entries
 * - Validates entry ownership before update
 * - Prevents unauthorized modification of other users' workout data
 * - Validates data types and ranges for weight/reps
 * 
 * @param {Object} body - Request body
 * @param {string} body.entry_id - UUID of the workout set entry to update
 * @param {number} body.weight_lbs - Weight in pounds (must be positive)
 * @param {number} body.reps_completed - Number of reps completed (must be positive integer)
 * 
 * @returns {Response} JSON response with updated entry or error
 * @returns {Object} response.body - Response body
 * @returns {Object} response.body.entry - Updated workout entry object
 * @returns {string} response.body.error - Error message if update failed
 * 
 * @example
 * // Request
 * POST /functions/v1/update-workout-set
 * Headers: { Authorization: "Bearer <jwt_token>" }
 * Body: {
 *   entry_id: "abc-123-def-456",
 *   weight_lbs: 185,
 *   reps_completed: 10
 * }
 * 
 * // Success Response (200)
 * {
 *   entry: {
 *     id: "abc-123-def-456",
 *     weight_lbs: 185,
 *     reps_completed: 10,
 *     ...
 *   }
 * }
 * 
 * // Error Response (400/401/500)
 * { error: "Entry not found or unauthorized" }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * CORS headers for cross-origin requests
 * Allows requests from any origin with POST method
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Main Edge Function handler for workout set updates
 * 
 * @async
 * @function serve
 * @param {Request} req - HTTP request object
 * @returns {Promise<Response>} JSON response with updated entry or error
 * 
 * @description Handles POST requests to update workout set entries.
 * Validates authentication, verifies ownership, validates data,
 * and updates the entry with proper error handling and security checks.
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const payload = await req.json();
    const { entry_id, weight_lbs, reps_completed } = payload;

    // Validate required parameters
    if (!entry_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: entry_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate data types and values
    if (weight_lbs !== undefined && weight_lbs !== null) {
      const weight = Number(weight_lbs);
      if (isNaN(weight) || weight < 0) {
        return new Response(
          JSON.stringify({ error: "Invalid weight_lbs: must be a non-negative number" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (reps_completed !== undefined && reps_completed !== null) {
      const reps = Number(reps_completed);
      if (isNaN(reps) || reps < 0 || !Number.isInteger(reps)) {
        return new Response(
          JSON.stringify({ error: "Invalid reps_completed: must be a non-negative integer" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // At least one field must be provided for update
    if (weight_lbs === undefined && reps_completed === undefined) {
      return new Response(
        JSON.stringify({ error: "At least one of weight_lbs or reps_completed must be provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's authentication context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the entry exists and belongs to user's workout log
    const { data: entry, error: fetchError } = await supabase
      .from("workout_log_entries")
      .select("id, workout_log_id")
      .eq("id", entry_id)
      .maybeSingle();

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: `Failed to verify entry: ${fetchError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!entry) {
      return new Response(
        JSON.stringify({ error: "Entry not found or unauthorized" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Additional security: verify the workout log belongs to the user
    const { data: workoutLog, error: logError } = await supabase
      .from("workout_logs")
      .select("user_id")
      .eq("id", entry.workout_log_id)
      .single();

    if (logError || !workoutLog || workoutLog.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Entry does not belong to your workout log" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build update object with only provided fields
    interface UpdateData {
      weight_lbs?: number;
      reps_completed?: number;
    }

    const updateData: UpdateData = {};
    if (weight_lbs !== undefined && weight_lbs !== null) {
      updateData.weight_lbs = Number(weight_lbs);
    }
    if (reps_completed !== undefined && reps_completed !== null) {
      updateData.reps_completed = Number(reps_completed);
    }

    // Update the entry
    // RLS policy will enforce that user can only update their own entries
    const { data: updatedEntry, error: updateError } = await supabase
      .from("workout_log_entries")
      .update(updateData)
      .eq("id", entry_id)
      .select()
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ error: `Update failed: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Success response with updated entry
    return new Response(
      JSON.stringify({ entry: updatedEntry }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    // Catch-all error handler for unexpected errors
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
