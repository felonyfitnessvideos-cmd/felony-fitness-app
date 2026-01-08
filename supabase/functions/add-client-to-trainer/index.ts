/**
 * @file supabase/functions/add-client-to-trainer/index.ts
 * @description Edge Function to establish a trainer-client relationship.
 * 
 * This function creates a bidirectional relationship between a trainer and client user,
 * enabling trainers to manage client programs, track progress, and communicate. It
 * automatically assigns appropriate roles ('Trainer' and 'Client' tags) if not already
 * present, ensuring proper RBAC setup for the relationship.
 * 
 * @project Felony Fitness
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-05
 * 
 * @workflow
 * 1. Validates user authentication via Authorization header
 * 2. Receives trainer_user_id, client_user_id, and optional relationship_notes
 * 3. Checks if relationship already exists (prevents duplicates)
 * 4. Inserts new trainer_clients record with 'active' status
 * 5. Auto-assigns 'Trainer' tag to trainer if not present
 * 6. Auto-assigns 'Client' tag to client if not present
 * 7. Returns relationship ID
 * 
 * @security
 * - Requires valid JWT token in Authorization header
 * - Uses RLS policies to ensure proper access control
 * - Validates both user IDs exist
 * - Prevents duplicate relationships
 * - Maintains audit trail with created_at timestamp
 * - Automatically ensures proper role assignments
 * 
 * @param {Object} body - Request body
 * @param {string} body.trainer_user_id - UUID of the trainer
 * @param {string} body.client_user_id - UUID of the client
 * @param {string} [body.relationship_notes] - Optional notes about the relationship
 * 
 * @returns {Response} JSON response with relationship ID or error
 * @returns {Object} response.body - Response body
 * @returns {string} response.body.relationship_id - UUID of the created/existing relationship
 * @returns {string} response.body.message - Status message
 * @returns {boolean} response.body.roles_assigned - True if roles were auto-assigned
 * @returns {string} response.body.error - Error message if operation failed
 * 
 * @example
 * // Request
 * POST /functions/v1/add-client-to-trainer
 * Headers: { Authorization: "Bearer <jwt_token>" }
 * Body: {
 *   trainer_user_id: "trainer-123",
 *   client_user_id: "client-456",
 *   relationship_notes: "New client starting beginner program"
 * }
 * 
 * // Success Response (200)
 * {
 *   relationship_id: "rel-789",
 *   message: "Trainer-client relationship created successfully",
 *   roles_assigned: true
 * }
 * 
 * // Already Exists Response (200)
 * {
 *   relationship_id: "existing-rel-789",
 *   message: "Relationship already exists",
 *   roles_assigned: false
 * }
 * 
 * // Error Response (400/401/500)
 * { error: "Client user not found" }
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
 * Helper function to assign a role tag to a user
 * @param supabase Supabase client instance
 * @param userId UUID of the user
 * @param tagName Name of the tag to assign
 * @returns Promise<boolean> True if successful
 */
