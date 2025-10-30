/**
 * @file TrainerDashboard.jsx
 * @description Trainer dashboard for managing and tracking client progress
 * @project Felony Fitness
 * 
 * This component provides trainers with tools to:
 * - View and manage client list
 * - Track client progress across nutrition and workout metrics
 * - Access client meal plans and workout routines
 * - Monitor client adherence and provide feedback
 * 
 * @note Only accessible on tablet-sized screens and larger
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Search, 
  Filter, 
  ArrowLeft,
  BarChart3,
  User,
  Target,
  Activity,
  X,
  Dumbbell,
  Apple
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import useResponsive from '../hooks/useResponsive.jsx';
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
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { isTabletOrLarger, deviceType, width } = useResponsive();
  
  /** @type {[Array, Function]} List of clients assigned to the trainer */
  const [clients, setClients] = useState([]);
  
  /** @type {[Object|null, Function]} Currently selected client for detailed view */
  const [selectedClient, setSelectedClient] = useState(null);
  
  /** @type {[boolean, Function]} Loading state for client data */
  const [isLoading, setIsLoading] = useState(true);
  
  /** @type {[string, Function]} Search term for filtering clients */
  const [searchTerm, setSearchTerm] = useState('');
  
  /** @type {[string, Function]} Current filter for client status */
  const [statusFilter, setStatusFilter] = useState('all');
  
  /** @type {[Object, Function]} Client progress data and metrics */
  const [clientMetrics, setClientMetrics] = useState({});

  /**
   * Load all clients assigned to the current trainer
   * 
   * Fetches client list with basic profile information and recent activity.
   * Includes error handling for network issues and missing data.
   * 
   * @async
   * @returns {Promise<void>}
   */
  const loadClients = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll create mock client data
      // In a real implementation, this would query actual trainer-client relationships
      const mockClients = [
        {
          id: '1',
          name: 'John Dough',
          email: 'john.dough@example.com',
          joinDate: '2024-01-15T00:00:00Z',
          status: 'active',
          goals: { daily_calorie_goal: 2000, daily_protein_goal: 150 },
          lastActive: '2024-10-28T10:30:00Z'
        },
        {
          id: '2',
          name: 'Sarah Rigplier',
          email: 'sarah.rigplier@example.com',
          joinDate: '2024-02-20T00:00:00Z',
          status: 'active',
          goals: { daily_calorie_goal: 1800, daily_protein_goal: 120 },
          lastActive: '2024-10-27T14:15:00Z'
        },
        {
          id: '3',
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          joinDate: '2024-03-10T00:00:00Z',
          status: 'active',
          goals: { daily_calorie_goal: 1900, daily_protein_goal: 130 },
          lastActive: '2024-10-26T08:45:00Z'
        },
        {
          id: '4', 
          name: 'Mary Hand',
          email: 'mary.hand@example.com',
          joinDate: '2024-04-05T00:00:00Z',
          status: 'active',
          goals: { daily_calorie_goal: 2100, daily_protein_goal: 140 },
          lastActive: '2024-10-25T16:20:00Z'
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setClients(mockClients);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('TrainerDashboard - Error loading clients:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Load detailed metrics for a specific client
   * 
   * @async
   * @param {string} clientId - ID of the client to load metrics for
   * @returns {Promise<void>}
   */
  const loadClientMetrics = useCallback(async (clientId) => {
    if (!clientId) return;
    
    try {
      // In a real implementation, this would load client's recent nutrition and workout data
      setClientMetrics({
        nutrition: [],
        workouts: [],
        weeklyStats: {
          nutritionLogs: 0,
          workoutSessions: 0,
          avgCalories: 0,
          consistency: 0
        }
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('TrainerDashboard - Error loading client metrics:', error);
      }
    }
  }, []);

  /**
   * Filter clients based on search term and status
   * 
   * @returns {Array} Filtered list of clients
   */
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /**
   * Handle client selection for detailed view
   * 
   * @param {Object} client - Client object to select
   */
  const handleClientSelect = (client) => {
    setSelectedClient(client);
    loadClientMetrics(client.id);
  };

  /**
   * Return to main dashboard
   */
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Load clients on component mount
  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user, loadClients]);

  // Redirect if not on tablet or larger screen
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
          <span>Back to Dashboard</span>
        </button>
        <div className="header-title-wrapper">
          <h1>Trainer Dashboard</h1>
          <p>Manage and track your clients' progress</p>
        </div>
        <div className="header-spacer"></div>
      </header>

      <div className="trainer-main-content">
        <div className="dashboard-layout">
          {/* Left Sidebar - Quick Access Tools */}
          <aside className="quick-tools-sidebar">
            <div className="tool-item">
              <Calendar size={20} />
              <span>Calendar</span>
            </div>
            <div className="tool-item">
              <BarChart3 size={20} />
              <span>Programs</span>
            </div>
            <div className="tool-item">
              <Users size={20} />
              <span>Clients</span>
            </div>
            <div className="tool-item">
              <MessageSquare size={20} />
              <span>Messages</span>
            </div>
          </aside>

          {/* Center - Clients Section */}
          <section className="clients-main-section">
            <div className="section-header">
              <h2><Users size={24} />My Clients</h2>
              <div className="client-controls">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="status-filter"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Client Cards - Column Layout */}
            <div className="clients-column">
              {filteredClients.map(client => (
                <div
                  key={client.id}
                  className="client-card"
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="client-avatar">
                    <User size={32} />
                  </div>
                  <div className="client-info">
                    <h3>{client.name}</h3>
                    <p className="client-email">{client.email}</p>
                    <p className="client-status">
                      <span className={`status-indicator ${client.status}`}></span>
                      {client.status}
                    </p>
                  </div>
                  <button className="view-client-btn">View</button>
                </div>
              ))}
            </div>

            {filteredClients.length === 0 && (
              <div className="empty-state">
                <Users size={48} />
                <h3>No clients found</h3>
                <p>
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No clients are currently assigned to you.'}
                </p>
              </div>
            )}
          </section>

          {/* Right Sidebar - Core Tools */}
          <aside className="core-tools-sidebar">
            <div className="core-tools">
              <h3>Core Tools</h3>
              <div className="tools-grid">
                <div className="tool-placeholder">
                  <Calendar size={18} />
                  <div>
                    <h4>Smart Scheduling</h4>
                    <p>Calendar with session reminders</p>
                  </div>
                </div>
                <div className="tool-placeholder">
                  <TrendingUp size={18} />
                  <div>
                    <h4>Progress Tracker</h4>
                    <p>Visual charts for metrics</p>
                  </div>
                </div>
                <div className="tool-placeholder">
                  <Dumbbell size={18} />
                  <div>
                    <h4>Workout Builder</h4>
                    <p>Modular training templates</p>
                  </div>
                </div>
                <div className="tool-placeholder">
                  <Apple size={18} />
                  <div>
                    <h4>Nutrition Planner</h4>
                    <p>Meal tracking & macros</p>
                  </div>
                </div>
                <div className="tool-placeholder">
                  <MessageSquare size={18} />
                  <div>
                    <h4>Messaging Hub</h4>
                    <p>Secure client chat</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Selected Client Detail Modal/Overlay */}
        {selectedClient && (
          <div className="client-detail-overlay">
            <div className="client-detail-modal">
              <div className="detail-header">
                <h2>{selectedClient.name} - Client Details</h2>
                <button 
                  className="close-detail-btn"
                  onClick={() => setSelectedClient(null)}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="client-detail-grid">
                <div className="detail-card">
                  <h3><Target size={20} />Goals</h3>
                  <div className="goals-list">
                    <p>Daily Calories: {selectedClient.goals?.daily_calorie_goal || 'Not set'}</p>
                    <p>Daily Protein: {selectedClient.goals?.daily_protein_goal || 'Not set'}g</p>
                  </div>
                </div>
                
                <div className="detail-card">
                  <h3><Activity size={20} />Recent Activity</h3>
                  <p>Last Active: {new Date(selectedClient.lastActive).toLocaleDateString()}</p>
                </div>
                
                <div className="detail-card">
                  <h3><Calendar size={20} />Schedule</h3>
                  <p>Next Session: Coming soon...</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrainerDashboard;