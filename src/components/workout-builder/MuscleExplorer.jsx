/**
 * @file MuscleExplorer.jsx
 * @description Interactive muscle explorer with bi-directional muscle-exercise mapping
 * @project Felony Fitness - Workout Builder Platform
 * 
 * Features:
 * - Click Muscle → Show Exercises: Click on muscle regions to find related exercises
 * - Click Exercise → Highlight Muscles: Select exercises to highlight targeted muscle groups
 * - Dynamic muscle engagement visualization
 * - Responsive design with mobile support
 */

import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import InteractiveMuscleMap from './InteractiveMuscleMap';
import './MuscleExplorer.css';
import { Search, Filter, RotateCcw, Zap } from 'lucide-react';

/**
 * MuscleExplorer Component
 * Main component that orchestrates the muscle map and exercise interactions
 */
const MuscleExplorer = ({ 
  className = '',
  onExerciseSelect = () => {},
  initialMuscles = [],
  showFilters = true 
}) => {
  // State management
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [highlightedMuscles, setHighlightedMuscles] = useState(initialMuscles);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapView, setMapView] = useState('front');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  /**
   * Handle muscle region click - Feature 1: Click Muscle → Show Exercises
   * @param {string} muscleName - Name of the clicked muscle group
   */
  const handleMuscleClick = useCallback(async (muscleName) => {
    setLoading(true);
    setError(null);
    setSelectedMuscle(muscleName);
    setSelectedExercise(null);

    try {
      // Query exercises that work the selected muscle (primary, secondary, or tertiary)
      const { data, error: queryError } = await supabase
        .from('exercises')
        .select(`
          *,
          primary_muscle_groups:primary_muscle_group_id(name),
          secondary_muscle_groups:secondary_muscle_group_id(name),
          tertiary_muscle_groups:tertiary_muscle_group_id(name)
        `)
        .or(`primary_muscle_groups.name.eq.${muscleName},secondary_muscle_groups.name.eq.${muscleName},tertiary_muscle_groups.name.eq.${muscleName}`)
        .order('name');

      if (queryError) throw queryError;

      setExercises(data || []);
      
      // Highlight the clicked muscle
      setHighlightedMuscles([muscleName]);

    } catch (err) {
      console.error('Error fetching exercises for muscle:', err);
      setError(`Failed to load exercises for ${muscleName}`);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle exercise selection - Feature 2: Click Exercise → Highlight Muscles
   * @param {Object} exercise - Selected exercise object
   */
  const handleExerciseSelect = useCallback((exercise) => {
    setSelectedExercise(exercise);
    
    // Extract all muscle groups from the exercise
    const muscles = [];
    
    if (exercise.primary_muscle_groups?.name) {
      muscles.push(exercise.primary_muscle_groups.name);
    }
    if (exercise.secondary_muscle_groups?.name) {
      muscles.push(exercise.secondary_muscle_groups.name);
    }
    if (exercise.tertiary_muscle_groups?.name) {
      muscles.push(exercise.tertiary_muscle_groups.name);
    }

    // Remove duplicates and set highlighted muscles
    const uniqueMuscles = [...new Set(muscles)];
    setHighlightedMuscles(uniqueMuscles);
    
    // Notify parent component
    onExerciseSelect(exercise);
  }, [onExerciseSelect]);

  /**
   * Reset the explorer to initial state
   */
  const handleReset = useCallback(() => {
    setSelectedMuscle(null);
    setExercises([]);
    setSelectedExercise(null);
    setHighlightedMuscles(initialMuscles);
    setSearchTerm('');
    setError(null);
  }, [initialMuscles]);

  /**
   * Toggle between front and back view
   */
  const toggleMapView = useCallback(() => {
    setMapView(prev => prev === 'front' ? 'back' : 'front');
  }, []);

  /**
   * Filter exercises based on search term and difficulty
   */
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || 
      exercise.type?.toLowerCase() === difficultyFilter.toLowerCase();
    
    return matchesSearch && matchesDifficulty;
  });

  /**
   * Get muscle engagement level for styling
   * @param {Object} exercise - Exercise object
   * @param {string} muscleName - Muscle group name
   * @returns {string} - Engagement level (primary, secondary, tertiary, none)
   */
  const getMuscleEngagement = (exercise, muscleName) => {
    if (exercise.primary_muscle_groups?.name === muscleName) return 'primary';
    if (exercise.secondary_muscle_groups?.name === muscleName) return 'secondary';
    if (exercise.tertiary_muscle_groups?.name === muscleName) return 'tertiary';
    return 'none';
  };

  return (
    <div className={`muscle-explorer ${className}`}>
      {/* Header */}
      <div className="explorer-header">
        <h2 className="explorer-title">
          <Zap className="title-icon" />
          Muscle Explorer
        </h2>
        <div className="header-actions">
          <button 
            className="view-toggle-btn"
            onClick={toggleMapView}
            title={`Switch to ${mapView === 'front' ? 'back' : 'front'} view`}
          >
            <RotateCcw size={16} />
            {mapView === 'front' ? 'Back' : 'Front'}
          </button>
          <button 
            className="reset-btn"
            onClick={handleReset}
            title="Reset explorer"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="explorer-content">
        {/* Muscle Map */}
        <div className="muscle-map-section">
          <InteractiveMuscleMap
            highlightedMuscles={highlightedMuscles}
            onMuscleClick={handleMuscleClick}
            variant={mapView}
            className={loading ? 'loading' : ''}
          />
          
          {selectedMuscle && (
            <div className="selected-muscle-info">
              <h3>Selected Muscle: {selectedMuscle}</h3>
              <p>{filteredExercises.length} exercises found</p>
            </div>
          )}
        </div>

        {/* Exercise List */}
        <div className="exercise-list-section">
          {showFilters && (exercises.length > 0 || selectedMuscle) && (
            <div className="exercise-filters">
              <div className="search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="difficulty-filter">
                <Filter size={16} />
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility</option>
                </select>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {loading && (
            <div className="loading-message">
              <div className="loading-spinner"></div>
              <p>Loading exercises...</p>
            </div>
          )}

          {!loading && !error && selectedMuscle && (
            <div className="exercise-results">
              <h3>
                Exercises for {selectedMuscle}
                <span className="result-count">({filteredExercises.length})</span>
              </h3>
              
              {filteredExercises.length === 0 ? (
                <div className="no-results">
                  <p>No exercises found{searchTerm ? ` for "${searchTerm}"` : ''}.</p>
                </div>
              ) : (
                <div className="exercise-grid">
                  {filteredExercises.map(exercise => (
                    <div
                      key={exercise.id}
                      className={`exercise-card ${selectedExercise?.id === exercise.id ? 'selected' : ''}`}
                      onClick={() => handleExerciseSelect(exercise)}
                    >
                      <div className="exercise-header">
                        <h4 className="exercise-name">{exercise.name}</h4>
                        <span className={`engagement-badge ${getMuscleEngagement(exercise, selectedMuscle)}`}>
                          {getMuscleEngagement(exercise, selectedMuscle)}
                        </span>
                      </div>
                      
                      <div className="exercise-muscles">
                        {exercise.primary_muscle_groups?.name && (
                          <span className="muscle-tag primary">
                            Primary: {exercise.primary_muscle_groups.name}
                          </span>
                        )}
                        {exercise.secondary_muscle_groups?.name && (
                          <span className="muscle-tag secondary">
                            Secondary: {exercise.secondary_muscle_groups.name}
                          </span>
                        )}
                        {exercise.tertiary_muscle_groups?.name && (
                          <span className="muscle-tag tertiary">
                            Tertiary: {exercise.tertiary_muscle_groups.name}
                          </span>
                        )}
                      </div>

                      {exercise.type && (
                        <div className="exercise-type">
                          <span className="type-badge">{exercise.type}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!selectedMuscle && !loading && (
            <div className="welcome-message">
              <h3>Welcome to Muscle Explorer</h3>
              <p>Click on any muscle group to discover exercises that target that area.</p>
              <ul>
                <li>🎯 <strong>Click muscles</strong> to find exercises</li>
                <li>💪 <strong>Click exercises</strong> to see muscle targeting</li>
                <li>🔄 <strong>Toggle views</strong> for front and back muscles</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MuscleExplorer;