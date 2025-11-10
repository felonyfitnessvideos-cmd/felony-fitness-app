/**
 * @file workoutBuilderIntegration.js
 * @description Integration helpers for the Workout Builder Platform
 * @project Felony Fitness - Dynamic Workout Builder
 * 
 * This file provides integration utilities for connecting the workout builder
 * platform with the existing Felony Fitness application architecture.
 */

import { supabase } from '../supabaseClient';
import { calculateProgramEngagement, generateHeatmapData } from '../utils/programAnalytics';
import { 
  getAllMuscleNames,
  applyMultipleFilters,
  createError,
  handleApiError
} from '../utils/workoutBuilderUtils';

// ===============================================
// DATABASE INTEGRATION
// ===============================================

/**
 * Fetch all exercises with muscle group relationships
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of exercises with muscle data
 */
export const fetchExercisesWithMuscles = async (options = {}) => {
  try {
    const {
      limit = 100,
      offset = 0,
      includeAll = true
    } = options;

    let query = supabase
      .from('exercises')
      .select(`
        *,
        primary_muscle_groups:muscle_groups!primary_muscle_group_id(id, name),
        secondary_muscle_groups:muscle_groups!secondary_muscle_group_id(id, name),
        tertiary_muscle_groups:muscle_groups!tertiary_muscle_group_id(id, name)
      `);

    if (!includeAll) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching exercises with muscles:', error);
    throw handleApiError(error);
  }
};

/**
 * Fetch exercises by muscle group
 * @param {string} muscleName - Name of the muscle group
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of exercises targeting the muscle
 */
export const fetchExercisesByMuscle = async (muscleName, options = {}) => {
  try {
    const {
      engagementType = 'any',
      difficulty = 'All',
      equipment = 'All',
      limit = 50
    } = options;

    // First get all exercises with muscle relationships
    const exercises = await fetchExercisesWithMuscles({ includeAll: true });

    // Filter by muscle and other criteria
    const filteredExercises = applyMultipleFilters(exercises, {
      muscle: muscleName,
      engagementType,
      difficulty: difficulty !== 'All' ? difficulty : undefined,
      equipment: equipment !== 'All' ? equipment : undefined
    });

    return filteredExercises.slice(0, limit);
  } catch (error) {
    console.error('Error fetching exercises by muscle:', error);
    throw handleApiError(error);
  }
};

/**
 * Fetch all muscle groups from database
 * @returns {Promise<Array>} Array of muscle groups
 */
export const fetchMuscleGroups = async () => {
  try {
    const { data, error } = await supabase
      .from('muscle_groups')
      .select('*')
      .order('name');

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching muscle groups:', error);
    throw handleApiError(error);
  }
};

/**
 * Search exercises by name or description
 * @param {string} searchTerm - Search term
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of matching exercises
 */
