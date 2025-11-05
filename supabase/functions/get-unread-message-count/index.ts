/**
 * @file supabase/functions/get-unread-message-count/index.ts
 * @description Edge Function to get total unread message count for current user.
 * 
 * This function provides a simple count of all unread messages for the authenticated
 * user across all conversations. It's useful for displaying notification badges and
 * alerting users to new messages.
 * 
 * @project Felony Fitness
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-05
 * 
 * @workflow
 * 1. Validates user authentication via Authorization header
 * 2. Queries direct_messages table for messages to current user
 * 3. Filters for messages where read_at is null
 * 4. Returns count of unread messages
 * 
 * @security
 * - Requires valid JWT token in Authorization header
 * - Uses RLS policies to ensure user can only count their own messages
 * - Only counts messages where current user is recipient
 * - Only counts messages that haven't been read
 * 
 * @returns {Response} JSON response with unread count or error
 * @returns {Object} response.body - Response body
 * @returns {number} response.body.count - Number of unread messages
 * @returns {string} response.body.error - Error message if query failed
 * 
 * @example
 * // Request
 * POST /functions/v1/get-unread-message-count
 * Headers: { Authorization: "Bearer <jwt_token>" }
 * Body: {}
 * 
 * // Success Response (200)
 * {
 *   count: 7
 * }
 * 
 * // Error Response (401/500)
 * { error: "Authentication failed" }
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
 * Main Edge Function handler for getting unread message count
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

    // Count unread messages (messages to current user with null read_at)
    const { count, error: countError } = await supabase
      .from("direct_messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .is("read_at", null);

    if (countError) {
      throw countError;
    }

    // Return the unread count
    return new Response(
      JSON.stringify({ count: count || 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    // Catch-all error handler
    return new Response(
      JSON.stringify({ error: err?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
