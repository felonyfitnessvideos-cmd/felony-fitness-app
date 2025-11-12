/**
 * @file CustomMuscleMap.jsx
 * @description Professional SVG-based muscle map with dynamic highlighting
 * @project Felony Fitness - Workout Builder Platform
 * 
 * Features:
 * - Professional anatomical SVG from Adobe Stock
 * - Dynamic muscle highlighting based on exercises
 * - Front and back views with accurate anatomy
 * - React-controlled color updates via refs
 */

import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import bodyMapSvg from '../../assets/muscles/Body Map.svg';
import './CustomMuscleMap.css';

const CustomMuscleMap = ({ 
  highlightedMuscles = [],
  variant = 'front',
  className = ''
}) => {
  const containerRef = useRef(null);
  
  const HIGHLIGHT_COLOR = '#f97316'; // Orange
  const DEFAULT_COLOR = '#575756'; // Dark gray (original SVG color)
  
  /**
   * Map our database muscle names to SVG group IDs from Body Map.svg
   * 
   * Available SVG groups:
   * - Delts (front shoulders)
   * - Biceps
   * - Triceps
   * - Forearms
   * - Chest (pectorals)
   * - Abbs (abs - note typo)
   * - Quads (quadriceps)
   * - Calfs (calves - note typo)
   * - Hamstrings
   * - Glutes
   * - Traps (trapezius)
   * - Lats (latissimus dorsi)
   * - Rear_Delts (rear shoulders)
   */
  const muscleToSvgId = {
    // Chest/Pectorals
    'Chest': 'Chest',
    'Upper Chest': 'Chest',
    'Middle Chest': 'Chest',
    'Lower Chest': 'Chest',
    'Pecs': 'Chest',
    'Pectorals': 'Chest',
    
    // Biceps
    'Biceps': 'Biceps',
    
    // Triceps
    'Triceps': 'Triceps',
    
    // Shoulders - context-aware based on view
    'Shoulders': variant === 'front' ? 'Delts' : 'Rear_Delts',
    'Deltoids': variant === 'front' ? 'Delts' : 'Rear_Delts',
    'Front Delts': 'Delts',
    'Front Deltoids': 'Delts',
    'Rear Delts': 'Rear_Delts',
    'Rear Deltoids': 'Rear_Delts',
    
    // Abs
    'Abs': 'Abbs',
    'Abdominals': 'Abbs',
    'Obliques': 'Abbs',
    
    // Quads
    'Quads': 'Quads',
    'Quadriceps': 'Quads',
    
    // Hamstrings
    'Hamstrings': 'Hamstrings',
    
    // Glutes
    'Glutes': 'Glutes',
    'Gluteus': 'Glutes',
    
    // Calves
    'Calves': 'Calfs',
    
    // Forearms
    'Forearms': 'Forearms',
    
    // Lats
    'Lats': 'Lats',
    'Latissimus Dorsi': 'Lats',
    'Upper Back': 'Lats',
    
    // Traps
    'Traps': 'Traps',
    'Trapezius': 'Traps',
    
    // Lower Back
    'Lower Back': 'Lats',
  };
  
  // Build set of SVG group IDs to highlight
  const svgIdsToHighlight = new Set();
  highlightedMuscles.forEach(muscle => {
    const muscleName = typeof muscle === 'string' ? muscle : muscle.name;
    const svgId = muscleToSvgId[muscleName];
    if (svgId) {
      svgIdsToHighlight.add(svgId);
    }
  });
  
  // Determine which muscles are visible in this view
  const frontMuscles = ['Delts', 'Biceps', 'Forearms', 'Chest', 'Abbs', 'Quads', 'Calfs'];
  const backMuscles = ['Rear_Delts', 'Triceps', 'Forearms', 'Traps', 'Lats', 'Glutes', 'Hamstrings', 'Calfs'];
  const visibleMuscles = variant === 'front' ? frontMuscles : backMuscles;
  
  // For now, show a simple placeholder
  // TODO: Integrate actual Body Map.svg paths
  return (
    <div className={`custom-muscle-map ${className}`}>
      <svg 
        viewBox="0 0 800 800" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <text x="400" y="400" textAnchor="middle" fontSize="20" fill="#666">
          Professional muscle map integration in progress...
        </text>
        <text x="400" y="430" textAnchor="middle" fontSize="14" fill="#999">
          View: {variant} | Highlighting: {svgIdsToHighlight.size} muscles
        </text>
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
