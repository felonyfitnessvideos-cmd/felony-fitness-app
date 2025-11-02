/**
 * @file TrainerDashboard.jsx
 * @description Advanced training tools dashboard for managing and tracking progress
 * @project Felony Fitness
 * 
 * This component provides users with advanced training tools including:
 * - Client management and progress tracking
 * - Workout program creation and management  
 * - Nutrition planning and monitoring
 * - Communication and scheduling tools
 * 
 * Available to all users as part of Felony Fitness's mission to provide
 * accessible fitness resources. Only accessible on tablet-sized screens 
 * and larger due to interface complexity.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  ArrowLeft,
  BarChart3,
  Dumbbell,
  Apple,
  Clock,
  UserPlus,
  Send,
  ChefHat
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import useResponsive from '../hooks/useResponsive.jsx';
import TrainerCalendar from './trainer/TrainerCalendar.jsx';
import TrainerPrograms from './trainer/TrainerPrograms.jsx';
import TrainerClients from './trainer/TrainerClients.jsx';
import TrainerMessages from './trainer/TrainerMessages.jsx';
import ClientOnboarding from './trainer/ClientOnboarding.jsx';
import SmartScheduling from '../components/SmartScheduling.jsx';
import './TrainerDashboard.css';

/**
 * TrainerDashboard component for managing client progress and data
 * 
 * 🚨 CRITICAL LAYOUT ARCHITECTURE - DO NOT MODIFY WITHOUT GOOD REASON
 * 
 * This component uses a carefully designed 70/30 flexbox split that works across
 * all tablet and desktop screen sizes. The layout has been extensively tested
 * and optimized for Android Chrome viewport reduction and various screen sizes.
 * 
 * LAYOUT STRUCTURE:
 * - trainer-main-content (flex: 1)
 *   - dashboard-layout (flex column with gap)
 *     - dashboard-top-section (flex: 0 0 70%) ← Main content area
 *     - core-tools-workspace (flex: 0 0 30%) ← Tools workspace
 * 
 * KEY PRINCIPLES:
 * - Uses flex-basis percentages, NOT viewport heights
 * - 70% for main content, 30% for tools workspace
 * - Dynamic sizing that scales with screen size
 * - Uniform tool card system prevents layout shifts
 * 
 * See TRAINER_DASHBOARD_LAYOUT.md for complete documentation
 * 
 * @component
 * @returns {JSX.Element} Complete trainer dashboard interface with 70/30 layout
 * 
 * @example
 * <TrainerDashboard />
 */
const TrainerDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isTabletOrLarger } = useResponsive();
  
  /** @type {[boolean, Function]} Loading state for trainer dashboard */
  const [isLoading, setIsLoading] = useState(true);
  
  /** @type {[string|null, Function]} Currently active workspace tool */
  const [activeWorkspaceTool, setActiveWorkspaceTool] = useState('scheduling');

  // Navigation functions for trainer sections
  const navigateToCalendar = () => navigate('/trainer-dashboard/calendar');
  const navigateToPrograms = () => navigate('/trainer-dashboard/programs');
  const navigateToClients = () => navigate('/trainer-dashboard/clients');
  const navigateToMessages = () => navigate('/trainer-dashboard/messages');
  const navigateToOnboarding = () => navigate('/trainer-dashboard/onboarding');

  /**
   * Initialize trainer dashboard
   * 
   * @async
   * @returns {Promise<void>}
   */
  // Trainer dashboard is available to all users on desktop/tablet devices

  const initializeDashboard = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      // Initialize any dashboard-wide data here
      // Add a small delay to prevent flash
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      // Error initializing dashboard - handled silently
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Return to main dashboard
   */
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Initialize dashboard on component mount
  useEffect(() => {
    // Always try to initialize, function handles user check internally
    initializeDashboard();
  }, [user, initializeDashboard]);

  // Redirect if not on tablet or larger screen (mobile users get standard dashboard)
  useEffect(() => {
    if (!isTabletOrLarger) {
      navigate('/dashboard');
    } else {
      // Force tablet/desktop styles when detected
      document.body.setAttribute('data-device-type', 'tablet-or-larger');
    }
  }, [navigate, isTabletOrLarger]);

  // Override root container styles for full-screen dashboard
  useEffect(() => {
    document.body.classList.add('trainer-dashboard-page');
    return () => {
      document.body.classList.remove('trainer-dashboard-page');
    };
  }, []);

  /**
   * Render workspace content based on active tool
   * 
   * 🚨 LAYOUT CRITICAL: Uses uniform card system to prevent layout shifts
   * 
   * All tools use the same renderToolCards() function to ensure:
   * - Consistent 2x2 grid layout (tool-cards-grid)
   * - Uniform card heights (70-90px each)
   * - Same content structure prevents workspace repositioning
   * - Maintains 30% workspace height allocation
   * 
   * DO NOT change to variable content without extensive testing.
   * Variable content heights cause the workspace to jump/shift.
   * 
   * @returns {JSX.Element} Uniform workspace content for selected tool
   */
  const renderWorkspaceContent = () => {
    if (!activeWorkspaceTool) {
      return (
        <div className="workspace-placeholder">
          <Calendar size={48} />
          <h3>Select a Core Tool</h3>
          <p>Choose a tool above to start working with appointments, programs, messages, or nutrition plans.</p>
        </div>
      );
    }

    // Common card structure for all tools to maintain consistent layout
    const renderToolCards = (toolName) => (
      <div className="workspace-content-uniform">
        <div className="tool-cards-grid">
          <div className="tool-card">
            <h5>Quick Actions</h5>
            <p>Commonly used {toolName.toLowerCase()} functions</p>
            <button className="card-action-btn">View All</button>
          </div>
          <div className="tool-card">
            <h5>Templates</h5>
            <p>Pre-built templates for faster workflow</p>
            <button className="card-action-btn">Browse</button>
          </div>
          <div className="tool-card">
            <h5>Recent Items</h5>
            <p>Your recently accessed {toolName.toLowerCase()} items</p>
            <button className="card-action-btn">View Recent</button>
          </div>
          <div className="tool-card">
            <h5>Analytics</h5>
            <p>{toolName} performance and insights</p>
            <button className="card-action-btn">View Stats</button>
          </div>
        </div>
      </div>
    );

    switch (activeWorkspaceTool) {
      case 'scheduling':
        return renderToolCards('Smart Scheduling');

      case 'progress':
        return renderToolCards('Progress Tracking');

      case 'workout':
        return renderToolCards('Workout Builder');

      case 'messaging':
        return renderToolCards('Messaging Hub');

      case 'nutrition':
        return renderToolCards('Nutrition Planner');

      default:
        return null;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading Trainer Dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="loading-container">
        <p>Please log in to access the Trainer Dashboard.</p>
        <button onClick={() => navigate('/')} className="primary-button">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="trainer-dashboard-container trainer-dashboard-page">
      <header className="trainer-header">
        <button onClick={handleBackToDashboard} className="back-button">
          <ArrowLeft size={20} />
          <span>Back to Main Dashboard</span>
        </button>
        <div className="header-title-wrapper">
          <h1>Trainer Dashboard</h1>
          <p>Manage and track your clients' progress</p>
        </div>
        <div className="header-logo">
          <button onClick={handleBackToDashboard} className="logo-button" aria-label="Go to main dashboard">
            <img src="/logo.png" alt="Felony Fitness" className="header-logo-img" />
          </button>
        </div>
      </header>

      <div className="trainer-main-content">
        <div className="dashboard-layout">
          {/* Top Section - Sidebar + Content */}
          <div className="dashboard-top-section">
            {/* Left Sidebar - Quick Access Tools */}
            <aside className="quick-tools-sidebar">
              <button 
                type="button"
                className={`tool-item ${(location.pathname === '/trainer-dashboard/calendar' || location.pathname === '/trainer-dashboard') ? 'active' : ''}`}
                onClick={navigateToCalendar}
                aria-label="Open Calendar"
              >
                <Calendar size={20} />
                <span>Calendar</span>
              </button>
              <button 
                type="button"
                className={`tool-item ${location.pathname === '/trainer-dashboard/programs' ? 'active' : ''}`}
                onClick={navigateToPrograms}
                aria-label="Open Programs"
              >
                <BarChart3 size={20} />
                <span>Programs</span>
              </button>
              <button 
                type="button"
                className={`tool-item ${location.pathname === '/trainer-dashboard/clients' ? 'active' : ''}`}
                onClick={navigateToClients}
                aria-label="Open Clients"
              >
                <Users size={20} />
                <span>Clients</span>
              </button>
              <button 
                type="button"
                className={`tool-item ${location.pathname === '/trainer-dashboard/messages' ? 'active' : ''}`}
                onClick={navigateToMessages}
                aria-label="Open Messages"
              >
                <MessageSquare size={20} />
                <span>Messages</span>
              </button>
              <button 
                type="button"
                className={`tool-item onboarding-btn ${location.pathname === '/trainer-dashboard/onboarding' ? 'active' : ''}`}
                onClick={navigateToOnboarding}
                aria-label="Add New Client"
              >
                <UserPlus size={20} />
                <span>New Client</span>
              </button>
            </aside>

            {/* Right Content Container */}
            <div className="content-container">
              {/* Main Content - Router Views */}
              <main className="router-content-area">
                <Routes>
                  <Route path="/" element={<TrainerCalendar />} />
                  <Route path="/calendar" element={<TrainerCalendar />} />
                  <Route path="/programs" element={<TrainerPrograms />} />
                  <Route path="/clients" element={<TrainerClients />} />
                  <Route path="/messages" element={<TrainerMessages />} />
                  <Route path="/onboarding" element={<ClientOnboarding />} />
                </Routes>
              </main>
            </div>
          </div>

          <div className="core-tools-workspace">
            <div className="tools-selector">
              <button 
                type="button"
                className={`workspace-tool ${activeWorkspaceTool === 'scheduling' ? 'active' : ''}`} 
                onClick={() => setActiveWorkspaceTool('scheduling')}
                aria-pressed={activeWorkspaceTool === 'scheduling'}
                aria-label="Smart Scheduling Tool"
              >
                <Calendar size={16} />
                <span>Smart Scheduling</span>
              </button>
              <button 
                type="button"
                className={`workspace-tool ${activeWorkspaceTool === 'progress' ? 'active' : ''}`} 
                onClick={() => setActiveWorkspaceTool('progress')}
                aria-pressed={activeWorkspaceTool === 'progress'}
                aria-label="Progress Tracker Tool"
              >
                <TrendingUp size={16} />
                <span>Progress Tracker</span>
              </button>
              <button 
                type="button"
                className={`workspace-tool ${activeWorkspaceTool === 'workout' ? 'active' : ''}`} 
                onClick={() => setActiveWorkspaceTool('workout')}
                aria-pressed={activeWorkspaceTool === 'workout'}
                aria-label="Workout Builder Tool"
              >
                <Dumbbell size={16} />
                <span>Workout Builder</span>
              </button>
              <button 
                type="button"
                className={`workspace-tool ${activeWorkspaceTool === 'messaging' ? 'active' : ''}`} 
                onClick={() => setActiveWorkspaceTool('messaging')}
                aria-pressed={activeWorkspaceTool === 'messaging'}
                aria-label="Messaging Hub Tool"
              >
                <MessageSquare size={16} />
                <span>Messaging Hub</span>
              </button>
              <button 
                type="button"
                className={`workspace-tool ${activeWorkspaceTool === 'nutrition' ? 'active' : ''}`} 
                onClick={() => setActiveWorkspaceTool('nutrition')}
                aria-pressed={activeWorkspaceTool === 'nutrition'}
                aria-label="Nutrition Planner Tool"
              >
                <Apple size={16} />
                <span>Nutrition Planner</span>
              </button>
            </div>
            <div className="workspace-content">
              {renderWorkspaceContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrainerDashboard;
