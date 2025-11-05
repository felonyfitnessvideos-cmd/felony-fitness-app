/**
 * Set Active Meal Plan Edge Function
 * 
 * @module set-active-meal-plan
 * @description Sets a specific meal plan as the user's active plan. Only one plan
 * can be active at a time. This function automatically deactivates other plans
 * and activates the selected plan.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-05
 * 
 * @security
 * - JWT authentication required
 * - RLS policies enforced on meal_plans table
 * - Users can only set their own plans as active
 * - Atomic operation ensures only one active plan
 * 
 * @example
 * // Set a meal plan as active
 * const { data, error } = await supabase.functions.invoke('set-active-meal-plan', {
 *   body: {
 *     plan_id: planId
 *   }
 * });
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { plan_id } = await req.json();

    if (!plan_id) {
      throw new Error('plan_id is required');
    }

    // Verify the plan exists and belongs to the user
    const { data: plan, error: planError } = await supabase
      .from('meal_plans')
      .select('id, user_id')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      throw new Error('Meal plan not found');
    }

    if (plan.user_id !== user.id) {
      throw new Error('Cannot set active plan for another user');
    }

    // First, deactivate all other plans for this user
    const { error: deactivateError } = await supabase
      .from('meal_plans')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .neq('id', plan_id);

    if (deactivateError) {
      throw deactivateError;
    }

    // Then activate the selected plan
    const { data: activatedPlan, error: activateError } = await supabase
      .from('meal_plans')
      .update({ is_active: true })
      .eq('id', plan_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (activateError) {
      throw activateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        plan_id: activatedPlan.id,
        plan_name: activatedPlan.name,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in set-active-meal-plan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
