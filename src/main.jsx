import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Modal from 'react-modal';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './AuthContext.jsx'; // Import the AuthProvider

// Import page components
import App from './App.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import WorkoutsPage from './pages/WorkoutsPage.jsx';
import NutritionPage from './pages/NutritionPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import MyPlanPage from './pages/MyPlanPage.jsx';
import WorkoutGoalsPage from './pages/WorkoutGoalsPage.jsx';
import WorkoutRoutinePage from './pages/WorkoutRoutinePage.jsx';
import SelectRoutineLogPage from './pages/SelectRoutineLogPage.jsx';
import WorkoutLogPage from './pages/WorkoutLogPage.jsx';
import WorkoutRecsPage from './pages/WorkoutRecsPage.jsx';
import EditRoutinePage from './pages/EditRoutinePage.jsx';
import NutritionGoalsPage from './pages/NutritionGoalsPage.jsx';
import NutritionLogPage from './pages/NutritionLogPage.jsx';
import NutritionRecsPage from './pages/NutritionRecsPage.jsx';
import ProfilePage from './pages/ProfilePage';

Modal.setAppElement('#root'); 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        {/* Wrap the entire Routes structure with AuthProvider */}
        <AuthProvider>
          <Routes>
            {/* Route 1: The public login page stands alone */}
            <Route path="/" element={<AuthPage />} />

            {/* Route 2: All protected app pages live inside the App layout */}
            <Route element={<App />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/workouts" element={<WorkoutsPage />} />
              <Route path="/nutrition" element={<NutritionPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/my-plan" element={<MyPlanPage />} />
              
              {/* Workout Sub-Pages */}
              <Route path="/workouts/goals" element={<WorkoutGoalsPage />} />
              <Route path="/workouts/routines" element={<WorkoutRoutinePage />} />
              <Route path="/workouts/select-routine-log" element={<SelectRoutineLogPage />} />
              <Route path="/log-workout/:routineId" element={<WorkoutLogPage />} />
              <Route path="/workouts/recommendations" element={<WorkoutRecsPage />} />
              <Route path="/workouts/routines/:routineId" element={<EditRoutinePage />} />

              {/* Nutrition Sub-Pages */}
              <Route path="/nutrition/goals" element={<NutritionGoalsPage />} />
              <Route path="/nutrition/log" element={<NutritionLogPage />} />
              <Route path="/nutrition/recommendations" element={<NutritionRecsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);