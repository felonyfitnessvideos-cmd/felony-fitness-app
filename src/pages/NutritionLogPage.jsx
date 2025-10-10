import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Apple, Search, Camera, X, Droplets } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [servings, setServings] = useState([]);
  const [selectedServing, setSelectedServing] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [modalStep, setModalStep] = useState(1);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0, protein: 0, carbs: 0, fat: 0, water: 0
  });

  const mealLogs = useMemo(() => {
    return todaysLogs.filter(log => log.meal_type === activeMeal);
  }, [todaysLogs, activeMeal]);

  const calorieProgress = goals.daily_calorie_goal > 0 ? (dailyTotals.calories / goals.daily_calorie_goal) * 100 : 0;

  const fetchLogData = useCallback(async (userId) => {
    setLoading(true);
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      const [logsResponse, totalsResponse, profileResponse] = await Promise.all([
        supabase
          .from('nutrition_logs')
          .select('*, food_servings(*, foods(name))')
          .eq('user_id', userId)
          .gte('created_at', todayStart.toISOString())
          .lte('created_at', todayEnd.toISOString()),
        supabase.rpc('get_daily_nutrition_totals', { p_user_id: userId }),
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()
      ]);

      const { data: logs, error: logsError } = logsResponse;
      if (logsError) throw logsError;

      const { data: totalsData, error: totalsError } = totalsResponse;
      if (totalsError) throw totalsError;

      const { data: profile, error: profileError } = profileResponse;
      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      
      setTodaysLogs(logs || []);
      if (profile) setGoals(profile);

      if (totalsData && totalsData.length > 0) {
        const totals = totalsData[0];
        setDailyTotals({
          calories: Math.round(totals.total_calories || 0),
          protein: Math.round(totals.total_protein || 0),
          carbs: Math.round(totals.total_carbs || 0),
          fat: Math.round(totals.total_fat || 0),
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

  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    const { data, error } = await supabase
      .from('foods')
      .select('id, name')
      .ilike('name', `%${term}%`)
      .limit(10);

    if (error) console.error("Error searching foods:", error);
    else setSearchResults(data || []);
  };
  
  const openLogModal = async (food) => {
    setSelectedFood(food);
    const { data, error } = await supabase
      .from('food_servings')
      .select('*')
      .eq('food_id', food.id);
    
    if (error) {
      console.error("Error fetching servings:", error);
    } else {
      setServings(data);
      setIsLogModalOpen(true);
      setModalStep(1);
    }
  };

  const closeLogModal = () => {
    setIsLogModalOpen(false);
    setSelectedFood(null);
    setServings([]);
    setSelectedServing(null);
    setSearchTerm('');
    setSearchResults([]);
    setQuantity(1);
  };
  
  const handleSelectServing = (serving) => {
    setSelectedServing(serving);
    setModalStep(2);
  };

  const handleLogFood = async () => {
    if (!selectedServing || !quantity || quantity <= 0 || isNaN(quantity)) return;
    if (!user) {
      alert("Error: User session not found. Please refresh the page.");
      return;
    }

    const { error } = await supabase.from('nutrition_logs').insert({
      user_id: user.id,
      food_serving_id: selectedServing.id,
      meal_type: activeMeal,
      quantity_consumed: quantity,
    });

    if (error) {
      alert(`Error logging food: ${error.message}`);
    } else {
      await fetchLogData(user.id);
      closeLogModal();
    }
  };
  
  const handleLogWater = async (ounces) => {
    if (!user) {
      alert("Error: User session not found. Please refresh the page.");
      return;
    }
    const { error } = await supabase.from('nutrition_logs').insert({
      user_id: user.id,
      meal_type: 'Water',
      water_oz_consumed: ounces,
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
          disabled={!user}
        />
        <button className="camera-btn"><Camera size={20} /></button>
        {searchResults.length > 0 && (
          <div className="food-search-results">
            {searchResults.map(food => (
              <div key={food.id} className="food-search-item" onClick={() => openLogModal(food)}>
                <span>{food.name}</span>
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
              {modalStep === 1 && (
                <div className="serving-selection">
                  <h4>Select a serving size:</h4>
                  <ul className="serving-list">
                    {servings.map(serving => (
                      <li key={serving.id} onClick={() => handleSelectServing(serving)}>
                        <span>{serving.serving_description}</span>
                        <span>{Math.round(serving.calories)} cal</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {modalStep === 2 && selectedServing && (
                <>
                  <p>Serving: {selectedServing.serving_description} ({Math.round(selectedServing.calories)} cal)</p>
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
                </>
              )}
            </div>
            {modalStep === 2 && (
              <div className="modal-footer">
                <button className="log-food-btn" onClick={handleLogFood}>
                  Add to {activeMeal}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default NutritionLogPage;
