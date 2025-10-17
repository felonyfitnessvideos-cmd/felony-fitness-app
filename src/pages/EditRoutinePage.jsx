// @ts-check

/**
 * @file EditRoutinePage.jsx
 * @description This page allows users to create a new workout routine or edit an existing one.
 * @project Felony Fitness
 *
 * @workflow
 * 1.  **Initialization**: On load, the component checks the `routineId` from the URL.
 * - If it's 'new', it prepares a blank slate for a new routine.
 * - If it's an existing ID, `fetchInitialData` is called to get the routine's details,
 * including its list of exercises and their order.
 * - It also pre-fetches all available muscle groups for use in the "Add Custom Exercise" modal.
 * 2.  **Exercise Search**: The user can search for exercises to add to the routine.
 * - `handleSearch` calls the `exercise-search` Edge Function, which performs a hybrid
 * search (local database first, then AI fallback).
 * - Search results are displayed, indicating if they are from the local DB or the AI.
 * 3.  **Building the Routine**:
 * - Users can add exercises from the search results (`handleAddExercise`).
 * - They can reorder exercises (`moveExercise`), change sets/reps (`handleExerciseChange`),
 * or remove them (`handleRemoveExercise`).
 * - If an exercise isn't found, they can create a custom one, which opens a modal.
 * 4.  **Saving the Routine**:
 * - `handleSaveRoutine` is the core logic for saving.
 * - It iterates through the list of exercises in the routine. If any exercise is new
 * (from the AI or custom), it first creates the exercise in the `exercises` table
 * and links it to a muscle group in the `exercise_muscle_groups` table.
 * - Once all exercises have a valid ID in the database, it saves the routine and its
 * associated exercises (with their order and target sets) to the `workout_routines`
 * and `routine_exercises` tables, respectively.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Dumbbell, Trash2, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react';
import Modal from 'react-modal';
import { useAuth } from '../AuthContext.jsx';
import './EditRoutinePage.css';

// Styles for the custom exercise creation modal.
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
 * @typedef {object} MuscleGroup
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {object} Exercise
 * @property {string} id - The UUID of the exercise.
 * @property {string} name - The name of the exercise.
 * @property {string} [description] - A short description.
 * @property {string} [category_id] - The UUID for the category (e.g., Strength).
 * @property {string} [type] - The type of exercise (e.g., 'Strength').
 * @property {boolean} [is_external] - Flag indicating if the exercise is from the AI.
 * @property {number | string} sets - The number of sets for the routine.
 * @property {string} reps - The rep range (e.g., "8-12").
 * @property {Array<object>} [exercise_muscle_groups] - Join table data.
 * @property {string} [primary_muscle] - The primary muscle from the AI response.
 */

/**
 * @component EditRoutinePage
 * @description A component for creating and editing workout routines, handling exercise search,
 * custom exercise creation, reordering, and saving logic.
 * @returns {JSX.Element} The rendered component.
 */
