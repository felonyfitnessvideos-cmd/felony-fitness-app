export const MEAL_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
  { value: 'preworkout', label: 'Pre-Workout' },
  { value: 'postworkout', label: 'Post-Workout' },
  { value: 'other', label: 'Other' }
];

/**
 * Array of days of the week for calendar/weekly views
 * @type {string[]}
 */
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

/**
 * Array of meal type identifiers for daily meal slots
 * @type {string[]}
 */
export const MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'preworkout',
  'postworkout'
];

/**
 * Food categories with keyword matching for automatic shopping list organization
 * 
 * @description Maps food categories to arrays of keywords that identify foods
 * belonging to that category. Used in shopping list generation for organizing
 * items by type.
 * @type {Object<string, string[]>}
 */
export const FOOD_CATEGORIES = {
  'Proteins': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey', 'egg', 'protein', 'meat', 'tofu', 'tempeh', 'seitan'],
  'Dairy': ['milk', 'cheese', 'yogurt', 'dairy', 'cream', 'butter', 'whey'],
  'Vegetables': ['vegetable', 'carrot', 'broccoli', 'spinach', 'lettuce', 'celery', 'pepper', 'onion', 'garlic', 'kale', 'cabbage', 'cucumber', 'tomato', 'green', 'squash', 'zucchini', 'asparagus'],
  'Fruits': ['fruit', 'apple', 'banana', 'orange', 'berry', 'strawberry', 'blueberry', 'grape', 'melon', 'watermelon', 'pineapple', 'mango', 'peach', 'lemon', 'lime'],
  'Grains': ['grain', 'bread', 'rice', 'pasta', 'oat', 'cereal', 'flour', 'wheat', 'barley', 'quinoa', 'corn'],
  'Oils & Condiments': ['oil', 'sauce', 'dressing', 'seasoning', 'spice', 'salt', 'pepper', 'vinegar', 'soy', 'mayo'],
  'Snacks': ['snack', 'bar', 'chip', 'cracker', 'nut', 'almond', 'walnut', 'peanut', 'seed'],
  'Beverages': ['drink', 'juice', 'coffee', 'tea', 'water', 'soda', 'smoothie'],
  'Other': []
};

export const calculateMealNutrition = (mealFoods) => {
  if (!mealFoods || !Array.isArray(mealFoods)) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  return mealFoods.reduce((acc, mf) => {
    // Check if food data exists (user_meal_foods -> foods relation)
    const food = mf.foods;
    if (!food) return acc;

    // Support legacy key names: quantity, servings, food_servings
    const ratio = mf.quantity || mf.servings || mf.food_servings || 1;
    
    return {
      calories: Math.round((acc.calories + (food.calories || 0) * ratio) * 10) / 10,
      protein: Math.round((acc.protein + (food.protein_g || 0) * ratio) * 10) / 10,
      carbs: Math.round((acc.carbs + (food.carbs_g || 0) * ratio) * 10) / 10,
      fat: Math.round((acc.fat + (food.fat_g || 0) * ratio) * 10) / 10
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
};

/**
 * Format meal type string for display
 * 
 * @description Converts meal type identifiers (lowercase, hyphenated) to
 * user-friendly display format (title case, spaces).
 * 
 * @param {string} mealType - Meal type identifier (e.g., 'preworkout', 'post-workout')
 * @returns {string} Formatted meal type for display (e.g., 'Pre-Workout', 'Post-Workout')
 * 
 * @example
 * formatMealType('breakfast') // Returns 'Breakfast'
 * formatMealType('preworkout') // Returns 'Pre-Workout'
 * formatMealType('post-workout') // Returns 'Post-Workout'
 */
export const formatMealType = (mealType) => {
  if (!mealType) return '';
  
  return mealType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
};

/**
 * Get array of dates for the current week (Monday-Sunday)
 * 
 * @description Calculates the start and end dates for the week containing
 * the provided date, returning an array of 7 consecutive dates starting Monday.
 * 
 * @param {Date} date - Reference date to determine the week for
 * @returns {Date[]} Array of 7 dates from Monday to Sunday
 * 
 * @example
 * const dates = getWeekDates(new Date('2024-01-15')); // January 15, 2024 is a Monday
 * // Returns: [Mon 15, Tue 16, Wed 17, Thu 18, Fri 19, Sat 20, Sun 21]
 */
export const getWeekDates = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  
  const week = [];
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(d.setDate(diff + i));
    week.push(new Date(weekDate)); // Clone to avoid reference issues
  }
  
  return week;
};