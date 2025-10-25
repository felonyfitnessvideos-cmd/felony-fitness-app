 
/**
 * @file DashboardPage.jsx
 * @description The main dashboard page, serving as the central hub for the user's daily stats.
 * @project Felony Fitness
 */

/**
 * DashboardPage.jsx
 *
 * The landing page after sign-in. Aggregates small widgets (progress,
 * recommended workouts, nutrition snapshot) and links into deeper pages.
 * Keep this file lightweight — heavy logic belongs in components.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../AuthContext.jsx';
import './DashboardPage.css';

const motivationalQuotes = [
  "Consistency beats intensity.",
  "Your only limit is you.",
  "Success is earned in the gym.",
  "Strive for progress, not perfection.",
];

/**
 * @typedef {object} DailyGoals
 * @property {number} calories
 * @property {number} protein
 * @property {number} water
 */

/**
 * @typedef {object} DailyNutrition
 * @property {number} calories
 * @property {number} protein
 * @property {number} water
 */

/**
 * @typedef {object} DailyTraining
 * @property {string} name
 * @property {number} duration
 * @property {number} calories
 */

/**
 * @typedef {object} ActiveGoal
 * @property {string} id
 * @property {string} goal_description
 * @property {number} current_value
 * @property {number} target_value
 */

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;
  
  const [quote, setQuote] = useState('');
  /** @type {[DailyGoals, React.Dispatch<React.SetStateAction<DailyGoals>>]} */
  const [goals, setGoals] = useState({ calories: 0, protein: 0, water: 0 });
  /** @type {[DailyNutrition, React.Dispatch<React.SetStateAction<DailyNutrition>>]} */
  const [nutrition, setNutrition] = useState({ calories: 0, protein: 0, water: 0 });
  /** @type {[DailyTraining, React.Dispatch<React.SetStateAction<DailyTraining>>]} */
  const [training, setTraining] = useState({ name: 'Rest Day', duration: 0, calories: 0 });
  /** @type {[ActiveGoal[], React.Dispatch<React.SetStateAction<ActiveGoal[]>>]} */
  const [activeGoals, setActiveGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches all necessary data for the dashboard from Supabase in parallel.
   * @param {string} userId - The UUID of the currently authenticated user.
   * @async
   */
  const fetchDashboardData = useCallback(async (userId) => {
    setLoading(true);
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);

      const [profileRes, nutritionLogsRes, goalsRes, workoutLogRes] = await Promise.all([
        supabase.from('user_profiles').select('daily_calorie_goal, daily_protein_goal, daily_water_goal_oz').eq('id', userId).single(),
        supabase.from('nutrition_logs').select('quantity_consumed, water_oz_consumed, food_servings(calories, protein_g)').eq('user_id', userId).gte('created_at', todayStart.toISOString()).lt('created_at', tomorrowStart.toISOString()),
        supabase.from('goals').select('*').eq('user_id', userId),
        // **FIX APPLIED**: Removed `.single()` to prevent 406 error. The query now returns an array.
        supabase.from('workout_logs').select('notes, duration_minutes, calories_burned').eq('user_id', userId).gte('created_at', todayStart.toISOString()).lt('created_at', tomorrowStart.toISOString()).order('created_at', { ascending: false }).limit(1)
      ]);

      if (profileRes.data) {
        setGoals({ calories: profileRes.data.daily_calorie_goal || 0, protein: profileRes.data.daily_protein_goal || 0, water: profileRes.data.daily_water_goal_oz || 0 });
      }

      if (nutritionLogsRes.data) {
        const totals = nutritionLogsRes.data.reduce((acc, log) => {
          if (log.food_servings) {
            acc.calories += (log.food_servings.calories || 0) * log.quantity_consumed;
            acc.protein += (log.food_servings.protein_g || 0) * log.quantity_consumed;
          }
          if (log.water_oz_consumed) {
            acc.water += log.water_oz_consumed;
          }
          return acc;
        }, { calories: 0, protein: 0, water: 0 });

        setNutrition({
            calories: Math.round(totals.calories),
            protein: Math.round(totals.protein),
            water: totals.water,
        });
      }
      
      if (goalsRes.data) {
        setActiveGoals(goalsRes.data);
      }
      
      if (workoutLogRes.error) { 
        throw workoutLogRes.error;
      }

      // **FIX APPLIED**: Check the array and take the first element if it exists.
      const latestWorkout = workoutLogRes.data?.[0];
      if (latestWorkout) {
        setTraining({
          name: latestWorkout.notes,
          duration: latestWorkout.duration_minutes,
          calories: latestWorkout.calories_burned
        });
      } else {
        setTraining({ name: 'Rest Day', duration: 0, calories: 0 });
      }

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setTraining({ name: 'Rest Day', duration: 0, calories: 0 });
    } finally {
        setLoading(false);
    }
  }, []);

  // Only depend on the user's id and the stable fetchDashboardData callback.
  // Rationale: including the whole `user` object can cause unnecessary
  // re-fetches if its reference changes while identity (id) remains the same.
  // We intentionally depend only on `userId` and stable callbacks below.
  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
    
    if (userId) {
      fetchDashboardData(userId);
    } else {
      setLoading(false);
    }
  }, [userId, fetchDashboardData]);

  /**
   * Notes
   * - Some queries return arrays even when selecting a single row; other
   *   times `.single()` is appropriate. We've opted to defensively handle
   *   both shapes in `fetchDashboardData` and default to sensible fallbacks
   *   when data is missing.
   */
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const netCalories = nutrition.calories - (training?.calories || 0);
  const adjustedCalorieGoal = goals.calories + (training?.calories || 0);
  const calorieProgress = adjustedCalorieGoal > 0 ? (nutrition.calories / adjustedCalorieGoal) * 100 : 0;
  const proteinProgress = goals.protein > 0 ? (nutrition.protein / goals.protein) * 100 : 0;
  const waterProgress = goals.water > 0 ? (nutrition.water / goals.water) * 100 : 0;

  if (loading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading Dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-spacer"></div>
        <div className="header-title-wrapper">
          <h1>FELONY FITNESS</h1>
          <div className="header-underline"></div>
        </div>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>

      <Link to="/nutrition" className="dashboard-card nutrition-card">
        <div className="card-header">
          <span>🍎</span>
          <h3>Nutrition</h3>
        </div>
        <div className="nutrition-stats">
          <div className="stat">
            <span className="value">{netCalories}</span>
            <span className="label">Net Calories</span>
          </div>
          <div className="stat">
            <span className="value">{nutrition.protein}g</span>
            <span className="label">Protein</span>
          </div>
          <div className="stat">
            <span className="value">{nutrition.water}oz</span>
            <span className="label">Water</span>
          </div>
        </div>
        <div className="progress-bars-container">
          <div className="progress-bar-wrapper">
            <div className="progress-bar" style={{ width: `${calorieProgress}%` }}></div>
          </div>
          <div className="progress-bar-wrapper">
            <div className="progress-bar" style={{ width: `${proteinProgress}%` }}></div>
          </div>
          <div className="progress-bar-wrapper">
            <div className="progress-bar" style={{ width: `${waterProgress}%` }}></div>
          </div>
        </div>
      </Link>

      <div className="dashboard-card">
        <div className="card-header">
          <h3>Today's Training</h3>
          <span className="training-calories">{training.calories || 0} cal</span>
        </div>
        <div className="training-details">
          <span>{training.name || 'Rest Day'}</span>
          <span>{training.duration || 0} min</span>
        </div>
      </div>

      <Link to="/progress" className="dashboard-card">
        <div className="card-header">
          <h3>Active Goals</h3>
        </div>
        {activeGoals.length > 0 ? activeGoals.map((goal) => (
          <div key={goal.id} className="goal-item">
            <span>{goal.goal_description}</span>
            <span>{goal.current_value || 0}/{goal.target_value}</span>
          </div>
        )) : <p className="no-goals-message">No active goals set.</p>}
      </Link>
      
      <div className="dashboard-card quote-card">
        <p>{quote}</p>
      </div>
    </div>
  );
}

export default DashboardPage;

