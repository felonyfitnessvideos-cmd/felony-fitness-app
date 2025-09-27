import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import SubPageHeader from '../components/SubPageHeader.jsx';
import './WorkoutsPage.css';

function WorkoutsPage() {
  return (
    <div className="workouts-container">
      <SubPageHeader title="Workouts" icon={<Dumbbell size={28} />} iconColor="#f97316" backTo="/dashboard" />
      
      <div className="card-menu">
        <Link to="/workouts/goals" className="menu-card">
          Goals
        </Link>
        <Link to="/workouts/routines" className="menu-card">
          Routines
        </Link>
        {/* UPDATED: The link now points to the new, more descriptive route */}
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

