import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import './DashboardPage.css';

const motivationalQuotes = [
  "Consistency beats intensity.",
  "Your only limit is you.",
  "Success is earned in the gym.",
  "Strive for progress, not perfection.",
  "The hard part isn’t getting your body in shape. The hard part is getting your mind in shape.",
  "The pain you feel today is the strength you feel tomorrow.",
  "Your body can stand almost anything. It’s your mind you have to convince.",
  "Don't wish for it. Work for it.",
  "The only bad workout is the one that didn't happen.",
  "Discipline is choosing between what you want now and what you want most.",
  "Fall down seven times, stand up eight.",
  "A year from now, you will wish you had started today.",
  "The iron never lies.",
  "Your comeback is always stronger than your setback.",
  "Build yourself, for yourself.",
  "Don't count the days, make the days count.",
  "The past is in your head. The future is in your hands.",
  "It's not about being the best. It's about being better than you were yesterday.",
  "Strength does not come from winning. Your struggles develop your strengths.",
  "Excuses don't build muscle.",
  "Train your mind and your body will follow.",
  "The difference between who you are and who you want to be is what you do.",
  "Respect your body. It's the only one you get.",
  "One rep at a time. One day at a time.",
  "The secret to getting ahead is getting started.",
  "Prove them wrong.",
  "Turn your obstacles into opportunities.",
  "Every day is a new beginning. Take a deep breath and start again.",
  "The body achieves what the mind believes.",
  "You are stronger than you think.",
  "Commitment means staying loyal to what you said you were going to do long after the mood has left you.",
  "Focus on your goal. Don't look in any direction but ahead.",
  "Sweat is magic. Cover yourself in it daily to grant your wishes.",
  "The best project you'll ever work on is you.",
  "It’s a slow process, but quitting won’t speed it up.",
  "Your future is created by what you do today, not tomorrow.",
  "Let your actions prove your words.",
  "Be the hardest worker in the room.",
  "Excuses are for people who don't want it bad enough.",
  "Discipline is the bridge between goals and accomplishment.",
  "Today's actions are tomorrow's results.",
  "Don't be afraid of being a beginner.",
  "Become the person you decided to be.",
  "Every step is progress, no matter how small.",
  "The clock is ticking. Are you becoming the person you want to be?",
  "What seems impossible today will one day become your warm-up.",
  "Hustle for that muscle.",
  "Your story is not over. The next chapter is unwritten.",
  "Own your morning. Elevate your life.",
  "You don't find willpower, you create it.",
  "Be stronger than your strongest excuse.",
];

function DashboardPage() {
  const [quote, setQuote] = useState('');
  const navigate = useNavigate();
  
  const [goals, setGoals] = useState({ calories: 0, protein: 0, water: 0 });
  const [nutrition, setNutrition] = useState({ calories: 0, protein: 0, water: 0 });
  const [training, setTraining] = useState({ name: 'Rest Day', duration: 0, calories: 0 });
  const [activeGoals, setActiveGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async (userId) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    const [profileRes, nutritionRes, workoutRes, goalsRes] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', userId).single(),
      supabase.from('v_nutrition_log_details').select('total_calories, total_protein, water_oz_consumed, pdcaas_score').eq('user_id', userId).gte('created_at', todayStart.toISOString()).lte('created_at', todayEnd.toISOString()),
      supabase.from('workout_logs').select('*').eq('user_id', userId).gte('created_at', todayStart.toISOString()).lte('created_at', todayEnd.toISOString()).order('created_at', { ascending: false }).limit(1),
      supabase.from('goals').select('*').eq('user_id', userId)
    ]);

    if (profileRes.data) {
      setGoals({ calories: profileRes.data.daily_calorie_goal || 0, protein: profileRes.data.daily_protein_goal || 0, water: profileRes.data.daily_water_goal_oz || 0 });
    }

    const todaysLogs = nutritionRes.data || [];
    let totalCalories = 0, totalProtein = 0, totalWater = 0;
    
    todaysLogs.forEach(log => {
      if (log.pdcaas_score === null || log.pdcaas_score > 0.7) {
        totalProtein += log.total_protein || 0;
      }
      totalCalories += log.total_calories || 0;
      totalWater += log.water_oz_consumed || 0;
    });

    setNutrition({ calories: Math.round(totalCalories), protein: Math.round(totalProtein), water: totalWater });
    
    if (workoutRes.data && workoutRes.data.length > 0) {
      const todaysWorkout = workoutRes.data[0];
      setTraining({ name: todaysWorkout.notes || 'Workout', duration: todaysWorkout.duration_minutes || 0, calories: todaysWorkout.calories_burned || 0 });
    } else {
      setTraining({ name: 'Rest Day', duration: 0, calories: 0 });
    }

    if (goalsRes.data) {
      setActiveGoals(goalsRes.data);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchDashboardData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchDashboardData]);
  
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