/**
 * @file index.ts
 * @description Edge Function to handle unsubscribing from trainer marketing emails
 * @author Felony Fitness Development Team
 * @date 2025-11-16
 * 
 * This function updates trainer_clients.is_unsubscribed = TRUE for the given email
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    console.log('🔴 Unsubscribe request received');

    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing unsubscribe for: ${email}`);

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update all trainer_clients records with this email
    const { data, error } = await supabase
      .from('trainer_clients')
      .update({ 
        is_unsubscribed: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select('client_id, trainer_id');

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updatedCount = data?.length || 0;
    console.log(`✅ Unsubscribed ${updatedCount} trainer-client relationship(s)`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully unsubscribed from trainer emails',
        updated_count: updatedCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Unsubscribe error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

console.log('📡 unsubscribe-trainer-emails Edge Function ready');
