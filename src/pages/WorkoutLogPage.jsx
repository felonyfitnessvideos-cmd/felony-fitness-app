// @ts-check

/**
 * @file WorkoutLogPage.jsx
 * @description The main page for actively logging a workout session based on a selected routine.
 * @project Felony Fitness
 *
 * @workflow
 * 1.  **Initialization**: On load, it receives a `routineId` from the URL. The `fetchAndStartWorkout`
 * function is called.
 * 2.  **Starting a Session**: This function checks for an incomplete `workout_logs` entry for the user
 * and routine for today. If one exists, it resumes it. If not, it creates a new one.
 * It also fetches the routine's details, today's logged sets, and the sets from the
 * previous session for this routine to display as a reference ("Last Time").
 * 3.  **Logging a Set**: The user selects an exercise from the thumbnail scroller. They input
 * weight and reps, which are pre-filled based on their last set (today's or previous).
 * Clicking "Save Set" calls `handleSaveSet`, which inserts a new row into the
 * `workout_log_entries` table.
 * 4.  **Rest Timer**: After a set is saved, a rest timer modal automatically appears.
 * 5.  **Advancement**: When the rest timer is closed, if all target sets for the current exercise
 * are complete, the component automatically advances to the next exercise. If it's the
 * last exercise, it readies the workout to be completed.
 * 6.  **Chart View**: The user can toggle to a "Chart" view, which calls `fetchChartDataForExercise`.
 * This function fetches historical performance data for the selected exercise by calling
 * different PostgreSQL RPC functions based on the chosen metric (1RM, Volume, etc.).
 * 7.  **Finishing**: When the user decides to finish, `handleFinishWorkout` calculates the total
 * duration and estimated calories burned, updates the `workout_logs` entry to mark it as
 * complete, and shows a success modal before navigating the user away.
 * 8.  **Editing/Deleting**: Users can also edit or delete sets they've logged for the current session.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import RestTimerModal from '../components/RestTimerModal.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import { Dumbbell, Edit2, Trash2, Check, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../AuthContext.jsx';
import './WorkoutLogPage.css';

/**
 * @typedef {object} SetEntry
 * @property {string} id
 * @property {number} set_number
 * @property {number} reps_completed
 * @property {number} weight_lifted_lbs
 * @property {string} exercise_id
 */

/**
 * @typedef {{[exerciseId: string]: SetEntry[]}} LogMap
 */

/**
 * @typedef {object} ChartDataPoint
 * @property {string} date
 * @property {number} value
 */

