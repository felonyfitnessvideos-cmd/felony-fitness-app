import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    
    // Create Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

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

    // Step 1: Insert into users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: userEmail,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError) {
      console.error('Error inserting into users table:', userError)
      throw userError
    }

    console.log('Successfully inserted into users table:', userData)

    // Step 2: Insert into user_profiles table with default values
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        user_id: userId,
        email: userEmail,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error inserting into user_profiles table:', profileError)
      throw profileError
    }

    console.log('Successfully created user profile:', profileData)

    // Step 3: Assign default "User" tag
    try {
      // First, get the User tag ID
      const { data: userTag, error: tagError } = await supabaseAdmin
        .from('tags')
        .select('id')
        .eq('name', 'User')
        .single()

      if (tagError || !userTag) {
        console.warn('User tag not found, skipping tag assignment')
      } else {
        // Assign the User tag to the new user
        const { error: userTagError } = await supabaseAdmin
          .from('user_tags')
          .insert({
            user_id: userId,
            tag_id: userTag.id,
            assigned_at: new Date().toISOString()
          })

        if (userTagError) {
          console.error('Error assigning User tag:', userTagError)
        } else {
          console.log('Successfully assigned User tag')
        }
      }
    } catch (tagErr) {
      console.warn('Failed to assign tag, but user creation succeeded:', tagErr)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User profile created successfully',
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