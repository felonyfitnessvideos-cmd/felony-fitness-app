import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Apple, Flame, Droplets, Beef, Wheat, Wind } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import './NutritionGoalsPage.css';

function NutritionGoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState({
    daily_calorie_goal: '',
    daily_protein_goal: '',
    daily_carb_goal: '',
    daily_fat_goal: '',
    daily_water_goal_oz: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchGoals = useCallback(async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('daily_calorie_goal, daily_protein_goal, daily_carb_goal, daily_fat_goal, daily_water_goal_oz')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setGoals({
          daily_calorie_goal: data.daily_calorie_goal || '',
          daily_protein_goal: data.daily_protein_goal || '',
          daily_carb_goal: data.daily_carb_goal || '',
          daily_fat_goal: data.daily_fat_goal || '',
          daily_water_goal_oz: data.daily_water_goal_oz || ''
        });
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      setMessage("Could not load your goals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchGoals(user.id);
    } else {
      setLoading(false);
    }
  }, [user?.id, fetchGoals]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Allow empty string to clear input, otherwise parse as integer
    setGoals(prev => ({ ...prev, [name]: value === '' ? '' : parseInt(value, 10) }));
  };

  const handleSaveGoals = async () => {
    if (!user) return alert("You must be logged in.");

    setMessage('Saving...');
    try {
      const updates = {
        id: user.id,
        daily_calorie_goal: goals.daily_calorie_goal || null,
        daily_protein_goal: goals.daily_protein_goal || null,
        daily_carb_goal: goals.daily_carb_goal || null,
        daily_fat_goal: goals.daily_fat_goal || null,
        daily_water_goal_oz: goals.daily_water_goal_oz || null,
      };
      const { error } = await supabase.from('user_profiles').upsert(updates);

      if (error) throw error;
      
      setMessage('Goals saved successfully!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading goals...</div>;
  }

  return (
    <div className="nutrition-goals-container">
      <SubPageHeader title="Goals" icon={<Apple size={28} />} iconColor="#f97316" backTo="/nutrition" />
      
      <div className="goals-form">
        <div className="goal-input-card">
          <Flame size={24} className="goal-icon" />
          <div className="goal-input-wrapper">
            <label htmlFor="calories">Calories</label>
            <input 
              type="number" 
              id="calories"
              name="daily_calorie_goal"
              value={goals.daily_calorie_goal || ''}
              onChange={handleInputChange}
              placeholder="e.g., 2000" 
            />
          </div>
        </div>

        <div className="goal-input-card">
          <Droplets size={24} className="goal-icon" />
          <div className="goal-input-wrapper">
            <label htmlFor="water">Water (oz)</label>
            <input 
              type="number" 
              id="water"
              name="daily_water_goal_oz"
              value={goals.daily_water_goal_oz || ''}
              onChange={handleInputChange}
              placeholder="e.g., 128" 
            />
          </div>
        </div>

        <h3>Macronutrients</h3>

        <div className="goal-input-card">
          <Beef size={24} className="goal-icon" />
          <div className="goal-input-wrapper">
            <label htmlFor="protein">Protein (g)</label>
            <input 
              type="number" 
              id="protein"
              name="daily_protein_goal"
              value={goals.daily_protein_goal || ''}
              onChange={handleInputChange}
              placeholder="e.g., 150" 
            />
          </div>
        </div>

        <div className="goal-input-card">
          <Wheat size={24} className="goal-icon" />
          <div className="goal-input-wrapper">
            <label htmlFor="carbs">Carbs (g)</label>
            <input 
              type="number" 
              id="carbs"
              name="daily_carb_goal"
              value={goals.daily_carb_goal || ''}
              onChange={handleInputChange}
              placeholder="e.g., 250" 
            />
          </div>
        </div>

        <div className="goal-input-card">
          <Wind size={24} className="goal-icon" />
          <div className="goal-input-wrapper">
            <label htmlFor="fat">Fat (g)</label>
            <input 
              type="number" 
              id="fat"
              name="daily_fat_goal"
              value={goals.daily_fat_goal || ''}
              onChange={handleInputChange}
              placeholder="e.g., 70" 
            />
          </div>
        </div>

        <button className="save-goals-button" onClick={handleSaveGoals}>
          Save Goals
        </button>
        {message && <p className="status-message">{message}</p>}
      </div>
    </div>
  );
}

export default NutritionGoalsPage;
