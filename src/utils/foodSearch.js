/**
 * @fileoverview Direct Supabase food search utility
 * @description Simple, fast food search querying foods table directly with portions.
 * No external APIs, no edge functions - just direct database access.
 * 
 * @author Felony Fitness Development Team
 * @version 3.0.0
 * @since 2025-12-05
 */

import { supabase } from '../supabaseClient.js';

/**
 * Search foods table with portions
 * 
 * @param {string} searchTerm - Search query (minimum 2 characters)
 * @returns {Promise<Array>} Array of food objects with portions
 * 
 * @example
 * const results = await searchFoods('chicken breast');
 * // Returns: [{ id, fdc_id, name, brand_owner, calories, protein_g, ..., portions: [...] }]
 */
export const searchFoods = async (searchTerm) => {
  // Validate input
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }

  const query = searchTerm.trim();

  try {
    const { data, error } = await supabase
      .from('foods')
      .select(`
        *,
        portions (*)
      `)
      .or(`name.ilike.%${query}%,brand_owner.ilike.%${query}%`)
      .order('name')
      .limit(50);

    if (error) {
      console.error('❌ Food search error:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Unexpected search error:', err);
    return [];
  }
};

/**
 * Format food result for display in UI
 * 
 * @param {Object} food - Food object from database
 * @param {Object} selectedPortion - Selected portion object
 * @returns {Object} Formatted food data for display
 * 
 * @example
 * const formatted = formatFoodForDisplay(food, portion);
 * // Returns: { name, brand, calories, protein_g, carbs_g, fat_g, serving }
 */
export const formatFoodForDisplay = (food, selectedPortion = null) => {
  // Base nutrition is per 100g
  const baseCalories = food.calories || 0;
  const baseProtein = food.protein_g || 0;
  const baseCarbs = food.carbs_g || 0;
  const baseFat = food.fat_g || 0;

  // If no portion selected, return 100g values
  if (!selectedPortion) {
    return {
      name: food.name,
      brand: food.brand_owner || food.data_type || '',
      calories: baseCalories,
      protein_g: baseProtein,
      carbs_g: baseCarbs,
      fat_g: baseFat,
      serving: '100g',
      serving_grams: 100
    };
  }

  // Calculate nutrition for selected portion
  const portionGrams = selectedPortion.gram_weight || 100;
  const multiplier = portionGrams / 100;

  return {
    name: food.name,
    brand: food.brand_owner || food.data_type || '',
    calories: Math.round(baseCalories * multiplier),
    protein_g: Math.round(baseProtein * multiplier * 10) / 10,
    carbs_g: Math.round(baseCarbs * multiplier * 10) / 10,
    fat_g: Math.round(baseFat * multiplier * 10) / 10,
    serving: selectedPortion.portion_description || `${portionGrams}g`,
    serving_grams: portionGrams
  };
};

/**
 * Get all portions for a food item
 * 
 * @param {string} foodId - Food UUID
 * @returns {Promise<Array>} Array of portion objects
 * 
 * @example
 * const portions = await getFoodPortions(foodId);
 * // Returns: [{ id, gram_weight, portion_description, amount }]
 */
export const getFoodPortions = async (foodId) => {
  try {
    const { data, error } = await supabase
      .from('portions')
      .select('*')
      .eq('food_id', foodId)
      .order('gram_weight');

    if (error) {
      console.error('❌ Error fetching portions:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Unexpected portions error:', err);
    return [];
  }
};

export default {
  searchFoods,
  formatFoodForDisplay,
  getFoodPortions
};
