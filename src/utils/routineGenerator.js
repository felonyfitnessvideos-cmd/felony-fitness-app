/**
 * @fileoverview Intelligent Routine Generation from Exercise Pools
 * @description Generates workout routines by intelligently distributing exercises
 * across training days based on muscle groups and training frequency.
 * 
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-12
 * 
 * @rules
 * - Each routine: Warmup → Big Muscle → Little Muscle → Cool down
 * - Big Muscles: Legs, Back, Chest
 * - Little Muscles: Bicep, Tricep, Forearm, Shoulders, Abs
 * - Compound movements first
 * - Duplicated routines: Same exercises, reversed order, -10% intensity
 * - Names based on actual muscle groups in routine
 * - NO empty days
 */

// Muscle group categorization
const BIG_MUSCLES = ['Chest', 'Back', 'Latissimus Dorsi', 'Trapezius', 'Rhomboids', 
                      'Quadriceps', 'Hamstrings', 'Glutes', 'Erector Spinae'];

const _LITTLE_MUSCLES = ['Biceps', 'Triceps', 'Forearms', 'Brachialis',
                        'Front Deltoids', 'Side Deltoids', 'Rear Deltoids',
                        'Upper Abdominals', 'Lower Abdominals', 'Obliques'];

const WARMUP_TYPES = ['Cardio', 'Warmup', 'Mobility', 'Dynamic Stretching'];
const COOLDOWN_TYPES = ['Stretching', 'Cooldown', 'Static Stretching', 'Flexibility'];

/**
 * Generate workout routines from an exercise pool based on training frequency
 * 
 * @description Distributes exercises intelligently across training days following
 * the Big Muscle → Little Muscle pattern with proper warmup/cooldown structure.
 * Duplicates routines with reduced intensity when needed to fill all days.
 * 
 * @param {Array<Object>} exercisePool - Array of exercises with muscle group data
 * @param {number} frequency - Training days per week (2-7)
 * 
 * @returns {Array<Object>} Array of routine objects with proper structure
 * 
 * @example
 * const routines = generateRoutines(exercisePool, 2);
 * // Returns: [
 * //   { name: "Back & Biceps", exercises: [...], target_intensity_pct: 80 },
 * //   { name: "Chest & Triceps", exercises: [...], target_intensity_pct: 80 }
 * // ]
 */
export function generateRoutines(exercisePool, frequency) {
  // Validate inputs
  if (!exercisePool || exercisePool.length === 0) {
    return [];
  }

  if (frequency < 2 || frequency > 7) {
    throw new Error('Frequency must be between 2 and 7 days per week');
  }

  // Categorize exercises by type
  const categorized = categorizeExercises(exercisePool);
  
  // Sort exercises: compound first, then isolation
  categorized.bigMuscles = sortByCompound(categorized.bigMuscles);
  categorized.littleMuscles = sortByCompound(categorized.littleMuscles);

  // Generate base routines based on frequency
  const baseRoutines = generateBaseRoutines(categorized, frequency);

  // Fill remaining days with duplicates (reversed order, -10% intensity)
  const allRoutines = fillRemainingDays(baseRoutines, frequency);

  return allRoutines;
}

/**
 * Categorize exercises into big muscles, little muscles, warmup, cooldown
 * @private
 */
function categorizeExercises(exercisePool) {
  const categorized = {
    warmup: [],
    bigMuscles: [],
    littleMuscles: [],
    cooldown: []
  };

  exercisePool.forEach(exercise => {
    const primaryMuscles = exercise.muscle_groups?.primary || [];
    const exerciseType = exercise.type?.toLowerCase() || '';
    
    // Check if warmup or cooldown
    if (WARMUP_TYPES.some(type => exerciseType.includes(type.toLowerCase()))) {
      categorized.warmup.push(exercise);
    } else if (COOLDOWN_TYPES.some(type => exerciseType.includes(type.toLowerCase()))) {
      categorized.cooldown.push(exercise);
    } else {
      // Categorize by muscle size
      const isBigMuscle = primaryMuscles.some(muscle => 
        BIG_MUSCLES.some(big => muscle.includes(big))
      );
      
      if (isBigMuscle) {
        categorized.bigMuscles.push(exercise);
      } else {
        categorized.littleMuscles.push(exercise);
      }
    }
  });

  return categorized;
}

/**
 * Sort exercises with compound movements first
 * @private
 */
