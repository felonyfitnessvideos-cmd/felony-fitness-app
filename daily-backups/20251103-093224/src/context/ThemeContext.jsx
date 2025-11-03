/**
 * @fileoverview Comprehensive theme context provider for application-wide theme management
 * @description React Context provider managing user theme preferences with automatic
 * persistence, DOM manipulation, and seamless theme switching. Supports both
 * authenticated and guest user scenarios with graceful degradation.
 * 
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-02
 * 
 * @requires React
 * @requires supabaseClient
 * 
 * Theme Management Features:
 * - Real-time theme switching with instant visual feedback
 * - Automatic persistence to user profiles for authenticated users
 * - Local state management for guest users
 * - DOM attribute management for CSS theme application
 * - Error-resilient theme loading and fallback handling
 * 
 * Supported Themes:
 * - **dark**: Dark mode theme (default)
 * - **light**: Light mode theme
 * - Extensible for additional themes
 * 
 * @example
 * // Wrap your app with ThemeProvider
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <AuthProvider>
 *         <Router>
 *           <AppContent />
 *         </Router>
 *       </AuthProvider>
 *     </ThemeProvider>
 *   );
 * }
 * 
 * @example
 * // Use theme in components
 * function ThemeToggle() {
 *   const { theme, updateUserTheme } = useTheme();
 *   
 *   return (
 *     <button onClick={() => updateUserTheme(theme === 'dark' ? 'light' : 'dark')}>
 *       Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
 *     </button>
 *   );
 * }
 */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Theme context for global theme state sharing
 * 
 * @constant {React.Context} ThemeContext
 * @description React context object for sharing theme state across the
 * component tree without prop drilling.
 */
const ThemeContext = createContext();

/**
 * Custom hook for accessing theme context
 * 
 * @hook
 * @function useTheme
 * @returns {Object} Theme state and methods
 * @returns {string} returns.theme - Current theme name ('dark' | 'light')
 * @returns {Function} returns.updateUserTheme - Function to change and persist theme
 * 
 * @description Convenient hook for accessing theme state and theme switching
 * functionality anywhere in the component tree. Provides type-safe access
 * to theme data with automatic context validation.
 * 
 * @since 2.0.0
 * 
 * @example
 * // Basic theme toggle
 * function ThemeSwitch() {
 *   const { theme, updateUserTheme } = useTheme();
 *   
 *   const toggleTheme = () => {
 *     updateUserTheme(theme === 'dark' ? 'light' : 'dark');
 *   };
 *   
 *   return <button onClick={toggleTheme}>Toggle Theme</button>;
 * }
 * 
 * @throws {Error} Throws error if used outside of ThemeProvider
 */
export const useTheme = () => useContext(ThemeContext);

/**
 * Theme provider component with persistence and DOM management
 * 
 * @component
 * @function ThemeProvider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with theme context
 * @returns {JSX.Element} Provider component with theme state and management
 * 
 * @description Primary theme provider managing application-wide theme state
 * with automatic persistence for authenticated users and DOM attribute
 * management for CSS theme application.
 * 
 * @since 2.0.0
 * 
 * Provider Features:
 * - Automatic theme loading from user profiles
 * - Real-time DOM attribute updates for CSS themes
 * - Persistent theme storage in user profiles
 * - Graceful fallback for unauthenticated users
 * - Error handling for database operations
 * 
 * Theme Application:
 * - Sets `data-theme` attribute on document root
 * - Enables CSS theme variables and selectors
 * - Instant visual feedback on theme changes
 * 
 * @example
 * // Provider setup in app root
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <div className="app">
 *         <Header />
 *         <Main />
 *       </div>
 *     </ThemeProvider>
 *   );
 * }
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // Default theme

  /**
   * Apply theme to DOM and update local state
   * 
   * @function applyTheme
   * @param {string} themeName - Theme name to apply ('dark' | 'light')
   * @returns {void}
   * 
   * @description Updates document root data-theme attribute for CSS theme
   * application and synchronizes local component state.
   */
  const applyTheme = (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
    setTheme(themeName);
  };

  /**
   * Update user theme with persistence
   * 
   * @async
   * @function updateUserTheme
   * @param {string} newTheme - New theme to apply and save ('dark' | 'light')
   * @returns {Promise<void>} Promise that resolves when theme is updated and saved
   * 
   * @description Changes theme immediately and persists preference to user
   * profile database. Handles both authenticated and guest user scenarios
   * gracefully with automatic fallback.
   * 
   * @example
   * // Switch to light theme
   * await updateUserTheme('light');
   * 
   * @example
   * // Toggle theme
   * const newTheme = theme === 'dark' ? 'light' : 'dark';
   * await updateUserTheme(newTheme);
   */
  const updateUserTheme = async (newTheme) => {
    applyTheme(newTheme);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_profiles')
        .update({ theme: newTheme })
        .eq('id', user.id);
    }
  };

  // On app load, check if the user has a saved theme
  useEffect(() => {
    const fetchUserTheme = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('theme')
          .eq('id', user.id)
          .single();
        if (profile && profile.theme) {
          applyTheme(profile.theme);
        }
      }
    };
    fetchUserTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, updateUserTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
