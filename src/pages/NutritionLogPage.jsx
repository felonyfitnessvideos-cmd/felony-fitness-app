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

function NutritionLogPage() {
  const { user } = useAuth();
  const [activeMeal, setActiveMeal] = useState('Breakfast');
  const [todaysLogs, setTodaysLogs] = useState([]);
  const [goals, setGoals] = useState({ daily_calorie_goal: 2000, daily_water_goal_oz: 128 });
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0, protein: 0, water: 0
  });

  const mealLogs = todaysLogs.filter(log => log.meal_type === activeMeal);
  const calorieProgress = goals.daily_calorie_goal > 0 ? (dailyTotals.calories / goals.daily_calorie_goal) * 100 : 0;

  const fetchLogData = useCallback(async (userId) => {
    setLoading(true);
    try {
      const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

      const [logsResponse, totalsResponse, profileResponse] = await Promise.all([
        // --- FIX: Query by date, not timestamp ---
        supabase
          .from('nutrition_logs')
          .select('*, food_servings(*, foods(name))')
          .eq('user_id', userId)
          .eq('log_date', today), // This is now timezone-proof
        supabase.rpc('get_daily_nutrition_totals', { p_user_id: userId, p_date: today }),
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()
      ]);

      if (logsResponse.error) throw logsResponse.error;
      if (totalsResponse.error) throw totalsResponse.error;
      if (profileResponse.error && profileResponse.error.code !== 'PGRST116') throw profileResponse.error;
      
      setTodaysLogs(logsResponse.data || []);
      if (profileResponse.data) setGoals(profileResponse.data);

      if (totalsResponse.data && totalsResponse.data.length > 0) {
        const totals = totalsResponse.data[0];
        setDailyTotals({
          calories: Math.round(totals.total_calories || 0),
          protein: Math.round(totals.total_protein || 0),
          water: Math.round(totals.total_water || 0)
        });
      }
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
    
    const today = new Date().toLocaleDateString('en-CA');
    let rpcParams;

    if (selectedFood.is_external) {
      rpcParams = {
        p_user_id: user.id,
        p_meal_type: activeMeal,
        p_quantity_consumed: quantity,
        p_log_date: today, // Pass today's date
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
        p_log_date: today, // Pass today's date
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
    const today = new Date().toLocaleDateString('en-CA');
    const { error } = await supabase.from('nutrition_logs').insert({
      user_id: user.id,
      meal_type: 'Water',
      water_oz_consumed: ounces,
      log_date: today // Also add the date to water logs
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