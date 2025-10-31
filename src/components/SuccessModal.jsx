/**
 * @file SuccessModal.jsx
 * @description Small presentational modal used across the app to show success confirmations
 * @project Felony Fitness
 * 
 * A reusable modal component for displaying success messages with a confirmation button.
 * Features a check circle icon, customizable title and message, and overlay dismiss functionality.
 */

import React from 'react';
import './SuccessModal.css';
import { CheckCircle } from 'lucide-react';

/**
 * Success modal component for displaying positive feedback to users
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {function} props.onClose - Callback function called when modal is closed
 * @param {string} props.title - The main heading text to display
 * @param {string} props.message - The descriptive message content
 * @returns {JSX.Element|null} - Modal component or null when closed
 */
function SuccessModal({ isOpen, onClose, title, message }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <CheckCircle className="modal-icon" size={48} aria-hidden="true" />
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <button type="button" className="modal-button" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
}

export default SuccessModal;
