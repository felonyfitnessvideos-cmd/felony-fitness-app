/**
 * @file supabase/functions/assign-user-tag/index.ts
 * @description Edge Function to assign a role/tag to a user.
 * 
 * This function provides secure tag assignment for role-based access control (RBAC).
 * It creates a new user_tags record linking a user to a tag, enabling role assignments
 * like 'Trainer', 'Admin', 'Client', or 'Premium'. The function handles duplicate
 * checking and maintains proper audit trails with assignment timestamps and assignors.
 * 
 * @project Felony Fitness
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-05
 * 
 * @workflow
 * 1. Validates user authentication via Authorization header
 * 2. Receives target_user_id, tag_name, and optional assigned_by_user_id
 * 3. Looks up the tag by name in tags table
 * 4. Checks if user already has this tag (prevents duplicates)
 * 5. Inserts new user_tags record if not already assigned
 * 6. Returns success status
 * 
 * @security
 * - Requires valid JWT token in Authorization header
 * - Uses RLS policies to ensure proper access control
 * - Validates tag existence before assignment
 * - Prevents duplicate tag assignments
 * - Maintains audit trail with assigned_by and assigned_at fields
 * 
 * @param {Object} body - Request body
 * @param {string} body.target_user_id - UUID of the user to assign tag to
 * @param {string} body.tag_name - Name of the tag to assign (e.g., 'Trainer', 'Admin', 'Client')
 * @param {string} [body.assigned_by_user_id] - UUID of user performing the assignment (optional)
 * 
 * @returns {Response} JSON response with success status or error
 * @returns {Object} response.body - Response body
 * @returns {boolean} response.body.success - True if tag was assigned successfully
 * @returns {string} response.body.message - Status message
 * @returns {string} response.body.error - Error message if assignment failed
 * 
 * @example
 * // Request
 * POST /functions/v1/assign-user-tag
 * Headers: { Authorization: "Bearer <jwt_token>" }
 * Body: {
 *   target_user_id: "user-123",
 *   tag_name: "Trainer",
 *   assigned_by_user_id: "admin-456"
 * }
 * 
 * // Success Response (200)
 * {
 *   success: true,
 *   message: "Tag assigned successfully"
 * }
 * 
 * // Already Assigned Response (200)
 * {
 *   success: true,
 *   message: "User already has this tag"
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
 * Main Edge Function handler for assigning user tags
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
    const { target_user_id, tag_name, assigned_by_user_id } = payload;

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
      return new Response(
        JSON.stringify({ error: `Tag '${tag_name}' not found` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already has this tag
    const { data: existingTag, error: checkError } = await supabase
      .from("user_tags")
      .select("id")
      .eq("user_id", target_user_id)
      .eq("tag_id", tagData.id)
      .single();

    // If tag already exists, return success (idempotent operation)
    if (existingTag) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "User already has this tag"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert the user tag
    const { error: insertError } = await supabase
      .from("user_tags")
      .insert({
        user_id: target_user_id,
        tag_id: tagData.id,
        assigned_by: assigned_by_user_id || null,
        assigned_at: new Date().toISOString()
      });

    if (insertError) {
      throw insertError;
    }

    // Return success
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Tag assigned successfully"
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
