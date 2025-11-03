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
import { Search, Phone, Mail, Calendar, DollarSign, Activity } from 'lucide-react';
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
  
  // State management for client data and UI
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
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
        
        // Transform database records into display format
        const formattedClients = clientData.map(relationship => ({
          id: relationship.client_id,
          name: relationship.clients?.first_name && relationship.clients?.last_name 
            ? `${relationship.clients.first_name} ${relationship.clients.last_name}`
            : relationship.clients?.email || 'Unknown Client',
          email: relationship.clients?.email || '',
          phone: '(555) 000-0000', // Placeholder
          joinDate: relationship.created_at.split('T')[0],
          status: relationship.relationship_status,
          nextAppointment: null,
          monthlyRate: 0,
          lastPayment: null,
          paymentStatus: 'current',
          totalSessions: 0,
          completedSessions: 0,
          currentProgram: null,
          goals: [],
          emergencyContact: '',
          medicalNotes: ''
        }));
        
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

  /**
   * Handle client selection for detailed view
   * 
   * Opens the client detail modal with complete client information including
   * contact details, program status, payment history, and medical notes.
   * 
   * @param {Object} client - Client object containing all client information
   * @returns {void}
   */
  const handleClientClick = (client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  /**
   * Close client detail modal
   * 
   * Resets selected client state and hides the detailed view modal.
   * 
   * @returns {void}
   */
  const closeModal = () => {
    setSelectedClient(null);
    setShowClientModal(false);
  };

  /**
   * Get status indicator color based on client status
   * 
   * Returns appropriate CSS class for client status visualization.
   * 
   * @param {string} status - Client status ('active', 'inactive', 'pending')
   * @returns {string} CSS class name for status styling
   * 
   * @example
   * getStatusColor('active') // returns 'status-active'
   * getStatusColor('inactive') // returns 'status-inactive'
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'pending': return 'status-pending';
      default: return 'status-unknown';
    }
  };

  /**
   * Get payment status indicator color
   * 
   * Returns appropriate CSS class for payment status visualization.
   * 
   * @param {string} status - Payment status ('current', 'overdue', 'suspended')
   * @returns {string} CSS class name for payment status styling
   * 
   * @example
   * getPaymentStatusColor('current') // returns 'payment-current'
   * getPaymentStatusColor('overdue') // returns 'payment-overdue'
   */
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'current': return 'payment-current';
      case 'overdue': return 'payment-overdue';
      case 'suspended': return 'payment-suspended';
      default: return 'payment-unknown';
    }
  };

  // Main component render
  return (
    <div className="trainer-clients">
      {/* Header Section */}
      <div className="clients-header">
        <h1>My Clients</h1>
        <p>Manage your client relationships, track progress, and schedule sessions</p>
      </div>

      {/* Search Bar */}
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

      {/* Client Statistics */}
      <div className="client-stats">
        <div className="stat-card">
          <h3>{clients.filter(c => c.status === 'active').length}</h3>
          <p>Active Clients</p>
        </div>
        <div className="stat-card">
          <h3>{clients.length}</h3>
          <p>Total Clients</p>
        </div>
        <div className="stat-card">
          <h3>{clients.filter(c => c.status === 'pending').length}</h3>
          <p>Pending</p>
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
              onClick={() => handleClientClick(client)}
            >
              <div className="client-header">
                <h3>{client.name}</h3>
                <span className={`status-badge ${getStatusColor(client.status)}`}>
                  {client.status}
                </span>
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
              </div>

              {client.currentProgram && (
                <div className="current-program">
                  <Activity size={16} />
                  <span>{client.currentProgram}</span>
                </div>
              )}

              <div className="client-footer">
                <div className="payment-status">
                  <DollarSign size={16} />
                  <span className={getPaymentStatusColor(client.paymentStatus)}>
                    {client.paymentStatus}
                  </span>
                </div>
                {client.nextAppointment && (
                  <div className="next-appointment">
                    <Calendar size={16} />
                    <span>{client.nextAppointment}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Client Detail Modal */}
      {showClientModal && selectedClient && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="client-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedClient.name}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="modal-section">
                <h3>Contact Information</h3>
                <p><strong>Email:</strong> {selectedClient.email}</p>
                <p><strong>Phone:</strong> {selectedClient.phone}</p>
                <p><strong>Emergency Contact:</strong> {selectedClient.emergencyContact || 'Not provided'}</p>
              </div>

              <div className="modal-section">
                <h3>Membership Details</h3>
                <p><strong>Status:</strong> <span className={getStatusColor(selectedClient.status)}>{selectedClient.status}</span></p>
                <p><strong>Join Date:</strong> {selectedClient.joinDate}</p>
                <p><strong>Monthly Rate:</strong> ${selectedClient.monthlyRate}</p>
                <p><strong>Payment Status:</strong> <span className={getPaymentStatusColor(selectedClient.paymentStatus)}>{selectedClient.paymentStatus}</span></p>
              </div>

              <div className="modal-section">
                <h3>Training Progress</h3>
                <p><strong>Current Program:</strong> {selectedClient.currentProgram || 'No program assigned'}</p>
                <p><strong>Total Sessions:</strong> {selectedClient.totalSessions}</p>
                <p><strong>Completed Sessions:</strong> {selectedClient.completedSessions}</p>
                <p><strong>Goals:</strong> {selectedClient.goals.join(', ') || 'No goals set'}</p>
              </div>

              {selectedClient.medicalNotes && (
                <div className="modal-section">
                  <h3>Medical Notes</h3>
                  <p>{selectedClient.medicalNotes}</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="modal-btn">Send Message</button>
              <button className="modal-btn">Schedule Session</button>
              <button className="modal-btn">View History</button>
            </div>
          </div>
        </div>
      )}
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