import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { TrendingUp, Dumbbell, Flame, CheckCircle, BarChart3, Apple as AppleIcon } from 'lucide-react';
import { LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart } from 'recharts';
import './ProgressPage.css';

function ProgressPage() {
  const [stats, setStats] = useState({ totalWorkouts: 0, avgDuration: 0, avgCalories: 0, avgBurn: 0, activeGoals: 0 });
  const [nutritionTrends, setNutritionTrends] = useState([]);
  const [workoutDurationTrends, setWorkoutDurationTrends] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProgressData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Get all logs from all time for this user
      const [workoutLogsRes, nutritionLogsRes, goalsRes] = await Promise.all([
        supabase.from('workout_logs').select('duration_minutes, created_at, calories_burned').eq('user_id', user.id),
        supabase.from('nutrition_logs').select('created_at, quantity_consumed, food_servings(calories)').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id)
      ]);

      // Process Workout Stats
      const workoutLogs = workoutLogsRes.data || [];
      if(workoutLogsRes.error) console.error("Workout Log Error:", workoutLogsRes.error);
      
      const totalWorkouts = workoutLogs.length;
      const totalDuration = workoutLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
      const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
      
      // Process Chart Data using the user's local timezone
      const durationMap = new Map();
      const burnMap = new Map();
      workoutLogs.forEach(log => {
        // Correctly group by local date
        const date = new Date(log.created_at).toLocaleDateString();
        durationMap.set(date, (durationMap.get(date) || 0) + log.duration_minutes);
        burnMap.set(date, (burnMap.get(date) || 0) + log.calories_burned);
      });
      setWorkoutDurationTrends(Array.from(durationMap, ([date, duration]) => ({ date, duration })));
      const totalBurn = Array.from(burnMap.values()).reduce((sum, val) => sum + val, 0);
      const avgBurn = burnMap.size > 0 ? Math.round(totalBurn / burnMap.size) : 0;

      // Process Nutrition Trends Chart Data
      const nutritionLogs = nutritionLogsRes.data || [];
      if(nutritionLogsRes.error) console.error("Nutrition Log Error:", nutritionLogsRes.error);

      const calorieMap = new Map();
      nutritionLogs.forEach(log => {
        // Correctly group by local date
        const date = new Date(log.created_at).toLocaleDateString();
        const calories = (log.food_servings?.calories || 0) * (log.quantity_consumed || 0);
        calorieMap.set(date, (calorieMap.get(date) || 0) + calories);
      });
      setNutritionTrends(Array.from(calorieMap, ([date, calories]) => ({ date, calories: Math.round(calories) })));
      const totalCalories = Array.from(calorieMap.values()).reduce((sum, val) => sum + val, 0);
      const avgCalories = calorieMap.size > 0 ? Math.round(totalCalories / calorieMap.size) : 0;
      
      // Process Goals
      const activeGoals = goalsRes.data || [];
      if(goalsRes.error) console.error("Goals Error:", goalsRes.error);
      setGoals(activeGoals);
      
      // Update all stats
      setStats({ totalWorkouts, avgDuration, avgCalories, avgBurn, activeGoals: activeGoals.length });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading Progress...</div>;

  return (
    <div className="progress-container">
      <SubPageHeader title="Progress" icon={<TrendingUp size={28} />} iconColor="#f97316" backTo="/dashboard" />
      
      <div className="stats-grid">
        <div className="stat-card"><BarChart3 size={24} /> <span>{stats.totalWorkouts}</span> Total Workouts</div>
        <div className="stat-card"><Dumbbell size={24} /> <span>{stats.avgDuration} min</span> Avg Duration</div>
        <div className="stat-card"><AppleIcon size={24} /> <span>{stats.avgCalories}</span> Avg Cals Eaten</div>
        <div className="stat-card"><Flame size={24} /> <span>{stats.avgBurn}</span> Avg Daily Burn</div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Nutrition Trends (Calories Eaten)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={nutritionTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="date" stroke="#a0aec0" fontSize={12} />
              <YAxis stroke="#a0aec0" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }} />
              <Legend />
              <Line type="monotone" dataKey="calories" name="Calories Eaten" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Workout Duration (Minutes)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={workoutDurationTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
              <XAxis dataKey="date" stroke="#a0aec0" fontSize={12} />
              <YAxis stroke="#a0aec0" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }} />
              <Legend />
              <Bar dataKey="duration" name="Duration (min)" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="goals-progress-section">
        <h3>Goals Progress</h3>
        {goals.map(goal => (
          <div key={goal.id} className="goal-progress-item">
            <div className="goal-progress-header">
              <span>{goal.goal_description}</span>
              <span>{goal.current_value || 0} / {goal.target_value}</span>
            </div>
            <div className="goal-progress-bar-wrapper">
              <div className="goal-progress-bar" style={{ width: `${((goal.current_value || 0) / goal.target_value) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressPage;