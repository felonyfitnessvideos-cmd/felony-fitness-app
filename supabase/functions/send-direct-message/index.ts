/**
 * Send Direct Message Edge Function
 * 
 * @module send-direct-message
 * @description Sends a direct message between users (primarily trainer-client communication).
 * Automatically creates message threads and handles conversation management with
 * proper read status tracking.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-05
 * 
 * @security
 * - JWT authentication required
 * - RLS policies enforced on messages table
 * - Users can only send messages as themselves
 * - Automatic thread creation for new conversations
 * 
 * @example
 * // Send a message to another user
 * const { data, error } = await supabase.functions.invoke('send-direct-message', {
 *   body: {
 *     recipient_id: recipientUserId,
 *     message_content: 'Hello! How can I help you today?'
 *   }
 * });
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

    const { recipient_id, message_content } = await req.json();

    if (!recipient_id) {
      throw new Error('recipient_id is required');
    }

    if (!message_content || message_content.trim().length === 0) {
      throw new Error('message_content is required');
    }

    // Verify recipient exists
    const { data: recipient, error: recipientError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', recipient_id)
      .single();

    if (recipientError || !recipient) {
      throw new Error('Recipient not found');
    }

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        recipient_id: recipient_id,
        content: message_content.trim(),
        read_at: null,
      })
      .select()
      .single();

    if (messageError) {
      throw messageError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_id: message.id,
        sent_at: message.created_at,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-direct-message:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
