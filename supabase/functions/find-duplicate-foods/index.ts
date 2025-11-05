/**
 * Find Duplicate Foods Edge Function
 * 
 * @module find-duplicate-foods
 * @description Searches for duplicate or similar foods using fuzzy matching
 * to prevent duplicate entries in the food database. Uses similarity threshold
 * to identify potential duplicates based on food name.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-05
 * 
 * @security
 * - JWT authentication required
 * - Public read access to food_servings (no sensitive data)
 * - Helps maintain data quality and prevent duplicates
 * 
 * @example
 * // Search for similar foods
 * const { data, error } = await supabase.functions.invoke('find-duplicate-foods', {
 *   body: {
 *     search_name: 'chicken breast',
 *     similarity_threshold: 0.7
 *   }
 * });
 * 
 * if (data?.length > 0) {
 *   console.log('Similar foods found:', data);
 * }
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

    const { search_name, similarity_threshold = 0.7 } = await req.json();

    if (!search_name) {
      throw new Error('search_name is required');
    }

    // Normalize search name for comparison
    const normalizedSearch = search_name.toLowerCase().trim();

    // Get all food servings for similarity comparison
    const { data: allFoods, error: fetchError } = await supabase
      .from('food_servings')
      .select('id, food_name, serving_description, calories, protein_g, carbs_g, fat_g');

    if (fetchError) {
      throw fetchError;
    }

    // Calculate similarity scores and filter results
    const similarFoods = (allFoods || [])
      .map((food) => {
        const normalizedFood = food.food_name.toLowerCase().trim();
        const similarity = calculateSimilarity(normalizedSearch, normalizedFood);
        return { ...food, similarity };
      })
      .filter((food) => food.similarity >= similarity_threshold && food.similarity < 1.0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10); // Limit to top 10 matches

    return new Response(
      JSON.stringify(similarFoods),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in find-duplicate-foods:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

/**
 * Calculate similarity score between two strings using Levenshtein distance
 * 
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score between 0 and 1
 */
function calculateSimilarity(str1: string, str2: string): number {
  // If exact match
  if (str1 === str2) return 1.0;

  // If one contains the other
  if (str1.includes(str2) || str2.includes(str1)) {
    const longer = Math.max(str1.length, str2.length);
    const shorter = Math.min(str1.length, str2.length);
    return shorter / longer;
  }

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  // Convert distance to similarity score (0 to 1)
  return maxLength === 0 ? 1.0 : 1.0 - distance / maxLength;
}

/**
 * Calculate Levenshtein distance between two strings
 * 
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Edit distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}
