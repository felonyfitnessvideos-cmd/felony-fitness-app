/**
 * @file src/utils/nutritionPipeline.js
 * @description Multi-API Nutrition Pipeline Client Integration
 * 
 * FEATURES:
 * 1. Multi-source nutrition data aggregation
 * 2. Real-time data quality monitoring
 * 3. Automated enrichment triggers
 * 4. Pipeline status tracking
 */

import { supabase } from '../supabaseClient';

class NutritionPipeline {
  constructor() {
    this.baseUrl = 'https://wkmrdelhoeqhsdifrarn.supabase.co/functions/v1';
  }

  /**
   * Search across multiple nutrition APIs with AI deduplication
   */
  async searchMultiAPI(query, sources = ['usda', 'nutritionx']) {
    try {
      console.log(`🔍 Multi-API search: "${query}" across ${sources.join(', ')}`);
      
      const response = await fetch(`${this.baseUrl}/nutrition-aggregator`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.auth.session()?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, sources })
      });

      if (!response.ok) {
        throw new Error(`Multi-API search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`✅ Found ${data.foods?.length || 0} foods from ${data.sources_searched?.length || 0} sources`);
      console.log(`📊 Deduplication: ${data.total_found} → ${data.after_deduplication} foods`);
      
      return {
        success: true,
        foods: data.foods || [],
        metadata: {
          total_found: data.total_found,
          after_deduplication: data.after_deduplication,
          sources_searched: data.sources_searched,
          quality_score: data.quality_score
        }
      };

    } catch (error) {
      console.error('Multi-API search error:', error);
      return {
        success: false,
        error: error.message,
        foods: []
      };
    }
  }

  /**
   * Enrich existing food data with AI completion and validation
   */
  async enrichFood(foodId, enrichmentType = 'full') {
    try {
      console.log(`🔬 Enriching food ID ${foodId} (type: ${enrichmentType})`);
      
      const response = await fetch(`${this.baseUrl}/nutrition-enrichment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.auth.session()?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          food_id: foodId, 
          enrichment_type: enrichmentType 
        })
      });

      if (!response.ok) {
        throw new Error(`Enrichment failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`✅ Enrichment complete: ${data.changes_made?.length || 0} changes made`);
      console.log(`📊 Quality score: ${data.quality_score}% (confidence: ${data.confidence}%)`);
      
      return {
        success: true,
        changes_made: data.changes_made || [],
        quality_score: data.quality_score,
        confidence: data.confidence,
        recommendations: data.recommendations || [],
        enriched_data: data.enriched_data
      };

    } catch (error) {
      console.error('Food enrichment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get nutrition pipeline status and monitoring data
   */
  async getPipelineStatus() {
    try {
      // Get enrichment queue status
      const { data: queueStatus, error: queueError } = await supabase
        .rpc('get_enrichment_status');

      if (queueError) throw queueError;

      // Get overall pipeline metrics
      const { data: pipelineMetrics, error: metricsError } = await supabase
        .from('nutrition_pipeline_status')
        .select('*');

      if (metricsError) throw metricsError;

      // Get recent enrichment activity
      const { data: recentActivity, error: activityError } = await supabase
        .from('nutrition_enrichment_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (activityError) throw activityError;

      return {
        success: true,
        queue_status: queueStatus || [],
        pipeline_metrics: pipelineMetrics || [],
        recent_activity: recentActivity || []
      };

    } catch (error) {
      console.error('Pipeline status error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Trigger bulk enrichment for foods with low quality scores
   */
  async triggerBulkEnrichment(qualityThreshold = 70, limit = 50) {
    try {
      console.log(`🚀 Triggering bulk enrichment for foods with quality < ${qualityThreshold}%`);
      
      // Get foods needing enrichment
      const { data: foods, error } = await supabase
        .from('foods')
        .select('id, name, quality_score, enrichment_status')
        .lt('quality_score', qualityThreshold)
        .neq('enrichment_status', 'processing')
        .limit(limit);

      if (error) throw error;

      const enrichmentPromises = foods.map(async (food) => {
        try {
          const result = await this.enrichFood(food.id, 'full');
          return {
            food_id: food.id,
            food_name: food.name,
            success: result.success,
            changes_made: result.changes_made?.length || 0,
            new_quality_score: result.quality_score
          };
        } catch (error) {
          return {
            food_id: food.id,
            food_name: food.name,
            success: false,
            error: error.message
          };
        }
      });

      const results = await Promise.all(enrichmentPromises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      console.log(`✅ Bulk enrichment complete: ${successful.length} success, ${failed.length} failed`);

      return {
        success: true,
        total_processed: results.length,
        successful: successful.length,
        failed: failed.length,
        results: results
      };

    } catch (error) {
      console.error('Bulk enrichment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Search with automatic fallback and enrichment
   */
  async intelligentSearch(query) {
    try {
      // Step 1: Search local database first
      const { data: localResults, error: localError } = await supabase
        .from('foods')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (localError) throw localError;

      // Step 2: If local results are insufficient or low quality, search external APIs
      const needsExternalSearch = !localResults || 
        localResults.length < 3 || 
        localResults.some(food => (food.quality_score || 0) < 70);

      let externalResults = [];
      
      if (needsExternalSearch) {
        console.log('🌐 Local results insufficient, searching external APIs...');
        const multiApiResult = await this.searchMultiAPI(query);
        externalResults = multiApiResult.foods || [];
      }

      // Step 3: Combine and rank results
      const allResults = [...(localResults || []), ...externalResults];
      
      // Sort by quality score and relevance
      const rankedResults = allResults
        .sort((a, b) => {
          const scoreA = (a.quality_score || 0) + (a.confidence_score || 0);
          const scoreB = (b.quality_score || 0) + (b.confidence_score || 0);
          return scoreB - scoreA;
        })
        .slice(0, 10);

      return {
        success: true,
        foods: rankedResults,
        metadata: {
          local_results: localResults?.length || 0,
          external_results: externalResults.length,
          total_results: rankedResults.length,
          search_strategy: needsExternalSearch ? 'hybrid' : 'local_only'
        }
      };

    } catch (error) {
      console.error('Intelligent search error:', error);
      return {
        success: false,
        error: error.message,
        foods: []
      };
    }
  }

  /**
   * Get data quality insights and recommendations
   */
  async getQualityInsights() {
    try {
      // Get quality distribution
      const { data: qualityDistribution, error: qualityError } = await supabase
        .rpc('get_quality_distribution');

      // Get foods needing attention
      const { data: needsAttention, error: attentionError } = await supabase
        .from('foods')
        .select('id, name, quality_score, enrichment_status, last_enrichment')
        .lt('quality_score', 70)
        .order('quality_score', { ascending: true })
        .limit(20);

      // Get recent improvements
      const { data: recentImprovements, error: improvementsError } = await supabase
        .from('foods')
        .select('id, name, quality_score, last_enrichment')
        .not('last_enrichment', 'is', null)
        .gte('quality_score', 80)
        .order('last_enrichment', { ascending: false })
        .limit(10);

      return {
        success: true,
        quality_distribution: qualityDistribution || [],
        needs_attention: needsAttention || [],
        recent_improvements: recentImprovements || [],
        insights: {
          total_low_quality: needsAttention?.length || 0,
          recent_improvements_count: recentImprovements?.length || 0
        }
      };

    } catch (error) {
      console.error('Quality insights error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance
export const nutritionPipeline = new NutritionPipeline();

// Enhanced nutrition API with pipeline integration
export const enhancedNutritionAPI = {
  // Existing enhanced search function
  async searchFood(query) {
    return await nutritionPipeline.intelligentSearch(query);
  },

  // New pipeline-specific functions
  async searchMultiAPI(query, sources) {
    return await nutritionPipeline.searchMultiAPI(query, sources);
  },

  async enrichFood(foodId, type = 'full') {
    return await nutritionPipeline.enrichFood(foodId, type);
  },

  async getPipelineStatus() {
    return await nutritionPipeline.getPipelineStatus();
  },

  async triggerBulkEnrichment(threshold = 70, limit = 50) {
    return await nutritionPipeline.triggerBulkEnrichment(threshold, limit);
  },

  async getQualityInsights() {
    return await nutritionPipeline.getQualityInsights();
  }
};

export default enhancedNutritionAPI;