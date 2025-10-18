/**
 * @file NutritionRecsPage.jsx
 * @description This file contains the component for generating and displaying AI-powered nutrition recommendations.
 * It interacts with a Supabase Edge Function to get personalized advice for the user.
 * @author [Your Name/Team Name]
 * @date 10/17/2025
 */

import React, { useState } from 'react';
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

/**
 * Renders the nutrition recommendations page.
 * This component allows users to generate personalized nutrition recommendations
 * based on their logged data by invoking a Supabase Edge Function. It handles
 * loading, error, and results states.
 *
 * @returns {JSX.Element} The rendered nutrition recommendations page.
 */
function NutritionRecsPage() {
  /**
   * State to manage the loading status while fetching recommendations.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [loading, setLoading] = useState(false);

  /**
   * State to store the fetched nutrition recommendations object.
   * @type {[RecommendationsData | null, React.Dispatch<React.SetStateAction<RecommendationsData | null>>]}
   */
  const [recommendations, setRecommendations] = useState(null);

  /**
   * State to store any error messages that occur during the fetch process.
   * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
   */
  const [error, setError] = useState('');

  /**
   * Handles the request to generate nutrition recommendations.
   * It sets loading states, retrieves the current user, invokes the Supabase Edge Function
   * 'generate-nutrition-recommendations', and updates the state with the results or an error message.
   * @async
   */
  const handleGenerateRecs = async () => {
    setLoading(true);
    setError('');
    setRecommendations(null);

    // Get the current authenticated user from Supabase.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to get recommendations.");
      setLoading(false);
      return;
    }

    try {
      // Invoke the serverless edge function, passing the user's ID.
      const { data, error } = await supabase.functions.invoke(
  'generate-nutrition-recommendations', 
  { body: {} }
);

      if (error) {
        // Throw an error to be caught by the catch block.
        throw error;
      }
      
      setRecommendations(data);
    } catch (err) {
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

      {/* A dedicated scrollable area for the page content. */}
      <div className="nutrition-recs-scroll-area">
        <div className="recs-content">
          {/* Initial view: Shown when there are no recommendations and not loading. */}
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

          {/* Loading state: Shows a spinner while fetching data. */}
          {loading && <div className="loading-spinner"></div>}

          {/* Error state: Displays an error message if the fetch fails. */}
          {error && <p className="error-message">{error}</p>}

          {/* Results view: Displays the analysis and recommendations once fetched. */}
          {recommendations && (
            <div className="results-view">
              <h3>Here's your analysis:</h3>
              <p className="summary">{recommendations.analysis_summary}</p>
              <div className="recommendations-list">
                {/* Maps over the recommendations array to display each one in a card. */}
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