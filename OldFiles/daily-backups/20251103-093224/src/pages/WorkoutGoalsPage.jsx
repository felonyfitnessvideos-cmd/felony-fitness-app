/**
 * @file WorkoutGoalsPage.jsx
 * @description This page allows users to create, view, update, and delete their workout goals.
 * @project Felony Fitness
 */

/**
 * WorkoutGoalsPage (doc): manages workout-specific goals and progress.
 * Provides CRUD and simple progress visuals; backend enforces ownership.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Dumbbell, Trash2, Trophy, Edit2 } from 'lucide-react';
import Modal from 'react-modal';
import { useAuth } from '../AuthContext.jsx';
import './WorkoutGoalsPage.css';


/**
 * @typedef {object} Goal
 * @property {string} id
 * @property {string} goal_description
 * @property {number} current_value
 * @property {number} target_value
 * @property {string} target_date
 */

/**
 * Page component that lets an authenticated user create, view, edit, and delete workout goals and see simple progress visuals.
 *
 * Renders a list of the user's goals with progress bars, a modal form for adding or editing goals, and actions to update or remove goals.
 * CRUD operations are scoped to the authenticated user; the component loads goals on mount and after changes.
 * @returns {JSX.Element} The rendered Workout Goals page component.
 */

function WorkoutGoalsPage() {
  const { user } = useAuth();
  const userId = user?.id;
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

  // Depend only on the user's id and the stable fetchGoals callback. Avoid
  // depending on the full `user` object to prevent redundant fetches when
  // its reference changes without a change to identity.
  useEffect(() => {
    if (userId) {
      fetchGoals(userId);
    } else {
      setLoading(false);
    }
  }, [userId, fetchGoals]);

  /**
   * Deletes a specific goal after user confirmation.
   * The query is scoped to the user's ID for an extra layer of security.
   * @param {string} goalId - The UUID of the goal to be deleted.
   * @async
   */
  const handleDeleteGoal = async (goalId) => {
    // Guard clause to ensure a user is logged in.
    if (!user) return; 

    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        // **SECURITY FIX: Add .eq('user_id', user.id) to the query.**
        // This ensures a user can only delete goals that belong to them.
        const { error } = await supabase
          .from('goals')
          .delete()
          .eq('id', goalId)
          .eq('user_id', user.id);

        if (error) throw error;
        fetchGoals(user.id); // Re-fetch goals to update the UI
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };
  
  /**
   * Opens the modal for either creating a new goal or editing an existing one.
   * @param {Goal | null} [goal=null] - The goal object to edit. If null, the modal is in "add new" mode.
   */
  const openModal = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setNewGoal({
        goal_description: goal.goal_description,
        current_value: goal.current_value || 0,
        target_value: goal.target_value,
        target_date: goal.target_date,
      });
    } else {
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
    const { name, value, type } = e.target;
    const next = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    setNewGoal(prev => ({ ...prev, [name]: next }));
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
        const { error } = await supabase
          .from('goals')
          .update({
            goal_description: newGoal.goal_description,
            current_value: newGoal.current_value,
            target_value: newGoal.target_value,
            target_date: newGoal.target_date,
          })
          .eq('id', editingGoal.id)
          .eq('user_id', user.id); // Scope update to the current user for safety
        if (error) throw error;
      } else {
        const { error } = await supabase.from('goals').insert({ ...newGoal, user_id: user.id });
        if (error) throw error;
      }
      closeModal();
      fetchGoals(user.id);
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
        contentLabel="Goal Form"
        overlayClassName="custom-modal-overlay"
        className="custom-modal-content"
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
              <input name="current_value" type="number" min="0" step="any" value={newGoal.current_value} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Target Value</label>
              <input name="target_value" type="number" min="0" step="any" value={newGoal.target_value} onChange={handleInputChange} required />
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

/** Audited: 2025-10-25 — JSDoc batch 9 */
