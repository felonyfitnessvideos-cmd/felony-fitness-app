import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import './DashboardPage.css';

const motivationalQuotes = [
  "Consistency beats intensity.",
  "Your only limit is you.",
  "Success is earned in the gym.",
  "Strive for progress, not perfection.",
  "The hard part isn’t getting your body in shape. The hard part is getting your mind in shape."
];

function DashboardPage() {
  const [quote, setQuote] = useState('');
  const navigate = useNavigate();
  
  const [goals, setGoals] = useState({ calories: 0, protein: 0, water: 0 });
  const [nutrition, setNutrition] = useState({ calories: 0, protein: 0, water: 0 });
  const [training, setTraining] = useState({ name: 'Rest Day', duration: 0, calories: 0 });
  const [activeGoals, setActiveGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // CORRECTED: This function is now more robust.
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const [profileRes, nutritionRes, workoutRes, goalsRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('nutrition_logs').select('*, foods(*), water_oz_consumed').eq('user_id', user.id).gte('log_date', `${today} 00:00:00`).lte('log_date', `${today} 23:59:59`),
        // CORRECTED: Removed .single() to handle days with zero workouts
        supabase.from('workout_logs').select('*').eq('user_id', user.id).gte('log_date', `${today} 00:00:00`).lte('log_date', `${today} 23:59:59`).limit(1),
        supabase.from('goals').select('*').eq('user_id', user.id)
      ]);

      if (profileRes.data) {
        setGoals({
          calories: profileRes.data.daily_calorie_goal || 0,
          protein: profileRes.data.daily_protein_goal || 0,
          water: profileRes.data.daily_water_goal_oz || 0,
        });
      }

      const todaysLogs = nutritionRes.data || [];
      let totalCalories = 0, totalProtein = 0, totalWater = 0;
      todaysLogs.forEach(log => {
        if (log.foods) {
          totalCalories += (log.foods.calories_per_serving || 0) * log.quantity_consumed;
          totalProtein += (log.foods.protein_g_per_serving || 0) * log.quantity_consumed;
        }
        if (log.water_oz_consumed) {
          totalWater += log.water_oz_consumed;
        }
      });
      setNutrition({ calories: Math.round(totalCalories), protein: Math.round(totalProtein), water: totalWater });
      
      // CORRECTED: Check if any workout logs were returned before accessing them
      if (workoutRes.data && workoutRes.data.length > 0) {
        const todaysWorkout = workoutRes.data[0];
        setTraining({
          name: todaysWorkout.notes || 'Workout',
          duration: todaysWorkout.duration_minutes || 0,
          calories: todaysWorkout.calories_burned || 0
        });
      } else {
        // If no workout today, default to Rest Day
        setTraining({ name: 'Rest Day', duration: 0, calories: 0 });
      }

      if (goalsRes.data) {
        setActiveGoals(goalsRes.data);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const calorieProgress = goals.calories > 0 ? (nutrition.calories / goals.calories) * 100 : 0;
  const proteinProgress = goals.protein > 0 ? (nutrition.protein / goals.protein) * 100 : 0;
  const waterProgress = goals.water > 0 ? (nutrition.water / goals.water) * 100 : 0;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>FELONY FITNESS</h1>
        <div className="header-underline"></div>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>

      <Link to="/nutrition" className="dashboard-card nutrition-card">
        <div className="card-header">
          <span>🍎</span>
          <h3>Nutrition</h3>
        </div>
        <div className="nutrition-stats">
          <div className="stat">
            <span className="value">{nutrition.calories}</span>
            <span className="label">Calories</span>
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
          <span className="training-calories">{training.calories} cal</span>
        </div>
        <div className="training-details">
          <span>{training.name}</span>
          <span>{training.duration} min</span>
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

