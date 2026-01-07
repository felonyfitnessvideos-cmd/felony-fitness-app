/**
 * @file supabase/functions/create-exercise/index.ts
 * @description Edge Function to create exercises with proper RLS bypass
 * 
 * This function allows authenticated trainers to create custom exercises
 * while maintaining security through proper validation and logging.
 * 
 * @param {Object} body - Request body
 * @param {string} body.name - Exercise name
 * @param {string} body.description - Exercise description
 * @param {string} body.instructions - Exercise instructions
 * @param {string} body.primary_muscle - Primary muscle group
 * @param {string} [body.secondary_muscle] - Secondary muscle group
 * @param {string} [body.tertiary_muscle] - Tertiary muscle group
 * @param {string} [body.equipment_needed] - Equipment needed
 * @param {string} [body.difficulty_level] - Difficulty level
 * @param {string} [body.exercise_type] - Exercise type
 * @param {string} [body.thumbnail_url] - Thumbnail URL
 * @param {string} [body.video_url] - Video URL
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();
    const {
      name,
      description,
      instructions,
      primary_muscle,
      secondary_muscle,
      tertiary_muscle,
      equipment_needed,
      difficulty_level,
      exercise_type,
      thumbnail_url,
      video_url,
    } = payload;

    // Validate required fields
    if (!name || !description || !primary_muscle || !exercise_type) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: name, description, primary_muscle, exercise_type",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client (uses service key to bypass RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is authenticated
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert exercise using admin client (bypasses RLS)
    const { data: exercise, error: insertError } = await supabase
      .from("exercises")
      .insert({
        name,
        description,
        instructions,
        primary_muscle,
        secondary_muscle: secondary_muscle || null,
        tertiary_muscle: tertiary_muscle || null,
        equipment_needed: equipment_needed || null,
        difficulty_level: difficulty_level || null,
        exercise_type,
        thumbnail_url: thumbnail_url || null,
        video_url: video_url || null,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Exercise insert error:", insertError);
      console.error("Insert error details:", JSON.stringify(insertError, null, 2));
      console.error("Inserted data:", JSON.stringify({
        name,
        description,
        instructions,
        primary_muscle,
        secondary_muscle,
        tertiary_muscle,
        equipment_needed,
        difficulty_level,
        exercise_type,
        thumbnail_url,
        video_url,
      }, null, 2));
      return new Response(
        JSON.stringify({ 
          error: insertError.message,
          details: insertError.details || insertError,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        exercise_id: exercise.id,
        message: "Exercise created successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Error in create-exercise:", err);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
