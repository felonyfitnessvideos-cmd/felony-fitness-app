import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import RestTimerModal from '../components/RestTimerModal.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import { Dumbbell, BarChart2, Edit2, Trash2, Check, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../AuthContext.jsx';
import './WorkoutLogPage.css';

function WorkoutLogPage() {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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
  const [userWeightLbs, setUserWeightLbs] = useState(150);
  const [isWorkoutCompletable, setIsWorkoutCompletable] = useState(false);

  const selectedExercise = useMemo(() => routine?.routine_exercises[selectedExerciseIndex]?.exercises, [routine, selectedExerciseIndex]);

  const fetchAndStartWorkout = useCallback(async (userId) => {
    setLoading(true);
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      // Golden Pattern: Use Promise.all for concurrent data fetching
      const [metricsRes, routineRes, todaysLogsRes] = await Promise.all([
        supabase.from('body_metrics').select('weight_lbs').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('workout_routines').select(`*, routine_exercises(target_sets, exercises(*, muscle_groups(name)))`).eq('id', routineId).single(),
        supabase.from('workout_logs').select('id, is_complete, workout_log_entries(*)').eq('user_id', userId).eq('routine_id', routineId).gte('created_at', todayStart.toISOString()).lte('created_at', todayEnd.toISOString())
      ]);
      
      if (metricsRes.data) setUserWeightLbs(metricsRes.data.weight_lbs);
      if (routineRes.error) throw routineRes.error;
      const routineData = routineRes.data;
      setRoutine(routineData);
      
      if (todaysLogsRes.error) throw todaysLogsRes.error;
      const todaysLogsData = todaysLogsRes.data || [];
      const todaysEntriesMap = {};
      let activeLog = todaysLogsData.find(log => !log.is_complete);
      
      todaysLogsData.forEach(log => {
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
        const { data: newLog, error: newLogError } = await supabase.from('workout_logs').insert({ user_id: userId, routine_id: routineId, is_complete: false }).select('id').single();
        if (newLogError) throw newLogError;
        currentLogId = newLog.id;
      }
      setWorkoutLogId(currentLogId);

      if (routineData?.routine_exercises) {
        const prevLogPromises = routineData.routine_exercises.map(item => 
          supabase.rpc('get_entries_for_last_session', {
            p_user_id: userId,
            p_exercise_id: item.exercises.id,
          })
        );
        const prevLogResults = await Promise.all(prevLogPromises);
        const prevLogMap = {};
        prevLogResults.forEach((res, index) => {
          const exerciseId = routineData.routine_exercises[index].exercises.id;
          prevLogMap[exerciseId] = res.data || [];
        });
        setPreviousLog(prevLogMap);
      }

      if (!startTime) setStartTime(new Date());

    } catch (error) {
      console.error("A critical error occurred while fetching workout data:", error);
    } finally {
      // Golden Pattern: Use finally to guarantee loading is set to false
      setLoading(false);
    }
  }, [routineId, startTime]);

  // Golden Pattern: useEffect depends on user.id
  useEffect(() => {
    if (user) {
      fetchAndStartWorkout(user.id);
    } else {
      setLoading(false);
    }
  }, [user?.id, routineId, fetchAndStartWorkout]);
  
  const fetchChartData = useCallback(async (exerciseId) => {
    if (!user || !exerciseId) return;
    const { data, error } = await supabase
      .from('workout_log_entries')
      .select('created_at, weight_lifted_lbs')
      .eq('exercise_id', exerciseId)
      .order('created_at', { ascending: true });

    if (error) console.error("Error fetching chart data:", error);
    else {
      const formattedData = data.map(log => ({
        date: new Date(log.created_at).toLocaleDateString(),
        weight: log.weight_lifted_lbs,
      }));
      setChartData(formattedData);
    }
  }, [user]);

  useEffect(() => {
    if (activeView === 'chart' && selectedExercise) {
      fetchChartData(selectedExercise.id);
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
    const { data: newEntry, error } = await supabase.from('workout_log_entries').insert(newSetPayload).select().single();
    if (error) {
      alert("Could not save set. Please try again.");
      return;
    }
    
    const newTodaysLog = { ...todaysLog, [selectedExercise.id]: [...(todaysLog[selectedExercise.id] || []), newEntry] };
    setTodaysLog(newTodaysLog);
    setCurrentSet({ weight: currentSet.weight, reps: '' });

    const targetSets = routine.routine_exercises[selectedExerciseIndex]?.target_sets;
    const completedSets = newTodaysLog[selectedExercise.id].length;
    const isLastExercise = selectedExerciseIndex === routine.routine_exercises.length - 1;
    
    if (targetSets && completedSets >= targetSets) {
      if (isLastExercise) {
        setIsWorkoutCompletable(true);
      } else {
        setShouldAdvance(true);
      }
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
    if (!workoutLogId || !startTime) return;

    setIsTimerOpen(false);

    const duration_minutes = Math.round((new Date() - startTime) / 60000);
    const MET_VALUE = 5.0;
    const weight_kg = userWeightLbs * 0.453592;
    const duration_hours = duration_minutes / 60;
    const calories_burned = Math.round(MET_VALUE * weight_kg * duration_hours);

    const { error } = await supabase
      .from('workout_logs')
      .update({ is_complete: true, duration_minutes, ended_at: new Date().toISOString(), notes: routine.routine_name, calories_burned })
      .eq('id', workoutLogId);

    if (error) return alert(`Error finishing workout: ${error.message}`);
    setSuccessModalOpen(true);
  };
  
  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    navigate('/dashboard');
  };

  const handleDeleteSet = async (entryId) => {
    const { error } = await supabase.from('workout_log_entries').delete().eq('id', entryId);
    if (error) return alert("Could not delete set.");
    if (user) await fetchAndStartWorkout(user.id);
  };

  const handleEditSetClick = (set) => {
    setEditingSet({ entryId: set.id });
    setEditSetValue({ weight: set.weight_lifted_lbs, reps: set.reps_completed });
  };

  const handleUpdateSet = async () => {
    if (!editingSet) return;
    const { error } = await supabase
      .from('workout_log_entries')
      .update({ weight_lifted_lbs: parseInt(editSetValue.weight, 10), reps_completed: parseInt(editSetValue.reps, 10) })
      .eq('id', editingSet.entryId);
      
    if (error) return alert("Could not update set.");
    setEditingSet(null);
    if (user) await fetchAndStartWorkout(user.id);
  };

  const handleCancelEdit = () => setEditingSet(null);

  if (loading) return <div style={{color: 'white', padding: '2rem'}}>Loading Workout...</div>;

  return (
    <div className="workout-log-page-container">
      <SubPageHeader title={routine?.routine_name || 'Workout'} icon={<Dumbbell size={28} />} iconColor="#f97316" backTo="/workouts/select-routine-log" />
      
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

      <RestTimerModal 
        isOpen={isTimerOpen} 
        onClose={handleTimerClose}
        isWorkoutComplete={isWorkoutCompletable}
        onFinishWorkout={handleFinishWorkout}
      />
      
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
