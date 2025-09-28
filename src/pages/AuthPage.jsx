// FILE: src/pages/AuthPage.jsx

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  const handleEmailAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Check your email for a confirmation link!");
      } else {
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

  const handleSocialAuth = async (provider) => {
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          // It's better to configure this in the Supabase UI, but can be set here.
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
          {/* START CHANGE: Replaced the alert with the correct function call */}
          <button onClick={() => handleSocialAuth('azure')} disabled={loading}>
            <FaMicrosoft size={20} /> Continue with Microsoft
          </button>
          {/* END CHANGE */}
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
          {message && <p className="auth-message">{message}</p>}
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