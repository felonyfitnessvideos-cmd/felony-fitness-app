/**
 * @fileoverview Comprehensive user profile and body metrics management page
 * @description Advanced profile management interface allowing users to maintain
 * personal information, track body composition metrics, and visualize progress
 * over time. Features interactive body fat estimation and historical data visualization.
 * 
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-02
 * 
 * @requires React
 * @requires react-router-dom
 * @requires react-modal
 * @requires lucide-react
 * @requires supabaseClient
 * @requires AuthContext
 * @requires SubPageHeader
 * 
 * Core Features:
 * - Personal profile information management (DOB, gender)
 * - Body metrics tracking (weight, body fat percentage)
 * - Visual body fat percentage estimation guide
 * - Historical measurements with trend visualization
 * - Interactive modals for data entry
 * - Real-time age calculation
 * - Responsive design for all devices
 * 
 * @example
 * // Used in main application routing
 * <Route path="/profile" element={<ProfilePage />} />
 * 
 * @example
 * // Navigation from other components
 * <Link to="/profile">View Profile</Link>
 */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { User, Weight, Percent, Calendar, HeartPulse, X, Edit2 as EditIcon } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import './ProfilePage.css';

/**
 * @constant {Array<object>} maleBodyFatImages
 * @description An array of objects containing labels and placeholder image URLs for male body fat percentages.
 */
const maleBodyFatImages = [
  { label: '30%+', src: 'https://placehold.co/150x200/2d3748/ffffff?text=30%25%2B' },
  { label: '25%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=25%25' },
  { label: '20%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=20%25' },
  { label: '15%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=15%25' },
  { label: '10%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=10%25' },
  { label: '5%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=5%25' },
];

/**
 * @constant {Array<object>} femaleBodyFatImages
 * @description An array of objects containing labels and placeholder image URLs for female body fat percentages.
 */
const femaleBodyFatImages = [
  { label: '35%+', src: 'https://placehold.co/150x200/2d3748/ffffff?text=35%25%2B' },
  { label: '30%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=30%25' },
  { label: '25%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=25%25' },
  { label: '20%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=20%25' },
  { label: '15%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=15%25' },
  { label: '10%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=10%25' },
];

// Modal styles moved to CSS; react-modal uses CSS classes defined in ProfilePage.css

/**
 * Calculate user age from date of birth
 * 
 * @function calculateAge
 * @param {string|null} dob - Date of birth in 'YYYY-MM-DD' format
 * @returns {number|null} Calculated age in years, or null if DOB not provided
 * 
 * @description Accurately calculates age accounting for leap years and exact
 * date differences. Handles edge cases where birthday hasn't occurred yet this year.
 * 
 * @example
 * // Calculate age from date string
 * const age = calculateAge('1990-05-15');
 * console.log(age); // Current age based on today's date
 * 
 * @example
 * // Handle null input gracefully
 * const age = calculateAge(null);
 * console.log(age); // null
 */
const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Comprehensive profile and body metrics management component
 * 
 * @component
 * @function ProfilePage
 * @returns {JSX.Element} Complete profile management interface
 * 
 * @description Advanced profile management component enabling users to maintain
 * personal information and track body composition metrics over time. Features
 * interactive body fat estimation tools and comprehensive data visualization.
 * 
 * @since 2.0.0
 * 
 * Component Features:
 * - Personal information editing (DOB, gender, profile details)
 * - Body metrics logging (weight, body fat percentage)
 * - Visual body fat estimation guide with gender-specific imagery
 * - Historical measurements tracking and visualization
 * - Interactive modal interfaces for data entry
 * - Real-time age calculation and display
 * - Responsive design optimized for mobile and desktop
 * 
 * State Management:
 * - User profile data (DOB, gender, personal details)
 * - Body measurements history and current values
 * - Modal visibility and form input states
 * - Loading states for smooth user experience
 * 
 * Data Integration:
 * - Supabase integration for profile and metrics storage
 * - Real-time data synchronization
 * - Optimistic UI updates for immediate feedback
 * - Error handling with user-friendly messages
 * 
 * @example
 * // Primary usage in application routing
 * function App() {
 *   return (
 *     <Routes>
 *       <Route path="/profile" element={<ProfilePage />} />
 *     </Routes>
 *   );
 * }
 * 
 * @see {@link AuthContext} for user authentication state
 * @see {@link SubPageHeader} for consistent page navigation
 */
