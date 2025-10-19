 
/**
 * @file NutritionLogPage.jsx
 * @description This page allows users to log their daily food and water intake for different meals.
 * @project Felony Fitness
 */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Apple, Search, Camera, X, Droplets, Loader2 } from 'lucide-react';
import Modal from 'react-modal';
import { useAuth } from '../AuthContext.jsx';
import './NutritionLogPage.css';

  const customModalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%',
    transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '400px',
    background: '#2d3748', color: '#f7fafc', border: '1px solid #4a5568',
    zIndex: 1000, padding: '1.5rem', borderRadius: '12px'
  },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 999 },
};

/**
 * @typedef {object} NutritionLog
 * @property {string} id
 * @property {string} meal_type
 * @property {number} quantity_consumed
 * @property {number} [water_oz_consumed]
 * @property {object} food_servings
 * @property {object} food_servings.foods
 * @property {string} food_servings.foods.name
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

function NutritionLogPage() {
  const { user } = useAuth();
  const [activeMeal, setActiveMeal] = useState('Breakfast');
  /** @type {[NutritionLog[], React.Dispatch<React.SetStateAction<NutritionLog[]>>]} */
  const [todaysLogs, setTodaysLogs] = useState([]);
  const [goals, setGoals] = useState({ daily_calorie_goal: 2000, daily_protein_goal: 150, daily_water_goal_oz: 128 });
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  /** @type {[SearchResult[], React.Dispatch<React.SetStateAction<SearchResult[]>>]} */
  const [searchResults, setSearchResults] = useState([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  /** @type {[SearchResult | null, React.Dispatch<React.SetStateAction<SearchResult | null>>]} */
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0, protein: 0, water: 0
  });

  const mealLogs = todaysLogs.filter(log => log.meal_type === activeMeal);
  const calorieProgress = goals.daily_calorie_goal > 0 ? (dailyTotals.calories / goals.daily_calorie_goal) * 100 : 0;

  /**
   * Fetches all nutrition data for the current day and calculates totals.
   * This function uses a robust, timezone-proof method to query the database.
   * @param {string} userId - The UUID of the authenticated user.
   * @async
   */
  const fetchLogData = useCallback(async (userId) => {
    setLoading(true);
    try {
      // **TIMEZONE FIX**: Calculate the start and end of the user's local day.
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      // DEBUGGING: Log the exact timestamps being sent to the database.
      console.log("Fetching logs between (UTC):", startOfToday.toISOString(), "and", startOfTomorrow.toISOString());


      const [logsResponse, profileResponse] = await Promise.all([
        supabase
          .from('nutrition_logs')
          .select('*, food_servings(*, foods(name))')
          .eq('user_id', userId)
          .gte('created_at', startOfToday.toISOString())
          .lt('created_at', startOfTomorrow.toISOString()),
        supabase
          .from('user_profiles')
          .select('daily_calorie_goal, daily_protein_goal, daily_water_goal_oz')
          .eq('id', userId)
          .single()
      ]);

      if (logsResponse.error) throw logsResponse.error;
      if (profileResponse.error && profileResponse.error.code !== 'PGRST116') throw profileResponse.error;
      
      const logs = logsResponse.data || [];
      console.log("Fetched logs:", logs); // DEBUGGING: See what data came back.
      setTodaysLogs(logs);
      if (profileResponse.data) setGoals(profileResponse.data);

      // **FIX APPLIED**: Calculate totals on the client-side for perfect consistency.
      const totals = logs.reduce((acc, log) => {
        if (log.food_servings) {
          acc.calories += (log.food_servings.calories || 0) * log.quantity_consumed;
          acc.protein += (log.food_servings.protein_g || 0) * log.quantity_consumed;
        }
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

  useEffect(() => {
    if (user) {
      fetchLogData(user.id);
    } else {
      setLoading(false);
    }
  }, [user?.id, fetchLogData]);
  
  const handleSearch = useCallback(async (term) => {
    setSearchTerm(term);
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('food-search', {
        body: { query: term },
      });
      if (error) throw error;
      
      let standardizedResults = [];
      if (data.source === 'local') {
          standardizedResults = data.results.flatMap(food => 
            food.food_servings.map(serving => ({
                is_external: false,
                food_id: food.id,
                name: food.name,
                serving_id: serving.id,
                serving_description: serving.serving_description,
                calories: serving.calories,
                protein_g: serving.protein_g,
            }))
          );
      } else if (data.source === 'external') {
          standardizedResults = data.results.map(item => ({ ...item, is_external: true }));
      }
      setSearchResults(standardizedResults);

    } catch (error) {
      console.error("Error searching food:", error.message);
    } finally {
        setIsSearching(false);
    }
  }, []);
  
  const openLogModal = (food) => {
    setSelectedFood(food);
    setIsLogModalOpen(true);
  };

  const closeLogModal = () => {
    setIsLogModalOpen(false);
    setSelectedFood(null);
    setSearchTerm('');
    setSearchResults([]);
    setQuantity(1);
  };
  
  const handleLogFood = async () => {
    if (!selectedFood || !quantity || quantity <= 0 || isNaN(quantity) || !user) return;
    
    // NOTE: The `log_food_item` RPC function implicitly uses the current timestamp for `created_at`.
    // This is correct and doesn't need to be changed.
    let rpcParams;

    if (selectedFood.is_external) {
      rpcParams = {
        p_user_id: user.id,
        p_meal_type: activeMeal,
        p_quantity_consumed: quantity,
        p_external_food: {
          name: selectedFood.name,
          serving_description: selectedFood.serving_description,
          calories: selectedFood.calories,
          protein_g: selectedFood.protein_g,
          category: 'Uncategorized'
        }
      };
    } else {
      rpcParams = {
        p_user_id: user.id,
        p_meal_type: activeMeal,
        p_quantity_consumed: quantity,
        p_food_serving_id: selectedFood.serving_id
      };
    }

    const { error } = await supabase.rpc('log_food_item', rpcParams);

    if (error) {
      alert(`Error logging food: ${error.message}`);
    } else {
      await fetchLogData(user.id);
      closeLogModal();
    }
  };
  
  const handleLogWater = async (ounces) => {
    if (!user) return;
    const { error } = await supabase.from('nutrition_logs').insert({
      user_id: user.id,
      meal_type: 'Water',
      water_oz_consumed: ounces,
      // We no longer need to set log_date; created_at is handled automatically
    });
    if (error) {
      alert(`Error logging water: ${error.message}`);
    } else {
      await fetchLogData(user.id);
    }
  };
  
  if (loading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading Nutrition Log...</div>;
  }

  return (
    <div className="nutrition-log-page-container">
      <SubPageHeader title="Log" icon={<Apple size={28} />} iconColor="#f97316" backTo="/nutrition" />
      
      <div className="meal-tabs">
        {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(meal => (
            <button key={meal} className={activeMeal === meal ? 'active' : ''} onClick={() => setActiveMeal(meal)}>{meal}</button>
        ))}
      </div>

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
                <h4>{log.food_servings.foods.name}</h4>
                <span>{log.quantity_consumed} x {log.food_servings.serving_description}</span>
              </div>
              <span className="food-item-calories">
                {Math.round((log.food_servings.calories || 0) * log.quantity_consumed)} cal
              </span>
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
        style={customModalStyles}
        contentLabel="Log Food Item"
        appElement={document.getElementById('root')}
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
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    min="0.1"
                    step="0.1"
                  />
                </div>
            </div>
            <div className="modal-footer">
              <button className="log-food-btn" onClick={handleLogFood}>
                Add to {activeMeal}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default NutritionLogPage;

