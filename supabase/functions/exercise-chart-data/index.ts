/**
 * @file supabase/functions/exercise-chart-data/index.ts
 * @description Edge Function to calculate and return exercise progression chart data.
 * 
 * This function provides unified access to multiple exercise tracking metrics
 * for progress visualization. It calculates historical data for weight volume,
 * set volume, and estimated 1RM (one-rep max) across a user's workout history.
 * 
 * @project Felony Fitness
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-05
 * 
 * @workflow
 * 1. Validates user authentication via Authorization header
 * 2. Receives metric type, user_id, and exercise_id
 * 3. Queries workout_log_entries with appropriate calculations
 * 4. Groups data by workout date
 * 5. Returns time-series data for charting
 * 
 * @metrics
 * - **weight_volume**: Total weight lifted per session (sum of weight × reps for all sets)
 * - **set_volume**: Total number of sets performed per session
 * - **1rm**: Estimated one-rep max using Epley formula: weight × (1 + reps/30)
 * 
 * @security
 * - Requires valid JWT token in Authorization header
 * - Uses RLS policies to ensure user can only access their own workout data
 * - Validates user_id matches authenticated user
 * - Filters by user ownership automatically
 * 
 * @param {Object} body - Request body
 * @param {string} body.metric - Metric type: 'weight_volume' | 'set_volume' | '1rm'
 * @param {string} body.user_id - UUID of the user (must match authenticated user)
 * @param {string} body.exercise_id - UUID of the exercise to get data for
 * @param {number} [body.limit=30] - Maximum number of data points to return (default: 30)
 * 
 * @returns {Response} JSON response with chart data or error
 * @returns {Object} response.body - Response body
 * @returns {Array<Object>} response.body.data - Array of data points for charting
 * @returns {string} response.body.data[].log_date - Date of the workout (ISO format)
 * @returns {number} response.body.data[].value - Calculated metric value
 * @returns {string} response.body.error - Error message if calculation failed
 * 
 * @example
 * // Request - Weight Volume
 * POST /functions/v1/exercise-chart-data
 * Headers: { Authorization: "Bearer <jwt_token>" }
 * Body: {
 *   metric: "weight_volume",
 *   user_id: "user-123",
 *   exercise_id: "exercise-456",
 *   limit: 30
 * }
 * 
 * // Success Response (200)
 * {
 *   data: [
 *     { log_date: "2025-11-01", value: 5400 },
 *     { log_date: "2025-11-03", value: 5600 },
 *     ...
 *   ]
 * }
 * 
 * // Error Response (400/401/500)
 * { error: "Invalid metric type" }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * CORS headers for cross-origin requests
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Valid metric types for chart data calculation
 */
const VALID_METRICS = ['weight_volume', 'set_volume', '1rm'] as const;
type MetricType = typeof VALID_METRICS[number];

/**
 * Calculate weight volume for a workout session
 * Formula: SUM(weight_lbs × reps_completed) for all sets
 * 
 * @param {unknown} supabase - Supabase client instance
 * @param {string} userId - User ID
 * @param {string} exerciseId - Exercise ID
 * @param {number} limit - Maximum data points
 * @returns {Promise<Array>} Array of {log_date, value} objects
 */
async function calculateWeightVolume(supabase: unknown, userId: string, exerciseId: string, limit: number) {
  const { data, error } = await supabase
    .from("workout_log_entries")
    .select(`
      log_id,
      weight_lbs,
      reps_completed,
      workout_logs!inner (
        log_date,
        user_id,
        is_complete
      )
    `)
    .eq("exercise_id", exerciseId)
    .eq("workout_logs.user_id", userId)
    .eq("workout_logs.is_complete", true)
    .not("weight_lbs", "is", null)
    .not("reps_completed", "is", null)
    .order("workout_logs(log_date)", { ascending: false });

  if (error) throw error;

  // Group by log_date and calculate total volume
  const volumeByDate: Record<string, number> = {};

  data?.forEach((entry: unknown) => {
    const date = entry.workout_logs.log_date;
    const volume = (entry.weight_lbs || 0) * (entry.reps_completed || 0);
    volumeByDate[date] = (volumeByDate[date] || 0) + volume;
  });

  // Convert to array and sort by date
  return Object.entries(volumeByDate)
    .map(([log_date, value]) => ({ log_date, value }))
    .sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime())
    .slice(-limit);
}

