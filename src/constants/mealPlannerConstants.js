/**
 * @fileoverview Meal planner constants and utilities
 * 
 * Provides essential constants, configuration objects, and utility functions
 * for meal planning components throughout the application. Includes meal types,
 * categories, food categorization for shopping lists, and nutrition calculation
 * functions.
 * 
 * @author Felony Fitness App Team
 * @version 1.0.0
 */

/** @constant {string[]} Available meal types for weekly planning grid */
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2'];

/** @constant {string[]} Days of the week for meal planning grid (Monday-first) */
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** 
 * @constant {Array<Object>} Available meal categories for filtering 
 * Used in dropdowns and filter components throughout the meal system
 */
export const MEAL_CATEGORIES = [
  { value: 'all', label: 'All Meals' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snacks' }
];

/** 
 * @constant {Object<string, string[]>} Food categories for organizing shopping list items
 * 
 * Maps grocery store sections to arrays of food keywords for automatic categorization.
 * Used by shopping list generators to group ingredients by store layout.
 * 
 * @example
 * // Check if 'chicken breast' belongs in 'Meat & Seafood'
 * const keywords = FOOD_CATEGORIES['Meat & Seafood']; // ['chicken', 'beef', ...]
 * const hasChicken = keywords.some(keyword => 'chicken breast'.includes(keyword)); // true
 */
export const FOOD_CATEGORIES = {
  'Produce': ['fruits', 'vegetables', 'herbs', 'fresh'],
  'Meat & Seafood': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'turkey', 'bacon'],
  'Dairy & Eggs': ['milk', 'cheese', 'yogurt', 'eggs', 'butter', 'cream'],
  'Grains & Bread': ['bread', 'rice', 'quinoa', 'pasta', 'oats', 'tortilla'],
  'Pantry': ['oil', 'vinegar', 'spices', 'sauce', 'dressing', 'nuts', 'seeds'],
  'Condiments': ['mayo', 'mustard', 'ketchup', 'salsa', 'honey'],
  'Frozen': ['frozen'],
  'Other': [] // Fallback category for unmatched items
};

/**
 * Generate array of dates for a week starting from Monday
 * 
 * Takes any date and calculates the Monday-Sunday week containing that date.
 * Handles edge cases including when the reference date is a Sunday.
 * 
 * @param {Date} date - Reference date to calculate week from
 * @returns {Date[]} Array of 7 Date objects representing the week (Monday to Sunday)
 * 
 * @example
 * const thisWeek = getWeekDates(new Date()); // Current week
 * const specificWeek = getWeekDates(new Date('2023-12-15')); // Week containing Dec 15
 * 
 * @description
 * Algorithm:
 * 1. Get the day of week (0=Sunday, 1=Monday, etc.)
 * 2. Calculate days to subtract to get to Monday
 * 3. Handle Sunday special case (day 0 becomes -6 to go back to Monday)
 * 4. Generate 7 consecutive dates starting from calculated Monday
 */
export function getWeekDates(date) {
  const week = [];
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  startOfWeek.setDate(diff);

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    week.push(day);
  }
  return week;
}

/**
 * Calculate total nutrition values for a meal based on its foods
 * 
 * Processes an array of meal_foods relationships and calculates aggregate
 * nutrition values by multiplying each food's base nutrition by its quantity.
 * Handles missing or null food_servings gracefully with warnings.
 * 
 * @param {Array<Object>} mealFoods - Array of meal_foods with quantities and nutrition data
 * @param {number} mealFoods[].quantity - Serving quantity multiplier
 * @param {Object} mealFoods[].food_servings - Nutrition data for the food serving
 * @param {number} mealFoods[].food_servings.calories - Calories per serving
 * @param {number} mealFoods[].food_servings.protein_g - Protein grams per serving
 * @param {number} mealFoods[].food_servings.carbs_g - Carbohydrate grams per serving
 * @param {number} mealFoods[].food_servings.fat_g - Fat grams per serving
 * 
 * @returns {Object} Calculated nutrition totals
 * @returns {number} returns.calories - Total calories
 * @returns {number} returns.protein - Total protein in grams
 * @returns {number} returns.carbs - Total carbohydrates in grams
 * @returns {number} returns.fat - Total fat in grams
 * 
 * @example
 * const mealFoods = [
 *   { quantity: 2, food_servings: { calories: 100, protein_g: 20, carbs_g: 5, fat_g: 2 } },
 *   { quantity: 1, food_servings: { calories: 200, protein_g: 10, carbs_g: 30, fat_g: 8 } }
 * ];
 * const nutrition = calculateMealNutrition(mealFoods);
 * // Returns: { calories: 400, protein: 50, carbs: 40, fat: 12 }
 */
export function calculateMealNutrition(mealFoods) {
  if (!mealFoods) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return mealFoods.reduce((acc, item) => {
    const food = item.food_servings;
    const quantity = item.quantity || 0;
    
    // Handle null or undefined food_servings
    if (!food) {
      console.warn('Missing food_servings data for meal food item:', {
        quantity: item.quantity,
        notes: item.notes,
        food_servings_id: item.food_servings_id
      });
      return acc;
    }
    
    return {
      calories: acc.calories + (food.calories * quantity || 0),
      protein: acc.protein + (food.protein_g * quantity || 0),
      carbs: acc.carbs + (food.carbs_g * quantity || 0),
      fat: acc.fat + (food.fat_g * quantity || 0)
    };
  }, {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
}