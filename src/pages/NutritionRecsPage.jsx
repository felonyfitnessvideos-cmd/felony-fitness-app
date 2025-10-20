/**
 * @file NutritionRecsPage.jsx
 * @description This file contains the component for generating and displaying AI-powered nutrition recommendations.
 * It interacts with a Supabase Edge Function to get personalized advice for the user.
 */

import React, { useState } from 'react';
/**
 * NutritionRecsPage
 * UI page that allows the user to request AI-generated nutrition recommendations.
 * Handles session retrieval and calls the /functions/generate-nutrition-recommendations
 * Edge Function with the user's access token.
 */
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Apple, Zap, Lightbulb } from 'lucide-react';
import './NutritionRecsPage.css';

/**
 * @typedef {object} Recommendation
 * @property {string} title - The title of the recommendation.
 * @property {string} reason - The reasoning behind the recommendation.
 * @property {string} action - The suggested action for the user to take.
 */

/**
 * @typedef {object} RecommendationsData
 * @property {string} analysis_summary - A summary of the AI's analysis of the user's data.
 * @property {Recommendation[]} recommendations - An array of specific recommendation objects.
 */

function NutritionRecsPage() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');

  const handleGenerateRecs = async () => {
    setLoading(true);
    setError('');
    setRecommendations(null);

    let session;
    try {
      const s = await supabase.auth.getSession();
      session = s?.data?.session;
    } catch (e) {
      console.warn('Failed to read session from supabase client', e);
    }

    if (!session || !session.access_token) {
      setError('You must be logged in to get recommendations.');
      setLoading(false);
      return;
    }

    try {
      // This page already uses the correct fetch method with the Authorization header.
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Configuration error: VITE_SUPABASE_URL is not set.');
      }
      const funcUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/generate-nutrition-recommendations`;

      const resp = await fetch(funcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`, // <-- This is correct
        },
        body: JSON.stringify({}),
      });

      const text = await resp.text();
      if (!resp.ok) {
        let detail = text;
        try {
          const parsed = JSON.parse(text);
          detail = parsed.error || JSON.stringify(parsed);
        } catch (e) { /* not JSON */ }
        throw new Error(`Edge function error ${resp.status}: ${detail}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Edge function returned invalid JSON');
      }

      setRecommendations(data);
    } catch (err) {
      console.error('Nutrition recommendations error:', err);
      setError(`Error: ${err.message || 'An unexpected error occurred.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nutrition-recs-container">
      <SubPageHeader
        title="Recommendations"
        icon={<Apple size={28} />}
        iconColor="#f97316"
        backTo="/nutrition"
      />
      <div className="nutrition-recs-scroll-area">
        <div className="recs-content">
          {!recommendations && !loading && (
            <div className="intro-view">
              <Zap size={48} className="intro-icon" />
              <h2>Personalized Insights</h2>
              <p>Get AI-powered recommendations based on your recent activity, logged meals, and goals.</p>
              <div className="pro-tip">
                <Lightbulb size={16} />
                <span>The more you log, the smarter your recommendations will become.</span>
              </div>
              <button onClick={handleGenerateRecs}>Generate My Recommendations</button>
            </div>
          )}
          {loading && <div className="loading-spinner"></div>}
          {error && <p className="error-message">{error}</p>}
          {recommendations && (
            <div className="results-view">
              <h3>Here's your analysis:</h3>
              <p className="summary">{recommendations.analysis_summary}</p>
              <div className="recommendations-list">
                {recommendations.recommendations.map((rec, index) => (
                  <div key={index} className="rec-card">
                    <h4>{rec.title}</h4>
                    <p className="reason"><strong>Why:</strong> {rec.reason}</p>
                    <p className="action"><strong>Action:</strong> {rec.action}</p>
                  </div>
                ))}
              </div>
              <button onClick={handleGenerateRecs} className="regenerate-button">
                Generate Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NutritionRecsPage;