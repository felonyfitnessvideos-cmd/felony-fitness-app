/**
 * @fileoverview Modal component for editing calendar events.
 * @description Provides a form to edit the details of a Google Calendar event or a local appointment.
 */

import { Save, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import './EditEventModal.css';

const EditEventModal = ({ event, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    summary: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    description: ''
  });

  useEffect(() => {
    if (event) {
      const startDateTime = event.start?.dateTime ? new Date(event.start.dateTime) : new Date();
      const endDateTime = event.end?.dateTime ? new Date(event.end.dateTime) : new Date(startDateTime.getTime() + 60 * 60000);
      const duration = Math.round((endDateTime - startDateTime) / 60000);

      setFormData({
        summary: event.summary || '',
        date: startDateTime.toISOString().split('T')[0],
        time: startDateTime.toTimeString().substring(0, 5),
        duration: duration || 60,
        location: event.location || '',
        description: event.description || ''
      });
    }
  }, [event]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const [hours, minutes] = formData.time.split(':');
    const newDate = new Date(formData.date);
    newDate.setHours(hours, minutes);

    const updatedAppointmentData = {
      summary: formData.summary,
      date: newDate,
      duration: parseInt(formData.duration, 10),
      location: formData.location,
      notes: formData.description,
      // Assuming event object has what's needed for formatting
      clientName: event.summary?.split(' - ')[1] || 'Unknown Client',
      type: event.summary?.split(' - ')[0] || 'Appointment',
    };
    onSave(event.id, updatedAppointmentData);
  };

  if (!event) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Event</h2>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Summary</label>
            <input type="text" name="summary" value={formData.summary} onChange={handleInputChange} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input type="time" name="time" value={formData.time} onChange={handleInputChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Duration (minutes)</label>
            <input type="number" name="duration" value={formData.duration} onChange={handleInputChange} min="15" step="15" />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange}></textarea>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}><Save size={18} /> Save Changes</button>
        </div>
      </div>
    </div>
  );
};

EditEventModal.propTypes = {
  event: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditEventModal;
