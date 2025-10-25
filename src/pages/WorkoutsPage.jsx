 
/**
 * @file WorkoutsPage.jsx
 * @description The main landing page for the "Workouts" section of the app.
 * @project Felony Fitness
 *
 * @workflow
 * This component serves as a navigation hub. It displays a header and a menu
 * of cards that link to the various sub-sections related to workouts:
 * - Goals: To manage workout-specific goals.
 * - Routines: To create, edit, and manage workout routines.
 * - Log: To start logging a workout from a saved routine.
 * - Recommendations: To get AI-powered workout advice.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import SubPageHeader from '../components/SubPageHeader.jsx';
import './WorkoutsPage.css';

/**
 * Renders the main menu for the Workouts section.
 * @returns {JSX.Element} The WorkoutsPage component.
 */
function WorkoutsPage() {
  /**
   * Notes
   * - This is an intentionally simple navigation hub. Keep network-heavy
   *   operations out of this component to avoid doubling requests when users
   *   navigate quickly between sub-pages.
   */
  return (
    <div className="workouts-container">
      <SubPageHeader title="Workouts" icon={<Dumbbell size={28} />} iconColor="#f97316" backTo="/dashboard" />
      
      {/* A menu of links styled as cards for easy navigation. */}
      <div className="card-menu">
        <Link to="/workouts/goals" className="menu-card">
          Goals
        </Link>
        <Link to="/workouts/routines" className="menu-card">
          Routines
        </Link>
        <Link to="/mesocycles" className="menu-card">
          Mesocycles
        </Link>
        <Link to="/workouts/select-routine-log" className="menu-card">
          Log
        </Link>
        <Link to="/workouts/recommendations" className="menu-card">
          Recommendations
        </Link>
      </div>
    </div>
  );
}

export default WorkoutsPage;