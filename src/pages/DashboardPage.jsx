// @ts-check

/**
 * @file DashboardPage.jsx
 * @description The main dashboard page, serving as the central hub for the user's daily stats.
 * @project Felony Fitness
 *
 * @workflow
 * 1.  **Data Fetching**: On component mount, `fetchDashboardData` is called. It runs several database queries in parallel to gather:
 * - The user's daily nutrition/fitness goals from their profile.
 * - Today's aggregated nutrition totals (calories, protein, water) from an RPC function.
 * - The user's list of active, long-term goals.
 * - The most recent workout log for the current day.
 * 2.  **State Management**: The fetched data is stored in various state variables (`goals`, `nutrition`, `training`, `activeGoals`). A `loading` state manages the UI during the fetch. A motivational quote is also randomly selected and stored.
 * 3.  **Data Calculation**: The component calculates derived values for display, such as "net calories" (calories eaten minus calories burned) and progress percentages for nutrition goals.
 * 4.  **Rendering**: The page displays the information in a series of cards:
 * - A main nutrition card with progress bars.
 * - A "Today's Training" card showing the most recent workout.
 * - An "Active Goals" card listing the user's long-term goals.
 * - A motivational quote card.
 * 5.  **User Actions**: The user can log out, which signs them out of the session and navigates them back to the authentication page.
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
      const todayStr = new Date().toLocaleDateString('en-CA'); 

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(todayStart);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);

      // Fetch profile, nutrition totals, and goals simultaneously.
      const [profileRes, nutritionRes, goalsRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', userId).single(),
        supabase.rpc('get_daily_nutrition_totals', { p_user_id: userId, p_date: todayStr }),
        supabase.from('goals').select('*').eq('user_id', userId)
      ]);

      if (profileRes.data) {
        setGoals({ calories: profileRes.data.daily_calorie_goal || 0, protein: profileRes.data.daily_protein_goal || 0, water: profileRes.data.daily_water_goal_oz || 0 });
      }

      const totalsData = nutritionRes.data?.[0];
      if (totalsData) {
        setNutrition({
            calories: Math.round(totalsData.total_calories || 0),
            protein: Math.round(totalsData.total_protein || 0),
            water: totalsData.total_water || 0,
        });
      }
      
      if (goalsRes.data) {
        setActiveGoals(goalsRes.data);
      }

      // Fetch the most recent workout log for today.
      const { data: workoutLogData, error: workoutLogError } = await supabase
        .from('workout_logs')
        .select('notes, duration_minutes, calories_burned')
        .eq('user_id', userId)
        .gte('created_at', todayStart.toISOString()) 
        .lt('created_at', tomorrowStart.toISOString()) 
        .order('created_at', { ascending: false }) 
        .limit(1)
        .single();
      
      // Ignore the "no rows found" error, as it's an expected outcome on a rest day.
      if (workoutLogError && workoutLogError.code !== 'PGRST116') { 
        throw workoutLogError;
      }

      if (workoutLogData) {
        setTraining({
          name: workoutLogData.notes,
          duration: workoutLogData.duration_minutes,
          calories: workoutLogData.calories_burned
        });
      } else {
        setTraining({ name: 'Rest Day', duration: 0, calories: 0 });
      }

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Fallback to a safe "Rest Day" state on error.
        setTraining({ name: 'Rest Day', duration: 0, calories: 0 });
    } finally {
        setLoading(false);
    }
  }, []);

  /**
   * Effect to initialize the dashboard. It selects a random quote and
   * triggers the data fetch when the user session is available.
   */
  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
    
    if (user) {
      fetchDashboardData(user.id);
    } else {
      setLoading(false);
    }
  }, [user?.id, fetchDashboardData]);
  
  /**
   * Handles the user logout process.
   * @async
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // --- Derived State Calculations ---
  // These values are calculated on every render based on the current state.
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
        {activeGoals.length > 0 ? activeGoals.map((goal, index) => (
          <div key={index} className="goal-item">
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