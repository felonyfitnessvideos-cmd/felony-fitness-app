/**
 * @file SelectProRoutinePage.jsx
 * @description A hub page for users to select a category of professionally designed workout routines.
 * @project Felony Fitness
 */

import React from 'react';
import { Link } from 'react-router-dom';
import SubPageHeader from '../components/SubPageHeader.jsx';
// Corrected the import to use 'Dumbbell' which is a known and safe icon.
import { Dumbbell, Zap, HeartPulse, Shield, Wind, Repeat } from 'lucide-react';
import './SelectProRoutinePage.css';

/**
 * Render the Select Pro Routine page with a grid of category navigation cards.
 *
 * Each card represents a professional routine category and links to
 * /workouts/routines/pro-category/{encoded category name}. Cards include
 * decorative icons and accessible labels describing the destination.
 * @returns {JSX.Element} The rendered Select Pro Routine page element.
 */
function SelectProRoutinePage() {
  /**
   * Notes
   * - Category names may contain spaces; routes use `encodeURIComponent` to
   *   keep URLs safe. If you add new categories, ensure the router path
   *   matches the link format used here.
   * - Icons are decorative; avoid embedding user content into icon elements
   *   to prevent XSS surface area.
   */
  // Array of category objects to generate the navigation cards dynamically.
  const categories = [
    { name: 'Strength', icon: <Dumbbell size={40} className="card-icon" />, link: '/workouts/routines/pro-category/Strength' },
    { name: 'Hypertrophy', icon: <Zap size={40} className="card-icon" />, link: '/workouts/routines/pro-category/Hypertrophy' },
    { name: 'Endurance', icon: <HeartPulse size={40} className="card-icon" />, link: '/workouts/routines/pro-category/Endurance' },
    { name: 'Challenges', icon: <Shield size={40} className="card-icon" />, link: '/workouts/routines/pro-category/Challenges' },
    { name: 'Bodyweight Beast', icon: <Wind size={40} className="card-icon" />, link: '/workouts/routines/pro-category/Bodyweight Beast' },
  { name: 'Interval', icon: <Repeat size={40} className="card-icon" />, link: '/workouts/routines/pro-category/Interval' },
  ];

  return (
    <div className="select-pro-container">
      <SubPageHeader title="Select Pro Routine" icon={<Dumbbell size={28} />} iconColor="#f97316" backTo="/workouts/routines" />
      
      <p className="page-intro">
        Choose a professionally designed routine that matches your goals. It will be added to your list where you can customize it.
      </p>

      <div className="category-grid">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={`/workouts/routines/pro-category/${encodeURIComponent(cat.name)}`}
            className="category-card"
            aria-label={`Browse ${cat.name} pro routines`}
          >
            {cat.icon}
            <span className="card-name">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default SelectProRoutinePage;
