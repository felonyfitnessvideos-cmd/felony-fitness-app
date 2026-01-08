/**
 * @file ClientProgress.jsx
 * @description Compact client progress view for trainer dashboard
 * Shows all progress metrics from ProgressPage in a tight, optimized layout
 * 
 * @project Felony Fitness
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { TrendingUp, Dumbbell, Flame, BarChart3, Apple, Target } from 'lucide-react';
import LazyRecharts from '../LazyRecharts';
import { Client } from '../../types';
import { Tables } from '../../database.types.js';
import './ClientProgress.css';

interface ClientProgressProps {
  client: Client | null;
}

interface Stats {
  totalWorkouts: number;
  avgDuration: number;
  avgCalories: number;
  avgBurn: number;
  activeGoals: number;
}

interface TrendPoint {
  date: string;
  duration?: number;
  calories?: number;
  burn?: number;
}

/**
 * ClientProgress Component
 * 
 * Displays a client's progress metrics in a compact, trainer-optimized view
 * Optimized for 700px width with no scrolling needed
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.client - Selected client object with id and name
 * @returns {JSX.Element} Compact progress dashboard
 */
const ClientProgress = ({ client }: ClientProgressProps) => {
  const [stats, setStats] = useState<Stats>({ 
    totalWorkouts: 0, 
    avgDuration: 0, 
    avgCalories: 0, 
    avgBurn: 0, 
    activeGoals: 0 
  });
  const [nutritionTrends, setNutritionTrends] = useState<TrendPoint[]>([]);
  const [workoutDurationTrends, setWorkoutDurationTrends] = useState<TrendPoint[]>([]);
  const [goals, setGoals] = useState<Tables<'goals'>[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch all progress data for selected client
   */
  useEffect(() => {
    const fetchClientProgress = async (clientId: string) => {
      try {
        setLoading(true);

        const [workoutLogsRes, nutritionLogsRes, goalsRes] = await Promise.all([
          // Fetch completed workouts
          supabase.from('workout_logs')
            .select('duration_minutes, created_at, calories_burned')
            .eq('user_id', clientId)
            .gt('duration_minutes', 0),
          
          // Fetch nutrition logs
          supabase.from('nutrition_logs')
            .select('created_at, calories')
            .eq('user_id', clientId),
          
          // Fetch active goals
          supabase.from('goals')
            .select('*')
            .eq('user_id', clientId)
        ]);

        if (workoutLogsRes.error) throw workoutLogsRes.error;
        const workoutLogs = workoutLogsRes.data || [];
        
        // Calculate workout statistics
        const totalWorkouts = workoutLogs.length;
        const totalDuration = workoutLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
        const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
        
        // Group by local date for charts
        const durationMap = new Map<string, TrendPoint>();
        const burnMap = new Map<string, TrendPoint>();
        
        workoutLogs.forEach(log => {
          const dt = new Date(log.created_at);
          const year = dt.getFullYear();
          const month = (dt.getMonth() + 1).toString().padStart(2, '0');
          const day = dt.getDate().toString().padStart(2, '0');
          const localSortKey = `${year}-${month}-${day}`;
          const displayDate = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          const existingDuration = durationMap.get(localSortKey) || { date: displayDate, duration: 0 };
          existingDuration.duration! += (log.duration_minutes || 0);
          durationMap.set(localSortKey, existingDuration);
          
          const existingBurn = burnMap.get(localSortKey) || { date: displayDate, burn: 0 };
          existingBurn.burn! += (log.calories_burned || 0);
          burnMap.set(localSortKey, existingBurn);
        });
        
        const workoutArray = Array.from(durationMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, val]) => ({ date: val.date, duration: val.duration }))
          .slice(-7); // Last 7 days only for compact view
        
        setWorkoutDurationTrends(workoutArray);
        
        const totalBurn = Array.from(burnMap.values()).reduce((sum, obj) => sum + (obj.burn || 0), 0);
        const avgBurn = burnMap.size > 0 ? Math.round(totalBurn / burnMap.size) : 0;

        // Calculate nutrition statistics
        if (nutritionLogsRes.error) throw nutritionLogsRes.error;
        const nutritionLogs = nutritionLogsRes.data || [];

        const calorieMap = new Map<string, TrendPoint>();
        nutritionLogs.forEach(log => {
          const dt = new Date(log.created_at);
          const year = dt.getFullYear();
          const month = (dt.getMonth() + 1).toString().padStart(2, '0');
          const day = dt.getDate().toString().padStart(2, '0');
          const localSortKey = `${year}-${month}-${day}`;
          const displayDate = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          const existing = calorieMap.get(localSortKey) || { date: displayDate, calories: 0 };
          
          existing.calories! += (log.calories || 0);
          
          calorieMap.set(localSortKey, existing);
        });
        
        const nutritionArray = Array.from(calorieMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, val]) => ({ date: val.date, calories: Math.round(val.calories!) }))
          .slice(-7); // Last 7 days only
        
        setNutritionTrends(nutritionArray);
        
        const totalCalories = Array.from(calorieMap.values()).reduce((sum, val) => sum + (Number(val?.calories) || 0), 0);
        const avgCalories = calorieMap.size > 0 ? Math.round(totalCalories / calorieMap.size) : 0;
        
        // Set goals data
        if (goalsRes.error) throw goalsRes.error;
        const activeGoals = goalsRes.data || [];
        setGoals(activeGoals.slice(0, 3)); // Show top 3 goals only
        
        setStats({ totalWorkouts, avgDuration, avgCalories, avgBurn, activeGoals: activeGoals.length });
      } catch (error) {
        console.error("Error fetching client progress:", error);
      } finally {
        setLoading(false);
      }
    };

    if (client?.clientId) {
      fetchClientProgress(client.clientId);
    } else {
      // Clear data and loading state if no client is selected
      setStats({ totalWorkouts: 0, avgDuration: 0, avgCalories: 0, avgBurn: 0, activeGoals: 0 });
      setNutritionTrends([]);
      setWorkoutDurationTrends([]);
      setGoals([]);
      setLoading(false);
    }
  }, [client]);

  if (!client) {
    return (
      <div className="client-progress-placeholder">
        <TrendingUp size={48} />
        <h3>Select a Client</h3>
        <p>Click on a client card to view their progress metrics</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="client-progress-loading">
        <p>Loading {client.name}'s progress...</p>
      </div>
    );
  }

  return (
    <div className="client-progress-compact">
      <div className="progress-main-layout">
        {/* Left Section: Stats + Charts */}
        <div className="progress-left-section">
          {/* Compact Stats Row - 4 cards horizontal */}
          <div className="compact-stats-grid">
            <div className="compact-stat-card">
              <BarChart3 size={14} />
              <div className="stat-info">
                <span className="stat-value">{stats.totalWorkouts}</span>
                <span className="stat-label">Workouts</span>
              </div>
            </div>
            <div className="compact-stat-card">
              <Dumbbell size={14} />
              <div className="stat-info">
                <span className="stat-value">{stats.avgDuration}</span>
                <span className="stat-label">Avg Duration</span>
              </div>
            </div>
            <div className="compact-stat-card">
              <Apple size={14} />
              <div className="stat-info">
                <span className="stat-value">{stats.avgCalories}</span>
                <span className="stat-label">Avg Calories</span>
              </div>
            </div>
            <div className="compact-stat-card">
              <Flame size={14} />
              <div className="stat-info">
                <span className="stat-value">{stats.avgBurn}</span>
                <span className="stat-label">Daily Burn</span>
              </div>
            </div>
          </div>

          {/* Compact Charts - Side by Side */}
          <div className="compact-charts-row">
            <div className="compact-chart">
              <h4>Workout Duration (Minutes)</h4>
              {workoutDurationTrends.length > 0 ? (
                <LazyRecharts>
                  {(rechartsLib: Record<string, unknown>) => {
                    const { LineChart: _LineChart, Line: _Line, XAxis: _XAxis, YAxis: _YAxis, CartesianGrid: _CartesianGrid, Tooltip: _Tooltip, ResponsiveContainer: _ResponsiveContainer } = rechartsLib as Record<string, React.ComponentType<Record<string, unknown>>>;
                    return (
                      <_ResponsiveContainer width="100%" height="100%">
                        <_LineChart data={workoutDurationTrends} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                          <_CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <_XAxis dataKey="date" stroke="#888" />
                          <_YAxis stroke="#888" />
                          <_Tooltip 
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', fontSize: '11px' }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <_Line type="monotone" dataKey="duration" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 3 }} />
                        </_LineChart>
                      </_ResponsiveContainer>
                    );
                  }}  
                </LazyRecharts>
              ) : (
                <p className="no-data">No workout data yet</p>
              )}
            </div>

            <div className="compact-chart">
              <h4>Nutrition Trends (Calories Eaten)</h4>
              {nutritionTrends.length > 0 ? (
                <LazyRecharts>
                  {(rechartsLib: Record<string, unknown>) => {
                    const { LineChart: _LineChart, Line: _Line, XAxis: _XAxis, YAxis: _YAxis, CartesianGrid: _CartesianGrid, Tooltip: _Tooltip, ResponsiveContainer: _ResponsiveContainer } = rechartsLib as Record<string, React.ComponentType<Record<string, unknown>>>;
                    return (
                      <_ResponsiveContainer width="100%" height="100%">
                        <_LineChart data={nutritionTrends} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                          <_CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <_XAxis dataKey="date" stroke="#888" />
                          <_YAxis stroke="#888" />
                          <_Tooltip 
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', fontSize: '11px' }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <_Line type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                        </_LineChart>
                      </_ResponsiveContainer>
                    );
                  }}
                </LazyRecharts>
              ) : (
                <p className="no-data">No nutrition data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Goals */}
        <div className="progress-right-section">
          {goals.length > 0 ? (
            <div className="compact-goals">
              <h4><Target size={12} /> Goals Progress</h4>
              <div className="goals-list-compact">
                {goals.map(goal => {
                  const targetValue = goal.target_value ?? 0;
                  const currentValue = goal.current_value ?? 0;
                  const progress = targetValue > 0 
                    ? Math.min(100, Math.round((currentValue / targetValue) * 100))
                    : 0;
                  
                  return (
                    <div key={goal.id} className="goal-item-compact">
                      <div className="goal-text">
                        <span className="goal-desc">{goal.goal_description}</span>
                        <span className="goal-values">{currentValue} / {targetValue}</span>
                      </div>
                      <div className="goal-progress-bar">
                        <div className="goal-progress-fill" data-progress={progress}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="compact-goals">
              <h4><Target size={12} /> Goals Progress</h4>
              <p className="no-data">No active goals yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientProgress;
