import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../AuthContext.jsx';
import './DashboardPage.css';

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [quote, setQuote] = useState('');
  const [goals, setGoals] = useState({ calories: 0, protein: 0, water: 0 });
  const [nutrition, setNutrition] = useState({ calories: 0, protein: 0, water: 0 });
  const [training, setTraining] = useState({ name: 'Rest Day', duration: 0, calories: 0 });
  const [activeGoals, setActiveGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async (userId) => {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [profileRes, nutritionRes, workoutRes, goalsRes, quoteRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', userId).single(),
        supabase.rpc('get_daily_nutrition_totals', { p_user_id: userId }),
        supabase.from('workout_logs').select('notes, duration_minutes, calories_burned').eq('user_id', userId).gte('created_at', todayStart.toISOString()).order('created_at', { ascending: false }).limit(1),
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.rpc('get_random_quote')
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
      
      if (workoutRes.data && workoutRes.data.length > 0) {
        const todaysWorkout = workoutRes.data[0];
        setTraining({ name: todaysWorkout.notes || 'Workout', duration: todaysWorkout.duration_minutes || 0, calories: todaysWorkout.calories_burned || 0 });
      } else {
        setTraining({ name: 'Rest Day', duration: 0, calories: 0 });
      }

      if (goalsRes.data) {
        setActiveGoals(goalsRes.data);
      }

      // SIMPLIFIED: Just get the quote and display it.
      if (quoteRes.data && quoteRes.data.length > 0) {
        setQuote(quoteRes.data[0].quote);
      } else {
        setQuote('Time to get to work!'); // Fallback quote
      }

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData(user.id);
    } else {
      setLoading(false);
    }
  }, [user?.id, fetchDashboardData]);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const netCalories = nutrition.calories - training.calories;
  const adjustedCalorieGoal = goals.calories + training.calories;
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