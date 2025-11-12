/**
 * @file CustomMuscleMap.jsx
 * @description Custom SVG-based muscle map with full control over highlighting
 * @project Felony Fitness - Workout Builder Platform
 * 
 * Features:
 * - Custom SVG muscle diagrams
 * - Precise control over muscle highlighting
 * - Front and back views
 * - Responsive and performant
 */

import PropTypes from 'prop-types';
import './CustomMuscleMap.css';

/**
 * Simple muscle map using SVG shapes
 * We'll create basic shapes for major muscle groups
 */
const CustomMuscleMap = ({ 
  highlightedMuscles = [],
  variant = 'front',
  className = ''
}) => {
  
  const HIGHLIGHT_COLOR = '#f97316'; // Orange
  const DEFAULT_COLOR = '#e5e7eb'; // Light gray
  
  // Map muscle names to simplified identifiers
  const muscleMap = {
    // Front view muscles
    'Chest': 'chest',
    'Upper Chest': 'chest',
    'Middle Chest': 'chest',
    'Lower Chest': 'chest',
    'Pecs': 'chest',
    'Biceps': 'biceps',
    'Front Delts': 'shoulders',
    'Front Deltoids': 'shoulders',
    'Shoulders': 'shoulders',
    'Abs': 'abs',
    'Abdominals': 'abs',
    'Obliques': 'obliques',
    'Quads': 'quads',
    'Quadriceps': 'quads',
    'Forearms': 'forearms',
    
    // Back view muscles
    'Lats': 'lats',
    'Latissimus Dorsi': 'lats',
    'Upper Back': 'upper-back',
    'Traps': 'traps',
    'Trapezius': 'traps',
    'Triceps': 'triceps',
    'Lower Back': 'lower-back',
    'Glutes': 'glutes',
    'Hamstrings': 'hamstrings',
    'Calves': 'calves'
  };
  
  // Get muscles to highlight for this view
  const getMuscleColor = (musclePart) => {
    const highlightedSet = new Set();
    
    highlightedMuscles.forEach(muscle => {
      const muscleName = typeof muscle === 'string' ? muscle : muscle.name;
      const mapped = muscleMap[muscleName];
      if (mapped) {
        highlightedSet.add(mapped);
      }
    });
    
    return highlightedSet.has(musclePart) ? HIGHLIGHT_COLOR : DEFAULT_COLOR;
  };
  
  if (variant === 'front') {
    return (
      <div className={`custom-muscle-map ${className}`}>
        <svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
          {/* Head */}
          <circle cx="100" cy="30" r="20" fill="#d1d5db" />
          
          {/* Shoulders */}
          <ellipse cx="70" cy="70" rx="15" ry="12" fill={getMuscleColor('shoulders')} />
          <ellipse cx="130" cy="70" rx="15" ry="12" fill={getMuscleColor('shoulders')} />
          
          {/* Chest */}
          <ellipse cx="85" cy="100" rx="18" ry="25" fill={getMuscleColor('chest')} />
          <ellipse cx="115" cy="100" rx="18" ry="25" fill={getMuscleColor('chest')} />
          
          {/* Abs */}
          <rect x="85" y="130" width="30" height="15" rx="3" fill={getMuscleColor('abs')} />
          <rect x="85" y="148" width="30" height="15" rx="3" fill={getMuscleColor('abs')} />
          <rect x="85" y="166" width="30" height="15" rx="3" fill={getMuscleColor('abs')} />
          
          {/* Obliques */}
          <path d="M 75 135 Q 70 150 72 165" stroke={getMuscleColor('obliques')} strokeWidth="8" fill="none" />
          <path d="M 125 135 Q 130 150 128 165" stroke={getMuscleColor('obliques')} strokeWidth="8" fill="none" />
          
          {/* Biceps */}
          <ellipse cx="55" cy="110" rx="10" ry="18" fill={getMuscleColor('biceps')} />
          <ellipse cx="145" cy="110" rx="10" ry="18" fill={getMuscleColor('biceps')} />
          
          {/* Forearms */}
          <rect x="48" y="135" width="10" height="40" rx="5" fill={getMuscleColor('forearms')} />
          <rect x="142" y="135" width="10" height="40" rx="5" fill={getMuscleColor('forearms')} />
          
          {/* Quads */}
          <ellipse cx="85" cy="250" rx="18" ry="60" fill={getMuscleColor('quads')} />
          <ellipse cx="115" cy="250" rx="18" ry="60" fill={getMuscleColor('quads')} />
          
          {/* Calves */}
          <ellipse cx="85" cy="350" rx="12" ry="35" fill={getMuscleColor('calves')} />
          <ellipse cx="115" cy="350" rx="12" ry="35" fill={getMuscleColor('calves')} />
        </svg>
      </div>
    );
  }
  
  // Back view
  return (
    <div className={`custom-muscle-map ${className}`}>
      <svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="100" cy="30" r="20" fill="#d1d5db" />
        
        {/* Traps */}
        <path d="M 80 55 L 100 70 L 120 55 L 115 75 L 85 75 Z" fill={getMuscleColor('traps')} />
        
        {/* Shoulders (rear delts) */}
        <ellipse cx="70" cy="70" rx="15" ry="12" fill={getMuscleColor('shoulders')} />
        <ellipse cx="130" cy="70" rx="15" ry="12" fill={getMuscleColor('shoulders')} />
        
        {/* Upper Back / Lats */}
        <ellipse cx="85" cy="110" rx="25" ry="35" fill={getMuscleColor('lats')} />
        <ellipse cx="115" cy="110" rx="25" ry="35" fill={getMuscleColor('lats')} />
        
        {/* Lower Back */}
        <rect x="80" y="150" width="40" height="30" rx="8" fill={getMuscleColor('lower-back')} />
        
        {/* Triceps */}
        <ellipse cx="55" cy="110" rx="10" ry="20" fill={getMuscleColor('triceps')} />
        <ellipse cx="145" cy="110" rx="10" ry="20" fill={getMuscleColor('triceps')} />
        
        {/* Forearms */}
        <rect x="48" y="135" width="10" height="40" rx="5" fill={getMuscleColor('forearms')} />
        <rect x="142" y="135" width="10" height="40" rx="5" fill={getMuscleColor('forearms')} />
        
        {/* Glutes */}
        <ellipse cx="85" cy="195" rx="20" ry="25" fill={getMuscleColor('glutes')} />
        <ellipse cx="115" cy="195" rx="20" ry="25" fill={getMuscleColor('glutes')} />
        
        {/* Hamstrings */}
        <ellipse cx="85" cy="260" rx="18" ry="55" fill={getMuscleColor('hamstrings')} />
        <ellipse cx="115" cy="260" rx="18" ry="55" fill={getMuscleColor('hamstrings')} />
        
        {/* Calves */}
        <ellipse cx="85" cy="350" rx="12" ry="35" fill={getMuscleColor('calves')} />
        <ellipse cx="115" cy="350" rx="12" ry="35" fill={getMuscleColor('calves')} />
      </svg>
    </div>
  );
};

CustomMuscleMap.propTypes = {
  highlightedMuscles: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        priority: PropTypes.string
      })
    ])
  ),
  variant: PropTypes.oneOf(['front', 'back']),
  className: PropTypes.string
};

export default CustomMuscleMap;
