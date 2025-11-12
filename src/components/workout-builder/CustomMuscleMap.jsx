/**
 * @file CustomMuscleMap.jsx
 * @description Professional SVG-based muscle map with dynamic highlighting
 * @project Felony Fitness - Workout Builder Platform
 * 
 * Features:
 * - Professional anatomical SVG from Adobe Stock
 * - Separate front and back view SVG files
 * - Dynamic muscle highlighting via DOM manipulation
 * - Background anatomy for visual context
 */

import PropTypes from 'prop-types';
import { useEffect, useRef, useState, useMemo } from 'react';
import './CustomMuscleMap.css';
import frontBodyMapSvg from '../../assets/muscles/FrontViewBodyMap-Male.svg';
import backBodyMapSvg from '../../assets/muscles/BackViewBodyMap-Male.svg';

// Color constants
const HIGHLIGHT_COLOR = '#f97316'; // Orange
const DEFAULT_COLOR = '#575756';   // Gray (matches SVG default)

// Map database muscle names to SVG group IDs
const getMuscleToSvgId = (variant) => ({
  // Front view muscles
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
  
  'Abs': 'Abbs', // Note: SVG has typo "Abbs"
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
  
  'Calves': 'Calfs', // Note: SVG has typo "Calfs"
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
  const containerRef = useRef(null);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const [svgContent, setSvgContent] = useState('');
  
  const muscleToSvgId = useMemo(() => getMuscleToSvgId(variant), [variant]);
  
  // Build set of SVG IDs to highlight (memoized to prevent useEffect re-runs)
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
  
  // Load and inject SVG
  useEffect(() => {
    const svgPath = variant === 'front' ? frontBodyMapSvg : backBodyMapSvg;
    const container = containerRef.current;
    
    // Reset loaded state when variant changes
    setSvgLoaded(false);
    
    fetch(svgPath)
      .then(response => response.text())
      .then(svgContent => {
        if (container) {
          // Remove the <style> tag that contains .st0 and .st1 classes
          const cleanedSvg = svgContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
          container.innerHTML = cleanedSvg;
          
          // Wait a tick for DOM to update before setting loaded
          setTimeout(() => {
            setSvgLoaded(true);
          }, 0);
        }
      })
      .catch(error => {
        console.error('Failed to load SVG:', error);
      });
    
    // Cleanup on unmount
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [variant]);
  
  // Apply colors to muscle groups
  useEffect(() => {
    if (!svgLoaded || !containerRef.current) return;
    
    // Small delay to ensure SVG is fully rendered in DOM
    const applyColors = () => {
      const svgElement = containerRef.current?.querySelector('svg');
      if (!svgElement) return;
      
      // Remove any style tags that might interfere
      const styleTags = svgElement.querySelectorAll('style');
      styleTags.forEach(tag => tag.remove());
      
      // Get all groups with IDs (muscle groups)
      const groups = svgElement.querySelectorAll('g[id]');
      
      groups.forEach(group => {
        const groupId = group.getAttribute('id');
        
        // Skip background group
        if (groupId === 'Background') {
          // Keep background at default color
          const paths = group.querySelectorAll('path');
          paths.forEach(path => {
            path.setAttribute('fill', DEFAULT_COLOR);
            path.removeAttribute('class');
            path.style.fill = DEFAULT_COLOR;
          });
          return;
        }
        
        // Apply color based on highlight status
        const shouldHighlight = svgIdsToHighlight.has(groupId);
        const color = shouldHighlight ? HIGHLIGHT_COLOR : DEFAULT_COLOR;
        
        const paths = group.querySelectorAll('path');
        paths.forEach(path => {
          path.setAttribute('fill', color);
          path.removeAttribute('class');
          path.style.fill = color;
        });
      });
    };
    
    // Apply immediately and then again after a short delay to ensure it sticks
    applyColors();
    const timeoutId = setTimeout(applyColors, 50);
    
    return () => clearTimeout(timeoutId);
  }, [svgLoaded, svgIdsToHighlight, highlightedMuscles]);
  
  return (
    <div 
      ref={containerRef}
      className={`custom-muscle-map ${className}`}
      aria-label={`${variant} view muscle map`}
    />
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
