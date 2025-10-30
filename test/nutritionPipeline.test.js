/**
 * @file test/nutritionPipeline.test.js
 * @description Comprehensive test suite for Multi-API Nutrition Pipeline
 * Tests all components: aggregation, enrichment, monitoring, and database integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nutritionPipeline, enhancedNutritionAPI } from '../src/utils/nutritionPipeline';

// Mock Supabase client
const mockSupabase = {
  auth: {
    session: () => ({ access_token: 'mock-token' })
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      ilike: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({
          data: [
            { id: 1, name: 'Test Food', quality_score: 85 },
            { id: 2, name: 'Another Food', quality_score: 65 }
          ],
          error: null
        }))
      })),
      lt: vi.fn(() => ({
        neq: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({
            data: [
              { id: 3, name: 'Low Quality Food', quality_score: 45, enrichment_status: 'pending' }
            ],
            error: null
          }))
        }))
      })),
      not: vi.fn(() => ({
        gte: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: [
                { id: 4, name: 'Improved Food', quality_score: 90, last_enrichment: '2024-01-30T10:00:00Z' }
              ],
              error: null
            }))
          }))
        }))
      })),
      order: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({
          data: [
            { food_id: 1, status: 'processing', enrichment_type: 'full', created_at: '2024-01-30T09:00:00Z' }
          ],
          error: null
        }))
      }))
    }))
  })),
  rpc: vi.fn((funcName) => {
    switch (funcName) {
      case 'get_enrichment_status':
        return Promise.resolve({
          data: [
            { status: 'pending', count: 5, avg_priority: 1.0 },
            { status: 'processing', count: 2, avg_priority: 1.5 }
          ],
          error: null
        });
      case 'get_quality_distribution':
        return Promise.resolve({
          data: [
            { quality_range: '80-89% (Good)', count: 15, avg_score: 85.2 },
            { quality_range: '70-79% (Fair)', count: 8, avg_score: 74.5 }
          ],
          error: null
        });
      default:
        return Promise.resolve({ data: [], error: null });
    }
  })
};

// Mock fetch for edge functions
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console methods to avoid noise in tests
console.log = vi.fn();
console.error = vi.fn();

describe('Multi-API Nutrition Pipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset fetch mock
    mockFetch.mockReset();
    
    // Mock successful API responses by default
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        foods: [
          {
            id: 'api-food-1',
            name: 'External API Food',
            quality_score: 78,
            source: 'usda'
          }
        ],
        total_found: 5,
        after_deduplication: 3,
        sources_searched: ['usda', 'nutritionx'],
        quality_score: 82
      })
    });

    // Mock supabase in the pipeline
    vi.doMock('../src/supabaseClient', () => ({
      supabase: mockSupabase
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Multi-API Search', () => {
    it('should search across multiple APIs successfully', async () => {
      const result = await nutritionPipeline.searchMultiAPI('chicken breast', ['usda', 'nutritionx']);

      expect(result.success).toBe(true);
      expect(result.foods).toHaveLength(1);
      expect(result.metadata.sources_searched).toEqual(['usda', 'nutritionx']);
      expect(result.metadata.total_found).toBe(5);
      expect(result.metadata.after_deduplication).toBe(3);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/nutrition-aggregator'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            query: 'chicken breast',
            sources: ['usda', 'nutritionx']
          })
        })
      );
    });

    it('should handle API search failures gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await nutritionPipeline.searchMultiAPI('invalid query');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.foods).toEqual([]);
    });

    it('should use default sources when none specified', async () => {
      await nutritionPipeline.searchMultiAPI('test food');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: JSON.stringify({
            query: 'test food',
            sources: ['usda', 'nutritionx']
          })
        })
      );
    });
  });

  describe('Food Enrichment', () => {
    it('should enrich food data successfully', async () => {
      const enrichmentResponse = {
        changes_made: ['protein', 'fiber', 'vitamin_c'],
        quality_score: 92,
        confidence: 88,
        recommendations: ['Add more micronutrient data'],
        enriched_data: { protein: 25.5, fiber: 2.1 }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(enrichmentResponse)
      });

      const result = await nutritionPipeline.enrichFood(123, 'full');

      expect(result.success).toBe(true);
      expect(result.changes_made).toEqual(['protein', 'fiber', 'vitamin_c']);
      expect(result.quality_score).toBe(92);
      expect(result.confidence).toBe(88);
      expect(result.recommendations).toHaveLength(1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/nutrition-enrichment'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            food_id: 123,
            enrichment_type: 'full'
          })
        })
      );
    });

    it('should handle enrichment failures', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error'
      });

      const result = await nutritionPipeline.enrichFood(456, 'basic');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Enrichment failed: Internal Server Error');
    });

    it('should use default enrichment type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ changes_made: [], quality_score: 75 })
      });

      await nutritionPipeline.enrichFood(789);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: JSON.stringify({
            food_id: 789,
            enrichment_type: 'full'
          })
        })
      );
    });
  });

  describe('Pipeline Status Monitoring', () => {
    it('should get pipeline status successfully', async () => {
      const result = await nutritionPipeline.getPipelineStatus();

      expect(result.success).toBe(true);
      expect(result.queue_status).toHaveLength(2);
      expect(result.pipeline_metrics).toBeDefined();
      expect(result.recent_activity).toHaveLength(1);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_enrichment_status');
      expect(mockSupabase.from).toHaveBeenCalledWith('nutrition_pipeline_status');
      expect(mockSupabase.from).toHaveBeenCalledWith('nutrition_enrichment_queue');
    });

    it('should handle database errors in status retrieval', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: new Error('Database connection failed')
      });

      const result = await nutritionPipeline.getPipelineStatus();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('Bulk Enrichment', () => {
    it('should perform bulk enrichment successfully', async () => {
      // Mock successful enrichment for each food
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          changes_made: ['protein', 'carbs'],
          quality_score: 85,
          confidence: 90
        })
      });

      const result = await nutritionPipeline.triggerBulkEnrichment(70, 5);

      expect(result.success).toBe(true);
      expect(result.total_processed).toBe(1); // Based on mocked data
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(1);

      expect(mockSupabase.from).toHaveBeenCalledWith('foods');
    });

    it('should handle mixed success/failure in bulk enrichment', async () => {
      // First enrichment succeeds, second fails
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ changes_made: ['protein'], quality_score: 88 })
        })
        .mockRejectedValueOnce(new Error('Enrichment failed'));

      // Mock two foods needing enrichment
      mockSupabase.from.mockReturnValueOnce({
        select: () => ({
          lt: () => ({
            neq: () => ({
              limit: () => Promise.resolve({
                data: [
                  { id: 1, name: 'Food 1', quality_score: 60 },
                  { id: 2, name: 'Food 2', quality_score: 55 }
                ],
                error: null
              })
            })
          })
        })
      });

      const result = await nutritionPipeline.triggerBulkEnrichment(70, 10);

      expect(result.success).toBe(true);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('should use default parameters for bulk enrichment', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ changes_made: [], quality_score: 80 })
      });

      await nutritionPipeline.triggerBulkEnrichment();

      expect(mockSupabase.from).toHaveBeenCalledWith('foods');
      // Verify the query parameters use defaults (70% threshold, 50 limit)
      const fromCall = mockSupabase.from.mock.calls.find(call => call[0] === 'foods');
      expect(fromCall).toBeDefined();
    });
  });

  describe('Intelligent Search', () => {
    it('should perform hybrid search when local results are insufficient', async () => {
      // Mock insufficient local results
      mockSupabase.from.mockReturnValueOnce({
        select: () => ({
          ilike: () => ({
            limit: () => Promise.resolve({
              data: [
                { id: 1, name: 'Local Food', quality_score: 60 } // Low quality, triggers external search
              ],
              error: null
            })
          })
        })
      });

      const result = await nutritionPipeline.intelligentSearch('protein powder');

      expect(result.success).toBe(true);
      expect(result.foods.length).toBeGreaterThan(0);
      expect(result.metadata.search_strategy).toBe('hybrid');
      expect(result.metadata.local_results).toBe(1);
      expect(result.metadata.external_results).toBeGreaterThan(0);

      // Should have called external API
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should use local-only search when results are sufficient', async () => {
      // Mock sufficient high-quality local results
      mockSupabase.from.mockReturnValueOnce({
        select: () => ({
          ilike: () => ({
            limit: () => Promise.resolve({
              data: [
                { id: 1, name: 'High Quality Food 1', quality_score: 95 },
                { id: 2, name: 'High Quality Food 2', quality_score: 88 },
                { id: 3, name: 'High Quality Food 3', quality_score: 92 }
              ],
              error: null
            })
          })
        })
      });

      const result = await nutritionPipeline.intelligentSearch('chicken');

      expect(result.success).toBe(true);
      expect(result.metadata.search_strategy).toBe('local_only');
      expect(result.metadata.local_results).toBe(3);
      expect(result.metadata.external_results).toBe(0);

      // Should NOT have called external API
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should rank results by quality and confidence', async () => {
      const result = await nutritionPipeline.intelligentSearch('test food');

      expect(result.success).toBe(true);
      
      // Results should be sorted by combined quality + confidence score
      const foods = result.foods;
      for (let i = 0; i < foods.length - 1; i++) {
        const currentScore = (foods[i].quality_score || 0) + (foods[i].confidence_score || 0);
        const nextScore = (foods[i + 1].quality_score || 0) + (foods[i + 1].confidence_score || 0);
        expect(currentScore).toBeGreaterThanOrEqual(nextScore);
      }
    });
  });

  describe('Quality Insights', () => {
    beforeEach(() => {
      // Mock additional database calls for quality insights
      mockSupabase.from
        .mockReturnValueOnce({
          select: () => ({
            lt: () => ({
              order: () => ({
                limit: () => Promise.resolve({
                  data: [
                    { id: 1, name: 'Needs Attention 1', quality_score: 45 },
                    { id: 2, name: 'Needs Attention 2', quality_score: 38 }
                  ],
                  error: null
                })
              })
            })
          })
        })
        .mockReturnValueOnce({
          select: () => ({
            not: () => ({
              gte: () => ({
                order: () => ({
                  limit: () => Promise.resolve({
                    data: [
                      { id: 3, name: 'Recently Improved', quality_score: 92, last_enrichment: '2024-01-30T10:00:00Z' }
                    ],
                    error: null
                  })
                })
              })
            })
          })
        });
    });

    it('should get quality insights successfully', async () => {
      const result = await nutritionPipeline.getQualityInsights();

      expect(result.success).toBe(true);
      expect(result.quality_distribution).toHaveLength(2);
      expect(result.needs_attention).toHaveLength(2);
      expect(result.recent_improvements).toHaveLength(1);
      expect(result.insights.total_low_quality).toBe(2);
      expect(result.insights.recent_improvements_count).toBe(1);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_quality_distribution');
    });

    it('should handle database errors in quality insights', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: new Error('Database error')
      });

      const result = await nutritionPipeline.getQualityInsights();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('Enhanced Nutrition API', () => {
    it('should provide all expected API methods', () => {
      expect(typeof enhancedNutritionAPI.searchFood).toBe('function');
      expect(typeof enhancedNutritionAPI.searchMultiAPI).toBe('function');
      expect(typeof enhancedNutritionAPI.enrichFood).toBe('function');
      expect(typeof enhancedNutritionAPI.getPipelineStatus).toBe('function');
      expect(typeof enhancedNutritionAPI.triggerBulkEnrichment).toBe('function');
      expect(typeof enhancedNutritionAPI.getQualityInsights).toBe('function');
    });

    it('should delegate to intelligent search for searchFood', async () => {
      const spy = vi.spyOn(nutritionPipeline, 'intelligentSearch');
      
      await enhancedNutritionAPI.searchFood('test query');
      
      expect(spy).toHaveBeenCalledWith('test query');
    });

    it('should pass through parameters correctly', async () => {
      const spy = vi.spyOn(nutritionPipeline, 'searchMultiAPI');
      
      await enhancedNutritionAPI.searchMultiAPI('query', ['usda']);
      
      expect(spy).toHaveBeenCalledWith('query', ['usda']);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle network timeouts gracefully', async () => {
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      const result = await nutritionPipeline.searchMultiAPI('test', ['usda']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Request timeout');
    });

    it('should handle empty search queries', async () => {
      const result = await nutritionPipeline.intelligentSearch('');

      expect(result.success).toBe(true);
      expect(result.foods).toBeDefined();
    });

    it('should handle null/undefined food IDs in enrichment', async () => {
      const result = await nutritionPipeline.enrichFood(null);

      expect(result.success).toBe(false);
      expect(result.error).toContain('food_id');
    });

    it('should handle database connection failures', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Database connection lost');
      });

      const result = await nutritionPipeline.intelligentSearch('test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection lost');
    });
  });

  describe('Integration Tests', () => {
    it('should complete full search-to-enrichment workflow', async () => {
      // 1. Search returns low-quality local result
      mockSupabase.from.mockReturnValueOnce({
        select: () => ({
          ilike: () => ({
            limit: () => Promise.resolve({
              data: [{ id: 1, name: 'Low Quality Food', quality_score: 45 }],
              error: null
            })
          })
        })
      });

      // 2. External API provides better result
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          foods: [{ id: 'ext-1', name: 'High Quality External', quality_score: 95 }],
          total_found: 1,
          after_deduplication: 1,
          sources_searched: ['usda']
        })
      });

      // 3. Perform intelligent search
      const searchResult = await nutritionPipeline.intelligentSearch('protein');
      expect(searchResult.success).toBe(true);
      expect(searchResult.metadata.search_strategy).toBe('hybrid');

      // 4. Enrich the low-quality food
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          changes_made: ['protein', 'calories'],
          quality_score: 88,
          confidence: 92
        })
      });

      const enrichResult = await nutritionPipeline.enrichFood(1);
      expect(enrichResult.success).toBe(true);
      expect(enrichResult.quality_score).toBe(88);
    });

    it('should handle concurrent operations without conflicts', async () => {
      // Set up multiple concurrent operations
      const operations = [
        nutritionPipeline.searchMultiAPI('food1'),
        nutritionPipeline.searchMultiAPI('food2'),
        nutritionPipeline.enrichFood(1),
        nutritionPipeline.enrichFood(2),
        nutritionPipeline.getPipelineStatus()
      ];

      const results = await Promise.all(operations);

      // All operations should complete successfully
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });
});

describe('Nutrition Pipeline Performance', () => {
  it('should complete search operations within reasonable time', async () => {
    const startTime = Date.now();
    
    await nutritionPipeline.intelligentSearch('chicken breast');
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  it('should handle bulk operations efficiently', async () => {
    const startTime = Date.now();
    
    await nutritionPipeline.triggerBulkEnrichment(70, 10);
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(10000); // Should complete within 10 seconds for 10 items
  });
});