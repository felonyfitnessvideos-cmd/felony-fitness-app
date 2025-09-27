import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Apple, Search, Camera, X, Droplets } from 'lucide-react'; // NEW: Add Droplets icon
import Modal from 'react-modal';
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
  const [activeMeal, setActiveMeal] = useState('Breakfast');
  const [todaysLogs, setTodaysLogs] = useState([]);
  const [goals, setGoals] = useState({ daily_calorie_goal: 2000, daily_water_goal_oz: 128 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const dailyTotals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0, water = 0;
    todaysLogs.forEach(log => {
      if (log.foods) { // Food entry
        calories += (log.foods.calories_per_serving || 0) * log.quantity_consumed;
        protein += (log.foods.protein_g_per_serving || 0) * log.quantity_consumed;
        carbs += (log.foods.carbs_g_per_serving || 0) * log.quantity_consumed;
        fat += (log.foods.fat_g_per_serving || 0) * log.quantity_consumed;
      }
      // NEW: Correctly sum water intake
      if (log.water_oz_consumed) { // Water entry
        water += log.water_oz_consumed;
      }
    });
    return { calories, protein, carbs, fat, water };
  }, [todaysLogs]);

  const mealLogs = useMemo(() => {
    return todaysLogs.filter(log => log.meal_type === activeMeal);
  }, [todaysLogs, activeMeal]);

  const calorieProgress = goals.daily_calorie_goal > 0 ? (dailyTotals.calories / goals.daily_calorie_goal) * 100 : 0;

  const fetchLogData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const { data: logs, error: logsError } = await supabase
        .from('nutrition_logs')
        .select('*, foods(*)')
        .eq('user_id', user.id)
        .gte('log_date', `${today} 00:00:00`)
        .lte('log_date', `${today} 23:59:59`);
      
      if (logsError) console.error("Error fetching logs:", logsError);
      else setTodaysLogs(logs || []);

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles').select('*').eq('id', user.id).single();
      
      if (profileError && profileError.code !== 'PGRST116') console.error("Error fetching profile:", profileError);
      else if (profile) setGoals(profile);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLogData();
  }, [fetchLogData]);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .ilike('food_name', `%${term}%`)
      .limit(10);

    if (error) console.error("Error searching foods:", error);
    else setSearchResults(data || []);
  };

  const openLogModal = (food) => {
    setSelectedFood(food);
    setQuantity(1);
    setIsLogModalOpen(true);
  };
  const closeLogModal = () => {
    setIsLogModalOpen(false);
    setSelectedFood(null);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleLogFood = async () => {
    if (!selectedFood || quantity <= 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('nutrition_logs').insert({
      user_id: user.id,
      food_id: selectedFood.id,
      meal_type: activeMeal,
      quantity_consumed: quantity,
    });

    if (error) {
      alert(`Error logging food: ${error.message}`);
    } else {
      await fetchLogData();
      closeLogModal();
    }
  };
  
  // NEW: Function to log water intake
  const handleLogWater = async (ounces) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('nutrition_logs').insert({
      user_id: user.id,
      meal_type: 'Water', // Assign a specific type for easy filtering
      water_oz_consumed: ounces,
    });

    if (error) {
      alert(`Error logging water: ${error.message}`);
    } else {
      await fetchLogData(); // Refresh all data to update totals
    }
  };

  return (
    <div className="nutrition-log-container">
      <SubPageHeader title="Log" icon={<Apple size={28} />} iconColor="#f97316" backTo="/nutrition" />
      
      <div className="meal-tabs">
        <button className={activeMeal === 'Breakfast' ? 'active' : ''} onClick={() => setActiveMeal('Breakfast')}>Breakfast</button>
        <button className={activeMeal === 'Lunch' ? 'active' : ''} onClick={() => setActiveMeal('Lunch')}>Lunch</button>
        <button className={activeMeal === 'Dinner' ? 'active' : ''} onClick={() => setActiveMeal('Dinner')}>Dinner</button>
        <button className={activeMeal === 'Snack' ? 'active' : ''} onClick={() => setActiveMeal('Snack')}>Snack</button>
      </div>

      <div className="search-bar-wrapper">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="Search for a food..." 
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <button className="camera-btn">
          <Camera size={20} />
        </button>
        {searchResults.length > 0 && (
          <div className="food-search-results">
            {searchResults.map(food => (
              <div key={food.id} className="food-search-item" onClick={() => openLogModal(food)}>
                <span>{food.food_name}</span>
                <span>{food.calories_per_serving} cal</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEW: Water Log Card */}
      <div className="water-log-card">
        <div className="water-log-header">
          <Droplets size={20} />
          <h3>Water Intake</h3>
          <span>{dailyTotals.water} / {goals.daily_water_goal_oz || 128} oz</span>
        </div>
        <div className="water-log-actions">
          <button onClick={() => handleLogWater(8)}>+ 8 oz</button>
          <button onClick={() => handleLogWater(12)}>+ 12 oz</button>
          <button onClick={() => handleLogWater(16)}>+ 16 oz</button>
        </div>
      </div>

      <div className="logged-items-list">
        {loading && <p>Loading...</p>}
        {!loading && mealLogs.length === 0 && (
          <p className="no-items-message">No items logged for {activeMeal} yet.</p>
        )}
        {!loading && mealLogs.map(log => (
          log.foods && (
            <div key={log.id} className="food-item-card">
              <div className="food-item-details">
                <h4>{log.foods.food_name}</h4>
                <span>{log.quantity_consumed} serving(s)</span>
              </div>
              <span className="food-item-calories">
                {Math.round((log.foods.calories_per_serving || 0) * log.quantity_consumed)} cal
              </span>
            </div>
          )
        ))}
      </div>
      
      <div className="calorie-status-footer">
        <div className="calorie-info">
          <span>{Math.round(dailyTotals.calories)} / {goals.daily_calorie_goal || 2000} cal</span>
          <span>{Math.max(0, (goals.daily_calorie_goal || 2000) - dailyTotals.calories)} left</span>
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
      >
        {selectedFood && (
          <div className="log-food-modal">
            <div className="modal-header">
              <h3>{selectedFood.food_name}</h3>
              <button onClick={closeLogModal} className="close-modal-btn"><X size={24} /></button>
            </div>
            <div className="modal-body">
              <p>Per serving: {selectedFood.calories_per_serving} cal, {selectedFood.protein_g_per_serving}g protein</p>
              <div className="quantity-input">
                <label htmlFor="quantity">Quantity (servings)</label>
                <input 
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value))}
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