export const searchExercisesInDatabase = async (searchTerm, options = {}) => {
  try {
    const { limit = 20 } = options;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const { data, error } = await supabase
      .from('exercises')
      .select(`
        *,
        primary_muscle_groups:muscle_groups!primary_muscle_group_id(id, name),
        secondary_muscle_groups:muscle_groups!secondary_muscle_group_id(id, name),
        tertiary_muscle_groups:muscle_groups!tertiary_muscle_group_id(id, name)
      `)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,instructions.ilike.%${searchTerm}%`)
      .limit(limit)
      .order('name');

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error searching exercises:', error);
    throw handleApiError(error);
  }
};

// ===============================================
// PROGRAM ANALYSIS INTEGRATION
// ===============================================

/**
 * Analyze existing user program for muscle engagement
 * @param {number} programId - Program ID to analyze
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Program analysis results
 */
export const analyzeUserProgram = async (programId, userId) => {
  try {
    // Fetch program with routines and exercises
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select(`
        *,
        program_routines:routine_programs(
          routines(
            *,
            routine_exercises(
              *,
              exercises(
                *,
                primary_muscle_groups:muscle_groups!primary_muscle_group_id(id, name),
                secondary_muscle_groups:muscle_groups!secondary_muscle_group_id(id, name),
                tertiary_muscle_groups:muscle_groups!tertiary_muscle_group_id(id, name)
              )
            )
          )
        )
      `)
      .eq('id', programId)
      .eq('user_id', userId)
      .single();

    if (programError) throw programError;

    if (!program) {
      throw createError('Program not found', 'NOT_FOUND');
    }

    // Transform data structure for analysis
    const transformedProgram = transformProgramForAnalysis(program);

    // Calculate engagement
    const engagementData = calculateProgramEngagement(transformedProgram, {
      includeVolume: true,
      volumeMultiplier: 1.2 // Slightly higher weight for volume
    });

    // Generate heatmap data
    const heatmapData = generateHeatmapData(engagementData);

    return {
      ...engagementData,
      heatmapData,
      program: {
        id: program.id,
        name: program.name,
        description: program.description
      }
    };
  } catch (error) {
    console.error('Error analyzing user program:', error);
    throw handleApiError(error);
  }
};

/**
 * Transform program data structure for analysis compatibility
 * @param {Object} program - Raw program data from database
 * @returns {Object} Transformed program data
 */
const transformProgramForAnalysis = (program) => {
  if (!program || !program.program_routines) {
    return { routines: [] };
  }

  const routines = program.program_routines.map(pr => {
    const routine = pr.routines;
    if (!routine || !routine.routine_exercises) {
      return { exercises: [] };
    }

    const exercises = routine.routine_exercises.map(re => ({
      exercise: re.exercises,
      target_sets: re.target_sets || re.sets || 3,
      target_reps: re.target_reps || re.reps || 10,
      target_weight: re.target_weight || re.weight || 0
    }));

    return {
      ...routine,
      exercises
    };
  });

  return {
    ...program,
    routines
  };
};

// ===============================================
// COMPONENT DATA PROVIDERS
// ===============================================

/**
 * Data provider for MuscleExplorer component
 * @param {Object} options - Provider options
 * @returns {Promise<Object>} Component data
 */
export const provideMuscleExplorerData = async (options = {}) => {
  try {
    const {
      initialMuscle = null,
      preloadExercises = true,
      includeMuscleGroups = true
    } = options;

    const dataPromises = [];

    // Always fetch exercises
    if (preloadExercises) {
      dataPromises.push(fetchExercisesWithMuscles());
    } else {
      dataPromises.push(Promise.resolve([]));
    }

    // Fetch muscle groups if needed
    if (includeMuscleGroups) {
      dataPromises.push(fetchMuscleGroups());
    } else {
      dataPromises.push(Promise.resolve([]));
    }

    const [exercises, muscleGroups] = await Promise.all(dataPromises);

    // If initial muscle is specified, fetch its exercises
    let initialExercises = [];
    if (initialMuscle) {
      initialExercises = await fetchExercisesByMuscle(initialMuscle);
    }

    return {
      exercises,
      muscleGroups,
      initialExercises,
      availableMuscles: getAllMuscleNames(),
      initialMuscle
    };
  } catch (error) {
    console.error('Error providing MuscleExplorer data:', error);
    throw handleApiError(error);
  }
};

/**
 * Data provider for InteractiveMuscleMap component
 * @param {Object} programData - Optional program data for heatmap
 * @returns {Promise<Object>} Component data
 */
export const provideMuscleMapData = async (programData = null) => {
  try {
    let heatmapData = [];
    
    if (programData) {
      // If program data provided, generate heatmap
      const engagementData = calculateProgramEngagement(programData);
      heatmapData = generateHeatmapData(engagementData);
    }

    return {
      heatmapData,
      availableMuscles: getAllMuscleNames(),
      muscleCount: getAllMuscleNames().length
    };
  } catch (error) {
    console.error('Error providing MuscleMap data:', error);
    throw handleApiError(error);
  }
};

// ===============================================
// INTEGRATION HOOKS FOR REACT COMPONENTS
// ===============================================

/**
 * Custom hook data structure for useWorkoutBuilder
 * @param {Object} options - Hook options
 * @returns {Object} Hook configuration
 */
export const createWorkoutBuilderHook = (options = {}) => {
  return {
    // Data fetchers
    fetchExercises: fetchExercisesWithMuscles,
    fetchExercisesByMuscle,
    fetchMuscleGroups,
    searchExercises: searchExercisesInDatabase,
    
    // Analysis functions
    analyzeProgram: analyzeUserProgram,
    calculateEngagement: calculateProgramEngagement,
    generateHeatmap: generateHeatmapData,
    
    // Data providers
    provideMuscleExplorerData,
    provideMuscleMapData,
    
    // Configuration
    options: {
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      maxRetries: 3,
      retryDelay: 1000,
      ...options
    }
  };
};

// ===============================================
// CACHING UTILITIES
// ===============================================

/**
 * Simple in-memory cache for exercise data
 */
class ExerciseCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Create global cache instance
export const exerciseCache = new ExerciseCache();

/**
 * Cached version of fetchExercisesWithMuscles
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Cached or fresh exercise data
 */
export const fetchExercisesWithMusclesCached = async (options = {}) => {
  const cacheKey = JSON.stringify(options);
  const cached = exerciseCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  const data = await fetchExercisesWithMuscles(options);
  exerciseCache.set(cacheKey, data);
  return data;
};

// ===============================================
// UTILITY FUNCTIONS FOR INTEGRATION
// ===============================================

/**
 * Validate component props before rendering
 * @param {Object} props - Component props
 * @param {Array} requiredProps - Required prop names
 * @returns {Object} Validation result
 */
export const validateComponentProps = (props, requiredProps = []) => {
  const errors = [];

  requiredProps.forEach(propName => {
    if (!(propName in props) || props[propName] === undefined) {
      errors.push(`Required prop '${propName}' is missing`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create error boundary props for workout builder components
 * @param {string} componentName - Name of the component
 * @returns {Object} Error boundary configuration
 */
export const createErrorBoundaryProps = (componentName) => {
  return {
    onError: (error, errorInfo) => {
      console.error(`Error in ${componentName}:`, error, errorInfo);
      
      // Could integrate with error reporting service here
      // e.g., Sentry, LogRocket, etc.
    },
    fallbackComponent: 'WorkoutBuilderError', // Component name for error fallback
    errorMessage: `Something went wrong in ${componentName}`
  };
};

/**
 * Initialize workout builder platform
 * @param {Object} config - Platform configuration
 * @returns {Promise<Object>} Initialization result
 */
export const initializeWorkoutBuilderPlatform = async (config = {}) => {
  try {
    const {
      preloadExercises = true,
      preloadMuscleGroups = true,
      enableCaching = true,
      cacheTimeout = 5 * 60 * 1000
    } = config;

    const initResults = {
      exercises: [],
      muscleGroups: [],
      availableMuscles: getAllMuscleNames(),
      cacheEnabled: enableCaching,
      initialized: false,
      errors: []
    };

    // Initialize cache if enabled
    if (enableCaching) {
      exerciseCache.ttl = cacheTimeout;
    }

    // Preload data if requested
    const preloadPromises = [];
    
    if (preloadExercises) {
      preloadPromises.push(
        fetchExercisesWithMuscles()
          .then(exercises => {
            initResults.exercises = exercises;
            if (enableCaching) {
              exerciseCache.set('all_exercises', exercises);
            }
          })
          .catch(error => {
            console.error('Failed to preload exercises:', error);
            initResults.errors.push('Failed to preload exercises');
          })
      );
    }

    if (preloadMuscleGroups) {
      preloadPromises.push(
        fetchMuscleGroups()
          .then(muscleGroups => {
            initResults.muscleGroups = muscleGroups;
            if (enableCaching) {
              exerciseCache.set('muscle_groups', muscleGroups);
            }
          })
          .catch(error => {
            console.error('Failed to preload muscle groups:', error);
            initResults.errors.push('Failed to preload muscle groups');
          })
      );
    }

    // Wait for all preloading to complete
    await Promise.all(preloadPromises);

    initResults.initialized = true;
    
    return initResults;
  } catch (error) {
    console.error('Failed to initialize Workout Builder Platform:', error);
    throw handleApiError(error);
  }
};

// Default export
export default {
  // Database functions
  fetchExercisesWithMuscles,
  fetchExercisesByMuscle,
  fetchMuscleGroups,
  searchExercisesInDatabase,
  
  // Analysis functions
  analyzeUserProgram,
  transformProgramForAnalysis,
  
  // Data providers
  provideMuscleExplorerData,
  provideMuscleMapData,
  
  // Integration utilities
  createWorkoutBuilderHook,
  validateComponentProps,
  createErrorBoundaryProps,
  initializeWorkoutBuilderPlatform,
  
  // Caching
  exerciseCache,
  fetchExercisesWithMusclesCached
};