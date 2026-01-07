/**
 * @file ViewEventModal.jsx
 * @description Modal for viewing and editing event details
 */

import React, { useState } from 'react';
import { X, Edit2, Trash2, CheckCircle } from 'lucide-react';
import './ViewEventModal.css';

/**
 * View Event Modal Component
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.event - Event data
 * @param {Function} props.onUpdate - Callback to update event
 * @param {Function} props.onDelete - Callback to delete event
 * @param {Function} props.onClose - Callback when modal closes
 */
const ViewEventModal = ({ event, onUpdate, onDelete, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    scheduled_time: event.scheduled_time || '09:00',
    duration_minutes: event.duration_minutes || 60,
    notes: event.notes || '',
    is_completed: event.is_completed || false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    await onUpdate(event.id, formData);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await onDelete(event.id);
    }
  };

  const handleCompleteToggle = async () => {
    await onUpdate(event.id, {
      is_completed: !event.is_completed,
      completed_at: !event.is_completed ? new Date().toISOString() : null,
    });
  };

  const eventDate = new Date(event.scheduled_date + 'T00:00:00');
  const dateStr = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{event.workout_routines?.name || 'Event'}</h2>
            <p className="event-date">{dateStr}</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="event-details">
          {/* Status badge */}
          <div className={`status-badge ${event.is_completed ? 'completed' : 'pending'}`}>
            {event.is_completed ? 'COMPLETED' : 'PENDING'}
          </div>

          {/* Event info */}
          <div className="detail-section">
            <h3>Event Details</h3>
            {!isEditing ? (
              <div className="detail-view">
                <div className="detail-row">
                  <span className="label">Time:</span>
                  <span className="value">{event.scheduled_time || '09:00'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Duration:</span>
                  <span className="value">{event.duration_minutes || 60} minutes</span>
                </div>
                {event.client_name && (
                  <div className="detail-row">
                    <span className="label">Client:</span>
                    <span className="value">{event.client_name}</span>
                  </div>
                )}
                {event.client_email && (
                  <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="value">{event.client_email}</span>
                  </div>
                )}
                {event.notes && (
                  <div className="detail-row">
                    <span className="label">Notes:</span>
                    <span className="value">{event.notes}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="detail-edit">
                <div className="form-group">
                  <label htmlFor="scheduled_time">Time</label>
                  <input
                    type="time"
                    id="scheduled_time"
                    name="scheduled_time"
                    value={formData.scheduled_time}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="duration_minutes">Duration (minutes)</label>
                  <input
                    type="number"
                    id="duration_minutes"
                    name="duration_minutes"
                    value={formData.duration_minutes}
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
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {!isEditing ? (
            <>
              <button className="btn-secondary" onClick={handleCompleteToggle}>
                <CheckCircle size={18} />
                {event.is_completed ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
              <div className="button-group">
                <button className="btn-secondary" onClick={() => setIsEditing(true)}>
                  <Edit2 size={18} />
                  Edit
                </button>
                <button className="btn-danger" onClick={handleDelete}>
                  <Trash2 size={18} />
                  Delete
                </button>
                <button className="btn-primary" onClick={onClose}>
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave}>
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEventModal;
