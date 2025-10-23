/**
 * ThemeContext.jsx
 * Provides a simple ThemeContext with helpers to get and update the user's preferred theme.
 * The provider applies the theme to document root and persists the preference to the user's profile.
 */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // Default theme

  const applyTheme = (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
    setTheme(themeName);
  };

  // This function will be called to change and save the theme
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