function sortByCompound(exercises) {
  return exercises.sort((a, b) => {
    const aIsCompound = a.is_compound || a.type?.toLowerCase().includes('compound') || false;
    const bIsCompound = b.is_compound || b.type?.toLowerCase().includes('compound') || false;
    
    // Compound exercises first
    if (aIsCompound && !bIsCompound) return -1;
    if (!aIsCompound && bIsCompound) return 1;
    return 0;
  });
}

/**
 * Generate base routines before duplication
 * @private
 */
function generateBaseRoutines(categorized, frequency) {
  const routines = [];
  
  // For 2-day split: Upper (Back + Chest) and Lower (Legs)
  if (frequency === 2) {
    routines.push(createRoutine(
      categorized,
      ['Back', 'Latissimus Dorsi'], // Big muscle 1
      ['Biceps'], // Little muscle 1
      ['Chest'], // Big muscle 2
      ['Triceps'], // Little muscle 2
      80 // intensity
    ));
    
    routines.push(createRoutine(
      categorized,
      ['Quadriceps'], // Big muscle 1
      ['Front Deltoids', 'Side Deltoids'], // Little muscle 1
      ['Glutes', 'Hamstrings'], // Big muscle 2
      ['Forearms'], // Little muscle 2
      80 // intensity
    ));
  }
  
  // For 3+ day splits: Push/Pull/Legs pattern
  else if (frequency >= 3) {
    // Day 1: Back & Biceps
    routines.push(createRoutine(
      categorized,
      ['Back', 'Latissimus Dorsi', 'Trapezius'],
      ['Biceps', 'Brachialis'],
      null,
      ['Forearms'],
      80
    ));
    
    // Day 2: Chest & Triceps
    routines.push(createRoutine(
      categorized,
      ['Chest'],
      ['Triceps'],
      null,
      ['Front Deltoids'],
      80
    ));
    
    // Day 3: Legs & Shoulders
    routines.push(createRoutine(
      categorized,
      ['Quadriceps', 'Glutes'],
      ['Side Deltoids', 'Rear Deltoids'],
      ['Hamstrings'],
      ['Upper Abdominals', 'Lower Abdominals', 'Obliques'],
      80
    ));
    
    // Day 4 (if 4+): Upper Power
    if (frequency >= 4) {
      routines.push(createRoutine(
        categorized,
        ['Chest'],
        ['Front Deltoids'],
        ['Back', 'Latissimus Dorsi'],
        ['Biceps'],
        80
      ));
    }
  }

  return routines;
}


/**
 * Create a single routine with proper structure
 * @private
 */
function createRoutine(categorized, bigMuscle1, littleMuscle1, bigMuscle2, littleMuscle2, intensity) {
  const routine = {
    name: '',
    exercises: [],
    muscle_groups: [],
    total_sets: 0,
    target_intensity_pct: intensity
  };

  const musclesUsed = new Set();

  // 1. Add warmup
  if (categorized.warmup.length > 0) {
    const warmup = categorized.warmup[0];
    routine.exercises.push({ ...warmup, is_warmup: true, target_intensity_pct: 50 });
    routine.total_sets += warmup.sets || 1;
  }

  // 2. Add Big Muscle 1 exercises
  const bigEx1 = findExercisesForMuscles(categorized.bigMuscles, bigMuscle1);
  bigEx1.forEach(ex => {
    routine.exercises.push({ ...ex, target_intensity_pct: intensity });
    routine.total_sets += ex.sets || 3;
    ex.muscle_groups?.primary?.forEach(m => musclesUsed.add(m));
  });

  // 3. Add Little Muscle 1 exercises
  const littleEx1 = findExercisesForMuscles(categorized.littleMuscles, littleMuscle1);
  littleEx1.forEach(ex => {
    routine.exercises.push({ ...ex, target_intensity_pct: intensity });
    routine.total_sets += ex.sets || 3;
    ex.muscle_groups?.primary?.forEach(m => musclesUsed.add(m));
  });

  // 4. Add Big Muscle 2 exercises (if provided)
  if (bigMuscle2) {
    const bigEx2 = findExercisesForMuscles(categorized.bigMuscles, bigMuscle2);
    bigEx2.forEach(ex => {
      routine.exercises.push({ ...ex, target_intensity_pct: intensity });
      routine.total_sets += ex.sets || 3;
      ex.muscle_groups?.primary?.forEach(m => musclesUsed.add(m));
    });
  }

  // 5. Add Little Muscle 2 exercises (if provided)
  if (littleMuscle2) {
    const littleEx2 = findExercisesForMuscles(categorized.littleMuscles, littleMuscle2);
    littleEx2.forEach(ex => {
      routine.exercises.push({ ...ex, target_intensity_pct: intensity });
      routine.total_sets += ex.sets || 3;
      ex.muscle_groups?.primary?.forEach(m => musclesUsed.add(m));
    });
  }

  // 6. Add cooldown
  if (categorized.cooldown.length > 0) {
    const cooldown = categorized.cooldown[0];
    routine.exercises.push({ ...cooldown, is_warmup: false, target_intensity_pct: 30 });
    routine.total_sets += cooldown.sets || 1;
  }

  // Generate dynamic name based on muscles used
  routine.name = generateRoutineName(Array.from(musclesUsed));
  routine.muscle_groups = Array.from(musclesUsed);

  return routine;
}

