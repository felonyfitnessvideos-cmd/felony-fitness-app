/**
 * @fileoverview Enhanced nutrition API client with AI guardrails
 * @description Client-side wrapper for enhanced nutrition API with guardrails,
 * duplicate detection, and quality scoring. Provides comprehensive food search
 * and nutrition data retrieval with intelligent caching and validation.
 * 
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-02
 * 
 * @requires supabaseClient
 * 
 * @example
 * // Create API instance and search for foods
 * const nutritionAPI = new NutritionAPI();
 * const results = await nutritionAPI.searchFood('chicken breast');
 * 
 * @example
 * // Get nutrition details for specific food
 * const details = await nutritionAPI.getFoodDetails(foodId);
 */

import { supabase } from '../supabaseClient.js';

/**
 * Enhanced nutrition API client class
 * 
 * @class NutritionAPI
 * @description Provides comprehensive nutrition data retrieval with AI guardrails,
 * duplicate detection, quality scoring, and intelligent caching mechanisms.
 * Integrates with Supabase Edge Functions for serverless food data processing.
 */
export class NutritionAPI {
  /**
   * Create a NutritionAPI instance
   * 
   * @constructor
   * @description Initializes the nutrition API client with Supabase configuration.
   * Sets up base URL and prepares for serverless function calls.
   */
  constructor() {
    /** @type {string} Base URL for Supabase API calls */
    this.baseURL = import.meta.env.VITE_SUPABASE_URL;
  }

