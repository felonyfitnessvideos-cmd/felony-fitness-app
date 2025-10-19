 
/**
 * @file main.jsx
 * @description The main entry point for the React application.
 * @project Felony Fitness
 *
 * @workflow
 * 1. This file targets the root DOM element (`<div id="root">`).
 * 2. It sets up global context providers that wrap the entire application:
 * - `ThemeProvider`: Manages the application's theme (e.g., dark/light mode).
 * - `BrowserRouter`: Enables client-side routing using React Router.
 * - `AuthProvider`: Manages user authentication state (e.g., who is logged in).
 * 3. It defines the application's URL structure using `<Routes>` and `<Route>`.
 * 4. It establishes a nested routing structure:
 * - A public route for the login page (`/`).
 * - A group of protected routes that render inside the main `<App />` layout,
 * which includes the persistent bottom navigation bar.
 * 5. It initializes the `react-modal` library by setting the app element, which is
 * important for accessibility.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Modal from 'react-modal';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './AuthContext.jsx';

// Import all page components
import App from './App.jsx';
import AuthPage from './pages/AuthPage.jsx';
// Lazy-load heavier route pages to reduce initial bundle size
const DashboardPage = React.lazy(() => import('./pages/DashboardPage.jsx'));
const WorkoutsPage = React.lazy(() => import('./pages/WorkoutsPage.jsx'));
const NutritionPage = React.lazy(() => import('./pages/NutritionPage.jsx'));
const ProgressPage = React.lazy(() => import('./pages/ProgressPage.jsx'));
const MyPlanPage = React.lazy(() => import('./pages/MyPlanPage.jsx'));
const WorkoutGoalsPage = React.lazy(() => import('./pages/WorkoutGoalsPage.jsx'));
const WorkoutRoutinePage = React.lazy(() => import('./pages/WorkoutRoutinePage.jsx'));
const SelectRoutineLogPage = React.lazy(() => import('./pages/SelectRoutineLogPage.jsx'));
const WorkoutLogPage = React.lazy(() => import('./pages/WorkoutLogPage.jsx'));
const WorkoutRecsPage = React.lazy(() => import('./pages/WorkoutRecsPage.jsx'));
const EditRoutinePage = React.lazy(() => import('./pages/EditRoutinePage.jsx'));
const SelectProRoutinePage = React.lazy(() => import('./pages/SelectProRoutinePage.jsx'));
const ProRoutineCategoryPage = React.lazy(() => import('./pages/ProRoutineCategoryPage.jsx'));
const NutritionGoalsPage = React.lazy(() => import('./pages/NutritionGoalsPage.jsx'));
const NutritionLogPage = React.lazy(() => import('./pages/NutritionLogPage.jsx'));
const NutritionRecsPage = React.lazy(() => import('./pages/NutritionRecsPage.jsx'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage.jsx'));

// Binds the modal to the app's root element for accessibility (e.g., screen readers).
Modal.setAppElement('#root'); 

// Renders the main React application into the DOM.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        {/* The AuthProvider makes user session data available to all components. */}
        <AuthProvider>
          <React.Suspense fallback={<div>Loading...</div>}>
            <Routes>
            {/* Route 1: The public login page. It does not use the main App layout. */}
            <Route path="/" element={<AuthPage />} />

            {/* Route 2: A layout route. All child routes will render inside the <App /> component. */}
            {/* This is how the bottom navbar appears on all the main pages. */}
            <Route element={<App />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/workouts" element={<WorkoutsPage />} />
              <Route path="/nutrition" element={<NutritionPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/my-plan" element={<MyPlanPage />} />
              
              {/* --- Nested routes for the "Workouts" section --- */}
              <Route path="/workouts/goals" element={<WorkoutGoalsPage />} />
              <Route path="/workouts/routines" element={<WorkoutRoutinePage />} />
              <Route path="/workouts/select-routine-log" element={<SelectRoutineLogPage />} />
              <Route path="/log-workout/:routineId" element={<WorkoutLogPage />} />
              <Route path="/workouts/recommendations" element={<WorkoutRecsPage />} />
              {/* This route handles both creating a new routine and editing an existing one */}
              <Route path="/workouts/routines/:routineId" element={<EditRoutinePage />} />
              
              {/* --- Nested routes for the "Pro Routines" feature --- */}
              {/* The main hub/category selection page */}
                <Route path="/workouts/routines/select-pro" element={<SelectProRoutinePage />} />
                {/* The dynamic page that displays routines for a specific category */}
                <Route path="/workouts/routines/pro-category/:categoryName" element={<ProRoutineCategoryPage />} />

              {/* --- Nested routes for the "Nutrition" section --- */}
              <Route path="/nutrition/goals" element={<NutritionGoalsPage />} />
              <Route path="/nutrition/log" element={<NutritionLogPage />} />
              <Route path="/nutrition/recommendations" element={<NutritionRecsPage />} />

              {/* --- Profile route --- */}
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            </Routes>
          </React.Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

