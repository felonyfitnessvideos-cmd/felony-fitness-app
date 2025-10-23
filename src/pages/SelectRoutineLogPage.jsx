 
/**
 * @file SelectRoutineLogPage.jsx
 * @description This page displays a list of the user's active workout routines, allowing them to select one to start logging a workout.
 * @project Felony Fitness
 *
 * @workflow
 * 1. On component mount, it checks for an authenticated user.
 * 2. It calls `fetchActiveRoutines` to query the `workout_routines` table for routines where `is_active` is true.
 * 3. The query also gets a `count` of the exercises associated with each routine for efficient display.
 * 4. The fetched routines are displayed as a list of clickable cards.
 * 5. When a user clicks a routine, `handleSelectRoutine` navigates them to the `WorkoutLogPage` with the corresponding routine ID in the URL.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Dumbbell, ChevronRight } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import './SelectRoutineLogPage.css';

/**
 * @typedef {object} RoutineSummary
 * @property {string} id - The UUID of the workout routine.
 * @property {string} routine_name - The name of the routine.
 * @property {Array<{count: number}>} routine_exercises - An array containing an object with the count of exercises for the routine.
 */

/**
 * @component SelectRoutineLogPage
 * @description Renders a page where users can select one of their active workout routines to begin a logging session.
 * @returns {JSX.Element} The rendered component.
 */
function SelectRoutineLogPage() {
  /**
   * @state
   * @description Accesses the authenticated user's data from the global AuthContext.
   */
  const { user } = useAuth();
  const userId = user?.id;
  
  /**
   * @state {RoutineSummary[]} activeRoutines - Stores the list of active workout routines fetched from the database.
   * @type {[RoutineSummary[], React.Dispatch<React.SetStateAction<RoutineSummary[]>>]}
   */
  const [activeRoutines, setActiveRoutines] = useState([]);
  
  /**
   * @state {boolean} loading - Manages the loading state while fetching routines from the database.
   */
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  /**
   * @function fetchActiveRoutines
   * @description Fetches a user's active workout routines from the database, including a count of exercises for each.
   * @param {string} userId - The UUID of the currently authenticated user.
   * @async
   */
  const fetchActiveRoutines = useCallback(async (userId) => {
    setLoading(true);
    try {
      // This query efficiently fetches only the necessary data: the routine's name and a count of its exercises.
      const { data, error } = await supabase
        .from('workout_routines')
        .select(`id, routine_name, routine_exercises(count)`)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveRoutines(data || []);
    } catch (error) {
      console.error('Error fetching active routines:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * @effect
   * @description Triggers the `fetchActiveRoutines` function once the user object is available.
   */
  // Only depend on user id and the stable fetchActiveRoutines callback to
  // avoid unnecessary re-fetches when the user object reference changes.
  useEffect(() => {
    if (userId) {
      fetchActiveRoutines(userId);
    } else {
      // If no user is found, stop the loading state.
      setLoading(false);
    }
  }, [userId, fetchActiveRoutines]);

  /**
   * @function handleSelectRoutine
   * @description Navigates the user to the workout logging page for the selected routine.
   * @param {string} routineId - The UUID of the routine to log.
   */
  const handleSelectRoutine = (routineId) => {
    navigate(`/log-workout/${routineId}`);
  };

  return (
    <div className="select-routine-page-container">
      <SubPageHeader title="Select Routine" icon={<Dumbbell size={28} />} iconColor="#f97316" backTo="/workouts" />

      <div className="routine-selection-list">
        {/* Display a loading message while data is being fetched */}
        {loading && <p className="loading-message">Loading active routines...</p>}

        {/* Once loading is complete, map over and display the active routines */}
        {!loading && activeRoutines.map(routine => (
          <button
            key={routine.id}
            className="routine-selection-card"
            onClick={() => handleSelectRoutine(routine.id)}
            aria-label={`Select ${routine.routine_name} routine to log`}
          >
            <div className="routine-card-info">
              <h3>{routine.routine_name}</h3>
              {/* The exercise count comes from the Supabase query's relation count */}
              <span>{routine.routine_exercises[0]?.count || 0} exercises</span>
            </div>
            <ChevronRight size={24} className="arrow-icon" />
          </button>
        ))}

        {/* If loading is done and no routines are found, display a helpful message */}
        {!loading && activeRoutines.length === 0 && (
          <p className="no-routines-message">
            You don't have any active routines. Go to the "Routines" page to create or activate one.
          </p>
        )}
      </div>
    </div>
  );
}

export default SelectRoutineLogPage;