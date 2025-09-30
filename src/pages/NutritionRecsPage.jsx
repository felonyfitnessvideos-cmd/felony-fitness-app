import React, { useState } from 'react';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
// --- Add Lightbulb icon to imports ---
import { Apple, Zap, Lightbulb } from 'lucide-react';
import './NutritionRecsPage.css';

function NutritionRecsPage() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState('');

  const handleGenerateRecs = async () => {
    // ... (this function is unchanged)
  };

  return (
    <div className="nutrition-recs-container">
      <SubPageHeader 
        title="Recommendations" 
        icon={<Apple size={28} />} 
        iconColor="#f97316" 
        backTo="/nutrition" 
      />

      <div className="recs-content">
        {!recommendations && !loading && (
          <div className="intro-view">
            <Zap size={48} className="intro-icon" />
            <h2>Personalized Insights</h2>
            <p>Get AI-powered recommendations based on your recent activity, logged meals, and goals.</p>
            
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
            {/* ... (results view is unchanged) ... */}
          </div>
        )}
      </div>
    </div>
  );
}

export default NutritionRecsPage;
