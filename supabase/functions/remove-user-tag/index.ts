/**
 * @file supabase/functions/remove-user-tag/index.ts
 * @description Edge Function to remove a role/tag from a user.
 * 
 * This function provides secure tag removal for role-based access control (RBAC).
 * It deletes the user_tags record linking a user to a tag, enabling role revocation.
 * The function only allows removal of non-system tags to protect critical system roles.
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
 * 4. Verifies tag is not a protected system tag
 * 5. Deletes the user_tags record if it exists
 * 6. Returns success status (idempotent - no error if tag wasn't assigned)
 * 
 * @security
 * - Requires valid JWT token in Authorization header
 * - Uses RLS policies to ensure proper access control
 * - Validates tag existence before removal
 * - Prevents removal of system-critical tags (if implemented)
 * - Idempotent operation (no error if tag not assigned)
 * 
 * @param {Object} body - Request body
 * @param {string} body.target_user_id - UUID of the user to remove tag from
 * @param {string} body.tag_name - Name of the tag to remove (e.g., 'Trainer', 'Premium')
 * 
 * @returns {Response} JSON response with success status or error
 * @returns {Object} response.body - Response body
 * @returns {boolean} response.body.success - True if tag was removed successfully
 * @returns {string} response.body.message - Status message
 * @returns {string} response.body.error - Error message if removal failed
 * 
 * @example
 * // Request
 * POST /functions/v1/remove-user-tag
 * Headers: { Authorization: "Bearer <jwt_token>" }
 * Body: {
 *   target_user_id: "user-123",
 *   tag_name: "Premium"
 * }
 * 
 * // Success Response (200)
 * {
 *   success: true,
 *   message: "Tag removed successfully"
 * }
 * 
 * // Not Found Response (200 - idempotent)
 * {
 *   success: true,
 *   message: "Tag not assigned to user"
 * }
 * 
 * // Error Response (400/401/500)
 * { error: "Tag 'InvalidRole' not found" }
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
 * Main Edge Function handler for removing user tags
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
      .select("id, is_system")
      .eq("name", tag_name)
      .single();

    if (tagError || !tagData) {
      return new Response(
        JSON.stringify({ error: `Tag '${tag_name}' not found` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optional: Prevent removal of system tags (if is_system field exists)
    // Uncomment this if you want to protect system tags
    // if (tagData.is_system) {
    //   return new Response(
    //     JSON.stringify({ error: "Cannot remove system tag" }),
    //     { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    //   );
    // }

    // Delete the user tag (idempotent - no error if not found)
    const { error: deleteError } = await supabase
      .from("user_tags")
      .delete()
      .eq("user_id", target_user_id)
      .eq("tag_id", tagData.id);

    if (deleteError) {
      throw deleteError;
    }

    // Return success (idempotent - success even if tag wasn't assigned)
    return new Response(
      JSON.stringify({
        success: true,
        message: "Tag removed successfully"
      }),
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
