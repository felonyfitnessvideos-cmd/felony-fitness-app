import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Plus, Edit, Trash2, Heart, Clock, ChefHat, Filter, Star, Copy } from 'lucide-react';
import MealBuilder from '../components/MealBuilder';
import { MEAL_CATEGORIES, calculateMealNutrition } from '../constants/mealPlannerConstants';
import './MyMealsPage.css';

/**
 * MyMealsPage component for managing user's personal meal library
 * 
 * This component provides a comprehensive meal management interface with:
 * - Display of user's saved meals with nutrition information
 * - Search and filtering by category, tags, and text
 * - Meal creation, editing, and deletion
 * - Favoriting and rating system
 * - Meal duplication functionality
 * - Integration with MealBuilder for meal creation/editing
 * 
 * @component
 * @returns {JSX.Element} Complete meal library management interface
 * 
 * @example
 * <MyMealsPage />
 */
const MyMealsPage = () => {
  /** @type {[Array, Function]} User's complete meal collection */
  const [meals, setMeals] = useState([]);
  
  /** @type {[Array, Function]} Filtered meals based on search/filter criteria */
  const [filteredMeals, setFilteredMeals] = useState([]);
  
  /** @type {[string, Function]} Text search term for meal filtering */
  const [searchTerm, setSearchTerm] = useState('');
  
  /** @type {[string, Function]} Selected category filter for meals */
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  /** @type {[Array, Function]} Selected tags for filtering meals */
  const [selectedTags, setSelectedTags] = useState([]);
  
  /** @type {[boolean, Function]} Controls MealBuilder modal visibility */
  const [showMealBuilder, setShowMealBuilder] = useState(false);
  
  /** @type {[Object|null, Function]} Meal being edited (null for new meal) */
  const [editingMeal, setEditingMeal] = useState(null);
  
  /** @type {[boolean, Function]} Loading state for meal data fetch */
  const [isLoading, setIsLoading] = useState(true);
  
  /** @type {[Array, Function]} All available tags from user's meals */
  const [availableTags, setAvailableTags] = useState([]);

  /** @constant {Array<Object>} Available meal categories for filtering */
  const categories = MEAL_CATEGORIES;

  /**
   * Filter meals based on search term, category, and tags
   * 
   * @returns {void}
   */
  const filterMeals = useCallback(() => {
    let filtered = meals;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(meal =>
        meal.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(meal => meal.category === selectedCategory);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(meal =>
        meal.tags?.some(tag => selectedTags.includes(tag))
      );
    }

    setFilteredMeals(filtered);
  }, [meals, searchTerm, selectedCategory, selectedTags]);

  /**
   * Load user's meals from database with nutrition calculation
   * Fetches meals with associated foods and calculates nutrition totals
   * 
   * @async
   * @returns {Promise<void>}
   */
  const loadMeals = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('meals')
        .select(`
          *,
          meal_foods (
            quantity,
            notes,
            food_servings (
              food_name,
              calories,
              protein_g,
              carbs_g,
              fat_g,
              serving_description
            )
          ),
          user_meals (
            is_favorite,
            custom_name,
            notes
          )
        `)
        .or(`user_id.eq.${user.id},user_meals.user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate nutrition for each meal and extract tags
      const mealsWithNutrition = data.map(meal => {
        const userMeal = meal.user_meals && meal.user_meals.length > 0 ? meal.user_meals[0] : null;
        return {
          ...meal,
          nutrition: calculateMealNutrition(meal.meal_foods),
          display_name: userMeal?.custom_name || meal.name,
          is_favorite: userMeal?.is_favorite || false,
          user_notes: userMeal?.notes || ''
        };
      });

      // Extract all unique tags
      const allTags = new Set();
      mealsWithNutrition.forEach(meal => {
        if (meal.tags) {
          meal.tags.forEach(tag => allTags.add(tag));
        }
      });
      setAvailableTags(Array.from(allTags).sort());

      setMeals(mealsWithNutrition);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  useEffect(() => {
    filterMeals();
  }, [filterMeals]);




  const toggleFavorite = async (mealId, currentFavorite) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_meals')
        .update({ is_favorite: !currentFavorite })
        .eq('user_id', user.id)
        .eq('meal_id', mealId);

      if (error) throw error;

      // Update local state
      setMeals(meals.map(meal =>
        meal.id === mealId
          ? { ...meal, is_favorite: !currentFavorite }
          : meal
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const duplicateMeal = async (meal) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create a copy of the meal
      const mealCopy = {
        ...meal,
        id: undefined,
        name: `${meal.name} (Copy)`,
        user_id: user.id,
        is_premade: false,
        created_at: undefined,
        updated_at: undefined
      };

      const { data: newMeal, error: mealError } = await supabase
        .from('meals')
        .insert([mealCopy])
        .select()
        .single();

      if (mealError) throw mealError;

      // Copy meal foods
      if (meal.meal_foods && meal.meal_foods.length > 0) {
        const mealFoodsCopy = meal.meal_foods.map(food => ({
          meal_id: newMeal.id,
          food_servings_id: food.food_servings_id,
          quantity: food.quantity,
          notes: food.notes
        }));

        const { error: foodsError } = await supabase
          .from('meal_foods')
          .insert(mealFoodsCopy);

        if (foodsError) throw foodsError;
      }

      // Add to user meals
      const { error: userMealError } = await supabase
        .from('user_meals')
        .insert([{
          user_id: user.id,
          meal_id: newMeal.id,
          is_favorite: false
        }]);

      if (userMealError) throw userMealError;

      await loadMeals();
    } catch (error) {
      console.error('Error duplicating meal:', error);
      alert('Error duplicating meal. Please try again.');
    }
  };

  const deleteMeal = async (mealId) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if it's a user's own meal or just removing from saved meals
      const meal = meals.find(m => m.id === mealId);
      
      if (meal.user_id === user.id) {
        // Delete the meal entirely (will cascade to meal_foods and user_meals)
        const { error } = await supabase
          .from('meals')
          .delete()
          .eq('id', mealId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Just remove from user's saved meals
        const { error } = await supabase
          .from('user_meals')
          .delete()
          .eq('user_id', user.id)
          .eq('meal_id', mealId);

        if (error) throw error;
      }

      await loadMeals();
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert('Error deleting meal. Please try again.');
    }
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setShowMealBuilder(true);
  };

  const handleMealSaved = () => {
    loadMeals();
    setShowMealBuilder(false);
    setEditingMeal(null);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTags([]);
  };

  const formatTime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getDifficultyStars = (level) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`difficulty-star ${i < level ? 'filled' : ''}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your meals...</p>
      </div>
    );
  }

  return (
    <div className="my-meals-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>
            <ChefHat className="icon" />
            My Meals
          </h1>
          <p>Manage your saved meals and recipes</p>
        </div>
        <button
          onClick={() => {
            setEditingMeal(null);
            setShowMealBuilder(true);
          }}
          className="create-meal-btn"
        >
          <Plus className="icon" />
          Create New Meal
        </button>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-bar">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search meals by name, description, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          {/* Category Filter */}
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="filter-group">
              <label>Tags:</label>
              <div className="tags-filter">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`tag-filter ${selectedTags.includes(tag) ? 'active' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {(searchTerm || selectedCategory !== 'all' || selectedTags.length > 0) && (
            <button onClick={clearFilters} className="clear-filters-btn">
              <Filter className="icon" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Meals Grid */}
      <div className="meals-grid">
        {filteredMeals.map(meal => (
          <div key={meal.id} className="meal-card">
            {/* Meal Image */}
            <div className="meal-image">
              {meal.image_url ? (
                <img src={meal.image_url} alt={meal.display_name} />
              ) : (
                <div className="placeholder-image">
                  <ChefHat className="placeholder-icon" />
                </div>
              )}
              
              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(meal.id, meal.is_favorite)}
                className={`favorite-btn ${meal.is_favorite ? 'favorited' : ''}`}
              >
                <Heart className="icon" />
              </button>

              {/* Premade Badge */}
              {meal.is_premade && (
                <div className="premade-badge">Premade</div>
              )}
            </div>

            {/* Meal Info */}
            <div className="meal-info">
              <div className="meal-header">
                <h3 className="meal-name">{meal.display_name}</h3>
                <div className="meal-category">{meal.category}</div>
              </div>

              {meal.description && (
                <p className="meal-description">{meal.description}</p>
              )}

              {/* Meal Meta */}
              <div className="meal-meta">
                {(meal.prep_time || meal.cook_time) && (
                  <div className="meal-time">
                    <Clock className="icon" />
                    <span>
                      {meal.prep_time && `${formatTime(meal.prep_time)} prep`}
                      {meal.prep_time && meal.cook_time && ' • '}
                      {meal.cook_time && `${formatTime(meal.cook_time)} cook`}
                    </span>
                  </div>
                )}

                {meal.difficulty_level && (
                  <div className="meal-difficulty">
                    {getDifficultyStars(meal.difficulty_level)}
                  </div>
                )}
              </div>

              {/* Nutrition Summary */}
              <div className="meal-nutrition">
                <div className="nutrition-item">
                  <span className="value">{Math.round(meal.nutrition.calories)}</span>
                  <span className="label">cal</span>
                </div>
                <div className="nutrition-item">
                  <span className="value">{Math.round(meal.nutrition.protein)}g</span>
                  <span className="label">protein</span>
                </div>
                <div className="nutrition-item">
                  <span className="value">{Math.round(meal.nutrition.carbs)}g</span>
                  <span className="label">carbs</span>
                </div>
                <div className="nutrition-item">
                  <span className="value">{Math.round(meal.nutrition.fat)}g</span>
                  <span className="label">fat</span>
                </div>
              </div>

              {/* Tags */}
              {meal.tags && meal.tags.length > 0 && (
                <div className="meal-tags">
                  {meal.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="meal-tag">{tag}</span>
                  ))}
                  {meal.tags.length > 3 && (
                    <span className="meal-tag more">+{meal.tags.length - 3} more</span>
                  )}
                </div>
              )}
            </div>

            {/* Meal Actions */}
            <div className="meal-actions">
              <button
                onClick={() => handleEditMeal(meal)}
                className="action-btn edit"
                title="Edit meal"
              >
                <Edit className="icon" />
              </button>
              <button
                onClick={() => duplicateMeal(meal)}
                className="action-btn duplicate"
                title="Duplicate meal"
              >
                <Copy className="icon" />
              </button>
              <button
                onClick={() => deleteMeal(meal.id)}
                className="action-btn delete"
                title="Delete meal"
              >
                <Trash2 className="icon" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMeals.length === 0 && !isLoading && (
        <div className="empty-state">
          {meals.length === 0 ? (
            <>
              <ChefHat className="empty-icon" />
              <h3>No Saved Meals Yet</h3>
              <p>Create your first meal or browse premade meals to get started.</p>
              <button
                onClick={() => setShowMealBuilder(true)}
                className="create-meal-btn"
              >
                <Plus className="icon" />
                Create Your First Meal
              </button>
            </>
          ) : (
            <>
              <Search className="empty-icon" />
              <h3>No Meals Found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button onClick={clearFilters} className="clear-filters-btn">
                <Filter className="icon" />
                Clear All Filters
              </button>
            </>
          )}
        </div>
      )}

      {/* Meal Builder Modal */}
      <MealBuilder
        isOpen={showMealBuilder}
        onClose={() => {
          setShowMealBuilder(false);
          setEditingMeal(null);
        }}
        onSave={handleMealSaved}
        editingMeal={editingMeal}
      />
    </div>
  );
};

export default MyMealsPage;