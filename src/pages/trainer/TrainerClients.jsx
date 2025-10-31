/**
 * @file TrainerClients.jsx
 * @description Comprehensive client management for trainers
 * @project Felony Fitness
 */

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Phone, Mail, Calendar, DollarSign, Activity } from 'lucide-react';

const TrainerClients = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Mock detailed client data
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
        name: "Jane Smith",
        email: "jane.smith@example.com", 
        phone: "(555) 987-6543",
        joinDate: "2024-03-20",
        status: "active",
        nextAppointment: "2025-10-30 2:00 PM",
        monthlyRate: 150,
        lastPayment: "2025-09-28",
        paymentStatus: "overdue",
        totalSessions: 16,
        completedSessions: 12,
        currentProgram: "HIIT Fat Loss Circuit",
        goals: ["Fat Loss", "Conditioning"],
        emergencyContact: "Mike Smith - (555) 987-6544",
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
        emergencyContact: "Sarah Johnson - (555) 456-7891",
        medicalNotes: "Allergic to latex"
      }
    ]);
  }, []);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'current': return 'green';
      case 'overdue': return 'red';
      case 'suspended': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="trainer-clients-container">
      <div className="clients-header">
        <h2><Users size={24} />Client Management</h2>
        <div className="clients-actions">
          <button className="invite-client-button">
            <Plus size={18} />
            Invite New Client
          </button>
        </div>
      </div>

      <div className="clients-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="status-filters">
          {['all', 'active', 'inactive', 'trial'].map(status => (
            <button
              key={status}
              className={`status-filter ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'all' && ` (${clients.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="clients-list">
        {filteredClients.map(client => (
          <div key={client.id} className="client-card">
            <div className="client-main-info">
              <div className="client-avatar">
                {client.name.split(' ').map(n => n[0]).join('')}
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

            <div className="client-actions">
              <button className="action-btn primary">View Details</button>
              <button className="action-btn">Message</button>
              <button className="action-btn">Schedule</button>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="no-clients">
          <Users size={48} />
          <h3>No clients found</h3>
          <p>Try adjusting your search or filters, or invite a new client to get started.</p>
        </div>
      )}
    </div>
  );
};

export default TrainerClients;
