/**
 * @file supabase/functions/user-has-tag/index.ts
 * @description Edge Function to check if a user has a specific role/tag assignment.
 * 
 * This function provides secure verification of user role assignments for authorization
 * and conditional UI rendering. It checks the user_tags table for a matching record
 * between the specified user and tag name.
 * 
 * @project Felony Fitness
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-05
 * 
 * @workflow
 * 1. Validates user authentication via Authorization header
 * 2. Receives target_user_id and tag_name parameters
 * 3. Looks up the tag by name in tags table
 * 4. Checks for matching record in user_tags junction table
 * 5. Returns boolean indicating whether user has the tag
 * 
 * @security
 * - Requires valid JWT token in Authorization header
 * - Uses RLS policies to ensure proper access control
 * - Validates both user_id and tag existence before querying
 * - Returns consistent boolean response
 * 
 * @param {Object} body - Request body
 * @param {string} body.target_user_id - UUID of the user to check
 * @param {string} body.tag_name - Name of the tag/role to check for (e.g., 'Trainer', 'Admin', 'Client')
 * 
 * @returns {Response} JSON response with boolean result or error
 * @returns {Object} response.body - Response body
 * @returns {boolean} response.body.has_tag - True if user has the specified tag
 * @returns {string} response.body.error - Error message if check failed
 * 
 * @example
 * // Request
 * POST /functions/v1/user-has-tag
 * Headers: { Authorization: "Bearer <jwt_token>" }
 * Body: {
 *   target_user_id: "user-123",
 *   tag_name: "Trainer"
 * }
 * 
 * // Success Response (200)
 * {
 *   has_tag: true
 * }
 * 
 * // Error Response (400/401/500)
 * { error: "Tag not found" }
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
 * Main Edge Function handler for checking user tags
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
    const { target_user_id, tag_name } = payload;

    // Validate required parameters
    if (!target_user_id || !tag_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: target_user_id and tag_name are required" }),
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

    // Look up the tag by name
    const { data: tagData, error: tagError } = await supabase
      .from("tags")
      .select("id")
      .eq("name", tag_name)
      .single();

    if (tagError || !tagData) {
      // If tag doesn't exist, user doesn't have it
      return new Response(
        JSON.stringify({ has_tag: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user has this tag
    const { data: userTagData, error: userTagError } = await supabase
      .from("user_tags")
      .select("id")
      .eq("user_id", target_user_id)
      .eq("tag_id", tagData.id)
      .single();

    // If query fails (not found), return false
    if (userTagError) {
      if (userTagError.code === "PGRST116") {
        // Not found - user doesn't have this tag
        return new Response(
          JSON.stringify({ has_tag: false }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw userTagError;
    }

    // User has the tag
    return new Response(
      JSON.stringify({ has_tag: true }),
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
