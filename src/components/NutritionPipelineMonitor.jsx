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
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">🔍</div>
                <div className="metric-content">
                  <h3>Active Searches</h3>
                  <div className="metric-value">
                    {pipelineStatus?.pipeline_metrics?.active_searches || 0}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">⚡</div>
                <div className="metric-content">
                  <h3>Queue Items</h3>
                  <div className="metric-value">
                    {pipelineStatus?.queue_status?.length || 0}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">✅</div>
                <div className="metric-content">
                  <h3>Completed Today</h3>
                  <div className="metric-value">
                    {pipelineStatus?.pipeline_metrics?.completed_today || 0}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">📈</div>
                <div className="metric-content">
                  <h3>Avg Quality Score</h3>
                  <div className="metric-value">
                    {qualityInsights?.quality_distribution?.[0]?.avg_score?.toFixed(1) || 'N/A'}%
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

            {qualityInsights.needs_attention && qualityInsights.needs_attention.length > 0 && (
              <div className="needs-attention">
                <h4>🚨 Foods Needing Attention</h4>
                <div className="food-list">
                  {qualityInsights.needs_attention.slice(0, 10).map((food) => (
                    <div key={food.id} className="food-item low-quality">
                      <div className="food-name">{food.name}</div>
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
                      <div className="food-name">{food.name}</div>
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
            <h3>Processing Queue Status</h3>
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