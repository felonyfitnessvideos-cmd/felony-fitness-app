import React, { useState } from 'react';
import SubPageHeader from '../components/SubPageHeader.jsx'; 
import { ClipboardList, ShieldCheck, DollarSign, Key, Zap, Diamond, Settings, X } from 'lucide-react';
import Modal from 'react-modal';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../AuthContext.jsx'; // Import the useAuth hook
import './MyPlanPage.css';

const customModalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%',
    transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '400px',
    background: 'var(--card-color)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    zIndex: 1000, padding: '1.5rem', borderRadius: '12px'
  },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 999 },
};

function MyPlanPage() {
  const { user } = useAuth(); // Get user from the central auth context
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { theme, updateUserTheme } = useTheme();

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  return (
    <div className="my-plan-container">
      <SubPageHeader title="My Plan" icon={<ClipboardList size={28} />} iconColor="var(--accent-color)" backTo="/dashboard" />
      
      <div className="plan-header">
        <h2>YOUR PLAN</h2>
        <p>{user?.email}</p>
      </div>

      <div className="plan-card current-plan">
        <div className="plan-icon"><ShieldCheck /></div>
        <div className="plan-details">
          <h3>FREE - SPONSORED</h3>
          <p>Full Access • Community Support</p>
        </div>
        <button className="plan-button current">Current Plan</button>
      </div>
      
      <div className="plans-grid">
        <div className="plan-card">
          <div className="plan-icon"><DollarSign /></div>
          <h3>$10 / MONTH</h3>
          <p>Full Access + Bonus Content</p>
          <button className="plan-button">Upgrade Now</button>
        </div>
        <div className="plan-card">
          <div className="plan-icon"><Key /></div>
          <h3>FREE (90 DAYS)</h3>
          <p>Full Access, Limited Time</p>
          <button className="plan-button">Upgrade Now</button>
        </div>
        <div className="plan-card">
          <div className="plan-icon"><Zap /></div>
          <h3>FREE (INCOME BASED)</h3>
          <p>Full Access, Based on Eligibility</p>
          <button className="plan-button">Upgrade Now</button>
        </div>
        <div className="plan-card">
          <div className="plan-icon"><Diamond /></div>
          <h3>$100 LIFETIME</h3>
          <p>All-Access Pass, One-Time Fee</p>
          <button className="plan-button">Upgrade Now</button>
        </div>
      </div>
      
      <p className="footer-blurb">
        Every plan is built to support your comeback. Choose what fuels you.
      </p>

      <button className="settings-button" onClick={openSettingsModal}>
        <Settings size={24} />
      </button>

      <Modal
        isOpen={isSettingsModalOpen}
        onRequestClose={closeSettingsModal}
        style={customModalStyles}
        contentLabel="Settings"
        appElement={document.getElementById('root')}
      >
        <div className="settings-modal">
          <div className="modal-header">
            <h2>Settings</h2>
            <button onClick={closeSettingsModal} className="close-modal-btn"><X size={24} /></button>
          </div>
          <div className="modal-body">
            <h3>Color Theme</h3>
            <div className="theme-options">
              <button 
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => updateUserTheme('dark')}
              >
                Dark
              </button>
              <button 
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => updateUserTheme('light')}
              >
                Light
              </button>
              <button 
                className={`theme-btn ${theme === 'high-contrast' ? 'active' : ''}`}
                onClick={() => updateUserTheme('high-contrast')}
              >
                High Contrast
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MyPlanPage;
