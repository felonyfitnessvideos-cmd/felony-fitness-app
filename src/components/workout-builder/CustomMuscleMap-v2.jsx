/**
 * @file CustomMuscleMap.jsx (v2 - Simplified)
 * @description Professional SVG muscle map with reliable dynamic highlighting
 */

import PropTypes from 'prop-types';
import { useEffect, useRef, useMemo } from 'react';
import './CustomMuscleMap.css';

// Color constants
const HIGHLIGHT_COLOR = '#f97316'; // Orange
const DEFAULT_COLOR = '#575756';   // Gray

// Map database muscle names to SVG group IDs
const getMuscleToSvgId = (variant) => ({
  'Chest': 'Chest',
  'Upper Chest': 'Chest',
  'Middle Chest': 'Chest',
  'Lower Chest': 'Chest',
  'Pecs': 'Chest',
  'Pectorals': 'Chest',
  
  'Shoulders': variant === 'front' ? 'Delts' : 'Rear_Delts',
  'Front Delts': 'Delts',
  'Side Delts': 'Delts',
  'Rear Delts': 'Rear_Delts',
  'Deltoids': variant === 'front' ? 'Delts' : 'Rear_Delts',
  
  'Biceps': 'Biceps',
  'Bicep': 'Biceps',
  
  'Triceps': 'Triceps',
  'Tricep': 'Triceps',
  
  'Forearms': 'Forearms',
  'Forearm': 'Forearms',
  
  'Abs': 'Abbs',
  'Abdominals': 'Abbs',
  'Core': 'Abbs',
  'Obliques': 'Abbs',
  
  'Quads': 'Quads',
  'Quadriceps': 'Quads',
  'Front Thighs': 'Quads',
  
  'Hamstrings': 'Hamstrings',
  'Hams': 'Hamstrings',
  'Back Thighs': 'Hamstrings',
  
  'Glutes': 'Glutes',
  'Glute': 'Glutes',
  'Butt': 'Glutes',
  
  'Calves': 'Calfs',
  'Calf': 'Calfs',
  
  'Back': 'Lats',
  'Lats': 'Lats',
  'Latissimus Dorsi': 'Lats',
  'Upper Back': 'Lats',
  
  'Traps': 'Traps',
  'Trapezius': 'Traps',
  'Upper Traps': 'Traps'
});

const CustomMuscleMap = ({ 
  highlightedMuscles = [],
  variant = 'front',
  className = ''
}) => {
  const svgRef = useRef(null);
  
  const muscleToSvgId = useMemo(() => getMuscleToSvgId(variant), [variant]);
  
  // Build set of SVG IDs to highlight
  const svgIdsToHighlight = useMemo(() => {
    const ids = new Set();
    highlightedMuscles.forEach(muscle => {
      const muscleName = typeof muscle === 'string' ? muscle : muscle.name;
      const svgId = muscleToSvgId[muscleName];
      if (svgId) {
        ids.add(svgId);
      }
    });
    return ids;
  }, [highlightedMuscles, muscleToSvgId]);
  
  // Apply colors whenever SVG mounts or highlights change
  useEffect(() => {
    if (!svgRef.current) return;
    
    const applyColors = () => {
      const svg = svgRef.current;
      if (!svg) return;
      
      // Get all groups
      const groups = svg.querySelectorAll('g[id]');
      
      groups.forEach(group => {
        const groupId = group.getAttribute('id');
        
        // Determine color
        let color = DEFAULT_COLOR;
        if (groupId !== 'Background' && svgIdsToHighlight.has(groupId)) {
          color = HIGHLIGHT_COLOR;
        }
        
        // Apply to all paths in group
        const paths = group.querySelectorAll('path');
        paths.forEach(path => {
          path.setAttribute('fill', color);
          path.removeAttribute('class');
        });
      });
    };
    
    // Apply colors with a small delay to ensure SVG is rendered
    requestAnimationFrame(() => {
      applyColors();
    });
  }, [svgIdsToHighlight]);
  
  // SVG file paths
  const svgFile = variant === 'front' 
    ? '/src/assets/muscles/FrontViewBodyMap-Male.svg'
    : '/src/assets/muscles/BackViewBodyMap-Male.svg';
  
  return (
    <div className={`custom-muscle-map ${className}`}>
      <object
        ref={svgRef}
        data={svgFile}
        type="image/svg+xml"
        aria-label={`${variant} view muscle map`}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      />
    </div>
  );
};

CustomMuscleMap.propTypes = {
  highlightedMuscles: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        priority: PropTypes.oneOf(['primary', 'secondary'])
      })
    ])
  ),
  variant: PropTypes.oneOf(['front', 'back']),
  className: PropTypes.string
};

export default CustomMuscleMap;
