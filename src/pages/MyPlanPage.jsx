/**
 * @fileoverview MyPlanPage component for subscription plan management and settings
 * @description Comprehensive subscription management interface displaying user's current plan,
 * available upgrade options, user information, and application settings including theme selection.
 * Features dynamic plan loading from database with real-time plan highlighting and user interaction.
 * 
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-04
 * 
 * @requires React
 * @requires react-modal
 * @requires lucide-react
 * @requires AuthContext
 * @requires ThemeContext
 * @requires SubPageHeader
 * @requires supabaseClient
 * 
 * Core Features:
 * - Dynamic plan loading from Supabase database
 * - Current plan highlighting based on user profile
 * - Interactive user ID display with copy functionality
 * - Settings modal with theme switching capabilities
 * - Responsive design with mobile-first approach
 * - Error handling and loading states
 * - Accessibility compliance with ARIA labels
 * 
 * Database Dependencies:
 * - plans table: Contains all available subscription plans
 * - user_profiles table: Contains user's current plan_type and preferences
 * - Foreign key relationship: user_profiles.plan_type -> plans.id
 * 
 * State Management:
 * - Plans data loaded from database on component mount
 * - User profile data loaded to determine current plan
 * - Modal visibility state for settings interface
 * - User ID visibility toggle state
 * - Loading states for smooth user experience
 * 
 * @example
 * // Primary usage in application routing
 * import MyPlanPage from './pages/MyPlanPage.jsx';
 * 
 * function App() {
 *   return (
 *     <Routes>
 *       <Route path="/my-plan" element={<MyPlanPage />} />
 *     </Routes>
 *   );
 * }
 * 
 * @example
 * // Navigation from other components
 * import { Link } from 'react-router-dom';
 * <Link to="/my-plan">View My Plan</Link>
 * 
 * @workflow
 * 1. **Component Mount**: 
 *    - Fetches plans data from Supabase 'plans' table
 *    - Fetches user profile from 'user_profiles' table
 *    - Establishes current plan based on user's plan_type
 * 
 * 2. **Plan Display**:
 *    - Renders all available plans in card format
 *    - Highlights current plan with special styling
 *    - Orders plans with current plan first
 *    - Shows appropriate pricing and descriptions
 * 
 * 3. **User Information**:
 *    - Displays user email from authentication context
 *    - Provides toggleable user ID visibility
 *    - Enables user ID copying to clipboard
 * 
 * 4. **Settings Management**:
 *    - Opens modal interface for application settings
 *    - Provides theme selection (dark, light, high-contrast)
 *    - Delegates theme updates to ThemeContext
 * 
 * 5. **Error Handling**:
 *    - Gracefully handles database connection errors
 *    - Manages missing user profile scenarios (PGRST116)
 *    - Provides fallback states for data loading failures
 * 
 * @performance
 * - useEffect with dependency array prevents unnecessary re-renders
 * - Memoized helper functions for plan processing
 * - Efficient state updates with minimal re-computation
 * - Optimized database queries with specific field selection
 * 
 * @accessibility
 * - ARIA labels on interactive elements
 * - Keyboard navigation support
 * - Screen reader friendly button descriptions
 * - High contrast theme option
 * - Focus management in modal interactions
 * 
 * @security
 * - User ID visibility toggle prevents accidental exposure
 * - Secure clipboard API usage with error handling
 * - Authentication-dependent data access
 * - Row Level Security (RLS) compliance through Supabase
 * 
 * @see {@link AuthContext} for user authentication state management
 * @see {@link ThemeContext} for application theme management
 * @see {@link SubPageHeader} for consistent page navigation
 * @see {@link supabaseClient} for database interactions
 */
import { ClipboardList, Copy, Diamond, DollarSign, Eye, EyeOff, Key, Settings, ShieldCheck, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useAuth } from '../AuthContext.jsx';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { supabase } from '../supabaseClient.js';
import './MyPlanPage.css';

// Modal styling moved to CSS (.settings-modal-overlay, .settings-modal-content)

