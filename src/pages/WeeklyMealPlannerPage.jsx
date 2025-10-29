import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Calendar, Plus, Edit, Trash2, ShoppingCart, Target, ChefHat, X } from 'lucide-react';
import MealBuilder from '../components/MealBuilder';
import { MEAL_TYPES, DAYS_OF_WEEK, getWeekDates, calculateMealNutrition } from '../constants/mealPlannerConstants';
import './WeeklyMealPlannerPage.css';

/**
 * WeeklyMealPlannerPage component for managing weekly meal plans
 * 
 * This component provides a comprehensive weekly meal planning interface with:
 * - 7-day meal planning grid with multiple meal slots per day
 * - Week navigation (previous/next week)
 * - Meal assignment from user's meal library
 * - Real-time nutrition calculation and goal tracking
 * - Meal editing and removal functionality
 * - Integration with MealBuilder for creating new meals
 * 
 * @component
 * @returns {JSX.Element} Complete weekly meal planner interface
 * 
 * @example
 * <WeeklyMealPlannerPage />
 */
const WeeklyMealPlannerPage = () => {
  /** @type {[Date[], Function]} Current week's date array for meal planning */
  const [currentWeek, setCurrentWeek] = useState(() => getWeekDates(new Date()));
  
  /** @type {[Object|null, Function]} Currently active meal plan */
  const [activePlan, setActivePlan] = useState(null);
  
  /** @type {[Array, Function]} User's available meal plans */
  const [mealPlans, setMealPlans] = useState([]);
  
  /** @type {[Array, Function]} Meal entries for the current week/plan */
  const [planEntries, setPlanEntries] = useState([]);
  
  /** @type {[Array, Function]} User's saved meals library */
  const [userMeals, setUserMeals] = useState([]);
  
  /** @type {[Object|null, Function]} Currently selected meal for assignment */
  const [selectedMeal, setSelectedMeal] = useState(null);
  
  /** @type {[Object|null, Function]} Selected time slot for meal assignment */
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  /** @type {[boolean, Function]} Controls MealBuilder modal visibility */
  const [showMealBuilder, setShowMealBuilder] = useState(false);
  
  /** @type {[boolean, Function]} Controls meal selector modal visibility */
  const [showMealSelector, setShowMealSelector] = useState(false);
  

  
  /** @type {[Object, Function]} Calculated nutrition totals by day */
  const [weeklyNutrition, setWeeklyNutrition] = useState({});
  
  /** @type {[Object|null, Function]} User's nutrition goals for comparison */
  const [nutritionGoals, setNutritionGoals] = useState(null);
  
  /** @type {[string, Function]} Selected meal category filter */
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  /** @type {[boolean, Function]} Loading state for initial data fetch */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load initial data including nutrition goals, meal plans, and user meals
   * 
   * @async
   * @returns {Promise<void>}
   */
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load nutrition goals
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('daily_calorie_goal, daily_protein_goal, daily_carb_goal, daily_fat_goal')
        .eq('id', user.id)
        .single();

      if (profile) {
        setNutritionGoals({
          calories: profile.daily_calorie_goal,
          protein: profile.daily_protein_goal,
          carbs: profile.daily_carb_goal,
          fat: profile.daily_fat_goal
        });
      }

      // Load meal plans
      await loadMealPlans();
      
      // Load user meals
      await loadUserMeals();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load plan entries for the current week and active plan
   * 
   * @async
   * @returns {Promise<void>}
   */
  const loadPlanEntries = useCallback(async () => {
    if (!activePlan) return;

    try {
      const startDate = currentWeek[0].toISOString().split('T')[0];
      const endDate = currentWeek[6].toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('meal_plan_entries')
        .select(`
          *,
          meals (
            id,
            name,
            category,
            meal_foods (
              quantity,
              food_servings (
                calories,
                protein_g,
                carbs_g,
                fat_g
              )
            )
          )
        `)
        .eq('weekly_meal_plan_id', activePlan.id)
        .gte('plan_date', startDate)
        .lte('plan_date', endDate);

      if (error) throw error;
      setPlanEntries(data || []);
    } catch (error) {
      console.error('Error loading plan entries:', error);
    }
  }, [activePlan, currentWeek]);

  /**
   * Calculate weekly nutrition totals
   * 
   * @returns {void}
   */
  const calculateWeeklyNutrition = useCallback(() => {
    const dailyNutrition = {};

    // Initialize each day
    currentWeek.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      dailyNutrition[dateStr] = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      };
    });

    // Calculate nutrition for each entry
    planEntries.forEach(entry => {
      const dateStr = entry.plan_date;
      const servings = entry.servings || 1;

      if (!dailyNutrition[dateStr]) return;

      entry.meals.meal_foods.forEach(mealFood => {
        const food = mealFood.food_servings;
        const quantity = mealFood.quantity * servings;

        dailyNutrition[dateStr].calories += (food.calories * quantity || 0);
        dailyNutrition[dateStr].protein += (food.protein_g * quantity || 0);
        dailyNutrition[dateStr].carbs += (food.carbs_g * quantity || 0);
        dailyNutrition[dateStr].fat += (food.fat_g * quantity || 0);
      });
    });

    setWeeklyNutrition(dailyNutrition);
  }, [planEntries, currentWeek]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadPlanEntries();
  }, [loadPlanEntries]);

  useEffect(() => {
    if (planEntries.length > 0) {
      calculateWeeklyNutrition();
    }
  }, [calculateWeeklyNutrition, planEntries]);



  /**
   * Load initial data required for the meal planner
   * Fetches nutrition goals, meal plans, and user meals
   * 
   * @async
   * @returns {Promise<void>}
   */


  /**
   * Load user's meal plans from database and set active plan
   * 
   * Fetches all weekly meal plans for the current user and determines which plan
   * should be active. If no plan is marked as active, makes the most recent plan
   * active automatically.
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} When user is not authenticated or database query fails
   * 
   * @description
   * Plan activation logic:
   * 1. Look for a plan marked with is_active=true
   * 2. If none found, activate the most recent plan
   * 3. Update activePlan state to trigger plan entries loading
   * 
   * @example
   * await loadMealPlans(); // Loads plans and sets active plan
   */
  const loadMealPlans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('weekly_meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setMealPlans(data);
      
      // Set active plan
      const active = data.find(plan => plan.is_active);
      if (active) {
        setActivePlan(active);
      } else if (data.length > 0) {
        // Make the first plan active if none are active
        await setActiveMealPlan(data[0].id);
      }
    } catch (error) {
      console.error('Error loading meal plans:', error);
    }
  };

  /**
   * Load user's saved meals for meal selection in planner
   * 
   * Fetches all meals from the user's personal collection (saved meals) with
   * nutrition data for display in the meal selector. Excludes premade meals
   * that haven't been saved to the user's collection.
   * 
   * @async
   * @returns {Promise<void>}  
   * @throws {Error} When user is not authenticated or database query fails
   * 
   * @description
   * Loads meals with:
   * - Complete meal metadata (name, category, etc.)
   * - Associated meal_foods with nutrition data
   * - User preferences (favorite status, custom names)
   * - Calculated nutrition totals for display
   * 
   * @example
   * await loadUserMeals(); // Populates userMeals state for meal selector
   */
  const loadUserMeals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's saved meals from user_meals table
      const { data: userSavedMeals, error: userMealsError } = await supabase
        .from('user_meals')
        .select(`
          is_favorite,
          custom_name,
          notes,
          meals (
            *,
            meal_foods (
              quantity,
              food_servings (
                calories,
                protein_g,
                carbs_g,
                fat_g
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userMealsError) throw userMealsError;

      // Process user saved meals only (no premade meals in meal planner)
      const userMealsData = userSavedMeals.map(um => ({
        ...um.meals,
        user_meals: [{
          is_favorite: um.is_favorite,
          custom_name: um.custom_name,
          notes: um.notes
        }]
      }));

      const data = userMealsData;
      const error = null;

      if (error) throw error;
      
      // Calculate nutrition for each meal and handle user_meals relationship
      const mealsWithNutrition = data.map(meal => {
        const userMeal = meal.user_meals && meal.user_meals.length > 0 ? meal.user_meals[0] : null;
        return {
          ...meal,
          nutrition: calculateMealNutrition(meal.meal_foods),
          display_name: userMeal?.custom_name || meal.name,
          is_favorite: userMeal?.is_favorite || false,
        };
      });
      
      // Debug: Log loaded meals in development
      if (process.env.NODE_ENV === 'development') {
        console.log('WeeklyMealPlanner - Raw meals data:', data);
        console.log('WeeklyMealPlanner - Processed meals:', mealsWithNutrition);
        console.log('WeeklyMealPlanner - Breakfast meals:', mealsWithNutrition.filter(m => m.category === 'breakfast'));
      }
      
      setUserMeals(mealsWithNutrition);
    } catch (error) {
      console.error('Error loading user meals:', error);
      setUserMeals([]); // Ensure we set empty array on error
    }
  };

  /**
   * Calculate total nutrition values for a meal based on its foods and servings
   * 
   * @param {Array} mealFoods - Array of meal_foods with quantities and nutrition data
   * @param {number} [servings=1] - Number of servings to multiply nutrition by
   * @returns {Object} Calculated nutrition totals (calories, protein, carbs, fat)
   * 
   * @example
   * const nutrition = calculateMealNutrition(meal.meal_foods, 2);
   * // Returns: { calories: 600, protein: 40, carbs: 20, fat: 15 }
   */
  const calculateMealNutrition = (mealFoods, servings = 1) => {
    return mealFoods.reduce((acc, item) => {
      const food = item.food_servings;
      const quantity = item.quantity || 0;
      
      return {
        calories: acc.calories + (food.calories * quantity * servings || 0),
        protein: acc.protein + (food.protein_g * quantity * servings || 0),
        carbs: acc.carbs + (food.carbs_g * quantity * servings || 0),
        fat: acc.fat + (food.fat_g * quantity * servings || 0)
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });
  };

  /**
   * Create a new weekly meal plan for the current week
   * 
   * Creates a new meal plan covering the currently displayed week (Monday-Sunday)
   * and automatically sets it as the active plan. Deactivates any existing active
   * plans to ensure only one plan is active at a time.
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} When user is not authenticated or database operations fail
   * 
   * @description
   * Plan creation process:
   * 1. Calculate start/end dates from current week
   * 2. Generate descriptive plan name with week date
   * 3. Deactivate existing active plans
   * 4. Create new plan marked as active
   * 5. Update local state and reload plans
   * 
   * @example
   * await createNewMealPlan(); // Creates "Meal Plan - Week of 12/4/2023"
   */
  const createNewMealPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startDate = currentWeek[0].toISOString().split('T')[0];
      const endDate = currentWeek[6].toISOString().split('T')[0];
      const planName = `Meal Plan - Week of ${currentWeek[0].toLocaleDateString()}`;

      const { data, error } = await supabase
        .from('weekly_meal_plans')
        .insert([{
          user_id: user.id,
          name: planName,
          start_date: startDate,
          end_date: endDate,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      
      setActivePlan(data);
      await loadMealPlans();
    } catch (error) {
      console.error('Error creating meal plan:', error);
      alert('Error creating meal plan. Please try again.');
    }
  };

  const setActiveMealPlan = async (planId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use atomic function to safely set active plan
      const { data, error } = await supabase.rpc('set_active_meal_plan', {
        plan_uuid: planId,
        user_uuid: user.id
      });

      if (error) throw error;
      
      setActivePlan(data);
      await loadMealPlans();
    } catch (error) {
      console.error('Error setting active meal plan:', error);
    }
  };

  const handleSlotClick = (date, mealType) => {
    setSelectedSlot({ date: date.toISOString().split('T')[0], mealType });
    
    // Auto-select the appropriate category based on meal type
    const categoryMap = {
      breakfast: 'breakfast',
      lunch: 'lunch', 
      dinner: 'dinner',
      snack1: 'snack',
      snack2: 'snack'
    };
    setSelectedCategory(categoryMap[mealType] || 'all');
    
    setShowMealSelector(true);
  };



  /**
   * Add a selected meal to a specific time slot in the meal plan
   * 
   * Creates a meal_plan_entries record linking a meal to a specific date and meal type
   * within the active meal plan. Allows specifying the number of servings.
   * 
   * @async
   * @param {Object} meal - Complete meal object to add to the plan
   * @param {number} meal.id - Database ID of the meal to add
   * @param {number} [servings=1] - Number of servings to plan for this meal
   * @returns {Promise<void>}
   * @throws {Error} When no active plan, no selected slot, or database operation fails
   * 
   * @description
   * Requires both activePlan and selectedSlot to be set (from handleSlotClick).
   * After successful addition:
   * 1. Reloads plan entries to show the new meal
   * 2. Closes the meal selector modal
   * 3. Clears the selected slot state
   * 
   * @example
   * await addMealToSlot(chickenSalad, 2); // Adds 2 servings of chicken salad
   */
  const addMealToSlot = async (meal, servings = 1) => {
    if (!activePlan || !selectedSlot) return;

    try {
      const { error } = await supabase
        .from('meal_plan_entries')
        .insert([{
          weekly_meal_plan_id: activePlan.id,
          meal_id: meal.id,
          plan_date: selectedSlot.date,
          meal_type: selectedSlot.mealType,
          servings: servings
        }]);

      if (error) throw error;
      
      await loadPlanEntries();
      setShowMealSelector(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error adding meal to plan:', error);
      alert('Error adding meal to plan. Please try again.');
    }
  };

  const removeMealFromSlot = async (entryId) => {
    try {
      const { error } = await supabase
        .from('meal_plan_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
      
      await loadPlanEntries();
    } catch (error) {
      console.error('Error removing meal from plan:', error);
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek[0]);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(getWeekDates(newDate));
  };

  /**
   * Convert meal type key to display-friendly label
   * 
   * @param {string} mealType - Internal meal type identifier
   * @returns {string} Human-readable meal type label
   * 
   * @example
   * formatMealType('snack1'); // Returns "Snack 1"
   * formatMealType('breakfast'); // Returns "Breakfast"
   */
  const formatMealType = (mealType) => {
    const typeMap = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack1: 'Snack 1',
      snack2: 'Snack 2'
    };
    return typeMap[mealType] || mealType;
  };

  /**
   * Get all meal entries for a specific date and meal type
   * 
   * @param {Date} date - Date to search for entries
   * @param {string} mealType - Meal type to filter by (breakfast, lunch, etc.)
   * @returns {Array} Array of meal plan entry objects
   * 
   * @example
   * const breakfastMeals = getMealsByTypeAndDate(new Date(), 'breakfast');
   */
  const getMealsByTypeAndDate = (date, mealType) => {
    const dateStr = date.toISOString().split('T')[0];
    return planEntries.filter(entry => 
      entry.plan_date === dateStr && entry.meal_type === mealType
    );
  };

  /**
   * Get calculated nutrition totals for a specific day
   * 
   * @param {Date} date - Date to get nutrition totals for
   * @returns {Object} Daily nutrition totals (calories, protein, carbs, fat)
   * 
   * @example
   * const todayNutrition = getDayNutrition(new Date());
   * console.log(`Today's calories: ${todayNutrition.calories}`);
   */
  const getDayNutrition = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return weeklyNutrition[dateStr] || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading meal planner...</p>
      </div>
    );
  }

  return (
    <div className="weekly-meal-planner">
      {/* Header */}
      <div className="planner-header">
        <div className="header-left">
          <h1>
            <Calendar className="icon" />
            Weekly Meal Planner
          </h1>
          <div className="week-navigation">
            <button onClick={() => navigateWeek(-1)} className="nav-btn">←</button>
            <span className="week-display">
              {currentWeek[0].toLocaleDateString()} - {currentWeek[6].toLocaleDateString()}
            </span>
            <button onClick={() => navigateWeek(1)} className="nav-btn">→</button>
          </div>
        </div>
        
        <div className="header-actions">
          <button onClick={() => setShowMealBuilder(true)} className="create-meal-btn">
            <Plus className="icon" />
            Create Meal
          </button>
          
          {!activePlan && (
            <button onClick={createNewMealPlan} className="create-plan-btn">
              <Plus className="icon" />
              Create Plan
            </button>
          )}
        </div>
      </div>

      {/* Active Plan Info */}
      {activePlan && (
        <div className="active-plan-info">
          <div className="plan-details">
            <h3>{activePlan.name}</h3>
            <p>{activePlan.start_date} to {activePlan.end_date}</p>
          </div>
          <div className="plan-actions">
            <button className="shopping-list-btn">
              <ShoppingCart className="icon" />
              Shopping List
            </button>
            <button className="recommendations-btn">
              <Target className="icon" />
              Get Recommendations
            </button>
          </div>
        </div>
      )}

      {/* Meal Planning Grid */}
      {activePlan ? (
        <div className="meal-planning-grid">
          <div className="grid-header">
            <div className="meal-type-column">Meal</div>
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="day-column">{day}</div>
            ))}
          </div>
          
          {MEAL_TYPES.map(mealType => (
            <div key={mealType} className="meal-row">
              <div className="meal-type-label">
                {formatMealType(mealType)}
              </div>
              
              {currentWeek.map((date, dayIndex) => (
                <div
                  key={`${mealType}-${dayIndex}`}
                  className="meal-slot"
                  onClick={() => handleSlotClick(date, mealType)}
                >
                  {getMealsByTypeAndDate(date, mealType).map(entry => (
                    <div key={entry.id} className="meal-entry">
                      <div className="meal-name">{entry.meals.name}</div>
                      <div className="meal-servings">
                        {entry.servings} {entry.meals.serving_unit}
                      </div>
                      <div className="meal-calories">
                        {Math.round(calculateMealNutrition(entry.meals.meal_foods, entry.servings).calories)} cal
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMealFromSlot(entry.id);
                        }}
                        className="remove-meal-btn"
                        title="Remove meal from plan"
                      >
                        <Trash2 className="icon" />
                      </button>
                    </div>
                  ))}
                  
                  {getMealsByTypeAndDate(date, mealType).length === 0 && (
                    <div className="empty-slot">
                      <Plus className="icon" />
                      Add meal
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          
          {/* Daily Nutrition Summary Row */}
          <div className="nutrition-summary-row">
            <div className="meal-type-label">Daily Total</div>
            {currentWeek.map((date, dayIndex) => {
              const nutrition = getDayNutrition(date);
              return (
                <div key={`nutrition-${dayIndex}`} className="day-nutrition">
                  <div className="nutrition-item">
                    <span className="value">{Math.round(nutrition.calories)}</span>
                    <span className="label">cal</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="value">{Math.round(nutrition.protein)}g</span>
                    <span className="label">protein</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="value">{Math.round(nutrition.carbs)}g</span>
                    <span className="label">carbs</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="value">{Math.round(nutrition.fat)}g</span>
                    <span className="label">fat</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="no-plan-message">
          <ChefHat className="icon large" />
          <h3>No Meal Plan Active</h3>
          <p>Create a new meal plan to start planning your weekly meals.</p>
          <button onClick={createNewMealPlan} className="create-plan-btn">
            <Plus className="icon" />
            Create Your First Plan
          </button>
        </div>
      )}

      {/* Meal Builder Modal */}
      <MealBuilder
        isOpen={showMealBuilder}
        onClose={() => setShowMealBuilder(false)}
        onSave={(meal) => {
          loadUserMeals();
          setShowMealBuilder(false);
        }}
      />

      {/* Meal Selector Modal */}
      {showMealSelector && (
        <div className="meal-selector-overlay">
          <div className="meal-selector-modal">
            <div className="meal-selector-header">
              <h3>
                {selectedCategory === 'all' 
                  ? 'Select a Meal' 
                  : `Select a ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Meal`
                }
              </h3>
              <button onClick={() => setShowMealSelector(false)} className="close-btn">
                <X className="icon" />
              </button>
            </div>
            
            <div className="meal-selector-content">
              {/* Only show category tabs if selectedCategory is 'all' - when adding to specific meal slot, don't show tabs */}
              {selectedCategory === 'all' && (
                <div className="meal-categories">
                  {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map(category => (
                    <button
                      key={category}
                      className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="meal-list">
                {(() => {
                  // Debug: Log filtering process
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Filtering meals - selectedCategory:', selectedCategory, 'userMeals:', userMeals);
                  }
                  
                  const filteredMeals = userMeals.filter(meal => {
                    const matches = selectedCategory === 'all' || meal.category === selectedCategory;
                    if (process.env.NODE_ENV === 'development') {
                      console.log(`Meal ${meal.name} (category: ${meal.category}) matches ${selectedCategory}:`, matches);
                    }
                    return matches;
                  });
                  
                  if (filteredMeals.length === 0) {
                    return (
                      <div className="no-meals-found">
                        <p>No {selectedCategory === 'all' ? '' : selectedCategory} meals found.</p>
                        <button 
                          className="create-meal-btn"
                          onClick={() => {
                            setShowMealSelector(false);
                            setShowMealBuilder(true);
                          }}
                        >
                          <Plus className="icon" />
                          Create New Meal
                        </button>
                      </div>
                    );
                  }
                  
                  return filteredMeals.map(meal => (
                    <div
                      key={meal.id}
                      className="meal-option"
                      onClick={() => addMealToSlot(meal)}
                    >
                      <div className="meal-info">
                        <div className="meal-name">{meal.display_name || meal.name}</div>
                        <div className="meal-description">{meal.description}</div>
                        <div className="meal-nutrition">
                          {Math.round(meal.nutrition.calories)} cal • 
                          {Math.round(meal.nutrition.protein)}g protein • 
                          {Math.round(meal.nutrition.carbs)}g carbs • 
                          {Math.round(meal.nutrition.fat)}g fat
                        </div>
                      </div>
                      <div className="meal-meta">
                        <span className="meal-category">{meal.category}</span>
                        {meal.is_premade && <span className="premade-badge">Premade</span>}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default WeeklyMealPlannerPage;