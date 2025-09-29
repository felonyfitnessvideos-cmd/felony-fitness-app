// FILE: App.jsx

import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
// --- CHANGED: Swapped ClipboardList for the User icon ---
import { Home, Dumbbell, Apple, TrendingUp, User } from 'lucide-react';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <main className="main-content">
        <Outlet />
      </main>
      <nav className="bottom-nav">
        <NavLink to="/dashboard" className="nav-link"><Home /><span>Dashboard</span></NavLink>
        <NavLink to="/workouts" className="nav-link"><Dumbbell /><span>Workouts</span></NavLink>
        <NavLink to="/nutrition" className="nav-link"><Apple /><span>Nutrition</span></NavLink>
        <NavLink to="/progress" className="nav-link"><TrendingUp /><span>Progress</span></NavLink>
        {/* --- CHANGED: Replaced "My Plan" with "Profile" --- */}
        <NavLink to="/profile" className="nav-link"><User /><span>Profile</span></NavLink>
      </nav>
    </div>
  );
}

export default App;