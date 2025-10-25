/**
 * SuccessModal.jsx
 * A small reusable modal used to display success messages with a confirmation button.
 * It is intentionally simple and controlled by its `isOpen` prop to keep usage predictable.
 */

import React from 'react';
import './SuccessModal.css';
import { CheckCircle } from 'lucide-react';

/**
 * Render a success modal that displays a title, message, a success icon, and a confirmation button.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is visible.
 * @param {function} props.onClose - Callback invoked to close the modal (called when overlay or button is clicked).
 * @param {string} props.title - Heading text shown in the modal.
 * @param {string} props.message - Body text shown in the modal.
 * @returns {JSX.Element|null} The modal element when `isOpen` is true, or `null` when `isOpen` is false.
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