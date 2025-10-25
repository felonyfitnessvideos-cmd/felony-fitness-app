 
/**
 * @file App.jsx
 * @description The root component of the application.
 * @project Felony Fitness
 *
 * @workflow
 * This component sets up the main layout structure for the entire application.
 * It consists of:
 * 1. A `main-content` area where the content of the current page/route is rendered.
 * This is handled by the `<Outlet />` component from React Router.
 * 2. A persistent `bottom-nav` bar that is visible on all main pages of the app.
 * This navigation bar uses `<NavLink />` components to link to the different sections
 * and to visually indicate the user's current location with an "active" class.
 */

/**
 * App.jsx
 *
 * Application shell: routes, bottom navigation and high-level layout. Keep
 * this file minimal; route-level components implement their own behavior
 * and data fetching.
 */
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Dumbbell, Apple, TrendingUp, User } from 'lucide-react';
import './App.css';

/**
 * The main application layout component.
 * It renders the primary navigation and the content area for all child routes.
 * @returns {JSX.Element} The main app structure.
 */
function App() {
  return (
    <div className="app-container">
      <main className="main-content">
        {/* The Outlet component renders the matched child route's component. */}
        <Outlet />
      </main>
      
      {/* The main navigation bar, fixed to the bottom of the screen. */}
      <nav className="bottom-nav">
        <NavLink to="/dashboard" className="nav-link"><Home /><span>Dashboard</span></NavLink>
        <NavLink to="/workouts" className="nav-link"><Dumbbell /><span>Workouts</span></NavLink>
        <NavLink to="/nutrition" className="nav-link"><Apple /><span>Nutrition</span></NavLink>
        <NavLink to="/progress" className="nav-link"><TrendingUp /><span>Progress</span></NavLink>
        <NavLink to="/profile" className="nav-link"><User /><span>Profile</span></NavLink>
      </nav>
    </div>
  );
}

export default App;