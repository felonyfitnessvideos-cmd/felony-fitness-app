/**
 * @file NutritionPage.jsx
 * @description This file contains the main landing page for the Nutrition section of the application.
 * It provides navigation to sub-sections like Goals, Log, and Recommendations, and displays a daily nutrition tip.
 * @date 10/17/2025
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Apple, Lightbulb } from 'lucide-react';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { supabase } from '../supabaseClient.js';
import './NutritionPage.css';

/**
 * Renders the main nutrition page, which acts as a hub for nutrition-related features.
 * This component fetches and displays a random daily nutrition tip from the database upon loading.
 *
 * @returns {JSX.Element} The rendered nutrition page component, containing a header, navigation links, and a daily tip card.
 */
function NutritionPage() {
  /**
   * State to store the daily nutrition tip fetched from the database.
   * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
   */
  const [dailyTip, setDailyTip] = useState('');

  /**
   * An effect hook that fetches a random nutrition tip when the component mounts.
   * It calls a Supabase RPC function `get_random_tip`. On success, it updates the `dailyTip` state.
   * On failure, it logs the error and sets a default fallback message.
   */
  useEffect(() => {
    /**
     * Asynchronously fetches a random tip from the database.
     * This function calls the 'get_random_tip' remote procedure call in Supabase.
     */
    const fetchRandomTip = async () => {
      try {
        const { data, error } = await supabase.rpc('get_random_tip');
        if (error) throw error; // Propagate the error to the catch block.
        // RPCs sometimes return a single object or an array depending on
        // server-side implementation. Handle both shapes safely.
        if (!data) return;
        if (Array.isArray(data) && data.length > 0) {
          setDailyTip(data[0].tip_text);
        } else if (data.tip_text) {
          setDailyTip(data.tip_text);
        }
      } catch (error) {
        console.error('Error fetching random tip:', error);
        setDailyTip('Could not load a tip right now, but remember: consistency is key!');
      }
    };

    fetchRandomTip();
  }, []); // The empty dependency array ensures this effect runs only once after the initial render.

  return (
    <div className="nutrition-container">
      {/* SubPageHeader provides a consistent header for sub-pages. */}
      <SubPageHeader
        title="Nutrition"
        icon={<Apple size={28} />}
        iconColor="#f97316"
        backTo="/dashboard"
      />

      {/* A grid container for the navigation cards and the tip card. */}
      <div className="card-menu">
        {/* Navigation link to the nutrition goals page. */}
        <Link to="/nutrition/goals" className="menu-card">
          Goals
        </Link>
        {/* Navigation link to the nutrition logging page. */}
        <Link to="/nutrition/log" className="menu-card">
          Log
        </Link>
        {/* Navigation link to the nutrition recommendations page. */}
        <Link to="/nutrition/recommendations" className="menu-card">
          Recommendations
        </Link>
        {/* Navigation link to the weekly meal planner page. */}
        <Link to="/nutrition/meal-planner" className="menu-card">
          Meal Planner
        </Link>
        {/* Navigation link to the my meals page. */}
        <Link to="/nutrition/my-meals" className="menu-card">
          My Meals
        </Link>

        {/* Conditionally renders the daily tip card only if a tip has been successfully fetched. */}
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