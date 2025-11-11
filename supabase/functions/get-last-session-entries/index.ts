/**
 * @file supabase/functions/get-last-session-entries/index.ts
 * @description Edge Function to retrieve workout entries from the user's most recent session for a given exercise.
 * 
 * This function finds and returns the workout log entries (sets) from the user's
 * last completed workout session for a specific exercise. This allows users to see
 * their previous performance for comparison and progressive overload tracking.
 * 
 * @project Felony Fitness
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-05
 * 
 * @workflow
 * 1. Validates user authentication via Authorization header
 * 2. Receives user_id, exercise_id, and optional routine_id
 * 3. Finds the most recent completed workout log for the user/routine
 * 4. Retrieves all entries for the specified exercise from that session
 * 5. Returns the entries ordered by set number
 * 
 * @security
 * - Requires valid JWT token in Authorization header
 * - Uses RLS policies to ensure user can only access their own workout data
 * - Validates user_id matches authenticated user
 * - Filters by user ownership automatically
 * 
 * @param {Object} body - Request body
 * @param {string} body.user_id - UUID of the user (must match authenticated user)
 * @param {string} body.exercise_id - UUID of the exercise to get entries for
 * @param {string} [body.routine_id] - Optional UUID of the routine to filter by
 * 
 * @returns {Response} JSON response with workout entries or error
 * @returns {Object} response.body - Response body
 * @returns {Array<Object>} response.body.entries - Array of workout log entries from last session
 * @returns {string} response.body.error - Error message if retrieval failed
 * 
 * @example
 * // Request
 * POST /functions/v1/get-last-session-entries
 * Headers: { Authorization: "Bearer <jwt_token>" }
 * Body: {
 *   user_id: "user-123",
 *   exercise_id: "exercise-456",
 *   routine_id: "routine-789"
 * }
 * 
 * // Success Response (200)
 * {
 *   entries: [
 *     {
 *       id: "entry-1",
 *       set_number: 1,
 *       weight_lbs: 185,
 *       reps_completed: 10,
 *       exercise_id: "exercise-456",
 *       ...
 *     },
 *     ...
 *   ]
 * }
 * 
 * // No previous session (200)
 * { entries: [] }
 * 
 * // Error Response (400/401/500)
 * { error: "User mismatch: user_id does not match authenticated user" }
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
 * Main Edge Function handler for retrieving last session entries
 * 
 * @async
 * @function serve
 * @param {Request} req - HTTP request object
 * @returns {Promise<Response>} JSON response with workout entries or error
 * 
 * @description Handles POST requests to retrieve previous workout data.
 * Finds the most recent workout log, fetches entries for the specified
 * exercise, and returns them for comparison purposes.
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
    const { user_id, exercise_ids, routine_id } = payload;

    // Validate required parameters
    // Support both single exercise_id (backward compatibility) and multiple exercise_ids (batched)
    const exerciseIdsArray = exercise_ids || (payload.exercise_id ? [payload.exercise_id] : null);
    
    if (!user_id || !exerciseIdsArray || exerciseIdsArray.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: user_id and exercise_ids (or exercise_id) are required" }),
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

    // Verify user_id matches authenticated user (security check)
    if (user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "User mismatch: user_id does not match authenticated user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    console.log(`[get-last-session-entries] Looking for last session before today (${todayISO})`);

    // Build query for most recent workout log BEFORE today
    // This ensures we only get previous sessions, not today's workout
    let workoutQuery = supabase
      .from("workout_logs")
      .select("id, log_date, created_at")
      .eq("user_id", user_id)
      .eq("is_complete", true)
      .lt("created_at", today.toISOString()) // Only get workouts before today
      .order("created_at", { ascending: false });

    // Optionally filter by routine if provided
    if (routine_id) {
      workoutQuery = workoutQuery.eq("routine_id", routine_id);
    }

    // Get the most recent workout log before today
    const { data: recentLogs, error: logError } = await workoutQuery.limit(1);

    if (logError) {
      console.error(`[get-last-session-entries] Error fetching logs:`, logError);
      return new Response(
        JSON.stringify({ error: `Failed to fetch workout logs: ${logError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no previous workout found, return empty array
    if (!recentLogs || recentLogs.length === 0) {
      console.log(`[get-last-session-entries] No previous sessions found for routine ${routine_id}`);
      return new Response(
        JSON.stringify({ entries: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lastLogId = recentLogs[0].id;
    console.log(`[get-last-session-entries] Found previous session: log_id=${lastLogId}, date=${recentLogs[0].created_at}`);

    // Get all entries for the specified exercises from that workout log (batched query)
    const { data: entries, error: entriesError } = await supabase
      .from("workout_log_entries")
      .select("*")
      .eq("log_id", lastLogId)
      .in("exercise_id", exerciseIdsArray) // Query multiple exercises at once
      .order("set_number", { ascending: true });

    if (entriesError) {
      console.error(`[get-last-session-entries] Error fetching entries:`, entriesError);
      return new Response(
        JSON.stringify({ error: `Failed to fetch entries: ${entriesError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[get-last-session-entries] Found ${entries?.length || 0} total sets for ${exerciseIdsArray.length} exercises`);

    // Group entries by exercise_id for easy lookup on client
    const groupedByExercise = (entries || []).reduce((acc: any, entry: any) => {
      if (!acc[entry.exercise_id]) {
        acc[entry.exercise_id] = [];
      }
      acc[entry.exercise_id].push(entry);
      return acc;
    }, {});

    // Return grouped entries (backward compatible: if single exercise, return entries array)
    // If multiple exercises requested, return object keyed by exercise_id
    if (exerciseIdsArray.length === 1) {
      // Backward compatibility: single exercise returns entries array
      return new Response(
        JSON.stringify({ entries: groupedByExercise[exerciseIdsArray[0]] || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Batched request: return object with exercise_id keys
      return new Response(
        JSON.stringify({ entriesByExercise: groupedByExercise }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err: any) {
    // Catch-all error handler for unexpected errors
    return new Response(
      JSON.stringify({ error: err?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
