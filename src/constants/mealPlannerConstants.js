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

export const calculateMealNutrition = (mealFoods) => {
  if (!mealFoods || !Array.isArray(mealFoods)) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  return mealFoods.reduce((acc, mf) => {
    // Check if food data exists (user_meal_foods -> foods relation)
    const food = mf.foods;
    if (!food) return acc;

    const ratio = mf.quantity || 1;
    
    return {
      calories: acc.calories + (food.calories || 0) * ratio,
      protein: acc.protein + (food.protein_g || 0) * ratio,
      carbs: acc.carbs + (food.carbs_g || 0) * ratio,
      fat: acc.fat + (food.fat_g || 0) * ratio
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
};