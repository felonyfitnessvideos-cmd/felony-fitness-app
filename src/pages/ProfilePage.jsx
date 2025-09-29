import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { User, Weight, Percent, Calendar, HeartPulse, X } from 'lucide-react';
import './ProfilePage.css';

// Placeholder data for body fat images
const maleBodyFatImages = [
  { label: '30%+', src: 'https://placehold.co/150x200/2d3748/ffffff?text=30%25%2B' },
  { label: '25%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=25%25' },
  { label: '20%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=20%25' },
  { label: '15%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=15%25' },
  { label: '10%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=10%25' },
  { label: '5%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=5%25' },
];

const femaleBodyFatImages = [
  { label: '35%+', src: 'https://placehold.co/150x200/2d3748/ffffff?text=35%25%2B' },
  { label: '30%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=30%25' },
  { label: '25%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=25%25' },
  { label: '20%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=20%25' },
  { label: '15%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=15%25' },
  { label: '10%', src: 'https://placehold.co/150x200/2d3748/ffffff?text=10%25' },
];

// Custom styles for the modal
const customModalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%',
    transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '500px',
    background: '#2d3748', color: '#f7fafc', border: '1px solid #4a5568',
    zIndex: 1000, padding: '1.5rem', borderRadius: '12px'
  },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 999 },
};

// Helper function to calculate age
const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

function ProfilePage() {
  // State for body metrics
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [history, setHistory] = useState([]);
  
  // State for user profile data
  const [profile, setProfile] = useState({ dob: '', sex: '' });
  const [age, setAge] = useState(null);
  
  // State for the body fat modal
  const [isBodyFatModalOpen, setBodyFatModalOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch metrics history
        const { data: metricsData, error: metricsError } = await supabase
          .from('body_metrics')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (metricsError) console.error('Error fetching metrics:', metricsError);
        else setHistory(metricsData);
        
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('dob, sex')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        } else if (profileData) {
          setProfile({
            dob: profileData.dob || '',
            sex: profileData.sex || '',
          });
          setAge(calculateAge(profileData.dob));
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (name === 'dob') {
      setAge(calculateAge(value));
    }
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ dob: profile.dob, sex: profile.sex })
      .eq('id', user.id);
      
    if (error) {
      setProfileMessage(error.message);
    } else {
      setProfileMessage('Profile saved!');
      setTimeout(() => setProfileMessage(''), 3000);
    }
  };

  const handleLogMetric = async (e) => {
    e.preventDefault();
    if (!weight && !bodyFat) {
      setMessage('Please enter at least one measurement.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newMetric = {
      user_id: user.id,
      weight_lbs: weight || null,
      body_fat_percentage: bodyFat || null,
    };

    const { data, error } = await supabase
      .from('body_metrics')
      .insert(newMetric)
      .select()
      .single();

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Measurement saved!');
      setHistory([data, ...history]);
      setWeight('');
      setBodyFat('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="profile-page-container">
      <SubPageHeader title="Profile & Metrics" icon={<User size={28} />} iconColor="#f97316" backTo="/dashboard" />
      
      <form onSubmit={handleProfileUpdate} className="profile-form metric-form">
        <h2>Your Information</h2>
        <div className="form-group">
          <label htmlFor="dob">Date of Birth {age && `(Age: ${age})`}</label>
          <div className="input-with-icon">
            <Calendar size={18} />
            <input 
              id="dob"
              name="dob"
              type="date"
              value={profile.dob}
              onChange={handleProfileChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="sex">Sex</label>
          <div className="input-with-icon">
            <HeartPulse size={18} />
            <select
              id="sex"
              name="sex"
              value={profile.sex}
              onChange={handleProfileChange}
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>
        {profileMessage && <p className="form-message">{profileMessage}</p>}
        <button type="submit" className="save-button">Save Profile</button>
      </form>
      
      <form onSubmit={handleLogMetric} className="metric-form">
        <h2>Log Today's Measurements</h2>
        <div className="form-group">
          <label htmlFor="weight">Weight (lbs)</label>
          <div className="input-with-icon">
            <Weight size={18} />
            <input 
              id="weight"
              type="number"
              placeholder="e.g., 185.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              step="0.1"
            />
          </div>
        </div>
        <div className="form-group">
          <div className="label-with-link">
            <label htmlFor="bodyFat">Body Fat %</label>
            <button type="button" className="info-link" onClick={() => setBodyFatModalOpen(true)}>
              How can I tell?
            </button>
          </div>
          <div className="input-with-icon">
            <Percent size={18} />
            <input 
              id="bodyFat"
              type="number"
              placeholder="e.g., 15.2"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              step="0.1"
            />
          </div>
        </div>
        {message && <p className="form-message">{message}</p>}
        <button type="submit" className="save-button">Save Measurement</button>
      </form>

      <div className="history-section">
        <h2>Recent History</h2>
        {loading ? <p>Loading history...</p> : (
          history.length === 0 ? <p>No measurements logged yet.</p> : (
            <ul className="history-list">
              {history.map(metric => (
                <li key={metric.id} className="history-item">
                  <span className="history-date">{new Date(metric.created_at).toLocaleDateString()}</span>
                  <div className="history-values">
                    {metric.weight_lbs && <span>{metric.weight_lbs} lbs</span>}
                    {metric.body_fat_percentage && <span>{metric.body_fat_percentage}% fat</span>}
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </div>

      <Link to="/my-plan" className="link-button">
        Go to My Plan
      </Link>
      
      <Modal
        isOpen={isBodyFatModalOpen}
        onRequestClose={() => setBodyFatModalOpen(false)}
        style={customModalStyles}
        contentLabel="Body Fat Guide"
        appElement={document.getElementById('root')}
      >
        <div className="modal-header">
          <h3>Body Fat Percentage Guide</h3>
          <button onClick={() => setBodyFatModalOpen(false)} className="close-modal-btn"><X size={24} /></button>
        </div>
        <div className="modal-body">
          { (profile.sex === 'Male' || profile.sex === 'Female') ? (
            <>
              <p className="modal-subtitle">These are visual estimates. For accurate measurements, consult a professional.</p>
              <div className="bodyfat-grid">
                {(profile.sex === 'Male' ? maleBodyFatImages : femaleBodyFatImages).map(img => (
                  <div key={img.label} className="bodyfat-card">
                    <img src={img.src} alt={`Body fat at ${img.label}`} className="bodyfat-image" />
                    <p className="bodyfat-label">{img.label}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="professional-advice">
              <p>Visual body fat estimation varies significantly based on individual body composition.</p>
              <p>For the most accurate assessment and personalized advice, we recommend consulting with a primary care provider, certified personal trainer, or registered dietitian.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default ProfilePage;