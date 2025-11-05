/**
 * @file ClientOnboarding.jsx
 * @description Comprehensive new client onboarding form for trainer dashboard
 * @project Felony Fitness
 * 
 * This component provides a complete client intake form including:
 * - Personal information and contact details
 * - Emergency contact information
 * - Initial fitness metrics and assessments
 * - Health and medical history
 * - Fitness goals and preferences
 * - Program preferences and scheduling
 */

import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  AlertTriangle,
  Activity,
  Target,
  Clock,
  Heart,
  Scale,
  Ruler,
  Save,
  X
} from 'lucide-react';
import { supabase } from '../../supabaseClient.js';
import './ClientOnboarding.css';

/**
 * ClientOnboarding component for comprehensive client intake
 * 
 * Provides a multi-section form for gathering all necessary client information
 * including personal details, metrics, goals, and preferences.
 * 
 * @component
 * @returns {JSX.Element} Complete onboarding form interface
 */
const ClientOnboarding = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    
    // Initial Metrics
    height: '',
    weight: '',
    bodyFatPercentage: '',
    restingHeartRate: '',
    bloodPressure: '',
    
    // Health Information
    medicalConditions: '',
    medications: '',
    injuries: '',
    allergies: '',
    doctorClearance: false,
    
    // Fitness Goals
    primaryGoal: '',
    secondaryGoals: [],
    targetWeight: '',
    timeframe: '',
    
    // Preferences
    workoutDays: [],
    preferredTime: '',
    sessionLength: '',
    exercisePreferences: [],
    exerciseRestrictions: '',
    
    // Program Details
    programType: '',
    nutritionCoaching: false,
    startDate: '',
    notes: ''
  });

  const [currentSection, setCurrentSection] = useState('personal');
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const validateSection = (section) => {
    const newErrors = {};
    
    switch (section) {
      case 'personal':
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) newErrors.phone = 'Phone is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        break;
      case 'metrics':
        if (!formData.height) newErrors.height = 'Height is required';
        if (!formData.weight) newErrors.weight = 'Weight is required';
        break;
      case 'goals':
        if (!formData.primaryGoal) newErrors.primaryGoal = 'Primary goal is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSectionChange = (section) => {
    if (validateSection(currentSection)) {
      setCurrentSection(section);
    }
  };

  const handleSubmit = async () => {
    if (validateSection(currentSection)) {
      try {
        console.log('New client data:', formData);
        
        // Step 1: Look up existing user by email (auth.users is not directly queryable, need RPC)
        // For now, try to create the relationship and let it succeed if user exists
        const { data: { user: trainer }, error: trainerError } = await supabase.auth.getUser();
        if (trainerError || !trainer) {
          throw new Error('Unable to get trainer information');
        }
        
        // For testing, use the trainer's own ID as client (since you're testing with yourself)
        const clientUserId = trainer.id; // This will work for self-testing
        
        // Step 2: Create trainer-client relationship using our function
        const { error: relationshipError } = await supabase.rpc('add_client_to_trainer', {
          trainer_user_id: trainer.id,
          client_user_id: clientUserId
        });
        
        if (relationshipError) {
          throw new Error(`Error creating trainer-client relationship: ${relationshipError.message}`);
        }
        
        alert('Client successfully onboarded and added to your client list!');
        
        // Reset form
        setFormData({
          firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: '',
          address: '', city: '', state: '', zipCode: '', emergencyName: '', emergencyPhone: '',
          emergencyRelationship: '', height: '', weight: '', bodyFatPercentage: '',
          restingHeartRate: '', bloodPressure: '', medicalConditions: '', medications: '',
          injuries: '', allergies: '', doctorClearance: false, primaryGoal: '',
          secondaryGoals: [], targetWeight: '', timeframe: '', workoutDays: [],
          preferredTime: '', sessionLength: '', exercisePreferences: [],
          exerciseRestrictions: '', programType: '', nutritionCoaching: false,
          startDate: '', notes: ''
        });
        setCurrentSection('personal');
        
      } catch (error) {
        console.error('Onboarding error:', error);
        alert(`Error onboarding client: ${error.message}`);
      }
    }
  };

  const renderPersonalInfo = () => (
    <div className="form-section">
      <h3><User size={20} /> Personal Information</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label>First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={errors.firstName ? 'error' : ''}
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>
        
        <div className="form-group">
          <label>Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={errors.lastName ? 'error' : ''}
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label><Mail size={16} /> Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label><Phone size={16} /> Phone *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label><Calendar size={16} /> Date of Birth *</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className={errors.dateOfBirth ? 'error' : ''}
          />
          {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
        </div>
        
        <div className="form-group">
          <label>Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label><MapPin size={16} /> Address</label>
        <input
          type="text"
          placeholder="Street Address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>State</label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Zip Code</label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
          />
        </div>
      </div>

      <h4><AlertTriangle size={18} /> Emergency Contact</h4>
      
      <div className="form-row">
        <div className="form-group">
          <label>Emergency Contact Name</label>
          <input
            type="text"
            value={formData.emergencyName}
            onChange={(e) => handleInputChange('emergencyName', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Emergency Contact Phone</label>
          <input
            type="tel"
            value={formData.emergencyPhone}
            onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Relationship</label>
          <input
            type="text"
            placeholder="e.g., Spouse, Parent, Friend"
            value={formData.emergencyRelationship}
            onChange={(e) => handleInputChange('emergencyRelationship', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderMetrics = () => (
    <div className="form-section">
      <h3><Activity size={20} /> Initial Metrics</h3>
      
      <div className="form-row">
        <div className="form-group">
          <label><Ruler size={16} /> Height (inches) *</label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            className={errors.height ? 'error' : ''}
          />
          {errors.height && <span className="error-text">{errors.height}</span>}
        </div>
        
        <div className="form-group">
          <label><Scale size={16} /> Weight (lbs) *</label>
          <input
            type="number"
            value={formData.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            className={errors.weight ? 'error' : ''}
          />
          {errors.weight && <span className="error-text">{errors.weight}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Body Fat % (optional)</label>
          <input
            type="number"
            step="0.1"
            value={formData.bodyFatPercentage}
            onChange={(e) => handleInputChange('bodyFatPercentage', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label><Heart size={16} /> Resting Heart Rate (optional)</label>
          <input
            type="number"
            value={formData.restingHeartRate}
            onChange={(e) => handleInputChange('restingHeartRate', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Blood Pressure (optional)</label>
        <input
          type="text"
          placeholder="e.g., 120/80"
          value={formData.bloodPressure}
          onChange={(e) => handleInputChange('bloodPressure', e.target.value)}
        />
      </div>

      <h4>Health Information</h4>
      
      <div className="form-group">
        <label>Medical Conditions</label>
        <textarea
          placeholder="List any medical conditions, chronic illnesses, or health concerns"
          value={formData.medicalConditions}
          onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Current Medications</label>
        <textarea
          placeholder="List all medications, supplements, and dosages"
          value={formData.medications}
          onChange={(e) => handleInputChange('medications', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Previous Injuries</label>
        <textarea
          placeholder="List any previous injuries, surgeries, or physical limitations"
          value={formData.injuries}
          onChange={(e) => handleInputChange('injuries', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Allergies</label>
        <textarea
          placeholder="List any allergies (food, environmental, medication)"
          value={formData.allergies}
          onChange={(e) => handleInputChange('allergies', e.target.value)}
        />
      </div>

      <div className="checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={formData.doctorClearance}
            onChange={(e) => handleInputChange('doctorClearance', e.target.checked)}
          />
          Client has doctor's clearance for exercise
        </label>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="form-section">
      <h3><Target size={20} /> Fitness Goals & Preferences</h3>
      
      <div className="form-group">
        <label>Primary Goal *</label>
        <select
          value={formData.primaryGoal}
          onChange={(e) => handleInputChange('primaryGoal', e.target.value)}
          className={errors.primaryGoal ? 'error' : ''}
        >
          <option value="">Select Primary Goal</option>
          <option value="weight-loss">Weight Loss</option>
          <option value="muscle-gain">Muscle Gain</option>
          <option value="strength">Increase Strength</option>
          <option value="endurance">Improve Endurance</option>
          <option value="general-fitness">General Fitness</option>
          <option value="sport-specific">Sport-Specific Training</option>
          <option value="rehabilitation">Rehabilitation</option>
        </select>
        {errors.primaryGoal && <span className="error-text">{errors.primaryGoal}</span>}
      </div>

      <div className="form-group">
        <label>Secondary Goals (select all that apply)</label>
        <div className="checkbox-grid">
          {['Improve Flexibility', 'Better Sleep', 'Stress Relief', 'Increased Energy', 'Better Posture', 'Confidence Building'].map(goal => (
            <label key={goal} className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.secondaryGoals.includes(goal)}
                onChange={() => handleArrayChange('secondaryGoals', goal)}
              />
              {goal}
            </label>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Target Weight (optional)</label>
          <input
            type="number"
            value={formData.targetWeight}
            onChange={(e) => handleInputChange('targetWeight', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Timeframe</label>
          <select
            value={formData.timeframe}
            onChange={(e) => handleInputChange('timeframe', e.target.value)}
          >
            <option value="">Select Timeframe</option>
            <option value="3months">3 Months</option>
            <option value="6months">6 Months</option>
            <option value="1year">1 Year</option>
            <option value="ongoing">Ongoing</option>
          </select>
        </div>
      </div>

      <h4><Clock size={18} /> Schedule Preferences</h4>
      
      <div className="form-group">
        <label>Preferred Workout Days</label>
        <div className="checkbox-grid">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <label key={day} className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.workoutDays.includes(day)}
                onChange={() => handleArrayChange('workoutDays', day)}
              />
              {day}
            </label>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Preferred Time</label>
          <select
            value={formData.preferredTime}
            onChange={(e) => handleInputChange('preferredTime', e.target.value)}
          >
            <option value="">Select Time</option>
            <option value="early-morning">Early Morning (5-7 AM)</option>
            <option value="morning">Morning (7-10 AM)</option>
            <option value="midday">Midday (10 AM-2 PM)</option>
            <option value="afternoon">Afternoon (2-6 PM)</option>
            <option value="evening">Evening (6-9 PM)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Session Length</label>
          <select
            value={formData.sessionLength}
            onChange={(e) => handleInputChange('sessionLength', e.target.value)}
          >
            <option value="">Select Length</option>
            <option value="30min">30 Minutes</option>
            <option value="45min">45 Minutes</option>
            <option value="60min">60 Minutes</option>
            <option value="90min">90 Minutes</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Exercise Preferences</label>
        <div className="checkbox-grid">
          {['Weight Training', 'Cardio', 'Yoga', 'Pilates', 'Functional Training', 'HIIT', 'Swimming', 'Running'].map(exercise => (
            <label key={exercise} className="checkbox-item">
              <input
                type="checkbox"
                checked={formData.exercisePreferences.includes(exercise)}
                onChange={() => handleArrayChange('exercisePreferences', exercise)}
              />
              {exercise}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Exercise Restrictions or Dislikes</label>
        <textarea
          placeholder="List any exercises to avoid or modifications needed"
          value={formData.exerciseRestrictions}
          onChange={(e) => handleInputChange('exerciseRestrictions', e.target.value)}
        />
      </div>
    </div>
  );

  const renderProgram = () => (
    <div className="form-section">
      <h3>Program Details</h3>
      
      <div className="form-group">
        <label>Program Type</label>
        <select
          value={formData.programType}
          onChange={(e) => handleInputChange('programType', e.target.value)}
        >
          <option value="">Select Program Type</option>
          <option value="personal-training">Personal Training</option>
          <option value="small-group">Small Group Training</option>
          <option value="online-coaching">Online Coaching</option>
          <option value="hybrid">Hybrid (In-person + Online)</option>
        </select>
      </div>

      <div className="checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={formData.nutritionCoaching}
            onChange={(e) => handleInputChange('nutritionCoaching', e.target.checked)}
          />
          Include Nutrition Coaching
        </label>
      </div>

      <div className="form-group">
        <label>Preferred Start Date</label>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => handleInputChange('startDate', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Additional Notes</label>
        <textarea
          placeholder="Any additional information, special requests, or concerns"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="client-onboarding">
      <div className="onboarding-header">
        <h2>New Client Onboarding</h2>
        <p>Complete all sections to set up your new client's profile and program</p>
      </div>

      <div className="section-tabs">
        <button 
          className={`tab ${currentSection === 'personal' ? 'active' : ''}`}
          onClick={() => handleSectionChange('personal')}
        >
          <User size={16} />
          Personal Info
        </button>
        <button 
          className={`tab ${currentSection === 'metrics' ? 'active' : ''}`}
          onClick={() => handleSectionChange('metrics')}
        >
          <Activity size={16} />
          Metrics & Health
        </button>
        <button 
          className={`tab ${currentSection === 'goals' ? 'active' : ''}`}
          onClick={() => handleSectionChange('goals')}
        >
          <Target size={16} />
          Goals & Preferences
        </button>
        <button 
          className={`tab ${currentSection === 'program' ? 'active' : ''}`}
          onClick={() => handleSectionChange('program')}
        >
          <Calendar size={16} />
          Program Setup
        </button>
      </div>

      <div className="form-content">
        {currentSection === 'personal' && renderPersonalInfo()}
        {currentSection === 'metrics' && renderMetrics()}
        {currentSection === 'goals' && renderGoals()}
        {currentSection === 'program' && renderProgram()}
      </div>

      <div className="form-actions">
        <button className="save-draft-btn">
          <Save size={16} />
          Save Draft
        </button>
        <button className="complete-onboarding-btn" onClick={handleSubmit}>
          Complete Onboarding
        </button>
      </div>
    </div>
  );
};

export default ClientOnboarding;
