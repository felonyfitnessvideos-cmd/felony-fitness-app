/**
 * @file NutritionGoalsPage.jsx
 * @description This page allows users to set and update their daily nutrition goals, such as calories, macronutrients, and water intake.
 * @project Felony Fitness
 *
 * @workflow
 * 1.  **Data Fetching**: On component mount, `fetchGoals` is called. It queries the `user_profiles` table to retrieve the current user's saved daily nutrition goals.
 * 2.  **State Management**: The fetched goals are stored in the `goals` state object. The form inputs are bound to this state. A `loading` state manages the UI during fetching, and a `message` state provides feedback to the user.
 * 3.  **User Input**: As the user types in the input fields, `handleInputChange` updates the `goals` state in real-time.
 * 4.  **Saving Goals**: When the "Save Goals" button is clicked, `handleSaveGoals` is triggered. It constructs a payload with the updated goal values, converting any empty inputs to `null` for the database.
 * 5.  **Database Update**: The function uses `supabase.from('user_profiles').upsert()` to update the user's profile with the new goals. `upsert` is used to safely update the existing record.
 * 6.  **User Feedback**: A status message is displayed to inform the user that their goals are being saved or have been saved successfully.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Apple, Flame, Droplets, Beef, Wheat, Wind } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import Modal from 'react-modal'; // <-- 1. IMPORTED Modal
import './NutritionGoalsPage.css';

/**
 * @typedef {object} NutritionGoals
 * @property {string|number} daily_calorie_goal
 * @property {string|number} daily_protein_goal
 * @property {string|number} daily_carb_goal
 * @property {string|number} daily_fat_goal
 * @property {string|number} daily_water_goal_oz
 */

/**
 * NutritionGoalsPage
 * Page that allows users to view and edit their daily nutrition goals.
 * Defensive note: this component expects `user` from AuthContext; if the
 * user is missing the save handler will early-return and show a message.
 */
function NutritionGoalsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;
  const [goals, setGoals] = useState({
    daily_calorie_goal: '',
    daily_protein_goal_g: '',
    daily_carb_goal_g: '',
    daily_fat_goal_g: '',
    daily_water_goal_oz: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const fetchGoals = useCallback(async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('daily_calorie_goal, daily_protein_goal_g, daily_carb_goal_g, daily_fat_goal_g, daily_water_goal_oz')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setGoals({
          daily_calorie_goal: data.daily_calorie_goal || '',
          daily_protein_goal_g: data.daily_protein_goal_g || '',
          daily_carb_goal_g: data.daily_carb_goal_g || '',
          daily_fat_goal_g: data.daily_fat_goal_g || '',
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
    if (userId) {
      fetchGoals(userId);
    } else {
      setLoading(false);
    }
  }, [userId, fetchGoals]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGoals(prev => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
  };

  const handleSaveGoals = async () => {
    if (!user?.id) {
      setMessage('You must be logged in.');
      return;
    }

    setMessage('Saving...');
    try {
      const updates = {
        daily_calorie_goal: goals.daily_calorie_goal || null,
        daily_protein_goal_g: goals.daily_protein_goal_g || null,
        daily_carb_goal_g: goals.daily_carb_goal_g || null,
        daily_fat_goal_g: goals.daily_fat_goal_g || null,
        daily_water_goal_oz: goals.daily_water_goal_oz || null,
      };

      const { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (profile) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', user.id);
        if (updateError) throw updateError;
      } else {
        const insertPayload = { ...updates, id: user.id, theme: 'dark' };
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert(insertPayload);
        if (insertError) throw insertError;
      }
      
      setMessage('');
      setIsSuccessModalOpen(true);
      
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigate('/dashboard');
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
              name="daily_protein_goal_g"
              value={goals.daily_protein_goal_g || ''}
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
              name="daily_carb_goal_g"
              value={goals.daily_carb_goal_g || ''}
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
              name="daily_fat_goal_g"
              value={goals.daily_fat_goal_g || ''}
              onChange={handleInputChange}
              placeholder="e.g., 70" 
            />
          </div>
        </div>

        <button className="save-goals-button" onClick={handleSaveGoals}>
          Save Goals
        </button>
        <div className="status-message" role="status" aria-live="polite" aria-atomic="true">{message || ''}</div>
      </div>

      <Modal
        isOpen={isSuccessModalOpen}
        onRequestClose={handleCloseSuccessModal}
        contentLabel="Success"
        overlayClassName="custom-modal-overlay"
        className="custom-modal-content"
      >
        <div style={{textAlign: 'center'}}>
          <h2>Goals Saved!</h2>
          <div className="action-footer" style={{justifyContent: 'center'}}>
            <button 
              type="button" 
              className="save-goals-button"
              onClick={handleCloseSuccessModal}
              style={{marginTop: '1rem'}}
            >
              OK
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

export default NutritionGoalsPage;
