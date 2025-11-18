/**
 * @fileoverview Main application entry point with global provider setup
 * @description Primary React application bootstrap file managing global context
 * providers, routing configuration, and accessibility setup. Establishes the
 * application's foundation with theme management, authentication, and navigation.
 * 
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-02
 * 
 * @requires React
 * @requires react-dom/client
 * @requires react-router-dom
 * @requires react-modal
 * @requires ThemeProvider
 * @requires AuthProvider
 * @requires App
 * 
 * Application Bootstrap Workflow:
 * 1. **DOM Targeting**: Mounts React app to root DOM element
 * 2. **Global Providers**: Establishes context provider hierarchy
 *    - ThemeProvider: Application-wide theme management
 *    - BrowserRouter: Client-side routing capabilities
 *    - AuthProvider: Authentication state management
 * 3. **Route Structure**: Defines URL-based navigation patterns
 *    - Public routes: Authentication and landing pages
 *    - Protected routes: User-specific application features
 * 4. **Accessibility**: Configures react-modal for screen readers
 * 
 * Provider Hierarchy:
 * ```
 * ThemeProvider
 *   └── BrowserRouter
 *       └── AuthProvider
 *           └── Routes
 * ```
 * 
 * @example
 * // Application structure created by this file
 * <ThemeProvider>
 *   <BrowserRouter>
 *     <AuthProvider>
 *       <Routes>
 *         <Route path="/" element={<AuthPage />} />
 *         <Route path="/*" element={<App />} />
 *       </Routes>
 *     </AuthProvider>
 *   </BrowserRouter>
 * </ThemeProvider>
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import Modal from 'react-modal';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';
import { PostHogProvider } from 'posthog-js/react';

// Suppress Recharts defaultProps deprecation warnings
// TODO: Remove when Recharts updates to React 19 patterns (tracked in recharts issue #3615)
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Support for defaultProps will be removed from function components')
  ) {
    return;
  }
  originalError.call(console, ...args);
};


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
// Mesocycles (multi-week training blocks)
const MesocyclesPage = React.lazy(() => import('./pages/MesocyclesPage.jsx'));
const MesocycleBuilder = React.lazy(() => import('./pages/MesocycleBuilder.jsx'));
const MesocycleDetail = React.lazy(() => import('./pages/MesocycleDetail.jsx'));
const MesocycleLogPage = React.lazy(() => import('./pages/MesocycleLogPage.jsx'));
// Meal Planner pages
const WeeklyMealPlannerPage = React.lazy(() => import('./pages/WeeklyMealPlannerPage.jsx'));
const MyMealsPage = React.lazy(() => import('./pages/MyMealsPage.jsx'));
// Trainer Dashboard
const TrainerDashboard = React.lazy(() => import('./pages/TrainerDashboard.jsx'));

// Binds the modal to the app's root element for accessibility (e.g., screen readers).
Modal.setAppElement('#root'); 

// Renders the main React application into the DOM.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        defaults: '2025-05-24',
        capture_exceptions: true, // This enables capturing exceptions using Error Tracking, set to false if you don't want this
        debug: import.meta.env.MODE === "development",
      }}
    >
      <ThemeProvider>
        <BrowserRouter 
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          {/* The AuthProvider makes user session data available to all components. */}
          <AuthProvider>
            <ErrorBoundary>
              <React.Suspense fallback={
                <div className="loading-container">
                  <div>⚡ Loading...</div>
                </div>
              }>
              <Routes>
              {/* Route 1: The public login page. It does not use the main App layout. */}
              <Route path="/" element={<AuthPage />} />

              {/* Route 2: Standalone Trainer Dashboard - separate from main app layout */}
              <Route path="/trainer-dashboard/*" element={<TrainerDashboard />} />

              {/* Route 3: A layout route. All child routes will render inside the <App /> component. */}
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
                
                {/* --- Meal Planner routes --- */}
                <Route path="/nutrition/meal-planner" element={<WeeklyMealPlannerPage />} />
                <Route path="/nutrition/my-meals" element={<MyMealsPage />} />

                {/* --- Profile route --- */}
                <Route path="/profile" element={<ProfilePage />} />

                {/* --- Mesocycles (training cycles) --- */}
                <Route path="/mesocycles" element={<MesocyclesPage />} />
                <Route path="/mesocycles/new" element={<MesocycleBuilder />} />
                <Route path="/mesocycles/:mesocycleId" element={<MesocycleDetail />} />
                <Route path="/mesocycles/:mesocycleId/log" element={<MesocycleLogPage />} />
              </Route>
              </Routes>
              </React.Suspense>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </PostHogProvider>
  </React.StrictMode>
);
