/**
 * @file ProgressPage.jsx
 * @description A page that displays the user's overall fitness progress, including summary statistics, trend charts, and goal tracking.
 * @project Felony Fitness
 *
 * @workflow
 * 1. On component mount, it checks for an authenticated user.
 * 2. It calls the `fetchProgressData` function to gather all necessary data in parallel from the database.
 * 3. This includes all completed workout logs, nutrition logs from a view, and all active goals for the user.
 * 4. The fetched data is then processed:
 * - Workout logs are used to calculate total workouts and average duration.
 * - Data is aggregated by date to create data points for the trend charts (workout duration and calories eaten).
 * - Averages for calories eaten and burned per day are calculated.
 * 5. All calculated stats and chart data are stored in the component's state to be rendered.
 * 6. The page displays these stats in cards, visualizes trends in charts using the `recharts` library, and lists the user's active goals with progress bars.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { TrendingUp, Dumbbell, Flame, BarChart3, Apple as AppleIcon } from 'lucide-react';
import LazyRecharts from '../components/LazyRecharts.jsx';
import { useAuth } from '../AuthContext.jsx';
import './ProgressPage.css';

/**
 * @typedef {object} ProgressStats
 * @property {number} totalWorkouts - The total number of completed workouts.
 * @property {number} avgDuration - The average duration of a workout in minutes.
 * @property {number} avgCalories - The average daily calories consumed.
 * @property {number} avgBurn - The average daily calories burned from workouts.
 * @property {number} activeGoals - The number of active goals.
 */

/**
 * @typedef {object} ChartDataPoint
 * @property {string} date - The date for the data point (e.g., "10/17/2025").
 * @property {number} [calories] - Total calories for that date.
 * @property {number} [duration] - Total workout duration for that date.
 */

/**
 * @typedef {object} Goal
 * @property {string} id
 * @property {string} goal_description
 * @property {number} current_value
 * @property {number} target_value
 */