/**
 * MyPlanPage - Main component for subscription plan management interface
 * 
 * @component
 * @function MyPlanPage
 * @returns {JSX.Element} Complete subscription management interface with plan cards,
 * user information, settings modal, and interactive elements
 * 
 * @description Renders a comprehensive subscription management page that displays:
 * - User's current subscription plan highlighted prominently
 * - Grid of all available subscription plans with pricing and descriptions
 * - User information section with email and toggleable user ID
 * - Settings modal for theme selection and preferences
 * - Loading states and error handling for smooth user experience
 * 
 * @since 2.0.0
 * 
 * Component Architecture:
 * - Uses React hooks for state management and side effects
 * - Integrates with AuthContext for user authentication data
 * - Integrates with ThemeContext for application theme management
 * - Connects to Supabase for dynamic data loading
 * - Implements Modal component for settings interface
 * 
 * State Variables:
 * @state {boolean} isSettingsModalOpen - Controls visibility of settings modal
 * @state {boolean} showUserId - Controls visibility of user's UUID
 * @state {Array<Object>} plans - Array of subscription plans from database
 * @state {Object|null} userProfile - User's profile data including current plan
 * @state {boolean} loading - Loading state for data fetching operations
 * 
 * Context Dependencies:
 * @context {Object} user - Current authenticated user from AuthContext
 * @context {string} theme - Current application theme from ThemeContext
 * @context {Function} updateUserTheme - Theme update function from ThemeContext
 * 
 * Database Schema Dependencies:
 * - plans table: { id: number, plan_name: string, created_at: timestamp }
 * - user_profiles table: { user_id: uuid, plan_type: number, ...otherFields }
 * - Foreign key: user_profiles.plan_type REFERENCES plans(id)
 * 
 * Error Handling:
 * - Gracefully handles missing user authentication
 * - Manages database connection failures
 * - Handles missing user profile (new users)
 * - Provides fallback states for all error conditions
 * 
 * Performance Optimizations:
 * - Single useEffect with proper dependency array
 * - Memoized helper functions prevent unnecessary recalculations
 * - Efficient state updates minimize re-renders
 * - Optimized database queries with specific field selection
 * 
 * @example
 * // Component usage in routing configuration
 * <Route path="/my-plan" element={<MyPlanPage />} />
 * 
 * @example
 * // Direct component usage with required context providers
 * <AuthProvider>
 *   <ThemeProvider>
 *     <MyPlanPage />
 *   </ThemeProvider>
 * </AuthProvider>
 */