/**
 * Find exercises that target specific muscles
 * @private
 */
function findExercisesForMuscles(exercisePool, targetMuscles) {
  if (!targetMuscles) return [];
  
  return exercisePool.filter(ex => {
    const primaryMuscles = ex.muscle_groups?.primary || [];
    return targetMuscles.some(target => 
      primaryMuscles.some(muscle => muscle.includes(target))
    );
  });
}

/**
 * Fill remaining days with duplicated routines (reversed order, -10% intensity)
 * @private
 */
function fillRemainingDays(baseRoutines, frequency) {
  const allRoutines = [...baseRoutines];
  
  while (allRoutines.length < frequency) {
    // Get the next base routine to duplicate (cycle through)
    const sourceIndex = (allRoutines.length - baseRoutines.length) % baseRoutines.length;
    const sourceRoutine = baseRoutines[sourceIndex];
    
    // Create duplicate with reversed exercises and reduced intensity
    const duplicate = {
      ...sourceRoutine,
      name: sourceRoutine.name + ' (Volume)',
      exercises: [...sourceRoutine.exercises].reverse().map(ex => ({
        ...ex,
        target_intensity_pct: ex.is_warmup ? ex.target_intensity_pct : Math.max(40, ex.target_intensity_pct - 10)
      })),
      target_intensity_pct: Math.max(40, sourceRoutine.target_intensity_pct - 10)
    };
    
    allRoutines.push(duplicate);
  }

  return allRoutines;
}

/**
 * Generate dynamic routine name based on actual muscles in the routine
 * @private
 */
function generateRoutineName(muscles) {
  if (!muscles || muscles.length === 0) return 'Full Body';

  // Simplify muscle names
  const simplifiedMuscles = muscles.map(m => {
    if (m.includes('Chest')) return 'Chest';
    if (m.includes('Dorsi') || m.includes('Trapezius') || m.includes('Rhomboids')) return 'Back';
    if (m.includes('Quadriceps') || m.includes('Hamstrings') || m.includes('Glutes')) return 'Legs';
    if (m.includes('Deltoids')) return 'Shoulders';
    if (m.includes('Biceps')) return 'Biceps';
    if (m.includes('Triceps')) return 'Triceps';
    if (m.includes('Abdominals') || m.includes('Obliques')) return 'Core';
    if (m.includes('Forearms')) return 'Forearms';
    return m;
  });

  // Get unique simplified muscles
  const unique = [...new Set(simplifiedMuscles)];

  // Generate name based on combinations
  if (unique.includes('Back') && unique.includes('Biceps')) {
    return 'Back & Biceps';
  }
  if (unique.includes('Chest') && unique.includes('Triceps')) {
    return 'Chest & Triceps';
  }
  if (unique.includes('Legs') && unique.includes('Shoulders')) {
    return 'Legs & Shoulders';
  }
  if (unique.includes('Legs') && unique.includes('Core')) {
    return 'Legs & Core';
  }
  if (unique.includes('Back') && unique.includes('Chest')) {
    return 'Upper Body';
  }
  if (unique.includes('Legs')) {
    return 'Lower Body';
  }
  if (unique.includes('Shoulders') && unique.includes('Core')) {
    return 'Shoulders & Core';
  }

  // Default: List first two muscle groups
  return unique.slice(0, 2).join(' & ');
}

/**
 * Generate routine name suggestions based on exercises (legacy - kept for compatibility)
 */
export function suggestRoutineName(exercises) {
  if (!exercises || exercises.length === 0) return 'Workout';

  const muscles = new Set();
  exercises.forEach(ex => {
    ex.muscle_groups?.primary?.forEach(m => muscles.add(m));
  });

  return generateRoutineName(Array.from(muscles));
}
