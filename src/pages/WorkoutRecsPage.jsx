/**
 * WorkoutRecsPage
 * Page to request AI-generated workout recommendations and view suggested routines.
 */
import React, { useState } from 'react';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Dumbbell, Zap, Lightbulb } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx'; 
import './WorkoutRecsPage.css';

/**
 * WorkoutRecsPage
 * Page that lets the user request AI workout recommendations and displays
 * the returned suggestions. Rendering logic defensively handles missing
 * or partial recommendation objects from the edge function.
 */
function WorkoutRecsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');

  const handleGenerateRecs = async () => {
    setLoading(true);
    setError('');
    setRecommendations(null);

    // Get the session to retrieve the auth token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session || !session.access_token) {
      setError("You must be logged in to get recommendations.");
      setLoading(false);
      return;
    }

    try {
      // Correctly call the function with the Authorization header
      const { data, error } = await supabase.functions.invoke(
        'generate-workout-recommendations', 
        { 
          body: {},
          headers: { 
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      if (error) throw error;
      
      setRecommendations(data);
    } catch (error) {
      setError(`Error: ${error?.message || 'An unknown error occurred.'}`);
    } finally {
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
        {!recommendations && !loading && (
          <div className="intro-view">
            <Zap size={48} className="intro-icon" />
            <h2>Personalized Insights</h2>
            <p>Get AI-powered recommendations based on your recent workouts, nutrition, and goals.</p>
            <div className="pro-tip">
              <Lightbulb size={16} />
              <span>The more you log, the smarter your recommendations will become.</span>
            </div>
            <button onClick={handleGenerateRecs} disabled={!user || loading}>Generate My Recommendations</button>
          </div>
        )}
        {loading && <div className="loading-spinner"></div>}
        {error && <p className="error-message">{error}</p>}
        {recommendations && (
          <div className="results-view">
            <h3>Here's your analysis:</h3>
            <p className="summary">{recommendations.analysis_summary}</p>
            <div className="recommendations-list">
              {(recommendations.recommendations || []).map((rec, index) => (
                <div key={rec?.id ?? index} className="rec-card">
                  <h4>{rec.title}</h4>
                  <p className="reason"><strong>Why:</strong> {rec.reason}</p>
                  <p className="action"><strong>Action:</strong> {rec.action}</p>
                </div>
              ))}
            </div>
            <button onClick={handleGenerateRecs} className="regenerate-button" disabled={loading}>
              Generate Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutRecsPage;