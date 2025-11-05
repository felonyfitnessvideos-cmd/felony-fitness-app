/**
 * @fileoverview Success modal component for positive user feedback
 * @description Small presentational modal used across the app to show success confirmations.
 * A reusable modal component for displaying success messages with a confirmation button.
 * Features a check circle icon, customizable title and message, and overlay dismiss functionality.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-02
 * 
 * @requires react
 * @requires lucide-react
 * 
 * @example
 * // Basic success message
 * <SuccessModal
 *   isOpen={showSuccess}
 *   onClose={() => setShowSuccess(false)}
 *   title="Workout Saved!"
 *   message="Your workout has been successfully recorded."
 * />
 * 
 * @example
 * // Meal plan creation success
 * <SuccessModal
 *   isOpen={mealSaved}
 *   onClose={handleMealSavedClose}
 *   title="Meal Added"
 *   message="Your custom meal has been added to your plan."
 * />
 */

import React from 'react';
import './SuccessModal.css';
import { CheckCircle } from 'lucide-react';

/**
 * Success modal component for displaying positive feedback to users
 * 
 * @function SuccessModal
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Callback function called when modal is closed
 * @param {string} props.title - The main heading text to display
 * @param {string} props.message - The descriptive message content
 * @returns {React.ReactElement|null} Modal component or null when closed
 * 
 * @description Displays a success modal with green check icon, customizable title and message.
 * Includes overlay click-to-dismiss functionality and a continue button.
 * Designed for positive user feedback across the application.
 * 
 * @accessibility
 * - Uses role="dialog" and aria-modal="true" for screen readers
 * - Click outside overlay dismisses modal
 * - Prevents event bubbling on modal content clicks
 * - Properly labeled continue button
 * - Icon marked as decorative with aria-hidden
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
