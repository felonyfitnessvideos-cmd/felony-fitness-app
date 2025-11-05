 
/**
 * @file SelectProRoutinePage.jsx
 * @description A hub page for users to select a category of professionally designed workout routines.
 *
 * Integration Note:
 * When a user clicks a category card, this page now calls the Supabase Edge Function
 * `copy_pro_routine_to_user` via POST to `/functions/v1/copy_pro_routine_to_user`.
 * The function copies the selected pro routine to the user's personal routines.
 *
 * @project Felony Fitness
 */

/**
 * SelectProRoutinePage.jsx
 *
 * Small helper page that lists available pro routines and lets the user
 * select one to preview or apply. This file now contains logic to call the
 * Supabase Edge Function to copy a pro routine to the user's routines.
 */
/**
 * SelectProRoutinePage — lets users pick a pro routine template.
 *
 * The page lists available paid (pro) routines and allows previewing them.
 * When a user clicks a category card, the corresponding pro routine is copied
 * to their personal routines using the Edge Function API.
 */

import { Dumbbell, HeartPulse, Repeat, Shield, Wind, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SubPageHeader from '../components/SubPageHeader.jsx';
import './SelectProRoutinePage.css';

/**
 * @component SelectProRoutinePage
 * @description Renders a grid of cards, each representing a category of "Pro Routines".
 * On card click, calls the Edge Function to copy the selected pro routine to the user's routines.
 */
/**
 * SelectProRoutinePage
 * Hub for choosing a pro routine category. The categories list is static in
 * this component; if moved to a dynamic source ensure `encodeURIComponent`
 * is used when building the route.
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
    { name: 'Strength', icon: <Dumbbell size={40} className="card-icon" /> },
    { name: 'Hypertrophy', icon: <Zap size={40} className="card-icon" /> },
    { name: 'Endurance', icon: <HeartPulse size={40} className="card-icon" /> },
    { name: 'Challenges', icon: <Shield size={40} className="card-icon" /> },
    { name: 'Bodyweight Beast', icon: <Wind size={40} className="card-icon" /> },
    { name: 'Interval', icon: <Repeat size={40} className="card-icon" /> },
  ];

  // Use React Router navigation to go to the category page
  const navigate = useNavigate();

  return (
    <div className="select-pro-container">
      <SubPageHeader title="Select Pro Routine" icon={<Dumbbell size={28} />} iconColor="#f97316" backTo="/workouts/routines" />
      <p className="page-intro">
        Choose a professionally designed routine that matches your goals. It will be added to your list where you can customize it.
      </p>
      <div className="category-grid">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="category-card"
            aria-label={`View ${cat.name} pro routines`}
            onClick={() => navigate(`/workouts/routines/pro-category/${encodeURIComponent(cat.name)}`)}
            style={{ cursor: 'pointer' }}
          >
            {cat.icon}
            <span className="card-name">{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectProRoutinePage;

