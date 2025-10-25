/**
 * SuccessModal.jsx
 * A small reusable modal used to display success messages with a confirmation button.
 * It is intentionally simple and controlled by its `isOpen` prop to keep usage predictable.
 */

import React from 'react';
import './SuccessModal.css';
import { CheckCircle } from 'lucide-react';

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