/**
 * @file CreateEventModal.jsx
 * @description Modal for creating new events in the calendar
 */

import React, { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import './CreateEventModal.css';

/**
 * Create Event Modal Component
 * 
 * @component
 * @param {Object} props
 * @param {string} props.trainerId - Trainer's user ID
 * @param {string} props.defaultDate - Default date for the event (ISO format)
 * @param {Function} props.onCreate - Callback when event is created
 * @param {Function} props.onClose - Callback when modal closes
 */
const CreateEventModal = ({ trainerId, defaultDate, onCreate, onClose }) => {
  const [routines, setRoutines] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    routineId: '',
    clientId: '',
    clientName: '',
    clientEmail: '',
    date: defaultDate || new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 60,
    notes: '',
  });

  /**
   * Load available routines and clients
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load routines
        const { data: routinesData } = await supabase
          .from('workout_routines')
          .select('id, name')
          .eq('user_id', trainerId)
          .order('name');

        setRoutines(routinesData || []);

        // Load clients
        const { data: clientsData } = await supabase
          .from('user_profile')
          .select('id, first_name, last_name, email')
          .eq('trainer_id', trainerId)
          .order('first_name');

        setClients(clientsData || []);

        setLoading(false);
      } catch (err) {
        console.warn('Error loading data:', err.message);
        setLoading(false);
      }
    };

    loadData();
  }, [trainerId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    const client = clients.find((c) => c.id === clientId);
    setFormData((prev) => ({
      ...prev,
      clientId,
      clientName: client ? `${client.first_name} ${client.last_name}` : '',
      clientEmail: client?.email || '',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.routineId || !formData.date || !formData.time) {
      alert('Please fill in all required fields');
      return;
    }

    onCreate({
      routineId: formData.routineId,
      clientId: formData.clientId,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      date: formData.date,
      time: formData.time,
      duration: parseInt(formData.duration),
      notes: formData.notes,
    });
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">Loading...</div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Event</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="routineId">
              Workout Routine <span className="required">*</span>
            </label>
            <select
              id="routineId"
              name="routineId"
              value={formData.routineId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a routine</option>
              {routines.map((routine) => (
                <option key={routine.id} value={routine.id}>
                  {routine.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="clientId">Client (Optional)</label>
            <select id="clientId" name="clientId" value={formData.clientId} onChange={handleClientChange}>
              <option value="">No client assigned</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">
                Date <span className="required">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">
                Time <span className="required">*</span>
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration (minutes)</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min="15"
              step="15"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Add any notes about this event..."
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              <Save size={18} />
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
