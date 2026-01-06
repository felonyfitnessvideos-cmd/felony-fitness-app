/**
 * @fileoverview Active workout logging interface for resistance training sessions
 * @description Comprehensive workout tracking system managing set-by-set logging with
 * real-time progress tracking, RPE ratings, rest timers, historical performance data,
 * and automatic achievement triggers. Integrates with mesocycle programming and provides
 * intelligent form pre-filling based on previous workouts.
 * 
 * @author Felony Fitness Development Team  
 * @version 3.0.0
 * @since 2025-11-02
 */

import { Check, Dumbbell, Edit2, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../useAuth';
import LazyRecharts from '../components/LazyRecharts.jsx';
import RestTimerModal from '../components/RestTimerModal.jsx';
import RpeRatingModal from '../components/RpeRatingModal.jsx';
import SubPageHeader from '../components/SubPageHeader.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import { supabase } from '../supabaseClient.js';
import './WorkoutLogPage.css';

// --- 1. MODIFIED HELPER FUNCTION ---
/**
 * Converts a set number to a display string.
 * @param {number} num - The number of sets.
 * @returns {string} - The number as a string with "Sets".
 */
const formatSetCount = (num) => {
  if (num > 0) {
    return `${num} Sets`; // Changed from word to number
  }
  return ''; // Don't show anything if 0 or null/undefined
};

function WorkoutLogPage() {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userId = user?.id;

  const [routine, setRoutine] = useState(null);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const [saveSetLoading, setSaveSetLoading] = useState(false);
  const [rpcLoading, setRpcLoading] = useState(false);
  const [isWorkoutCompletable, setIsWorkoutCompletable] = useState(false);
  const isMountedRef = useRef(true);
  const [sessionMeta, setSessionMeta] = useState(null);
  const [showRpeModal, setShowRpeModal] = useState(true);
  const [showRestTimer, setShowRestTimer] = useState(true);
  const [userSettingsLoaded, setUserSettingsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [workoutLogId, setWorkoutLogId] = useState(() => {
    return localStorage.getItem('workoutLogId') || null;
  });
  const [currentSet, setCurrentSet] = useState({ weight: '', reps: '' });
  const [todaysLog, setTodaysLog] = useState({});
  const [previousLog, setPreviousLog] = useState({});
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isRpeModalOpen, setIsRpeModalOpen] = useState(false);
  const [pendingSetForRpe, setPendingSetForRpe] = useState(null);
  const [activeView, setActiveView] = useState('log');
  const [chartData, setChartData] = useState([]);
  const [chartMetric, setChartMetric] = useState('1RM');
  const [editingSet, setEditingSet] = useState(null);
  const [editSetValue, setEditSetValue] = useState({ weight: '', reps: '' });
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [userWeightLbs] = useState(150);
  const [mesocycleWeekId, setMesocycleWeekId] = useState(null);

  // --- Update user_profiles setting for RPE or Rest Timer ---
  const updateUserSetting = async (field, value) => {
    if (!userId) return;
    // Optimistically update UI
    if (field === 'use_rpe') setShowRpeModal(value);
    if (field === 'use_rest_timer') setShowRestTimer(value);
    await supabase
      .from('user_profiles')
      .update({ [field]: value })
      .eq('user_id', userId);
    // Optionally, refetch settings to ensure sync
    fetchUserSettings();
  };

  const selectedExercise = useMemo(() => {
    if (!routine || !routine.routine_exercises) return null;
    return routine.routine_exercises[selectedExerciseIndex]?.exercises || null;
  }, [routine, selectedExerciseIndex]);

  const selectedRoutineExercise = useMemo(() => {
    if (!routine || !routine.routine_exercises) return null;
    return routine.routine_exercises[selectedExerciseIndex] || null;
  }, [routine, selectedExerciseIndex]);

  // --- Prefill last set values for selected exercise ---
  useEffect(() => {
    if (!selectedExercise) return;
    const sets = todaysLog[String(selectedExercise.id)] || [];
    if (sets.length > 0) {
      const lastSet = sets[sets.length - 1];
      setCurrentSet({
        weight: lastSet.weight_lbs?.toString() || '',
        reps: lastSet.reps_completed?.toString() || ''
      });
    } else {
      setCurrentSet({ weight: '', reps: '' });
    }
  }, [selectedExerciseIndex, selectedExercise, todaysLog]);

  // --- Fetch routine from Supabase on mount or when routineId changes ---
  useEffect(() => {
    if (!routineId) return;
    let isMounted = true;
    const fetchRoutine = async () => {
      try {
        const { data, error } = await supabase
          .from('workout_routines')
          .select('*, routine_exercises(*, exercises(*))')
          .eq('id', routineId)
          .single();
        if (error) throw error;
        if (isMounted) setRoutine(data);
      } catch (err) {
        console.error('Failed to load routine:', err);
        if (isMounted) setRoutine(null);
      }
    };
    fetchRoutine();
    return () => { isMounted = false; };
  }, [routineId]);

  useEffect(() => { isMountedRef.current = true; return () => { isMountedRef.current = false; }; }, []);

  // Target sets (with deload/volume multiplier logic if needed)
  const adjustedTargetSets = useMemo(() => {
    if (!selectedRoutineExercise) return 1;
    let sets = Number(selectedRoutineExercise.target_sets) || 1;
    if (sessionMeta && sessionMeta.planned_volume_multiplier) {
      sets = Math.round(sets * sessionMeta.planned_volume_multiplier);
    }
    return sets;
  }, [selectedRoutineExercise, sessionMeta]);

  /**
   * Fetches or creates the workout log for today, loads previous log, and sets up session meta.
   */
  const fetchAndStartWorkout = useCallback(async (userId, options = {}) => {
    setLoading(true);
    try {
      if (!routineId || !userId) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayLocalDate = `${year}-${month}-${day}`;
      
      let { data: logs, error: logError } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('routine_id', routineId)
        .eq('is_complete', false)
        .eq('log_date', todayLocalDate)
        .order('created_at', { ascending: false })
        .limit(1);

      if (logError) console.error('Log fetch error:', logError);
      
      const log = logs && logs.length > 0 ? logs[0] : null;
      let logId = log?.id;

      if (!logId) {
        const payload = {
          user_id: userId,
          routine_id: routineId,
          is_complete: false,
          started_at: null,
          log_date: todayLocalDate,
        };
        if (options.mesocycleSessionId) {
          payload.cycle_session_id = options.mesocycleSessionId;
        }
        const { data: newLog, error: newLogError } = await supabase
          .from('workout_logs')
          .insert(payload)
          .select('id')
          .single();
        if (newLogError) throw newLogError;
        logId = newLog.id;
      }
      setWorkoutLogId(logId);
      if (logId) localStorage.setItem('workoutLogId', logId);

      const { data: todayEntries, error: todayEntriesError } = await supabase
        .from('workout_log_entries')
        .select('*')
        .eq('workout_log_id', logId);
      if (todayEntriesError) throw todayEntriesError;

      const todaysLogMap = {};
      for (const entry of todayEntries) {
        const exId = String(entry.exercise_id);
        if (!todaysLogMap[exId]) todaysLogMap[exId] = [];
        todaysLogMap[exId].push(entry);
      }
      setTodaysLog(todaysLogMap);

      const { data: prevLog } = await supabase
        .from('workout_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('routine_id', routineId)
        .eq('is_complete', true)
        .order('ended_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      let previousLogMap = {};
      if (prevLog?.id) {
        const { data: prevEntries } = await supabase
          .from('workout_log_entries')
          .select('*')
          .eq('workout_log_id', prevLog.id);
        for (const entry of prevEntries) {
          if (!previousLogMap[entry.exercise_id]) previousLogMap[entry.exercise_id] = [];
          previousLogMap[entry.exercise_id].push(entry);
        }
      }
      if (Object.keys(previousLogMap).length > 0) {
        setPreviousLog(previousLogMap);
      }

      if (log?.cycle_session_id || options.mesocycleSessionId) {
        const sessionId = log?.cycle_session_id || options.mesocycleSessionId;
        const { data: session, error: sessionError } = await supabase
          .from('cycle_sessions')
          .select('id, mesocycle_id, planned_volume_multiplier, is_deload')
          .eq('id', sessionId)
          .maybeSingle();
        if (!sessionError && session) {
          setSessionMeta(session);
        }
      }
    } catch (err) {
      console.error('Failed to fetch or start workout:', err);
    } finally {
      setLoading(false);
    }
  }, [routineId]);

  // --- USER SETTINGS: Fetch from user_profiles ---
  const fetchUserSettings = useCallback(async () => {
    if (!userId) return;
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('use_rpe, use_rest_timer')
      .eq('user_id', userId)
      .single();
    if (!error && profile) {
      setShowRpeModal(profile.use_rpe !== false);
      setShowRestTimer(profile.use_rest_timer !== false);
    }
    setUserSettingsLoaded(true);
  }, [userId]);

  useEffect(() => {
    fetchUserSettings();
  }, [fetchUserSettings]);

  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      fetchUserSettings();
    }, 5000);
    return () => clearInterval(interval);
  }, [userId, fetchUserSettings]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mwid = params.get('mesocycleWeekId');
    if (mwid) {
      setMesocycleWeekId(mwid);
    } else {
      setMesocycleWeekId(null);
    }

    if (userId && routineId) {
      const mesocycleSessionId = params.get('mesocycle_session_id');
      fetchAndStartWorkout(userId, { mesocycleSessionId });
    } else {
      setLoading(false);
    }
  }, [userId, routineId, location.search, fetchAndStartWorkout]);

  const fetchChartDataForExercise = useCallback(async (metric, exerciseId) => {
    if (!userId || !exerciseId) return;
    setChartLoading(true);
    let metricType = '';
    switch (metric) {
      case 'Weight Volume': metricType = 'weight_volume'; break;
      case 'Set Volume': metricType = 'set_volume'; break;
      case '1RM': default: metricType = '1rm'; break;
    }

    try {
      const { data, error } = await supabase.functions.invoke('exercise-chart-data', {
        body: {
          metric: metricType,
          user_id: userId,
          exercise_id: exerciseId,
          limit: 30
        }
      });
      if (error) throw error;

      const formattedData = data.data.map(item => ({
        date: new Date(item.log_date).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }),
        value: item.value,
      }));

      setChartData(formattedData);
    } catch (error) {
      console.error(`Error fetching ${metric} data:`, error);
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (activeView === 'chart' && selectedExercise) {
      fetchChartDataForExercise(chartMetric, selectedExercise.id);
    }
  }, [activeView, chartMetric, fetchChartDataForExercise, selectedExercise]);

  const handleSaveSet = async () => {
    if (!currentSet.reps || !currentSet.weight || !selectedExercise) return;
    if (saveSetLoading) return;
    setSaveSetLoading(true);
    
    try {
      let logIdToUse = workoutLogId;
      
      if (!logIdToUse) {
        const now = new Date();
        const startOfDayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const year = startOfDayLocal.getFullYear();
        const month = String(startOfDayLocal.getMonth() + 1).padStart(2, '0');
        const day = String(startOfDayLocal.getDate()).padStart(2, '0');
        const scheduledDateStr = `${year}-${month}-${day}`;
        
        const payload = {
          user_id: userId,
          routine_id: routine.id,
          is_complete: false,
          started_at: new Date().toISOString(),
        };
        
        const { data: matchingSession } = await supabase
          .from('cycle_sessions')
          .select('id,mesocycle_id')
          .eq('user_id', userId)
          .eq('routine_id', routine.id)
          .eq('scheduled_date', scheduledDateStr)
          .maybeSingle();
          
        if (matchingSession && matchingSession.id) {
          payload.cycle_session_id = matchingSession.id;
        }
        
        const { data: newLog, error: newLogError } = await supabase
          .from('workout_logs')
          .insert(payload)
          .select('id')
          .single();
          
        if (newLogError) {
          console.error('[WorkoutLog] Failed to create log:', newLogError);
          alert("Could not create workout log. Please try again.");
          setSaveSetLoading(false);
          return;
        }
        
        logIdToUse = newLog.id;
        setWorkoutLogId(logIdToUse);
        if (logIdToUse) localStorage.setItem('workoutLogId', logIdToUse);
        
        if (matchingSession && matchingSession.id) {
          setSessionMeta(prev => ({ ...(prev || {}), id: matchingSession.id, mesocycle_id: matchingSession.mesocycle_id }));
        }

      } else {
        const isFirstSetOfWorkout = Object.keys(todaysLog).every(key => !todaysLog[key] || todaysLog[key].length === 0);
        if (isFirstSetOfWorkout) {
          const { error: updateError } = await supabase
            .from('workout_logs')
            .update({ started_at: new Date().toISOString() })
            .eq('id', workoutLogId)
            .is('started_at', null);
          
          if (updateError) {
            console.warn('Could not set started_at:', updateError);
          }
        }
      }
    
      const exId = String(selectedExercise.id);
      const newSetPayload = {
        workout_log_id: logIdToUse,
        exercise_id: selectedExercise.id,
        set_number: (todaysLog[exId]?.length || 0) + 1,
        reps_completed: parseInt(currentSet.reps, 10),
        weight_lbs: parseInt(currentSet.weight, 10),
      };
      
      const { data: newEntry, error } = await supabase.from('workout_log_entries').insert(newSetPayload).select().single();
      
      if (error) {
        console.error('[WorkoutLog] Failed to save set:', error);
        alert("Could not save set. Please try again." + (error?.message ? ` (${error.message})` : ''));
        setSaveSetLoading(false);
        return;
      }

      const newTodaysLog = { ...todaysLog, [exId]: [...(todaysLog[exId] || []), newEntry] };

      setTodaysLog(newTodaysLog);

      setCurrentSet({
        weight: newEntry.weight_lbs?.toString() || '',
        reps: newEntry.reps_completed?.toString() || ''
      });

      const currentRoutineExercise = routine.routine_exercises[selectedExerciseIndex];
      const currentExerciseId = currentRoutineExercise?.exercises?.id;
      const setsForCurrent = (newTodaysLog[currentExerciseId] || []).length;
      const targetSetsForCurrent = Number(currentRoutineExercise?.target_sets) || 1;
      const isLastSetOfCurrent = setsForCurrent >= targetSetsForCurrent;
      const isLastExercise = selectedExerciseIndex === routine.routine_exercises.length - 1;
      const currentSupersetId = currentRoutineExercise?.superset_id;

      if (currentSupersetId) {
        const supersetExercises = routine.routine_exercises
          .map((ex, idx) => ({ ...ex, idx }))
          .filter(ex => ex.superset_id === currentSupersetId);
        const supersetIdx = supersetExercises.findIndex(ex => ex.idx === selectedExerciseIndex);
        const isLastSupersetExercise = supersetIdx === supersetExercises.length - 1;

        if (!isLastSetOfCurrent) {
          if (!isLastSupersetExercise) {
            setSelectedExerciseIndex(supersetExercises[supersetIdx + 1].idx);
          } else {
            setSelectedExerciseIndex(supersetExercises[0].idx);
          }
        } else {
          const allSupersetSetsComplete = supersetExercises.every(ex => {
            const setsDone = (newTodaysLog[ex.exercises.id] || []).length;
            const setsTarget = Number(ex.target_sets) || 1;
            return setsDone >= setsTarget;
          });
          if (allSupersetSetsComplete) {
            const afterSupersetIdx = supersetExercises[supersetExercises.length - 1].idx + 1;
            if (afterSupersetIdx < routine.routine_exercises.length) {
              setSelectedExerciseIndex(afterSupersetIdx);
            } else {
              setIsWorkoutCompletable(true);
            }
          } else {
            const firstIncomplete = supersetExercises.find(ex => {
              const setsDone = (newTodaysLog[ex.exercises.id] || []).length;
              const setsTarget = Number(ex.target_sets) || 1;
              return setsDone < setsTarget;
            });
            if (firstIncomplete) {
              setSelectedExerciseIndex(firstIncomplete.idx);
            } else {
              setSelectedExerciseIndex(supersetExercises[0].idx);
            }
          }
        }
      } else {
        if (isLastSetOfCurrent) {
          if (!isLastExercise) {
            setSelectedExerciseIndex(selectedExerciseIndex + 1);
          } else {
            setIsWorkoutCompletable(true);
          }
        }
      }
      setPendingSetForRpe({ ...newEntry, _showRestTimer: true });
      
      if (userSettingsLoaded && showRpeModal) {
        setIsRpeModalOpen(true);
      } else if (userSettingsLoaded && showRestTimer) {
        setIsTimerOpen(true);
      }
      
      setSaveSetLoading(false);
    } catch (err) {
      console.error('[WorkoutLog] Error in handleSaveSet:', err);
      alert("Could not save set. Please try again.");
      setSaveSetLoading(false);
    }
  };

  const handleRpeRating = async (rating) => {
    if (pendingSetForRpe && rating) {
      const { error } = await supabase
        .from('workout_log_entries')
        .update({ rpe_rating: rating })
        .eq('id', pendingSetForRpe.id);
      if (error) {
        console.error('[WorkoutLog] Failed to save RPE rating:', error);
      } else {
        setTodaysLog(prev => {
          const updated = { ...prev };
          const exId = String(selectedExercise.id);
          if (updated[exId]) {
            updated[exId] = updated[exId].map(entry => 
              entry.id === pendingSetForRpe.id 
                ? { ...entry, rpe_rating: rating }
                : entry
            );
          }
          return updated;
        });
      }
    }
    setIsRpeModalOpen(false);
    
    if (
      pendingSetForRpe &&
      pendingSetForRpe._showRestTimer &&
      userSettingsLoaded &&
      showRestTimer
    ) {
      setIsTimerOpen(true);
    }
    setPendingSetForRpe(null);
  };

  const handleSkipRpe = () => {
    setIsRpeModalOpen(false);
    if (
      pendingSetForRpe &&
      pendingSetForRpe._showRestTimer &&
      userSettingsLoaded &&
      showRestTimer
    ) {
      setIsTimerOpen(true);
    }
    setPendingSetForRpe(null);
  };

  const handleTimerClose = () => {
    setIsTimerOpen(false);
  };

  const handleFinishWorkout = async () => {
    if (!workoutLogId) return;
    setIsTimerOpen(false);

    try {
      const { data: logData, error: fetchError } = await supabase.from('workout_logs').select('started_at, created_at').eq('id', workoutLogId).single();
      if (fetchError) throw fetchError;

      const startTime = logData.started_at ? new Date(logData.started_at) : new Date(logData.created_at);
      const endTime = new Date();
      const duration_minutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      const MET_VALUE = 5.0;
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

      const { error: updateError } = await supabase.from('workout_logs').update(updatePayload).eq('id', workoutLogId).eq('user_id', userId);
      if (updateError) throw updateError;

      if (mesocycleWeekId) {
        try {
          await supabase
            .from('mesocycle_weeks')
            .update({ 
              is_complete: true, 
              completed_at: endTime.toISOString() 
            })
            .eq('id', mesocycleWeekId);
        } catch (err) {
          console.error('[MESOCYCLE] Exception updating mesocycle_weeks:', err);
        }
      }

      try {
        if (sessionMeta?.id) {
          if (userId) await supabase.from('cycle_sessions').update({ is_complete: true }).eq('id', sessionMeta.id).eq('user_id', userId);
        } else {
          const createdDate = new Date(logData.created_at);
          const year = createdDate.getFullYear();
          const month = String(createdDate.getMonth() + 1).padStart(2, '0');
          const day = String(createdDate.getDate()).padStart(2, '0');
          const startDateStr = `${year}-${month}-${day}`;
          const { data: found } = await supabase.from('cycle_sessions').select('id').eq('user_id', userId).eq('routine_id', routineId).eq('scheduled_date', startDateStr).maybeSingle();
          if (found && found.id) {
            await supabase.from('cycle_sessions').update({ is_complete: true }).eq('id', found.id).eq('user_id', userId);
          }
        }
      } catch (err) {
        if (err?.code && err.code !== '42703') console.warn('Could not mark cycle_session complete:', err?.message ?? err);
      }

      setSuccessModalOpen(true);
      localStorage.removeItem('workoutLogId');
    } catch (error) {
      alert(`Error finishing workout: ${error.message}`);
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    navigate('/dashboard');
  };

  const handleDeleteSet = async (entryId) => {
    if (rpcLoading) return;
    setRpcLoading(true);
    try {
      const { error } = await supabase.functions.invoke('delete-workout-set', {
        body: { entry_id: entryId }
      });
      if (error) {
        console.error("Secure delete failed:", error);
        return alert("Could not delete set." + (error?.message ? ` (${error.message})` : ''));
      }
      
      setTodaysLog(prevLog => {
        const updatedLog = { ...prevLog };
        Object.keys(updatedLog).forEach(exerciseId => {
          updatedLog[exerciseId] = updatedLog[exerciseId].filter(entry => entry.id !== entryId);
        });
        return updatedLog;
      });

    } finally {
      if (isMountedRef.current) setRpcLoading(false);
    }
  };

  const handleEditSetClick = (set) => {
    setEditingSet({ entryId: set.id });
    setEditSetValue({ weight: set.weight_lbs, reps: set.reps_completed });
  };

  const handleUpdateSet = async () => {
    if (!editingSet) return;
    if (rpcLoading) return;
    setRpcLoading(true);
    try {
      const newWeight = parseInt(editSetValue.weight, 10);
      const newReps = parseInt(editSetValue.reps, 10);
      
      const { error } = await supabase.functions.invoke('update-workout-set', {
        body: {
          entry_id: editingSet.entryId,
          weight_lbs: newWeight,
          reps_completed: newReps
        }
      });

      if (error) {
        console.error("Secure update failed:", error);
        return alert("Could not update set." + (error?.message ? ` (${error.message})` : ''));
      }

      setTodaysLog(prevLog => {
        const updatedLog = { ...prevLog };
        Object.keys(updatedLog).forEach(exerciseId => {
          updatedLog[exerciseId] = updatedLog[exerciseId].map(entry => {
            if (entry.id === editingSet.entryId) {
              return {
                ...entry,
                weight_lbs: newWeight,
                reps_completed: newReps
              };
            }
            return entry;
          });
        });
        return updatedLog;
      });
      
      if (isMountedRef.current) setEditingSet(null);

    } catch (refreshError) {
      console.error('[WorkoutLog] Failed to update set:', refreshError);
      alert('Failed to update set. Please try again.');
    } finally {
      if (isMountedRef.current) setRpcLoading(false);
    }
  };

  const handleCancelEdit = () => setEditingSet(null);

  if (loading) {
    return (
      <div className="workout-log-page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="loading-message">Loading workout log...</div>
      </div>
    );
  }

  // Allow an optional returnTo query param so callers (like mesocycle log) can
  // control where the back button should go after viewing/editing a session.
  const queryParams = new URLSearchParams(location.search);
  const returnTo = queryParams.get('returnTo') || '/workouts/select-routine-log';

  return (
    <div className="workout-log-page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SubPageHeader title={routine?.routine_name || 'Workout'} icon={<Dumbbell size={28} />} iconColor="#f97316" backTo={returnTo} />
        <button
          style={{
            fontSize: 'clamp(0.55rem, 2vw, 0.75rem)',
            padding: '4px 6px',
            margin: '0 0.5rem',
            borderRadius: 4,
            background: '#f97316',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            minWidth: 0,
            height: 'auto',
            alignSelf: 'flex-start',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            letterSpacing: 0,
            fontWeight: 600,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleFinishWorkout}
          disabled={!workoutLogId || saveSetLoading}
          title="Finish and Save Workout"
        >
          Save Workout
        </button>
      </div>

      {/* --- User Settings Toggles --- */}
      <div style={{ display: 'flex', gap: '2rem', margin: '1rem 0 0.5rem 0', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={showRpeModal}
            onChange={e => updateUserSetting('use_rpe', e.target.checked)}
            style={{ accentColor: '#f97316' }}
          />
          Use RPE Scale
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={showRestTimer}
            onChange={e => updateUserSetting('use_rest_timer', e.target.checked)}
            style={{ accentColor: '#f97316' }}
          />
          Use Rest Timer
        </label>
      </div>

      <div className="log-toggle-header">
        <div className="log-toggle">
          <button className={`toggle-btn ${activeView === 'log' ? 'active' : ''}`} onClick={() => setActiveView('log')}>Log</button>
          <button className={`toggle-btn ${activeView === 'chart' ? 'active' : ''}`} onClick={() => setActiveView('chart')}>Chart</button>
        </div>
      </div>

      <div className="thumbnail-scroller">
        {routine?.routine_exercises.map((item, index) => (
          <button key={item.exercises.id} className={`thumbnail-btn ${index === selectedExerciseIndex ? 'selected' : ''}`} onClick={() => setSelectedExerciseIndex(index)}>
            <img
              src={item.exercises.thumbnail_url || 'https://placehold.co/50x50/4a556j8/ffffff?text=IMG'}
              alt={item.exercises.name}
              width="50"
              height="50"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <h2 className="current-exercise-name">
        {selectedExercise?.name}
        {adjustedTargetSets > 0 && (
          <span className="set-count-subtitle">
            &nbsp;- {formatSetCount(adjustedTargetSets)}
            {selectedRoutineExercise?.negative && (
              <span className="negative-badge" style={{
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #f87171',
                borderRadius: 4,
                padding: '2px 8px',
                marginLeft: 8,
                fontWeight: 700,
                fontSize: '0.85em',
                verticalAlign: 'middle',
              }}>Negative</span>
            )}
            {selectedRoutineExercise?.drop_set && (
              <span className="drop-set-badge" style={{
                background: '#fef9c3',
                color: '#92400e',
                border: '1px solid #fde68a',
                borderRadius: 4,
                padding: '2px 8px',
                marginLeft: 8,
                fontWeight: 700,
                fontSize: '0.85em',
                verticalAlign: 'middle',
              }}>Drop Set</span>
            )}
            {selectedRoutineExercise?.superset_id && (
              <span className="superset-badge" style={{
                background: '#cffafe',
                color: '#0369a1',
                border: '1px solid #67e8f9',
                borderRadius: 4,
                padding: '2px 8px',
                marginLeft: 8,
                fontWeight: 700,
                fontSize: '0.85em',
                verticalAlign: 'middle',
              }}>Superset</span>
            )}
            {selectedRoutineExercise?.is_warmup && (
              <span className="warmup-badge" style={{
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
                borderRadius: 4,
                padding: '2px 8px',
                marginLeft: 8,
                fontWeight: 700,
                fontSize: '0.85em',
                verticalAlign: 'middle',
              }}>Warmup</span>
            )}
            {sessionMeta && sessionMeta.planned_volume_multiplier !== 1 && (
              <em style={{ marginLeft: '0.5rem', fontWeight: 400, fontSize: '0.85rem' }}> (base: {formatSetCount(selectedRoutineExercise?.target_sets)})</em>
            )}
          </span>
        )}
        {sessionMeta?.is_deload && (
          <div style={{ marginLeft: '0.5rem', color: '#92400e', fontSize: '0.85rem' }}>Deload week — volume reduced</div>
        )}
      </h2>

      {activeView === 'log' ? (
        <>
          <div className="log-inputs">
            <div className="input-group">
              <label>Weight</label>
              <input type="text" inputMode="decimal" pattern="[0-9.]*" value={currentSet.weight} onChange={(e) => setCurrentSet(prev => ({ ...prev, weight: e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1') }))} placeholder="0" />
            </div>
            <div className="input-group">
              <label>Reps</label>
              <input type="text" inputMode="numeric" pattern="[0-9]*" value={currentSet.reps} onChange={(e) => setCurrentSet(prev => ({ ...prev, reps: e.target.value.replace(/\D/g, '') }))} placeholder="0" />
            </div>
          </div>
          <button className="save-set-button" onClick={handleSaveSet} disabled={saveSetLoading}>{saveSetLoading ? 'Saving...' : 'Save Set'}</button>

          <div className="log-history-container">
            <div className="log-history-column">
              <h3>Today</h3>
              <ul>
                {(todaysLog[String(selectedExercise?.id)] || []).map((set) => (
                  <li
                    key={set.id}
                    style={selectedExercise?.negative ? {
                      background: '#fee2e2',
                      border: '1px solid #f87171',
                      borderRadius: 4,
                      marginBottom: 4,
                    } : {}}
                  >
                    {editingSet && editingSet.entryId === set.id ? (
                      <div className="edit-set-form">
                        <input type="text" inputMode="decimal" pattern="[0-9.]*" value={editSetValue.weight} onChange={(e) => setEditSetValue(prev => ({ ...prev, weight: e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\./g, '$1') }))} />
                        <span>lbs x</span>
                        <input type="text" inputMode="numeric" pattern="[0-9]*" value={editSetValue.reps} onChange={(e) => setEditSetValue(prev => ({ ...prev, reps: e.target.value.replace(/\D/g, '') }))} />
                        <button onClick={handleUpdateSet} className="edit-action-btn save" disabled={rpcLoading}><Check size={16} /></button>
                        <button onClick={handleCancelEdit} className="edit-action-btn cancel" disabled={rpcLoading}><X size={16} /></button>
                      </div>
                    ) : (
                      <>
                        <span>
                          {set.weight_lbs} lbs x {set.reps_completed}
                          {set.rpe_rating && <span className="rpe-badge">RPE {set.rpe_rating}</span>}
                          {selectedExercise?.negative && (
                            <span className="negative-badge" style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid #f87171',
                              borderRadius: 4,
                              padding: '2px 8px',
                              marginLeft: 8,
                              fontWeight: 700,
                              fontSize: '0.85em',
                              verticalAlign: 'middle',
                            }}>Negative</span>
                          )}
                        </span>
                        <div className="set-actions">
                          <button onClick={() => handleEditSetClick(set)} disabled={rpcLoading}><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteSet(set.id)} disabled={rpcLoading}><Trash2 size={14} /></button>
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
                {(previousLog[String(selectedExercise?.id)] || []).map((set, index) => (
                  <li key={index}>
                    <span>
                      {set.weight_lbs} lbs x {set.reps_completed}
                      {set.rpe_rating && <span className="rpe-badge rpe-previous">RPE {set.rpe_rating}</span>}
                    </span>
                  </li>
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
            {chartLoading ? (
              <div className="loading-message">Loading Chart...</div>
            ) : chartData.length > 0 ? (
              <LazyRecharts fallback={<div className="loading-message">Loading chart...</div>}>
                {// libs is used inside JSX via property access; ESLint sometimes flags this as unused
                   
                  (libs) => (
                    <libs.ResponsiveContainer width="100%" height={250}>
                      <libs.LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <libs.CartesianGrid stroke="#4a5568" strokeDasharray="3 3" />
                        <libs.XAxis dataKey="date" stroke="#a0aec0" />
                        <libs.YAxis stroke="#a0aec0" domain={["dataMin - 10", "dataMax + 10"]} />
                        <libs.Tooltip contentStyle={{ backgroundColor: '#2d3748', border: '1px solid #4a5568' }} />
                        <libs.Line type="monotone" dataKey="value" name={chartMetric} stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                      </libs.LineChart>
                    </libs.ResponsiveContainer>
                  )}
              </LazyRecharts>
            ) : (
              <p className="no-data-message">No progress data available for this exercise yet.</p>
            )}
          </div>
        </div>
      )}

      <RpeRatingModal
        isOpen={isRpeModalOpen}
        onRatingSelect={handleRpeRating}
        onSkip={handleSkipRpe}
      />

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
