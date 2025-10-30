/**
 * @file src/utils/nutritionAPI.js
 * @description Client-side wrapper for enhanced nutrition API with guardrails
 */

import { supabase } from '../supabaseClient.js';

export class NutritionAPI {
  constructor() {
    this.baseURL = import.meta.env.VITE_SUPABASE_URL;
  }

  /**
   * Search for foods with AI guardrails
   */
  async searchFood(query) {
    try {
      const { data, error } = await supabase.functions.invoke('food-search-v2', {
        body: { query }
      });

      if (error) throw error;

      // Handle different response types
      switch (data.source) {
        case 'local':
          return {
            ...data,
            message: '✅ Found in your database',
            quality: 'verified'
          };
          
        case 'duplicate_check':
          return {
            ...data,
            message: '⚠️ Similar foods exist',
            quality: 'duplicate_warning'
          };
          
        case 'external':
          return {
            ...data,
            message: this.getQualityMessage(data.quality_score),
            quality: data.quality_score
          };
          
        default:
          return data;
      }
    } catch (error) {
      console.error('Food search error:', error);
      throw new Error('Search failed. Please try again.');
    }
  }

  /**
   * Log food with enhanced validation
   */
  async logFood(foodData, userId) {
    try {
      const { data, error } = await supabase.rpc('log_food_item', {
        p_external_food: foodData.source === 'external' ? foodData : null,
        p_food_serving_id: foodData.source === 'local' ? foodData.serving_id : null,
        p_meal_type: foodData.meal_type || 'Snack',
        p_quantity_consumed: foodData.quantity || 1.0,
        p_user_id: userId,
        p_log_date: foodData.log_date || new Date().toISOString().split('T')[0]
      });

      if (error) throw error;

      // Handle response
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.warning) {
        return {
          ...data,
          needsReview: true,
          message: '⚠️ ' + data.warning
        };
      }

      return {
        ...data,
        message: '✅ Food logged successfully',
        quality: data.quality_score
      };

    } catch (error) {
      console.error('Food logging error:', error);
      throw new Error('Failed to log food. Please try again.');
    }
  }

  /**
   * Run nutrition audit
   */
  async runAudit() {
    try {
      const { data, error } = await supabase.functions.invoke('nutrition-audit');
      
      if (error) throw error;
      
      return {
        ...data,
        summary: this.generateAuditSummary(data)
      };
      
    } catch (error) {
      console.error('Audit error:', error);
      throw new Error('Audit failed. Please try again.');
    }
  }

  /**
   * Find potential duplicates before adding food
   */
  async checkDuplicates(foodName) {
    try {
      const { data, error } = await supabase.rpc('find_duplicate_foods', {
        search_name: foodName,
        similarity_threshold: 0.7
      });

      if (error) throw error;

      return data.length > 0 ? {
        hasDuplicates: true,
        suggestions: data,
        message: `Found ${data.length} similar foods`
      } : {
        hasDuplicates: false,
        message: 'No duplicates found'
      };

    } catch (error) {
      console.error('Duplicate check error:', error);
      return { hasDuplicates: false, error: error.message };
    }
  }

  /**
   * Validate nutrition data client-side
   */
  validateNutrition(nutritionData) {
    const limits = {
      calories: { min: 0, max: 2000 },
      protein_g: { min: 0, max: 100 },
      carbs_g: { min: 0, max: 200 },
      fat_g: { min: 0, max: 100 }
    };

    const errors = [];
    const warnings = [];

    // Check ranges
    for (const [nutrient, limit] of Object.entries(limits)) {
      const value = nutritionData[nutrient];
      if (value !== null && value !== undefined) {
        if (value < limit.min || value > limit.max) {
          errors.push(`${nutrient} (${value}) is outside acceptable range (${limit.min}-${limit.max})`);
        }
      }
    }

    // Calorie consistency
    const estimatedCalories = 
      (nutritionData.carbs_g || 0) * 4 + 
      (nutritionData.protein_g || 0) * 4 + 
      (nutritionData.fat_g || 0) * 9;
    
    const actualCalories = nutritionData.calories || 0;
    const difference = Math.abs(estimatedCalories - actualCalories);
    
    if (actualCalories > 0 && difference > actualCalories * 0.3) {
      warnings.push(`Calorie inconsistency: ${actualCalories} provided vs ${Math.round(estimatedCalories)} estimated`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      estimatedCalories
    };
  }

  // Helper methods
  getQualityMessage(qualityScore) {
    switch (qualityScore) {
      case 'high':
        return '✅ High quality AI data';
      case 'medium':
        return '⚠️ Medium quality - may need review';
      case 'low':
        return '❌ Low quality - manual review recommended';
      default:
        return '🤖 AI generated data';
    }
  }

  generateAuditSummary(auditData) {
    const totalIssues = Object.values(auditData.quality_issues)
      .reduce((sum, issues) => sum + issues.length, 0);
    
    const qualityPercentage = Math.round(
      ((auditData.total_servings - totalIssues) / auditData.total_servings) * 100
    );

    return {
      totalIssues,
      qualityPercentage,
      status: qualityPercentage > 90 ? 'excellent' : 
              qualityPercentage > 70 ? 'good' : 'needs_attention',
      priorityActions: auditData.recommendations.slice(0, 3)
    };
  }
}

// Export singleton instance
export const nutritionAPI = new NutritionAPI();