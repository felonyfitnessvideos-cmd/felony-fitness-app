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
import DebugOverlay from '../components/DebugOverlay';
import useResponsive from '../hooks/useResponsive.jsx';
import TrainerCalendar from './trainer/TrainerCalendar.jsx';
import TrainerPrograms from './trainer/TrainerPrograms.jsx';
import TrainerClients from './trainer/TrainerClients.jsx';
import TrainerMessages from './trainer/TrainerMessages.jsx';
import ClientOnboarding from './trainer/ClientOnboarding.jsx';
import './TrainerDashboard.css';

/**
 * TrainerDashboard component for managing client progress and data
 * 
 * Provides comprehensive client management tools including progress tracking,
 * meal plan oversight, workout monitoring, and communication features.
 * Optimized for tablet and desktop viewing experiences.
 * 
 * @component
 * @returns {JSX.Element} Complete trainer dashboard interface
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
  const [activeWorkspaceTool, setActiveWorkspaceTool] = useState(null);

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
      // Only log in development
      if (import.meta.env?.DEV) {
        console.warn('TrainerDashboard - Error initializing:', error);
      }
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

    switch (activeWorkspaceTool) {
      case 'scheduling':
        return (
          <div className="scheduling-workspace">
            <div className="workspace-header">
              <Clock size={20} />
              <h4>Smart Scheduling Workspace</h4>
            </div>
            <div className="scheduling-tools">
              <div className="quick-appointments">
                <h5>Quick Appointments</h5>
                <div className="appointment-templates">
                  <div className="appointment-template" draggable>Personal Training - 60min</div>
                  <div className="appointment-template" draggable>Consultation - 30min</div>
                  <div className="appointment-template" draggable>Group Class - 45min</div>
                </div>
              </div>
              <div className="drag-zone">
                <p>Drag appointments onto calendar above or create new ones here</p>
                <button className="create-appointment-btn">+ New Appointment</button>
              </div>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="progress-workspace">
            <div className="workspace-header">
              <TrendingUp size={20} />
              <h4>Progress Tracking Workspace</h4>
            </div>
            <div className="progress-tools">
              <div className="metrics-panel">
                <h5>Client Metrics</h5>
                <div className="metric-cards">
                  <div className="metric-card">Weight Progress</div>
                  <div className="metric-card">Workout Consistency</div>
                  <div className="metric-card">Nutrition Adherence</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'workout':
        return (
          <div className="workout-workspace">
            <div className="workspace-header">
              <Dumbbell size={20} />
              <h4>Workout Builder Workspace</h4>
            </div>
            <div className="workout-tools">
              <div className="exercise-library">
                <h5>Exercise Library</h5>
                <div className="exercise-templates">
                  <div className="exercise-template" draggable>Push-up - 3x12</div>
                  <div className="exercise-template" draggable>Squat - 3x15</div>
                  <div className="exercise-template" draggable>Plank - 60s</div>
                </div>
              </div>
              <div className="program-builder">
                <h5>Drag & Drop to Client Programs</h5>
                <div className="drop-zone">Drop exercises here to build routines</div>
              </div>
            </div>
          </div>
        );

      case 'messaging':
        return (
          <div className="messaging-workspace">
            <div className="workspace-header">
              <MessageSquare size={20} />
              <h4>Group Messaging Hub</h4>
            </div>
            <div className="messaging-tools">
              <div className="message-templates">
                <h5>Class Announcements</h5>
                <div className="template-buttons">
                  <button className="template-btn">Class Reminder</button>
                  <button className="template-btn">Schedule Change</button>
                  <button className="template-btn">New Class Available</button>
                </div>
              </div>
              <div className="send-panel">
                <textarea placeholder="Compose group message..."></textarea>
                <button className="send-btn"><Send size={16} /> Send to All</button>
              </div>
            </div>
          </div>
        );

      case 'nutrition':
        return (
          <div className="nutrition-workspace">
            <div className="workspace-header">
              <ChefHat size={20} />
              <h4>Nutrition Planner Workspace</h4>
            </div>
            <div className="nutrition-tools">
              <div className="meal-templates">
                <h5>Meal Plan Templates</h5>
                <div className="meal-cards">
                  <div className="meal-card" draggable>High Protein Breakfast</div>
                  <div className="meal-card" draggable>Pre-Workout Snack</div>
                  <div className="meal-card" draggable>Post-Workout Meal</div>
                </div>
              </div>
              <div className="nutrition-assignment">
                <h5>Assign to Clients</h5>
                <div className="client-nutrition-zone">Drag meal plans to client profiles</div>
              </div>
            </div>
          </div>
        );

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
      <DebugOverlay />
      <header className="trainer-header">
        <button onClick={handleBackToDashboard} className="back-button">
          <ArrowLeft size={20} />
          <span>Back to Main Dashboard</span>
        </button>
        <div className="header-title-wrapper">
          <h1>Trainer Dashboard</h1>
          <p>Manage and track your clients' progress</p>
        </div>
        <div className="header-spacer"></div>
      </header>

      <div className="trainer-main-content">
        <div className="dashboard-layout">
          {/* Top Section - Sidebar + Content */}
          <div className="dashboard-top-section">
            {/* Left Sidebar - Quick Access Tools */}
            <aside className="quick-tools-sidebar">
              <button 
                type="button"
                className={`tool-item ${location.pathname === '/trainer-dashboard/calendar' ? 'active' : ''}`}
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
