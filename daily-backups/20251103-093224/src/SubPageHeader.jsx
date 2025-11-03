/**
 * @fileoverview Reusable header component for sub-pages
 * @description Small, reusable header used by sub-pages (details, forms, logs) that
 * provides a consistent layout: a back button on the left, a centered title,
 * and an optional icon. Keeps behavior minimal so parent pages control navigation and content.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-02
 * 
 * @requires react
 * @requires react-router-dom
 * @requires lucide-react
 * 
 * @example
 * // Basic header with title only
 * <SubPageHeader title="Workout Details" />
 * 
 * @example
 * // Header with icon and custom back route
 * <SubPageHeader
 *   title="Edit Profile"
 *   icon={<User />}
 *   iconColor="#ff6b35"
 *   backTo="/dashboard"
 * />
 * 
 * @example
 * // Header with icon using browser history
 * <SubPageHeader
 *   title="Meal Builder"
 *   icon={<ChefHat />}
 *   iconColor="white"
 * />
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Sub-page header component with back navigation
 * 
 * @function SubPageHeader
 * @param {Object} props - Component properties
 * @param {string} [props.title=''] - The main title text to display
 * @param {React.ReactElement} [props.icon] - Optional leading icon displayed beside title
 * @param {string} [props.iconColor='white'] - Color applied to the icon when provided
 * @param {string} [props.backTo] - Optional route; when present, back button navigates to this route instead of browser history
 * @returns {React.ReactElement} The header component
 * 
 * @description Provides consistent sub-page header layout with back navigation.
 * Uses CSS Grid for precise alignment and supports both programmatic navigation
 * and browser history navigation patterns.
 * 
 * @accessibility
 * - Back button is semantic button element with proper aria-label
 * - Keyboard focusable and supports standard button interaction
 * - Icons should include accessible text when they convey meaning
 * - Grid layout maintains visual hierarchy
 * 
 * @todo Consider exposing onBack callback prop for analytics or confirmation dialogs
 */
function SubPageHeader({ title = '', icon, iconColor = 'white', backTo }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '44px 1fr 44px',
      alignItems: 'center',
      marginBottom: '2rem'
    }}>
      <button
        type="button"
        aria-label="Back"
        onClick={handleBack}
        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}
      >
        <ArrowLeft size={28} />
      </button>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        {icon && React.isValidElement(icon) ? React.cloneElement(icon, { color: iconColor }) : null}
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>{title}</h1>
      </div>

      <div></div>
    </div>
  );
}

export default SubPageHeader;
