import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Apple, Flame, Droplets, Beef, Wheat, Wind } from 'lucide-react';
import './NutritionGoalsPage.css';

function NutritionGoalsPage() {
  const [goals, setGoals] = useState({
    daily_calorie_goal: '',
    daily_protein_goal: '',
    daily_carb_goal: '',
    daily_fat_goal: '',
    daily_water_goal_oz: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('daily_calorie_goal, daily_protein_goal, daily_carb_goal, daily_fat_goal, daily_water_goal_oz')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching goals:", error);
      } else if (data) {
        setGoals({
          daily_calorie_goal: data.daily_calorie_goal || '',
          daily_protein_goal: data.daily_protein_goal || '',
          daily_carb_goal: data.daily_carb_goal || '',
          daily_fat_goal: data.daily_fat_goal || '',
          daily_water_goal_oz: data.daily_water_goal_oz || ''
        });
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGoals(prev => ({ ...prev, [name]: value === '' ? null : parseInt(value, 10) }));
  };

  const handleSaveGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("You must be logged in.");

    setMessage('Saving...');
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, ...goals });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Goals saved successfully!');
      setTimeout(() => setMessage(''), 2000);
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

