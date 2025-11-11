/**
 * @fileoverview RPE (Rate of Perceived Exertion) rating modal component
 * @description Modal that prompts user to rate how difficult a set was on a 1-10 scale
 * using emoji/icons for quick, intuitive selection. Appears after completing a set,
 * before the rest timer starts.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-11
 * 
 * @requires react
 * @requires react-modal
 * 
 * @example
 * <RpeRatingModal
 *   isOpen={showRpeModal}
 *   onRatingSelect={(rating) => handleRpeRating(rating)}
 *   onSkip={() => handleSkipRpe()}
 * />
 */
import React from 'react';
import Modal from 'react-modal';
import './RpeRatingModal.css';

// Set the app element for accessibility
Modal.setAppElement('#root');

/**
 * RPE rating options with corresponding emoji and descriptions
 * Scale from 1 (very easy) to 10 (maximal effort/failure)
 * 
 * @constant {Array<Object>} RPE_OPTIONS
 */
const RPE_OPTIONS = [
  { value: 1, emoji: '😴', label: 'Too Easy', description: 'Warming up' },
  { value: 2, emoji: '😊', label: 'Very Easy', description: 'Could do 20+ more' },
  { value: 3, emoji: '🙂', label: 'Easy', description: '10+ reps left' },
  { value: 4, emoji: '😐', label: 'Light', description: '6-8 reps left' },
  { value: 5, emoji: '😅', label: 'Moderate', description: '4-5 reps left' },
  { value: 6, emoji: '😤', label: 'Challenging', description: '3-4 reps left' },
  { value: 7, emoji: '😰', label: 'Hard', description: '2-3 reps left' },
  { value: 8, emoji: '🥵', label: 'Very Hard', description: '1-2 reps left' },
  { value: 9, emoji: '😵', label: 'Near Max', description: 'Maybe 1 rep left' },
  { value: 10, emoji: '☠️', label: 'Maximal', description: "Couldn't do more!" }
];

/**
 * RPE Rating Modal Component
 * 
 * @function RpeRatingModal
 * @param {Object} props - Component properties
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onRatingSelect - Callback when user selects a rating (1-10)
 * @param {Function} props.onSkip - Callback when user skips rating
 * @returns {React.ReactElement} The rendered modal component
 * 
 * @description Displays a modal with RPE rating options (1-10) using emoji for
 * quick visual identification. User can tap an emoji to rate or skip if desired.
 */
function RpeRatingModal({ isOpen, onRatingSelect, onSkip }) {
  
  /**
   * Handles rating selection
   * @param {number} rating - The selected RPE rating (1-10)
   */
  const handleRatingClick = (rating) => {
    if (typeof onRatingSelect === 'function') {
      onRatingSelect(rating);
    }
  };

  /**
   * Handles skip button click
   */
  const handleSkip = () => {
    if (typeof onSkip === 'function') {
      onSkip();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleSkip}
      contentLabel="Rate Your Set"
      overlayClassName="rpe-modal-overlay"
      className="rpe-modal-content"
      shouldCloseOnOverlayClick={false} // Force user to choose or skip
    >
      <div className="rpe-modal-container">
        <div className="rpe-header">
          <h3>How Hard Was That Set?</h3>
          <p className="rpe-subtitle">Rate of Perceived Exertion (RPE)</p>
        </div>

        <div className="rpe-grid">
          {RPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              className="rpe-option"
              onClick={() => handleRatingClick(option.value)}
              aria-label={`Rate as ${option.value} - ${option.label}`}
            >
              <span className="rpe-emoji">{option.emoji}</span>
              <span className="rpe-value">{option.value}</span>
              <span className="rpe-label">{option.label}</span>
              <span className="rpe-description">{option.description}</span>
            </button>
          ))}
        </div>

        <button 
          className="rpe-skip-btn" 
          onClick={handleSkip}
          aria-label="Skip rating"
        >
          Skip for now
        </button>
      </div>
    </Modal>
  );
}

export default RpeRatingModal;
