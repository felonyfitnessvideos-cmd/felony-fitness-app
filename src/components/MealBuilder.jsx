import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Search, X, Save, ChefHat } from 'lucide-react';
import './MealBuilder.css';

/**
 * MealBuilder component for creating and editing meals with nutrition tracking
 * 
 * This component provides a comprehensive interface for meal creation including:
 * - Real-time nutrition calculation as foods are added
 * - Food search and ingredient management
 * - Meal metadata (name, category, prep time, etc.)
 * - Save/update functionality with Supabase integration
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback function when modal is closed
 * @param {Function} props.onSave - Callback function when meal is saved successfully
 * @param {Object|null} props.editingMeal - Existing meal data for editing mode (null for new meal)
 * @param {string[]} props.categories - Available meal categories for selection
 * @returns {JSX.Element|null} Modal component for meal building or null if not open
 * 
 * @example
 * <MealBuilder
 *   isOpen={showBuilder}
 *   onClose={() => setShowBuilder(false)}
 *   onSave={(meal) => handleMealSaved(meal)}
 *   editingMeal={selectedMeal}
 *   categories={['breakfast', 'lunch', 'dinner', 'snack']}
 * />
 */
const MealBuilder = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingMeal = null,
  categories = ['breakfast', 'lunch', 'dinner', 'snack'] 
}) => {
  /** @type {[Object, Function]} State for meal metadata and details */
  const [mealData, setMealData] = useState({
    name: '',
    category: 'breakfast',
    tags: []
  });

  /** @type {[Array, Function]} State for selected meal ingredients with quantities */
  const [mealFoods, setMealFoods] = useState([]);
  
  /** @type {[string, Function]} State for food search query */
  const [foodSearch, setFoodSearch] = useState('');
  
  /** @type {[Array, Function]} State for food search results from database */
  const [searchResults, setSearchResults] = useState([]);
  
  /** @type {[boolean, Function]} State for food search loading indicator */
  const [isSearching, setIsSearching] = useState(false);
  
  /** @type {React.MutableRefObject} Reference for search debounce timeout */
  const searchDebounceRef = useRef(null);
  
  /** @type {React.MutableRefObject} Reference for search abort controller */
  const searchAbortControllerRef = useRef(null);
  
  /** @type {[Object, Function]} State for calculated nutrition totals */
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0
  });
  
  /** @type {[boolean, Function]} State for meal save operation loading */
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Initialize component state when editing meal changes or modal opens
   * Loads existing meal data for editing mode or resets form for new meal
   */
  useEffect(() => {
    if (editingMeal) {
      setMealData({
        name: editingMeal.name || '',
        category: editingMeal.category || 'breakfast',
        tags: editingMeal.tags || []
      });
      
      // Load existing meal foods if editing
      if (editingMeal.id) {
        loadMealFoods(editingMeal.id);
      }
    } else {
      // Reset form for new meal
      setMealData({
        name: '',
        category: 'breakfast',
        tags: []
      });
      setMealFoods([]);
    }
  }, [editingMeal, isOpen]);

  /**
   * Calculate total nutrition values for all foods in the meal
   * Updates nutrition state with calculated totals based on food quantities
   * 
   * @returns {void}
   */
  const calculateNutrition = useCallback(() => {
    const totals = mealFoods.reduce((acc, item) => {
      const food = item.food_servings;
      const quantity = item.quantity || 0;
      
      return {
        calories: acc.calories + (food.calories * quantity || 0),
        protein: acc.protein + (food.protein * quantity || 0),
        carbs: acc.carbs + (food.carbs * quantity || 0),
        fat: acc.fat + (food.fat * quantity || 0),
        fiber: acc.fiber + (food.fiber * quantity || 0),
        sugar: acc.sugar + (food.sugar * quantity || 0)
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    });

    setNutrition(totals);
  }, [mealFoods]);

  /**
   * Recalculate nutrition totals whenever meal foods are modified
   */
  useEffect(() => {
    calculateNutrition();
  }, [calculateNutrition]);

  // Cleanup search timers and controllers on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      if (searchAbortControllerRef.current) {
        try { searchAbortControllerRef.current.abort(); } catch { /* ignore */ }
        searchAbortControllerRef.current = null;
      }
    };
  }, []);

  /**
   * Load existing meal foods from database for editing mode
   * 
   * @async
   * @param {number} mealId - ID of the meal to load foods for
   * @returns {Promise<void>}
   */
  const loadMealFoods = async (mealId) => {
    try {
      const { data, error } = await supabase
        .from('meal_foods')
        .select(`
          *,
          food_servings (
            id,
            food_name,
            calories,
            protein,
            carbs,
            fat,
            fiber,
            sugar,
            serving_size,
            serving_unit,
            serving_description
          )
        `)
        .eq('meal_id', mealId);

      if (error) throw error;
      
      setMealFoods(data.map(item => ({
        id: item.id,
        food_servings_id: item.food_servings_id,
        quantity: item.quantity,
        notes: item.notes,
        food_servings: item.food_servings
      })));
    } catch (error) {
      console.error('Error loading meal foods:', error);
    }
  };

  /**
   * Search for foods using the same comprehensive search as NutritionLogPage
   * Uses food-search function for both database and OpenAI API results with debouncing
   * 
   * @param {string} searchTerm - Search query to match against food names
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
        try { searchAbortControllerRef.current.abort(); } catch (_err) { void _err; /* ignore */ }
      }
      const controller = new AbortController();
      searchAbortControllerRef.current = controller;

      setIsSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke('food-search', {
          body: { query: searchTerm },
          signal: controller.signal,
        });
        
        if (error) throw error;
        if (controller.signal.aborted) return;

        let standardizedResults = [];
        if (data?.source === 'local') {
          // Database results - convert to consistent format
          standardizedResults = (data.results || []).flatMap(food => 
            (food.food_servings || []).map(serving => ({
              id: serving.id,
              food_name: food.name,
              serving_size: serving.serving_size,
              serving_unit: serving.serving_unit,
              calories: serving.calories,
              protein: serving.protein_g,
              carbs: serving.carbs_g,
              fat: serving.fat_g,
              fiber: serving.fiber_g,
              sugar: serving.sugar_g,
              is_external: false,
              food_id: food.id,
              serving_id: serving.id,
              serving_description: serving.serving_description
            }))
          );
        } else if (data?.source === 'external') {
          // OpenAI API results - already in correct format
          standardizedResults = (data.results || []).map(item => ({
            ...item,
            is_external: true,
            food_name: item.name,
            // Map external format to internal format
            id: item.serving_id || item.id,
            protein: item.protein_g,
            carbs: item.carbs_g,
            fat: item.fat_g,
            fiber: item.fiber_g,
            sugar: item.sugar_g
          }));
        }
        
        setSearchResults(standardizedResults);
      } catch (error) {
        if (error?.name === 'AbortError') {
          // ignore
        } else {
          console.error('Error searching foods:', error);
        }
      } finally {
        setIsSearching(false);
        searchAbortControllerRef.current = null;
      }
    }, 300);
  }, []);

  /**
   * Add a food item to the meal or increase quantity if already present
   * Handles both database and external API food results
   * 
   * @param {Object} food - Food item from search results
   * @param {number} food.id - Unique food serving ID
   * @param {string} food.food_name - Name of the food
   * @param {number} food.calories - Calories per serving
   */
  const addFoodToMeal = (food) => {
    const servingId = food.serving_id || food.id;
    const existingIndex = mealFoods.findIndex(item => item.food_servings_id === servingId);
    
    if (existingIndex >= 0) {
      // Increase quantity if food already exists
      const updated = [...mealFoods];
      updated[existingIndex].quantity += 1;
      setMealFoods(updated);
    } else {
      // Convert search result to meal food format
      const foodServingData = {
        id: servingId,
        food_name: food.food_name || food.name,
        serving_size: food.serving_size || 1,
        serving_unit: food.serving_unit || 'serving',
        serving_description: food.serving_description || `${food.serving_size || 1} ${food.serving_unit || 'serving'}`,
        calories: food.calories || 0,
        protein: food.protein || food.protein_g || 0,
        carbs: food.carbs || food.carbs_g || 0,
        fat: food.fat || food.fat_g || 0,
        fiber: food.fiber || food.fiber_g || 0,
        sugar: food.sugar || food.sugar_g || 0
      };
      
      // Add new food
      setMealFoods([...mealFoods, {
        id: null, // New item, no ID yet
        food_servings_id: servingId,
        quantity: 1,
        notes: '',
        food_servings: foodServingData
      }]);
    }
    
    setFoodSearch('');
    setSearchResults([]);
  };

  /**
   * Update the quantity of a food item in the meal
   * Removes item if quantity is set to 0 or negative
   * 
   * @param {number} index - Index of food item in mealFoods array
   * @param {number|string} quantity - New quantity value
   */
  const updateFoodQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeFoodFromMeal(index);
      return;
    }
    
    const updated = [...mealFoods];
    updated[index].quantity = parseFloat(quantity) || 0;
    setMealFoods(updated);
  };

  /**
   * Remove a food item from the meal
   * 
   * @param {number} index - Index of food item to remove from mealFoods array
   */
  const removeFoodFromMeal = (index) => {
    setMealFoods(mealFoods.filter((_, i) => i !== index));
  };



  /**
   * Save the meal to the database (create new or update existing)
   * Validates required fields and handles meal and meal_foods table operations
   * 
   * @async
   * @returns {Promise<void>}
   */
  const handleSaveMeal = async () => {
    if (!mealData.name.trim()) {
      alert('Please enter a meal name');
      return;
    }

    if (mealFoods.length === 0) {
      alert('Please add at least one food item to the meal');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Save or update meal
      let mealId;
      if (editingMeal?.id) {
        // Update existing meal
        const { error: mealError } = await supabase
          .from('meals')
          .update({
            ...mealData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMeal.id);

        if (mealError) throw mealError;
        mealId = editingMeal.id;

        // Delete existing meal foods
        const { error: deleteError } = await supabase
          .from('meal_foods')
          .delete()
          .eq('meal_id', mealId);

        if (deleteError) throw deleteError;
      } else {
        // Create new meal
        const { data: mealResult, error: mealError } = await supabase
          .from('meals')
          .insert([{
            ...mealData,
            user_id: user.id,
            is_premade: false
          }])
          .select()
          .single();

        if (mealError) throw mealError;
        mealId = mealResult.id;
      }

      // Insert meal foods
      const mealFoodsData = mealFoods.map(item => ({
        meal_id: mealId,
        food_servings_id: item.food_servings_id,
        quantity: item.quantity,
        notes: item.notes
      }));

      const { error: foodsError } = await supabase
        .from('meal_foods')
        .insert(mealFoodsData);

      if (foodsError) throw foodsError;

      // Call onSave callback
      if (onSave) {
        onSave({
          id: mealId,
          ...mealData,
          nutrition,
          foods: mealFoods
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Error saving meal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="meal-builder-overlay">
      <div className="meal-builder-modal">
        <div className="meal-builder-header">
          <h2>
            <ChefHat className="icon" />
            {editingMeal ? 'Edit Meal' : 'Create New Meal'}
          </h2>
          <button onClick={onClose} className="close-btn">
            <X className="icon" />
          </button>
        </div>

        <div className="meal-builder-content">
          {/* Meal Details Section */}
          <div className="meal-details-section">
            <h3>Meal Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Meal Name *</label>
                <input
                  type="text"
                  value={mealData.name}
                  onChange={(e) => setMealData({...mealData, name: e.target.value})}
                  placeholder="Enter meal name"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={mealData.category}
                  onChange={(e) => setMealData({...mealData, category: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Food Search and List Section */}
          <div className="meal-foods-section">
            <h3>Foods</h3>
            
            {/* Food Search */}
            <div className="food-search">
              <div className="search-input-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search for foods to add..."
                  value={foodSearch}
                  onChange={(e) => {
                    setFoodSearch(e.target.value);
                    searchFoods(e.target.value);
                  }}
                />
              </div>
              
              {/* Search Results */}
              {isSearching && (
                <div className="search-loading">
                  <div className="loading-spinner">Searching foods...</div>
                </div>
              )}
              
              {!isSearching && searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map(food => (
                    <div
                      key={food.id}
                      className="search-result-item"
                      onClick={() => addFoodToMeal(food)}
                    >
                      <div className="food-info">
                        <span className="food-name">{food.food_name}</span>
                        <span className="food-serving">
                          {food.serving_description} - {food.calories} cal
                        </span>
                      </div>
                      <Plus className="add-icon" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Foods List */}
            <div className="selected-foods">
              {mealFoods.map((item, index) => (
                <div key={`${item.food_servings_id}-${index}`} className="food-item">
                  <div className="food-display">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={item.quantity}
                      onChange={(e) => updateFoodQuantity(index, e.target.value)}
                      className="quantity-input-inline"
                    />
                    {/* Show serving description and food name in natural format */}
                    {item.food_servings.serving_description?.replace(/^\d+(\.\d+)?\s*/, '') || `${item.food_servings.serving_unit} ${item.food_servings.food_name}`}
                  </div>
                  <button
                    onClick={() => removeFoodFromMeal(index)}
                    className="remove-btn"
                  >
                    <X className="icon" />
                  </button>
                </div>
              ))}
              
              {mealFoods.length === 0 && (
                <div className="no-foods">
                  <p>No foods added yet. Search and add foods above.</p>
                </div>
              )}
            </div>
          </div>

          {/* Nutrition Summary */}
          <div className="nutrition-summary">
            <h3>Nutrition Per Meal</h3>
            <div className="nutrition-grid">
              <div className="nutrition-item">
                <div className="nutrition-value">{Math.round(nutrition.calories)}</div>
                <div className="nutrition-label">Calories</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-value">{Math.round(nutrition.protein)}g</div>
                <div className="nutrition-label">Protein</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-value">{Math.round(nutrition.carbs)}g</div>
                <div className="nutrition-label">Carbs</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-value">{Math.round(nutrition.fat)}g</div>
                <div className="nutrition-label">Fat</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-value">{Math.round(nutrition.fiber)}g</div>
                <div className="nutrition-label">Fiber</div>
              </div>
              <div className="nutrition-item">
                <div className="nutrition-value">{Math.round(nutrition.sugar)}g</div>
                <div className="nutrition-label">Sugar</div>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="meal-builder-actions">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button 
            onClick={handleSaveMeal} 
            className="save-btn"
            disabled={isSaving || !mealData.name.trim() || mealFoods.length === 0}
          >
            <Save className="icon" />
            {isSaving ? 'Saving...' : (editingMeal ? 'Update Meal' : 'Save Meal')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealBuilder;