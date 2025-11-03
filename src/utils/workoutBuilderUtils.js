/**
 * @file workoutBuilderUtils.js
 * @description Utility functions for the Workout Builder Platform
 * @project Felony Fitness - Dynamic Workout Builder
 * 
 * This file provides helper functions for:
 * - Muscle group mappings and validations
 * - Exercise filtering and searching
 * - Data transformations
 * - UI state management
 */

// ===============================================
// MUSCLE GROUP UTILITIES
// ===============================================

/**
 * Comprehensive muscle group mappings for the interactive body map
 */
export const MUSCLE_MAPPINGS = {
  // Front view muscles
  front: {
    'chest': 'Chest',
    'front-delts': 'Front Delts',
    'biceps': 'Biceps',
    'forearms': 'Forearms',
    'abs': 'Abs',
    'obliques': 'Obliques',
    'quadriceps': 'Quadriceps',
    'hip-flexors': 'Hip Flexors',
    'calves-front': 'Calves'
  },
  
  // Back view muscles
  back: {
    'upper-traps': 'Upper Traps',
    'middle-traps': 'Middle Traps',
    'lower-traps': 'Lower Traps',
    'rhomboids': 'Rhomboids',
    'lats': 'Lats',
    'rear-delts': 'Rear Delts',
    'triceps': 'Triceps',
    'lower-back': 'Lower Back',
    'glutes': 'Glutes',
    'hamstrings': 'Hamstrings',
    'calves-back': 'Calves'
  }
};

/**
 * Get all muscle names from both views
 * @returns {Array} Array of all muscle names
 */
export const getAllMuscleNames = () => {
  return [
    ...Object.values(MUSCLE_MAPPINGS.front),
    ...Object.values(MUSCLE_MAPPINGS.back)
  ].filter((muscle, index, array) => array.indexOf(muscle) === index); // Remove duplicates
};

/**
 * Get muscle name from SVG element ID
 * @param {string} elementId - SVG element ID
 * @param {string} view - Current view (front/back)
 * @returns {string|null} Muscle name or null
 */
export const getMuscleNameFromId = (elementId, view = 'front') => {
  const mappings = MUSCLE_MAPPINGS[view] || MUSCLE_MAPPINGS.front;
  return mappings[elementId] || null;
};

/**
 * Get SVG element ID from muscle name
 * @param {string} muscleName - Muscle name
 * @param {string} view - Preferred view
 * @returns {string|null} SVG element ID or null
 */
export const getElementIdFromMuscleName = (muscleName, view = 'front') => {
  // Check both views
  for (const [viewKey, mappings] of Object.entries(MUSCLE_MAPPINGS)) {
    for (const [elementId, name] of Object.entries(mappings)) {
      if (name === muscleName) {
        // Prefer the specified view if muscle exists in both
        if (viewKey === view) return elementId;
        // If not found in preferred view, use first match
        if (!view || viewKey === 'front') return elementId;
      }
    }
  }
  return null;
};

/**
 * Determine which view contains a specific muscle
 * @param {string} muscleName - Muscle name to search for
 * @returns {string|null} View name ('front'/'back') or null
 */
export const getViewForMuscle = (muscleName) => {
  for (const [view, mappings] of Object.entries(MUSCLE_MAPPINGS)) {
    if (Object.values(mappings).includes(muscleName)) {
      return view;
    }
  }
  return null;
};

/**
 * Check if a muscle exists in the mappings
 * @param {string} muscleName - Muscle name to validate
 * @returns {boolean} True if muscle exists
 */
export const isValidMuscle = (muscleName) => {
  return getAllMuscleNames().includes(muscleName);
};

// ===============================================
// EXERCISE FILTERING UTILITIES
// ===============================================

/**
 * Filter exercises by muscle group
 * @param {Array} exercises - Array of exercise objects
 * @param {string} muscleName - Target muscle name
 * @param {string} engagementType - Type of engagement ('primary', 'secondary', 'tertiary', 'any')
 * @returns {Array} Filtered exercises
 */
export const filterExercisesByMuscle = (exercises, muscleName, engagementType = 'any') => {
  if (!exercises || !Array.isArray(exercises)) return [];
  if (!muscleName) return exercises;

  return exercises.filter(exercise => {
    const primaryMuscle = getMuscleGroupName(exercise.primary_muscle_groups);
    const secondaryMuscle = getMuscleGroupName(exercise.secondary_muscle_groups);
    const tertiaryMuscle = getMuscleGroupName(exercise.tertiary_muscle_groups);

    switch (engagementType.toLowerCase()) {
      case 'primary':
        return primaryMuscle === muscleName;
      case 'secondary':
        return secondaryMuscle === muscleName;
      case 'tertiary':
        return tertiaryMuscle === muscleName;
      case 'any':
      default:
        return primaryMuscle === muscleName || 
               secondaryMuscle === muscleName || 
               tertiaryMuscle === muscleName;
    }
  });
};

/**
 * Filter exercises by difficulty level
 * @param {Array} exercises - Array of exercise objects
 * @param {string} difficulty - Difficulty level or 'All'
 * @returns {Array} Filtered exercises
 */
export const filterExercisesByDifficulty = (exercises, difficulty) => {
  if (!exercises || !Array.isArray(exercises)) return [];
  if (!difficulty || difficulty === 'All') return exercises;

  return exercises.filter(exercise => exercise.difficulty_level === difficulty);
};

/**
 * Filter exercises by equipment needed
 * @param {Array} exercises - Array of exercise objects
 * @param {string} equipment - Equipment type or 'All'
 * @returns {Array} Filtered exercises
 */
export const filterExercisesByEquipment = (exercises, equipment) => {
  if (!exercises || !Array.isArray(exercises)) return [];
  if (!equipment || equipment === 'All') return exercises;

  return exercises.filter(exercise => {
    if (!exercise.equipment_needed) return equipment === 'Bodyweight';
    return exercise.equipment_needed.toLowerCase().includes(equipment.toLowerCase());
  });
};

/**
 * Search exercises by name or description
 * @param {Array} exercises - Array of exercise objects
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered exercises
 */
export const searchExercises = (exercises, searchTerm) => {
  if (!exercises || !Array.isArray(exercises)) return [];
  if (!searchTerm || searchTerm.trim() === '') return exercises;

  const term = searchTerm.toLowerCase().trim();
  
  return exercises.filter(exercise => {
    return exercise.name.toLowerCase().includes(term) ||
           (exercise.description && exercise.description.toLowerCase().includes(term)) ||
           (exercise.instructions && exercise.instructions.toLowerCase().includes(term));
  });
};

/**
 * Apply multiple filters to exercises
 * @param {Array} exercises - Array of exercise objects
 * @param {Object} filters - Filter options
 * @returns {Array} Filtered exercises
 */
export const applyMultipleFilters = (exercises, filters = {}) => {
  let filtered = exercises;

  // Apply muscle filter
  if (filters.muscle && filters.muscle !== 'All') {
    filtered = filterExercisesByMuscle(filtered, filters.muscle, filters.engagementType);
  }

  // Apply difficulty filter
  if (filters.difficulty && filters.difficulty !== 'All') {
    filtered = filterExercisesByDifficulty(filtered, filters.difficulty);
  }

  // Apply equipment filter
  if (filters.equipment && filters.equipment !== 'All') {
    filtered = filterExercisesByEquipment(filtered, filters.equipment);
  }

  // Apply search term
  if (filters.search) {
    filtered = searchExercises(filtered, filters.search);
  }

  return filtered;
};

// ===============================================
// DATA TRANSFORMATION UTILITIES
// ===============================================

/**
 * Extract muscle group name from various data formats
 * @param {string|Object} muscleData - Muscle group data
 * @returns {string|null} Muscle group name
 */
export const getMuscleGroupName = (muscleData) => {
  if (!muscleData) return null;
  
  if (typeof muscleData === 'string') return muscleData;
  if (typeof muscleData === 'object' && muscleData.name) return muscleData.name;
  
  return null;
};

/**
 * Get all muscle groups targeted by an exercise
 * @param {Object} exercise - Exercise object
 * @returns {Array} Array of muscle names with engagement types
 */
