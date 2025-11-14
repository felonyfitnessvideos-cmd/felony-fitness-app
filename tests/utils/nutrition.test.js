/**
 * @fileoverview Streamlined nutrition tests - fast & focused
 * @author Felony Fitness Development Team
 * @version 2.0.0
 */

import { describe, it, expect } from 'vitest';
import {
  calculateWeeklyNutrientTotals,
  calculateDailyAverages,
  identifyDeficiencies,
  analyzeWeeklyNutrition,
  RDA_TARGETS,
} from '../../src/utils/nutritionRecommendations.js';

describe('nutrition calculations', () => {
  
  it('calculates weekly totals', () => {
    const planEntries = [{
      servings: 1,
      meals: { meal_foods: [{ 
        quantity: 1, 
        food_servings: { calories: 2000, protein_g: 50 }
      }]}
    }];
    
    const result = calculateWeeklyNutrientTotals(planEntries);
    expect(result.calories).toBe(2000);
    expect(result.protein_g).toBe(50);
  });

  it('calculates daily averages', () => {
    const result = calculateDailyAverages({ calories: 14000, protein_g: 700 });
    expect(result.calories).toBe(2000);
    expect(result.protein_g).toBe(100);
  });

  it('identifies deficiencies', () => {
    const result = identifyDeficiencies({ calcium_mg: 400 });
    expect(result[0].severity).toBe('critical');
  });

  it('analyzes weekly nutrition', () => {
    const planEntries = [{
      servings: 1,
      meals: { meal_foods: [{ 
        quantity: 1, 
        food_servings: { calories: 2000, protein_g: 90 }
      }]}
    }];
    
    const result = analyzeWeeklyNutrition(planEntries);
    expect(result.healthScore).toBeGreaterThan(0);
  });

  it('has valid RDA targets', () => {
    expect(RDA_TARGETS.protein_g).toBeDefined();
    expect(RDA_TARGETS.protein_g.optimal).toBeGreaterThan(0);
  });
});
