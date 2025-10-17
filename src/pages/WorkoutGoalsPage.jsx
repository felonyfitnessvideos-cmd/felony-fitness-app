// @ts-check

/**
 * @file WorkoutGoalsPage.jsx
 * @description This page allows users to create, view, update, and delete their workout goals.
 * @project Felony Fitness
 *
 * @workflow
 * 1. On component mount, it fetches all existing goals for the authenticated user from the `goals` table.
 * 2. It displays the goals in a list of cards, each showing the goal's description, progress, and target date.
 * 3. Users can click an "Add Goal" button or an "Edit" button on an existing goal, which opens a modal.
 * 4. The modal contains a form that is used for both creating new goals and editing existing ones.
 * 5. State (`editingGoal`) is used to determine if the modal is in "edit" or "create" mode.
 * 6. Submitting the form calls `handleSaveGoal`, which performs either an `insert` or an `update` operation in the Supabase `goals` table.
 * 7. Users can also delete goals, which triggers a confirmation prompt before sending a `delete` request.
 * 8. After any create, update, or delete operation, the component re-fetches the list of goals to ensure the UI is up-to-date.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Dumbbell, Trash2, Trophy, Edit2 } from 'lucide-react';
import Modal from 'react-modal';
import { useAuth } from '../AuthContext.jsx';
import './WorkoutGoalsPage.css';

// Defines the styles for the modal pop-up.
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
 * @typedef {object} Goal
 * @property {string} id
 * @property {string} goal_description
 * @property {number} current_value
 * @property {number} target_value
 * @property {string} target_date
 */

/**
 * @typedef {object} NewGoal
 * @property {string} goal_description
 * @property {number} current_value
 * @property {string | number} target_value
 * @property {string} target_date
 */

function WorkoutGoalsPage() {
  const { user } = useAuth();
  /** @type {[Goal[], React.Dispatch<React.SetStateAction<Goal[]>>]} */
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  /** @type {[Goal | null, React.Dispatch<React.SetStateAction<Goal | null>>]} */
  const [editingGoal, setEditingGoal] = useState(null);
  /** @type {[NewGoal, React.Dispatch<React.SetStateAction<NewGoal>>]} */
  const [newGoal, setNewGoal] = useState({
    goal_description: '', current_value: 0, target_value: '', target_date: ''
  });

  /**
   * Fetches all goals for the current user from the database.
   * @param {string} userId - The UUID of the authenticated user.
   * @async
   */
  const fetchGoals = useCallback(async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('goals').select('*').eq('user_id', userId);
      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to trigger the initial data fetch when the user session is available.
  useEffect(() => {
    if (user) {
      fetchGoals(user.id);
    } else {
      setLoading(false);
    }
  }, [user?.id, fetchGoals]);

  /**
   * Deletes a specific goal after user confirmation.
   * @param {string} goalId - The UUID of the goal to be deleted.
   * @async
   */
  const handleDeleteGoal = async (goalId) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        const { error } = await supabase.from('goals').delete().eq('id', goalId);
        if (error) throw error;
        if (user) fetchGoals(user.id); // Re-fetch goals to update the UI
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };
  
  /**
   * Opens the modal for either creating a new goal or editing an existing one.
   * @param {Goal | null} [goal=null] - The goal object to edit. If null, the modal will be in "add new" mode.
   */
  const openModal = (goal = null) => {
    if (goal) {
      // If a goal is passed, we are in "edit" mode.
      setEditingGoal(goal);
      setNewGoal({
        goal_description: goal.goal_description,
        current_value: goal.current_value || 0,
        target_value: goal.target_value,
        target_date: goal.target_date,
      });
    } else {
      // If no goal is passed, we are in "create" mode.
      setEditingGoal(null);
      setNewGoal({ goal_description: '', current_value: 0, target_value: '', target_date: '' });
    }
    setIsModalOpen(true);
  };

  /** Closes the modal and resets its state. */
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  /**
   * Handles changes to the form inputs within the modal.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles the form submission to either create a new goal or update an existing one.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   * @async
   */
  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in.");
    try {
      if (editingGoal) {
        // If we are editing, perform an update operation.
        const { error } = await supabase
          .from('goals')
          .update({
            goal_description: newGoal.goal_description,
            current_value: newGoal.current_value,
            target_value: newGoal.target_value,
            target_date: newGoal.target_date,
          })
          .eq('id', editingGoal.id);
        if (error) throw error;
      } else {
        // If we are not editing, perform an insert operation.
        const { error } = await supabase.from('goals').insert({ ...newGoal, user_id: user.id });
        if (error) throw error;
      }
      closeModal();
      if (user) fetchGoals(user.id); // Re-fetch to show the new/updated goal
    } catch (error) {
      alert(`Error saving goal: ${error.message}`);
    }
  };

  if (loading) return <div style={{color: 'white', padding: '2rem'}}>Loading Goals...</div>

  return (
    <div className="goals-container">
      <SubPageHeader title="Workout Goals" icon={<Dumbbell size={28} />} iconColor="#f97316" backTo="/workouts"/>
      
      <div className="goals-header">
        <p>Set and track your fitness goals</p>
        <button className="add-goal-button" onClick={() => openModal()}>+ Add Goal</button>
      </div>

      <div className="goals-list">
        {goals.length > 0 ? goals.map(goal => {
          const progress = goal.target_value > 0 ? ((goal.current_value || 0) / goal.target_value) * 100 : 0;
          return (
            <div key={goal.id} className="goal-card">
              <div className="goal-card-header">
                <div className="goal-title-group">
                  <Trophy size={20} color="#f97316" />
                  <div className="goal-titles">
                    <h3>{goal.goal_description}</h3>
                  </div>
                </div>
                <div className="goal-target-date">
                  <span className="label">Target Date</span>
                  <span>{goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              
              <div className="goal-progress">
                <div className="progress-info">
                  <span>Progress</span>
                  <span>{goal.current_value || 0} / {goal.target_value || 'N/A'}</span>
                </div>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="progress-percent">{progress.toFixed(0)}%</span>
              </div>

              <div className="goal-actions">
                <button className="action-btn" onClick={() => openModal(goal)}>
                  <Edit2 size={18} />
                </button>
                <button className="action-btn danger" onClick={() => handleDeleteGoal(goal.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )
        }) : (
          !loading && <p className="no-goals-message">You haven't set any goals yet. Click the button above to add one!</p>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={customModalStyles}
        contentLabel="Goal Form"
        appElement={document.getElementById('root')}
      >
        <h2>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
        <form onSubmit={handleSaveGoal}>
          <div className="form-group">
            <label>Goal Description</label>
            <input name="goal_description" value={newGoal.goal_description} onChange={handleInputChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Current Value</label>
              <input name="current_value" type="number" value={newGoal.current_value} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Target Value</label>
              <input name="target_value" type="number" value={newGoal.target_value} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Target Date</label>
            <input name="target_date" type="date" value={newGoal.target_date} onChange={handleInputChange} />
          </div>
          <div className="action-footer">
            <button type="button" className="cancel-button" onClick={closeModal}>Cancel</button>
            <button type="submit" className="save-button">Save Goal</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default WorkoutGoalsPage;