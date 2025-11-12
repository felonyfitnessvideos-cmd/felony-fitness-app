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
 * Color-codes muscles by priority: Primary (Orange) > Secondary (Yellow) > Tertiary (Grey)
 */
const AnatomicalMuscleMap = ({ 
  highlightedMuscles = [],
  variant = 'front',
  className = ''
}) => {
  
  /**
   * Determine which muscles should be visible on this view
   * Front view: chest, abs, obliques, quadriceps, front-deltoids, biceps, forearm, calves
   * Back view: upper-back, lower-back, trapezius, back-deltoids, triceps, gluteal, hamstring, calves
   */
  const FRONT_VIEW_MUSCLES = ['chest', 'abs', 'obliques', 'quadriceps', 'front-deltoids', 'biceps', 'forearm', 'calves'];
  const BACK_VIEW_MUSCLES = ['upper-back', 'lower-back', 'trapezius', 'back-deltoids', 'triceps', 'gluteal', 'hamstring', 'calves'];
  
  /**
   * Color mapping for muscle priorities
   * Primary: Bright Orange (#f97316) - Main target muscles
   * Secondary: Yellow (#fbbf24) - Supporting muscles
   * Tertiary: Grey (#9ca3af) - Stabilizers (don't count as volume)
   */
  const PRIORITY_COLORS = {
    primary: '#f97316',    // Bright orange
    secondary: '#fbbf24',  // Yellow
    tertiary: '#9ca3af'    // Grey
  };
  
  /**
   * Convert our muscle names to react-body-highlighter format
   * Filter by variant and group by priority for color-coding
   * @returns {Object} Object with arrays for each priority level
   */
  const getMusclesForHighlighting = () => {
    const musclesByPriority = {
      primary: [],
      secondary: [],
      tertiary: []
    };
    const unmappedMuscles = [];
    
    // Debug: Log what muscles we're trying to highlight
    console.log(`[AnatomicalMuscleMap ${variant}] Input muscles:`, highlightedMuscles);
    
    // Determine which muscles are allowed for this view
    const allowedMuscles = variant === 'front' ? FRONT_VIEW_MUSCLES : BACK_VIEW_MUSCLES;
    
    // Process each muscle with its priority
    highlightedMuscles.forEach(muscleEntry => {
      // Handle both old format (string) and new format (object with name/priority)
      const muscleName = typeof muscleEntry === 'string' ? muscleEntry : muscleEntry.name;
      const priority = typeof muscleEntry === 'string' ? 'primary' : muscleEntry.priority;
      
      const mappedMuscles = MUSCLE_MAP[muscleName];
      
      if (mappedMuscles) {
        // Filter by allowed muscles for this view
        const filteredMuscles = mappedMuscles.filter(m => allowedMuscles.includes(m));
        filteredMuscles.forEach(m => {
          // Avoid duplicates
          if (!musclesByPriority.primary.includes(m) && 
              !musclesByPriority.secondary.includes(m) && 
              !musclesByPriority.tertiary.includes(m)) {
            musclesByPriority[priority].push(m);
          }
        });
      } else {
        unmappedMuscles.push(muscleName);
      }
    });
    
    // Debug: Log unmapped muscles
    if (unmappedMuscles.length > 0) {
      console.warn(`[AnatomicalMuscleMap ${variant}] Unmapped muscles:`, unmappedMuscles);
    }
    
    // Debug: Log final mapped muscles by priority
    console.log(`[AnatomicalMuscleMap ${variant}] Muscles by priority:`, musclesByPriority);
    
    return musclesByPriority;
  };

  const musclesByPriority = getMusclesForHighlighting();
  
  // Create data arrays for each priority level
  const primaryData = musclesByPriority.primary.map(name => ({ name, muscles: [name] }));
  const secondaryData = musclesByPriority.secondary.map(name => ({ name, muscles: [name] }));
  const tertiaryData = musclesByPriority.tertiary.map(name => ({ name, muscles: [name] }));

  return (
    <div className={`anatomical-muscle-map ${className}`}>
      {/* Render tertiary muscles first (bottom layer) */}
      {tertiaryData.length > 0 && (
        <div className="muscle-layer muscle-layer-tertiary">
          <Model
            data={tertiaryData}
            style={{ width: '100%', padding: '0', position: 'absolute' }}
            type={variant}
            highlightedColors={[PRIORITY_COLORS.tertiary]}
          />
        </div>
      )}
      
      {/* Render secondary muscles (middle layer) */}
      {secondaryData.length > 0 && (
        <div className="muscle-layer muscle-layer-secondary">
          <Model
            data={secondaryData}
            style={{ width: '100%', padding: '0', position: 'absolute' }}
            type={variant}
            highlightedColors={[PRIORITY_COLORS.secondary]}
          />
        </div>
      )}
      
      {/* Render primary muscles last (top layer) */}
      {primaryData.length > 0 && (
        <div className="muscle-layer muscle-layer-primary">
          <Model
            data={primaryData}
            style={{ width: '100%', padding: '0', position: 'absolute' }}
            type={variant}
            highlightedColors={[PRIORITY_COLORS.primary]}
          />
        </div>
      )}
      
      {/* Base body outline (no highlighting) */}
      {primaryData.length === 0 && secondaryData.length === 0 && tertiaryData.length === 0 && (
        <Model
          data={[]}
          style={{ width: '100%', padding: '0' }}
          type={variant}
          highlightedColors={[]}
        />
      )}
    </div>
  );
};

AnatomicalMuscleMap.propTypes = {
  highlightedMuscles: PropTypes.arrayOf(PropTypes.string),
  variant: PropTypes.oneOf(['front', 'back']),
  className: PropTypes.string
};

export default AnatomicalMuscleMap;
