import { ChefHat, Plus, Save, Search, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { supabase } from '../supabaseClient';
import './MealBuilder.css';

// Set the app element for react-modal to prevent accessibility issues
Modal.setAppElement('#root');

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
  isPremade = false,
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
    fat: 0
  });

  /** @type {[boolean, Function]} State for meal save operation loading */
  const [isSaving, setIsSaving] = useState(false);

  /** @type {[boolean, Function]} State for food selection modal */
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);

  /** @type {[Object|null, Function]} State for selected food in modal */
  const [selectedFood, setSelectedFood] = useState(null);

  /** @type {[string, Function]} State for food quantity input */
  const [foodQuantity, setFoodQuantity] = useState('1');

  /**
   * Initialize component state when editing meal changes or modal opens
   * Loads existing meal data for editing mode or resets form for new meal
   */
  useEffect(() => {
    if (isOpen && editingMeal) {
      setMealData({
        name: editingMeal.custom_name || editingMeal.name || '',
        category: editingMeal.category || 'breakfast',
        tags: editingMeal.tags || [],
      });

      // Use the `user_meal_foods` array passed directly in the `editingMeal` prop.
      // This is more efficient as it avoids a redundant network request.
      const initialFoods = (isPremade ? editingMeal.meal_foods : editingMeal.user_meal_foods || []).map(item => ({
        ...item,
        // Defensively ensure the nested `foods` object exists. If it's null
        // (e.g., due to a broken foreign key), substitute a placeholder to
        // prevent the component from crashing on render.
        foods: item.foods || { name: 'Unknown/Deleted Food', calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
      }));
      setMealFoods(initialFoods);

    } else {
      // Reset form for a new meal.
      setMealData({
        name: '',
        category: 'breakfast',
        tags: [],
      });
      setMealFoods([]);
    }
  }, [editingMeal, isOpen, isPremade]);

  /**
   * Calculate total nutrition values for all foods in the meal
   * Updates nutrition state with calculated totals based on food quantities
   * 
   * @returns {void}
   */
  const calculateNutrition = useCallback(() => {
    const totals = mealFoods.reduce((acc, item) => {
      const food = item.foods;
      const quantity = item.quantity || 0;

      // Ensure food object exists before trying to access its properties
      if (!food) {
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

  // The `loadMealFoods` function is no longer needed because the meal data,
  // including its foods, is now passed directly via the `editingMeal` prop.

  /**
   * Search for foods using comprehensive database and external API search
   * 
   * Implements debounced search with abort controller for performance and uses the food-search
   * Supabase Edge Function to query both local database and external food APIs (OpenAI/FatSecret).
   * Results are standardized to a consistent format regardless of source.
   * 
   * @param {string} searchTerm - Search query to match against food names (minimum 1 character)
   * @returns {void} Updates searchResults state with formatted food items
   * 
   * @description
   * Search flow:
   * 1. Debounce input for 300ms to avoid excessive API calls
   * 2. Query food-search Edge Function with search term
   * 3. Handle two possible response sources:
   *    - 'local': Database foods/food_servings join results
   *    - 'external': OpenAI API results (generates temporary IDs)
   * 4. Standardize all results to consistent field names
   * 5. Update searchResults state for display
   * 
   * @example
   * searchFoods('chicken breast'); // Searches for chicken breast foods
   * searchFoods(''); // Clears search results
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
        // Direct Supabase search - foods table with portions
        // Match format used in NutritionLogPage for consistency
        const sanitizedTerm = searchTerm.replace(/,/g, ' ').toLowerCase();
        const { data: results, error } = await supabase
          .from('foods')
          .select(`
            *,
            portions (*)
          `)
          .or(`name_simplified.ilike.%${sanitizedTerm}%,brand_owner.ilike.%${sanitizedTerm}%`)
          .order('commonness_score', { ascending: false })
          .order('name')
          .limit(50);

        if (error) throw error;
        if (controller.signal.aborted) return;

        // Format results for UI
        const standardizedResults = (results || []).map(food => {
          // Get default portion (first one or 100g equivalent)
          const defaultPortion = food.portions?.[0] || {
            gram_weight: 100,
            portion_description: '100g'
          };

          const portionGrams = defaultPortion.gram_weight || 100;
          const multiplier = portionGrams / 100;

          return {
            id: food.id,
            food_name: food.name,
            serving_size: portionGrams,
            serving_unit: 'g',
            calories: Math.round((food.calories || 0) * multiplier),
            protein: Math.round((food.protein_g || 0) * multiplier * 10) / 10,
            carbs: Math.round((food.carbs_g || 0) * multiplier * 10) / 10,
            fat: Math.round((food.fat_g || 0) * multiplier * 10) / 10,
            fiber: Math.round((food.fiber_g || 0) * multiplier * 10) / 10,
            sugar: Math.round((food.sugar_g || 0) * multiplier * 10) / 10,
            is_external: false,
            food_id: food.id,
            serving_id: food.id,
            serving_description: defaultPortion.portion_description || `${portionGrams}g`,
            portions: food.portions || [],
            brand: food.brand_owner || food.data_type || ''
          };
        });

        setSearchResults(standardizedResults);
      } catch (error) {
        if (error?.name === 'AbortError') {
          // ignore
        } else {
          // Error searching foods - silently handle
        }
      } finally {
        setIsSearching(false);
        searchAbortControllerRef.current = null;
      }
    }, 300);
  }, []);

  /**
   * Open modal to select quantity for a food item
   * @param {Object} food - Food item from search results
   */
  const openFoodModal = (food) => {
    setSelectedFood(food);
    setFoodQuantity('1');
    setIsFoodModalOpen(true);
  };

  /**
   * Close the food selection modal and reset state
   */
  const closeFoodModal = () => {
    setIsFoodModalOpen(false);
    setSelectedFood(null);
    setFoodQuantity('1');
    setFoodSearch('');
    setSearchResults([]);
  };

  /**
   * Add a food item to the meal or increase quantity if already present
   * Handles both database and external API food results
   * 
   * @param {Object} food - Food item from search results
   * @param {number} food.id - Unique food serving ID
   * @param {string} food.food_name - Name of the food
   * @param {number} food.calories - Calories per serving
   * @param {number} quantity - Quantity to add
   */
  const addFoodToMeal = (food, quantity = 1) => {
    
    const servingId = food.serving_id || food.id;

    if (!servingId) {
      console.error('[MealBuilder] Missing serving ID for food:', food);
      alert('Unable to add food - missing serving information');
      return;
    }


    const existingIndex = mealFoods.findIndex(item => item.food_id === servingId);

    if (existingIndex >= 0) {
      // Increase quantity if food already exists
      const updated = [...mealFoods];
      updated[existingIndex].quantity += quantity;
      setMealFoods(updated);
    } else {
      // Convert search result to meal food format
      const foodServingData = {
        id: servingId,
        food_name: food.food_name || food.name,
        serving_description: food.serving_description || `${food.serving_size || 1} ${food.serving_unit || 'serving'}`,
        calories: food.calories || 0,
        protein_g: food.protein_g || food.protein || 0,
        carbs_g: food.carbs_g || food.carbs || 0,
        fat_g: food.fat_g || food.fat || 0
      };


      // Add new food
      const newMealFood = {
        id: null, // New item, no ID yet
        food_id: servingId,
        quantity: quantity,
        notes: '',
        foods: foodServingData
      };
      setMealFoods(prev => [...prev, newMealFood]);
    }

    closeFoodModal();
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
   * 
   * Comprehensive meal saving operation that handles both meal creation and updates,
   * processes external foods from API results, and manages the meal_foods relationships.
   * Validates required fields before attempting database operations.
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} When user is not authenticated, validation fails, or database operations fail
   * 
   * @description
   * Save process:
   * 1. Validate meal name and food count
   * 2. Create or update meal record in meals table
   * 3. For external foods (from OpenAI API), create permanent database records:
   *    - Insert into foods table
   *    - Insert into food_servings table
   *    - Replace temporary string IDs with permanent integer IDs
   * 4. Insert/update meal_foods relationships
   * 5. Add meal to user_meals table for new meals (makes it appear in MyMealsPage)
   * 6. Call onSave callback to refresh parent component
   * 
   * @example
   * // Save a new meal with chicken breast and rice
   * await handleSaveMeal();
   */
  const handleSaveMeal = async () => {
    if (isPremade) {
      alert('You cannot edit a premade meal. Please duplicate the meal to make changes.');
      return;
    }
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

      // Save or update meal directly in user_meals (self-contained)
      let mealId;
      if (editingMeal?.id) {
        // Update existing meal in user_meals
        const { error: mealError } = await supabase
          .from('user_meals')
          .update({
            ...mealData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMeal.id);

        if (mealError) throw mealError;
        mealId = editingMeal.id;

        // DO NOT DELETE EXISTING FOODS YET - wait until new ones are ready
      } else {
        // Create new meal in user_meals
        const { data: mealResult, error: mealError } = await supabase
          .from('user_meals')
          .insert([{
            ...mealData,
            user_id: user.id,
            is_favorite: false
          }])
          .select()
          .single();

        if (mealError) throw mealError;
        mealId = mealResult.id;
      }

      // Process external foods first - save them to foods table to get real IDs
      const processedMealFoods = [];

      for (const item of mealFoods) {
        let finalFoodId = item.food_id;

        // Check if this is an external food (string ID starting with "ext_")
        if (typeof item.food_id === 'string' && item.food_id.startsWith('ext_')) {
          
          // Create foods record directly
          const foodToInsert = item.foods;
          const { data: foodData, error: foodError } = await supabase
            .from('foods')
            .insert([{
              name: foodToInsert.food_name || foodToInsert.name,
              brand_owner: foodToInsert.brand || null,
              category: foodToInsert.category || 'custom',
              data_source: 'USER_CUSTOM',
              calories: foodToInsert.calories || 0,
              protein_g: foodToInsert.protein_g || 0,
              carbs_g: foodToInsert.carbs_g || 0,
              fat_g: foodToInsert.fat_g || 0,
              fiber_g: foodToInsert.fiber_g || 0,
              sugar_g: foodToInsert.sugar_g || 0
            }])
            .select()
            .single();

          if (foodError) {
            console.error('[MealBuilder] Error creating food:', foodError);
            throw foodError;
          }

          // Create default portion (assume 100g)
          const { error: portionError } = await supabase
            .from('portions')
            .insert([{
              food_id: foodData.id,
              amount: 1,
              measure_unit: foodToInsert.serving_description || 'serving',
              gram_weight: 100,
              portion_description: foodToInsert.serving_description || '1 serving'
            }]);

          if (portionError) {
            console.error('[MealBuilder] Error creating portion:', portionError);
            // Continue anyway, we have the food
          }

          finalFoodId = foodData.id;
        }

        processedMealFoods.push({
          user_meal_id: mealId,
          food_id: finalFoodId, // Use new DB column name (migrated from food_servings_id)
          quantity: item.quantity,
          notes: item.notes || ''
        });
      }

      // CRITICAL: Only after ALL foods are processed successfully, delete old foods and insert new ones
      if (editingMeal?.id) {
        // Delete existing meal foods NOW that we know new ones are ready
        const { error: deleteError } = await supabase
          .from('user_meal_foods')  // Changed from meal_foods to user_meal_foods
          .delete()
          .eq('user_meal_id', mealId);  // Changed from meal_id to user_meal_id

        if (deleteError) {
          console.error('[MealBuilder] Error deleting old foods:', deleteError);
          throw deleteError;
        }
      }

      // Insert meal foods with proper integer IDs
      const { error: foodsError } = await supabase
        .from('user_meal_foods')  // Changed from meal_foods to user_meal_foods
        .insert(processedMealFoods);

      if (foodsError) {
        console.error('[MealBuilder] Error inserting meal foods:', foodsError);
        throw foodsError;
      }

      // No need to add to user_meals - we're already saving directly there!

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
    <>
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
                  onChange={(e) => setMealData({ ...mealData, name: e.target.value })}
                  placeholder="Enter meal name"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={mealData.category}
                  onChange={(e) => setMealData({ ...mealData, category: e.target.value })}
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
                  {searchResults.map((food, index) => (
                    <div
                      key={`${food.id || food.serving_id}-${index}-${food.food_name || food.name}`}
                      className="search-result-item"
                      onClick={() => openFoodModal(food)}
                    >
                      <div className="food-info">
                        <span className="food-name">{food.food_name || food.name}</span>
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
                  <div key={`${item.food_id || 'missing'}-${index}`} className="food-item">
                  <div className="food-display">
                    <input
                      type="number"
                      min="0.25"
                      step="0.25"
                      value={item.quantity}
                      onChange={(e) => updateFoodQuantity(index, e.target.value)}
                      className="quantity-input-inline"
                    />
                    {/* Show serving description with food name */}
                    {(() => {
                      // Get food from either foods or food_servings (backwards compatibility)
                      const food = item.foods || item.food_servings;
                      const foodName = food.food_name || food.name || 'Unknown Food';

                      // Get the serving description as-is (don't strip anything)
                      // The quantity field represents "how many servings"
                      const servingDesc = food.serving_description || '';
                      

                      // Build the display string: serving description + food name
                      // The quantity input shows how many of these servings
                      if (servingDesc) {
                        return foodName !== 'Unknown Food' ?
                          `${servingDesc} ${foodName}` :
                          servingDesc;
                      } else {
                        return foodName;
                      }
                    })()}
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

    {/* Food Selection Modal */}
    <Modal
      isOpen={isFoodModalOpen}
      onRequestClose={closeFoodModal}
      contentLabel="Select Food Quantity"
      overlayClassName="custom-modal-overlay"
      className="custom-modal-content"
    >
      {selectedFood && (
        <div className="log-food-modal">
          <div className="modal-header">
            <h3>{selectedFood.food_name || selectedFood.name}</h3>
            <button onClick={closeFoodModal} className="close-modal-btn">
              <X size={24} />
            </button>
          </div>
          <div className="modal-body">
            <p>
              Serving: {selectedFood.serving_description} ({Math.round(selectedFood.calories)} cal)
            </p>
            <div className="quantity-input">
              <label htmlFor="food-quantity">Quantity</label>
              <input
                id="food-quantity"
                type="number"
                inputMode="decimal"
                step="0.25"
                min="0.01"
                max="999"
                value={foodQuantity}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string or valid decimal numbers
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setFoodQuantity(value);
                  }
                }}
                placeholder="1"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              className="log-food-btn"
              onClick={() => {
                const qty = parseFloat(foodQuantity) || 1;
                if (qty > 0) {
                  addFoodToMeal(selectedFood, qty);
                } else {
                  console.warn('[MealBuilder] Invalid quantity:', qty);
                }
              }}
            >
              Add to Meal
            </button>
          </div>
        </div>
      )}
    </Modal>
    </>
  );
};

export default MealBuilder;
