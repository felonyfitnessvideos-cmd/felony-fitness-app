/**
 * @file TrainerAdminPanel.tsx
 * @description Admin panel for trainers to manage pro-routines, meals, and exercises
 * Only accessible to users with is_admin = true in user_profiles table
 * @project Felony Fitness
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './TrainerAdminPanel.css';

interface Meal {
  id?: string;
  name: string;
  description?: string;
  category?: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  serving_size?: number;
  difficulty_level?: number;
  instructions?: string;
  image_url?: string;
  is_favorite?: boolean;
  is_public?: boolean;
  is_premade?: boolean;
  tags?: string[];
}

interface ProRoutine {
  id?: string;
  user_id?: string;
  routine_name: string;
  name?: string;
  description?: string;
  estimated_duration_minutes?: number;
  difficulty_level?: string;
  routine_type?: string;
  is_active?: boolean;
  is_public?: boolean;
  category?: string;
}

interface ProRoutineExercise {
  routine_id: string;
  exercise_id: string;
  target_sets?: number;
  sets?: number;
  reps?: string;
  weight_kg?: number;
  rest_seconds?: number;
  notes?: string;
  exercise_order?: number;
  is_warmup?: boolean;
  target_reps?: string;
  target_intensity_pct?: number;
}

interface WorkoutLog {
  user_id?: string;
  routine_id?: string;
  workout_name?: string;
  log_date: string;
  started_at?: string;
  ended_at?: string;
  duration_minutes?: number;
  total_volume_kg?: number;
  total_reps?: number;
  calories_burned?: number;
  is_complete?: boolean;
  notes?: string;
  mood_rating?: number;
}

const TrainerAdminPanel = () => {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'meals' | 'routines' | 'exercises' | 'workoutlogs'>('meals');
  const [loading, setLoading] = useState(false);

  // Meal form state
  const [mealForm, setMealForm] = useState<Meal>({
    name: '',
    description: '',
    category: '',
    prep_time_minutes: 0,
    cook_time_minutes: 0,
    serving_size: 1,
    difficulty_level: 1,
    instructions: '',
    image_url: '',
    is_favorite: false,
    is_public: true,
    is_premade: true,
    tags: [],
  });

  // Pro-routine form state
  const [routineForm, setRoutineForm] = useState<ProRoutine>({
    routine_name: '',
    name: '',
    description: '',
    estimated_duration_minutes: 60,
    difficulty_level: 'Intermediate',
    routine_type: 'Strength',
    is_active: true,
    is_public: true,
    category: 'Strength',
  });

  // Pro-routine exercises state
  const [exercises, setExercises] = useState<Array<{ id: string; name: string }>>([]);
  const [currentRoutineId, setCurrentRoutineId] = useState<string | null>(null);
  const [exerciseForm, setExerciseForm] = useState<ProRoutineExercise>({
    routine_id: '',
    exercise_id: '',
    target_sets: 3,
    reps: '8-12',
    weight_kg: 0,
    rest_seconds: 60,
    exercise_order: 1,
    is_warmup: false,
    target_intensity_pct: 75,
  });

  // Workout logs state
  const [users, setUsers] = useState<Array<{ id: string; email: string; first_name?: string; last_name?: string }>>([]);
  const [workoutRoutines, setWorkoutRoutines] = useState<Array<{ id: string; routine_name: string }>>([]);
  const [_allExercises, _setAllExercises] = useState<Array<{ id: string; name: string; primary_muscle?: string }>>([]);
  const [workoutLogForm, setWorkoutLogForm] = useState<WorkoutLog>({
    user_id: '',
    routine_id: '',
    workout_name: '',
    log_date: new Date().toISOString().split('T')[0],
    started_at: '',
    ended_at: '',
    duration_minutes: 60,
    total_volume_kg: 0,
    total_reps: 0,
    calories_burned: 0,
    is_complete: true,
    notes: '',
    mood_rating: 3,
  });

  // Mini workout log entries state
  const [logEntries, setLogEntries] = useState<Array<{
    _tempId?: string;
    exercise_id: string;
    exercise_name?: string;
    set_number: number;
    reps_completed: number | string;
    weight_lbs: number | string;
    rpe_rating?: number;
  }>>([]);
  const [selectedExerciseForLog, setSelectedExerciseForLog] = useState('');
  const [nextSetNumber, setNextSetNumber] = useState(1);
  const [routineExercises, setRoutineExercises] = useState<Array<{ id: string; name: string; primary_muscle?: string }>>([]);
  const [lastWeight, setLastWeight] = useState<number | string>('');
  const [lastReps, setLastReps] = useState<number | string>('');

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Check if user is admin on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: authUser } = await supabase.auth.getUser();
        if (!authUser?.user) return;

        setUser(authUser.user);

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('is_admin')
          .eq('id', authUser.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          return;
        }

        setIsAdmin(profile?.is_admin || false);
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to verify admin status');
      }
    };

    checkAdminStatus();
  }, []);

  // Fetch exercises for dropdown
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('exercises')
          .select('id, name')
          .order('name');

        if (fetchError) throw fetchError;
        setExercises(data || []);
      } catch (err) {
        console.error('Error fetching exercises:', err);
      }
    };

    if (activeTab === 'exercises') {
      fetchExercises();
    }
  }, [activeTab]);

  // Fetch users when workoutlogs tab is active
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('user_profiles')
          .select('id, email, first_name, last_name')
          .order('email');

        if (usersError) throw usersError;
        setUsers(usersData || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    if (activeTab === 'workoutlogs') {
      fetchUsers();
    }
  }, [activeTab]);

  // Load user's routines when user is selected
  useEffect(() => {
    const loadUserRoutines = async () => {
      if (!workoutLogForm.user_id) {
        setWorkoutRoutines([]);
        setWorkoutLogForm(prev => ({ ...prev, routine_id: '' }));
        return;
      }

      try {
        const { data: routinesData, error: routinesError } = await supabase
          .from('workout_routines')
          .select('id, routine_name')
          .eq('user_id', workoutLogForm.user_id)
          .order('routine_name');

        if (routinesError) throw routinesError;
        setWorkoutRoutines(routinesData || []);
        setWorkoutLogForm(prev => ({ ...prev, routine_id: '' }));
      } catch (err) {
        console.error('Error fetching user routines:', err);
      }
    };

    loadUserRoutines();
  }, [workoutLogForm.user_id]);

  // Load exercises from selected routine
  useEffect(() => {
    const loadRoutineExercises = async () => {
      if (!workoutLogForm.routine_id) {
        setRoutineExercises([]);
        setSelectedExerciseForLog('');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('routine_exercises')
          .select('exercise:exercises(id, name, primary_muscle)')
          .eq('routine_id', workoutLogForm.routine_id)
          .order('exercise_order');

        if (error) throw error;

        // Flatten the nested exercise data
        const exercises = data
          ?.map((item: { exercise: { id: string; name: string; primary_muscle?: string } }) => item.exercise)
          .filter(Boolean) || [];

        setRoutineExercises(exercises);
        setSelectedExerciseForLog('');
        setLogEntries([]);
        setNextSetNumber(1);
      } catch (err) {
        console.error('Error fetching routine exercises:', err);
      }
    };

    loadRoutineExercises();
  }, [workoutLogForm.routine_id]);

  const handleMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: insertError } = await supabase.from('meals').insert([
        {
          ...mealForm,
          user_id: user?.id,
        },
      ]);

      if (insertError) throw insertError;

      setSuccessMessage('Meal created successfully!');
      setMealForm({
        name: '',
        description: '',
        category: '',
        prep_time_minutes: 0,
        cook_time_minutes: 0,
        serving_size: 1,
        difficulty_level: 1,
        instructions: '',
        image_url: '',
        is_favorite: false,
        is_public: true,
        is_premade: true,
        tags: [],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to create meal: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRoutineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data: insertedRoutine, error: insertError } = await supabase
        .from('pro_routines')
        .insert([
          {
            ...routineForm,
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      setCurrentRoutineId(insertedRoutine?.id);
      setSuccessMessage('Pro-routine created! You can now add exercises.');
      setRoutineForm({
        routine_name: '',
        name: '',
        description: '',
        estimated_duration_minutes: 60,
        difficulty_level: 'Intermediate',
        routine_type: 'Strength',
        is_active: true,
        is_public: true,
        category: 'Strength',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to create pro-routine: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!currentRoutineId) {
        setError('Please create a pro-routine first');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('pro_routine_exercises')
        .insert([
          {
            ...exerciseForm,
            routine_id: currentRoutineId,
          },
        ]);

      if (insertError) throw insertError;

      setSuccessMessage('Exercise added to routine!');
      setExerciseForm({
        routine_id: currentRoutineId,
        exercise_id: '',
        target_sets: 3,
        reps: '8-12',
        weight_kg: 0,
        rest_seconds: 60,
        exercise_order: 1,
        is_warmup: false,
        target_intensity_pct: 75,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to add exercise: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!workoutLogForm.user_id) {
        setError('Please select a user');
        setLoading(false);
        return;
      }

      // Only send fields that exist in the database
      const workoutLogData = {
        user_id: workoutLogForm.user_id,
        routine_id: workoutLogForm.routine_id || null,
        workout_name: workoutLogForm.workout_name || null,
        log_date: workoutLogForm.log_date,
        started_at: workoutLogForm.started_at || null,
        ended_at: workoutLogForm.ended_at || null,
        duration_minutes: workoutLogForm.duration_minutes || null,
        is_complete: workoutLogForm.is_complete,
        notes: workoutLogForm.notes || null,
        mood_rating: workoutLogForm.mood_rating || null,
      };

      const { data: logData, error: insertError } = await supabase.from('workout_logs').insert([
        workoutLogData,
      ]).select();

      if (insertError) {
        console.error('❌ Workout log insert error:', {
          message: insertError.message,
          code: insertError.code,
          hint: (insertError as { hint?: string }).hint,
          details: (insertError as { details?: string }).details,
          fullError: insertError,
        });
        throw insertError;
      }
      if (!logData || logData.length === 0) throw new Error('Failed to create workout log');

      const workoutLogId = logData[0].id;
      console.log('✅ Workout log created successfully:', { workoutLogId, user_id: workoutLogForm.user_id, routine_id: workoutLogForm.routine_id });

      // Insert log entries if any were added
      if (logEntries.length > 0) {
        const entriesToInsert = logEntries.map(entry => ({
          workout_log_id: workoutLogId,
          exercise_id: entry.exercise_id,
          set_number: entry.set_number,
          reps_completed: entry.reps_completed ? parseInt(String(entry.reps_completed)) : 0,
          weight_lbs: entry.weight_lbs ? parseFloat(String(entry.weight_lbs)) : 0,
          rpe_rating: entry.rpe_rating || null,
          completed: true,
        }));

        const { error: entriesError } = await supabase.from('workout_log_entries').insert(entriesToInsert);
        if (entriesError) {
          console.error('❌ Workout log entries insert error:', {
            message: entriesError.message,
            code: entriesError.code,
            hint: (entriesError as { hint?: string }).hint,
            details: (entriesError as { details?: string }).details,
            fullError: entriesError,
            entriesToInsert,
            workoutLogId,
          });
          throw entriesError;
        }
        console.log('✅ Workout log entries inserted successfully:', { count: entriesToInsert.length, workoutLogId });
      }

      setSuccessMessage(`Workout log created successfully with ${logEntries.length} exercise entries!`);
      setWorkoutLogForm({
        user_id: '',
        routine_id: '',
        workout_name: '',
        log_date: new Date().toISOString().split('T')[0],
        started_at: '',
        ended_at: '',
        duration_minutes: 60,
        total_volume_kg: 0,
        total_reps: 0,
        calories_burned: 0,
        is_complete: true,
        notes: '',
        mood_rating: 3,
      });
      setLogEntries([]);
      setNextSetNumber(1);
      setSelectedExerciseForLog('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to create workout log: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Add a new set to the mini log
  const handleAddSetToLog = () => {
    if (!selectedExerciseForLog) {
      setError('Please select an exercise');
      return;
    }

    const exercise = routineExercises.find(ex => ex.id === selectedExerciseForLog);
    const newEntry = {
      _tempId: `${Date.now()}-${Math.random()}`,
      exercise_id: selectedExerciseForLog,
      exercise_name: exercise?.name || '',
      set_number: nextSetNumber,
      reps_completed: lastReps,
      weight_lbs: lastWeight,
      rpe_rating: 5,
    };

    setLogEntries([...logEntries, newEntry]);
    setNextSetNumber(nextSetNumber + 1);
  };

  // Remove a set from the mini log
  const handleRemoveSetFromLog = (tempId: string | undefined) => {
    setLogEntries(logEntries.filter(entry => entry._tempId !== tempId));
  };

  // Update a log entry and persist weight/reps for next set
  const handleUpdateLogEntry = (tempId: string | undefined, field: string, value: string | number) => {
    setLogEntries(logEntries.map(entry => 
      entry._tempId === tempId ? { ...entry, [field]: value } : entry
    ));
    
    // Persist weight and reps for next set
    if (field === 'weight_lbs') {
      setLastWeight(value);
    }
    if (field === 'reps_completed') {
      setLastReps(value);
    }
  };

  if (!isAdmin) {
    return (
      <div className="trainer-admin-panel">
        <h1>Access Denied</h1>
        <p className="error-message">You do not have admin privileges to access this panel.</p>
      </div>
    );
  }

  return (
    <div className="trainer-admin-panel">
      <h1>Admin Management Panel</h1>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'meals' ? 'active' : ''}`}
          onClick={() => setActiveTab('meals')}
        >
          Meals
        </button>
        <button
          className={`tab-button ${activeTab === 'routines' ? 'active' : ''}`}
          onClick={() => setActiveTab('routines')}
        >
          Pro-Routines
        </button>
        <button
          className={`tab-button ${activeTab === 'exercises' ? 'active' : ''}`}
          onClick={() => setActiveTab('exercises')}
        >
          Exercises
        </button>
        <button
          className={`tab-button ${activeTab === 'workoutlogs' ? 'active' : ''}`}
          onClick={() => setActiveTab('workoutlogs')}
        >
          Workout Logs
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'meals' && (
          <form onSubmit={handleMealSubmit} className="admin-form">
            <h2>Create Meal</h2>

            <div className="form-group">
              <label htmlFor="meal-name">Meal Name *</label>
              <input
                id="meal-name"
                type="text"
                value={mealForm.name}
                onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="meal-description">Description</label>
              <textarea
                id="meal-description"
                value={mealForm.description || ''}
                onChange={(e) => setMealForm({ ...mealForm, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="meal-category">Category</label>
                <input
                  id="meal-category"
                  type="text"
                  value={mealForm.category || ''}
                  onChange={(e) => setMealForm({ ...mealForm, category: e.target.value })}
                  placeholder="e.g., Breakfast, Lunch, Dinner"
                />
              </div>

              <div className="form-group">
                <label htmlFor="meal-difficulty">Difficulty Level (1-5)</label>
                <input
                  id="meal-difficulty"
                  type="number"
                  min="1"
                  max="5"
                  value={mealForm.difficulty_level || 1}
                  onChange={(e) => setMealForm({ ...mealForm, difficulty_level: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="meal-prep-time">Prep Time (minutes)</label>
                <input
                  id="meal-prep-time"
                  type="number"
                  value={mealForm.prep_time_minutes || 0}
                  onChange={(e) => setMealForm({ ...mealForm, prep_time_minutes: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="meal-cook-time">Cook Time (minutes)</label>
                <input
                  id="meal-cook-time"
                  type="number"
                  value={mealForm.cook_time_minutes || 0}
                  onChange={(e) => setMealForm({ ...mealForm, cook_time_minutes: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="meal-serving">Serving Size</label>
                <input
                  id="meal-serving"
                  type="number"
                  value={mealForm.serving_size || 1}
                  onChange={(e) => setMealForm({ ...mealForm, serving_size: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="meal-instructions">Instructions</label>
              <textarea
                id="meal-instructions"
                value={mealForm.instructions || ''}
                onChange={(e) => setMealForm({ ...mealForm, instructions: e.target.value })}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="meal-image">Image URL</label>
              <input
                id="meal-image"
                type="url"
                value={mealForm.image_url || ''}
                onChange={(e) => setMealForm({ ...mealForm, image_url: e.target.value })}
              />
            </div>

            <div className="form-row checkbox-row">
              <div className="checkbox-group">
                <input
                  id="meal-public"
                  type="checkbox"
                  checked={mealForm.is_public || false}
                  onChange={(e) => setMealForm({ ...mealForm, is_public: e.target.checked })}
                />
                <label htmlFor="meal-public">Make Public</label>
              </div>

              <div className="checkbox-group">
                <input
                  id="meal-premade"
                  type="checkbox"
                  checked={mealForm.is_premade || false}
                  onChange={(e) => setMealForm({ ...mealForm, is_premade: e.target.checked })}
                />
                <label htmlFor="meal-premade">Pre-made Meal</label>
              </div>

              <div className="checkbox-group">
                <input
                  id="meal-favorite"
                  type="checkbox"
                  checked={mealForm.is_favorite || false}
                  onChange={(e) => setMealForm({ ...mealForm, is_favorite: e.target.checked })}
                />
                <label htmlFor="meal-favorite">Favorite</label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Creating...' : 'Create Meal'}
            </button>
          </form>
        )}

        {activeTab === 'routines' && (
          <form onSubmit={handleRoutineSubmit} className="admin-form">
            <h2>Create Pro-Routine</h2>

            <div className="form-group">
              <label htmlFor="routine-name">Routine Name *</label>
              <input
                id="routine-name"
                type="text"
                value={routineForm.routine_name}
                onChange={(e) => setRoutineForm({ ...routineForm, routine_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="routine-display-name">Display Name</label>
              <input
                id="routine-display-name"
                type="text"
                value={routineForm.name || ''}
                onChange={(e) => setRoutineForm({ ...routineForm, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="routine-description">Description</label>
              <textarea
                id="routine-description"
                value={routineForm.description || ''}
                onChange={(e) => setRoutineForm({ ...routineForm, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="routine-duration">Estimated Duration (minutes)</label>
                <input
                  id="routine-duration"
                  type="number"
                  value={routineForm.estimated_duration_minutes || 60}
                  onChange={(e) => setRoutineForm({ ...routineForm, estimated_duration_minutes: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="routine-difficulty">Difficulty Level</label>
                <select
                  id="routine-difficulty"
                  value={routineForm.difficulty_level || 'Intermediate'}
                  onChange={(e) => setRoutineForm({ ...routineForm, difficulty_level: e.target.value })}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="routine-type">Routine Type</label>
                <select
                  id="routine-type"
                  value={routineForm.routine_type || 'Strength'}
                  onChange={(e) => setRoutineForm({ ...routineForm, routine_type: e.target.value })}
                >
                  <option>Strength</option>
                  <option>Hypertrophy</option>
                  <option>Endurance</option>
                  <option>Interval</option>
                  <option>Bodyweight</option>
                  <option>Challenges</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="routine-category">Category</label>
              <select
                id="routine-category"
                value={routineForm.category || 'Strength'}
                onChange={(e) => setRoutineForm({ ...routineForm, category: e.target.value })}
              >
                <option>Strength</option>
                <option>Hypertrophy</option>
                <option>Endurance</option>
                <option>Interval</option>
                <option>Bodyweight</option>
                <option>Challenges</option>
              </select>
            </div>

            <div className="form-row checkbox-row">
              <div className="checkbox-group">
                <input
                  id="routine-active"
                  type="checkbox"
                  checked={routineForm.is_active || false}
                  onChange={(e) => setRoutineForm({ ...routineForm, is_active: e.target.checked })}
                />
                <label htmlFor="routine-active">Active</label>
              </div>

              <div className="checkbox-group">
                <input
                  id="routine-public"
                  type="checkbox"
                  checked={routineForm.is_public || false}
                  onChange={(e) => setRoutineForm({ ...routineForm, is_public: e.target.checked })}
                />
                <label htmlFor="routine-public">Public</label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Creating...' : 'Create Pro-Routine'}
            </button>

            {currentRoutineId && (
              <p className="info-message">
                Routine ID: {currentRoutineId} - You can now add exercises below
              </p>
            )}
          </form>
        )}

        {activeTab === 'exercises' && (
          <form onSubmit={handleExerciseSubmit} className="admin-form">
            <h2>Add Exercise to Routine</h2>

            {!currentRoutineId && (
              <p className="warning-message">Please create a pro-routine first before adding exercises.</p>
            )}

            {currentRoutineId && (
              <p className="info-message">Adding exercises to routine: {currentRoutineId}</p>
            )}

            <div className="form-group">
              <label htmlFor="exercise-select">Exercise *</label>
              <select
                id="exercise-select"
                value={exerciseForm.exercise_id}
                onChange={(e) => setExerciseForm({ ...exerciseForm, exercise_id: e.target.value })}
                required
              >
                <option value="">Select an exercise...</option>
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="exercise-target-sets">Target Sets</label>
                <input
                  id="exercise-target-sets"
                  type="number"
                  min="1"
                  value={exerciseForm.target_sets || 3}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, target_sets: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="exercise-reps">Reps (e.g., 8-12)</label>
                <input
                  id="exercise-reps"
                  type="text"
                  value={exerciseForm.reps || '8-12'}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="exercise-weight">Weight (kg)</label>
                <input
                  id="exercise-weight"
                  type="number"
                  step="0.5"
                  value={exerciseForm.weight_kg || 0}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, weight_kg: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="exercise-rest">Rest (seconds)</label>
                <input
                  id="exercise-rest"
                  type="number"
                  min="0"
                  value={exerciseForm.rest_seconds || 60}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, rest_seconds: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="exercise-intensity">Target Intensity %</label>
                <input
                  id="exercise-intensity"
                  type="number"
                  min="0"
                  max="100"
                  value={exerciseForm.target_intensity_pct || 75}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, target_intensity_pct: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="exercise-order">Exercise Order</label>
                <input
                  id="exercise-order"
                  type="number"
                  min="1"
                  value={exerciseForm.exercise_order || 1}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, exercise_order: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="exercise-notes">Notes</label>
              <textarea
                id="exercise-notes"
                value={exerciseForm.notes || ''}
                onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="form-row checkbox-row">
              <div className="checkbox-group">
                <input
                  id="exercise-warmup"
                  type="checkbox"
                  checked={exerciseForm.is_warmup || false}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, is_warmup: e.target.checked })}
                />
                <label htmlFor="exercise-warmup">Warmup Set</label>
              </div>
            </div>

            <button type="submit" disabled={loading || !currentRoutineId} className="submit-button">
              {loading ? 'Adding...' : 'Add Exercise'}
            </button>
          </form>
        )}

        {activeTab === 'workoutlogs' && (
          <form onSubmit={handleWorkoutLogSubmit} className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="log-user">User *</label>
                <select
                  id="log-user"
                  value={workoutLogForm.user_id || ''}
                  onChange={(e) => setWorkoutLogForm({ ...workoutLogForm, user_id: e.target.value })}
                  required
                >
                  <option value="">Select a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="log-routine">Routine</label>
                <select
                  id="log-routine"
                  value={workoutLogForm.routine_id || ''}
                  onChange={(e) => setWorkoutLogForm({ ...workoutLogForm, routine_id: e.target.value })}
                >
                  <option value="">Select a routine...</option>
                  {workoutRoutines.map((routine) => (
                    <option key={routine.id} value={routine.id}>
                      {routine.routine_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="log-date">Workout Date *</label>
                <input
                  id="log-date"
                  type="date"
                  value={workoutLogForm.log_date}
                  onChange={(e) => setWorkoutLogForm({ ...workoutLogForm, log_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="log-name">Workout Name</label>
                <input
                  id="log-name"
                  type="text"
                  placeholder="e.g., Upper Body Strength"
                  value={workoutLogForm.workout_name || ''}
                  onChange={(e) => setWorkoutLogForm({ ...workoutLogForm, workout_name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="log-start-time">Start Time</label>
                <input
                  id="log-start-time"
                  type="time"
                  value={workoutLogForm.started_at || ''}
                  onChange={(e) => setWorkoutLogForm({ ...workoutLogForm, started_at: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="log-end-time">End Time</label>
                <input
                  id="log-end-time"
                  type="time"
                  value={workoutLogForm.ended_at || ''}
                  onChange={(e) => setWorkoutLogForm({ ...workoutLogForm, ended_at: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="log-duration">Duration (minutes)</label>
                <input
                  id="log-duration"
                  type="number"
                  min="0"
                  value={workoutLogForm.duration_minutes || 60}
                  onChange={(e) => setWorkoutLogForm({ ...workoutLogForm, duration_minutes: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="log-volume">Total Volume (kg)</label>
                <input
                  id="log-volume"
                  type="number"
                  step="0.5"
                  value={workoutLogForm.total_volume_kg || 0}
                  onChange={(e) => setWorkoutLogForm({ ...workoutLogForm, total_volume_kg: parseFloat(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="log-reps">Total Reps</label>
                <input
                  id="log-reps"
                  type="number"
                  min="0"
                  value={workoutLogForm.total_reps || 0}
                  onChange={(e) => setWorkoutLogForm({ ...workoutLogForm, total_reps: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="log-calories">Calories Burned</label>
                <input
                  id="log-calories"
                  type="number"
                  min="0"
                  value={workoutLogForm.calories_burned || 0}
                  onChange={(e) => setWorkoutLogForm({ ...workoutLogForm, calories_burned: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="log-mood">Mood Rating (1-5)</label>
                <select
                  id="log-mood"
                  value={workoutLogForm.mood_rating || 3}
                  onChange={(e) => setWorkoutLogForm({ ...workoutLogForm, mood_rating: parseInt(e.target.value) })}
                >
                  <option value="1">1 - Very Poor</option>
                  <option value="2">2 - Poor</option>
                  <option value="3">3 - Average</option>
                  <option value="4">4 - Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="log-notes">Notes</label>
              <textarea
                id="log-notes"
                placeholder="Any additional notes about the workout..."
                value={workoutLogForm.notes || ''}
                onChange={(e) => setWorkoutLogForm({ ...workoutLogForm, notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="form-row checkbox-row">
              <div className="checkbox-group">
                <input
                  id="log-complete"
                  type="checkbox"
                  checked={workoutLogForm.is_complete || false}
                  onChange={(e) => setWorkoutLogForm({ ...workoutLogForm, is_complete: e.target.checked })}
                />
                <label htmlFor="log-complete">Completed</label>
              </div>
            </div>

            {/* Mini Workout Log for Exercise Entries */}
            <div style={{ 
              marginTop: '2em', 
              padding: '1.5em', 
              border: '2px solid #444', 
              borderRadius: '8px',
              backgroundColor: 'rgba(60, 60, 60, 0.3)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '1em' }}>📋 Add Exercise Entries from Paper Log</h3>
              {!workoutLogForm.routine_id ? (
                <p style={{ fontSize: '0.9em', color: '#f87171', marginBottom: '1em' }}>
                  ⚠️ Please select a routine above to load its exercises
                </p>
              ) : (
                <p style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '1em' }}>
                  Log individual exercises from the selected routine. This recreates their paper log in the app.
                </p>
              )}

              {/* Exercise Selector and Add Button */}
              <div className="form-row" style={{ marginBottom: '1em' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label htmlFor="log-exercise-select">Select Exercise from Routine</label>
                  <select
                    id="log-exercise-select"
                    value={selectedExerciseForLog}
                    onChange={(e) => setSelectedExerciseForLog(e.target.value)}
                    disabled={!workoutLogForm.routine_id || routineExercises.length === 0}
                  >
                    <option value="">
                      {!workoutLogForm.routine_id 
                        ? 'Select routine first...' 
                        : routineExercises.length === 0
                        ? 'No exercises in this routine'
                        : 'Choose an exercise...'}
                    </option>
                    {routineExercises.map((ex, idx) => (
                      <option key={`${ex.id}-${idx}`} value={ex.id}>
                        {ex.name} {ex.primary_muscle ? `(${ex.primary_muscle})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', flex: 1 }}>
                  <button 
                    type="button"
                    onClick={handleAddSetToLog}
                    disabled={!selectedExerciseForLog}
                    style={{
                      padding: '0.75em 1.5em',
                      backgroundColor: selectedExerciseForLog ? '#4CAF50' : '#666',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: selectedExerciseForLog ? 'pointer' : 'not-allowed',
                      width: '100%'
                    }}
                  >
                    + Add Set
                  </button>
                </div>
              </div>

              {/* Log Entries Table */}
              {logEntries.length > 0 && (
                <div style={{ marginTop: '1.5em', overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.9em'
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #555', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                        <th style={{ padding: '0.75em', textAlign: 'left' }}>Exercise</th>
                        <th style={{ padding: '0.75em', textAlign: 'center' }}>Set</th>
                        <th style={{ padding: '0.75em', textAlign: 'center' }}>Reps</th>
                        <th style={{ padding: '0.75em', textAlign: 'center' }}>Weight (lbs)</th>
                        <th style={{ padding: '0.75em', textAlign: 'center' }}>RPE</th>
                        <th style={{ padding: '0.75em', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logEntries.map((entry) => (
                        <tr key={entry._tempId} style={{ borderBottom: '1px solid #444' }}>
                          <td style={{ padding: '0.75em' }}>{entry.exercise_name}</td>
                          <td style={{ padding: '0.75em', textAlign: 'center' }}>{entry.set_number}</td>
                          <td style={{ padding: '0.75em', textAlign: 'center' }}>
                            <input 
                              type="number"
                              min="0"
                              value={entry.reps_completed}
                              onChange={(e) => handleUpdateLogEntry(entry._tempId, 'reps_completed', e.target.value)}
                              placeholder="Reps"
                              style={{
                                width: '50px',
                                padding: '0.5em',
                                textAlign: 'center',
                                backgroundColor: '#333',
                                color: '#fff',
                                border: '1px solid #555',
                                borderRadius: '4px'
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.75em', textAlign: 'center' }}>
                            <input 
                              type="number"
                              step="0.5"
                              min="0"
                              value={entry.weight_lbs}
                              onChange={(e) => handleUpdateLogEntry(entry._tempId, 'weight_lbs', e.target.value)}
                              placeholder="Weight"
                              style={{
                                width: '60px',
                                padding: '0.5em',
                                textAlign: 'center',
                                backgroundColor: '#333',
                                color: '#fff',
                                border: '1px solid #555',
                                borderRadius: '4px'
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.75em', textAlign: 'center' }}>
                            <select
                              value={entry.rpe_rating || 5}
                              onChange={(e) => handleUpdateLogEntry(entry._tempId, 'rpe_rating', parseInt(e.target.value))}
                              style={{
                                width: '50px',
                                padding: '0.5em',
                                backgroundColor: '#333',
                                color: '#fff',
                                border: '1px solid #555',
                                borderRadius: '4px'
                              }}
                            >
                              <option value="">-</option>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '0.75em', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveSetFromLog(entry._tempId)}
                              style={{
                                padding: '0.5em 1em',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85em'
                              }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{ 
                    marginTop: '0.75em', 
                    fontSize: '0.85em', 
                    color: '#4CAF50',
                    fontWeight: 'bold'
                  }}>
                    ✓ {logEntries.length} {logEntries.length === 1 ? 'set' : 'sets'} ready to save
                  </p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Creating...' : 'Create Workout Log'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TrainerAdminPanel;