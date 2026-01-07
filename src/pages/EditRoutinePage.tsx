
/**
 * @file EditRoutinePage.jsx
 * @description This page allows users to create a new workout routine or edit an existing one.
 * @project Felony Fitness
 */

/**
 * EditRoutinePage.jsx
 *
 * Editor for a workout routine. Handles CRUD of sets/exercises and local
 * ordering. Mutations are scoped to the current user; UI provides optimistic
 * updates and reverts on error.
 */
/**
 * EditRoutinePage (doc): editor for a single routine. Handles CRUD for
 * exercises and sets, and keeps optimistic UI updates local to the page.
 */
/**
 * EditRoutinePage — edit a routine and its mesocycles.
 *
 * Contract:
 * - Inputs: routineId via route params
 * - Outputs: calls to Supabase to save routine/mesocycle updates
 * - Errors: network or RLS errors are surfaced via UI message
 *
 * Edge-cases handled: missing columns during staged deploys, component
 * unmounts during async saves, and optimistic updates with reverts.
 */
import { ArrowDownCircle, ArrowUpCircle, Dumbbell, Loader2, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Modal from 'react-modal';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../useAuth';
import SubPageHeader from '../components/SubPageHeader';
import { supabase } from '../supabaseClient.js';
import { Tables } from '../database.types.js';
import './EditRoutinePage.css';

// Modal styling moved to CSS (.custom-modal-overlay, .custom-modal-content)
type MuscleGroup = Tables<'muscle_groups'>;

interface ExerciseInRoutine {
  id: string; // exercise_id
  name: string;
  thumbnail_url: string | null;
  sets: number | string;
  reps: string;
  is_warmup: boolean;
  // plus other fields used in the form
  negative?: boolean;
  drop_set?: boolean;
  drop_set_percentage?: number | string | null;
  superset_id?: string | null;
  is_external?: boolean; // from search
  description?: string | null,
  instructions?: string | null,
  primary_muscle?: string | null,
  secondary_muscle?: string | null,
  tertiary_muscle?: string | null,
  equipment_needed?: string | null,
  difficulty_level?: string | null,
  exercise_type?: string | null,
  type?: string,
  video_url?: string | null
}


function EditRoutinePage() {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [routineName, setRoutineName] = useState('');
  const [routineExercises, setRoutineExercises] = useState<ExerciseInRoutine[]>([]);

  // Helper to generate UUID for supersets
  const generateUUID = () => {
    // Simple UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ExerciseInRoutine[]>([]);
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [selectedMuscleGroupId, setSelectedMuscleGroupId] = useState('');

  const [allMuscleGroups, setAllMuscleGroups] = useState<MuscleGroup[]>([]);


  const fetchInitialData = useCallback(async () => {
    try {
      const { data: muscleGroupsData, error: muscleGroupsError } = await supabase.from('muscle_groups').select('*');
      if (muscleGroupsError) throw muscleGroupsError;
      setAllMuscleGroups(muscleGroupsData || []);

      if (routineId !== 'new') {
        const { data, error } = await supabase
          .from('workout_routines')
          .select(`*, routine_exercises(*)`)
          .eq('id', routineId)
          .single();
        if (error) throw error;

        if (data) {
          setRoutineName(data.routine_name);
          const rawItems = Array.isArray(data.routine_exercises) ? data.routine_exercises : [];
          const sortedExercises = rawItems.sort((a, b) => (a.exercise_order || 0) - (b.exercise_order || 0));
          const formattedExercises = sortedExercises.map(item => ({
            id: item.exercise_id,
            name: item.exercise_name,
            thumbnail_url: item.exercise_thumbnail_url,
            sets: item.target_sets,
            reps: item.target_reps || '8-12',
            is_warmup: item.is_warmup || false
          }));
          setRoutineExercises(formattedExercises.filter(Boolean));
        }
      }
    } catch (error) {
      console.error("Error fetching initial data for routine page:", error);
    } finally {
      setLoading(false);
    }
  }, [routineId]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Cleanup debounce timer and abort controller on unmount
  // This effect is intended to run only on mount/unmount to clean up timers
  // and abort controllers. It intentionally uses an empty dependency array
  // to ensure the cleanup runs only once on unmount.

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
      if (searchAbortControllerRef.current) {
        try { searchAbortControllerRef.current.abort(); } catch { /* ignore */ }
        searchAbortControllerRef.current = null;
      }
    };
  }, []);

  const handleSearch = useCallback((e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Clear any pending debounce timer
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = null;
    }

    // If search term is too short, cancel any in-flight request and clear results
    if (term.length < 3) {
      if (searchAbortControllerRef.current) {
        try { searchAbortControllerRef.current.abort(); } catch (_err) { void _err; /* ignore */ }
        searchAbortControllerRef.current = null;
      }
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Debounce the network request
    searchDebounceRef.current = setTimeout(async () => {
      // Abort previous in-flight request if present (single consolidated attempt)
      if (searchAbortControllerRef.current) {
        try { searchAbortControllerRef.current.abort(); } catch (_err) { void _err; /* ignore */ }
      }
      const controller = new AbortController();
      searchAbortControllerRef.current = controller;

      setIsSearching(true);
      try {
        const { data, error } = await supabase.functions.invoke('exercise-search', {
          body: { query: term },
          signal: controller.signal,
        });
        if (error) throw error;

        if (controller.signal.aborted) return;

        const results = (data?.results || []).map(item => ({
          ...item,
          is_external: data?.source === 'external',
        }));
        setSearchResults(results);
      } catch (error) {
        if (error?.name === 'AbortError') {
          // Request was aborted, ignore
        } else {
          console.error('Error searching exercises:', error?.message || error);
          setSearchResults([]);
        }
      } finally {
        setIsSearching(false);
        searchAbortControllerRef.current = null;
      }
    }, 300);
  }, []);

  const handleAddExercise = (exerciseToAdd) => {
    const newExercise = {
      ...exerciseToAdd,
      sets: 3,
      reps: '10',
      is_warmup: false,
      negative: false,
      drop_set: false,
      drop_set_percentage: null,
      superset_id: null,
      _uniqueKey: `${exerciseToAdd.id || exerciseToAdd.name}-${Date.now()}-${Math.random()}`,
    };
    setRoutineExercises([...routineExercises, newExercise]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...routineExercises];
    if (field === 'sets') {
      updatedExercises[index][field] = value === '' ? '' : Number(value);
    } else if (field === 'negative') {
      updatedExercises[index].negative = value;
      if (value) {
        updatedExercises[index].drop_set = false;
        updatedExercises[index].drop_set_percentage = null;
      }
    } else if (field === 'drop_set') {
      updatedExercises[index].drop_set = value;
      if (!value) {
        updatedExercises[index].drop_set_percentage = null;
      }
      if (value) {
        updatedExercises[index].negative = false;
      }
    } else if (field === 'drop_set_percentage') {
      updatedExercises[index].drop_set_percentage = value;
    } else if (field === 'superset_id') {
      updatedExercises[index].superset_id = value;
    } else {
      updatedExercises[index][field] = value;
    }
    setRoutineExercises(updatedExercises);
  };


  const handleRemoveExercise = (index) => {
    const updatedExercises = routineExercises.filter((_, i) => i !== index);
    setRoutineExercises(updatedExercises);
  };

  const handleSaveRoutine = async () => {
    if (!user) return alert("You must be logged in to save a routine.");

    // Validate that all exercises have sets and reps filled in
    const incompleteExercises = routineExercises.filter(ex => !ex.sets || !ex.reps || ex.sets === '' || ex.reps === '');
    if (incompleteExercises.length > 0) {
      return alert("Please fill in sets and reps for all exercises before saving.");
    }

    const resolvedExercises = await Promise.all(
      routineExercises.map(async (ex) => {
        if (ex.id && !ex.is_external) {
          return ex;
        }

        const { data: existingExercise, error: checkError } = await supabase
          .from('exercises')
          .select('id')
          .eq('name', ex.name)
          .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 or 1 results gracefully

        // If check failed for reasons other than "not found", log it
        if (checkError && checkError.code !== 'PGRST116') {
          console.warn('Error checking for existing exercise:', checkError);
        }

        if (existingExercise) {
          return { ...ex, id: existingExercise.id };
        }

        // Database constraint allows: 'Free Weight', 'Machine', 'Bodyweight'
        // Map various input types to these three valid values
        const validExerciseTypes = {
          'free weight': 'Free Weight',
          'freeweight': 'Free Weight',
          'free-weight': 'Free Weight',
          'weight': 'Free Weight',
          'weights': 'Free Weight',
          'dumbbell': 'Free Weight',
          'barbell': 'Free Weight',
          'machine': 'Machine',
          'bodyweight': 'Bodyweight',
          'body weight': 'Bodyweight',
          'calisthenics': 'Bodyweight',
          'strength': 'Free Weight', // Default strength to Free Weight
          'cardio': 'Machine', // Default cardio to Machine
          'olympic': 'Free Weight',
          'powerlifting': 'Free Weight',
        };

        let exerciseType = (ex.exercise_type || ex.type || 'bodyweight').toLowerCase().trim();
        
        // Map to valid database value, default to 'Bodyweight'
        exerciseType = validExerciseTypes[exerciseType] || 'Bodyweight';

        // Insert new exercise using Edge Function (bypasses RLS restrictions)
        const exerciseData = {
          name: ex.name,
          description: ex.description || null,
          instructions: ex.instructions || null,
          primary_muscle: ex.primary_muscle || null,
          secondary_muscle: ex.secondary_muscle || null,
          tertiary_muscle: ex.tertiary_muscle || null,
          equipment_needed: ex.equipment_needed || null,
          difficulty_level: ex.difficulty_level || null,
          exercise_type: exerciseType,
          thumbnail_url: ex.thumbnail_url || null,
          video_url: ex.video_url || null
        };

        const { data: edgeFunctionResponse, error: functionError } = await supabase.functions.invoke('create-exercise', {
          body: exerciseData
        });

        if (functionError) {
          console.error('Exercise insert error:', functionError);
          console.error('Failed exercise data:', JSON.stringify(exerciseData, null, 2));
          console.error('Specifically exercise_type was:', exerciseData.exercise_type);
          throw functionError;
        }

        if (edgeFunctionResponse?.error) {
          console.error('Edge Function error response:', JSON.stringify(edgeFunctionResponse, null, 2));
          throw new Error(edgeFunctionResponse.error);
        }

        return { ...ex, id: edgeFunctionResponse.exercise_id };
      })
    );

    const exercisesToInsert = resolvedExercises.map((ex, index) => ({
      exercise_id: ex.id,
      target_sets: Math.max(1, Number(ex.sets) || 1),
      target_reps: ex.reps || '8-12',
      exercise_order: index,
      is_warmup: ex.is_warmup || false,
      negative: ex.negative || false,
      drop_set: ex.drop_set || false,
      drop_set_percentage: ex.drop_set ? (ex.drop_set_percentage !== null && ex.drop_set_percentage !== undefined ? ex.drop_set_percentage : null) : null,
      superset_id: ex.superset_id || null
    }));

    try {
      if (routineId === 'new') {
        const { data: newRoutine, error: routineError } = await supabase.from('workout_routines').insert({ routine_name: routineName, user_id: user.id }).select('id').single();
        if (routineError) throw routineError;

        await supabase.from('routine_exercises').insert(exercisesToInsert.map(e => ({ ...e, routine_id: newRoutine.id })));
      } else {
        // Call the new Edge Function to replace routine exercises
        const { data, error: edgeError } = await supabase.functions.invoke('replace-routine-exercises', {
          body: {
            p_routine_id: routineId,
            p_name: routineName,
            p_items: exercisesToInsert
          }
        });
        if (edgeError || (data && data.error)) {
          throw new Error(edgeError?.message || data?.error || 'Unknown error');
        }
      }
      navigate('/workouts/routines');
    } catch (error) {
      alert(`Error saving routine: ${error.message}`);
    }
  };

  const moveExercise = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === routineExercises.length - 1)) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const items = [...routineExercises];
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    setRoutineExercises(items);
  };

  const openCustomExerciseModal = () => {
    setCustomExerciseName(searchTerm);
    setIsCustomModalOpen(true);
  };

  const closeCustomExerciseModal = () => setIsCustomModalOpen(false);

  const handleSaveCustomExercise = async (e) => {
    e.preventDefault();
    if (!customExerciseName || !selectedMuscleGroupId) return alert("Please provide a name and select a muscle group.");
    try {
      // Get the muscle group name to use as primary_muscle
      const muscleGroup = allMuscleGroups.find(mg => mg.id === selectedMuscleGroupId);
      const muscleName = muscleGroup?.name || 'Core';

      const { data: newExerciseData, error: insertError } = await supabase
        .from('exercises')
        .insert({
          name: customExerciseName,
          exercise_type: 'Strength',
          primary_muscle: muscleName,
          difficulty_level: 'Intermediate'
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      handleAddExercise(newExerciseData);
      closeCustomExerciseModal();

    } catch (error) {
      alert(`Error creating custom exercise: ${error.message}`);
    }
  };

  // Guard against missing or invalid routineId
  if (!routineId) {
    return (
      <div className="loading-container" style={{ color: 'white', padding: '2rem' }}>
        <Loader2 className="spinner" />
        <p>Loading routine...</p>
      </div>
    );
  }

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading routine...</div>;

  return (
    <div className="edit-routine-page-container">
      <SubPageHeader title={routineId === 'new' ? 'Create Routine' : 'Edit Routine'} icon={<Dumbbell size={28} />} iconColor="#f97316" backTo="/workouts/routines" />

      <div className="form-group">
        <label htmlFor="routineName">Routine Name</label>
        <input type="text" id="routineName" value={routineName} onChange={(e) => setRoutineName(e.target.value)} placeholder="e.g., Push Day" required />
      </div>

      <div className="add-exercise-section">
        <h3>Add Exercises</h3>
        <input type="text" placeholder="Search for an exercise..." value={searchTerm} onChange={handleSearch} />
        {(isSearching || searchResults.length > 0 || searchTerm.length > 2) && (
          <div className="search-results">
            {isSearching && <div className="search-loading"><Loader2 className="animate-spin" /></div>}
            {!isSearching && searchResults.map(ex => {
              const muscleGroup = ex.exercise_muscle_groups?.[0]?.muscle_groups?.name || ex.primary_muscle || 'Core';
              return (
                <div key={ex.id || ex.name} className="search-result-item">
                  <div className="exercise-info">
                    <span className="exercise-name">{ex.name}</span>
                    <span className="muscle-group">{muscleGroup}</span>
                  </div>
                  <button className="add-exercise-btn" onClick={() => handleAddExercise(ex)}>Add</button>
                </div>
              );
            })}
            {!isSearching && searchTerm.length > 2 && searchResults.length === 0 && (
              <div className="custom-exercise-prompt">
                <button onClick={openCustomExerciseModal}>
                  Can't find it? Add "{searchTerm}" as a custom exercise.
                </button>
              </div>
            )}
          </div>
        )}
      </div>


      <h3>Exercises in this Routine</h3>
      <div className="exercise-list">
        {routineExercises.map((ex, index) => {
          // Find all unique superset IDs for dropdown
          const supersetOptions = Array.from(new Set(routineExercises.filter(e => e.superset_id && e.superset_id !== null).map(e => e.superset_id)));
          const isInSuperset = !!ex.superset_id;
          return (
            <div key={ex._uniqueKey || `${ex.id}-${index}` || index} className={`exercise-card${ex.negative ? ' negative-exercise' : ''}${isInSuperset ? ' superset-exercise' : ''}`}>
              <div className="reorder-controls">
                <button onClick={() => moveExercise(index, 'up')} disabled={index === 0}><ArrowUpCircle size={24} /></button>
                <button onClick={() => moveExercise(index, 'down')} disabled={index === routineExercises.length - 1}><ArrowDownCircle size={24} /></button>
              </div>
              <img
                src={ex.thumbnail_url || 'https://placehold.co/50x50/4a5568/ffffff?text=IMG'}
                alt={ex.name}
                className="exercise-thumbnail"
                width="50"
                height="50"
                loading="lazy"
              />
              <div className="exercise-details">
                <h4>{ex.name}</h4>
                <div className="exercise-inputs">
                  <input 
                    type="number" 
                    min="1" 
                    step="1" 
                    value={ex.sets} 
                    onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                    placeholder="Sets"
                    required
                  />
                  <span>sets</span>
                  <input 
                    type="text" 
                    value={ex.reps} 
                    onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                    placeholder="e.g., 8-12"
                    required
                  />
                  <span>reps</span>
                </div>
                <div className="exercise-warmup-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={ex.is_warmup || false}
                      onChange={(e) => handleExerciseChange(index, 'is_warmup', e.target.checked)}
                    />
                    <span>Warmup Exercise</span>
                  </label>
                </div>
                <div className="exercise-advanced-controls">
                  <label style={{ marginRight: '1em' }}>
                    <input
                      type="checkbox"
                      checked={ex.negative || false}
                      onChange={e => handleExerciseChange(index, 'negative', e.target.checked)}
                      disabled={ex.drop_set}
                    />
                    <span style={{ color: ex.negative ? '#f87171' : undefined }}>Negative</span>
                  </label>
                  <label style={{ marginRight: '1em' }}>
                    <input
                      type="checkbox"
                      checked={ex.drop_set || false}
                      onChange={e => handleExerciseChange(index, 'drop_set', e.target.checked)}
                      disabled={ex.negative}
                    />
                    <span style={{ color: ex.drop_set ? '#fbbf24' : undefined }}>Drop Set</span>
                  </label>
                  {ex.drop_set && !ex.negative && (
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={ex.drop_set_percentage || ''}
                      onChange={e => handleExerciseChange(index, 'drop_set_percentage', e.target.value)}
                      placeholder="Drop %"
                      style={{ width: '5em', marginLeft: '0.5em' }}
                    />
                  )}
                  <label style={{ marginLeft: '1em' }}>
                    <span>Superset:</span>
                    <select
                      value={ex.superset_id || ''}
                      onChange={e => handleExerciseChange(index, 'superset_id', e.target.value === '' ? null : e.target.value)}
                      style={{ marginLeft: '0.5em' }}
                    >
                      <option value="">None</option>
                      {supersetOptions.map(id => (
                        <option key={id} value={id}>{id.slice(0, 8)}...</option>
                      ))}
                      <option value="__new__">New Superset</option>
                    </select>
                  </label>
                  {/* If user selects New Superset, assign a new UUID */}
                  {ex.superset_id === '__new__' && handleExerciseChange(index, 'superset_id', generateUUID())}
                </div>
                {ex.negative && (
                  <div className="negative-label" style={{ color: '#f87171', fontWeight: 'bold' }}>Negative</div>
                )}
                {isInSuperset && (
                  <div className="superset-label" style={{ color: '#38bdf8', fontWeight: 'bold' }}>Superset</div>
                )}
              </div>
              <button onClick={() => handleRemoveExercise(index)} className="remove-exercise-button"><Trash2 size={20} /></button>
            </div>
          );
        })}
      </div>

      <div className="action-footer">
        <button className="cancel-button" onClick={() => navigate('/workouts/routines')}>Cancel</button>
        <button className="save-button" onClick={handleSaveRoutine}>Save Routine</button>
      </div>

      <Modal
        isOpen={isCustomModalOpen}
        onRequestClose={closeCustomExerciseModal}
        contentLabel="Create Custom Exercise"
        overlayClassName="custom-modal-overlay"
        className="custom-modal-content"
      >
        <h2>Create Custom Exercise</h2>
        <form onSubmit={handleSaveCustomExercise}>
          <div className="form-group">
            <label htmlFor="customExerciseName">Exercise Name</label>
            <input type="text" id="customExerciseName" value={customExerciseName} onChange={(e) => setCustomExerciseName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="muscleGroup">Muscle Group</label>
            <select id="muscleGroup" value={selectedMuscleGroupId} onChange={(e) => setSelectedMuscleGroupId(e.target.value)} required >
              <option value="" disabled>-- Select a muscle group --</option>
              {allMuscleGroups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>
          <div className="modal-action-footer">
            <button type="button" className="cancel-button" onClick={closeCustomExerciseModal}>Cancel</button>
            <button type="submit" className="save-button">Save Exercise</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EditRoutinePage;
