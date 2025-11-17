/**
 * @file src/components/NutritionPipelineMonitor.jsx
 * @description Real-time Nutrition Pipeline Monitoring Dashboard
 * 
 * FEATURES:
 * 1. Live pipeline status monitoring
 * 2. Data quality insights and analytics
 * 3. Enrichment queue management
 * 4. Bulk processing controls
 * 5. Quality score distribution visualization
 */

import React, { useState, useEffect } from 'react';
import { nutritionPipeline } from '../utils/nutritionPipeline';
import './NutritionPipelineMonitor.css';

const NutritionPipelineMonitor = () => {
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [qualityInsights, setQualityInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [bulkEnrichmentRunning, setBulkEnrichmentRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Load pipeline data
  const loadPipelineData = async () => {
    try {
      setIsLoading(true);
      
      const [statusResult, insightsResult] = await Promise.all([
        nutritionPipeline.getPipelineStatus(),
        nutritionPipeline.getQualityInsights()
      ]);

      if (statusResult.success) {
        setPipelineStatus(statusResult);
      }

      if (insightsResult.success) {
        setQualityInsights(insightsResult);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load pipeline data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    loadPipelineData();
    const interval = setInterval(loadPipelineData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Trigger bulk enrichment
  const handleBulkEnrichment = async (threshold = 70, limit = 50) => {
    try {
      setBulkEnrichmentRunning(true);
      const result = await nutritionPipeline.triggerBulkEnrichment(threshold, limit);
      
      if (result.success) {
        alert(`Bulk enrichment completed!\n${result.successful} foods enriched successfully\n${result.failed} failed`);
        await loadPipelineData(); // Refresh data
      } else {
        alert(`Bulk enrichment failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Bulk enrichment error:', error);
      alert(`Bulk enrichment error: ${error.message}`);
    } finally {
      setBulkEnrichmentRunning(false);
    }
  };

  // Get status color based on queue status
  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return '#ffa500';
      case 'completed': return '#4caf50';
      case 'failed': return '#f44336';
      default: return '#2196f3';
    }
  };

  if (isLoading && !pipelineStatus) {
    return (
      <div className="nutrition-pipeline-monitor loading">
        <div className="loading-spinner"></div>
        <p>Loading nutrition pipeline data...</p>
      </div>
    );
  }

  return (
    <div className="nutrition-pipeline-monitor">
      <div className="monitor-header">
        <div className="title-section">
          <h2>🔬 Nutrition Pipeline Monitor</h2>
          <p>Real-time monitoring of multi-API nutrition data processing</p>
        </div>
        
        <div className="status-section">
          <div className="last-updated">
            Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}
          </div>
          <button 
            onClick={loadPipelineData}
            className="refresh-btn"
            disabled={isLoading}
          >
            {isLoading ? '⟳' : '🔄'} Refresh
          </button>
        </div>
      </div>

      <div className="monitor-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'quality' ? 'active' : ''}`}
          onClick={() => setActiveTab('quality')}
        >
          ⭐ Quality Insights
        </button>
        <button 
          className={`tab ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          📋 Processing Queue
        </button>
        <button 
          className={`tab ${activeTab === 'controls' ? 'active' : ''}`}
          onClick={() => setActiveTab('controls')}
        >
          🎛️ Controls
        </button>
      </div>

      <div className="monitor-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="info-panel">
              <h3>📊 Pipeline Overview</h3>
              <div className="info-panel-content">
                <p><strong>What this shows:</strong> Real-time statistics about your nutrition database quality and enrichment pipeline status.</p>
                
                <div className="verification-steps">
                  <h4>How to verify it's working:</h4>
                  <ul>
                    <li><strong>Total Foods:</strong> Should match the number of foods in your database. Check Supabase → food_servings table row count.</li>
                    <li><strong>Verified:</strong> Foods that have been manually verified or AI-approved (is_verified = true).</li>
                    <li><strong>Pending Enrichment:</strong> Foods waiting to be processed (enrichment_status = 'pending').</li>
                    <li><strong>Avg Quality Score:</strong> Overall data quality (0-100%). Higher is better. Scores above 70% indicate good data.</li>
                    <li><strong>Below Threshold:</strong> Foods with quality_score &lt; 70 that need attention.</li>
                    <li><strong>Queue Size:</strong> Active jobs in nutrition_enrichment_queue table with status = 'pending'.</li>
                  </ul>
                </div>
                
                <div className="auto-refresh-note">
                  ℹ️ This page auto-refreshes every 30 seconds. Click "🔄 Refresh" for immediate updates.
                </div>
              </div>
            </div>
            
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">🍎</div>
                <div className="metric-content">
                  <h3>Total Foods</h3>
                  <div className="metric-value">
                    {pipelineStatus?.pipeline_metrics?.total_foods || 0}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">✅</div>
                <div className="metric-content">
                  <h3>Verified</h3>
                  <div className="metric-value">
                    {pipelineStatus?.pipeline_metrics?.total_verified || 0}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">⏳</div>
                <div className="metric-content">
                  <h3>Pending Enrichment</h3>
                  <div className="metric-value">
                    {pipelineStatus?.pipeline_metrics?.total_pending || 0}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">📈</div>
                <div className="metric-content">
                  <h3>Avg Quality Score</h3>
                  <div className="metric-value">
                    {pipelineStatus?.pipeline_metrics?.average_quality_score?.toFixed(1) || '0.0'}%
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">⚠️</div>
                <div className="metric-content">
                  <h3>Below Threshold</h3>
                  <div className="metric-value">
                    {pipelineStatus?.pipeline_metrics?.foods_below_threshold || 0}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">📋</div>
                <div className="metric-content">
                  <h3>Queue Size</h3>
                  <div className="metric-value">
                    {pipelineStatus?.pipeline_metrics?.queue_size || 0}
                  </div>
                </div>
              </div>
            </div>

            {pipelineStatus?.recent_activity && pipelineStatus.recent_activity.length > 0 && (
              <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  {pipelineStatus.recent_activity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div 
                        className="activity-status"
                        style={{ backgroundColor: getStatusColor(activity.status) }}
                      ></div>
                      <div className="activity-content">
                        <div className="activity-title">
                          Food ID: {activity.food_id}
                        </div>
                        <div className="activity-meta">
                          {activity.enrichment_type} • {new Date(activity.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quality' && qualityInsights && (
          <div className="quality-tab">
            <div className="info-panel">
              <h3>⭐ Quality Insights</h3>
              <div className="info-panel-content">
                <p><strong>What this shows:</strong> Detailed breakdown of data quality scores across all foods in your database.</p>
                
                <div className="verification-steps">
                  <h4>Understanding Quality Scores:</h4>
                  <ul>
                    <li><strong>Excellent (85-100):</strong> Complete nutritional data, verified sources (USDA), consistent calculations.</li>
                    <li><strong>Good (70-84):</strong> Most fields complete, minor inconsistencies possible.</li>
                    <li><strong>Fair (50-69):</strong> Some missing data or calculation mismatches.</li>
                    <li><strong>Poor (1-49):</strong> Significant missing data or major inconsistencies.</li>
                    <li><strong>Not Scored (0):</strong> Foods that haven't been processed yet.</li>
                  </ul>
                  
                  <h4>How to verify:</h4>
                  <ul>
                    <li>Check the distribution chart - most foods should move from "Not Scored" to higher categories after enrichment.</li>
                    <li>Compare "Before" and "After" scores - quality should improve after processing.</li>
                    <li>Review "Needs Attention" list for foods requiring manual review.</li>
                    <li>SQL Check: <code>SELECT quality_score, COUNT(*) FROM food_servings GROUP BY quality_score;</code></li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="quality-summary">
              <h3>Data Quality Overview</h3>
              <div className="quality-stats">
                <div className="quality-stat">
                  <span className="stat-label">Needs Attention:</span>
                  <span className="stat-value attention">
                    {qualityInsights.needs_attention?.length || 0} foods
                  </span>
                </div>
                <div className="quality-stat">
                  <span className="stat-label">Recent Improvements:</span>
                  <span className="stat-value improved">
                    {qualityInsights.recent_improvements?.length || 0} foods
                  </span>
                </div>
              </div>
            </div>

            {qualityInsights.quality_distribution && qualityInsights.quality_distribution.length > 0 && (
              <div className="quality-distribution">
                <h4>📊 Quality Score Distribution</h4>
                <div className="distribution-chart">
                  {qualityInsights.quality_distribution.map((range, index) => (
                    <div key={index} className="distribution-bar">
                      <div className="bar-label">{range.quality_range}</div>
                      <div className="bar-container">
                        <div 
                          className="bar-fill" 
                          style={{ 
                            width: `${range.percentage}%`,
                            backgroundColor: range.quality_range.includes('Excellent') ? '#4caf50' :
                                           range.quality_range.includes('Good') ? '#8bc34a' :
                                           range.quality_range.includes('Fair') ? '#ffc107' :
                                           range.quality_range.includes('Poor') ? '#ff9800' : '#9e9e9e'
                          }}
                        >
                          <span className="bar-text">{range.count} ({range.percentage}%)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {qualityInsights.needs_attention && qualityInsights.needs_attention.length > 0 && (
              <div className="needs-attention">
                <h4>🚨 Foods Needing Attention</h4>
                <div className="food-list">
                  {qualityInsights.needs_attention.slice(0, 10).map((food) => (
                    <div key={food.id} className="food-item low-quality">
                      <div className="food-name">{food.food_name}</div>
                      <div className="food-score">
                        Quality: {food.quality_score || 0}%
                      </div>
                      <div className="food-status">
                        Status: {food.enrichment_status || 'pending'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {qualityInsights.recent_improvements && qualityInsights.recent_improvements.length > 0 && (
              <div className="recent-improvements">
                <h4>✨ Recently Improved</h4>
                <div className="food-list">
                  {qualityInsights.recent_improvements.slice(0, 5).map((food) => (
                    <div key={food.id} className="food-item high-quality">
                      <div className="food-name">{food.food_name}</div>
                      <div className="food-score">
                        Quality: {food.quality_score}%
                      </div>
                      <div className="food-date">
                        Enriched: {new Date(food.last_enrichment).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="queue-tab">
            <div className="info-panel">
              <h3>📋 Processing Queue</h3>
              <div className="info-panel-content">
                <p><strong>What this shows:</strong> Real-time status of all enrichment jobs currently being processed or queued.</p>
                
                <div className="verification-steps">
                  <h4>Queue Status Meanings:</h4>
                  <ul>
                    <li><strong>🔵 Pending:</strong> Job is waiting to be processed. These will be picked up automatically or via bulk enrichment.</li>
                    <li><strong>🟠 Processing:</strong> Job is currently being enriched by the Edge Function. Should complete within 5-30 seconds.</li>
                    <li><strong>🟢 Completed:</strong> Successfully enriched. Check quality_score_after for improvement.</li>
                    <li><strong>🔴 Failed:</strong> Enrichment failed. Check error_message for details. Can be retried.</li>
                  </ul>
                  
                  <h4>How to verify it's working:</h4>
                  <ol>
                    <li>Click "Enrich" button in Controls tab → New jobs appear with "Pending" status.</li>
                    <li>Jobs should move to "Processing" status (orange) within seconds.</li>
                    <li>After 5-30 seconds, jobs move to "Completed" (green) or "Failed" (red).</li>
                    <li>Check quality_score_before vs quality_score_after - should show improvement.</li>
                    <li>View changes_made to see what was updated (missing nutrients, corrected values).</li>
                    <li>SQL Check: <code>SELECT status, COUNT(*) FROM nutrition_enrichment_queue GROUP BY status;</code></li>
                  </ol>
                </div>
                
                <div className="queue-note">
                  💡 <strong>Tip:</strong> If jobs stay in "Processing" for more than 60 seconds, check Edge Function logs in Supabase Dashboard → Edge Functions → nutrition-enrichment → Logs.
                </div>
              </div>
            </div>
            
            <h3>Queue Status</h3>
            {pipelineStatus?.queue_status && pipelineStatus.queue_status.length > 0 ? (
              <div className="queue-list">
                {pipelineStatus.queue_status.map((item, index) => (
                  <div key={index} className="queue-item">
                    <div 
                      className="queue-status"
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    ></div>
                    <div className="queue-content">
                      <div className="queue-title">
                        Food ID: {item.food_id} • Type: {item.enrichment_type}
                      </div>
                      <div className="queue-meta">
                        Status: {item.status} • Priority: {item.priority || 'Normal'}
                      </div>
                      <div className="queue-time">
                        Created: {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-queue">
                ✅ Processing queue is empty
              </div>
            )}
          </div>
        )}

        {activeTab === 'controls' && (
          <div className="controls-tab">
            <div className="info-panel">
              <h3>🎛️ Enrichment Controls</h3>
              <div className="info-panel-content">
                <p><strong>What this does:</strong> Trigger bulk enrichment to process multiple foods at once using AI-powered analysis.</p>
                
                <div className="verification-steps">
                  <h4>What happens when you click "Start Bulk Enrichment":</h4>
                  <ol>
                    <li><strong>Selection:</strong> Finds foods with quality_score &lt; threshold (default 70%).</li>
                    <li><strong>Queue Creation:</strong> Creates enrichment jobs in nutrition_enrichment_queue table.</li>
                    <li><strong>Processing:</strong> Edge Function processes each food:
                      <ul>
                        <li>Uses OpenAI GPT-4o-mini to fill missing nutritional data</li>
                        <li>Validates nutritional consistency (calories = 4×protein + 4×carbs + 9×fat)</li>
                        <li>Fixes fiber/sugar if they exceed total carbs</li>
                        <li>Improves food categorization</li>
                        <li>Calculates quality score (0-100)</li>
                      </ul>
                    </li>
                    <li><strong>Database Update:</strong> Updates food_servings with enriched data and new quality_score.</li>
                    <li><strong>Queue Status:</strong> Marks job as 'completed' or 'failed' with details.</li>
                  </ol>
                  
                  <h4>How to verify enrichment worked:</h4>
                  <ol>
                    <li><strong>Before Enrichment:</strong>
                      <ul>
                        <li>Note the "Avg Quality Score" and "Pending Enrichment" count</li>
                        <li>Check quality distribution - should show many "Not Scored" foods</li>
                      </ul>
                    </li>
                    <li><strong>Click "Start Bulk Enrichment":</strong>
                      <ul>
                        <li>Alert shows: "X foods enriched successfully, Y failed"</li>
                        <li>Processing takes 5-30 seconds per food (up to 25 minutes for 50 foods)</li>
                      </ul>
                    </li>
                    <li><strong>After Enrichment:</strong>
                      <ul>
                        <li>"Avg Quality Score" should increase</li>
                        <li>"Pending Enrichment" count should decrease</li>
                        <li>Quality distribution shifts right (more "Good" and "Excellent")</li>
                        <li>Go to Processing Queue tab - completed jobs show quality improvements</li>
                      </ul>
                    </li>
                    <li><strong>Manual Verification in Database:</strong>
                      <ul>
                        <li>Pick a food: <code>SELECT * FROM food_servings WHERE quality_score &gt; 0 LIMIT 1;</code></li>
                        <li>Check details: <code>SELECT * FROM nutrition_enrichment_queue WHERE food_id = 'YOUR_FOOD_ID' ORDER BY created_at DESC LIMIT 1;</code></li>
                        <li>Review changes_made JSONB field to see what was updated</li>
                      </ul>
                    </li>
                  </ol>
                </div>
                
                <div className="enrichment-warning">
                  ⚠️ <strong>Important:</strong> Each enrichment uses OpenAI API credits. Processing 50 foods costs approximately $0.10-0.50 depending on data complexity. Monitor your OpenAI usage in the OpenAI dashboard.
                </div>
              </div>
            </div>
            
            <div className="control-section">
              <h3>Bulk Processing Controls</h3>
              
              <div className="bulk-enrichment-control">
                <h4>Bulk Enrichment</h4>
                <p>Automatically enrich foods with quality scores below threshold</p>
                
                <div className="control-inputs">
                  <div className="input-group">
                    <label>Quality Threshold (%)</label>
                    <input 
                      type="number" 
                      defaultValue="70" 
                      min="0" 
                      max="100" 
                      id="quality-threshold"
                    />
                  </div>
                  
                  <div className="input-group">
                    <label>Processing Limit</label>
                    <input 
                      type="number" 
                      defaultValue="50" 
                      min="1" 
                      max="200" 
                      id="processing-limit"
                    />
                  </div>
                </div>

                <button 
                  className="bulk-action-btn"
                  onClick={() => {
                    const threshold = document.getElementById('quality-threshold').value;
                    const limit = document.getElementById('processing-limit').value;
                    handleBulkEnrichment(parseInt(threshold), parseInt(limit));
                  }}
                  disabled={bulkEnrichmentRunning}
                >
                  {bulkEnrichmentRunning ? '🔄 Processing...' : '🚀 Start Bulk Enrichment'}
                </button>
              </div>

              <div className="pipeline-actions">
                <h4>Pipeline Actions</h4>
                <div className="action-buttons">
                  <button className="action-btn secondary">
                    📊 Export Quality Report
                  </button>
                  <button className="action-btn secondary">
                    🧹 Clear Completed Queue Items
                  </button>
                  <button className="action-btn secondary">
                    ⚠️ Retry Failed Items
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionPipelineMonitor;
