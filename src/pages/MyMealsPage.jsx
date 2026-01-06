import { ChefHat, Clock, Copy, Edit, Filter, Heart, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import MealBuilder from '../components/MealBuilder';
import { MEAL_CATEGORIES, calculateMealNutrition } from '../constants/mealPlannerConstants';
import { supabase } from '../supabaseClient';
import './MyMealsPage.css';
import PremadeMealBrowser from '../components/PremadeMealBrowser';

const MyMealsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [meals, setMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [showMealBuilder, setShowMealBuilder] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [showPremadeBrowser, setShowPremadeBrowser] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isPremade, setIsPremade] = useState(false);

  const categories = MEAL_CATEGORIES;

  const loadMeals = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: userSavedMeals, error: userMealsError } = await supabase
        .from('user_meals')
        .select(`
          *,
          user_meal_foods (
            id,
            food_id,
            quantity,
            notes,
            foods (
              id,
              name,
              calories,
              protein_g,
              carbs_g,
              fat_g
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userMealsError) throw userMealsError;

      const userMealsData = userSavedMeals || [];

      const mealsWithNutrition = userMealsData.map(meal => {
        const nutrition = calculateMealNutrition(meal.user_meal_foods);
        return {
          ...meal,
          nutrition,
          display_name: meal.custom_name || meal.name,
          is_favorite: meal.is_favorite || false
        };
      });

      setMeals(mealsWithNutrition);
    } catch (error) {
      console.warn('MyMealsPage - Error loading meals:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  useEffect(() => {
    let filtered = meals;

    if (searchTerm.trim()) {
      filtered = filtered.filter(meal =>
        meal.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(meal => meal.category === selectedCategory);
    }

    setFilteredMeals(filtered);
  }, [meals, searchTerm, selectedCategory]);

    const toggleFavorite = async (mealId, currentFavorite) => {
    try {
      if (!user) return;
      const { error } = await supabase
        .from('user_meals')
        .update({ is_favorite: !currentFavorite })
        .eq('user_id', user.id)
        .eq('id', mealId);

      if (error) throw error;

      setMeals(prev => prev.map(meal =>
        meal.id === mealId ? { ...meal, is_favorite: !currentFavorite } : meal
      ));
    } catch (error) {
      console.warn('Error toggling favorite:', error);
    }
  };

  const duplicateMeal = async (meal) => {
    try {
      if (!user) return;

      const mealCopy = {
        user_id: user.id,
        name: `${meal.name} (Copy)`,
        description: meal.description,
        instructions: meal.instructions,
        tags: meal.tags,
        category: meal.category,
        prep_time_minutes: meal.prep_time_minutes,
        cook_time_minutes: meal.cook_time_minutes,
        serving_size: meal.serving_size,
        difficulty_level: meal.difficulty_level,
        image_url: meal.image_url,
        is_favorite: false,
        custom_name: null
      };

      const { data: newMeal, error: mealError } = await supabase
        .from('user_meals')
        .insert([mealCopy])
        .select()
        .single();

      if (mealError) throw mealError;

      if (meal.user_meal_foods?.length > 0) {
        const validFoods = meal.user_meal_foods.filter(f => f.food_id);
        if (validFoods.length > 0) {
          const mealFoodsCopy = validFoods.map(food => ({
            user_meal_id: newMeal.id,
            food_id: food.food_id,
            quantity: food.quantity,
            notes: food.notes || ''
          }));

          const { error: foodsError } = await supabase
            .from('user_meal_foods')
            .insert(mealFoodsCopy);

          if (foodsError) throw foodsError;
        }
      }

      await loadMeals();
      showToast('Meal duplicated!');
    } catch (error) {
      console.error('Error duplicating meal:', error);
      alert('Error duplicating meal. Please try again.');
    }
  };

  const deleteMeal = async (mealId) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;
    try {
      if (!user) return;
      const { error } = await supabase
        .from('user_meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadMeals();
      showToast('Meal deleted.');
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert('Error deleting meal.');
    }
  };

  const handlePremadeMealAdd = async (meal) => {
    try {
      if (!user) return;

      const mealCopy = {
        user_id: user.id,
        name: meal.name,
        description: meal.description,
        instructions: meal.instructions,
        tags: meal.tags,
        category: meal.category,
        prep_time_minutes: meal.prep_time_minutes,
        cook_time_minutes: meal.cook_time_minutes,
        serving_size: meal.serving_size,
        difficulty_level: meal.difficulty_level,
        image_url: meal.image_url,
        is_favorite: false,
        custom_name: null
      };

      const { data: newMeal, error: mealError } = await supabase
        .from('user_meals')
        .insert([mealCopy])
        .select()
        .single();

      if (mealError) throw mealError;

      if (meal.meal_foods?.length > 0) {
        const mealFoodsCopy = meal.meal_foods.map(food => ({
          user_meal_id: newMeal.id,
          food_id: food.food_id,
          quantity: food.quantity,
          notes: food.notes || ''
        }));

        const { error: foodsError } = await supabase
          .from('user_meal_foods')
          .insert(mealFoodsCopy);
        
        if (foodsError) throw foodsError;
      }

      await loadMeals();
      showToast('Added to My Meals!');
    } catch (error) {
      console.error('Error adding premade meal:', error);
      alert('Error adding meal.');
    }
  };

  const handleEditMeal = (meal, isPremadeArg = false) => {
    setEditingMeal(meal);
    setIsPremade(isPremadeArg);
    setShowMealBuilder(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const showToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const formatTime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDifficultyStars = (level) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`difficulty-star ${i < level ? 'filled' : ''}`} />
    ));
  };

  if (authLoading) return <div className="loading-container"><div className="loading-spinner"></div></div>;
  if (!user) {
    return (
      <div className="loading-container">
        <p>Please log in to view your meals.</p>
        <button onClick={() => navigate('/')} className="create-meal-btn">Go to Login</button>
      </div>
    );
  }

  if (showPremadeBrowser) {
    return (
      <PremadeMealBrowser 
        onMealSelect={handlePremadeMealAdd} 
        onCancel={() => setShowPremadeBrowser(false)} 
      />
    );
  }

  return (
    <div className="my-meals-page">
      {successMessage && <div className="success-toast">{successMessage}</div>}

      <div className="page-header">
        <div className="header-left">
          <h1><ChefHat className="icon" /> My Meals</h1>
          <p>Manage your saved meals and recipes</p>
        </div>
        <div className="header-buttons">
          <button onClick={() => { setEditingMeal(null); setShowMealBuilder(true); }} className="create-meal-btn">
            <Plus className="icon" /> Create New Meal
          </button>
          <button onClick={() => setShowPremadeBrowser(true)} className="browse-premade-btn">
            <ChefHat className="icon" /> Browse Premade Meals
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search meals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <div className="filter-group">
            <label>Category:</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          {(searchTerm || selectedCategory !== 'all') && (
            <button onClick={clearFilters} className="clear-filters-btn">
              <Filter className="icon" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading meals...</p>
        </div>
      ) : (
        <div className="meals-grid">
          {filteredMeals.map(meal => (
            <div key={meal.id} className="meal-card">
              <div className="meal-info">
                <div className="meal-header">
                  <div className="meal-header-left">
                    <h3 className="meal-name">{meal.display_name}</h3>
                    <div className="meal-category">{meal.category}</div>
                  </div>
                  <button onClick={() => toggleFavorite(meal.id, meal.is_favorite)} className={`favorite-btn ${meal.is_favorite ? 'favorited' : ''}`}>
                    <Heart className="icon" />
                  </button>
                </div>
                {meal.description && <p className="meal-description">{meal.description}</p>}
                <div className="meal-meta">
                  {meal.prep_time_minutes > 0 && (
                    <div className="meal-time">
                      <Clock className="icon" />
                      <span>{formatTime(meal.prep_time_minutes)}</span>
                    </div>
                  )}
                  {meal.difficulty_level > 0 && (
                    <div className="meal-difficulty">
                      {getDifficultyStars(meal.difficulty_level)}
                    </div>
                  )}
                </div>
                <div className="meal-nutrition">
                  <div className="nutrition-item">
                    <span className="value">{meal.nutrition?.calories ? Math.round(meal.nutrition.calories) : '0'}</span>
                    <span className="label">cal</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="value">{meal.nutrition?.protein ? Math.round(meal.nutrition.protein) : '0'}g</span>
                    <span className="label">prot</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="value">{meal.nutrition?.carbs ? Math.round(meal.nutrition.carbs) : '0'}g</span>
                    <span className="label">carb</span>
                  </div>
                  <div className="nutrition-item">
                    <span className="value">{meal.nutrition?.fat ? Math.round(meal.nutrition.fat) : '0'}g</span>
                    <span className="label">fat</span>
                  </div>
                </div>
              </div>
              <div className="meal-actions">
                <button onClick={() => handleEditMeal(meal)} className="action-btn edit" title="Edit">
                  <Edit className="icon" />
                </button>
                <button onClick={() => duplicateMeal(meal)} className="action-btn duplicate" title="Duplicate">
                  <Copy className="icon" />
                </button>
                <button onClick={() => deleteMeal(meal.id)} className="action-btn delete" title="Delete">
                  <Trash2 className="icon" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredMeals.length === 0 && !isLoading && (
        <div className="empty-state">
          {meals.length === 0 ? (
            <>
              <ChefHat className="empty-icon" />
              <h3>No Saved Meals Yet</h3>
              <p>Create your first meal or browse our premade selection.</p>
              <button onClick={() => setShowMealBuilder(true)} className="create-meal-btn">
                <Plus className="icon" /> Create Meal
              </button>
            </>
          ) : (
            <>
              <Search className="empty-icon" />
              <h3>No Meals Found</h3>
              <p>Try adjusting your search.</p>
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            </>
          )}
        </div>
      )}

      <MealBuilder
        isOpen={showMealBuilder}
        onClose={() => { setShowMealBuilder(false); setEditingMeal(null); }}
        onSave={() => { loadMeals(); setShowMealBuilder(false); setEditingMeal(null); }}
        editingMeal={editingMeal}
        isPremade={isPremade}
      />
    </div>
  );
};

export default MyMealsPage;