
/**
 * @file NutritionLogPage.jsx
 * @description This page allows users to log their daily food and water intake for different meals.
 * 
 * PERFORMANCE OPTIMIZATION:
 * - Uses pre-calculated nutritional values stored in nutrition_logs table
 * - Database trigger auto-populates all 25 nutrients (macros + micronutrients) on INSERT/UPDATE
 * - Zero aggregation cost at query time (just SELECT + SUM)
 * - Historical accuracy (values frozen at time of logging)
 * 
 * @project Felony Fitness
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { supabase } from '../supabaseClient.js';
import { formatMealType } from '../constants/mealPlannerConstants.js';
/**
 * NutritionLogPage — log daily nutrition entries.
 *
 * Responsibilities:
 * - add/edit nutrition log entries with sanitized numeric input
 * - normalize dates and avoid timezone surprises on mobile
 *
 * Notes:
 * - uses text + inputMode for numeric fields to avoid mobile quirks and
 *   sanitizes values before persisting.
 * - ALWAYS uses lowercase meal types ('breakfast', 'lunch', 'dinner', 'snack')
 *   for state and database operations. Use formatMealType() for display only.
 */
import { Apple, Camera, Droplets, Loader2, Search, Trash2, X } from 'lucide-react';
import Modal from 'react-modal';
import { useAuth } from '../AuthContext.jsx';
import './NutritionLogPage.css';


/**
 * @typedef {object} NutritionLog
 * @property {string} id
 * @property {string} meal_type
 * @property {number} quantity_consumed
 * @property {number} [water_oz_consumed]
 * @property {object} food_servings
 * @property {object} food_servings.foods
 * @property {string} food_servings.food_name
 * @property {string} food_servings.serving_description
 * @property {number} food_servings.calories
 * @property {number} food_servings.protein_g
 */

/**
 * @typedef {object} SearchResult
 * @property {boolean} is_external
 * @property {string} [food_id]
 * @property {string} name
 * @property {string} [serving_id]
 * @property {string} serving_description
 * @property {number} calories
 * @property {number} protein_g
 */

/**
 * NutritionLogPage
 * Page for logging food and water. Includes robust timezone-aware queries and
 * defensive guards against missing profile data or partial search results.
 */