function EditRoutinePage() {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for the routine being edited
  const [routineName, setRoutineName] = useState('');
  /** @type {[Exercise[], React.Dispatch<React.SetStateAction<Exercise[]>>]} */
  const [routineExercises, setRoutineExercises] = useState([]);
  
  // State for UI and data management
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // State for the custom exercise modal
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [selectedMuscleGroupId, setSelectedMuscleGroupId] = useState('');
  
  // State for cached data
  /** @type {[MuscleGroup[], React.Dispatch<React.SetStateAction<MuscleGroup[]>>]} */
  const [allMuscleGroups, setAllMuscleGroups] = useState([]);


  /**
   * Fetches all necessary data for the page, including all muscle groups
   * and the specific routine details if editing an existing one.
   * @async
   */
  const fetchInitialData = useCallback(async () => {
    try {
      // Fetch all muscle groups for the custom exercise modal dropdown.
      const { data: muscleGroupsData, error: muscleGroupsError } = await supabase.from('muscle_groups').select('*');
      if (muscleGroupsError) throw muscleGroupsError;
      setAllMuscleGroups(muscleGroupsData || []);

      // If we are editing an existing routine, fetch its data.
      if (routineId !== 'new') {
        const { data, error } = await supabase
            .from('workout_routines')
            .select(`*, routine_exercises(*, exercises(*, exercise_muscle_groups(*, muscle_groups(*))))`)
            .eq('id', routineId)
            .single();
        if (error) throw error;
        
        if (data) {
            setRoutineName(data.routine_name);
            const sortedExercises = data.routine_exercises.sort((a, b) => a.exercise_order - b.exercise_order);
            const formattedExercises = sortedExercises.map(item => ({
                ...item.exercises,
                sets: item.target_sets,
                reps: '8-12', // Reps are not stored per routine yet, so use a default.
            }));
            setRoutineExercises(formattedExercises);
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

  /**
   * Handles the search input, calling the 'exercise-search' Edge Function
   * to get both local and external (AI) results.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   * @async
   */
  const handleSearch = useCallback(async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('exercise-search', {
        body: { query: term },
      });
      if (error) throw error;

      // Tag results to know if they came from the AI.
      const results = data.results.map(item => ({
        ...item,
        is_external: data.source === 'external',
      }));
      setSearchResults(results);

    } catch (error) {
        console.error("Error searching exercises:", error.message);
        setSearchResults([]);
    } finally {
        setIsSearching(false);
    }
  }, []);
  
  /**
   * Adds a selected exercise from the search results to the current routine's state.
   * @param {Exercise} exerciseToAdd - The exercise object from search results.
   */
  const handleAddExercise = (exerciseToAdd) => {
    // Add default sets and reps when adding a new exercise.
    const newExercise = { ...exerciseToAdd, sets: 3, reps: '8-12' };
    setRoutineExercises([...routineExercises, newExercise]);
    setSearchTerm('');
    setSearchResults([]);
  };

  /**
   * Updates a specific field (e.g., sets, reps) for an exercise in the routine.
   * @param {number} index - The index of the exercise in the routineExercises array.
   * @param {'sets' | 'reps'} field - The field to update.
   * @param {string | number} value - The new value.
   */
  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...routineExercises];
    updatedExercises[index][field] = value;
    setRoutineExercises(updatedExercises);
  };

  /**
   * Removes an exercise from the current routine's state.
   * @param {number} index - The index of the exercise to remove.
   */
  const handleRemoveExercise = (index) => {
    const updatedExercises = routineExercises.filter((_, i) => i !== index);
    setRoutineExercises(updatedExercises);
  };

  /**
   * Saves the entire routine to the database. It resolves any new external exercises
   * by creating them in the database before saving the routine itself.
   * @async
   */
  const handleSaveRoutine = async () => {
    if (!user) return alert("You must be logged in to save a routine.");

    // Step 1: Resolve all exercises to ensure they have a database ID.
    const resolvedExercises = await Promise.all(
      routineExercises.map(async (ex) => {
        // If it's a known local exercise, return it.
        if (ex.id && !ex.is_external) {
          return ex;
        }

        // Check if an exercise with the same name already exists.
        const { data: existingExercise } = await supabase
          .from('exercises')
          .select('id')
          .eq('name', ex.name)
          .single();

        if (existingExercise) {
          return { ...ex, id: existingExercise.id };
        }
        
        // If not, create the new exercise (from AI or custom).
        const { data: newExercise, error: insertError } = await supabase
          .from('exercises')
          .insert({ name: ex.name, description: ex.description, category_id: ex.category_id, type: ex.type })
          .select('id')
          .single();

        if (insertError) throw insertError;

        // Find the matching muscle group ID for linking.
        const muscleGroup = allMuscleGroups.find(
          mg => mg.name.toLowerCase() === (ex.primary_muscle || 'general').toLowerCase()
        );
        
        // Default to the "General" muscle group if no match is found.
        const muscleGroupId = muscleGroup ? muscleGroup.id : allMuscleGroups.find(mg => mg.name === 'General')?.id;

        // Create the link in the join table.
        if (muscleGroupId) {
          await supabase
            .from('exercise_muscle_groups')
            .insert({ exercise_id: newExercise.id, muscle_group_id: muscleGroupId });
        }

        return { ...ex, id: newExercise.id };
      })
    );

    // Step 2: Prepare the final list for the `routine_exercises` join table.
    const exercisesToInsert = resolvedExercises.map((ex, index) => ({
      exercise_id: ex.id,
      // **FIX APPLIED**: Coerce `sets` to a number, default to 1, and ensure it's at least 1.
      target_sets: Math.max(1, Number(ex.sets) || 1),
      exercise_order: index
    }));

    // Step 3: Save the routine and its exercises.
    try {
      if (routineId === 'new') {
        // Create a new routine record.
        const { data: newRoutine, error: routineError } = await supabase.from('workout_routines').insert({ routine_name: routineName, user_id: user.id }).select('id').single();
        if (routineError) throw routineError;
        
        // Link the exercises to the new routine.
        await supabase.from('routine_exercises').insert(exercisesToInsert.map(e => ({...e, routine_id: newRoutine.id})));
      } else {
        // Update an existing routine.
        await supabase.from('workout_routines').update({ routine_name: routineName }).eq('id', routineId);
        // A simple approach: delete old exercises and insert the new list.
        await supabase.from('routine_exercises').delete().eq('routine_id', routineId);
        await supabase.from('routine_exercises').insert(exercisesToInsert.map(e => ({...e, routine_id: routineId})));
      }
      navigate('/workouts/routines');
    } catch (error) {
      alert(`Error saving routine: ${error.message}`);
    }
  };
  
  /**
   * Moves an exercise up or down in the routine list for reordering.
   * @param {number} index - The current index of the exercise.
   * @param {'up' | 'down'} direction - The direction to move the exercise.
   */
  const moveExercise = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === routineExercises.length - 1)) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const items = [...routineExercises];
    // Simple array element swap.
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    setRoutineExercises(items);
  };
  
  /** @description Opens the modal for creating a custom exercise. */
  const openCustomExerciseModal = () => {
    setCustomExerciseName(searchTerm); // Pre-fill name from search bar.
    setIsCustomModalOpen(true);
  };

  /** @description Closes the custom exercise modal. */
  const closeCustomExerciseModal = () => setIsCustomModalOpen(false);

  /**
   * Handles the creation of a completely custom exercise from the modal form.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   * @async
   */
  const handleSaveCustomExercise = async (e) => {
    e.preventDefault();
    if (!customExerciseName || !selectedMuscleGroupId) return alert("Please provide a name and select a muscle group.");
    try {
        // Create the new exercise in the `exercises` table.
        const { data: newExerciseData, error: insertError } = await supabase
            .from('exercises')
            .insert({ name: customExerciseName, type: 'Strength' }) // Assume custom exercises are 'Strength'
            .select('id')
            .single();

        if (insertError) throw insertError;
        
        // Link it to the selected muscle group.
        await supabase.from('exercise_muscle_groups').insert({ exercise_id: newExerciseData.id, muscle_group_id: selectedMuscleGroupId });
        
        // Fetch the full exercise data to add to the UI.
        const { data: fullNewExercise, error: fetchError } = await supabase
            .from('exercises')
            .select('*, exercise_muscle_groups(*, muscle_groups(*))')
            .eq('id', newExerciseData.id)
            .single();
        
        if (fetchError) throw fetchError;

        // Add the fully-formed exercise to the current routine list.
        handleAddExercise(fullNewExercise);
        closeCustomExerciseModal();

    } catch (error) {
        alert(`Error creating custom exercise: ${error.message}`);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading routine...</div>;

  return (
    <div className="edit-routine-page-container">
      <SubPageHeader title={routineId === 'new' ? 'Create Routine' : 'Edit Routine'} icon={<Dumbbell size={28}/>} iconColor="#f97316" backTo="/workouts/routines" />
      
      <div className="form-group">
        <label htmlFor="routineName">Routine Name</label>
        <input type="text" id="routineName" value={routineName} onChange={(e) => setRoutineName(e.target.value)} placeholder="e.g., Push Day" />
      </div>

      <div className="add-exercise-section">
        <h3>Add Exercises</h3>
        <input type="text" placeholder="Search for an exercise..." value={searchTerm} onChange={handleSearch} />
        {(isSearching || searchResults.length > 0 || searchTerm.length > 2) && (
          <div className="search-results">
            {isSearching && <div className="search-loading"><Loader2 className="animate-spin" /></div>}
            {!isSearching && searchResults.map(ex => {
              const muscleGroup = ex.exercise_muscle_groups?.[0]?.muscle_groups?.name || ex.primary_muscle || 'General';
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
        {routineExercises.map((ex, index) => (
          <div key={ex.id || index} className="exercise-card">
            <div className="reorder-controls">
              <button onClick={() => moveExercise(index, 'up')} disabled={index === 0}><ArrowUpCircle size={24} /></button>
              <button onClick={() => moveExercise(index, 'down')} disabled={index === routineExercises.length - 1}><ArrowDownCircle size={24} /></button>
            </div>
            <img src={ex.thumbnail_url || 'https://placehold.co/50x50/4a5568/ffffff?text=IMG'} alt={ex.name} className="exercise-thumbnail"/>
            <div className="exercise-details">
              <h4>{ex.name}</h4>
              <div className="exercise-inputs">
                <input type="number" value={ex.sets} onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)} />
                <span>sets</span>
                <input type="text" value={ex.reps} onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)} />
                <span>reps</span>
              </div>
            </div>
            <button onClick={() => handleRemoveExercise(index)} className="remove-exercise-button"><Trash2 size={20} /></button>
          </div>
        ))}
      </div>

      <div className="action-footer">
        <button className="cancel-button" onClick={() => navigate('/workouts/routines')}>Cancel</button>
        <button className="save-button" onClick={handleSaveRoutine}>Save Routine</button>
      </div>

      <Modal
        isOpen={isCustomModalOpen}
        onRequestClose={closeCustomExerciseModal}
        style={customModalStyles}
        contentLabel="Create Custom Exercise"
        appElement={document.getElementById('root')}
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