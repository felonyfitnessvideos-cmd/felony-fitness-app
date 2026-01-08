/**
 * @file supabase/functions/get-user-tags/index.ts
 * @description Edge Function to retrieve all role/tag assignments for a specific user.
 * 
 * This function provides comprehensive access to a user's role and tag assignments,
 * including detailed tag information such as name, description, color, and assignment
 * metadata. It performs a join between user_tags and tags tables to provide complete
 * tag information for authorization, UI rendering, and role management features.
 * 
 * @project Felony Fitness
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-05
 * 
 * @workflow
 * 1. Validates user authentication via Authorization header
 * 2. Receives target_user_id parameter
 * 3. Queries user_tags table with join to tags table
 * 4. Returns array of tag assignments with full details
 * 5. Orders results by assignment date (most recent first)
 * 
 * @security
 * - Requires valid JWT token in Authorization header
 * - Uses RLS policies to ensure proper access control
 * - Validates user_id before querying
 * - Returns empty array if no tags found (not an error)
 * 
 * @param {Object} body - Request body
 * @param {string} body.target_user_id - UUID of the user to get tags for
 * 
 * @returns {Response} JSON response with array of user tags or error
 * @returns {Object} response.body - Response body
 * @returns {Array<Object>} response.body.tags - Array of tag assignments
 * @returns {string} response.body.tags[].tag_id - UUID of the tag
 * @returns {string} response.body.tags[].tag_name - Name of the tag (e.g., 'Trainer', 'Admin')
 * @returns {string} response.body.tags[].tag_description - Description of the tag
 * @returns {string} response.body.tags[].tag_color - Hex color code for UI display
 * @returns {string} response.body.tags[].assigned_at - ISO timestamp of assignment
 * @returns {string|null} response.body.tags[].assigned_by - UUID of user who assigned tag
 * @returns {string} response.body.error - Error message if query failed
 * 
 * @example
 * // Request
 * POST /functions/v1/get-user-tags
 * Headers: { Authorization: "Bearer <jwt_token>" }
 * Body: {
 *   target_user_id: "user-123"
 * }
 * 
 * // Success Response (200)
 * {
 *   tags: [
 *     {
 *       tag_id: "tag-456",
 *       tag_name: "Trainer",
 *       tag_description: "Professional fitness trainer",
 *       tag_color: "#10b981",
 *       assigned_at: "2025-11-01T10:00:00Z",
 *       assigned_by: "admin-789"
 *     },
 *     {
 *       tag_id: "tag-789",
 *       tag_name: "Premium",
 *       tag_description: "Premium member access",
 *       tag_color: "#f59e0b",
 *       assigned_at: "2025-10-15T08:30:00Z",
 *       assigned_by: null
 *     }
 *   ]
 * }
 * 
 * // Empty Response (200)
 * { tags: [] }
 * 
 * // Error Response (400/401/500)
 * { error: "Missing required field: target_user_id" }
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
 * Main Edge Function handler for retrieving user tags
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
    const { target_user_id } = payload;

    // Validate required parameters
    if (!target_user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: target_user_id" }),
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

    // Query user_tags with join to tags table
    const { data: userTagsData, error: userTagsError } = await supabase
      .from("user_tags")
      .select(`
        tag_id,
        assigned_at,
        assigned_by,
        tags (
          id,
          name,
          description,
          color
        )
      `)
      .eq("user_id", target_user_id)
      .order("assigned_at", { ascending: false });

    if (userTagsError) {
      throw userTagsError;
    }

    // Transform the data to match expected format
    const tags = (userTagsData || [])
      .filter(item => item.tags) // Only include items with valid tag data
      .map(item => ({
        tag_id: item.tag_id,
        tag_name: item.tags.name,
        tag_description: item.tags.description || "",
        tag_color: item.tags.color || "#3b82f6",
        assigned_at: item.assigned_at,
        assigned_by: item.assigned_by
      }));

    // Return the tags array (empty array if no tags found)
    return new Response(
      JSON.stringify({ tags }),
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
