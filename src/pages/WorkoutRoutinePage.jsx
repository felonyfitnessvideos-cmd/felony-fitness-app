 
/**
 * @file WorkoutRoutinePage.jsx
 * @description This page displays a list of all workout routines created by the user, allowing them to manage them.
 * @project Felony Fitness
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Dumbbell, PlusCircle, Trash2, Edit, ToggleLeft, ToggleRight, Zap } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import './WorkoutRoutinePage.css';

/**
 * @typedef {object} Routine
 * @property {string} id - The UUID of the workout routine.
 * @property {string} routine_name - The name of the routine.
 * @property {boolean} is_active - Whether the routine is available for logging.
 * @property {string} created_at - The timestamp of when the routine was created.
 */

/**
 * WorkoutRoutinePage
 * Displays and manages the user's workout routines. This component assumes
 * the Supabase query returns an array; missing or unexpected shapes are
 * tolerated and an empty array is used as a fallback.
 */
function WorkoutRoutinePage() {
  const { user } = useAuth();
  const userId = user?.id;
  /** @type {[Routine[], React.Dispatch<React.SetStateAction<Routine[]>>]} */
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches all workout routines for the current user from the database.
   * @param {string} userId - The UUID of the authenticated user.
   * @async
   */
  const fetchRoutines = useCallback(async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workout_routines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching routines:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Depend only on the user's id and the stable fetchRoutines callback to
  // avoid unnecessary re-fetches when the `user` object reference changes.
  useEffect(() => {
    if (userId) {
      fetchRoutines(userId);
    } else {
      setLoading(false);
    }
  }, [userId, fetchRoutines]);

  /**
   * Deletes a specific workout routine after user confirmation.
   * @param {string} routineId - The UUID of the routine to be deleted.
   * @async
   */
  const handleDeleteRoutine = async (routineId) => {
    if (!userId) return;

    if (window.confirm('Are you sure you want to delete this routine? This cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('workout_routines')
          .delete()
          .eq('id', routineId)
          .eq('user_id', userId);

        if (error) throw error;
        fetchRoutines(userId);
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  /**
   * Toggles the `is_active` status of a workout routine.
   * @param {Routine} routine - The routine object to be updated.
   * @async
   */
  const handleToggleActive = async (routine) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('workout_routines')
        .update({ is_active: !routine.is_active })
        .eq('id', routine.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      fetchRoutines(userId);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="workout-routines-container">
      <SubPageHeader 
        title="Routines" 
        icon={<Dumbbell size={28} />} 
        iconColor="#f97316"
        backTo="/workouts" 
      />
      
      {/**
       * This section provides the primary actions for the page:
       * 1. Navigating to the "Pro Routine" selection hub.
       * 2. Navigating to the page for creating a new custom routine.
       */}
      <div className="routine-page-actions">
        <Link to="/workouts/routines/select-pro" className="action-button primary">
          <Zap size={20} />
          <span>Select Pro Routine</span>
        </Link>
        <Link to="/workouts/routines/new" className="action-button secondary">
          <PlusCircle size={20} />
          <span>Create Custom Routine</span>
        </Link>
      </div>

      <div className="routine-list">
        {loading && <p className="loading-message">Loading routines...</p>}
        {!loading && routines.map(routine => (
          <div key={routine.id} className="routine-card">
            <div className="routine-info">
              <h4>{routine.routine_name}</h4>
              <span className={`status-badge ${routine.is_active ? 'active' : 'inactive'}`}>
                {routine.is_active ? '● Active' : '● Inactive'}
              </span>
            </div>
            <div className="routine-actions">
              <button onClick={() => handleToggleActive(routine)} title={routine.is_active ? 'Deactivate' : 'Activate'}>
                {routine.is_active ? <ToggleRight size={24} color="#22c55e" /> : <ToggleLeft size={24} color="#a0aec0" />}
              </button>
              <Link to={`/workouts/routines/${routine.id}`} className="action-button" title="Edit">
                <Edit size={20} />
              </Link>
              <button onClick={() => handleDeleteRoutine(routine.id)} className="action-button danger" title="Delete">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {!loading && routines.length === 0 && (
          <p className="no-routines-message">You haven't created any routines yet. Click a button above to get started!</p>
        )}
      </div>
    </div>
  );
}

export default WorkoutRoutinePage;

