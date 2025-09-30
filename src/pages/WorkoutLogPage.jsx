import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import RestTimerModal from '../components/RestTimerModal.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
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
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [shouldAdvance, setShouldAdvance] = useState(false);

  const selectedExercise = useMemo(() => routine?.routine_exercises[selectedExerciseIndex]?.exercises, [routine, selectedExerciseIndex]);

  const fetchAndStartWorkout = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data: routineData, error: routineError } = await supabase
        .from('workout_routines')
        .select(`*, routine_exercises(target_sets, exercises(*, muscle_groups(name)))`)
        .eq('id', routineId)
        .single();
      if (routineError) throw routineError;
      if (!routine) setRoutine(routineData);

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
      
      todaysLogs.forEach(log => {
        log.workout_log_entries.sort((a, b) => a.set_number - b.set_number);
        log.workout_log_entries.forEach(entry => {
          if (!todaysEntriesMap[entry.exercise_id]) todaysEntriesMap[entry.exercise_id] = [];
          todaysEntriesMap[entry.exercise_id].push(entry);
        });
      });
      setTodaysLog(todaysEntriesMap);

      let currentLogId;
      if (activeLog) {
        currentLogId = activeLog.id;
      } else {
        const { data: newLog, error: newLogError } = await supabase
          .from('workout_logs')
          .insert({ user_id: user.id, routine_id: routineId, is_complete: false })
          .select('id')
          .single();
        if (newLogError) throw newLogError;
        currentLogId = newLog.id;
      }
      setWorkoutLogId(currentLogId);

      if (!previousLog || Object.keys(previousLog).length === 0) {
        if (routineData && routineData.routine_exercises) {
          const prevLogMap = {};
          await Promise.all(routineData.routine_exercises.map(async (item) => {
            const exerciseId = item.exercises.id;
            const { data, error } = await supabase.rpc('get_entries_for_last_session', {
              p_user_id: user.id,
              p_exercise_id: exerciseId,
            });
            if (error) {
              prevLogMap[exerciseId] = [];
            } else {
              prevLogMap[exerciseId] = data;
            }
          }));
          setPreviousLog(prevLogMap);
        }
      }
      if (!startTime) setStartTime(new Date());
    } catch (error) {
      console.error("A critical error occurred while fetching workout data:", error);
    } finally {
      setLoading(false);
    }
  }, [routineId, routine, previousLog, startTime]);

  useEffect(() => {
    fetchAndStartWorkout();
  }, [fetchAndStartWorkout]);
  
  const fetchChartData = useCallback(async () => {
    if (!selectedExercise) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('workout_log_entries')
      .select('created_at, weight_lifted_lbs')
      .eq('exercise_id', selectedExercise.id)
      .order('created_at', { ascending: true });
    if (error) {
      console.error("Error fetching chart data:", error);
    } else {
      const formattedData = data.map(log => ({
        date: new Date(log.created_at).toLocaleDateString(),
        weight: log.weight_lifted_lbs,
      }));
      setChartData(formattedData);
    }
  }, [selectedExercise]);

  useEffect(() => {
    if (activeView === 'chart') {
      fetchChartData();
    }
  }, [activeView, selectedExercise, fetchChartData]);

  const handleSaveSet = async () => {
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
    
    const newTodaysLog = {
      ...todaysLog,
      [selectedExercise.id]: [...(todaysLog[selectedExercise.id] || []), newEntry]
    };
    setTodaysLog(newTodaysLog);
    setCurrentSet({ weight: currentSet.weight, reps: currentSet.reps });

    const targetSets = routine.routine_exercises[selectedExerciseIndex]?.target_sets;
    const completedSets = newTodaysLog[selectedExercise.id].length;

    if (targetSets && completedSets >= targetSets) {
      setShouldAdvance(true);
    }
    
    setIsTimerOpen(true);
  };

  const handleTimerClose = () => {
    setIsTimerOpen(false);
    if (shouldAdvance) {
      if (selectedExerciseIndex < routine.routine_exercises.length - 1) {
        setSelectedExerciseIndex(prevIndex => prevIndex + 1);
      }
      setShouldAdvance(false);
    }
  };

  const handleFinishWorkout = async () => {
    if (!workoutLogId) return;
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
    setSuccessModalOpen(true);
  };
  
  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    navigate('/dashboard');
  };

  const handleDeleteSet = async (entryId) => {
    const { error } = await supabase
      .from('workout_log_entries')
      .delete()
      .eq('id', entryId);
    if (error) {
      console.error("Error deleting set:", error);
      alert("Could not delete set.");
      return;
    }
    await fetchAndStartWorkout();
  };

  const handleEditSetClick = (set) => {
    setEditingSet({ entryId: set.id });
    setEditSetValue({ weight: set.weight_lifted_lbs, reps: set.reps_completed });
  };

  const handleUpdateSet = async () => {
    if (!editingSet) return;
    const { entryId } = editingSet;
    const updatedPayload = {
      weight_lifted_lbs: parseInt(editSetValue.weight, 10),
      reps_completed: parseInt(editSetValue.reps, 10),
    };
    const { error } = await supabase
      .from('workout_log_entries')
      .update(updatedPayload)
      .eq('id', entryId);
      
    if (error) {
      console.error("Error updating set:", error);
      alert("Could not update set.");
      return;
    }
    setEditingSet(null);
    await fetchAndStartWorkout();
  };

  const handleCancelEdit = () => setEditingSet(null);

  if (loading) return <div style={{color: 'white', padding: '2rem'}}>Loading Workout...</div>;

  const isLastExercise = routine && selectedExerciseIndex === routine.routine_exercises.length - 1;

  return (
    <div className="workout-log-page-container">
      <SubPageHeader title={routine?.routine_name || 'Workout'} icon={<Dumbbell size={28} />} iconColor="#f97316" backTo="/workouts/select-routine-log" />
      
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
                        {(todaysLog[selectedExercise?.id] || []).map((set) => (
                        <li key={set.id}>
                            {editingSet && editingSet.entryId === set.id ? (
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
                                    <button onClick={() => handleEditSetClick(set)}><Edit2 size={14}/></button>
                                    <button onClick={() => handleDeleteSet(set.id)}><Trash2 size={14}/></button>
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
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid stroke="#4a5568" strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#a0aec0" />
                        <YAxis stroke="#a0aec0" />
                        <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} />
                        <Line type="monotone" dataKey="weight" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <p className="no-data-message">No progress data available for this exercise yet.</p>
            )}
        </div>
        )}
      </div>

      {isLastExercise && (
        <div className="finish-workout-footer">
          <button className="finish-button" onClick={handleFinishWorkout}>Finish Workout</button>
        </div>
      )}

      <RestTimerModal isOpen={isTimerOpen} onClose={handleTimerClose} />
      
      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        title="Workout Saved!"
        message="Your progress has been saved successfully."
      />
    </div>
  );
}

export default WorkoutLogPage;