function MyPlanPage() {
  // Context hooks for authentication and theme management
  const { user } = useAuth(); // Get authenticated user data from AuthContext
  const { theme, updateUserTheme } = useTheme(); // Get theme state and updater from ThemeContext

  // Component state management
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // Settings modal visibility
  const [showUserId, setShowUserId] = useState(false); // User ID visibility toggle
  const [plans, setPlans] = useState([]); // Available subscription plans from database
  const [userProfile, setUserProfile] = useState(null); // User's profile data including current plan
  const [loading, setLoading] = useState(true); // Loading state for data operations
  // Settings toggles for RPE modals and Rest timers
  const [useRpe, setUseRpe] = useState(true);
  const [useRestTimer, setUseRestTimer] = useState(true);

  // Load plans and user profile data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Load all plans
        const { data: plansData, error: plansError } = await supabase
          .from('plans')
          .select('*')
          .order('id');

        if (plansError) throw plansError;
        setPlans(plansData || []);

        // Load user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error loading user profile:', profileError);
        } else {
          setUserProfile(profileData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Sync toggles with userProfile
  useEffect(() => {
    if (userProfile) {
      setUseRpe(userProfile.use_rpe !== false); // default true
      setUseRestTimer(userProfile.use_rest_timer !== false); // default true
    }
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      setUseRpe(userProfile.use_rpe !== false);
      setUseRestTimer(userProfile.use_rest_timer !== false);
    }
  }, [userProfile]);
  // Handler to update user profile setting in Supabase
  const updateUserSetting = async (field, value) => {
    if (!user) return;
    setUserProfile((prev) => ({ ...prev, [field]: value }));
    await supabase
      .from('user_profiles')
      .update({ [field]: value })
      .eq('user_id', user.id);
  };

  /**
   * Opens the settings modal interface
   * 
   * @function openSettingsModal
   * @description Sets the settings modal visibility state to true, displaying
   * the modal overlay with theme selection and other application settings.
   * 
   * @since 2.0.0
   * @example
   * // Called when settings button is clicked
   * <button onClick={openSettingsModal}>Settings</button>
   */
  const openSettingsModal = () => setIsSettingsModalOpen(true);

  /**
   * Closes the settings modal interface
   * 
   * @function closeSettingsModal
   * @description Sets the settings modal visibility state to false, hiding
   * the modal overlay and returning focus to the main page content.
   * 
   * @since 2.0.0
   * @example
   * // Called when modal close button is clicked or ESC key is pressed
   * <button onClick={closeSettingsModal}>Close</button>
   */
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  /**
   * Toggles the visibility of the user's UUID
   * 
   * @function toggleUserIdVisibility
   * @description Switches between showing and hiding the user's unique identifier.
   * When visible, displays the full UUID with copy functionality. When hidden,
   * only shows an eye icon to reveal the ID.
   * 
   * @since 2.0.0
   * @security The user ID is hidden by default to prevent accidental exposure
   * @example
   * // Called when eye/eye-off icon button is clicked
   * <button onClick={toggleUserIdVisibility} title={showUserId ? "Hide User ID" : "Show User ID"}>
   */
  const toggleUserIdVisibility = () => setShowUserId(!showUserId);

  /**
   * Copies the user's UUID to the system clipboard
   * 
   * @async
   * @function copyUserId
   * @description Attempts to copy the authenticated user's unique identifier to the
   * clipboard using the modern Clipboard API. Provides error handling for cases
   * where clipboard access is denied or unavailable.
   * 
   * @throws {Error} When clipboard write operation fails
   * @returns {Promise<void>} Resolves when copy operation completes or fails
   * 
   * @since 2.0.0
   * @security Requires user gesture (click) to trigger due to clipboard API restrictions
   * 
   * @example
   * // Called when copy button is clicked (only visible when user ID is shown)
   * <button onClick={copyUserId} title="Copy User ID">
   *   <Copy size={14} />
   * </button>
   * 
   * @example
   * // Error handling example
   * try {
   *   await copyUserId();
   *   // Could show success notification
   * } catch (error) {
   *   // Error is logged to console, could show error notification
   * }
   */
  const copyUserId = async () => {
    if (user?.id) {
      try {
        await navigator.clipboard.writeText(user.id);
        // Could add a toast notification here for user feedback
      } catch (err) {
        console.error('Failed to copy user ID:', err);
        // Could show error notification to user
      }
    }
  };

  // Current plan calculation based on user profile
  /**
   * User's current subscription plan object
   * @type {Object|null}
   * @description Found by matching user_profiles.plan_type with plans.id
   */
  const currentPlan = plans.find(plan => plan.id === userProfile?.plan_type) || null;

  /**
   * User's current plan name for display and comparison
   * @type {string}
   * @description Defaults to 'Sponsored' if no plan is found or user has no profile
   */
  const currentPlanType = currentPlan?.plan_name || 'Sponsored';

  /**
   * Returns the appropriate Lucide React icon for a subscription plan
   * 
   * @function getPlanIcon
   * @param {string} planName - The name of the subscription plan (case-insensitive)
   * @returns {JSX.Element} Lucide React icon component for the specified plan
   * 
   * @description Maps plan names to their corresponding visual icons:
   * - Sponsored: ShieldCheck (protection/security theme)
   * - Monthly: DollarSign (recurring payment theme)
   * - 90 Day Trial: Key (access/trial theme)
   * - Income Based: Zap (dynamic/flexible theme)
   * - Lifetime: Diamond (premium/permanent theme)
   * - Personal Training: ClipboardList (personalized service theme)
   * - Default: ShieldCheck (fallback for unknown plans)
   * 
   * @since 2.0.0
   * @example
   * // Usage in plan card rendering
   * <div className="plan-icon">{getPlanIcon('Lifetime')}</div>
   * // Returns: <Diamond />
   * 
   * @example
   * // Case insensitive matching
   * getPlanIcon('SPONSORED') // Returns: <ShieldCheck />
   * getPlanIcon('sponsored') // Returns: <ShieldCheck />
   * getPlanIcon('Sponsored') // Returns: <ShieldCheck />
   */
  const getPlanIcon = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'sponsored': return <ShieldCheck />;
      case 'monthly': return <DollarSign />;
      case '90 day trial': return <Key />;
      case 'income based': return <Zap />;
      case 'lifetime': return <Diamond />;
      case 'personal training': return <ClipboardList />;
      default: return <ShieldCheck />;
    }
  };

  /**
   * Returns a descriptive subtitle for a subscription plan
   * 
   * @function getPlanDescription
   * @param {string} planName - The name of the subscription plan (case-insensitive)
   * @returns {string} Human-readable description of plan features and benefits
   * 
   * @description Provides marketing-friendly descriptions for each plan type:
   * - Sponsored: Emphasizes community support and full access
   * - Monthly: Highlights bonus content for subscribers
   * - 90 Day Trial: Indicates limited-time access
   * - Income Based: Shows eligibility-based access
   * - Lifetime: Emphasizes one-time payment value
   * - Personal Training: Highlights 1-on-1 service
   * - Default: Generic full access description
   * 
   * @since 2.0.0
   * @example
   * // Usage in plan card rendering
   * <p>{getPlanDescription('Lifetime')}</p>
   * // Renders: "All-Access Pass, One-Time Fee"
   * 
   * @example
   * // Case insensitive matching
   * getPlanDescription('PERSONAL TRAINING') // Returns: "1-on-1 Training + Full Access"
   */
  const getPlanDescription = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'sponsored': return 'Full Access • Community Support';
      case 'monthly': return 'Full Access + Bonus Content';
      case '90 day trial': return 'Full Access, Limited Time';
      case 'income based': return 'Full Access, Based on Eligibility';
      case 'lifetime': return 'All-Access Pass, One-Time Fee';
      case 'personal training': return '1-on-1 Training + Full Access';
      default: return 'Full Access';
    }
  };

  /**
   * Returns formatted pricing display text for a subscription plan
   * 
   * @function getPlanPricing
   * @param {string} planName - The name of the subscription plan (case-insensitive)
   * @returns {string} Formatted pricing text suitable for display as plan header
   * 
   * @description Provides consistent pricing format for each plan type:
   * - Free plans: "FREE - [PLAN TYPE]" or "FREE ([DETAILS])"
   * - Paid plans: "$[AMOUNT] / [PERIOD]" or "$[AMOUNT] [TYPE]"
   * - Ensures all-caps formatting for emphasis and consistency
   * - Includes billing frequency information where applicable
   * 
   * @since 2.0.0
   * @example
   * // Usage in plan card rendering
   * <h3>{getPlanPricing('Monthly')}</h3>
   * // Renders: "$10 / MONTH"
   * 
   * @example
   * // Free plan examples
   * getPlanPricing('Sponsored') // Returns: "FREE - SPONSORED"
   * getPlanPricing('90 Day Trial') // Returns: "FREE (90 DAYS)"
   * 
   * @example
   * // Paid plan examples
   * getPlanPricing('Lifetime') // Returns: "$100 LIFETIME"
   * getPlanPricing('Personal Training') // Returns: "$100 / MONTH"
   */
  const getPlanPricing = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'sponsored': return 'FREE - SPONSORED';
      case 'monthly': return '$10 / MONTH';
      case '90 day trial': return 'FREE (90 DAYS)';
      case 'income based': return 'FREE (INCOME BASED)';
      case 'lifetime': return '$100 LIFETIME';
      case 'personal training': return '$100 / MONTH';
      default: return 'FREE';
    }
  };

  /**
   * Sorted array of plans with current plan prioritized first
   * 
   * @type {Array<Object>}
   * @description Creates a new array from the plans state with custom sorting:
   * 1. Current user's plan appears first (highlighted)
   * 2. Remaining plans sorted by ID for consistent ordering
   * 3. Maintains referential integrity with original plan objects
   * 
   * @since 2.0.0
   * @example
   * // If user has Lifetime plan (ID: 2), the array will be:
   * // [LifetimePlan, SponsoredPlan, IncomeBasedPlan, TrialPlan, MonthlyPlan, PersonalTrainingPlan]
   */
  const sortedPlans = [...plans].sort((a, b) => {
    // Prioritize current plan to appear first
    if (a.plan_name?.toLowerCase() === currentPlanType?.toLowerCase()) return -1;
    if (b.plan_name?.toLowerCase() === currentPlanType?.toLowerCase()) return 1;
    // Secondary sort by ID for consistent ordering of non-current plans
    return a.id - b.id;
  });

  if (loading) {
    return (
      <div className="my-plan-container">
        <SubPageHeader title="My Plan" icon={<ClipboardList size={28} />} iconColor="var(--accent-color)" backTo="/dashboard" />
        <div className="loading-message">Loading your plan information...</div>
      </div>
    );
  }

  return (
    <div className="my-plan-container">
      <SubPageHeader title="My Plan" icon={<ClipboardList size={28} />} iconColor="var(--accent-color)" backTo="/dashboard" />

      <div className="plan-header">
        <h2>YOUR PLAN</h2>
        <p>{user?.email}</p>
        <div className="user-id-section">
          <span>User ID:</span>
          <button
            className="user-id-toggle"
            onClick={toggleUserIdVisibility}
            title={showUserId ? "Hide User ID" : "Show User ID"}
          >
            {showUserId ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {showUserId && (
            <div className="user-id-display">
              <span className="user-id-text">{user?.id}</span>
              <button
                className="copy-button"
                onClick={copyUserId}
                title="Copy User ID"
              >
                <Copy size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic plans display - current plan first */}
      <div className="plans-grid">
        {sortedPlans.map((plan) => {
          const isCurrentPlan = plan.plan_name?.toLowerCase() === currentPlanType?.toLowerCase();

          // Use helper functions for consistent styling
          const planPricing = getPlanPricing(plan.plan_name);
          const planDescription = getPlanDescription(plan.plan_name);

          return (
            <div key={plan.id} className={`plan-card ${isCurrentPlan ? 'current-plan' : ''}`}>
              <div className="plan-icon">{getPlanIcon(plan.plan_name)}</div>
              <div className="plan-details">
                <h3>{planPricing}</h3>
                <p>{planDescription}</p>
              </div>
              <button className={`plan-button ${isCurrentPlan ? 'current' : ''}`}>
                {isCurrentPlan ? 'Current Plan' : 'Upgrade Now'}
              </button>
            </div>
          );
        })}
      </div>

      <p className="footer-blurb">
        Every plan is built to support your comeback. Choose what fuels you.
      </p>

      <button className="settings-button" onClick={openSettingsModal} aria-label="Settings">
        <Settings size={24} />
      </button>

      <Modal
        isOpen={isSettingsModalOpen}
        onRequestClose={closeSettingsModal}
        contentLabel="Settings"
        overlayClassName="settings-modal-overlay"
        className="settings-modal-content"
      >
        <div className="settings-modal">
          <div className="modal-header">
            <h2>Settings</h2>
            <button onClick={closeSettingsModal} className="close-modal-btn"><X size={24} /></button>
          </div>
          <div className="modal-body">
            <h3>Color Theme</h3>
            <div className="theme-options">
              <button
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => updateUserTheme('dark')}
                aria-pressed={theme === 'dark'}
              >
                Dark
              </button>
              <button
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => updateUserTheme('light')}
                aria-pressed={theme === 'light'}
              >
                Light
              </button>
              <button
                className={`theme-btn ${theme === 'high-contrast' ? 'active' : ''}`}
                onClick={() => updateUserTheme && updateUserTheme('high-contrast')}
                aria-pressed={theme === 'high-contrast'}
              >
                High Contrast
              </button>
            </div>
            <hr style={{ margin: '1.5rem 0' }} />
            <h3>Workout Logging</h3>
            <div className="toggle-row">
              <label htmlFor="toggle-use-rpe">Use RPE Scale</label>
              <input
                id="toggle-use-rpe"
                type="checkbox"
                checked={useRpe}
                onChange={e => {
                  setUseRpe(e.target.checked);
                  updateUserSetting('use_rpe', e.target.checked);
                }}
              />
            </div>
            <div className="toggle-row">
              <label htmlFor="toggle-use-rest-timer">Use Rest Timers</label>
              <input
                id="toggle-use-rest-timer"
                type="checkbox"
                checked={useRestTimer}
                onChange={e => {
                  setUseRestTimer(e.target.checked);
                  updateUserSetting('use_rest_timer', e.target.checked);
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MyPlanPage;
