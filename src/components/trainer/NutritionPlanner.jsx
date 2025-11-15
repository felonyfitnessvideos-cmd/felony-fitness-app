/**
 * @file NutritionPlanner.jsx
 * @description Nutrition planner component for trainers to create client meal plans
 * @project Felony Fitness
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { Save, X, Search, Apple, AlertCircle, CheckCircle } from 'lucide-react';
import './NutritionPlanner.css';

/**
 * NutritionPlanner Component
 * 
 * Allows trainers to build custom meal plans for clients using food search
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.client - Selected client object
 * @returns {JSX.Element} Nutrition planner interface
 */
const NutritionPlanner = ({ client }) => {
  const [mealFoods, setMealFoods] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mealName, setMealName] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Food search state
  const [foodSearch, setFoodSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = useRef(null);
  const searchAbortControllerRef = useRef(null);

  /**
   * Reset state when client changes to prevent carryover
   */
  useEffect(() => {
    setMealFoods([]);
    setMealName('');
    setShowSaveModal(false);
    setErrorMessage('');
    setSuccessMessage('');
  }, [client?.id]);

  /**
   * Auto-dismiss success/error messages after 5 seconds
   */
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  /**
   * Search for foods using food-search-v2 edge function
   */
  const searchFoods = useCallback((searchTerm) => {
    // Clear existing timeout
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      if (searchAbortControllerRef.current) {
        try { searchAbortControllerRef.current.abort(); } catch (_err) { void _err; }
      }
      const controller = new AbortController();
      searchAbortControllerRef.current = controller;

      setIsSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke('food-search-v2', {
          body: { query: searchTerm },
          signal: controller.signal,
        });

        if (error) throw error;
        if (controller.signal.aborted) return;

        let standardizedResults = [];
        if (data?.source === 'local') {
          standardizedResults = (data.results || []).map(serving => ({
            id: serving.id,
            food_name: serving.food_name,
            serving_size: serving.serving_size,
            calories: serving.calories || 0,
            protein: serving.protein_g || serving.protein || 0,
            carbs: serving.carbs_g || serving.carbs || 0,
            fat: serving.fat_g || serving.fat || 0,
            is_external: false,
            food_id: serving.food_id
          }));
        } else if (data?.source === 'external') {
          standardizedResults = (data.results || []).map((item, index) => ({
            id: `ext_${Date.now()}_${index}`,
            food_name: item.name,
            serving_size: item.serving_size,
            calories: item.calories || 0,
            protein: item.protein_g || 0,
            carbs: item.carbs_g || 0,
            fat: item.fat_g || 0,
            is_external: true
          }));
        }

        setSearchResults(standardizedResults);
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.error('Error searching foods:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 300); // 300ms debounce
  }, []);

  /**
   * Handle search input change
   */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFoodSearch(value);
    searchFoods(value);
  };

  /**
   * Handle food selection from search
   */
  const handleFoodSelect = (food) => {
    const newFood = {
      id: food.id || food.food_id,
      name: food.food_name,
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      serving_size: food.serving_size || '1 serving',
      quantity: 1,
      is_external: food.is_external || false,
      food_id: food.food_id
    };
    
    setMealFoods([...mealFoods, newFood]);
    
    // Clear search after adding
    setFoodSearch('');
    setSearchResults([]);
  };

  /**
   * Remove food from meal
   */
  const handleRemoveFood = (index) => {
    const updatedMeal = mealFoods.filter((_, i) => i !== index);
    setMealFoods(updatedMeal);
  };

  /**
   * Update food quantity with validation
   */
  const handleUpdateQuantity = (index, quantity) => {
    const numQuantity = parseFloat(quantity);
    // Validate: must be positive number, max 999 servings
    if (isNaN(numQuantity) || numQuantity < 0.1 || numQuantity > 999) {
      return;
    }
    const updatedMeal = mealFoods.map((food, i) =>
      i === index ? { ...food, quantity: numQuantity } : food
    );
    setMealFoods(updatedMeal);
  };

  /**
   * Sanitize meal name input
   */
  const sanitizeMealName = (name) => {
    // Remove HTML tags, limit length to 100 chars
    return name.replace(/<[^>]*>/g, '').slice(0, 100).trim();
  };

  /**
   * Calculate total macros
   */
  const calculateTotals = () => {
    return mealFoods.reduce(
      (totals, food) => ({
        calories: totals.calories + (food.calories * food.quantity),
        protein: totals.protein + (food.protein * food.quantity),
        carbs: totals.carbs + (food.carbs * food.quantity),
        fat: totals.fat + (food.fat * food.quantity)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  /**
   * Save meal to client's meals
   * Handles both local and external foods with find-or-create pattern
   */
  const handleSaveMeal = async () => {
    const sanitizedName = sanitizeMealName(mealName);
    if (!sanitizedName || mealFoods.length === 0) {
      setErrorMessage('Please provide a meal name and add at least one food.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Validate client ID (authorization check)
      if (!client?.id) {
        throw new Error('Invalid client selected');
      }
      
      // Handle external foods with find-or-create pattern to prevent duplication
      const foodsWithIds = await Promise.all(
        mealFoods.map(async (food) => {
          // If it's an external food, try to find existing or create new
          if (food.is_external) {
            // First, try to find existing food with same name and macros
            const { data: existingFoods } = await supabase
              .from('food_servings')
              .select('id')
              .eq('food_name', food.name)
              .eq('calories', food.calories)
              .eq('protein_g', food.protein)
              .eq('carbs_g', food.carbs)
              .eq('fat_g', food.fat)
              .eq('source', 'external_api')
              .limit(1);
            
            // If found, use existing
            if (existingFoods && existingFoods.length > 0) {
              return {
                ...food,
                id: existingFoods[0].id
              };
            }
            
            // If not found, create new
            const { data: newServing, error: servingError } = await supabase
              .from('food_servings')
              .insert({
                food_name: food.name,
                serving_description: food.serving_size,
                calories: food.calories,
                protein_g: food.protein,
                carbs_g: food.carbs,
                fat_g: food.fat,
                source: 'external_api',
                is_verified: false
              })
              .select()
              .single();

            if (servingError) throw servingError;
            
            return {
              ...food,
              id: newServing.id
            };
          }
          
          // Local food already has valid UUID
          return food;
        })
      );

      // Insert meal into user_meals table
      const { data: mealData, error: mealError } = await supabase
        .from('user_meals')
        .insert({
          user_id: client.id,
          name: sanitizedName,
          category: 'trainer_created'
        })
        .select()
        .single();

      if (mealError) throw mealError;

      // Insert meal foods into user_meal_foods with real UUIDs
      const mealFoodInserts = foodsWithIds.map(food => ({
        user_meal_id: mealData.id,
        food_servings_id: food.id,
        quantity: food.quantity,
        notes: `${food.name} - ${food.serving_size}`
      }));

      const { error: foodsError } = await supabase
        .from('user_meal_foods')
        .insert(mealFoodInserts);

      if (foodsError) throw foodsError;
      
      // Reset form
      setMealFoods([]);
      setMealName('');
      setShowSaveModal(false);
      
      // Show success message
      setSuccessMessage(`Meal "${mealData.name}" added successfully to ${client.first_name || 'client'}'s meals!`);
    } catch (error) {
      // Show user-friendly error without exposing internals
      setErrorMessage(
        error.message === 'Invalid client selected'
          ? 'Please select a valid client'
          : 'Failed to save meal. Please try again or contact support if the issue persists.'
      );
      // Log full error for debugging (not in production)
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving meal:', error);
      }
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();

  if (!client) {
    return (
      <div className="nutrition-planner-empty">
        <Apple size={48} />
        <p>Select a client to create a meal plan</p>
      </div>
    );
  }

  return (
    <div className="nutrition-planner-container">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="notification-banner success">
          <CheckCircle size={18} />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="close-notification">
            <X size={16} />
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="notification-banner error">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="close-notification">
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Left Panel: Meal Being Built */}
      <div className="planner-left-panel">
        <div className="meal-builder">
          <h3><Apple size={18} /> Meal Foods ({mealFoods.length})</h3>
          
          <div className="meal-foods-scroll-container">
            <div className="meal-foods-list">
              {mealFoods.length === 0 ? (
                <p className="empty-meal">Add foods from the search on the right →</p>
              ) : (
                mealFoods.map((food, index) => (
                  <div key={index} className="meal-food-card">
                    <div className="food-details">
                      <div className="food-name-row">
                        <span className="food-name">{food.name}</span>
                        <button 
                          onClick={() => handleRemoveFood(index)}
                          className="remove-food-btn"
                          aria-label="Remove food"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="food-quantity-row">
                        <input
                          type="number"
                          min="0.1"
                          max="999"
                          step="0.1"
                          value={food.quantity}
                          onChange={(e) => handleUpdateQuantity(index, e.target.value)}
                          className="quantity-input"
                        />
                        <span className="food-serving">x {food.serving_size}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Macro Totals */}
          <div className="macro-totals">
            <h4>Total Macros</h4>
            <div className="totals-grid">
              <div className="total-item">
                <span className="total-label">Calories</span>
                <span className="total-value">{Math.round(totals.calories)}</span>
              </div>
              <div className="total-item">
                <span className="total-label">Protein</span>
                <span className="total-value">{Math.round(totals.protein)}g</span>
              </div>
              <div className="total-item">
                <span className="total-label">Carbs</span>
                <span className="total-value">{Math.round(totals.carbs)}g</span>
              </div>
              <div className="total-item">
                <span className="total-label">Fats</span>
                <span className="total-value">{Math.round(totals.fat)}g</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowSaveModal(true)}
            className="save-meal-btn"
            disabled={mealFoods.length === 0}
          >
            <Save size={18} />
            Add to Client's Meals
          </button>
        </div>
      </div>

      {/* Right Panel: Food Search */}
      <div className="planner-right-panel">
        <h3><Search size={18} /> Food Search</h3>
        
        <div className="food-search-input">
          <Search size={16} />
          <input
            type="text"
            value={foodSearch}
            onChange={handleSearchChange}
            placeholder="Search for foods..."
            className="search-input"
          />
        </div>

        <div className="search-results-container">
          {isSearching && (
            <div className="search-loading">Searching...</div>
          )}
          
          {!isSearching && searchResults.length === 0 && foodSearch && (
            <div className="no-results">No foods found</div>
          )}
          
          {!isSearching && searchResults.length === 0 && !foodSearch && (
            <div className="search-prompt">Type to search for foods</div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="search-results-list">
              {searchResults.map((food, index) => (
                <div key={index} className="food-result-card">
                  <div className="food-result-info">
                    <h4>{food.food_name}</h4>
                    <span className="serving-info">{food.serving_size}</span>
                    <div className="food-macros">
                      <span>{Math.round(food.calories)} cal</span>
                      <span>P: {Math.round(food.protein)}g</span>
                      <span>C: {Math.round(food.carbs)}g</span>
                      <span>F: {Math.round(food.fat)}g</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFoodSelect(food)}
                    className="add-food-btn"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Meal Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Save Meal</h3>
            <p>Enter a name for this meal:</p>
            <input 
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="e.g., High Protein Breakfast, Post-Workout Meal..."
              autoFocus
              maxLength={100}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveMeal()}
            />
            <div className="modal-actions">
              <button 
                onClick={() => setShowSaveModal(false)}
                className="cancel-btn"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveMeal}
                className="save-btn"
                disabled={saving || !mealName.trim()}
              >
                {saving ? 'Saving...' : 'Save Meal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionPlanner;