  /**
   * Search for foods with AI guardrails and quality scoring
   * 
   * @async
   * @method searchFood
   * @param {string} query - Food search query string
   * @returns {Promise<Object>} Search results with quality scores and source information
   * @throws {Error} Throws error if search fails or API is unavailable
   * 
   * @description Searches for foods using enhanced API with multiple data sources:
   * - Local database for verified foods
   * - Duplicate detection for similar items
   * - External APIs with quality scoring
   * - AI-powered result validation
   * 
   * @example
   * // Basic food search
   * const results = await nutritionAPI.searchFood('banana');
   * 
   * @example
   * // Search with complex query
   * const results = await nutritionAPI.searchFood('grilled chicken breast 6oz');
   * console.log(results.quality); // 'verified', 'high', 'medium', 'low'
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
   * Log food item with enhanced validation and quality checks
   * 
   * @async
   * @method logFood
   * @param {Object} foodData - Food data object to log
   * @param {string} foodData.source - Data source ('local' | 'external')
   * @param {number} [foodData.serving_id] - Local serving ID if source is 'local' 
   * @param {string} [foodData.meal_type='Snack'] - Meal type classification
   * @param {number} [foodData.quantity=1.0] - Quantity consumed
   * @param {string} [foodData.log_date] - Date to log (defaults to today)
   * @param {string} userId - User ID for logging
   * @returns {Promise<Object>} Log result with quality information and warnings
   * @throws {Error} Throws error if logging fails
   * 
   * @description Logs food consumption with comprehensive validation:
   * - Validates external food data quality
   * - Checks for duplicate entries
   * - Provides quality scoring and warnings
   * - Handles both local and external food sources
   * 
   * @example
   * // Log local food from database
   * const result = await nutritionAPI.logFood({
   *   source: 'local',
   *   serving_id: 123,
   *   meal_type: 'Breakfast',
   *   quantity: 1.5
   * }, userId);
   * 
   * @example
   * // Log external food with validation
   * const result = await nutritionAPI.logFood({
   *   source: 'external',
   *   name: 'Banana',
   *   calories: 105,
   *   meal_type: 'Snack'
   * }, userId);
   */
  async logFood(foodData, userId) {
    try {
      const { data, error } = await supabase.functions.invoke('log-food-item', {
        body: {
          p_external_food: foodData.source === 'external' ? foodData : null,
          p_food_serving_id: foodData.source === 'local' ? foodData.serving_id : null,
          p_meal_type: foodData.meal_type || 'Snack',
          p_quantity_consumed: foodData.quantity || 1.0,
          p_user_id: userId,
          p_log_date: foodData.log_date || new Date().toISOString().split('T')[0]
        }
      });

      if (error) throw error;

      // Handle response
      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.warning) {
        return {
          ...data,
          needsReview: true,
          message: '⚠️ ' + data.warning
        };
      }

      return {
        ...data,
        message: '✅ Food logged successfully',
        quality: data?.quality_score
      };

    } catch (error) {
      console.error('Food logging error:', error);
      throw new Error('Failed to log food. Please try again.');
    }
  }

  /**
   * Run comprehensive nutrition data audit
   * 
   * @async
   * @method runAudit
   * @returns {Promise<Object>} Audit results with quality summary and recommendations
   * @throws {Error} Throws error if audit fails
   * 
   * @description Performs comprehensive audit of nutrition database:
   * - Identifies quality issues and inconsistencies
   * - Generates quality percentage scores
   * - Provides actionable recommendations
   * - Detects duplicate and problematic entries
   * 
   * @example
   * // Run full nutrition audit
   * const auditResults = await nutritionAPI.runAudit();
   * console.log(`Quality: ${auditResults.summary.qualityPercentage}%`);
   * console.log('Issues:', auditResults.summary.totalIssues);
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
   * Check for potential duplicate foods before adding new entries
   * 
   * @async
   * @method checkDuplicates
   * @param {string} foodName - Name of food to check for duplicates
   * @returns {Promise<Object>} Duplicate check results with suggestions
   * @returns {boolean} returns.hasDuplicates - Whether duplicates were found
   * @returns {Array<Object>} [returns.suggestions] - Array of similar foods found
   * @returns {string} returns.message - Human-readable result message
   * 
   * @description Searches for similar foods using fuzzy matching with configurable
   * similarity threshold (default 0.7). Helps prevent duplicate database entries
   * and suggests existing alternatives to users.
   * 
   * @example
   * // Check for duplicates before adding new food
   * const dupCheck = await nutritionAPI.checkDuplicates('chicken breast');
   * if (dupCheck.hasDuplicates) {
   *   console.log('Similar foods:', dupCheck.suggestions);
   * }
   */
  async checkDuplicates(foodName) {
    try {
      const { data, error } = await supabase.functions.invoke('find-duplicate-foods', {
        body: {
          search_name: foodName,
          similarity_threshold: 0.7
        }
      });

      if (error) throw error;

      return data && data.length > 0 ? {
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
   * Validate nutrition data with comprehensive client-side checks
   * 
   * @method validateNutrition
   * @param {Object} nutritionData - Nutrition data object to validate
   * @param {number} nutritionData.calories - Calories per serving
   * @param {number} nutritionData.protein_g - Protein in grams
   * @param {number} nutritionData.carbs_g - Carbohydrates in grams  
   * @param {number} nutritionData.fat_g - Fat in grams
   * @returns {Object} Validation results with errors and warnings
   * @returns {boolean} returns.isValid - Whether data passes validation
   * @returns {Array<string>} returns.errors - Critical validation errors
   * @returns {Array<string>} returns.warnings - Non-critical warnings
   * @returns {number} returns.estimatedCalories - Calculated calorie estimate
   * 
   * @description Performs comprehensive nutrition data validation:
   * - Range checking for all macronutrients
   * - Calorie consistency verification (4-4-9 rule)
   * - Identifies outliers and suspicious values
   * - Provides estimated calories for comparison
   * 
   * @example
   * // Validate nutrition data before saving
   * const validation = nutritionAPI.validateNutrition({
   *   calories: 250,
   *   protein_g: 25,
   *   carbs_g: 30,
   *   fat_g: 5
   * });
   * 
   * if (!validation.isValid) {
   *   console.error('Validation errors:', validation.errors);
   * }
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

  /**
   * Get user-friendly quality message for API results
   * 
   * @private
   * @method getQualityMessage
   * @param {string} qualityScore - Quality score ('high' | 'medium' | 'low')
   * @returns {string} User-friendly quality message with emoji
   * 
   * @description Converts quality scores to human-readable messages with
   * appropriate visual indicators for user interface display.
   */
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

  /**
   * Generate comprehensive audit summary with quality metrics
   * 
   * @private
   * @method generateAuditSummary
   * @param {Object} auditData - Raw audit data from serverless function
   * @param {Object} auditData.quality_issues - Categorized quality issues
   * @param {number} auditData.total_servings - Total servings analyzed
   * @param {Array<string>} auditData.recommendations - Improvement recommendations
   * @returns {Object} Formatted audit summary with metrics
   * @returns {number} returns.totalIssues - Total number of issues found
   * @returns {number} returns.qualityPercentage - Overall quality percentage
   * @returns {string} returns.status - Quality status ('excellent' | 'good' | 'needs_attention')
   * @returns {Array<string>} returns.priorityActions - Top 3 recommended actions
   * 
   * @description Processes raw audit data into user-friendly summary with:
   * - Quality percentage calculation
   * - Status classification based on thresholds
   * - Priority action recommendations
   * - Issue count aggregation
   */
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

/**
 * Singleton nutrition API instance for application-wide use
 * 
 * @constant {NutritionAPI} nutritionAPI
 * @description Pre-configured NutritionAPI instance ready for use across
 * the application. Provides consistent API access without need for
 * re-instantiation.
 * 
 * @example
 * // Import and use singleton instance
 * import { nutritionAPI } from './utils/nutritionAPI.js';
 * const results = await nutritionAPI.searchFood('apple');
 */
export const nutritionAPI = new NutritionAPI();
