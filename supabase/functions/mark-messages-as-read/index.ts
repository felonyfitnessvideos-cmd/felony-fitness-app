/**
 * @file supabase/functions/mark-messages-as-read/index.ts
 * @description Edge Function to mark messages as read in a conversation.
 * 
 * This function updates the read_at timestamp for all unread messages from a specific
 * sender to the current user, effectively marking them as read. It's used when a user
 * opens and views a conversation to update message read status.
 * 
 * @project Felony Fitness
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-05
 * 
 * @workflow
 * 1. Validates user authentication via Authorization header
 * 2. Receives other_user_id parameter
 * 3. Queries direct_messages for unread messages from other user to current user
 * 4. Updates read_at timestamp to current time
 * 5. Returns count of messages marked as read
 * 
 * @security
 * - Requires valid JWT token in Authorization header
 * - Uses RLS policies to ensure user can only mark their own messages as read
 * - Validates other_user_id parameter
 * - Only updates messages where current user is recipient
 * - Only updates messages that haven't been read yet
 * 
 * @param {Object} body - Request body
 * @param {string} body.other_user_id - UUID of the other user (message sender)
 * 
 * @returns {Response} JSON response with count of marked messages or error
 * @returns {Object} response.body - Response body
 * @returns {number} response.body.marked_count - Number of messages marked as read
 * @returns {string} response.body.error - Error message if operation failed
 * 
 * @example
 * // Request
 * POST /functions/v1/mark-messages-as-read
 * Headers: { Authorization: "Bearer <jwt_token>" }
 * Body: {
 *   other_user_id: "user-456"
 * }
 * 
 * // Success Response (200)
 * {
 *   marked_count: 5
 * }
 * 
 * // Error Response (400/401/500)
 * { error: "Missing required field: other_user_id" }
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
 * Main Edge Function handler for marking messages as read
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
    const { other_user_id } = payload;

    // Validate required parameters
    if (!other_user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: other_user_id" }),
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

    // Update unread messages from other user to current user
    const { error: updateError, count } = await supabase
      .from("direct_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("sender_id", other_user_id)
      .eq("recipient_id", user.id)
      .is("read_at", null);

    if (updateError) {
      throw updateError;
    }

    const markedCount = count || 0;

    // Return the count of marked messages
    return new Response(
      JSON.stringify({ marked_count: markedCount }),
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
