/**
 * @file TrainerCalendar.jsx
 * @description Calendar management page for trainers with Google Calendar integration
 * @project Felony Fitness
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, User, MapPin } from 'lucide-react';

const TrainerCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Mock appointments data
  useEffect(() => {
    setAppointments([
      {
        id: 1,
        clientName: "John Dough",
        date: "2025-10-30",
        time: "10:00 AM",
        duration: 60,
        type: "Personal Training",
        location: "Gym Floor A",
        status: "confirmed"
      },
      {
        id: 2,
        clientName: "Jane Smith", 
        date: "2025-10-30",
        time: "2:00 PM",
        duration: 45,
        type: "Consultation",
        location: "Office",
        status: "pending"
      }
    ]);
  }, []);

  const handleGoogleCalendarSync = () => {
    // TODO: Implement Google Calendar API integration
    console.log("Syncing with Google Calendar...");
  };

  return (
    <div className="trainer-calendar-container">
      <div className="calendar-header">
        <h2><Calendar size={24} />Calendar Management</h2>
        <div className="calendar-actions">
          <button onClick={handleGoogleCalendarSync} className="sync-button">
            Sync with Google Calendar
          </button>
          <button className="new-appointment-button">
            <Plus size={18} />
            New Appointment
          </button>
        </div>
      </div>

      <div className="calendar-layout">
        <div className="calendar-sidebar">
          <h3>Today's Appointments</h3>
          {appointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-time">
                <Clock size={16} />
                {appointment.time}
              </div>
              <div className="appointment-details">
                <div className="client-name">
                  <User size={16} />
                  {appointment.clientName}
                </div>
                <div className="appointment-type">{appointment.type}</div>
                <div className="appointment-location">
                  <MapPin size={14} />
                  {appointment.location}
                </div>
              </div>
              <div className={`appointment-status ${appointment.status}`}>
                {appointment.status}
              </div>
            </div>
          ))}
        </div>

        <div className="calendar-main">
          <div className="calendar-widget">
            {/* TODO: Integrate with a calendar library like react-calendar */}
            <p>Calendar widget will be integrated here</p>
            <p>Features to include:</p>
            <ul>
              <li>Google Calendar integration</li>
              <li>Appointment scheduling</li>
              <li>Client notifications</li>
              <li>Recurring appointments</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerCalendar;
