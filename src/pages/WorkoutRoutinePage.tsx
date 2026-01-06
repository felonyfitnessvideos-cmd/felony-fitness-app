 
/**
 * @file WorkoutRoutinePage.jsx
 * @description This page displays a list of all workout routines created by the user, allowing them to manage them.
 * @project Felony Fitness
 */

/**
 * WorkoutRoutinePage.jsx
 *
 * Shows a single workout routine and its exercises. Allows starting a
 * workout, duplicating or editing routines. Keep heavy mutation logic in
 * page-level handlers so components remain presentational.
 */
/**
 * WorkoutRoutinePage (doc): shows a workout routine and actions like start/duplicate.
 */
/**
 * WorkoutRoutinePage — shows a routine and allows the user to start logging.
 *
 * Responsibilities:
 * - load a routine by id
 * - render exercises and mesocycles
 * - provide navigation to the workout logger
 *
 * This file adds small runtime guards to avoid setState-on-unmounted
 * and to handle missing data during staged DB migrations.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader';
import { Dumbbell, PlusCircle, Trash2, Edit, ToggleLeft, ToggleRight, Zap, Copy } from 'lucide-react';
import { useAuth } from '../useAuth';
import { Tables } from '../database.types.js';
import './WorkoutRoutinePage.css';

type Routine = Tables<'workout_routines'>;

/**
 * WorkoutRoutinePage
 * Displays and manages the user's workout routines. This component assumes
 * the Supabase query returns an array; missing or unexpected shapes are
 * tolerated and an empty array is used as a fallback.
 */
function WorkoutRoutinePage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches all workout routines for the current user from the database.
   * @param {string} userId - The UUID of the authenticated user.
   * @async
   */
  const fetchRoutines = useCallback(async (userId: string) => {
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
   * Deletes a specific workout routine without confirmation.
   * @param {string} routineId - The UUID of the routine to be deleted.
   * @async
   */
  const handleDeleteRoutine = async (routineId: string) => {
    if (!userId) return;

    try {
      // Optimistically remove from UI immediately
      setRoutines(prev => prev.filter(r => r.id !== routineId));
      
      const { error } = await supabase
        .from('workout_routines')
        .delete()
        .eq('id', routineId)
        .eq('user_id', userId);

      if (error) {
        // Revert on error
        fetchRoutines(userId);
        throw error;
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  /**
   * Toggles the `is_active` status of a workout routine.
   * @param {Routine} routine - The routine object to be updated.
   * @async
   */
  const handleToggleActive = async (routine: Routine) => {
    if (!userId) return;

    try {
      // Optimistically update UI immediately
      setRoutines(prev => prev.map(r => 
        r.id === routine.id ? { ...r, is_active: !r.is_active } : r
      ));
      
      const { error } = await supabase
        .from('workout_routines')
        .update({ is_active: !routine.is_active })
        .eq('id', routine.id)
        .eq('user_id', userId);
      
      if (error) {
        // Revert on error
        setRoutines(prev => prev.map(r => 
          r.id === routine.id ? { ...r, is_active: routine.is_active } : r
        ));
        throw error;
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  /**
   * Duplicates a workout routine with all its exercises
   * @param {Routine} routine - The routine object to be duplicated
   * @async
   */
  const handleDuplicateRoutine = async (routine: Routine) => {
    if (!userId) return;

    try {
      // Step 1: Fetch the full routine with exercises
      const { data: fullRoutine, error: fetchError } = await supabase
        .from('workout_routines')
        .select('*, routine_exercises(*)')
        .eq('id', routine.id)
        .single();

      if (fetchError) throw fetchError;

      // Step 2: Create new routine with "(Copy)" appended to name
      const newRoutineName = `${fullRoutine.routine_name} (Copy)`;
      const { data: newRoutine, error: createError } = await supabase
        .from('workout_routines')
        .insert({
          routine_name: newRoutineName,
          user_id: userId,
          is_active: false // Duplicates start as inactive
        })
        .select('id')
        .single();

      if (createError) throw createError;

      // Step 3: Copy all exercises with their settings
      if (fullRoutine.routine_exercises && fullRoutine.routine_exercises.length > 0) {
        const exercisesToInsert = fullRoutine.routine_exercises.map(ex => ({
          routine_id: newRoutine.id,
          exercise_id: ex.exercise_id,
          target_sets: ex.target_sets,
          exercise_order: ex.exercise_order,
          is_warmup: ex.is_warmup || false
        }));

        const { error: insertError } = await supabase
          .from('routine_exercises')
          .insert(exercisesToInsert);

        if (insertError) throw insertError;
      }

      // Step 4: Add new routine to UI without refetch
      const newRoutineDisplay: Routine = {
        id: newRoutine.id,
        routine_name: newRoutineName,
        is_active: false,
        created_at: new Date().toISOString(),
        user_id: userId,
        description: null,
        difficulty_level: null,
        estimated_duration_minutes: null,
        is_public: false,
        name: null,
        routine_type: null,
        updated_at: null,
      };
      setRoutines(prev => [newRoutineDisplay, ...prev]);
    } catch (error) {
      console.error('Error duplicating routine:', error);
      alert(`Error duplicating routine: ${error.message}`);
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
              <button onClick={() => handleDuplicateRoutine(routine)} className="action-button" title="Duplicate">
                <Copy size={20} />
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