function NutritionLogPage() {
  const { user } = useAuth();
  const userId = user?.id;
  
  // IMPORTANT: Always use lowercase meal types for state and database operations
  const [activeMeal, setActiveMeal] = useState('breakfast');
  /** @type {[NutritionLog[], React.Dispatch<React.SetStateAction<NutritionLog[]>>]} */
  const [todaysLogs, setTodaysLogs] = useState([]);
  const [goals, setGoals] = useState({ daily_calorie_goal: 2000, daily_protein_goal_g: 150, daily_water_goal_oz: 128 });
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  /** @type {[SearchResult[], React.Dispatch<React.SetStateAction<SearchResult[]>>]} */
  const [searchResults, setSearchResults] = useState([]);
  const searchAbortControllerRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  /** @type {[SearchResult | null, React.Dispatch<React.SetStateAction<SearchResult | null>>]} */
  const [selectedFood, setSelectedFood] = useState(null);
  // Store quantity as a string to avoid mobile keyboards auto-inserting values
  // when a numeric input is cleared. We sanitize and parse before submitting.
  const [quantity, setQuantity] = useState('1');
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0, protein: 0, water: 0
  });
  const [scheduledMeal, setScheduledMeal] = useState(null);
  const [isAddingMealPlan, setIsAddingMealPlan] = useState(false);

  const mealLogs = todaysLogs.filter(log => 
    log.meal_type?.toLowerCase() === activeMeal.toLowerCase()
  );
  
  const calorieProgress = goals.daily_calorie_goal > 0 ? (dailyTotals.calories / goals.daily_calorie_goal) * 100 : 0;

  /**
   * Fetches all nutrition data for the current day and calculates totals.
   * This function uses a robust, timezone-proof method to query the database.
   * 
   * PERFORMANCE OPTIMIZED: Uses pre-calculated nutritional values from nutrition_logs table.
   * Values are auto-populated by database trigger (calculate_nutrition_log_values) which
   * multiplies food_servings data by quantity_consumed on INSERT/UPDATE.
   * 
   * @param {string} userId - The UUID of the authenticated user.
   * @async
   */
  const fetchLogData = useCallback(async (userId) => {
    setLoading(true);
    try {
      // **TIMEZONE FIX**: Use local date, not UTC date
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayDateString = `${year}-${month}-${day}`; // YYYY-MM-DD in LOCAL timezone

      const [logsResponse, profileResponse] = await Promise.all([
        supabase
          .from('nutrition_logs')
          .select('*, foods(name, brand_owner)')
          .eq('user_id', userId)
          .eq('log_date', todayDateString),
        supabase
          .from('user_profiles')
          .select('daily_calorie_goal, daily_protein_goal_g, daily_water_goal_oz')
          .eq('id', userId)
          .single()
      ]);

      if (logsResponse.error) throw logsResponse.error;
      if (profileResponse.error && profileResponse.error.code !== 'PGRST116') throw profileResponse.error;

      const logs = logsResponse.data || [];
      
      setTodaysLogs(logs);
      if (profileResponse.data) setGoals(profileResponse.data);

      // **PERFORMANCE OPTIMIZED**: Use pre-calculated values from nutrition_logs table
      // Values are auto-populated by database trigger when food is logged
      const totals = logs.reduce((acc, log) => {
        // Use pre-calculated nutritional values (already multiplied by quantity_consumed)
        acc.calories += log.calories || 0;
        acc.protein += log.protein_g || 0;
        
        // Water is still logged separately (no trigger needed)
        if (log.water_oz_consumed) {
          acc.water += log.water_oz_consumed;
        }
        return acc;
      }, { calories: 0, protein: 0, water: 0 });

      setDailyTotals({
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        water: Math.round(totals.water)
      });

    } catch (error) {
      console.error("A critical error occurred during data fetch:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetches the scheduled meal from weekly_meal_plan_entries for current date and meal type.
   * 
   * @description Queries the database for an active meal plan entry matching the current date
   * and selected meal type. Uses local timezone to avoid date mismatch issues. If a meal is found,
   * updates the scheduledMeal state to display the "Add Meal Plan" button in the UI.
   * 
   * @param {string} userId - The UUID of the authenticated user
   * @param {string} mealType - The meal type in lowercase ('breakfast', 'lunch', 'dinner', 'snack')
   * 
   * @returns {Promise<void>} Updates scheduledMeal state with meal data or null
   * 
   * @example
   * fetchScheduledMeal('user-uuid-123', 'breakfast');
   * // Sets scheduledMeal to { entryId, mealId, mealName, servings } or null
   * 
   * @async
   * @see {@link handleAddMealPlanToLog} - Called when user clicks the button
   */
  const fetchScheduledMeal = useCallback(async (userId, mealType) => {
    try {
      // **TIMEZONE FIX**: Use local date, not UTC date
      const todayDate = new Date();
      const year = todayDate.getFullYear();
      const month = String(todayDate.getMonth() + 1).padStart(2, '0');
      const day = String(todayDate.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`; // YYYY-MM-DD in LOCAL timezone
      
      console.log(`[fetchScheduledMeal] Querying for: userId=${userId}, mealType="${mealType}", date=${today}`);
      
      const { data, error} = await supabase
        .from('weekly_meal_plan_entries')
        .select(`
          id,
          user_meal_id,
          meal_type,
          plan_date,
          servings,
          user_meals (
            id,
            name
          ),
          weekly_meal_plans!inner (
            user_id,
            is_active
          )
        `)
        .eq('weekly_meal_plans.user_id', userId)
        .eq('weekly_meal_plans.is_active', true)
        .eq('plan_date', today)
        .eq('meal_type', mealType)  // Already lowercase from state
        .maybeSingle();

      if (error) {
        console.error('Error fetching scheduled meal:', error);
        setScheduledMeal(null);
        return;
      }

      console.log(`[fetchScheduledMeal] Query result for "${mealType}":`, data);

      // Only show button if there's actually a meal assigned (user_meal_id is not null)
      if (data && data.user_meal_id && data.user_meals) {
        console.log(`[fetchScheduledMeal] Found scheduled meal: "${data.user_meals.name}"`);
        setScheduledMeal({
          entryId: data.id,
          mealId: data.user_meal_id,
          mealName: data.user_meals.name,
          servings: data.servings || 1
        });
      } else {
        if (data && !data.user_meal_id) {
          console.log(`[fetchScheduledMeal] Meal slot exists but no meal assigned for "${mealType}"`);
        } else {
          console.log(`[fetchScheduledMeal] No scheduled meal found for "${mealType}"`);
        }
        setScheduledMeal(null);
      }
    } catch (error) {
      console.error('Error in fetchScheduledMeal:', error);
      setScheduledMeal(null);
    }
  }, []);

  // Depend only on the user's id and the stable fetchLogData callback. We
  // intentionally avoid depending on the full `user` object to prevent
  // re-fetches caused by non-essential reference changes.

  useEffect(() => {
    if (userId) {
      fetchLogData(userId);
    } else {
      setLoading(false);
    }
  }, [userId, fetchLogData]);

  // Fetch scheduled meal whenever user or activeMeal changes
  useEffect(() => {
    if (userId && activeMeal) {
      fetchScheduledMeal(userId, activeMeal);
    }
  }, [userId, activeMeal, fetchScheduledMeal]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);

    // Clear pending debounce timer
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }

    if (term.length < 3) {
      if (searchAbortControllerRef.current) {
        try { searchAbortControllerRef.current.abort(); } catch (_err) { void _err; /* ignore */ }
        searchAbortControllerRef.current = null;
      }
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      if (searchAbortControllerRef.current) {
        try { searchAbortControllerRef.current.abort(); } catch (_err) { void _err; /* ignore */ }
      }
      const controller = new AbortController();
      searchAbortControllerRef.current = controller;

      setIsSearching(true);
      try {
        console.log('[DEBUG] Searching for:', term);
        
        // Direct Supabase search - foods table with portions
        // Order by: non-alcoholic first, then by name
        const { data: results, error: searchError } = await supabase
          .from('foods')
          .select(`
            *,
            portions (*)
          `)
          .or(`name.ilike.%${term}%,brand_owner.ilike.%${term}%`)
          .order('name')
          .limit(100);
        
        // Filter out alcoholic beverages and sort better matches first
        const filtered = (results || []).filter(food => 
          !food.name.toLowerCase().includes('alcoholic') &&
          !food.name.toLowerCase().includes('liqueur') &&
          !food.name.toLowerCase().includes('wine') &&
          !food.name.toLowerCase().includes('beer')
        );
        
        // Sort: exact matches first, then starts with, then contains
        const termLower = term.toLowerCase();
        const sorted = filtered.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          
          // Prioritize simpler names (fewer words/commas = more basic food)
          const aWords = aName.split(/[,\s]+/).length;
          const bWords = bName.split(/[,\s]+/).length;
          
          // Exact match
          if (aName === termLower && bName !== termLower) return -1;
          if (bName === termLower && aName !== termLower) return 1;
          
          // Starts with search term
          const aStarts = aName.startsWith(termLower);
          const bStarts = bName.startsWith(termLower);
          if (aStarts && !bStarts) return -1;
          if (bStarts && !aStarts) return 1;
          
          // If both start with term, prefer simpler (brewed coffee > coffee cake)
          if (aStarts && bStarts) {
            if (aWords !== bWords) return aWords - bWords;
          }
          
          // Prefer foods where term appears early
          const aIndex = aName.indexOf(termLower);
          const bIndex = bName.indexOf(termLower);
          if (aIndex !== bIndex) return aIndex - bIndex;
          
          // Prefer simpler foods overall
          if (aWords !== bWords) return aWords - bWords;
          
          // Alphabetical
          return aName.localeCompare(bName);
        }).slice(0, 50);
        
        console.log('[DEBUG] Search results:', sorted.length, 'foods found (filtered from', results?.length || 0, ')');
        
        if (searchError) {
          console.error('Food search error:', searchError);
          setSearchResults([]);
          return;
        }

        // Format results for UI
        const standardizedResults = (sorted || []).map(food => {
          // Get default portion (first one or 100g equivalent)
          const defaultPortion = food.portions?.[0] || {
            gram_weight: 100,
            portion_description: '100g'
          };

          const portionGrams = defaultPortion.gram_weight || 100;
          const multiplier = portionGrams / 100;

          return {
            is_external: false,
            food_id: food.id,
            name: food.name,
            brand: food.brand_owner || food.data_type || '',
            serving_id: food.id,
            serving_description: defaultPortion.portion_description || `${portionGrams}g`,
            portions: food.portions || [],
            // Nutrition (scaled from 100g base to portion size)
            calories: Math.round((food.calories || 0) * multiplier),
            protein_g: Math.round((food.protein_g || 0) * multiplier * 10) / 10,
            carbs_g: Math.round((food.carbs_g || 0) * multiplier * 10) / 10,
            fat_g: Math.round((food.fat_g || 0) * multiplier * 10) / 10,
            fiber_g: Math.round((food.fiber_g || 0) * multiplier * 10) / 10,
            sugar_g: Math.round((food.sugar_g || 0) * multiplier * 10) / 10,
            sodium_mg: Math.round((food.sodium_mg || 0) * multiplier),
            calcium_mg: Math.round((food.calcium_mg || 0) * multiplier),
            iron_mg: Math.round((food.iron_mg || 0) * multiplier * 10) / 10,
            vitamin_c_mg: Math.round((food.vitamin_c_mg || 0) * multiplier * 10) / 10,
            potassium_mg: Math.round((food.potassium_mg || 0) * multiplier),
            vitamin_a_mcg: Math.round((food.vitamin_a_mcg || 0) * multiplier),
            vitamin_e_mg: Math.round((food.vitamin_e_mg || 0) * multiplier * 10) / 10,
            vitamin_k_mcg: Math.round((food.vitamin_k_mcg || 0) * multiplier * 10) / 10,
            thiamin_mg: Math.round((food.thiamin_mg || 0) * multiplier * 100) / 100,
            riboflavin_mg: Math.round((food.riboflavin_mg || 0) * multiplier * 100) / 100,
            niacin_mg: Math.round((food.niacin_mg || 0) * multiplier * 10) / 10,
            vitamin_b6_mg: Math.round((food.vitamin_b6_mg || 0) * multiplier * 100) / 100,
            folate_mcg: Math.round((food.folate_mcg || 0) * multiplier),
            vitamin_b12_mcg: Math.round((food.vitamin_b12_mcg || 0) * multiplier * 100) / 100,
            magnesium_mg: Math.round((food.magnesium_mg || 0) * multiplier),
            phosphorus_mg: Math.round((food.phosphorus_mg || 0) * multiplier),
            zinc_mg: Math.round((food.zinc_mg || 0) * multiplier * 10) / 10,
            copper_mg: Math.round((food.copper_mg || 0) * multiplier * 100) / 100,
            selenium_mcg: Math.round((food.selenium_mcg || 0) * multiplier),
            cholesterol_mg: Math.round((food.cholesterol_mg || 0) * multiplier),
            // Metadata
            category: food.category || null,
          };
        });

        console.log('[DEBUG] Standardized results:', standardizedResults.length);
        setSearchResults(standardizedResults);
      } catch (error) {
        if (error?.name === 'AbortError') {
          // ignore
        } else {
          console.error('Error searching food:', error?.message || error);
        }
      } finally {
        setIsSearching(false);
        searchAbortControllerRef.current = null;
      }
    }, 300);
  }, []);

  const openLogModal = async (food) => {
    if (food.needs_serving_fetch) {
      // Fetch portions for this food from new structure
      try {
        const { data: foodData, error } = await supabase
          .from('foods')
          .select('*, portions(*)')
          .eq('id', food.food_id)
          .single();

        if (error) {
          console.error('Error fetching food data:', error);
          return;
        }

        if (foodData && foodData.portions && foodData.portions.length > 0) {
          // Use the first portion as default
          const defaultPortion = foodData.portions[0];
          // Calculate nutrition for this portion size (base is per 100g)
          const multiplier = defaultPortion.gram_weight / 100;
          const updatedFood = {
            ...food,
            food_id: foodData.id,
            portion_id: defaultPortion.id,
            portion_description: defaultPortion.portion_description || `${defaultPortion.amount} ${defaultPortion.measure_unit}`,
            calories: (foodData.calories * multiplier).toFixed(1),
            protein_g: (foodData.protein_g * multiplier).toFixed(1),
            carbs_g: (foodData.carbs_g * multiplier).toFixed(1),
            fat_g: (foodData.fat_g * multiplier).toFixed(1),
            needs_serving_fetch: false
          };
          setSelectedFood(updatedFood);
        } else {
          console.error('No portions found for food:', food.name);
          return;
        }
      } catch (error) {
        console.error('Error fetching food portions:', error);
        return;
      }
    } else {
      setSelectedFood(food);
    }
    setIsLogModalOpen(true);
  };

  const closeLogModal = () => {
    setIsLogModalOpen(false);
    setSelectedFood(null);
    setSearchTerm('');
    setSearchResults([]);
    setQuantity('1');
  };

  const handleLogFood = async () => {
    // Normalize quantity to a number for validation and payload.
    const qty = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
    if (!selectedFood || !qty || qty <= 0 || Number.isNaN(qty) || !user) return;

    try {
      let servingId = selectedFood.serving_id;

      // If this is an external food without a food_id, create a foods record first
      if (!servingId && selectedFood.is_external) {
        const { data: newFood, error: foodError } = await supabase
          .from('foods')
          .insert({
            name: selectedFood.name,
            brand_owner: selectedFood.brand || null,
            category: selectedFood.category || 'custom',
            data_source: 'USER_CUSTOM',
            // Core macronutrients (stored per 100g, but user entered as-is, so we'll treat as 1 serving = 100g)
            calories: selectedFood.calories || 0,
            protein_g: selectedFood.protein_g || 0,
            carbs_g: selectedFood.carbs_g || 0,
            fat_g: selectedFood.fat_g || 0,
            fiber_g: selectedFood.fiber_g || 0,
            sugar_g: selectedFood.sugar_g || 0,
            // Micronutrients - explicitly set to 0 if not provided
            sodium_mg: selectedFood.sodium_mg || 0,
            calcium_mg: selectedFood.calcium_mg || 0,
            iron_mg: selectedFood.iron_mg || 0,
            vitamin_c_mg: selectedFood.vitamin_c_mg || 0,
            potassium_mg: selectedFood.potassium_mg || 0,
            vitamin_a_mcg: selectedFood.vitamin_a_mcg || 0,
            vitamin_e_mg: selectedFood.vitamin_e_mg || 0,
            vitamin_k_mcg: selectedFood.vitamin_k_mcg || 0,
            thiamin_mg: selectedFood.thiamin_mg || 0,
            riboflavin_mg: selectedFood.riboflavin_mg || 0,
            niacin_mg: selectedFood.niacin_mg || 0,
            vitamin_b6_mg: selectedFood.vitamin_b6_mg || 0,
            folate_mcg: selectedFood.folate_mcg || 0,
            vitamin_b12_mcg: selectedFood.vitamin_b12_mcg || 0,
            magnesium_mg: selectedFood.magnesium_mg || 0,
            phosphorus_mg: selectedFood.phosphorus_mg || 0,
            zinc_mg: selectedFood.zinc_mg || 0,
            copper_mg: selectedFood.copper_mg || 0,
            selenium_mcg: selectedFood.selenium_mcg || 0
          })
          .select()
          .single();

        if (foodError) {
          console.error('Error creating food record:', foodError);
          alert(`Error saving food: ${foodError.message}`);
          return;
        }

        // Create a default portion for this food (assume 100g = 1 serving)
        const { error: portionError } = await supabase
          .from('portions')
          .insert({
            food_id: newFood.id,
            amount: 1,
            measure_unit: selectedFood.serving_description || 'serving',
            gram_weight: 100, // Default 100g
            portion_description: selectedFood.serving_description || '1 serving'
          });

        if (portionError) {
          console.error('Error creating portion record:', portionError);
          // Continue anyway, we have the food
        }

        servingId = newFood.id;
      }

      // Now insert the nutrition log
      // **TIMEZONE FIX**: Use local date, not UTC
      const today = new Date();
      const logDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const { data: _data, error } = await supabase
        .from('nutrition_logs')
        .insert({
          user_id: user.id,
          food_id: servingId,
          meal_type: activeMeal,
          quantity_consumed: qty,
          log_date: logDate
        })
        .select();

      if (error) {
        console.error('Error logging food:', error);
        alert(`Error logging food: ${error.message}`);
      } else {
        await fetchLogData(user.id);
        closeLogModal();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`Error logging food: ${error.message}`);
    }
  };

  /**
   * Adds all foods from the scheduled meal plan to the nutrition log.
   * 
   * @description Fetches all meal_foods associated with the scheduled meal, calculates
   * quantities based on meal servings, and bulk inserts them into nutrition_logs table.
   * Refreshes the log data and hides the button after successful addition.
   * 
   * @returns {Promise<void>} Adds meal foods to nutrition log and refreshes UI
   * 
   * @note Errors are caught and displayed via alert dialogs, not thrown to caller
   * 
   * @example
   * // User clicks "Add Breakfast" button
   * await handleAddMealPlanToLog();
   * // All foods from scheduled meal are logged with correct quantities
   * 
   * @async
   * @requires scheduledMeal - Must be set by fetchScheduledMeal
   * @requires user - Must be authenticated
   * @requires activeMeal - Current meal type tab ('breakfast', 'lunch', etc.)
   * 
   * @sideEffects
   * - Inserts multiple rows into nutrition_logs table
   * - Updates todaysLogs state via fetchLogData
   * - Clears scheduledMeal state (hides button)
   * - Shows alert on error
   * 
   * @performance Bulk insert operation, scales with meal_foods count
   */
  const handleAddMealPlanToLog = async () => {
    if (!user || !scheduledMeal) return;
    
    setIsAddingMealPlan(true);
    try {
      // Fetch all user_meal_foods for this meal
      const { data: mealFoods, error: mealFoodsError } = await supabase
        .from('user_meal_foods')
        .select('food_id, quantity')
        .eq('user_meal_id', scheduledMeal.mealId);

      if (mealFoodsError) {
        console.error('Error fetching meal foods:', mealFoodsError);
        alert(`Error fetching meal foods: ${mealFoodsError.message}`);
        return;
      }

      if (!mealFoods || mealFoods.length === 0) {
        alert('This meal has no foods assigned.');
        return;
      }

      // Prepare bulk insert data
      // **TIMEZONE FIX**: Use local date, not UTC
      const today = new Date();
      const logDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const nutritionLogs = mealFoods.map(mealFood => ({
        user_id: user.id,
        food_id: mealFood.food_id,
        meal_type: activeMeal,
        quantity_consumed: mealFood.quantity * (scheduledMeal.servings || 1),
        log_date: logDate
      }));

      // Bulk insert all nutrition logs
      const { error: insertError } = await supabase
        .from('nutrition_logs')
        .insert(nutritionLogs);

      if (insertError) {
        console.error('Error logging meal plan:', insertError);
        alert(`Error logging meal plan: ${insertError.message}`);
        return;
      }

      // Refresh data to show new logs
      await fetchLogData(user.id);
      setScheduledMeal(null); // Hide button after adding
    } catch (error) {
      console.error('Unexpected error adding meal plan:', error);
      alert(`Error adding meal plan: ${error.message}`);
    } finally {
      setIsAddingMealPlan(false);
    }
  };

  const handleLogWater = async (ounces) => {
    if (!user) return;
    
    // **TIMEZONE FIX**: Use local date, not UTC
    const today = new Date();
    const logDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const { error } = await supabase.from('nutrition_logs').insert({
      user_id: user.id,
      meal_type: 'water', // Use lowercase to match schema constraint
      water_oz_consumed: ounces,
      log_date: logDate
    });
    if (error) {
      alert(`Error logging water: ${error.message}`);
    } else {
      await fetchLogData(user.id);
    }
  };

  /**
   * Delete a nutrition log entry from the database
   * 
   * @description Removes a single food or water entry from nutrition_logs.
   * No confirmation dialog (removed for better UX). Includes security check
   * to ensure user can only delete their own entries.
   * 
   * @param {string} logId - UUID of the nutrition_logs entry to delete
   * 
   * @returns {Promise<void>} Resolves after deletion and data refresh
   * 
   * @sideEffects
   * - Deletes row from nutrition_logs table
   * - Calls fetchLogData to refresh UI after deletion
   * - Shows alert on error
   * 
   * @security User ID verification prevents users from deleting other users' logs
   * 
   * @example
   * // Called from delete button click
   * handleDeleteFoodLog('550e8400-e29b-41d4-a716-446655440000');
   * // Result: Log entry deleted, page refreshes to show updated totals
   */
  const handleDeleteFoodLog = async (logId) => {
    if (!user || !logId) return;

    const { error } = await supabase
      .from('nutrition_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', user.id); // Extra security check

    if (error) {
      console.error('Error deleting food log:', error);
      alert(`Error deleting food entry: ${error.message}`);
    } else {
      await fetchLogData(user.id); // Refresh the data
    }
  };

  // Cleanup debounce timer and abort controller on unmount
  // NOTE: This cleanup effect must be declared before any early returns
  // (for example `if (loading) return ...`). React hooks must be called
  // in the same order on every render — moving this effect above the
  // early return ensures the component's hook call order remains stable
  // and avoids the "change in the order of Hooks" runtime error.
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
      if (searchAbortControllerRef.current) {
        try { searchAbortControllerRef.current.abort(); } catch { /* ignore */ }
        searchAbortControllerRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading Nutrition Log...</div>;
  }

  return (
    <div className="nutrition-log-page-container">
      <SubPageHeader title="Log" icon={<Apple size={28} />} iconColor="#f97316" backTo="/nutrition" />

      <div className="meal-tabs">
        {['breakfast', 'lunch', 'dinner', 'snack1'].map(meal => (
          <button 
            key={meal} 
            className={activeMeal === meal ? 'active' : ''} 
            onClick={() => setActiveMeal(meal)}
          >
            {formatMealType(meal)}
          </button>
        ))}
      </div>

      {scheduledMeal && (
        <div className="meal-plan-add-section">
          <button 
            className="add-meal-plan-btn" 
            onClick={handleAddMealPlanToLog}
            disabled={isAddingMealPlan || !user}
          >
            {isAddingMealPlan ? 'Adding...' : `➕ Add "${scheduledMeal.mealName}"`}
          </button>
        </div>
      )}

      <div className="search-bar-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder="Search for a food..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={!user}
        />
        <button className="camera-btn"><Camera size={20} /></button>
        {(isSearching || searchResults.length > 0) && (
          <div className="food-search-results">
            {isSearching && <div className="search-loading"><Loader2 className="animate-spin" /></div>}
            {!isSearching && searchResults.map((food, index) => (
              <div key={`${food.food_id}-${food.serving_id}-${index}`} className="food-search-item" onClick={() => openLogModal(food)}>
                <span>{food.name}</span>
                <span className="search-item-serving">{food.serving_description}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="water-log-card">
        <div className="water-log-header">
          <Droplets size={20} />
          <h3>Water Intake</h3>
          <span>{dailyTotals.water} / {goals.daily_water_goal_oz || 128} oz</span>
        </div>
        <div className="water-log-actions">
          <button onClick={() => handleLogWater(8)} disabled={!user}>+ 8 oz</button>
          <button onClick={() => handleLogWater(12)} disabled={!user}>+ 12 oz</button>
          <button onClick={() => handleLogWater(16)} disabled={!user}>+ 16 oz</button>
        </div>
      </div>

      <div className="logged-items-list">
        {!user && <p className="no-items-message">Please log in to see your nutrition log.</p>}
        {user && !loading && mealLogs.length === 0 && (
          <p className="no-items-message">No items logged for {activeMeal} yet.</p>
        )}
        {user && !loading && mealLogs.map(log => (
          log.food_servings ? (
            <div key={log.id} className="food-item-card">
              <div className="food-item-details">
                <h4>{log.food_servings.food_name}</h4>
                <span>{log.quantity_consumed} x {log.food_servings.serving_description}</span>
              </div>
              <div className="food-item-actions">
                <span className="food-item-calories">
                  {Math.round(log.calories || 0)} cal
                </span>
                <button
                  className="delete-food-btn"
                  onClick={() => handleDeleteFoodLog(log.id)}
                  title="Delete this food entry"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ) : null
        ))}
      </div>

      <div className="calorie-status-footer">
        <div className="calorie-info">
          <span>{dailyTotals.calories} / {goals.daily_calorie_goal || 2000} cal</span>
          <span>{Math.max(0, Math.round(goals.daily_calorie_goal || 2000) - dailyTotals.calories)} left</span>
        </div>
        <div className="calorie-progress-bar-wrapper">
          <div className="calorie-progress-bar" style={{ width: `${calorieProgress > 100 ? 100 : calorieProgress}%` }}></div>
        </div>
      </div>

      <Modal
        isOpen={isLogModalOpen}
        onRequestClose={closeLogModal}
        contentLabel="Log Food Item"
        overlayClassName="custom-modal-overlay"
        className="custom-modal-content log-food-modal"
      >
        {selectedFood && (
          <div className="log-food-modal">
            <div className="modal-header">
              <h3>{selectedFood.name}</h3>
              <button onClick={closeLogModal} className="close-modal-btn"><X size={24} /></button>
            </div>
            <div className="modal-body">
              <p>Serving: {selectedFood.serving_description} ({Math.round(selectedFood.calories)} cal)</p>
              <div className="quantity-input">
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  inputMode="decimal"
                  step="0.25"
                  min="0.01"
                  max="999"
                  value={quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string or valid decimal numbers (e.g., 0.5, 1.5, 2)
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setQuantity(value);
                    }
                  }}
                  placeholder="1"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="log-food-btn" onClick={handleLogFood}>
                Add to {formatMealType(activeMeal)}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default NutritionLogPage;

