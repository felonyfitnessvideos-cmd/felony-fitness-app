import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Dumbbell, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import Modal from 'react-modal';
import './EditRoutinePage.css';

const customModalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%',
    transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '400px',
    background: '#2d3748', color: '#f7fafc', border: '1px solid #4a5568',
    zIndex: 1000, padding: '1.5rem', borderRadius: '12px'
  },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 999 },
};

function EditRoutinePage() {
  const { routineId } = useParams();
  const navigate = useNavigate();
  
  const [routineName, setRoutineName] = useState('');
  const [routineExercises, setRoutineExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allExercises, setAllExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [selectedMuscleGroupId, setSelectedMuscleGroupId] = useState('');
  const [allMuscleGroups, setAllMuscleGroups] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*, muscle_groups ( id, name )');
      
      if (exercisesError) console.error("Error fetching all exercises:", exercisesError);
      else setAllExercises(exercisesData || []);

      const { data: muscleGroupsData, error: muscleGroupsError } = await supabase
        .from('muscle_groups')
        .select('*');

      if (muscleGroupsError) console.error("Error fetching muscle groups:", muscleGroupsError);
      else setAllMuscleGroups(muscleGroupsData || []);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchRoutineData = async () => {
        if (routineId === 'new') {
            setLoading(false);
            return;
        }
        const { data, error } = await supabase
            .from('workout_routines')
            .select(`*, routine_exercises(*, exercises(*, muscle_groups(name)))`)
            .eq('id', routineId)
            .single();

        if (error) {
            console.error("Error fetching routine data:", error);
        } else if (data) {
            setRoutineName(data.routine_name);
            const sortedExercises = data.routine_exercises.sort((a, b) => a.exercise_order - b.exercise_order);
            const formattedExercises = sortedExercises.map(item => ({
                ...item.exercises,
                sets: item.sets,
                reps: item.reps,
            }));
            setRoutineExercises(formattedExercises);
        }
        setLoading(false);
    };
    fetchRoutineData();
  }, [routineId]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 1) {
      const results = allExercises.filter(ex =>
        ex.name.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results.slice(0, 10));
    } else {
      setSearchResults([]);
    }
  };
  
  const handleAddExercise = (exerciseToAdd) => {
    const newExercise = { ...exerciseToAdd, sets: 3, reps: '8-12' };
    setRoutineExercises([...routineExercises, newExercise]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...routineExercises];
    updatedExercises[index][field] = value;
    setRoutineExercises(updatedExercises);
  };

  const handleRemoveExercise = (index) => {
    const updatedExercises = routineExercises.filter((_, i) => i !== index);
    setRoutineExercises(updatedExercises);
  };

  const handleSaveRoutine = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("You must be logged in to save a routine.");

    const exercisesToInsert = routineExercises.map((ex, index) => ({ 
      exercise_id: ex.id, 
      sets: ex.sets, 
      reps: ex.reps,
      target_sets: ex.sets,
      exercise_order: index
    }));

    if (routineId === 'new') {
      const { data: newRoutine, error: routineError } = await supabase.from('workout_routines').insert({ routine_name: routineName, user_id: user.id }).select('id').single();
      if (routineError) return alert(`Error: ${routineError.message}`);
      
      const { error: exercisesError } = await supabase.from('routine_exercises').insert(exercisesToInsert.map(ex => ({...ex, routine_id: newRoutine.id})));
      if (exercisesError) return alert(`Error: ${exercisesError.message}`);
    } else {
      await supabase.from('workout_routines').update({ routine_name: routineName }).eq('id', routineId);
      await supabase.from('routine_exercises').delete().eq('routine_id', routineId);
      const { error: exercisesError } = await supabase.from('routine_exercises').insert(exercisesToInsert.map(ex => ({...ex, routine_id: routineId})));
      if (exercisesError) return alert(`Error: ${exercisesError.message}`);
    }
    navigate('/workouts/routines');
  };
  
  const moveExercise = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === routineExercises.length - 1)) {
      return;
    }
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
    const { data: newExercise, error: insertError } = await supabase
      .from('exercises')
      .insert({ name: customExerciseName })
      .select('id, name').single();
    if (insertError) return alert(`Error creating exercise: ${insertError.message}`);
    const { error: linkError } = await supabase
      .from('exercise_muscle_groups')
      .insert({ exercise_id: newExercise.id, muscle_group_id: selectedMuscleGroupId });
    if (linkError) return alert(`Error linking muscle group: ${linkError.message}`);
    const completeNewExercise = { ...newExercise, sets: 3, reps: '8-12', muscle_groups: [{id: selectedMuscleGroupId, name: allMuscleGroups.find(mg => mg.id === selectedMuscleGroupId)?.name}] };
    setRoutineExercises([...routineExercises, completeNewExercise]);
    setAllExercises([...allExercises, completeNewExercise]);
    setSearchTerm('');
    setSearchResults([]);
    closeCustomExerciseModal();
  };

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading routine...</div>;

  return (
    <div className="edit-routine-container">
      <SubPageHeader title={routineId === 'new' ? 'Create Routine' : 'Edit Routine'} icon={<Dumbbell size={28}/>} iconColor="#f97316" backTo="/workouts/routines" />
      
      <div className="edit-routine-scroll-area">
        <div className="form-group">
          <label htmlFor="routineName">Routine Name</label>
          <input type="text" id="routineName" value={routineName} onChange={(e) => setRoutineName(e.target.value)} placeholder="e.g., Push Day" />
        </div>

        <div className="add-exercise-section">
          <h3>Add Exercises</h3>
          <input type="text" placeholder="Search for an exercise..." value={searchTerm} onChange={handleSearch} />
          {(searchResults.length > 0 || (searchTerm.length > 1 && searchResults.length === 0)) && (
            <div className="search-results">
              {searchResults.map(ex => (
                <div key={ex.id} className="search-result-item">
                  <div className="exercise-info">
                    <span className="exercise-name">{ex.name}</span>
                    <span className="muscle-group">{ex.muscle_groups.map(mg => mg.name).join(', ')}</span>
                  </div>
                  <button className="add-exercise-btn" onClick={() => handleAddExercise(ex)}>
                    Add
                  </button>
                </div>
              ))}
              <div className="custom-exercise-prompt">
                <button onClick={openCustomExerciseModal}>
                  Can't find it? Add "{searchTerm}" as a custom exercise.
                </button>
              </div>
            </div>
          )}
        </div>

        <h3>Exercises in this Routine</h3>
        <div className="exercise-list">
          {routineExercises.map((ex, index) => (
            <div key={ex.id || index} className="exercise-card">
              <div className="reorder-controls">
                <button onClick={() => moveExercise(index, 'up')} disabled={index === 0}>
                  <ArrowUpCircle size={24} />
                </button>
                <button onClick={() => moveExercise(index, 'down')} disabled={index === routineExercises.length - 1}>
                  <ArrowDownCircle size={24} />
                </button>
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
              <button onClick={() => handleRemoveExercise(index)} className="remove-exercise-button">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
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
          <div className="action-footer">
            <button type="button" className="cancel-button" onClick={closeCustomExerciseModal}>Cancel</button>
            <button type="submit" className="save-button">Save Exercise</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EditRoutinePage;