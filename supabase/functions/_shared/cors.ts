/**
 * @file supabase/functions/_shared/cors.ts
 * Lightweight CORS header helper exported for Supabase edge functions.
 * Keeping this in a shared module avoids duplication across multiple functions.
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};