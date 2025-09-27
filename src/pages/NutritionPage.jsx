import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Apple, Lightbulb } from 'lucide-react';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { supabase } from '../supabaseClient.js';
import './NutritionPage.css';

function NutritionPage() {
  const [dailyTip, setDailyTip] = useState('');

  // UPDATED: This useEffect hook is now much simpler and more reliable.
  useEffect(() => {
    const fetchRandomTip = async () => {
      // Call the new database function we created
      const { data, error } = await supabase.rpc('get_random_tip');

      if (error) {
        console.error('Error fetching random tip:', error);
      } else if (data && data.length > 0) {
        // The function returns an array, so we take the first item
        setDailyTip(data[0].tip_text);
      }
    };

    fetchRandomTip();
  }, []); // The empty array ensures this runs only once when the page loads

  return (
    <div className="nutrition-container">
      <SubPageHeader 
        title="Nutrition" 
        icon={<Apple size={28} />} 
        iconColor="#f97316" 
        backTo="/dashboard" 
      />
      
      <div className="card-menu">
        <Link to="/nutrition/goals" className="menu-card">
          Goals
        </Link>
        <Link to="/nutrition/log" className="menu-card">
          Log
        </Link>
        <Link to="/nutrition/recommendations" className="menu-card">
          Recommendations
        </Link>

        {dailyTip && (
          <div className="tip-card">
            <div className="tip-card-header">
              <Lightbulb size={20} color="#fde68a" />
              <h3>Daily Tip</h3>
            </div>
            <p>{dailyTip}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NutritionPage;

