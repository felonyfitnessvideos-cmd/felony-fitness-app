/**
 * @file AnatomicalMuscleMap.jsx
 * @description Anatomically accurate muscle map using react-body-highlighter
 * @project Felony Fitness - Workout Builder Platform
 * 
 * Features:
 * - Professional anatomical diagrams
 * - Front and back views
 * - Muscle highlighting based on target muscle groups
 * - Responsive and compact display
 */

import PropTypes from 'prop-types';
import Model from 'react-body-highlighter';
import './AnatomicalMuscleMap.css';

/**
 * Map our muscle names to react-body-highlighter muscle keys
 * Front view shows: chest, abs, obliques, quadriceps, front-deltoids, biceps, forearm, calves
 * Back view shows: upper-back, lower-back, trapezius, back-deltoids, triceps, gluteal, hamstring, calves
 */
const MUSCLE_MAP = {
  // Chest (FRONT ONLY)
  'Chest': ['chest'],
  'Upper Chest': ['chest'],
  'Middle Chest': ['chest'],
  'Lower Chest': ['chest'],
  'Pectorals': ['chest'],
  'Pecs': ['chest'],
  
  // Back (BACK ONLY)
  'Lats': ['upper-back'],
  'Latissimus Dorsi': ['upper-back'],
  'Upper Back': ['upper-back'],
  'Rhomboids': ['upper-back'],
  'Lower Back': ['lower-back'],
  'Erector Spinae': ['lower-back'],
  'Back': ['upper-back', 'lower-back'],
  'Traps': ['trapezius'],
  'Traps (Upper)': ['trapezius'],
  'Trapezius': ['trapezius'],
  
  // Shoulders
  'Front Delts': ['front-deltoids'], // Front view
  'Front Deltoids': ['front-deltoids'], // Front view
  'Side Delts': ['back-deltoids'], // Back view (side delts show on back)
  'Side Deltoids': ['back-deltoids'], // Back view
  'Lateral Delts': ['back-deltoids'], // Back view
  'Rear Delts': ['back-deltoids'], // Back view
  'Rear Deltoids': ['back-deltoids'], // Back view
  'Deltoids': ['front-deltoids', 'back-deltoids'], // Both views
  'Shoulders': ['front-deltoids', 'back-deltoids'], // Both views
  
  // Arms
  'Biceps': ['biceps'], // Front view
  'Triceps': ['triceps'], // Back view
  'Forearms': ['forearm'], // Front view
  'Forearm': ['forearm'], // Front view
  'Brachialis': ['biceps'], // Part of upper arm flexors (front)
  
  // Legs
  'Quads': ['quadriceps'], // Front view
  'Quadriceps': ['quadriceps'], // Front view
  'Hamstrings': ['hamstring'], // Back view
  'Glutes': ['gluteal'], // Back view
  'Gluteus': ['gluteal'], // Back view
  'Calves': ['calves'], // Both views
  'Legs': ['quadriceps', 'hamstring', 'calves'], // Both views
  'Hip Flexors': ['quadriceps'], // Front view
  'Hip Abductors': ['gluteal'], // Back view
  
  // Core (FRONT ONLY)
  'Abs': ['abs'],
  'Abdominals': ['abs'],
  'Upper Abdominals': ['abs'],
  'Middle Abdominals': ['abs'],
  'Lower Abdominals': ['abs'],
  'Obliques': ['obliques'],
  'Core': ['abs', 'obliques'],
  'Serratus Anterior': ['abs'], // Rib muscles, often shown with abs
};

/**
 * Anatomical Muscle Map Component
 * Uses react-body-highlighter for professional muscle visualization
 */
const AnatomicalMuscleMap = ({ 
  highlightedMuscles = [],
  variant = 'front',
  className = ''
}) => {
  
  /**
   * Convert our muscle names to react-body-highlighter format
   * @returns {Array} Array of muscle objects for highlighting
   */
  const getMusclesForHighlighting = () => {
    const muscleSet = new Set();
    const unmappedMuscles = [];
    
    // Debug: Log what muscles we're trying to highlight
    console.log(`[AnatomicalMuscleMap ${variant}] Input muscles:`, highlightedMuscles);
    
    highlightedMuscles.forEach(muscleName => {
      const mappedMuscles = MUSCLE_MAP[muscleName];
      if (mappedMuscles) {
        mappedMuscles.forEach(m => muscleSet.add(m));
      } else {
        unmappedMuscles.push(muscleName);
      }
    });
    
    const muscles = Array.from(muscleSet);
    
    // Debug: Log unmapped muscles
    if (unmappedMuscles.length > 0) {
      console.warn(`[AnatomicalMuscleMap ${variant}] Unmapped muscles:`, unmappedMuscles);
    }
    
    // Debug: Log final mapped muscles
    console.log(`[AnatomicalMuscleMap ${variant}] Mapped muscles:`, muscles);
    
    return muscles.map(name => ({ name, muscles: [name] }));
  };

  const data = getMusclesForHighlighting();

  return (
    <div className={`anatomical-muscle-map ${className}`}>
      <Model
        data={data}
        style={{ width: '100%', padding: '0' }}
        type={variant} // 'front' or 'back'
        highlightedColors={['#f97316']} // Orange highlight color
      />
    </div>
  );
};

AnatomicalMuscleMap.propTypes = {
  highlightedMuscles: PropTypes.arrayOf(PropTypes.string),
  variant: PropTypes.oneOf(['front', 'back']),
  className: PropTypes.string
};

export default AnatomicalMuscleMap;
