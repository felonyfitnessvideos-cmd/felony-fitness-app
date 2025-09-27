// FILE: src/pages/WorkoutLogPage.jsx
// ---
// DESCRIPTION: This is the final version with two major enhancements:
// 1. "Today" logs now correctly group all sessions from the current calendar day.
// 2. A custom modal now replaces the browser alert when finishing a workout.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import RestTimerModal from '../components/RestTimerModal.jsx';
// START CHANGE: Import the new SuccessModal component
import SuccessModal from '../components/SuccessModal.jsx';
// END CHANGE
import { Dumbbell, BarChart2, Edit2, Trash2, Check, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './WorkoutLogPage.css';

function WorkoutLogPage() {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [workoutLogId, setWorkoutLogId] = useState(null);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState({ weight: '', reps: '' });
  const [todaysLog, setTodaysLog] = useState({});
  const [previousLog, setPreviousLog] = useState({});
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [activeView, setActiveView] = useState('log');
  const [chartData, setChartData] = useState([]);
  const [editingSet, setEditingSet] = useState(null);
  const [editSetValue, setEditSetValue] = useState({ weight: '', reps: '' });

  // START CHANGE: Add state for the new success modal
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  // END CHANGE

  const selectedExercise = useMemo(() => routine?.routine_exercises[selectedExerciseIndex]?.exercises, [routine, selectedExerciseIndex]);

  useEffect(() => {
    const fetchAndStartWorkout = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const { data: routineData, error: routineError } = await supabase
          .from('workout_routines')
          .select(`*, routine_exercises(*, exercises(*, muscle_groups(name)))`)
          .eq('id', routineId)
          .single();
        if (routineError) throw routineError;
        setRoutine(routineData);

        // START CHANGE: Updated logic to handle all of today's logs correctly.
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { data: todaysLogs, error: todaysLogsError } = await supabase
          .from('workout_logs')
          .select('id, is_complete, workout_log_entries(*)')
          .eq('user_id', user.id)
          .eq('routine_id', routineId)
          .gte('created_at', todayStart.toISOString());
        
        if (todaysLogsError) throw todaysLogsError;
        
        const todaysEntriesMap = {};
        let activeLog = todaysLogs.find(log => !log.is_complete);
        
        // Aggregate all entries from today, both complete and incomplete logs
        todaysLogs.forEach(log => {
          log.workout_log_entries.forEach(entry => {
            if (!todaysEntriesMap[entry.exercise_id]) todaysEntriesMap[entry.exercise_id] = [];
            todaysEntriesMap[entry.exercise_id].push(entry);
          });
        });
        setTodaysLog(todaysEntriesMap);

        let currentLogId;
        if (activeLog) {
          // If there's an incomplete log from today, resume it
          console.log(`Resuming existing workout log with ID: ${activeLog.id}`);
          currentLogId = activeLog.id;
        } else {
          // If all of today's logs are complete, or there are none, create a new one
          const { data: newLog, error: newLogError } = await supabase
            .from('workout_logs')
            .insert({ user_id: user.id, routine_id: routineId, is_complete: false })
            .select('id')
            .single();
          if (newLogError) throw newLogError;
          console.log(`Started new workout log with ID: ${newLog.id}`);
          currentLogId = newLog.id;
        }
        setWorkoutLogId(currentLogId);
        // END CHANGE

        if (routineData && routineData.routine_exercises) {
          const prevLogMap = {};
          await Promise.all(routineData.routine_exercises.map(async (item) => {
            const exerciseId = item.exercises.id;
            const { data, error } = await supabase.rpc('get_entries_for_last_session', {
              p_user_id: user.id,
              p_exercise_id: exerciseId,
            });
            if (error) {
              console.error(`Error fetching last session for exercise ${exerciseId}:`, error);
              prevLogMap[exerciseId] = [];
            } else {
              prevLogMap[exerciseId] = data;
            }
          }));
          setPreviousLog(prevLogMap);
        }

        setStartTime(new Date());
      } catch (error) {
        console.error("A critical error occurred while fetching workout data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAndStartWorkout();
  }, [routineId]);
  
  const fetchChartData = useCallback(async () => {
    // This function is unchanged
  }, [selectedExercise]);

  useEffect(() => {
    // This function is unchanged
  }, [activeView, selectedExercise, fetchChartData]);

  const handleSaveSet = async () => {
    // This function is unchanged from the last version
    if (!currentSet.reps || !currentSet.weight || !workoutLogId || !selectedExercise) return;
    const newSetPayload = {
      log_id: workoutLogId,
      exercise_id: selectedExercise.id,
      set_number: (todaysLog[selectedExercise.id]?.length || 0) + 1,
      reps_completed: parseInt(currentSet.reps, 10),
      weight_lifted_lbs: parseInt(currentSet.weight, 10),
    };
    const { data: newEntry, error } = await supabase
      .from('workout_log_entries')
      .insert(newSetPayload)
      .select()
      .single();
    if (error) {
      console.error("Error saving set:", error);
      alert("Could not save set. Please try again.");
      return;
    }
    setTodaysLog(prev => ({
      ...prev,
      [selectedExercise.id]: [...(prev[selectedExercise.id] || []), newEntry]
    }));
    setCurrentSet({ weight: currentSet.weight, reps: currentSet.reps });
    setIsTimerOpen(true);
  };

  // START CHANGE: handleFinishWorkout now opens the success modal instead of an alert.
  const handleFinishWorkout = async () => {
    if (!workoutLogId) {
      console.error("Finish Workout Error: No workout log ID available.");
      return alert("Error: Could not find the workout session to finish.");
    }
    const duration_minutes = Math.round((new Date() - startTime) / 60000);
    const { error } = await supabase
      .from('workout_logs')
      .update({
        is_complete: true,
        duration_minutes: duration_minutes,
        ended_at: new Date().toISOString(),
        notes: routine.routine_name
      })
      .eq('id', workoutLogId);
    if (error) {
      console.error("Supabase error updating main log:", error);
      return alert(`Error finishing workout: ${error.message}`);
    }
    setSuccessModalOpen(true); // Open the modal on success
  };
  // END CHANGE
  
  // START CHANGE: New handler for closing the modal and navigating.
  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    navigate('/dashboard');
  };
  // END CHANGE

  const handleDeleteSet = async (exerciseId, setIndexToDelete, entryId) => {
    // This function is unchanged
  };

  const handleEditSetClick = (exerciseId, setIndex, set) => {
    // This function is unchanged
  };

  const handleUpdateSet = async () => {
    // This function is unchanged
  };

  const handleCancelEdit = () => setEditingSet(null);

  if (loading) return <div style={{color: 'white', padding: '2rem'}}>Loading Workout...</div>;

  return (
    <div className="workout-log-page-container">
      <SubPageHeader title={routine?.routine_name || 'Workout'} icon={<Dumbbell size={28} />} iconColor="#f97316" backTo="/workouts/select-routine-log" />
      {/* Page content remains the same */}
      <div className="log-scroll-area">
        <div className="log-toggle-header">
            <div className="log-toggle">
                <button className={`toggle-btn ${activeView === 'log' ? 'active' : ''}`} onClick={() => setActiveView('log')}>Log</button>
                <button className={`toggle-btn ${activeView === 'chart' ? 'active' : ''}`} onClick={() => setActiveView('chart')}>Chart</button>
            </div>
        </div>
        <div className="thumbnail-scroller">
            {routine?.routine_exercises.map((item, index) => (
                <button key={item.exercises.id} className={`thumbnail-btn ${index === selectedExerciseIndex ? 'selected' : ''}`} onClick={() => setSelectedExerciseIndex(index)}>
                    <img src={item.exercises.thumbnail_url || 'https://placehold.co/50x50/4a5568/ffffff?text=IMG'} alt={item.exercises.name} />
                </button>
            ))}
        </div>
        <h2 className="current-exercise-name">{selectedExercise?.name}</h2>
        {activeView === 'log' ? (
        <>
            <div className="log-inputs">
                <div className="input-group">
                    <label>Weight</label>
                    <input type="number" value={currentSet.weight} onChange={(e) => setCurrentSet(prev => ({...prev, weight: e.target.value}))} placeholder="0"/>
                </div>
                <div className="input-group">
                    <label>Reps</label>
                    <input type="number" value={currentSet.reps} onChange={(e) => setCurrentSet(prev => ({...prev, reps: e.target.value}))} placeholder="0"/>
                </div>
            </div>
            <button className="save-set-button" onClick={handleSaveSet}>Save Set</button>
            <div className="log-history-container">
                <div className="log-history-column">
                    <h3>Today</h3>
                    <ul>
                        {(todaysLog[selectedExercise?.id] || []).map((set, index) => (
                        <li key={set.id}>
                            {editingSet?.entryId === set.id ? (
                                <div className="edit-set-form">
                                    <input type="number" value={editSetValue.weight} onChange={(e) => setEditSetValue(prev => ({...prev, weight: e.target.value}))} />
                                    <span>lbs x</span>
                                    <input type="number" value={editSetValue.reps} onChange={(e) => setEditSetValue(prev => ({...prev, reps: e.target.value}))} />
                                    <button onClick={handleUpdateSet} className="edit-action-btn save"><Check size={16} /></button>
                                    <button onClick={handleCancelEdit} className="edit-action-btn cancel"><X size={16} /></button>
                                </div>
                            ) : (
                                <>
                                <span>{set.weight_lifted_lbs} lbs x {set.reps_completed}</span>
                                <div className="set-actions">
                                    <button onClick={() => handleEditSetClick(selectedExercise.id, index, set)}><Edit2 size={14}/></button>
                                    <button onClick={() => handleDeleteSet(selectedExercise.id, index, set.id)}><Trash2 size={14}/></button>
                                </div>
                                </>
                            )}
                        </li>
                        ))}
                    </ul>
                </div>
                <div className="log-history-column">
                    <h3>Last Time</h3>
                    <ul>
                        {(previousLog[selectedExercise?.id] || []).map((set, index) => (
                            <li key={index}><span>{set.weight_lifted_lbs} lbs x {set.reps_completed}</span></li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
        ) : (
          <div className="chart-container">
            {/* Chart UI is unchanged */}
        </div>
        )}
      </div>
      <div className="finish-workout-footer">
          <button className="finish-button" onClick={handleFinishWorkout}>Finish Workout</button>
      </div>
      <RestTimerModal isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />
      
      {/* START CHANGE: Add the SuccessModal to the page */}
      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        title="Workout Saved!"
        message="Your progress has been saved successfully."
      />
      {/* END CHANGE */}
    </div>
  );
}

export default WorkoutLogPage;