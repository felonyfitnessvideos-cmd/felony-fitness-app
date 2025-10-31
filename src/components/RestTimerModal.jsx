/**
 * @file RestTimerModal.jsx
 * @description A modal component that displays a countdown timer for rest periods between exercises or a completion message at the end of a workout.
 * @author [Your Name/Team Name]
 * @date 10/17/2025
 */

/**
 * RestTimerModal.jsx
 * Modal component that provides a configurable rest timer UI used between sets.
 * It displays a countdown and controls to start/pause/reset the timer.
 */
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Plus, Minus, X } from 'lucide-react';
import './RestTimerModal.css';

/**
 * @constant {object} customModalStyles
 * @description Custom styles for the react-modal component to match the app's theme.
 */
// Modal styling migrated to CSS classes: .rest-modal-overlay and .rest-modal-content

/**
 * Renders a modal for a rest timer or a workout completion screen.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Controls whether the modal is visible.
 * @param {function(): void} props.onClose - The function to call when the modal should be closed.
 * @param {number} [props.initialDuration=60] - The initial duration of the timer in seconds.
 * @param {boolean} [props.isWorkoutComplete=false] - If true, displays the "Workout Complete" view instead of the timer.
 * @param {function(): void} props.onFinishWorkout - The function to call when the "Finish Workout" button is clicked.
 * @returns {JSX.Element | null} The rendered modal component or null if not open.
 */
function RestTimerModal({ isOpen, onClose, initialDuration = 60, isWorkoutComplete = false, onFinishWorkout }) {
  /**
   * State to keep track of the remaining time in seconds.
   * @type {[number, React.Dispatch<React.SetStateAction<number>>]}
   */
  const [timeLeft, setTimeLeft] = useState(initialDuration);

  /**
   * Effect hook to manage the countdown timer.
   * It starts a `setInterval` when the modal opens and clears it on cleanup or when the modal closes.
   * The timer automatically closes the modal when `timeLeft` reaches zero.
   * If `isWorkoutComplete` is true, the timer logic is skipped.
   */
  useEffect(() => {
    if (isOpen) {
      // Reset timer to the initial duration each time the modal opens.
      setTimeLeft(initialDuration);
      
      // Do not start the countdown if the workout is complete.
      if (isWorkoutComplete) return;

      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
            if (prevTime <= 1) {
              clearInterval(timer);
              if (typeof onClose === 'function') onClose(); // Automatically close the modal if provided.
              return 0;
            }
          return prevTime - 1;
        });
      }, 1000);

      // Cleanup function to clear the interval when the component unmounts or dependencies change.
      return () => clearInterval(timer);
    }
  }, [isOpen, initialDuration, onClose, isWorkoutComplete]);

  /**
   * Formats a duration in seconds into a MM:SS string.
   * @param {number} seconds - The total number of seconds.
   * @returns {string} The formatted time string (e.g., "01:30").
   */
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * Adjusts the current `timeLeft` by a given amount.
   * @param {number} amount - The number of seconds to add or subtract (e.g., 10 or -10).
   */
  const adjustTime = (amount) => {
    // Ensures the time does not go below zero.
    setTimeLeft(prevTime => Math.max(0, prevTime + amount));
  };

  // Render nothing if the modal is not supposed to be open.
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Rest Timer"
      overlayClassName="rest-modal-overlay"
      className="rest-modal-content"
    >
      <div className="rest-timer-container">
        <div className="timer-header">
          {/* Display different titles based on whether the workout is complete. */}
          <h3>{isWorkoutComplete ? 'WORKOUT COMPLETE' : 'REST'}</h3>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>
        
        <div className="timer-circle">
            <div className="timer-display">
                {/* For the complete state, show a checkmark or message instead of time if desired. */}
                {/* For this implementation, we just show the remaining time. */}
                {formatTime(timeLeft)}
            </div>
        </div>
        
        {/* Conditionally render controls based on workout completion status. */}
        {isWorkoutComplete ? (
          <div className="timer-controls">
            <button onClick={() => typeof onFinishWorkout === 'function' && onFinishWorkout()} className="finish-workout-modal-btn" type="button">
              Finish Workout
            </button>
          </div>
        ) : (
          <div className="timer-controls">
            <button onClick={() => adjustTime(-10)} className="adjust-btn"><Minus size={20} /> 10s</button>
            <button onClick={onClose} className="skip-btn">Skip</button>
            <button onClick={() => adjustTime(10)} className="adjust-btn"><Plus size={20} /> 10s</button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default RestTimerModal;