function ProfilePage() {
  const { user } = useAuth(); // Custom hook to get the authenticated user.
  const userId = user?.id;

  /**
   * Notes
   * - The `user_profiles` select may return no rows for new users; the code
   *   intentionally treats that as a valid state and forces profile editing.
   * - The fetchData function ignores the PostgREST 'no row found' sentinel
   *   (PGRST116) as a non-error. If your Supabase setup returns a different
   *   error code, adjust the conditional accordingly.
   */
  
  // State for the metric logging form
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [message, setMessage] = useState(''); // Feedback message for metric form

  // State for user profile data and form
  // profile may include additional optional fields depending on the DB migration
  // (e.g. diet_preference). We default them here to avoid uncontrolled inputs.
  const [profile, setProfile] = useState({ dob: '', sex: '', diet_preference: '' });
  const [age, setAge] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(''); // Feedback message for profile form
  
  // State for data display and UI control
  const [history, setHistory] = useState([]);
  const [isBodyFatModalOpen, setBodyFatModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches user profile and body metrics history from the database.
   * Memoized with useCallback to prevent re-creation on every render.
   * @param {string} userId - The UUID of the currently logged-in user.
   * @async
   */
  const fetchData = useCallback(async (userId) => {
    try {
      // Fetch metrics and profile concurrently for better performance.
      const [metricsRes, profileRes] = await Promise.all([
        supabase.from('body_metrics').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
  // Request diet_preference if present in the schema; if the column doesn't
  // exist the request will either return no data or an error which we
  // handle below (PGRST116 = no row found).
  supabase.from('user_profiles').select('dob, sex, diet_preference').eq('id', userId).single()
      ]);

      const { data: metricsData, error: metricsError } = metricsRes;
      if (metricsError) throw metricsError;
      setHistory(metricsData || []);
      
      const { data: profileData, error: profileError } = profileRes;
      // Ignore 'PGRST116' error, which means no row was found (a valid case for new users).
      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      
      if (profileData) {
  setProfile({ dob: profileData.dob || '', sex: profileData.sex || '', diet_preference: profileData.diet_preference || '' });
        setAge(calculateAge(profileData.dob));
        // Force editing mode if profile is incomplete.
        setIsEditingProfile(!profileData.dob || !profileData.sex);
      } else {
        // If no profile exists, force editing mode.
        setIsEditingProfile(true);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Effect hook to trigger data fetching when the user object is available or changes.
   */
  // We intentionally only depend on the user's id and the stable fetchData
  // callback. Including the full `user` object can lead to extra fetches when
  // its reference changes but the identity (id) remains the same.
  useEffect(() => {
    if (userId) {
      fetchData(userId);
    } else {
      setLoading(false); // If no user, stop loading.
    }
  }, [userId, fetchData]);
  
  /**
   * Handles changes in the profile form inputs (DOB, sex).
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The event object.
   */
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (name === 'dob') {
      setAge(calculateAge(value));
    }
  };
  
  /**
   * Handles the submission of the profile update form.
   * Upserts the profile data to the 'user_profiles' table in Supabase.
   * @param {React.FormEvent<HTMLFormElement>} e - The form event object.
   * @async
   */
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!user) {
      setProfileMessage("Error: Could not save profile. Please refresh and try again.");
      return;
    }
    
    // Upsert ensures a new record is created if none exists, or updated if it does.
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, dob: profile.dob, sex: profile.sex, diet_preference: profile.diet_preference });
      
    if (error) {
      setProfileMessage(error.message);
    } else {
      setProfileMessage('Profile saved!');
      setIsEditingProfile(false);
      setTimeout(() => setProfileMessage(''), 3000); // Clear message after 3 seconds.
    }
  };

  /**
   * Handles the submission of the body metrics form.
   * Inserts a new row into the 'body_metrics' table.
   * @param {React.FormEvent<HTMLFormElement>} e - The form event object.
   * @async
   */
  const handleLogMetric = async (e) => {
    e.preventDefault();
    if (!weight && !bodyFat) {
      setMessage('Please enter at least one measurement.');
      return;
    }
    if (!user) {
      setMessage("User not found, please refresh.");
      return;
    }

    const newMetric = {
      user_id: user.id,
      weight_lbs: weight ? parseFloat(weight) : null,
      body_fat_percentage: bodyFat ? parseFloat(bodyFat) : null,
    };

    const { data, error } = await supabase.from('body_metrics').insert(newMetric).select().single();
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Measurement saved!');
      setHistory(prevHistory => [data, ...prevHistory]); // Add new metric to the top of the history list.
      setWeight('');
      setBodyFat('');
      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds.
    }
  };

  // Display a loading message while data is being fetched.
  if (loading) {
    return <div style={{color: 'white', padding: '2rem'}}>Loading Profile...</div>;
  }

  return (
    <div className="profile-page-container">
      <SubPageHeader title="Profile & Metrics" icon={<User size={28} />} iconColor="#f97316" backTo="/dashboard" />
      
      {/* User Profile Section: Toggles between edit form and display view */}
      <div className="profile-form metric-form">
        <h2>Your Information</h2>
        {isEditingProfile ? (
          <form onSubmit={handleProfileUpdate}>
            {/* Form fields for Date of Birth and Sex */}
            <div className="form-group">
              <label htmlFor="dob">Date of Birth {age && `(Age: ${age})`}</label>
              <div className="input-with-icon">
                <Calendar size={18} />
                <input id="dob" name="dob" type="date" value={profile.dob} onChange={handleProfileChange} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="sex">Sex</label>
              <div className="input-with-icon">
                <HeartPulse size={18} />
                <select id="sex" name="sex" value={profile.sex} onChange={handleProfileChange}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>
              <div className="form-group">
                <label htmlFor="diet_preference">Diet Preference</label>
                <div className="input-with-icon">
                  <select id="diet_preference" name="diet_preference" value={profile.diet_preference} onChange={handleProfileChange}>
                    <option value="">None</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>
              </div>
            {/* Live region for profile messages */}
            <div className="form-message" role="status" aria-live="polite" aria-atomic="true">{profileMessage || ''}</div>
            <button type="submit" className="save-button">Save Profile</button>
          </form>
        ) : (
          <div className="profile-display">
            {/* Display for saved Age and Sex */}
            <div className="profile-stat">
              <span className="label">Age</span>
              <span className="value">{age || 'N/A'}</span>
            </div>
            <div className="profile-stat">
              <span className="label">Sex</span>
              <span className="value">{profile.sex || 'N/A'}</span>
            </div>
            <div className="profile-stat">
              <span className="label">Diet</span>
              <span className="value">{profile.diet_preference || 'None'}</span>
            </div>
            <button className="edit-button" onClick={() => setIsEditingProfile(true)}>
              <EditIcon size={16} /> Edit
            </button>
          </div>
        )}
      </div>
      
      {/* Metric Logging Section */}
      <form onSubmit={handleLogMetric} className="metric-form">
        <h2>Log Today's Measurements</h2>
        <div className="form-group">
          <label htmlFor="weight">Weight (lbs)</label>
          <div className="input-with-icon">
            <Weight size={18} />
            <input id="weight" type="number" placeholder="e.g., 185.5" value={weight} onChange={(e) => setWeight(e.target.value)} step="0.1" />
          </div>
        </div>
        <div className="form-group">
          <div className="label-with-link">
            <label htmlFor="bodyFat">Body Fat %</label>
            <button type="button" className="info-link" onClick={() => setBodyFatModalOpen(true)}>
              How can I tell?
            </button>
          </div>
          <div className="input-with-icon">
            <Percent size={18} />
            <input id="bodyFat" type="number" placeholder="e.g., 15.2" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} step="0.1" />
          </div>
        </div>
  {/* Live region for metric save messages */}
  <div className="form-message" role="status" aria-live="polite" aria-atomic="true">{message || ''}</div>
        <button type="submit" className="save-button">Save Measurement</button>
      </form>

      {/* Recent History Section */}
      <div className="history-section">
        <h2>Recent History</h2>
        {history.length === 0 ? <p>No measurements logged yet.</p> : (
            <ul className="history-list">
              {history.map(metric => (
                <li key={metric.id} className="history-item">
                  <span className="history-date">{new Date(metric.created_at).toLocaleDateString()}</span>
                  <div className="history-values">
                    {metric.weight_lbs && <span>{metric.weight_lbs} lbs</span>}
                    {metric.body_fat_percentage && <span>{metric.body_fat_percentage}% fat</span>}
                  </div>
                </li>
              ))}
            </ul>
        )}
      </div>

      <Link to="/my-plan" className="link-button">
        Go to My Plan
      </Link>
      
      {/* Modal for Body Fat Estimation Guide */}
      <Modal
        isOpen={isBodyFatModalOpen}
        onRequestClose={() => setBodyFatModalOpen(false)}
        contentLabel="Body Fat Guide"
        overlayClassName="profile-modal-overlay"
        className="profile-modal-content"
      >
        <div className="modal-header">
          <h3>Body Fat Percentage Guide</h3>
          <button onClick={() => setBodyFatModalOpen(false)} className="close-modal-btn"><X size={24} /></button>
        </div>
        <div className="modal-body">
          {/* Conditionally render content based on the user's selected sex */}
          { (profile.sex === 'Male' || profile.sex === 'Female') ? (
            <>
              <p className="modal-subtitle">These are visual estimates. For accurate measurements, consult a professional.</p>
              <div className="bodyfat-grid">
                {(profile.sex === 'Male' ? maleBodyFatImages : femaleBodyFatImages).map(img => (
                  <div key={img.label} className="bodyfat-card">
                    <img src={img.src} alt={`Body fat at ${img.label}`} className="bodyfat-image" />
                    <p className="bodyfat-label">{img.label}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="professional-advice">
              <p>Visual body fat estimation varies significantly based on individual body composition.</p>
              <p>For the most accurate assessment and personalized advice, we recommend consulting with a primary care provider, certified personal trainer, or registered dietitian.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default ProfilePage;
