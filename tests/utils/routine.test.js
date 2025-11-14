/**
 * @fileoverview Streamlined routine tests - fast & focused
 * @author Felony Fitness Development Team
 * @version 2.0.0
 */

import { describe, it, expect } from 'vitest';
import { generateRoutines, suggestRoutineName } from '../../src/utils/routineGenerator.js';

const mockExercises = [
  { exercise_name: 'Squat', is_compound: true, is_warmup: false, type: 'Strength', muscle_group: 'quadriceps' },
  { exercise_name: 'Bench', is_compound: true, is_warmup: false, type: 'Strength', muscle_group: 'chest' },
  { exercise_name: 'Curl', is_compound: false, is_warmup: false, type: 'Strength', muscle_group: 'biceps' },
  { exercise_name: 'Warmup', is_compound: false, is_warmup: true, type: 'Cardio', muscle_group: null },
];

describe('routine generation', () => {
  
  it('generates correct number of routines', () => {
    const result = generateRoutines(mockExercises, 3);
    expect(result).toHaveLength(3);
  });

  it('includes warmup exercises', () => {
    const result = generateRoutines(mockExercises, 2);
    const hasWarmup = result.some(r => r.exercises.some(e => e.is_warmup));
    expect(hasWarmup).toBe(true);
  });

  it('assigns intensity percentages', () => {
    const result = generateRoutines(mockExercises, 2);
    result.forEach(routine => {
      expect(routine.target_intensity_pct).toBeGreaterThanOrEqual(40);
      expect(routine.target_intensity_pct).toBeLessThanOrEqual(100);
    });
  });

  it('generates routine names', () => {
    const result = generateRoutines(mockExercises, 2);
    result.forEach(routine => {
      expect(routine.name).toBeTruthy();
    });
  });

  it('suggests routine names', () => {
    const name = suggestRoutineName([mockExercises[0], mockExercises[1]]);
    expect(name).toBeTruthy();
  });
});
