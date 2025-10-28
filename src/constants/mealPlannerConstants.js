/**
 * @file mealPlannerConstants.js
 * Constants and utility functions for meal planner components
 */

/** @constant {string[]} Available meal types for planning */
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack1', 'snack2'];

/** @constant {string[]} Days of the week for meal planning grid */
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** @constant {Array<Object>} Available meal categories for filtering */
export const MEAL_CATEGORIES = [
  { value: 'all', label: 'All Meals' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snacks' }
];

/** @constant {Object} Food categories for organizing shopping list items */
export const FOOD_CATEGORIES = {
  'Produce': ['fruits', 'vegetables', 'herbs', 'fresh'],
  'Meat & Seafood': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'turkey', 'bacon'],
  'Dairy & Eggs': ['milk', 'cheese', 'yogurt', 'eggs', 'butter', 'cream'],
  'Grains & Bread': ['bread', 'rice', 'quinoa', 'pasta', 'oats', 'tortilla'],
  'Pantry': ['oil', 'vinegar', 'spices', 'sauce', 'dressing', 'nuts', 'seeds'],
  'Condiments': ['mayo', 'mustard', 'ketchup', 'salsa', 'honey'],
  'Frozen': ['frozen'],
  'Other': []
};

/**
 * Generate array of dates for a week starting from Monday
 * 
 * @param {Date} date - Reference date to calculate week from
 * @returns {Date[]} Array of 7 Date objects representing the week
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
 * @param {Array} mealFoods - Array of meal_foods with quantities and nutrition data
 * @returns {Object} Calculated nutrition totals (calories, protein, carbs, fat)
 */
export function calculateMealNutrition(mealFoods) {
  if (!mealFoods) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return mealFoods.reduce((acc, item) => {
    const food = item.food_servings;
    const quantity = item.quantity || 0;
    
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