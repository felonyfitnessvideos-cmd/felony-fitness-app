/**
 * @file programAnalytics.js
 * @description Utility functions for analyzing muscle engagement in workout programs
 * @project Felony Fitness - Workout Builder Platform
 * 
 * Features:
 * - Calculate overall muscle engagement for entire programs
 * - Generate heatmap data for muscle visualization
 * - Analyze program balance and coverage
 * - Export analytics data for reporting
 */

/**
 * Calculate the overall muscle engagement for an entire workout program
 * @param {Object} program - Program object containing routines and exercises
 * @param {Object} options - Configuration options for calculation
 * @returns {Object} - Engagement scores and analytics data
 */
export const calculateProgramEngagement = (program, options = {}) => {
  const {
    primaryWeight = 3,
    secondaryWeight = 2,
    tertiaryWeight = 1,
    includeVolume = true,
    volumeMultiplier = 1
  } = options;

  // Initialize engagement scores map
  const engagementScores = {};
  const muscleDetails = {};
  const exerciseBreakdown = [];
  
  let totalExercises = 0;
  let totalSets = 0;

  try {
    // Handle different program structures
    const routines = program.routines || program.program_routines || [program];
    
    if (!Array.isArray(routines)) {
      throw new Error('Invalid program structure: routines must be an array');
    }

    // Loop through all routines in the program
    routines.forEach((routine, routineIndex) => {
      const exercises = routine.exercises || routine.routine_exercises || [];
      
      if (!Array.isArray(exercises)) {
        console.warn(`Routine ${routineIndex} has invalid exercises structure`);
        return;
      }

      // Process each exercise in the routine
      exercises.forEach((exerciseEntry, exerciseIndex) => {
        const exercise = exerciseEntry.exercise || exerciseEntry;
        
        if (!exercise) {
          console.warn(`Invalid exercise at routine ${routineIndex}, exercise ${exerciseIndex}`);
          return;
        }

        totalExercises++;
        
        // Get set count for volume calculation
        const sets = exerciseEntry.target_sets || exerciseEntry.sets || 1;
        totalSets += sets;
        
        // Calculate volume multiplier if enabled
        const volumeBonus = includeVolume ? sets * volumeMultiplier : 1;

        // Extract muscle groups from exercise
        const muscles = extractMuscleGroups(exercise);
        
        // Add to exercise breakdown for detailed analysis
        exerciseBreakdown.push({
          exerciseName: exercise.name,
          routineIndex,
          exerciseIndex,
          sets,
          muscles,
          volumeBonus
        });

        // Calculate engagement scores for each muscle group
        muscles.forEach(({ muscleName, engagementType }) => {
          if (!muscleName) return;

          // Initialize muscle entry if not exists
          if (!engagementScores[muscleName]) {
            engagementScores[muscleName] = 0;
            muscleDetails[muscleName] = {
              primaryHits: 0,
              secondaryHits: 0,
              tertiaryHits: 0,
              totalSets: 0,
              exercises: []
            };
          }

          // Calculate points based on engagement type
          let points = 0;
          switch (engagementType) {
            case 'primary':
              points = primaryWeight * volumeBonus;
              muscleDetails[muscleName].primaryHits++;
              break;
            case 'secondary':
              points = secondaryWeight * volumeBonus;
              muscleDetails[muscleName].secondaryHits++;
              break;
            case 'tertiary':
              points = tertiaryWeight * volumeBonus;
              muscleDetails[muscleName].tertiaryHits++;
              break;
          }

          // Add points to total score
          engagementScores[muscleName] += points;
          muscleDetails[muscleName].totalSets += sets;
          
          // Track which exercises target this muscle
          if (!muscleDetails[muscleName].exercises.some(ex => ex.name === exercise.name)) {
            muscleDetails[muscleName].exercises.push({
              name: exercise.name,
              engagementType,
              sets
            });
          }
        });
      });
    });

    // Calculate percentages and rankings
    const totalPoints = Object.values(engagementScores).reduce((sum, score) => sum + score, 0);
    const sortedMuscles = Object.entries(engagementScores)
      .sort(([,a], [,b]) => b - a)
      .map(([muscle, score], index) => ({
        muscle,
        score,
        percentage: totalPoints > 0 ? (score / totalPoints * 100) : 0,
        rank: index + 1
      }));

    // Analyze program balance
    const balanceAnalysis = analyzeProgramBalance(sortedMuscles, muscleDetails);

    return {
      engagementScores,
      muscleDetails,
      sortedMuscles,
      balanceAnalysis,
      programStats: {
        totalExercises,
        totalSets,
        totalPoints,
        uniqueMusclesTargeted: Object.keys(engagementScores).length
      },
      exerciseBreakdown,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error calculating program engagement:', error);
    return {
      engagementScores: {},
      muscleDetails: {},
      sortedMuscles: [],
      balanceAnalysis: { overall: 'error', details: [] },
      programStats: { totalExercises: 0, totalSets: 0, totalPoints: 0, uniqueMusclesTargeted: 0 },
      exerciseBreakdown: [],
      error: error.message,
      generatedAt: new Date().toISOString()
    };
  }
};

/**
 * Extract muscle groups from an exercise object
 * @param {Object} exercise - Exercise object with muscle group data
 * @returns {Array} - Array of muscle group objects with engagement types
 */
const extractMuscleGroups = (exercise) => {
  const muscles = [];

  // Primary muscle
  const primaryMuscle = getMuscleGroupName(
    exercise.primary_muscle_groups || 
    exercise.primary_muscle_group || 
    exercise.primary_muscle
  );
  if (primaryMuscle) {
    muscles.push({ muscleName: primaryMuscle, engagementType: 'primary' });
  }

  // Secondary muscle
  const secondaryMuscle = getMuscleGroupName(
    exercise.secondary_muscle_groups || 
    exercise.secondary_muscle_group || 
    exercise.secondary_muscle
  );
  if (secondaryMuscle && secondaryMuscle !== primaryMuscle) {
    muscles.push({ muscleName: secondaryMuscle, engagementType: 'secondary' });
  }

  // Tertiary muscle
  const tertiaryMuscle = getMuscleGroupName(
    exercise.tertiary_muscle_groups || 
    exercise.tertiary_muscle_group || 
    exercise.tertiary_muscle
  );
  if (tertiaryMuscle && tertiaryMuscle !== primaryMuscle && tertiaryMuscle !== secondaryMuscle) {
    muscles.push({ muscleName: tertiaryMuscle, engagementType: 'tertiary' });
  }

  return muscles;
};

/**
 * Get muscle group name from various possible formats
 * @param {string|Object} muscleData - Muscle group data
 * @returns {string|null} - Standardized muscle group name
 */
const getMuscleGroupName = (muscleData) => {
  if (!muscleData) return null;
  
  if (typeof muscleData === 'string') return muscleData;
  if (typeof muscleData === 'object' && muscleData.name) return muscleData.name;
  
  return null;
};

/**
 * Analyze program balance and identify potential gaps
 * @param {Array} sortedMuscles - Muscles sorted by engagement score
 * @param {Object} muscleDetails - Detailed muscle engagement data
 * @returns {Object} - Balance analysis with recommendations
 */
const analyzeProgramBalance = (sortedMuscles, muscleDetails) => {
  const analysis = {
    overall: 'balanced',
    details: [],
    recommendations: [],
    muscleGroupCategories: {
      overworked: [],
      balanced: [],
      underworked: [],
      neglected: []
    }
  };

  if (sortedMuscles.length === 0) {
    analysis.overall = 'empty';
    analysis.details.push('No muscle engagement data found');
    return analysis;
  }

  const averageScore = sortedMuscles.reduce((sum, m) => sum + m.score, 0) / sortedMuscles.length;
  const maxScore = sortedMuscles[0]?.score || 0;
  const minScore = sortedMuscles[sortedMuscles.length - 1]?.score || 0;

  // Define thresholds based on average
  const overworkedThreshold = averageScore * 1.5;
  const balancedThreshold = averageScore * 0.7;
  const underworkedThreshold = averageScore * 0.3;

  // Categorize muscles
  sortedMuscles.forEach(muscle => {
    if (muscle.score > overworkedThreshold) {
      analysis.muscleGroupCategories.overworked.push(muscle);
    } else if (muscle.score > balancedThreshold) {
      analysis.muscleGroupCategories.balanced.push(muscle);
    } else if (muscle.score > underworkedThreshold) {
      analysis.muscleGroupCategories.underworked.push(muscle);
    } else {
      analysis.muscleGroupCategories.neglected.push(muscle);
    }
  });

  // Generate analysis insights
  const imbalanceRatio = maxScore > 0 ? minScore / maxScore : 1;
  
  if (imbalanceRatio < 0.3) {
    analysis.overall = 'imbalanced';
    analysis.details.push(`Significant imbalance detected: ${sortedMuscles[0].muscle} is heavily emphasized while ${sortedMuscles[sortedMuscles.length - 1].muscle} is neglected`);
  } else if (imbalanceRatio < 0.6) {
    analysis.overall = 'moderately_imbalanced';
    analysis.details.push('Moderate muscle imbalance detected');
  } else {
    analysis.overall = 'balanced';
    analysis.details.push('Program shows good muscle balance');
  }

  // Generate recommendations
  if (analysis.muscleGroupCategories.overworked.length > 0) {
    analysis.recommendations.push(`Consider reducing volume for: ${analysis.muscleGroupCategories.overworked.map(m => m.muscle).join(', ')}`);
  }
  
  if (analysis.muscleGroupCategories.neglected.length > 0) {
    analysis.recommendations.push(`Add exercises targeting: ${analysis.muscleGroupCategories.neglected.map(m => m.muscle).join(', ')}`);
  }

  // Check for common muscle group pairings
  const pushMuscles = ['Chest', 'Front Delts', 'Triceps'];
  const pullMuscles = ['Lats', 'Rhomboids', 'Rear Delts', 'Biceps'];
  const legMuscles = ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'];

  const pushScore = pushMuscles.reduce((sum, muscle) => sum + (muscleDetails[muscle]?.primaryHits || 0), 0);
  const pullScore = pullMuscles.reduce((sum, muscle) => sum + (muscleDetails[muscle]?.primaryHits || 0), 0);
  const _legScore = legMuscles.reduce((sum, muscle) => sum + (muscleDetails[muscle]?.primaryHits || 0), 0);

  if (pushScore > 0 && pullScore > 0) {
    const pushPullRatio = pushScore / pullScore;
    if (pushPullRatio > 1.5) {
      analysis.recommendations.push('Consider adding more pulling exercises to balance push/pull ratio');
    } else if (pushPullRatio < 0.67) {
      analysis.recommendations.push('Consider adding more pushing exercises to balance push/pull ratio');
    }
  }

  return analysis;
};

/**
 * Generate heatmap data for muscle visualization
 * @param {Object} engagementData - Result from calculateProgramEngagement
 * @returns {Array} - Array of muscle data with intensity levels
 */
export const generateHeatmapData = (engagementData) => {
  const { sortedMuscles } = engagementData;
  
  if (!sortedMuscles || sortedMuscles.length === 0) {
    return [];
  }

  const maxScore = sortedMuscles[0].score;
  
  return sortedMuscles.map(muscle => ({
    muscleName: muscle.muscle,
    intensity: maxScore > 0 ? muscle.score / maxScore : 0,
    intensityLevel: getIntensityLevel(muscle.score / maxScore),
    score: muscle.score,
    percentage: muscle.percentage,
    rank: muscle.rank
  }));
};

/**
 * Get intensity level category for styling
 * @param {number} intensity - Normalized intensity (0-1)
 * @returns {string} - Intensity level (low, medium, high)
 */
const getIntensityLevel = (intensity) => {
  if (intensity >= 0.7) return 'high';
  if (intensity >= 0.4) return 'medium';
  return 'low';
};

/**
 * Export program analytics to various formats
 * @param {Object} engagementData - Result from calculateProgramEngagement
 * @param {string} format - Export format ('json', 'csv', 'summary')
 * @returns {string|Object} - Formatted data
 */
export const exportProgramAnalytics = (engagementData, format = 'json') => {
  switch (format.toLowerCase()) {
    case 'csv':
      return generateCSVReport(engagementData);
    case 'summary':
      return generateSummaryReport(engagementData);
    case 'json':
    default:
      return JSON.stringify(engagementData, null, 2);
  }
};

/**
 * Generate CSV report of muscle engagement
 * @param {Object} engagementData - Engagement data
 * @returns {string} - CSV formatted string
 */
const generateCSVReport = (engagementData) => {
  const { sortedMuscles, muscleDetails } = engagementData;
  
  let csv = 'Muscle Group,Score,Percentage,Rank,Primary Hits,Secondary Hits,Tertiary Hits,Total Sets\n';
  
  sortedMuscles.forEach(muscle => {
    const details = muscleDetails[muscle.muscle] || {};
    csv += `"${muscle.muscle}",${muscle.score},${muscle.percentage.toFixed(2)},${muscle.rank},${details.primaryHits || 0},${details.secondaryHits || 0},${details.tertiaryHits || 0},${details.totalSets || 0}\n`;
  });
  
  return csv;
};

/**
 * Generate summary report
 * @param {Object} engagementData - Engagement data
 * @returns {string} - Formatted summary
 */
const generateSummaryReport = (engagementData) => {
  const { sortedMuscles, balanceAnalysis, programStats } = engagementData;
  
  let summary = `PROGRAM ANALYSIS SUMMARY\n`;
  summary += `========================\n\n`;
  summary += `Program Statistics:\n`;
  summary += `- Total Exercises: ${programStats.totalExercises}\n`;
  summary += `- Total Sets: ${programStats.totalSets}\n`;
  summary += `- Muscle Groups Targeted: ${programStats.uniqueMusclesTargeted}\n`;
  summary += `- Overall Balance: ${balanceAnalysis.overall}\n\n`;
  
  summary += `Top 5 Most Targeted Muscles:\n`;
  sortedMuscles.slice(0, 5).forEach((muscle, index) => {
    summary += `${index + 1}. ${muscle.muscle}: ${muscle.score} points (${muscle.percentage.toFixed(1)}%)\n`;
  });
  
  if (balanceAnalysis.recommendations.length > 0) {
    summary += `\nRecommendations:\n`;
    balanceAnalysis.recommendations.forEach((rec, index) => {
      summary += `${index + 1}. ${rec}\n`;
    });
  }
  
  return summary;
};

// Default export
export default {
  calculateProgramEngagement,
  generateHeatmapData,
  exportProgramAnalytics
};