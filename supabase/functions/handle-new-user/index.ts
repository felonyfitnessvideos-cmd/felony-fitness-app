import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('Function called with method:', req.method)
  console.log('Request headers:', Object.fromEntries(req.headers.entries()))

  try {
    // For internal Supabase auth hooks, we trust the request
    // as it comes from Supabase's auth system directly
    console.log('Processing auth hook request')
    
    // Parse the webhook payload
    const payload = await req.json()
    console.log('Webhook payload:', JSON.stringify(payload, null, 2))

    // Extract user data from the webhook - handle different payload structures
    let userId, userEmail
    
    if (payload.record) {
      // Standard webhook format
      userId = payload.record.id
      userEmail = payload.record.email
    } else if (payload.user) {
      // Auth hook format
      userId = payload.user.id
      userEmail = payload.user.email
    } else if (payload.id) {
      // Direct user object
      userId = payload.id
      userEmail = payload.email
    } else {
      console.error('Unknown payload structure:', payload)
      throw new Error('Could not extract user data from webhook payload')
    }

    if (!userId || !userEmail) {
      throw new Error(`Missing user ID (${userId}) or email (${userEmail}) in webhook payload`)
    }

    console.log(`Processing new user: ${userEmail} (${userId})`)

    // The database trigger handle_new_user() automatically creates the user_profiles entry
    // No additional processing needed here
    // This function is kept for logging/auditing purposes

    console.log(`User profile will be created by database trigger for user: ${userEmail}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User signup webhook processed',
        userId: userId,
        email: userEmail
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in handle-new-user function:', error)
    
    // For auth hooks, we should return success even if our processing fails
    // to avoid blocking the user signup process
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'User signup completed, profile creation will be retried',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})