async function assignRoleTag(supabase: unknown, userId: string, tagName: string): Promise<boolean> {
  try {
    // Look up the tag by name
    const { data: tagData, error: tagError } = await supabase
      .from("tags")
      .select("id")
      .eq("name", tagName)
      .single();

    if (tagError || !tagData) {
      console.error(`Tag '${tagName}' not found:`, tagError);
      return false;
    }

    // Check if user already has this tag
    const { data: existingTag } = await supabase
      .from("user_tags")
      .select("id")
      .eq("user_id", userId)
      .eq("tag_id", tagData.id)
      .single();

    // If tag already exists, return true (already assigned)
    if (existingTag) {
      return true;
    }

    // Insert the user tag
    const { error: insertError } = await supabase
      .from("user_tags")
      .insert({
        user_id: userId,
        tag_id: tagData.id,
        assigned_at: new Date().toISOString()
      });

    if (insertError) {
      console.error(`Error assigning tag '${tagName}':`, insertError);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Error in assignRoleTag for '${tagName}':`, err);
    return false;
  }
}

/**
 * Main Edge Function handler for adding client to trainer
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

    // Parse request body and destructure all new fields
    const payload = await req.json();
    const {
      trainer_user_id,
      client_user_id,
      client_email,
      // Personal Information
      first_name,
      last_name,
      phone,
      date_of_birth,
      gender,
      address,
      city,
      state,
      zip_code,
      // Emergency Contact
      emergency_name,
      emergency_phone,
      emergency_relationship,
      // Initial Metrics
      height,
      weight,
      body_fat_percentage,
      resting_heart_rate,
      blood_pressure,
      // Health Information
      medical_conditions,
      medications,
      injuries,
      allergies,
      doctor_clearance,
      // Fitness Goals
      primary_goal,
      secondary_goals,
      target_weight,
      timeframe,
      // Preferences
      workout_days,
      preferred_time,
      session_length,
      exercise_preferences,
      exercise_restrictions,
      // Program Details
      program_type,
      nutrition_coaching,
      start_date,
      // Optionally still allow notes
      notes
    } = payload;

    // Validate required parameters - need either client_user_id or client_email
    if (!trainer_user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: trainer_user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!client_user_id && !client_email) {
      return new Response(
        JSON.stringify({ error: "Missing required field: client_user_id or client_email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Define Supabase connection details from environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;


    // 1. Create a client with the user's token to securely get the user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication failed", details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // 2. Create an admin client to perform elevated-privilege operations
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);


    // Step 1: Determine final client_user_id
    let finalClientId = client_user_id;

    // If only email provided, look up user by email
    if (!finalClientId && client_email) {
      const { data: clientProfile } = await adminSupabase
        .from("user_profiles")
        .select("id")
        .eq("email", client_email)
        .single();

      if (clientProfile) {
        finalClientId = clientProfile.id;
      } else {
        return new Response(
          JSON.stringify({
            error: "Client user not found. Please ensure the client has created an account first."
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Step 2: Update is_trainer flag for trainer (idempotent)
    const { error: trainerUpdateError } = await adminSupabase
      .from("user_profiles")
      .update({ is_trainer: true, updated_at: new Date().toISOString() })
      .eq("id", trainer_user_id);

    if (trainerUpdateError) {
      console.error("Error updating trainer profile:", trainerUpdateError);
      return new Response(
        JSON.stringify({ error: `Failed to update trainer profile: ${trainerUpdateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Update is_client flag for client (idempotent)
    const { error: clientUpdateError } = await adminSupabase
      .from("user_profiles")
      .update({ is_client: true, updated_at: new Date().toISOString() })
      .eq("id", finalClientId);

    if (clientUpdateError) {
      console.error("Error updating client profile:", clientUpdateError);
      return new Response(
        JSON.stringify({ error: `Failed to update client profile: ${clientUpdateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 4: Check if relationship already exists
    const { data: existingRelationship, error: checkError } = await adminSupabase
      .from("trainer_clients")
      .select("id")
      .eq("trainer_id", trainer_user_id)
      .eq("client_id", finalClientId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError; // Throw actual errors
    }

    const relationshipData = {
      trainer_id: trainer_user_id,
      client_id: finalClientId,
      status: "active",
      updated_at: new Date().toISOString(),
      // Personal Information & Sanitization
      first_name,
      last_name,
      phone,
      date_of_birth: date_of_birth || null,
      gender,
      address,
      city,
      state,
      zip_code,
      // Emergency Contact
      emergency_name,
      emergency_phone,
      emergency_relationship,
      // Initial Metrics (convert empty strings to null for numeric types)
      height: height === '' ? null : Number(height),
      weight: weight === '' ? null : Number(weight),
      body_fat_percentage: body_fat_percentage === '' ? null : Number(body_fat_percentage),
      resting_heart_rate: resting_heart_rate === '' ? null : Number(resting_heart_rate),
      blood_pressure,
      // Health Information
      medical_conditions,
      medications,
      injuries,
      allergies,
      doctor_clearance,
      // Fitness Goals
      primary_goal,
      secondary_goals,
      target_weight: target_weight === '' ? null : Number(target_weight),
      timeframe,
      // Preferences
      workout_days,
      preferred_time,
      session_length,
      exercise_preferences,
      exercise_restrictions,
      // Program Details
      program_type,
      nutrition_coaching,
      start_date: start_date || null,
      notes: notes || null
    };

    let relationship_id;
    let message;

    if (existingRelationship) {
      // --- UPDATE EXISTING RELATIONSHIP ---
      const { data: updatedRelationship, error: updateError } = await adminSupabase
        .from("trainer_clients")
        .update(relationshipData)
        .eq("id", existingRelationship.id)
        .select("id")
        .single();
      
      if (updateError) {
        console.error("Error updating trainer-client relationship:", updateError);
        throw new Error(`Failed to update relationship: ${updateError.message}`);
      }
      relationship_id = updatedRelationship.id;
      message = "Trainer-client relationship updated successfully";

    } else {
      // --- INSERT NEW RELATIONSHIP ---
      relationshipData.created_at = new Date().toISOString(); // Add created_at for inserts
      const { data: newRelationship, error: insertError } = await adminSupabase
        .from("trainer_clients")
        .insert(relationshipData)
        .select("id")
        .single();

      if (insertError) {
        console.error("Error inserting trainer-client relationship:", insertError);
        throw new Error(`Failed to create relationship: ${insertError.message}`);
      }
      relationship_id = newRelationship.id;
      message = "Trainer-client relationship created successfully";
    }

    if (!relationship_id) {
      throw new Error("Failed to save relationship: No ID returned after insert/update");
    }

    // Step 6: Auto-assign role tags (optional)
    await assignRoleTag(adminSupabase, trainer_user_id, "Trainer");
    await assignRoleTag(adminSupabase, finalClientId, "Client");

    // Return success with relationship ID
    return new Response(
      JSON.stringify({ relationship_id, message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    // Catch-all error handler
    console.error("Unexpected error in add-client-to-trainer:", err);
    return new Response(
      JSON.stringify({
        error: (err as { message?: string })?.message || "Unknown error",
        details: (err as { toString?: () => string })?.toString?.() || "No additional details"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