/**
 * Calculate set volume for a workout session
 * Formula: COUNT(sets) per workout
 * 
 * @param {unknown} supabase - Supabase client instance
 * @param {string} userId - User ID
 * @param {string} exerciseId - Exercise ID
 * @param {number} limit - Maximum data points
 * @returns {Promise<Array>} Array of {log_date, value} objects
 */
async function calculateSetVolume(supabase: unknown, userId: string, exerciseId: string, limit: number) {
  const { data, error } = await supabase
    .from("workout_log_entries")
    .select(`
      log_id,
      workout_logs!inner (
        log_date,
        user_id,
        is_complete
      )
    `)
    .eq("exercise_id", exerciseId)
    .eq("workout_logs.user_id", userId)
    .eq("workout_logs.is_complete", true)
    .order("workout_logs(log_date)", { ascending: false });

  if (error) throw error;

  // Group by log_date and count sets
  const setsByDate: Record<string, number> = {};

  data?.forEach((entry: unknown) => {
    const date = entry.workout_logs.log_date;
    setsByDate[date] = (setsByDate[date] || 0) + 1;
  });

  // Convert to array and sort by date
  return Object.entries(setsByDate)
    .map(([log_date, value]) => ({ log_date, value }))
    .sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime())
    .slice(-limit);
}

/**
 * Calculate estimated 1RM (one-rep max) for a workout session
 * Formula: MAX(weight_lbs × (1 + reps_completed/30)) - Epley formula
 * 
 * @param {unknown} supabase - Supabase client instance
 * @param {string} userId - User ID
 * @param {string} exerciseId - Exercise ID
 * @param {number} limit - Maximum data points
 * @returns {Promise<Array>} Array of {log_date, value} objects
 */
async function calculate1RM(supabase: unknown, userId: string, exerciseId: string, limit: number) {
  const { data, error } = await supabase
    .from("workout_log_entries")
    .select(`
      log_id,
      weight_lbs,
      reps_completed,
      workout_logs!inner (
        log_date,
        user_id,
        is_complete
      )
    `)
    .eq("exercise_id", exerciseId)
    .eq("workout_logs.user_id", userId)
    .eq("workout_logs.is_complete", true)
    .not("weight_lbs", "is", null)
    .not("reps_completed", "is", null)
    .order("workout_logs(log_date)", { ascending: false });

  if (error) throw error;

  // Group by log_date and find max 1RM
  const oneRMByDate: Record<string, number> = {};

  data?.forEach((entry: unknown) => {
    const date = entry.workout_logs.log_date;
    const weight = entry.weight_lbs || 0;
    const reps = entry.reps_completed || 0;

    // Epley formula: 1RM = weight × (1 + reps/30)
    const estimated1RM = weight * (1 + reps / 30);

    oneRMByDate[date] = Math.max(oneRMByDate[date] || 0, estimated1RM);
  });

  // Convert to array and sort by date
  return Object.entries(oneRMByDate)
    .map(([log_date, value]) => ({ log_date, value: Math.round(value * 10) / 10 })) // Round to 1 decimal
    .sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime())
    .slice(-limit);
}

/**
 * Main Edge Function handler for exercise chart data
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
    const { metric, user_id, exercise_id, limit = 30 } = payload;

    // Validate required parameters
    if (!metric || !user_id || !exercise_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: metric, user_id, and exercise_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate metric type
    if (!VALID_METRICS.includes(metric as MetricType)) {
      return new Response(
        JSON.stringify({
          error: `Invalid metric type. Must be one of: ${VALID_METRICS.join(', ')}`
        }),
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

    // Verify user_id matches authenticated user
    if (user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "User mismatch: user_id does not match authenticated user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate data based on metric type
    let chartData;
    switch (metric) {
      case 'weight_volume':
        chartData = await calculateWeightVolume(supabase, user_id, exercise_id, limit);
        break;
      case 'set_volume':
        chartData = await calculateSetVolume(supabase, user_id, exercise_id, limit);
        break;
      case '1rm':
        chartData = await calculate1RM(supabase, user_id, exercise_id, limit);
        break;
      default:
        throw new Error("Invalid metric type");
    }

    // Return the chart data
    return new Response(
      JSON.stringify({ data: chartData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    // Catch-all error handler
    return new Response(
      JSON.stringify({ error: (err as { message?: string })?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
