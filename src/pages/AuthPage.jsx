/**
 * AuthPage (doc): handles sign-in and sign-up flows for users.
 * Lightweight page that delegates auth logic to Supabase client and
 * surfaces friendly messages. No side-effects beyond auth redirects.
 */
 
/**
 * @file AuthPage.jsx
 * @description The main authentication page for the application. It handles both sign-in and sign-up for users.
 * @project Felony Fitness
 *
 * @workflow
 * 1.  **Session Check**: On component mount, it checks if an active session already exists. If so, it immediately redirects the user to the dashboard.
 * 2.  **State Toggle**: The component has two main modes: "Sign In" and "Sign Up", controlled by the `isSignUp` state. Users can toggle between these modes.
 * 3.  **Email Authentication**:
 * - A form captures the user's email and password.
 * - `handleEmailAuth` is called on submission.
 * - If in "Sign Up" mode, it calls `supabase.auth.signUp()`, which sends a confirmation email.
 * - If in "Sign In" mode, it calls `supabase.auth.signInWithPassword()` and redirects to the dashboard on success.
 * 4.  **Social Authentication (OAuth)**:
 * - Buttons are provided for social logins (e.g., Google, Microsoft).
 * - `handleSocialAuth` is called with the chosen provider.
 * - It calls `supabase.auth.signInWithOAuth()`, which redirects the user to the provider's authentication page and then back to the app.
 * 5.  **User Feedback**: The component uses state (`loading`, `message`) to provide feedback to the user, such as showing a loading state or displaying error/success messages.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { FaGoogle, FaMicrosoft, FaFacebook } from 'react-icons/fa';
import './AuthPage.css';

function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  /**
   * Effect to check for an existing user session. If a session is found,
   * it redirects the user to the main dashboard to prevent them from seeing
   * the login page again.
   */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  /**
   * Handles user authentication via email and password.
   * It performs either a sign-up or sign-in based on the `isSignUp` state.
   * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
   * @async
   */
  const handleEmailAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (isSignUp) {
        // Sign up a new user.
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Check your email for a confirmation link!");
      } else {
        // Sign in an existing user.
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles user authentication via third-party OAuth providers (e.g., Google).
   * @param {'google' | 'azure' | 'facebook'} provider - The name of the OAuth provider.
   * @async
   */
  const handleSocialAuth = async (provider) => {
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          // Redirect the user back to the app's home page after successful authentication.
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper"> 
      <div className="auth-container">
        <div className="auth-header">
          <img src="https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/sign/logo_banner/Felony%20Fitness%20Logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81M2NhYTc4NC1hZjEzLTQxZTAtYjljYS02Njk3NjRiZWVkODEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvX2Jhbm5lci9GZWxvbnkgRml0bmVzcyBMb2dvLnBuZyIsImlhdCI6MTc1ODgxNDU4MCwiZXhwIjoxOTE2NDk0NTgwfQ.TUTMDUtZpccUdwSp8NFTltJR1GHnEc6zO6j7iigwF1g" alt="Felony Fitness Logo" className="auth-logo" />
          <h1>Welcome to Felony Fitness</h1>
          <p className="subtitle">Sign {isSignUp ? 'up' : 'in'} to continue</p>
        </div>

        <div className="social-auth-options">
          <button onClick={() => handleSocialAuth('google')} disabled={loading}>
            <FaGoogle size={20} /> Continue with Google
          </button>
          <button onClick={() => handleSocialAuth('azure')} disabled={loading}>
            <FaMicrosoft size={20} /> Continue with Microsoft
          </button>
          <button onClick={() => alert("Facebook auth not configured.")} disabled={loading}>
            <FaFacebook size={20} /> Continue with Facebook
          </button>
        </div>

        <div className="divider"><span>OR</span></div>

        <form onSubmit={handleEmailAuth} className="email-auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              {!email && <Mail size={18} />}
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: email ? '1rem' : '2.8rem' }}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon password-input-wrapper">
              {!password && <Lock size={18} />}
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: password ? '1rem' : '2.8rem' }}
              />
              <button
                type="button"
                className="toggle-password-visibility"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {/* Live region for auth messages (always present) */}
          <div className="auth-message" role="status" aria-live="polite" aria-atomic="true">{message || ''}</div>
          <button type="submit" className="sign-in-button" disabled={loading}>
            {loading ? 'Loading...' : `Sign ${isSignUp ? 'up' : 'in'}`}
          </button>
        </form>

        <div className="auth-footer-links">
          <button onClick={() => alert('Password reset functionality not yet implemented.')} disabled={loading}>
            Forgot password?
          </button>
          <button onClick={() => setIsSignUp(!isSignUp)} disabled={loading}>
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>
      </div>
    </div> 
  );
}

export default AuthPage;

/** Audited: 2025-10-25 — JSDoc batch 9 */