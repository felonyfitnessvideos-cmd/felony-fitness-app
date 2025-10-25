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
  /** @type {[NutritionGoals, React.Dispatch<React.SetStateAction<NutritionGoals>>]} */
  const [goals, setGoals] = useState({
    daily_calorie_goal: '',
    daily_protein_goal: '',
    daily_carb_goal: '',
    daily_fat_goal: '',
    daily_water_goal_oz: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // <-- 2. ADDED new state

  /**
   * Fetches the user's current nutrition goals from their profile.
   * @param {string} userId - The UUID of the authenticated user.
   * @async
   */
  const fetchGoals = useCallback(async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('daily_calorie_goal, daily_protein_goal, daily_carb_goal, daily_fat_goal, daily_water_goal_oz')
        .eq('id', userId)
        .single();

      // Ignore the "no rows found" error, as it's expected for new users.
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        // Populate the state with fetched data, using empty strings as a fallback.
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

  // Effect to trigger the initial data fetch when the user session is available.
  // Only depend on the user's id and the stable fetchGoals callback. This
  // avoids unnecessary re-fetches when the user object's reference changes.
  useEffect(() => {
    if (userId) {
      fetchGoals(userId);
    } else {
      setLoading(false);
    }
  }, [userId, fetchGoals]);

  /**
   * NutritionGoalsPage — manage user's nutrition goals (calories, macros).
   *
   * Responsibilities:
   * - load and persist nutrition goals to `user_profiles` or a goals table
   * - show inline status messages instead of blocking alerts
   *
   * Notes:
   * - guards are in place for staged DB deployments where columns may be
   *   missing; UI shows best-effort state.
   */
  /**
   * Handles changes to the form's input fields, updating the local state.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Allow empty strings for clearing inputs, otherwise parse to a number.
    setGoals(prev => ({ ...prev, [name]: value === '' ? '' : parseInt(value, 10) }));
  };

  /**
   * Saves the user's updated goals to the `user_profiles` table using an upsert operation.
   * @async
   */
  const handleSaveGoals = async () => {
    if (!user?.id) {
      // Surface the inline status message instead of a blocking alert so
      // assistive tech and page layout can display the message non-disruptively.
      setMessage('You must be logged in.');
      return;
    }

    setMessage('Saving...');
    try {
      // Prepare the payload for Supabase, converting empty strings to null.
      const updates = {
        id: user.id, // The primary key to identify the row for upserting.
        daily_calorie_goal: goals.daily_calorie_goal || null,
        daily_protein_goal: goals.daily_protein_goal || null,
        daily_carb_goal: goals.daily_carb_goal || null,
        daily_fat_goal: goals.daily_fat_goal || null,
        daily_water_goal_oz: goals.daily_water_goal_oz || null,
      };
      const { error } = await supabase.from('user_profiles').upsert(updates);

      if (error) throw error;
      
      // <-- 4. UPDATED this block -->
      setMessage(''); // Clear "Saving..." message
      setIsSuccessModalOpen(true); // Show success modal
      
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  // <-- 3. ADDED new handler function -->
  /**
   * Closes the success modal and navigates the user to the dashboard.
   */
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
        {/* Live region for assistive tech: always present but empty when no message */}
        <div className="status-message" role="status" aria-live="polite" aria-atomic="true">{message || ''}</div>
      </div>

      {/* <-- 5. ADDED the new Modal component --> */}
      <Modal
        isOpen={isSuccessModalOpen}
        onRequestClose={handleCloseSuccessModal} // Closes modal if user clicks outside
        contentLabel="Success"
        overlayClassName="custom-modal-overlay"
        className="custom-modal-content"
      >
        <div style={{textAlign: 'center'}}>
          <h2>Goals Saved!</h2>
          <div className="action-footer" style={{justifyContent: 'center'}}>
            <button 
              type="button" 
              className="save-goals-button" // Re-using your button style
              onClick={handleCloseSuccessModal}
              style={{marginTop: '1rem'}} // Added a little space
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