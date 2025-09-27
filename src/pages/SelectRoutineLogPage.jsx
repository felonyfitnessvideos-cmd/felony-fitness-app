import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Dumbbell, ChevronRight } from 'lucide-react';
import './SelectRoutineLogPage.css'; // Renamed for consistency

function SelectRoutineLogPage() {
  const [activeRoutines, setActiveRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchActiveRoutines = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('workout_routines')
        .select(`id, routine_name, routine_exercises(count)`)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active routines:', error);
      } else {
        setActiveRoutines(data || []);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchActiveRoutines();
  }, [fetchActiveRoutines]);

  const handleSelectRoutine = (routineId) => {
    navigate(`/log-workout/${routineId}`);
  };

  return (
    <div className="select-routine-container">
      <SubPageHeader title="Select Routine" icon={<Dumbbell size={28} />} iconColor="#f97316" backTo="/workouts" />

      {/* This div will now handle the scrolling */}
      <div className="routines-scroll-area">
        <div className="routine-selection-list">
          {loading && <p>Loading active routines...</p>}
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
    </div>
  );
}

export default SelectRoutineLogPage;