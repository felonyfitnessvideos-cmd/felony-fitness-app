import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { X } from 'lucide-react';
import './AchievementUnlocked.css';

/**
 * Achievement Celebration Modal
 * Displays full-screen celebration with confetti when user unlocks an achievement
 * 
 * @param {Object} achievement - Achievement data from achievements table
 * @param {Function} onClose - Callback to close modal and mark as seen
 */
export default function AchievementUnlocked({ achievement, onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Delay animation slightly for better effect
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const rarityColors = {
    common: '#95a5a6',
    rare: '#3498db',
    epic: '#9b59b6',
    legendary: '#f39c12'
  };

  return (
    <>
      {/* Confetti animation */}
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={500}
        gravity={0.3}
      />
      
      {/* Modal overlay */}
      <div className={`achievement-overlay ${show ? 'show' : ''}`} onClick={onClose}>
        <div className="achievement-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
          
          {/* Achievement badge with icon */}
          <div 
            className="achievement-badge" 
            style={{ borderColor: rarityColors[achievement.rarity] }}
          >
            <span className="achievement-icon" role="img" aria-label="Achievement icon">
              {achievement.icon}
            </span>
          </div>
          
          {/* Achievement details */}
          <h2 className="achievement-title">{achievement.name}</h2>
          <p className="achievement-description">{achievement.description}</p>
          
          {/* Rewards section */}
          <div className="achievement-rewards">
            <div className="xp-reward">
              <span className="xp-icon" role="img" aria-label="XP">⚡</span>
              <span className="xp-amount">+{achievement.xp_reward} XP</span>
            </div>
            <div className={`rarity-badge ${achievement.rarity}`}>
              {achievement.rarity.toUpperCase()}
            </div>
          </div>
          
          {/* Continue button */}
          <button className="continue-button" onClick={onClose}>
            Awesome! 🎉
          </button>
        </div>
      </div>
    </>
  );
}
