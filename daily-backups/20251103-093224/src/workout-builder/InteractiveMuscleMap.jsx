/**
 * @file InteractiveMuscleMap.jsx
 * @description Interactive SVG-based muscle map component for workout builder
 * @project Felony Fitness - Workout Builder Platform
 * 
 * Features:
 * - Interactive clickable muscle regions
 * - Dynamic highlighting of muscle groups
 * - Responsive SVG design
 * - Customizable styling and colors
 */

import React from 'react';
import PropTypes from 'prop-types';
import './InteractiveMuscleMap.css';

/**
 * Interactive Muscle Map Component
 * Provides a clickable human body diagram with muscle group highlighting
 */
const InteractiveMuscleMap = ({ 
  highlightedMuscles = [], 
  onMuscleClick = () => {}, 
  className = '',
  variant = 'front' // 'front' or 'back'
}) => {
  
  /**
   * Handle muscle region click
   * @param {string} muscleName - Name of the clicked muscle
   * @param {Event} event - Click event
   */
  const handleMuscleClick = (muscleName, event) => {
    event.preventDefault();
    onMuscleClick(muscleName);
  };

  /**
   * Check if a muscle should be highlighted
   * @param {string} muscleName - Name of the muscle to check
   * @returns {boolean} - Whether the muscle should be highlighted
   */
  const isHighlighted = (muscleName) => {
    return highlightedMuscles.includes(muscleName);
  };

  /**
   * Get muscle class names for styling
   * @param {string} muscleName - Name of the muscle
   * @returns {string} - CSS class names
   */
  const getMuscleClasses = (muscleName) => {
    const baseClass = 'muscle-region';
    const highlightClass = isHighlighted(muscleName) ? 'highlighted' : '';
    return `${baseClass} ${highlightClass}`.trim();
  };

  if (variant === 'back') {
    return (
      <div className={`muscle-map-container ${className}`}>
        <svg 
          viewBox="0 0 400 600" 
          className="muscle-map-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Back View Muscles */}
          
          {/* Upper Traps */}
          <path
            d="M160 80 L200 70 L240 80 L220 120 L180 120 Z"
            className={getMuscleClasses('Traps (Upper)')}
            onClick={(e) => handleMuscleClick('Traps (Upper)', e)}
            title="Upper Trapezius"
          />
          
          {/* Lats */}
          <path
            d="M120 140 L160 130 L180 160 L180 220 L140 240 L100 200 Z"
            className={getMuscleClasses('Lats')}
            onClick={(e) => handleMuscleClick('Lats', e)}
            title="Latissimus Dorsi (Left)"
          />
          <path
            d="M280 140 L240 130 L220 160 L220 220 L260 240 L300 200 Z"
            className={getMuscleClasses('Lats')}
            onClick={(e) => handleMuscleClick('Lats', e)}
            title="Latissimus Dorsi (Right)"
          />
          
          {/* Rear Delts */}
          <path
            d="M100 120 L140 110 L160 130 L140 150 L110 140 Z"
            className={getMuscleClasses('Rear Delts')}
            onClick={(e) => handleMuscleClick('Rear Delts', e)}
            title="Rear Deltoids (Left)"
          />
          <path
            d="M300 120 L260 110 L240 130 L260 150 L290 140 Z"
            className={getMuscleClasses('Rear Delts')}
            onClick={(e) => handleMuscleClick('Rear Delts', e)}
            title="Rear Deltoids (Right)"
          />
          
          {/* Rhomboids/Mid Traps */}
          <path
            d="M160 120 L200 110 L240 120 L220 160 L180 160 Z"
            className={getMuscleClasses('Rhomboids')}
            onClick={(e) => handleMuscleClick('Rhomboids', e)}
            title="Rhomboids & Mid Traps"
          />
          
          {/* Lower Back */}
          <path
            d="M160 220 L240 220 L230 280 L170 280 Z"
            className={getMuscleClasses('Lower Back')}
            onClick={(e) => handleMuscleClick('Lower Back', e)}
            title="Lower Back (Erector Spinae)"
          />
          
          {/* Glutes */}
          <path
            d="M160 280 L240 280 L235 340 L165 340 Z"
            className={getMuscleClasses('Glutes')}
            onClick={(e) => handleMuscleClick('Glutes', e)}
            title="Gluteus Maximus"
          />
          
          {/* Hamstrings */}
          <path
            d="M160 340 L190 340 L185 420 L165 420 Z"
            className={getMuscleClasses('Hamstrings')}
            onClick={(e) => handleMuscleClick('Hamstrings', e)}
            title="Hamstrings (Left)"
          />
          <path
            d="M210 340 L240 340 L235 420 L215 420 Z"
            className={getMuscleClasses('Hamstrings')}
            onClick={(e) => handleMuscleClick('Hamstrings', e)}
            title="Hamstrings (Right)"
          />
          
          {/* Calves */}
          <path
            d="M165 420 L185 420 L180 500 L170 500 Z"
            className={getMuscleClasses('Calves')}
            onClick={(e) => handleMuscleClick('Calves', e)}
            title="Calves (Left)"
          />
          <path
            d="M215 420 L235 420 L230 500 L220 500 Z"
            className={getMuscleClasses('Calves')}
            onClick={(e) => handleMuscleClick('Calves', e)}
            title="Calves (Right)"
          />
          
          {/* Triceps */}
          <path
            d="M80 140 L110 130 L120 180 L90 190 Z"
            className={getMuscleClasses('Triceps')}
            onClick={(e) => handleMuscleClick('Triceps', e)}
            title="Triceps (Left)"
          />
          <path
            d="M320 140 L290 130 L280 180 L310 190 Z"
            className={getMuscleClasses('Triceps')}
            onClick={(e) => handleMuscleClick('Triceps', e)}
            title="Triceps (Right)"
          />
        </svg>
      </div>
    );
  }

  // Front View (default)
  return (
    <div className={`muscle-map-container ${className}`}>
      <svg 
        viewBox="0 0 400 600" 
        className="muscle-map-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Front View Muscles */}
        
        {/* Chest */}
        <path
          d="M160 120 L240 120 L230 180 L170 180 Z"
          className={getMuscleClasses('Chest')}
          onClick={(e) => handleMuscleClick('Chest', e)}
          title="Pectorals (Chest)"
        />
        
        {/* Front Delts */}
        <path
          d="M100 100 L140 90 L160 120 L140 140 L110 130 Z"
          className={getMuscleClasses('Front Delts')}
          onClick={(e) => handleMuscleClick('Front Delts', e)}
          title="Front Deltoids (Left)"
        />
        <path
          d="M300 100 L260 90 L240 120 L260 140 L290 130 Z"
          className={getMuscleClasses('Front Delts')}
          onClick={(e) => handleMuscleClick('Front Delts', e)}
          title="Front Deltoids (Right)"
        />
        
        {/* Side Delts */}
        <path
          d="M80 110 L110 100 L130 130 L100 140 L85 125 Z"
          className={getMuscleClasses('Side Delts')}
          onClick={(e) => handleMuscleClick('Side Delts', e)}
          title="Side Deltoids (Left)"
        />
        <path
          d="M320 110 L290 100 L270 130 L300 140 L315 125 Z"
          className={getMuscleClasses('Side Delts')}
          onClick={(e) => handleMuscleClick('Side Delts', e)}
          title="Side Deltoids (Right)"
        />
        
        {/* Biceps */}
        <path
          d="M80 140 L110 130 L120 200 L90 210 Z"
          className={getMuscleClasses('Biceps')}
          onClick={(e) => handleMuscleClick('Biceps', e)}
          title="Biceps (Left)"
        />
        <path
          d="M320 140 L290 130 L280 200 L310 210 Z"
          className={getMuscleClasses('Biceps')}
          onClick={(e) => handleMuscleClick('Biceps', e)}
          title="Biceps (Right)"
        />
        
        {/* Forearms */}
        <path
          d="M90 210 L120 200 L125 260 L95 270 Z"
          className={getMuscleClasses('Forearms')}
          onClick={(e) => handleMuscleClick('Forearms', e)}
          title="Forearms (Left)"
        />
        <path
          d="M310 210 L280 200 L275 260 L305 270 Z"
          className={getMuscleClasses('Forearms')}
          onClick={(e) => handleMuscleClick('Forearms', e)}
          title="Forearms (Right)"
        />
        
        {/* Abs */}
        <path
          d="M170 180 L230 180 L225 260 L175 260 Z"
          className={getMuscleClasses('Abs')}
          onClick={(e) => handleMuscleClick('Abs', e)}
          title="Abdominals"
        />
        
        {/* Obliques */}
        <path
          d="M140 180 L170 180 L175 260 L145 270 Z"
          className={getMuscleClasses('Obliques')}
          onClick={(e) => handleMuscleClick('Obliques', e)}
          title="Obliques (Left)"
        />
        <path
          d="M230 180 L260 180 L255 270 L225 260 Z"
          className={getMuscleClasses('Obliques')}
          onClick={(e) => handleMuscleClick('Obliques', e)}
          title="Obliques (Right)"
        />
        
        {/* Hip Flexors */}
        <path
          d="M160 260 L200 260 L195 300 L165 300 Z"
          className={getMuscleClasses('Hip Flexors')}
          onClick={(e) => handleMuscleClick('Hip Flexors', e)}
          title="Hip Flexors"
        />
        <path
          d="M200 260 L240 260 L235 300 L205 300 Z"
          className={getMuscleClasses('Hip Flexors')}
          onClick={(e) => handleMuscleClick('Hip Flexors', e)}
          title="Hip Flexors"
        />
        
        {/* Quadriceps */}
        <path
          d="M160 300 L190 300 L185 420 L165 420 Z"
          className={getMuscleClasses('Quadriceps')}
          onClick={(e) => handleMuscleClick('Quadriceps', e)}
          title="Quadriceps (Left)"
        />
        <path
          d="M210 300 L240 300 L235 420 L215 420 Z"
          className={getMuscleClasses('Quadriceps')}
          onClick={(e) => handleMuscleClick('Quadriceps', e)}
          title="Quadriceps (Right)"
        />
        
        {/* Calves */}
        <path
          d="M165 420 L185 420 L180 500 L170 500 Z"
          className={getMuscleClasses('Calves')}
          onClick={(e) => handleMuscleClick('Calves', e)}
          title="Calves (Left)"
        />
        <path
          d="M215 420 L235 420 L230 500 L220 500 Z"
          className={getMuscleClasses('Calves')}
          onClick={(e) => handleMuscleClick('Calves', e)}
          title="Calves (Right)"
        />
      </svg>
      
      {/* Toggle button for front/back view */}
      <div className="view-toggle">
        <span className="view-label">Front View</span>
      </div>
    </div>
  );
};

InteractiveMuscleMap.propTypes = {
  highlightedMuscles: PropTypes.arrayOf(PropTypes.string),
  onMuscleClick: PropTypes.func,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['front', 'back'])
};

export default InteractiveMuscleMap;