import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Dumbbell, PlusCircle, Trash2, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import './WorkoutRoutinePage.css';

function WorkoutRoutinePage() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutines = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('workout_routines')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching routines:', error);
      else setRoutines(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  const handleDeleteRoutine = async (routineId) => {
    if (window.confirm('Are you sure you want to delete this routine? This cannot be undone.')) {
      const { error } = await supabase.from('workout_routines').delete().eq('id', routineId);
      if (error) alert(`Error: ${error.message}`);
      else fetchRoutines();
    }
  };

  const handleToggleActive = async (routine) => {
    const { error } = await supabase
      .from('workout_routines')
      .update({ is_active: !routine.is_active })
      .eq('id', routine.id);
    
    if (error) alert(`Error: ${error.message}`);
    else fetchRoutines();
  };

  return (
    <div className="workout-routines-container">
      <SubPageHeader 
        title="Routines" 
        icon={<Dumbbell size={28} />} 
        iconColor="#f97316"
        backTo="/workouts" 
      />
      
      <div className="routines-content">
        <Link to="/workouts/routines/new" className="create-routine-button">
          <PlusCircle size={20} />
          <span>Create New Routine</span>
        </Link>

        <div className="routine-list">
          {loading && <p>Loading routines...</p>}
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
    </div>
  );
}

export default WorkoutRoutinePage;

