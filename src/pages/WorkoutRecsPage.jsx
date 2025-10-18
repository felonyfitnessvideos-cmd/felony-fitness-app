import React, { useState } from 'react';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Dumbbell, Zap, Lightbulb } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import './WorkoutRecsPage.css';

/**
 * @component WorkoutRecsPage
 * @description A page that provides AI-powered workout recommendations to the user.
 * It features four distinct states:
 * 1. Intro: Prompts the user to generate recommendations.
 * 2. Loading: Shows a spinner while fetching data from the AI.
 * 3. Results: Displays the analysis and recommendations returned by the AI.
 * 4. Error: Shows an error message if the process fails.
 * @returns {JSX.Element} The rendered component for the workout recommendations page.
 */
function WorkoutRecsPage() {
  /**
   * @state
   * @description Accesses the authenticated user's data from the global AuthContext.
   */
  const { user } = useAuth();
  
  /**
   * @state {boolean} loading - Manages the loading state while the AI is generating recommendations.
   */
  const [loading, setLoading] = useState(false);

  /**
   * @state {object | null} recommendations - Stores the AI-generated recommendations object once fetched.
   */
  const [recommendations, setRecommendations] = useState(null);

  /**
   * @state {string} error - Stores any error message that occurs during the fetch process.
   */
  const [error, setError] = useState('');

  /**
   * @function handleGenerateRecs
   * @description An asynchronous function that invokes the 'generate-workout-recommendations' Supabase Edge Function.
   * It handles setting the loading state, passing the user ID, processing the response, and catching any errors.
   */
  const handleGenerateRecs = async () => {
    // Reset state for a new request
    setLoading(true);
    setError('');
    setRecommendations(null);

    // Guard clause to ensure a user is logged in.
    if (!user) {
      setError("You must be logged in to get recommendations.");
      setLoading(false);
      return;
    }

    try {
      // Invoke the serverless function with the current user's ID.
      const { data, error } = await supabase.functions.invoke(
  'generate-workout-recommendations', 
  { body: {} }

);

      if (invokeError) throw invokeError;
      
      // On success, store the returned data in state.
      setRecommendations(data);
    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      // Ensure loading is turned off whether the request succeeds or fails.
      setLoading(false);
    }
  };

  return (
    <div className="workout-recs-container">
      <SubPageHeader 
        title="Recommendations" 
        icon={<Dumbbell size={28} />} 
        iconColor="#f97316" 
        backTo="/workouts" 
      />

      <div className="recs-content">
        {/* Initial view shown before any action is taken */}
        {!recommendations && !loading && (
          <div className="intro-view">
            <Zap size={48} className="intro-icon" />
            <h2>Personalized Insights</h2>
            <p>Get AI-powered recommendations based on your recent workouts, nutrition, and goals.</p>
            
            <div className="pro-tip">
              <Lightbulb size={16} />
              <span>The more you log, the smarter your recommendations will become.</span>
            </div>

            <button onClick={handleGenerateRecs} disabled={!user}>Generate My Recommendations</button>
          </div>
        )}

        {/* Loading spinner shown during the API call */}
        {loading && <div className="loading-spinner"></div>}

        {/* Error message display */}
        {error && <p className="error-message">{error}</p>}

        {/* Results view shown on successful data fetch */}
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
  );
}

export default WorkoutRecsPage;