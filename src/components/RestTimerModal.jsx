import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Plus, Minus, X } from 'lucide-react';
import './RestTimerModal.css';

const customModalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%',
    transform: 'translate(-50%, -50%)', width: '320px', background: '#2d3748',
    color: '#f7fafc', border: '1px solid #4a5568', zIndex: 1001,
    padding: '1.5rem', borderRadius: '16px'
  },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1000 },
};

function RestTimerModal({ isOpen, onClose, initialDuration = 60, isWorkoutComplete = false, onFinishWorkout }) {
  const [timeLeft, setTimeLeft] = useState(initialDuration);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(initialDuration);
      
      if (isWorkoutComplete) return;

      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, initialDuration, onClose, isWorkoutComplete]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const adjustTime = (amount) => {
    setTimeLeft(prevTime => Math.max(0, prevTime + amount));
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customModalStyles}
      contentLabel="Rest Timer"
      appElement={document.getElementById('root')}
    >
      <div className="rest-timer-container">
        <div className="timer-header">
          <h3>{isWorkoutComplete ? 'WORKOUT COMPLETE' : 'REST'}</h3>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>
        
        <div className="timer-circle">
            <div className="timer-display">
                {formatTime(timeLeft)}
            </div>
        </div>
        
        {isWorkoutComplete ? (
          <div className="timer-controls">
            <button onClick={onFinishWorkout} className="finish-workout-modal-btn">
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
