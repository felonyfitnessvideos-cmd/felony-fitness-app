import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Dumbbell, PlusCircle, Trash2, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import './WorkoutRoutinePage.css';

function WorkoutRoutinePage() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (user) {
      fetchRoutines(user.id);
    } else {
      setLoading(false); // If no user, stop loading
    }
  }, [user?.id, fetchRoutines]);

  const handleDeleteRoutine = async (routineId) => {
    // Note: window.confirm can be disruptive. Consider a custom modal for a better UX.
    if (window.confirm('Are you sure you want to delete this routine? This cannot be undone.')) {
      try {
        const { error } = await supabase.from('workout_routines').delete().eq('id', routineId);
        if (error) throw error;
        // Refetch routines after deletion
        if (user) fetchRoutines(user.id);
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleToggleActive = async (routine) => {
    try {
      const { error } = await supabase
        .from('workout_routines')
        .update({ is_active: !routine.is_active })
        .eq('id', routine.id);
      
      if (error) throw error;
      // Refetch routines after toggle
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
