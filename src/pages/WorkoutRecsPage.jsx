// FILE: src/pages/WorkoutRecsPage.jsx

import React, { useState } from 'react';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
// --- Add Lightbulb icon to imports ---
import { Dumbbell, Zap, Lightbulb } from 'lucide-react';
import './WorkoutRecsPage.css';

function WorkoutRecsPage() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');

  const handleGenerateRecs = async () => {
    setLoading(true);
    setError('');
    setRecommendations(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to get recommendations.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.functions.invoke('generate-workout-recommendations', {
      body: { userId: user.id },
    });

    if (error) {
      setError(`Error: ${error.message}`);
    } else {
      setRecommendations(data);
    }
    setLoading(false);
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
            
            {/* --- START: Added Pro Tip Message --- */}
            <div className="pro-tip">
              <Lightbulb size={16} />
              <span>The more you log, the smarter your recommendations will become.</span>
            </div>
            {/* --- END: Added Pro Tip Message --- */}

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
  );
}

export default WorkoutRecsPage;