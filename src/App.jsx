import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Dumbbell, Apple, TrendingUp, ClipboardList } from 'lucide-react'; // 1. Import icons
import './App.css';

// 2. All the old SVG icon components have been removed

function App() {
  return (
    <div className="app-container">
      <main className="main-content">
        <Outlet />
      </main>
      <nav className="bottom-nav">
        {/* 3. Use the imported icons directly as components */}
        <NavLink to="/dashboard" className="nav-link"><Home /><span>Dashboard</span></NavLink>
        <NavLink to="/workouts" className="nav-link"><Dumbbell /><span>Workouts</span></NavLink>
        <NavLink to="/nutrition" className="nav-link"><Apple /><span>Nutrition</span></NavLink>
        <NavLink to="/progress" className="nav-link"><TrendingUp /><span>Progress</span></NavLink>
        <NavLink to="/my-plan" className="nav-link"><ClipboardList /><span>My Plan</span></NavLink>
      </nav>
    </div>
  );
}

export default App;