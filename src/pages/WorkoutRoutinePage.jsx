// @ts-check

/**
 * @file WorkoutRoutinePage.jsx
 * @description This page displays a list of all workout routines created by the user, allowing them to manage them.
 * @project Felony Fitness
 *
 * @workflow
 * 1. On component mount, it checks for an authenticated user.
 * 2. It calls `fetchRoutines` to query the `workout_routines` table and retrieve all routines for that user.
 * 3. The routines are displayed in a list of cards. Each card shows the routine's name and its active status.
 * 4. Users can perform several actions on each routine:
 * - **Toggle Active**: The `handleToggleActive` function updates the `is_active` boolean in the database. Active routines are the ones that can be selected for logging.
 * - **Edit**: A link navigates the user to the `EditRoutinePage` for that specific routine.
 * - **Delete**: The `handleDeleteRoutine` function removes the routine from the database after a confirmation prompt.
 * 5. A prominent "Create New Routine" button links to the `EditRoutinePage` with a 'new' ID, signaling that a new routine should be created.
 * 6. After any create, update, or delete action, the component re-fetches the full list of routines to ensure the UI is always up-to-date.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Dumbbell, PlusCircle, Trash2, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import './WorkoutRoutinePage.css';

/**
 * @typedef {object} Routine
 * @property {string} id - The UUID of the workout routine.
 * @property {string} routine_name - The name of the routine.
 * @property {boolean} is_active - Whether the routine is available for logging.
 * @property {string} created_at - The timestamp of when the routine was created.
 */

function WorkoutRoutinePage() {
  const { user } = useAuth();
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
      setRoutines(data || []);
    } catch (error) {
      console.error('Error fetching routines:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to trigger the initial data fetch when the user session is available.
  useEffect(() => {
    if (user) {
      fetchRoutines(user.id);
    } else {
      setLoading(false);
    }
  }, [user?.id, fetchRoutines]);

  /**
   * Deletes a specific workout routine after user confirmation.
   * @param {string} routineId - The UUID of the routine to be deleted.
   * @async
   */
  const handleDeleteRoutine = async (routineId) => {
    if (window.confirm('Are you sure you want to delete this routine? This cannot be undone.')) {
      try {
        const { error } = await supabase.from('workout_routines').delete().eq('id', routineId);
        if (error) throw error;
        // Refetch routines after deletion to update the UI.
        if (user) fetchRoutines(user.id);
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
    try {
      const { error } = await supabase
        .from('workout_routines')
        .update({ is_active: !routine.is_active })
        .eq('id', routine.id);
      
      if (error) throw error;
      // Refetch routines after toggle to update the UI.
      if (user) fetchRoutines(user.id);
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
      
      <Link to="/workouts/routines/new" className="create-routine-button">
        <PlusCircle size={20} />
        <span>Create New Routine</span>
      </Link>

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
          <p className="no-routines-message">You haven't created any routines yet. Click the button above to get started!</p>
        )}
      </div>
    </div>
  );
}

export default WorkoutRoutinePage;