export const getExerciseMuscles = (exercise) => {
  const muscles = [];

  const primary = getMuscleGroupName(exercise.primary_muscle_groups);
  if (primary) muscles.push({ name: primary, type: 'primary' });

  const secondary = getMuscleGroupName(exercise.secondary_muscle_groups);
  if (secondary && secondary !== primary) muscles.push({ name: secondary, type: 'secondary' });

  const tertiary = getMuscleGroupName(exercise.tertiary_muscle_groups);
  if (tertiary && tertiary !== primary && tertiary !== secondary) {
    muscles.push({ name: tertiary, type: 'tertiary' });
  }

  return muscles;
};

/**
 * Get unique equipment types from exercises array
 * @param {Array} exercises - Array of exercise objects
 * @returns {Array} Array of unique equipment types
 */
export const getUniqueEquipmentTypes = (exercises) => {
  if (!exercises || !Array.isArray(exercises)) return [];

  const equipmentSet = new Set();
  
  exercises.forEach(exercise => {
    if (exercise.equipment_needed) {
      // Split by comma in case of multiple equipment types
      const types = exercise.equipment_needed.split(',').map(type => type.trim());
      types.forEach(type => equipmentSet.add(type));
    } else {
      equipmentSet.add('Bodyweight');
    }
  });

  return Array.from(equipmentSet).sort();
};

/**
 * Get unique difficulty levels from exercises array
 * @param {Array} exercises - Array of exercise objects
 * @returns {Array} Array of unique difficulty levels
 */
export const getUniqueDifficultyLevels = (exercises) => {
  if (!exercises || !Array.isArray(exercises)) return [];

  const difficultySet = new Set();
  
  exercises.forEach(exercise => {
    if (exercise.difficulty_level) {
      difficultySet.add(exercise.difficulty_level);
    }
  });

  const levels = Array.from(difficultySet);
  
  // Sort by standard progression
  const order = ['Beginner', 'Intermediate', 'Advanced'];
  return levels.sort((a, b) => order.indexOf(a) - order.indexOf(b));
};

// ===============================================
// UI STATE UTILITIES
// ===============================================

/**
 * Create initial state for MuscleExplorer component
 * @param {Object} options - Initial state options
 * @returns {Object} Initial state object
 */
export const createInitialExplorerState = (options = {}) => {
  return {
    selectedMuscle: options.initialMuscle || null,
    selectedExercise: null,
    exercises: [],
    filteredExercises: [],
    searchTerm: '',
    difficultyFilter: 'All',
    equipmentFilter: 'All',
    engagementFilter: 'any',
    isLoading: false,
    error: null,
    viewState: {
      currentView: 'front',
      selectedMuscles: options.initialMuscle ? [options.initialMuscle] : [],
      highlightedMuscles: [],
      hoverMuscle: null
    },
    ...options
  };
};

/**
 * Update view state immutably
 * @param {Object} currentState - Current view state
 * @param {Object} updates - Updates to apply
 * @returns {Object} New view state
 */
export const updateViewState = (currentState, updates) => {
  return {
    ...currentState,
    ...updates
  };
};

/**
 * Generate CSS class names based on state
 * @param {Object} state - Component state
 * @param {string} baseClass - Base CSS class
 * @returns {string} Combined class names
 */
export const generateClassNames = (state, baseClass = '') => {
  const classes = [baseClass];

  if (state.isLoading) classes.push('loading');
  if (state.error) classes.push('error');
  if (state.selectedMuscle) classes.push('muscle-selected');
  if (state.selectedExercise) classes.push('exercise-selected');

  return classes.filter(Boolean).join(' ');
};

// ===============================================
// VALIDATION UTILITIES
// ===============================================

/**
 * Validate exercise object structure
 * @param {Object} exercise - Exercise object to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateExercise = (exercise) => {
  const errors = [];

  if (!exercise) {
    return { isValid: false, errors: ['Exercise object is required'] };
  }

  if (!exercise.id || typeof exercise.id !== 'number') {
    errors.push('Exercise must have a valid ID');
  }

  if (!exercise.name || typeof exercise.name !== 'string') {
    errors.push('Exercise must have a valid name');
  }

  if (exercise.difficulty_level && 
      !['Beginner', 'Intermediate', 'Advanced'].includes(exercise.difficulty_level)) {
    errors.push('Invalid difficulty level');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate muscle name
 * @param {string} muscleName - Muscle name to validate
 * @returns {boolean} True if valid
 */
