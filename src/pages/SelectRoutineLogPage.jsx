import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Dumbbell, ChevronRight } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import './SelectRoutineLogPage.css';

function SelectRoutineLogPage() {
  const { user } = useAuth();
  const [activeRoutines, setActiveRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchActiveRoutines = useCallback(async (userId) => {
    setLoading(true);
    try {
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

  useEffect(() => {
    if (user) {
      fetchActiveRoutines(user.id);
    } else {
      setLoading(false);
    }
  }, [user?.id, fetchActiveRoutines]);

  const handleSelectRoutine = (routineId) => {
    navigate(`/log-workout/${routineId}`);
  };

  return (
    <div className="select-routine-page-container">
      <SubPageHeader title="Select Routine" icon={<Dumbbell size={28} />} iconColor="#f97316" backTo="/workouts" />

      <div className="routine-selection-list">
        {loading && <p className="loading-message">Loading active routines...</p>}
        {!loading && activeRoutines.map(routine => (
          <button key={routine.id} className="routine-selection-card" onClick={() => handleSelectRoutine(routine.id)}>
            <div className="routine-card-info">
              <h3>{routine.routine_name}</h3>
              <span>{routine.routine_exercises[0]?.count || 0} exercises</span>
            </div>
            <ChevronRight size={24} className="arrow-icon" />
          </button>
        ))}
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
