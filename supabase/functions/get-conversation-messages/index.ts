/**
 * @file supabase/functions/get-conversation-messages/index.ts
 * @description Edge Function to retrieve all messages for a specific conversation.
 * 
 * This function fetches the complete message history between the current user and
 * another specified user, ordered chronologically from oldest to newest. It includes
 * sender information and read status for each message, enabling full conversation
 * display in the UI.
 * 
 * @project Felony Fitness
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-05
 * 
 * @workflow
 * 1. Validates user authentication via Authorization header
 * 2. Receives other_user_id parameter
 * 3. Queries direct_messages table for messages between both users
 * 4. Joins with user_profiles for sender names
 * 5. Orders messages chronologically (oldest first)
 * 6. Returns formatted message array
 * 
 * @security
 * - Requires valid JWT token in Authorization header
 * - Uses RLS policies to ensure user can only access their own conversations
 * - Validates other_user_id parameter
 * - Returns only messages where current user is sender or recipient
 * 
 * @param {Object} body - Request body
 * @param {string} body.other_user_id - UUID of the other user in the conversation
 * 
 * @returns {Response} JSON response with array of messages or error
 * @returns {Object} response.body - Response body
 * @returns {Array<Object>} response.body.messages - Array of message objects
 * @returns {string} response.body.messages[].id - Message UUID
 * @returns {string} response.body.messages[].sender_id - Sender user ID
 * @returns {string} response.body.messages[].recipient_id - Recipient user ID
 * @returns {string} response.body.messages[].content - Message content
 * @returns {string} response.body.messages[].created_at - ISO timestamp
 * @returns {string|null} response.body.messages[].read_at - ISO timestamp when read (null if unread)
 * @returns {string} response.body.messages[].sender_name - Full name of sender
 * @returns {boolean} response.body.messages[].is_from_current_user - True if sent by current user
 * @returns {boolean} response.body.messages[].is_read - True if message has been read
 * @returns {string} response.body.error - Error message if query failed
 * 
 * @example
 * // Request
 * POST /functions/v1/get-conversation-messages
 * Headers: { Authorization: "Bearer <jwt_token>" }
 * Body: {
 *   other_user_id: "user-456"
 * }
 * 
 * // Success Response (200)
 * {
 *   messages: [
 *     {
 *       id: "msg-123",
 *       sender_id: "user-789",
 *       recipient_id: "user-456",
 *       content: "Hey, how's the training going?",
 *       created_at: "2025-11-05T09:00:00Z",
 *       read_at: "2025-11-05T09:15:00Z",
 *       sender_name: "John Trainer",
 *       is_from_current_user: true,
 *       is_read: true
 *     }
 *   ]
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
 * Main Edge Function handler for retrieving conversation messages
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

    // Query messages between current user and other user
    const { data: messagesData, error: messagesError } = await supabase
      .from("direct_messages")
      .select(`
        id,
        sender_id,
        recipient_id,
        content,
        created_at,
        read_at,
        sender:user_profiles!direct_messages_sender_id_fkey(first_name, last_name, email)
      `)
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${other_user_id}),and(sender_id.eq.${other_user_id},recipient_id.eq.${user.id})`)
      .order("created_at", { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    // Transform messages to match expected format
    const messages = (messagesData || []).map((message: unknown) => ({
      id: message.id,
      sender_id: message.sender_id,
      recipient_id: message.recipient_id,
      content: message.content,
      created_at: message.created_at,
      read_at: message.read_at,
      sender_name: message.sender
        ? `${message.sender.first_name || ''} ${message.sender.last_name || ''}`.trim() || message.sender.email
        : 'Unknown User',
      is_from_current_user: message.sender_id === user.id,
      is_read: message.read_at !== null
    }));

    // Return the messages array
    return new Response(
      JSON.stringify({ messages }),
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