export const validateMuscleName = (muscleName) => {
  return typeof muscleName === 'string' && 
         muscleName.trim().length > 0 && 
         isValidMuscle(muscleName);
};

// ===============================================
// FORMATTING UTILITIES
// ===============================================

/**
 * Format muscle engagement data for display
 * @param {Array} muscles - Array of muscle objects with engagement types
 * @returns {string} Formatted string
 */
export const formatMuscleEngagement = (muscles) => {
  if (!muscles || muscles.length === 0) return 'No muscle data';

  const grouped = muscles.reduce((acc, muscle) => {
    if (!acc[muscle.type]) acc[muscle.type] = [];
    acc[muscle.type].push(muscle.name);
    return acc;
  }, {});

  const parts = [];
  if (grouped.primary) parts.push(`Primary: ${grouped.primary.join(', ')}`);
  if (grouped.secondary) parts.push(`Secondary: ${grouped.secondary.join(', ')}`);
  if (grouped.tertiary) parts.push(`Tertiary: ${grouped.tertiary.join(', ')}`);

  return parts.join(' | ');
};

/**
 * Format exercise count for display
 * @param {number} count - Number of exercises
 * @returns {string} Formatted string
 */
export const formatExerciseCount = (count) => {
  if (count === 0) return 'No exercises found';
  if (count === 1) return '1 exercise found';
  return `${count} exercises found`;
};

/**
 * Format difficulty level for display
 * @param {string} level - Difficulty level
 * @returns {string} Formatted level with emoji
 */
export const formatDifficultyLevel = (level) => {
  const icons = {
    'Beginner': '🟢',
    'Intermediate': '🟡',
    'Advanced': '🔴'
  };
  
  return `${icons[level] || ''} ${level}`.trim();
};

// ===============================================
// PERFORMANCE UTILITIES
// ===============================================

/**
 * Debounce function for search input
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Throttle function for scroll events
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  return (...args) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(null, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(null, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

// ===============================================
// ERROR HANDLING UTILITIES
// ===============================================

/**
 * Create standardized error object
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} details - Additional error details
 * @returns {Object} Error object
 */
export const createError = (message, code = 'GENERAL_ERROR', details = {}) => {
  return {
    message,
    code,
    details,
    timestamp: new Date().toISOString()
  };
};

/**
 * Handle API errors gracefully
 * @param {Error} error - Error object
 * @returns {Object} Standardized error response
 */
export const handleApiError = (error) => {
  if (error.message?.includes('Failed to fetch')) {
    return createError('Network error - please check your connection', 'NETWORK_ERROR');
  }
  
  if (error.message?.includes('not found')) {
    return createError('Requested data not found', 'NOT_FOUND');
  }
  
  return createError(error.message || 'An unexpected error occurred', 'API_ERROR', { 
    originalError: error 
  });
};

// Default export object
export default {
  // Muscle utilities
  MUSCLE_MAPPINGS,
  getAllMuscleNames,
  getMuscleNameFromId,
  getElementIdFromMuscleName,
  getViewForMuscle,
  isValidMuscle,
  
  // Filtering utilities
  filterExercisesByMuscle,
  filterExercisesByDifficulty,
  filterExercisesByEquipment,
  searchExercises,
  applyMultipleFilters,
  
  // Data transformation
  getMuscleGroupName,
  getExerciseMuscles,
  getUniqueEquipmentTypes,
  getUniqueDifficultyLevels,
  
  // UI state
  createInitialExplorerState,
  updateViewState,
  generateClassNames,
  
  // Validation
  validateExercise,
  validateMuscleName,
  
  // Formatting
  formatMuscleEngagement,
  formatExerciseCount,
  formatDifficultyLevel,
  
  // Performance
  debounce,
  throttle,
  
  // Error handling
  createError,
  handleApiError
};