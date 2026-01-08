/**
 * @file WorkoutBuilder.jsx
 * @description Workout builder component for trainers to create client routines
 * @project Felony Fitness
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { Plus, Save, X, Dumbbell, Target } from 'lucide-react';
import './WorkoutBuilder.css';

/**
 * WorkoutBuilder Component
 * 
 * Allows trainers to build custom workout routines for clients
 * Features exercise selection by muscle group and visual muscle map
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.client - Selected client object
 * @returns {JSX.Element} Workout builder interface
 */
const WorkoutBuilder = ({ client }) => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedMuscle, setSelectedMuscle] = useState('Upper Abdominals');
  const [routineExercises, setRoutineExercises] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [saving, setSaving] = useState(false);

  // Muscle group options - updated to match database values
  const muscleGroups = [
    'Back',
    'Biceps',
    'Brachialis',
    'Calves',
    'Erector Spinae',
    'Forearms',
    'Front Deltoids',
    'Glutes',
    'Hamstrings',
    'Hip Abductors',
    'Hip Adductors',
    'Hip Flexors',
    'Lateral Deltoid',
    'Latissimus Dorsi',
    'Lats',
    'Lower Abdominals',
    'Lower Chest',
    'Lower Trapezius',
    'Middle Chest',
    'Obliques',
    'Quadriceps',
    'Rear Deltoids',
    'Rhomboids',
    'Rotator Cuff',
    'Side Deltoids',
    'Trapezius',
    'Triceps',
    'Upper Abdominals',
    'Upper Chest'
  ];

  /**
   * Load all exercises
   */
  useEffect(() => {
    const fetchExercises = async () => {
      console.log('🏋️ Fetching exercises from exercises table...');
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, primary_muscle, secondary_muscle, tertiary_muscle, equipment_needed, difficulty_level')
        .order('name');

      if (error) {
        console.error('❌ Error fetching exercises:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return;
      }

      console.log('✅ Exercises fetched:', data?.length);
      console.log('Sample exercise:', data?.[0]);
      if (data) {
        setExercises(data);
        // Don't set filteredExercises here, let the filter useEffect handle it
      }
    };

    fetchExercises();
  }, []);

  /**
   * Filter exercises by selected muscle group
   */
  useEffect(() => {
    if (!exercises || exercises.length === 0) {
      console.log('⏳ No exercises loaded yet');
      return;
    }

    if (!selectedMuscle) {
      console.log('📋 No muscle selected, showing all');
      setFilteredExercises(exercises.slice(0, 10));
      return;
    }

    console.log('🔍 Filtering exercises for muscle:', selectedMuscle);
    const filtered = exercises.filter(ex => {
      const match = ex.primary_muscle?.toLowerCase() === selectedMuscle.toLowerCase();
      return match;
    });

    console.log('✅ Filtered exercises:', filtered.length);
    setFilteredExercises(filtered);
  }, [selectedMuscle, exercises]);

  /**
   * Add exercise to routine
   */
  const handleAddExercise = (exercise) => {
    // Check if already added
    if (routineExercises.find(ex => ex.id === exercise.id)) {
      return;
    }

    const newExercise = {
      ...exercise,
      sets: 3,
      reps: 10,
      rest_seconds: 60
    };

    setRoutineExercises([...routineExercises, newExercise]);
  };

  /**
   * Remove exercise from routine
   */
  const handleRemoveExercise = (exerciseId) => {
    const updatedRoutine = routineExercises.filter(ex => ex.id !== exerciseId);
    setRoutineExercises(updatedRoutine);
  };

  /**
   * Save routine to database
   */
  const handleSaveRoutine = async () => {
    if (!routineName.trim() || routineExercises.length === 0) {
      alert('Please enter a routine name and add at least one exercise');
      return;
    }

    setSaving(true);

    try {
      // Create the routine
      const { data: routine, error: routineError } = await supabase
        .from('workout_routines')
        .insert({
          user_id: client.id,
          routine_name: routineName.trim(),
          is_active: true
        })
        .select()
        .single();

      if (routineError) throw routineError;

      // Add exercises to routine
      const routineExerciseInserts = routineExercises.map((ex, index) => ({
        routine_id: routine.id,
        exercise_id: ex.id,
        target_sets: ex.sets,
        target_reps: ex.reps.toString(),
        rest_seconds: ex.rest_seconds,
        exercise_order: index
      }));

      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(routineExerciseInserts);

      if (exercisesError) throw exercisesError;

      // Success!
      alert(`Routine "${routineName}" saved successfully!`);
      setShowSaveModal(false);
      setRoutineName('');
      setRoutineExercises([]);
    } catch (error) {
      console.error('Error saving routine:', error);
      alert('Failed to save routine. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!client) {
    return (
      <div className="workout-builder-empty">
        <Dumbbell size={48} />
        <p>Select a client to build a workout routine</p>
      </div>
    );
  }

  return (
    <div className="workout-builder-container">
      {/* Left Panel: Client Info + Routine Builder */}
      <div className="builder-left-panel">
        {/* Routine Being Built */}
        <div className="routine-builder">
          <h3><Target size={18} /> Routine Exercises ({routineExercises.length})</h3>
          
          <div className="routine-exercises-scroll-container">
            <div className="routine-exercises-list">
              {routineExercises.length === 0 ? (
                <p className="empty-routine">Add exercises from the list on the right →</p>
              ) : (
                routineExercises.map(ex => (
                  <div key={ex.id} className="routine-exercise-card">
                    <span className="exercise-name">{ex.name}</span>
                    <span className="exercise-sets-reps">3 x 10</span>
                    <button 
                      onClick={() => handleRemoveExercise(ex.id)}
                      className="remove-btn"
                      aria-label="Remove exercise"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <button 
            onClick={() => setShowSaveModal(true)}
            className="add-to-routine-btn"
            disabled={routineExercises.length === 0}
          >
            <Save size={18} />
            Add to Client's Routines
          </button>
        </div>
      </div>

      {/* Middle Panel: Exercise Lookup */}
      <div className="builder-middle-panel">
        <h3><Dumbbell size={18} /> Exercise Lookup</h3>
        
        <div className="muscle-filter">
          <select 
            id="muscle-select"
            value={selectedMuscle}
            onChange={(e) => setSelectedMuscle(e.target.value)}
            className="muscle-select"
          >
            {muscleGroups.map(muscle => (
              <option key={muscle} value={muscle}>{muscle}</option>
            ))}
          </select>
        </div>

        <div className="exercises-list">
          {filteredExercises.length === 0 ? (
            <p className="no-exercises">No exercises found for {selectedMuscle}</p>
          ) : (
            filteredExercises.map(exercise => (
              <div key={exercise.id} className="exercise-card">
                <div className="exercise-info">
                  <h4>{exercise.name}</h4>
                </div>
                <button 
                  onClick={() => handleAddExercise(exercise)}
                  className={`add-exercise-btn ${routineExercises.find(ex => ex.id === exercise.id) ? 'added' : ''}`}
                  disabled={routineExercises.find(ex => ex.id === exercise.id)}
                >
                  <Plus size={16} />
                  {routineExercises.find(ex => ex.id === exercise.id) ? 'Added' : 'Add'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Save Routine Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Save Routine</h3>
            <p>Enter a name for this routine:</p>
            <input 
              type="text"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              placeholder="e.g., Push Day A, Full Body Strength..."
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleSaveRoutine()}
            />
            <div className="modal-actions">
              <button 
                onClick={() => setShowSaveModal(false)}
                className="cancel-btn"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveRoutine}
                className="save-btn"
                disabled={saving || !routineName.trim()}
              >
                {saving ? 'Saving...' : 'Save Routine'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutBuilder;