function WorkoutLogPage() {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [workoutLogId, setWorkoutLogId] = useState(null);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState({ weight: '', reps: '' });
  /** @type {[LogMap, React.Dispatch<React.SetStateAction<LogMap>>]} */
  const [todaysLog, setTodaysLog] = useState({});
  /** @type {[LogMap, React.Dispatch<React.SetStateAction<LogMap>>]} */
  const [previousLog, setPreviousLog] = useState({});
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [activeView, setActiveView] = useState('log');
  /** @type {[ChartDataPoint[], React.Dispatch<React.SetStateAction<ChartDataPoint[]>>]} */
  const [chartData, setChartData] = useState([]);
  const [chartMetric, setChartMetric] = useState('1RM');
  const [editingSet, setEditingSet] = useState(null);
  const [editSetValue, setEditSetValue] = useState({ weight: '', reps: '' });
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [shouldAdvance, setShouldAdvance] = useState(false);
  const [userWeightLbs, setUserWeightLbs] = useState(150);
  const [isWorkoutCompletable, setIsWorkoutCompletable] = useState(false);

  const selectedExercise = useMemo(() => routine?.routine_exercises[selectedExerciseIndex]?.exercises, [routine, selectedExerciseIndex]);

  /**
   * Effect to pre-populate the weight and reps inputs.
   * It prioritizes the last set from today's session, then falls back to the
   * last set from the previous session for that exercise.
   */
  useEffect(() => {
    if (!selectedExercise) return;

    const todaysSets = todaysLog[selectedExercise.id] || [];
    const previousSets = previousLog[selectedExercise.id] || [];
    let lastSet = null;

    if (todaysSets.length > 0) {
      lastSet = todaysSets[todaysSets.length - 1];
    } else if (previousSets.length > 0) {
      lastSet = previousSets[previousSets.length - 1];
    }

    if (lastSet) {
      setCurrentSet({ weight: lastSet.weight_lifted_lbs, reps: lastSet.reps_completed });
    } else {
      setCurrentSet({ weight: '', reps: '' });
    }
  }, [selectedExercise, todaysLog, previousLog]);

  /**
   * Fetches all initial data for the workout session. Finds or creates a workout log for the day,
   * fetches the selected routine's details, and loads today's and the previous session's logs.
   * @param {string} userId - The UUID of the authenticated user.
   * @async
   */
  const fetchAndStartWorkout = useCallback(async (userId) => {
    setLoading(true);
    try {
      const today = new Date().toLocaleDateString('en-CA');
      const [metricsRes, routineRes, todaysLogsRes] = await Promise.all([
        supabase.from('body_metrics').select('weight_lbs').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('workout_routines').select(`*, routine_exercises(target_sets, exercises(*, muscle_groups!muscle_group_id(name)))`).eq('id', routineId).single(),
        supabase.from('workout_logs').select('id, is_complete, workout_log_entries(*)').eq('user_id', userId).eq('routine_id', routineId).eq('workout_date', today)
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
    } catch (error) {
      console.error("A critical error occurred while fetching workout data:", error);
    } finally {
      setLoading(false);
    }
  }, [routineId]);

  useEffect(() => {
    if (user) {
      fetchAndStartWorkout(user.id);
    } else {
      setLoading(false);
    }
  }, [user?.id, routineId, fetchAndStartWorkout]);

  /**
   * Fetches historical performance data for a given exercise and metric.
   * @param {'1RM' | 'Weight Volume' | 'Set Volume'} metric - The performance metric to calculate.
   * @param {string} exerciseId - The UUID of the exercise.
   * @async
   */
  const fetchChartDataForExercise = useCallback(async (metric, exerciseId) => {
    if (!user || !exerciseId) return;
    setChartLoading(true);
    let functionName = '';
    switch (metric) {
      case 'Weight Volume': functionName = 'calculate_exercise_weight_volume'; break;
      case 'Set Volume': functionName = 'calculate_exercise_set_volume'; break;
      case '1RM': default: functionName = 'calculate_exercise_1rm'; break;
    }

    try {
      const { data, error } = await supabase.rpc(functionName, { 
        p_user_id: user.id,
        p_exercise_id: exerciseId 
      });
      if (error) throw error;
      
      const formattedData = data.map(item => ({
        date: new Date(item.log_date).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit'}),
        value: item.value,
      }));
      
      setChartData(formattedData);
    } catch (error) {
      console.error(`Error fetching ${metric} data:`, error);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeView === 'chart' && selectedExercise) {
      fetchChartDataForExercise(chartMetric, selectedExercise.id);
    }
  }, [activeView, chartMetric, selectedExercise, fetchChartDataForExercise]);

  /**
   * Saves a new set to the `workout_log_entries` table, updates local state, and opens the rest timer.
   * @async
   */
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

  /** Handles closing the rest timer and advancing to the next exercise if needed. */
  const handleTimerClose = () => {
    setIsTimerOpen(false);
    if (shouldAdvance) {
      if (selectedExerciseIndex < routine.routine_exercises.length - 1) {
        setSelectedExerciseIndex(prevIndex => prevIndex + 1);
      }
      setShouldAdvance(false);
    }
  };

  /**
   * Finalizes the workout by calculating duration and calories, updating the `workout_logs` entry, and showing a success modal.
   * @async
   */
  const handleFinishWorkout = async () => {
    if (!workoutLogId) return;
    setIsTimerOpen(false);

    try {
      const { data: logData, error: fetchError } = await supabase.from('workout_logs').select('created_at').eq('id', workoutLogId).single();
      if (fetchError) throw fetchError;
      
      const startTime = new Date(logData.created_at);
      const endTime = new Date();
      const duration_minutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      const MET_VALUE = 5.0; // General MET value for weightlifting
      const weight_kg = userWeightLbs * 0.453592;
      const duration_hours = duration_minutes / 60;
      const calories_burned = Math.round(MET_VALUE * weight_kg * duration_hours);

      const updatePayload = { 
        is_complete: true, 
        duration_minutes, 
        ended_at: endTime.toISOString(), 
        notes: routine.routine_name, 
        calories_burned 
      };
      
      const { error: updateError } = await supabase.from('workout_logs').update(updatePayload).eq('id', workoutLogId);
      if (updateError) throw updateError;
      
      setSuccessModalOpen(true);
    } catch (error) {
      alert(`Error finishing workout: ${error.message}`);
    }
  };
  
  /** Closes the success modal and navigates to the dashboard. */
  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    navigate('/dashboard');
  };

  /** Deletes a specific set from the current log. */
  const handleDeleteSet = async (entryId) => {
    const { error } = await supabase.from('workout_log_entries').delete().eq('id', entryId);
    if (error) return alert("Could not delete set.");
    if (user) await fetchAndStartWorkout(user.id);
  };

  /** Enters "edit mode" for a specific set. */
  const handleEditSetClick = (set) => {
    setEditingSet({ entryId: set.id });
    setEditSetValue({ weight: set.weight_lifted_lbs, reps: set.reps_completed });
  };

  /** Saves the updated values for a set being edited. */
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

  /** Exits "edit mode" without saving. */
  const handleCancelEdit = () => setEditingSet(null);

  if (loading) return <div className="loading-message">Loading Workout...</div>;

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
        <div className="chart-view-container">
            <div className="chart-metric-selector">
                <button className={chartMetric === '1RM' ? 'active' : ''} onClick={() => setChartMetric('1RM')}>1RM</button>
                <button className={chartMetric === 'Weight Volume' ? 'active' : ''} onClick={() => setChartMetric('Weight Volume')}>Weight Volume</button>
                <button className={chartMetric === 'Set Volume' ? 'active' : ''} onClick={() => setChartMetric('Set Volume')}>Set Volume</button>
            </div>
            <div className="chart-container">
            {chartLoading ? (<div className="loading-message">Loading Chart...</div>) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid stroke="#4a5568" strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="#a0aec0" />
                        <YAxis stroke="#a0aec0" domain={['dataMin - 10', 'dataMax + 10']} />
                        <Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} />
                        <Line type="monotone" dataKey="value" name={chartMetric} stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <p className="no-data-message">No progress data available for this exercise yet.</p>
            )}
            </div>
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