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
  /** @type {[Array, Function]} Array of client objects with comprehensive information */
  const [clients, setClients] = useState([]);
  
  /** @type {[string, Function]} Current search term for filtering clients */
  const [searchTerm, setSearchTerm] = useState('');
  
  /** @type {[Object|null, Function]} Selected client object for modal display */
  const [selectedClient, setSelectedClient] = useState(null);
  
  /** @type {[boolean, Function]} Modal visibility state */
  const [showClientModal, setShowClientModal] = useState(false);

  /**
   * Initialize client data on component mount
   * 
   * Loads mock client data representing 20 diverse clients with comprehensive information
   * including contact details, programs, progress, payment status, and medical notes.
   * In production, this would fetch from the database via API.
   * 
   * @effect
   * @dependencies [] - Runs once on mount
   */
  useEffect(() => {
    // Mock detailed client data - 20 clients with diverse backgrounds
    setClients([
      {
        id: 1,
        name: "John Dough",
        email: "john.dough@example.com",
        phone: "(555) 123-4567",
        joinDate: "2024-01-15",
        status: "active",
        nextAppointment: "2025-10-30 10:00 AM",
        monthlyRate: 200,
        lastPayment: "2025-10-01",
        paymentStatus: "current",
        totalSessions: 24,
        completedSessions: 18,
        currentProgram: "Beginner Strength Foundation",
        goals: ["Weight Loss", "Strength Building"],
        emergencyContact: "Jane Dough - (555) 123-4568",
        medicalNotes: "Previous knee injury - avoid high impact"
      },
      {
        id: 2,
        name: "Sarah Martinez",
        email: "sarah.martinez@example.com", 
        phone: "(555) 987-6543",
        joinDate: "2024-03-20",
        status: "active",
        nextAppointment: "2025-10-30 2:00 PM",
        monthlyRate: 150,
        lastPayment: "2025-10-01",
        paymentStatus: "current",
        totalSessions: 16,
        completedSessions: 12,
        currentProgram: "HIIT Fat Loss Circuit",
        goals: ["Fat Loss", "Conditioning"],
        emergencyContact: "Carlos Martinez - (555) 987-6544",
        medicalNotes: "None"
      },
      {
        id: 3,
        name: "Mike Johnson",
        email: "mike.j@example.com",
        phone: "(555) 456-7890", 
        joinDate: "2024-06-10",
        status: "inactive",
        nextAppointment: null,
        monthlyRate: 180,
        lastPayment: "2025-08-01",
        paymentStatus: "suspended",
        totalSessions: 12,
        completedSessions: 8,
        currentProgram: null,
        goals: ["Muscle Building"],
        emergencyContact: "Lisa Johnson - (555) 456-7891",
        medicalNotes: "Allergic to latex"
      },
      {
        id: 4,
        name: "Emily Chen",
        email: "emily.chen@example.com",
        phone: "(555) 234-5678",
        joinDate: "2024-02-28",
        status: "active",
        nextAppointment: "2025-10-31 9:00 AM",
        monthlyRate: 250,
        lastPayment: "2025-10-01",
        paymentStatus: "current",
        totalSessions: 32,
        completedSessions: 28,
        currentProgram: "Advanced Powerlifting Protocol",
        goals: ["Strength Building", "Competition Prep"],
        emergencyContact: "David Chen - (555) 234-5679",
        medicalNotes: "Lower back strain history"
      },
      {
        id: 5,
        name: "Robert Williams",
        email: "rob.williams@example.com",
        phone: "(555) 345-6789",
        joinDate: "2024-07-12",
        status: "active",
        nextAppointment: "2025-10-30 6:00 PM",
        monthlyRate: 175,
        lastPayment: "2025-09-15",
        paymentStatus: "overdue",
        totalSessions: 20,
        completedSessions: 15,
        currentProgram: "Executive Fitness Program",
        goals: ["Stress Relief", "General Fitness"],
        emergencyContact: "Michelle Williams - (555) 345-6790",
        medicalNotes: "High blood pressure - monitor intensity"
      },
      {
        id: 6,
        name: "Ashley Thompson",
        email: "ashley.t@example.com",
        phone: "(555) 567-8901",
        joinDate: "2024-04-05",
        status: "trial",
        nextAppointment: "2025-10-29 4:00 PM",
        monthlyRate: 120,
        lastPayment: "2025-10-20",
        paymentStatus: "current",
        totalSessions: 4,
        completedSessions: 2,
        currentProgram: "Postpartum Recovery Program",
        goals: ["Recovery", "Core Strength"],
        emergencyContact: "James Thompson - (555) 567-8902",
        medicalNotes: "Recent pregnancy - cleared for exercise"
      },
      {
        id: 7,
        name: "Marcus Davis",
        email: "marcus.davis@example.com",
        phone: "(555) 678-9012",
        joinDate: "2024-01-08",
        status: "active",
        nextAppointment: "2025-10-31 7:00 AM",
        monthlyRate: 300,
        lastPayment: "2025-10-01",
        paymentStatus: "current",
        totalSessions: 40,
        completedSessions: 38,
        currentProgram: "Athletic Performance Enhancement",
        goals: ["Athletic Performance", "Injury Prevention"],
        emergencyContact: "Angela Davis - (555) 678-9013",
        medicalNotes: "Former shoulder dislocation"
      },
      {
        id: 8,
        name: "Lisa Rodriguez",
        email: "lisa.rodriguez@example.com",
        phone: "(555) 789-0123",
        joinDate: "2024-05-18",
        status: "active",
        nextAppointment: "2025-10-30 11:00 AM",
        monthlyRate: 160,
        lastPayment: "2025-10-01",
        paymentStatus: "current",
        totalSessions: 18,
        completedSessions: 14,
        currentProgram: "Functional Movement Training",
        goals: ["Mobility", "Pain Management"],
        emergencyContact: "Pedro Rodriguez - (555) 789-0124",
        medicalNotes: "Chronic lower back pain"
      },
      {
        id: 9,
        name: "Kevin Park",
        email: "kevin.park@example.com",
        phone: "(555) 890-1234",
        joinDate: "2024-08-22",
        status: "active",
        nextAppointment: "2025-10-29 5:30 PM",
        monthlyRate: 190,
        lastPayment: "2025-10-01",
        paymentStatus: "current",
        totalSessions: 12,
        completedSessions: 10,
        currentProgram: "Marathon Training Program",
        goals: ["Endurance", "Running Performance"],
        emergencyContact: "Jennifer Park - (555) 890-1235",
        medicalNotes: "Runner's knee history"
      },
      {
        id: 10,
        name: "Diana Foster",
        email: "diana.foster@example.com",
        phone: "(555) 901-2345",
        joinDate: "2024-03-14",
        status: "inactive",
        nextAppointment: null,
        monthlyRate: 140,
        lastPayment: "2025-07-01",
        paymentStatus: "suspended",
        totalSessions: 16,
        completedSessions: 12,
        currentProgram: null,
        goals: ["Weight Loss"],
        emergencyContact: "Mark Foster - (555) 901-2346",
        medicalNotes: "Type 2 diabetes"
      },
      {
        id: 11,
        name: "Anthony Garcia",
        email: "anthony.garcia@example.com",
        phone: "(555) 012-3456",
        joinDate: "2024-09-10",
        status: "trial",
        nextAppointment: "2025-10-31 3:00 PM",
        monthlyRate: 130,
        lastPayment: "2025-10-10",
        paymentStatus: "current",
        totalSessions: 6,
        completedSessions: 3,
        currentProgram: "Senior Fitness Program",
        goals: ["Balance", "Fall Prevention"],
        emergencyContact: "Maria Garcia - (555) 012-3457",
        medicalNotes: "Osteoporosis"
      },
      {
        id: 12,
        name: "Rachel Green",
        email: "rachel.green@example.com",
        phone: "(555) 123-4567",
        joinDate: "2024-06-03",
        status: "active",
        nextAppointment: "2025-10-30 1:00 PM",
        monthlyRate: 220,
        lastPayment: "2025-10-01",
        paymentStatus: "current",
        totalSessions: 28,
        completedSessions: 24,
        currentProgram: "Bodybuilding Competition Prep",
        goals: ["Muscle Building", "Competition Prep"],
        emergencyContact: "Ross Green - (555) 123-4568",
        medicalNotes: "None"
      },
      {
        id: 13,
        name: "Tyler Brooks",
        email: "tyler.brooks@example.com",
        phone: "(555) 234-5678",
        joinDate: "2024-07-25",
        status: "active",
        nextAppointment: "2025-10-29 7:30 PM",
        monthlyRate: 185,
        lastPayment: "2025-09-25",
        paymentStatus: "overdue",
        totalSessions: 14,
        completedSessions: 11,
        currentProgram: "CrossFit Conditioning",
        goals: ["Functional Fitness", "Competition"],
        emergencyContact: "Samantha Brooks - (555) 234-5679",
        medicalNotes: "Wrist injury recovery"
      },
      {
        id: 14,
        name: "Monica Lee",
        email: "monica.lee@example.com",
        phone: "(555) 345-6789",
        joinDate: "2024-04-17",
        status: "active",
        nextAppointment: "2025-10-31 10:00 AM",
        monthlyRate: 170,
        lastPayment: "2025-10-01",
        paymentStatus: "current",
        totalSessions: 22,
        completedSessions: 19,
        currentProgram: "Yoga & Strength Fusion",
        goals: ["Flexibility", "Mind-Body Connection"],
        emergencyContact: "Steven Lee - (555) 345-6790",
        medicalNotes: "Anxiety disorder"
      },
      {
        id: 15,
        name: "Jordan Wilson",
        email: "jordan.wilson@example.com",
        phone: "(555) 456-7890",
        joinDate: "2024-08-05",
        status: "active",
        nextAppointment: "2025-10-30 8:00 AM",
        monthlyRate: 195,
        lastPayment: "2025-10-01",
        paymentStatus: "current",
        totalSessions: 16,
        completedSessions: 13,
        currentProgram: "Sport-Specific Training - Tennis",
        goals: ["Sport Performance", "Agility"],
        emergencyContact: "Alex Wilson - (555) 456-7891",
        medicalNotes: "Tennis elbow history"
      },
      {
        id: 16,
        name: "Carmen Santos",
        email: "carmen.santos@example.com",
        phone: "(555) 567-8901",
        joinDate: "2024-02-11",
        status: "inactive",
        nextAppointment: null,
        monthlyRate: 155,
        lastPayment: "2025-06-01",
        paymentStatus: "suspended",
        totalSessions: 20,
        completedSessions: 15,
        currentProgram: null,
        goals: ["Weight Loss", "Confidence Building"],
        emergencyContact: "Luis Santos - (555) 567-8902",
        medicalNotes: "Depression - exercise as therapy"
      },
      {
        id: 17,
        name: "Brandon Mitchell",
        email: "brandon.mitchell@example.com",
        phone: "(555) 678-9012",
        joinDate: "2024-09-30",
        status: "trial",
        nextAppointment: "2025-10-29 6:30 PM",
        monthlyRate: 165,
        lastPayment: "2025-10-01",
        paymentStatus: "current",
        totalSessions: 4,
        completedSessions: 2,
        currentProgram: "Beginner Strength & Cardio",
        goals: ["General Fitness", "Weight Loss"],
        emergencyContact: "Nicole Mitchell - (555) 678-9013",
        medicalNotes: "Sedentary lifestyle - gradual progression"
      },
      {
        id: 18,
        name: "Stephanie Wright",
        email: "stephanie.wright@example.com",
        phone: "(555) 789-0123",
        joinDate: "2024-05-29",
        status: "active",
        nextAppointment: "2025-10-31 12:00 PM",
        monthlyRate: 210,
        lastPayment: "2025-10-01",
        paymentStatus: "current",
        totalSessions: 26,
        completedSessions: 22,
        currentProgram: "Pilates & Core Strength",
        goals: ["Core Strength", "Posture Correction"],
        emergencyContact: "Michael Wright - (555) 789-0124",
        medicalNotes: "Herniated disc L4-L5"
      },
      {
        id: 19,
        name: "Daniel Kim",
        email: "daniel.kim@example.com",
        phone: "(555) 890-1234",
        joinDate: "2024-01-22",
        status: "active",
        nextAppointment: "2025-10-30 3:30 PM",
        monthlyRate: 275,
        lastPayment: "2025-10-01",
        paymentStatus: "current",
        totalSessions: 36,
        completedSessions: 34,
        currentProgram: "Olympic Weightlifting",
        goals: ["Strength Building", "Technique Mastery"],
        emergencyContact: "Grace Kim - (555) 890-1235",
        medicalNotes: "Previous ACL reconstruction"
      },
      {
        id: 20,
        name: "Vanessa Taylor",
        email: "vanessa.taylor@example.com",
        phone: "(555) 901-2345",
        joinDate: "2024-07-08",
        status: "active",
        nextAppointment: "2025-10-29 2:30 PM",
        monthlyRate: 145,
        lastPayment: "2025-09-08",
        paymentStatus: "overdue",
        totalSessions: 18,
        completedSessions: 14,
        currentProgram: "Dance Fitness Program",
        goals: ["Cardiovascular Health", "Fun & Enjoyment"],
        emergencyContact: "Robert Taylor - (555) 901-2346",
        medicalNotes: "Asthma - inhaler available"
      }
    ]);
  }, []);

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
   * Get color class for payment status badge
   * 
   * Returns appropriate CSS color class based on client's payment status
   * for visual indication in the UI.
   * 
   * @param {string} status - Payment status ('current', 'overdue', 'suspended', etc.)
   * @returns {string} CSS color class name
   * 
   * @example
   * getPaymentStatusColor('current') // returns 'green'
   * getPaymentStatusColor('overdue') // returns 'red'
   */
  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'current': return 'green';
      case 'overdue': return 'red';
      case 'suspended': return 'orange';
      default: return 'gray';
    }
  };

  /**
   * Handle client selection for detailed view
   * 
   * Sets the selected client and opens the detailed modal view.
   * Used when user clicks "View Details" button on client card.
   * 
   * @param {Object} client - Complete client object to display in modal
   * 
   * @example
   * handleViewClient(clientObject)
   */
  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  /**
   * Close client detail modal
   * 
   * Clears selected client and hides the modal overlay.
   * Can be triggered by close button, overlay click, or escape key.
   * 
   * @function
   */
  const closeClientModal = () => {
    setSelectedClient(null);
    setShowClientModal(false);
  };

  /**
   * Generate client avatar initials
   * 
   * Creates a 1-2 character string from client name for avatar display.
   * Handles various name formats and edge cases gracefully.
   * 
   * @param {string} name - Full client name
   * @returns {string} 1-2 character initials for avatar display
   * 
   * @example
   * generateAvatarInitials('John Doe') // returns 'JD'
   * generateAvatarInitials('Madonna') // returns 'MA'
   * generateAvatarInitials('') // returns '?'
   */
  const generateAvatarInitials = (name) => {
    if (!name) return '?';
    const nameParts = name.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return '?';
    if (nameParts.length === 1) {
      // Single word: take first two characters or first character
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    // Multiple words: take first character of first two words
    return nameParts.slice(0, 2).map(part => part[0].toUpperCase()).join('');
  };

  // ============================================================================
  // COMPONENT RENDER
  // ============================================================================
  
  return (
    <div className="trainer-clients-container">
      {/* Search Section - Allows filtering clients by name or email */}
      <div className="clients-search-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Client Cards Grid - Displays filtered client information */}
      <div className="clients-list">
        {filteredClients.map(client => (
          <div key={client.id} className="client-card">
            {/* Client Avatar and Basic Info */}
            <div className="client-main-info">
              <div className="client-avatar">
                {generateAvatarInitials(client.name)}
              </div>
              
              <div className="client-details">
                <h3>{client.name}</h3>
                <div className="client-contact">
                  <div className="contact-item">
                    <Mail size={14} />
                    <span>{client.email}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={14} />
                    <span>{client.phone}</span>
                  </div>
                </div>
                
                {client.nextAppointment && (
                  <div className="next-appointment">
                    <Calendar size={14} />
                    <span>Next: {client.nextAppointment}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Client Statistics - Sessions and Payment Info */}
            <div className="client-stats">
              <div className="stat-group">
                <div className="stat">
                  <span className="stat-label">Sessions</span>
                  <span className="stat-value">{client.completedSessions}/{client.totalSessions}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Rate</span>
                  <span className="stat-value">${client.monthlyRate}/mo</span>
                </div>
              </div>

              <div className="payment-status">
                <DollarSign size={14} />
                <span className={`payment-badge ${getPaymentStatusColor(client.paymentStatus)}`}>
                  {client.paymentStatus}
                </span>
              </div>
            </div>

            {/* Current Program Status */}
            <div className="client-program">
              {client.currentProgram ? (
                <div className="current-program">
                  <Activity size={14} />
                  <span>{client.currentProgram}</span>
                </div>
              ) : (
                <div className="no-program">
                  <span>No active program</span>
                </div>
              )}
            </div>

            {/* Action Buttons - View, Message, Schedule */}
            <div className="client-actions">
              <button 
                className="action-btn primary"
                onClick={() => handleViewClient(client)}
              >
                View Details
              </button>
              <button className="action-btn">Message</button>
              <button className="action-btn">Schedule</button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State - Shown when no clients match search */}
      {filteredClients.length === 0 && (
        <div className="no-clients">
          <Search size={48} />
          <h3>No clients found</h3>
          <p>Try adjusting your search to find clients.</p>
        </div>
      )}

      {/* Client Detail Modal - Comprehensive client information overlay */}
      {showClientModal && selectedClient && (
        <div className="client-modal-overlay" onClick={closeClientModal}>
          <div className="client-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-client-info">
                <div className="client-avatar large">
                  {generateAvatarInitials(selectedClient.name)}
                </div>
                <div>
                  <h2>{selectedClient.name}</h2>
                  <p className="client-status">{selectedClient.status.charAt(0).toUpperCase() + selectedClient.status.slice(1)} Client</p>
                </div>
              </div>
              <button className="close-modal" onClick={closeClientModal}>×</button>
            </div>

            <div className="modal-content">
              <div className="modal-section">
                <h3>Contact Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <Mail size={16} />
                    <span>{selectedClient.email}</span>
                  </div>
                  <div className="info-item">
                    <Phone size={16} />
                    <span>{selectedClient.phone}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Emergency Contact:</span>
                    <span>{selectedClient.emergencyContact}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Join Date:</span>
                    <span>{new Date(selectedClient.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Program & Progress</h3>
                <div className="program-info">
                  {selectedClient.currentProgram ? (
                    <div className="current-program-detail">
                      <Activity size={16} />
                      <span>{selectedClient.currentProgram}</span>
                    </div>
                  ) : (
                    <div className="no-program-detail">
                      <span>No active program assigned</span>
                    </div>
                  )}
                  
                  <div className="progress-stats">
                    <div className="progress-item">
                      <span className="label">Sessions Completed:</span>
                      <span className="value">{selectedClient.completedSessions} / {selectedClient.totalSessions}</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{width: `${(selectedClient.completedSessions / selectedClient.totalSessions) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="goals-section">
                    <span className="label">Goals:</span>
                    <div className="goals-list">
                      {selectedClient.goals.map((goal, index) => (
                        <span key={index} className="goal-tag">{goal}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Scheduling & Payment</h3>
                <div className="scheduling-info">
                  {selectedClient.nextAppointment ? (
                    <div className="appointment-info">
                      <Calendar size={16} />
                      <div>
                        <span className="label">Next Appointment:</span>
                        <span className="appointment-time">{selectedClient.nextAppointment}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="no-appointment">
                      <Calendar size={16} />
                      <span>No upcoming appointments</span>
                    </div>
                  )}

                  <div className="payment-info">
                    <div className="payment-item">
                      <DollarSign size={16} />
                      <span className="label">Monthly Rate:</span>
                      <span className="value">${selectedClient.monthlyRate}</span>
                    </div>
                    <div className="payment-item">
                      <span className="label">Payment Status:</span>
                      <span className={`payment-badge ${getPaymentStatusColor(selectedClient.paymentStatus)}`}>
                        {selectedClient.paymentStatus}
                      </span>
                    </div>
                    <div className="payment-item">
                      <span className="label">Last Payment:</span>
                      <span className="value">{new Date(selectedClient.lastPayment).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Medical Notes</h3>
                <div className="medical-notes">
                  <p>{selectedClient.medicalNotes || "No medical notes on file"}</p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-btn primary">Edit Client</button>
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