function ProgressPage() {
  const { user } = useAuth();
  const userId = user?.id;
  /** @type {[ProgressStats, React.Dispatch<React.SetStateAction<ProgressStats>>]} */
  const [stats, setStats] = useState({ totalWorkouts: 0, avgDuration: 0, avgCalories: 0, avgBurn: 0, activeGoals: 0 });
  /** @type {[ChartDataPoint[], React.Dispatch<React.SetStateAction<ChartDataPoint[]>>]} */
  const [nutritionTrends, setNutritionTrends] = useState([]);
  /** @type {[ChartDataPoint[], React.Dispatch<React.SetStateAction<ChartDataPoint[]>>]} */
  const [workoutDurationTrends, setWorkoutDurationTrends] = useState([]);
  /** @type {[Goal[], React.Dispatch<React.SetStateAction<Goal[]>>]} */
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches and processes all data required for the progress page from the database.
   * @param {string} userId - The UUID of the currently authenticated user.
   * @async
   */
  // The fetchProgressData callback intentionally omits dependencies below.
  // Rationale: the Supabase client instance and React state setters used inside
  // this callback are stable for the lifetime of the app. Re-creating this
  // function on every render would be wasteful and cause unnecessary
  // re-fetches. We intentionally disable the exhaustive-deps rule here so
  // the hook remains stable. If this function needs to capture changing
  // values in the future, update the dependency array and the rationale.
   
  const fetchProgressData = useCallback(async (userId) => {
    try {
      const [workoutLogsRes, nutritionLogsRes, goalsRes] = await Promise.all([
        // Fetch only completed workouts to ensure accurate statistics.
        supabase.from('workout_logs')
          .select('duration_minutes, created_at, calories_burned')
          .eq('user_id', userId)
          .gt('duration_minutes', 0),
        
        // --- 1. THIS QUERY IS FIXED ---
        // Changed from 'v_nutrition_log_details' to the 'nutrition_logs' table
        // to get live, accurate data.
        supabase.from('nutrition_logs')
          .select('created_at, quantity_consumed, food_servings(calories)')
          .eq('user_id', userId),
        
        supabase.from('goals').select('*').eq('user_id', userId)
      ]);

      if(workoutLogsRes.error) throw workoutLogsRes.error;
      const workoutLogs = workoutLogsRes.data || [];
      
      // --- Calculate Workout Statistics ---
      const totalWorkouts = workoutLogs.length;
      const totalDuration = workoutLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
      const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
      
      const durationMap = new Map();
      const burnMap = new Map();
      workoutLogs.forEach(log => {
        const dt = new Date(log.created_at); // Creates date in local timezone

        // --- TIMEZONE FIX: Group by local date, not UTC date ---
        const year = dt.getFullYear();
        const month = (dt.getMonth() + 1).toString().padStart(2, '0');
        const day = dt.getDate().toString().padStart(2, '0');
        const localSortKey = `${year}-${month}-${day}`; // Sortable local date key
        const displayDate = dt.toLocaleDateString(); // Local display date

        const existingDuration = durationMap.get(localSortKey) || { date: displayDate, duration: 0 };
        existingDuration.duration += (log.duration_minutes || 0);
        durationMap.set(localSortKey, existingDuration);
        
        const existingBurn = burnMap.get(localSortKey) || { date: displayDate, burn: 0 };
        existingBurn.burn += (log.calories_burned || 0);
        burnMap.set(localSortKey, existingBurn);
      });
      // Sort by the local date key
      const workoutArray = Array.from(durationMap, ([iso, val]) => ({ iso, ...val }))
        .sort((a, b) => a.iso.localeCompare(b.iso))
        .map(({ date, duration }) => ({ date, duration }));
      setWorkoutDurationTrends(workoutArray);
      
      const totalBurn = Array.from(burnMap.values()).reduce((sum, obj) => sum + (obj.burn || 0), 0);
      const avgBurn = burnMap.size > 0 ? Math.round(totalBurn / burnMap.size) : 0;

      // --- Calculate Nutrition Statistics ---
      if(nutritionLogsRes.error) throw nutritionLogsRes.error;
      const nutritionLogs = nutritionLogsRes.data || [];

      const calorieMap = new Map();
      nutritionLogs.forEach(log => {
        const dt = new Date(log.created_at); // Creates date in local timezone
        
        // --- TIMEZONE FIX: Group by local date, not UTC date ---
        const year = dt.getFullYear();
        const month = (dt.getMonth() + 1).toString().padStart(2, '0');
        const day = dt.getDate().toString().padStart(2, '0');
        const localSortKey = `${year}-${month}-${day}`; // Sortable local date key
        const displayDate = dt.toLocaleDateString(); // Local display date

        const existing = calorieMap.get(localSortKey) || { date: displayDate, calories: 0 };
        
        // --- 2. THIS CALCULATION IS FIXED ---
        // We now calculate calories manually from the raw data.
        const quantity = log.quantity_consumed || 0;
        const caloriesPerServing = log.food_servings?.calories || 0;
        existing.calories += (quantity * caloriesPerServing);
        
        calorieMap.set(localSortKey, existing);
      });
      
      // Sort by the local date key
      const nutritionArray = Array.from(calorieMap, ([iso, val]) => ({ iso, ...val }))
        .sort((a, b) => a.iso.localeCompare(b.iso))
        .map(({ date, calories }) => ({ date, calories: Math.round(calories) }));
      setNutritionTrends(nutritionArray);
      
      const totalCalories = Array.from(calorieMap.values()).reduce((sum, val) => sum + (Number(val?.calories) || 0), 0);
      let avgCalories = 0;
      if (calorieMap.size > 0) {
        const rawAvg = totalCalories / calorieMap.size;
        avgCalories = Number.isFinite(rawAvg) ? Math.round(rawAvg) : 0;
      }
      
      // --- Set Goals Data ---
      if(goalsRes.error) throw goalsRes.error;
      const activeGoals = goalsRes.data || [];
      setGoals(activeGoals);
      
      setStats({ totalWorkouts, avgDuration, avgCalories, avgBurn, activeGoals: activeGoals.length });
    } catch (error) {
      console.error("Error fetching progress data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // The following effect intentionally depends only on the user's id and the
  // stable fetchProgressData function. We do NOT include the entire `user`
  // object because changes to its reference (that don't affect identity)
  // should not retrigger the fetch. Keep this comment as the rationale if
  // updating the dependency array in the future.
  useEffect(() => {
    if (userId) {
      fetchProgressData(userId);
    } else {
      setLoading(false);
    }
  }, [userId, fetchProgressData]);

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading Progress...</div>;
  // Inline chart rendering using LazyRecharts' render prop

  return (
    <div className="progress-container">
      <SubPageHeader title="Progress" icon={<TrendingUp size={28} />} iconColor="#f97316" backTo="/dashboard" />
      
      {/* Grid for displaying the main summary statistics */}
      <div className="stats-grid">
        <div className="stat-card"><BarChart3 size={24} /> <span>{stats.totalWorkouts}</span> Total Workouts</div>
        <div className="stat-card"><Dumbbell size={24} /> <span>{stats.avgDuration} min</span> Avg Duration</div>
        <div className="stat-card"><AppleIcon size={24} /> <span>{stats.avgCalories}</span> Avg Cals Eaten</div>
        <div className="stat-card"><Flame size={24} /> <span>{stats.avgBurn}</span> Avg Daily Burn</div>
      </div>

      {/* Grid for displaying the trend charts */}
      <div className="chart-grid">
        <div className="chart-card">
          <h3>Nutrition Trends (Calories Eaten)</h3>
          <LazyRecharts fallback={<div className="loading-message">Loading chart...</div>}>
            {(libs) => {
              const { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } = libs;
              return (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={nutritionTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis dataKey="date" stroke="#a0aec0" fontSize={12} />
                    <YAxis stroke="#a0aec0" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }} />
                    <Line type="monotone" dataKey="calories" name="Calories Eaten" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              );
            }}
          </LazyRecharts>
        </div>
        <div className="chart-card">
          <h3>Workout Duration (Minutes)</h3>
          <LazyRecharts fallback={<div className="loading-message">Loading chart...</div>}>
            {(libs) => {
              const { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } = libs;
              return (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={workoutDurationTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                    <XAxis dataKey="date" stroke="#a0aec0" fontSize={12} />
                    <YAxis stroke="#a0aec0" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }} />
                    <Bar dataKey="duration" name="Duration (min)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              );
            }}
          </LazyRecharts>
        </div>
      </div>

      {/* Section for displaying active goals and their progress */}
      <div className="goals-progress-section">
        <h3>Goals Progress</h3>
        {goals.map(goal => (
          <div key={goal.id} className="goal-progress-item">
            <div className="goal-progress-header">
              <span>{goal.goal_description}</span>
              <span>{goal.current_value || 0} / {goal.target_value || 0}</span>
            </div>
            <div className="goal-progress-bar-wrapper">
                {(() => {
                  const tv = Number(goal?.target_value) || 0;
                  const cv = Number(goal?.current_value) || 0;
                  const pct = tv > 0 ? Math.max(0, Math.min(100, (cv / tv) * 100)) : 0;
                  return <div className="goal-progress-bar" style={{ width: `${pct}%` }}></div>;
                })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressPage;