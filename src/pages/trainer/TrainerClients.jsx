/**
 * @file TrainerClients.jsx
 * @description Comprehensive client management interface for trainers
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @project Felony Fitness
 * 
 * This component provides a streamlined client management system that serves as the foundation
 * for core trainer tools including scheduling, progress tracking, messaging, and program management.
 * 
 * Features:
 * - Real-time client search by name or email
 * - Comprehensive client cards with contact info, programs, and appointments
 * - Detailed client modal with full profile information
 * - Responsive design for all device sizes
 * - Progress tracking and payment status monitoring
 * 
 * @requires react
 * @requires lucide-react
 * @requires ./TrainerClients.css
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Phone, Mail, Calendar, Activity } from 'lucide-react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../AuthContext.jsx';
import { getTrainerClients } from '../../utils/userRoleUtils.js';
import './TrainerClients.css';

/**
 * TrainerClients Component
 * 
 * Main component for managing trainer's client list with search, filtering, and detailed view capabilities.
 * Provides a clean, professional interface for client management that serves as the foundation for
 * all core trainer tools.
 * 
 * @component
 * @returns {JSX.Element} The complete client management interface
 * 
 * @example
 * <TrainerClients />
 * 
 * State Management:
 * @state {Array} clients - Complete list of client objects with detailed information
 * @state {string} searchTerm - Current search query for filtering clients
 * @state {Object|null} selectedClient - Currently selected client for detailed view
 * @state {boolean} showClientModal - Controls visibility of client detail modal
 */
const TrainerClients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management for client data and UI
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load trainer's clients from database
   * 
   * Fetches all clients associated with the current trainer using the trainer-client relationship table.
   * Transforms database records into client objects with proper structure for UI display.
   * 
   * @async
   * @function loadClients
   * @returns {Promise<void>}
   */
  useEffect(() => {
    const loadClients = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const clientData = await getTrainerClients(user.id);
        console.log('🔍 Raw client data from database:', clientData);
        
        // Transform database records into display format
        const formattedClients = clientData.map(relationship => {
          const profile = relationship.client?.user_profiles || relationship.client;
          return {
            id: relationship.client_id,
            name: profile?.first_name && profile?.last_name 
              ? `${profile.first_name} ${profile.last_name}`
              : profile?.full_name || relationship.client?.email?.split('@')[0] || 'Unknown Client',
            email: relationship.client?.email || profile?.email || '',
            phone: profile?.phone || '(555) 000-0000',
            joinDate: relationship.created_at ? relationship.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            status: relationship.status || 'active',
            dateOfBirth: profile?.date_of_birth || null,
            fitnessGoals: profile?.fitness_goals || '',
            medicalConditions: profile?.medical_conditions || '',
            emergencyContact: profile?.emergency_contact_name || '',
            emergencyPhone: profile?.emergency_contact_phone || '',
            lastMessageAt: relationship.last_message_at
          };
        });
        
        console.log('✅ Formatted clients:', formattedClients);
        
        setClients(formattedClients);
      } catch (err) {
        console.error('Error loading clients:', err);
        setError('Failed to load clients. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, [user]);

  // Loading state
  if (loading) {
    return (
      <div className="trainer-clients">
        <div className="loading-container">
          Loading clients...
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="trainer-clients">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  /**
   * Filter clients based on search term
   * 
   * Filters the complete client list by matching search term against client name or email.
   * Search is case-insensitive and supports partial matches.
   * 
   * @type {Array} Filtered array of client objects matching search criteria
   */
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });



  // Main component render
  return (
    <div className="trainer-clients">
      {/* Search Bar Only */}
      <div className="search-section">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search clients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="clients-grid">
        {filteredClients.length === 0 ? (
          <div className="no-clients">
            <p>No clients found matching your search.</p>
            {clients.length === 0 && (
              <p>You haven't added any clients yet. Use the Client Onboarding tool to add new clients.</p>
            )}
          </div>
        ) : (
          filteredClients.map(client => (
            <div 
              key={client.id} 
              className="client-card"
            >
              <div className="client-header">
                <h3>{client.name}</h3>
                <button 
                  className="message-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to messages with this client
                    navigate(`/trainer-dashboard/messages?client=${client.id}`);
                  }}
                >
                  <Mail size={16} />
                  Message
                </button>
              </div>
              
              <div className="client-info">
                <div className="info-row">
                  <Mail size={16} />
                  <span>{client.email}</span>
                </div>
                <div className="info-row">
                  <Phone size={16} />
                  <span>{client.phone}</span>
                </div>
                <div className="info-row">
                  <Calendar size={16} />
                  <span>Joined: {client.joinDate}</span>
                </div>
                {client.fitnessGoals && (
                  <div className="info-row">
                    <Activity size={16} />
                    <span>Goals: {client.fitnessGoals}</span>
                  </div>
                )}
                {client.emergencyContact && (
                  <div className="info-row">
                    <span>Emergency: {client.emergencyContact} ({client.emergencyPhone})</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>


    </div>
  );
};

/**
 * Export TrainerClients component as default
 * 
 * This component serves as the foundation for trainer client management,
 * providing search, filtering, and detailed client views. It integrates
 * with other trainer tools for comprehensive client relationship management.
 * 
 * @exports TrainerClients
 */
export default TrainerClients;