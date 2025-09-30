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

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const [profileRes, nutritionRes, workoutRes, goalsRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        
        // --- START CHANGE 1: Update the query to fetch the pdcaas_score ---
        supabase.from('nutrition_logs')
          .select('*, food_servings(*, foods(pdcaas_score)), water_oz_consumed')
          .eq('user_id', user.id)
          .gte('log_date', `${today} 00:00:00`)
          .lte('log_date', `${today} 23:59:59`),
        // --- END CHANGE 1 ---
          
        supabase.from('workout_logs').select('*').eq('user_id', user.id).gte('created_at', `${today} 00:00:00`).lte('created_at', `${today} 23:59:59`).order('created_at', { ascending: false }).limit(1),
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
      
      // --- START CHANGE 2: Update calculation logic to check PDCAAS score ---
      todaysLogs.forEach(log => {
        if (log.food_servings) {
          totalCalories += (log.food_servings.calories || 0) * log.quantity_consumed;
          
          const proteinAmount = (log.food_servings.protein_g || 0) * log.quantity_consumed;
          const pdcaas = log.food_servings.foods?.pdcaas_score;

          // Only count protein if the score is > 0.7 or if the score is not set (null/undefined)
          if (pdcaas === null || pdcaas === undefined || pdcaas > 0.7) {
            totalProtein += proteinAmount;
          }
        }
        if (log.water_oz_consumed) {
          totalWater += log.water_oz_consumed;
        }
      });
      // --- END CHANGE 2 ---

      setNutrition({ calories: Math.round(totalCalories), protein: Math.round(totalProtein), water: totalWater });
      
      if (workoutRes.data && workoutRes.data.length > 0) {
        const todaysWorkout = workoutRes.data[0];
        setTraining({
          name: todaysWorkout.notes || 'Workout',
          duration: todaysWorkout.duration_minutes || 0,
          calories: todaysWorkout.calories_burned || 0
        });
      } else {
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