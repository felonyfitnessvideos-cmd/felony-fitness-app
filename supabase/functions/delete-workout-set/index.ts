/**
 * @file supabase/functions/delete-workout-set/index.ts
 * @description Edge Function to delete a workout set entry with authentication and RLS enforcement.
 * 
 * This function safely deletes a workout log entry (set) from the workout_log_entries
 * table. It enforces security by verifying the user owns the workout log that contains
 * the entry before allowing deletion.
 * 
 * @project Felony Fitness
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-05
 * 
 * @workflow
 * 1. Validates user authentication via Authorization header
 * 2. Receives entry_id (UUID of the workout set to delete)
 * 3. Verifies the entry belongs to a workout log owned by the authenticated user
 * 4. Deletes the entry from workout_log_entries table
 * 5. Returns success confirmation or detailed error message
 * 
 * @security
 * - Requires valid JWT token in Authorization header
 * - Uses RLS policies to ensure user can only delete their own entries
 * - Validates entry ownership before deletion
 * - Prevents unauthorized access to other users' workout data
 * 
 * @param {Object} body - Request body
 * @param {string} body.entry_id - UUID of the workout set entry to delete
 * 
 * @returns {Response} JSON response with success status or error
 * @returns {Object} response.body - Response body
 * @returns {boolean} response.body.success - True if deletion succeeded
 * @returns {string} response.body.error - Error message if deletion failed
 * 
 * @example
 * // Request
 * POST /functions/v1/delete-workout-set
 * Headers: { Authorization: "Bearer <jwt_token>" }
 * Body: {
 *   entry_id: "abc-123-def-456"
 * }
 * 
 * // Success Response (200)
 * { success: true }
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
 * Main Edge Function handler for workout set deletion
 * 
 * @async
 * @function serve
 * @param {Request} req - HTTP request object
 * @returns {Promise<Response>} JSON response with success status or error
 * 
 * @description Handles POST requests to delete workout set entries.
 * Validates authentication, verifies ownership, and deletes the entry
 * with proper error handling and security checks.
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
    const { entry_id } = payload;

    // Validate required parameters
    if (!entry_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: entry_id" }),
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
    // This query will fail via RLS if user doesn't own the parent workout log
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

    // Delete the entry
    // RLS policy will enforce that user can only delete their own entries
    const { error: deleteError } = await supabase
      .from("workout_log_entries")
      .delete()
      .eq("id", entry_id);

    if (deleteError) {
      return new Response(
        JSON.stringify({ error: `Delete failed: ${deleteError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Success response
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    // Catch-all error handler for unexpected errors
    return new Response(
      JSON.stringify({ error: err?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
