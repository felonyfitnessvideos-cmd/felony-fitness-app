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

import {
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  Heart,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Save,
  Scale,
  Search,
  Target,
  User
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../supabaseClient.js';
import './ClientOnboarding.css';

/**
 * Mapping of form goal values to database fitness_goal enum values
 * @constant
 */
const GOAL_MAP = {
  'weight-loss': 'lose_weight',
  'muscle-gain': 'build_muscle',
  'strength': 'build_muscle',
  'endurance': 'improve_endurance',
  'general-fitness': 'maintain_weight',
  'sport-specific': 'improve_endurance',
  'rehabilitation': 'maintain_weight'
};

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
  const [clientUuid, setClientUuid] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');

  /**
   * Validate UUID format
   */
  const isValidUuid = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  /**
   * Lookup user by UUID and auto-fill form
   */
  const handleUuidLookup = async () => {
    if (!clientUuid.trim()) {
      setLookupMessage('Please enter a UUID');
      return;
    }

    // Validate UUID format
    if (!isValidUuid(clientUuid.trim())) {
      setLookupMessage('Invalid UUID format. Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
      return;
    }

    setLookupLoading(true);
    setLookupMessage('');

    try {
      // Query user_profiles by ID
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', clientUuid.trim())
        .single();

      if (error || !profile) {
        setLookupMessage('User not found. Please check the UUID and try again.');
        setLookupLoading(false);
        return;
      }

      // Query body_metrics for most recent body fat percentage
      const { data: metrics } = await supabase
        .from('body_metrics')
        .select('body_fat_percentage, weight_lbs')
        .eq('user_id', clientUuid.trim())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Convert height_cm back to inches for the form
      let heightInInches = '';
      if (profile.height_cm) {
        heightInInches = Math.round(profile.height_cm / 2.54).toString();
      }

      // Auto-fill form with existing data
      setFormData(prev => ({
        ...prev,
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        dateOfBirth: profile.date_of_birth || '',
        gender: profile.sex || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zip_code || '',
        height: heightInInches,
        weight: profile.current_weight_lbs ? profile.current_weight_lbs.toString() : (metrics?.weight_lbs ? metrics.weight_lbs.toString() : ''),
        bodyFatPercentage: metrics?.body_fat_percentage ? metrics.body_fat_percentage.toString() : ''
      }));

      // Create user display name
      const userName = profile.first_name && profile.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : profile.email || 'User';

      setLookupMessage(`✅ User found: ${userName}`);
    } catch (err) {
      console.error('Error looking up user:', err);
      setLookupMessage('Error looking up user. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

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

  const validateSection = () => {
    const newErrors = {};

    // No required fields - all validation removed
    // Clients can provide as much or as little information as they're comfortable with

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSectionChange = (section) => {
    // Always allow section changes since no validation required
    setCurrentSection(section);
  };

  const handleSubmit = async () => {
    if (validateSection(currentSection)) {
      try {

        // Step 1: Get trainer information
        const { data: { user: trainer }, error: trainerError } = await supabase.auth.getUser();
        if (trainerError || !trainer) {
          throw new Error('Unable to get trainer information');
        }

        // Step 2: Prepare client identifier
        const trimmedUuid = clientUuid?.trim();
        // Check if lookup was successful
        lookupMessage.includes('✅');

        // Step 3: Create trainer-client relationship
        // Prepare comprehensive intake notes with all collected data
        const intakeData = {
          personalInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          },
          emergencyContact: {
            name: formData.emergencyName,
            phone: formData.emergencyPhone,
            relationship: formData.emergencyRelationship
          },
          metricsHealth: {
            height: formData.height,
            weight: formData.weight,
            bodyFatPercentage: formData.bodyFatPercentage,
            restingHeartRate: formData.restingHeartRate,
            bloodPressure: formData.bloodPressure,
            medicalConditions: formData.medicalConditions,
            medications: formData.medications,
            injuries: formData.injuries,
            allergies: formData.allergies,
            doctorClearance: formData.doctorClearance
          },
          goalsPreferences: {
            primaryGoal: formData.primaryGoal,
            secondaryGoals: formData.secondaryGoals,
            targetWeight: formData.targetWeight,
            timeframe: formData.timeframe,
            workoutDays: formData.workoutDays,
            preferredTime: formData.preferredTime,
            sessionLength: formData.sessionLength,
            exercisePreferences: formData.exercisePreferences,
            exerciseRestrictions: formData.exerciseRestrictions
          },
          programSetup: {
            programType: formData.programType,
            nutritionCoaching: formData.nutritionCoaching,
            startDate: formData.startDate,
            notes: formData.notes
          },
          onboardedAt: new Date().toISOString()
        };

        const relationshipNotes = `CLIENT INTAKE DATA:\n${JSON.stringify(intakeData, null, 2)}`;

        // Use UUID if it was looked up, otherwise use email
        const { addClientToTrainer } = await import('../../utils/userRoleUtils.js');
        const relationshipId = await addClientToTrainer(
          trainer.id,
          trimmedUuid || null, // Use UUID if available
          relationshipNotes, // Send comprehensive intake data as notes
          !trimmedUuid ? formData.email : null // Use email only if no UUID
        );

        if (!relationshipId) {
          throw new Error('Error creating trainer-client relationship');
        }

        // Step 4: Update client's user_profiles with form data
        // Build update object with only filled fields
        const profileUpdates = {
          updated_at: new Date().toISOString()
        };

        // Personal Info - only fields that exist in user_profiles table
        if (formData.firstName) profileUpdates.first_name = formData.firstName;
        if (formData.lastName) profileUpdates.last_name = formData.lastName;
        if (formData.email) profileUpdates.email = formData.email;
        if (formData.dateOfBirth) profileUpdates.date_of_birth = formData.dateOfBirth; // Sent as string, DB converts to DATE
        if (formData.gender) profileUpdates.sex = formData.gender.toLowerCase(); // Sent as string
        // Note: phone, address, city, state, zip_code don't exist in user_profiles - stored in intake notes instead

        // Metrics - height sent as TEXT string, weights as numeric in lbs
        if (formData.height) {
          profileUpdates.height_cm = formData.height; // Send as TEXT string
        }
        if (formData.weight) {
          // Weight in pounds as numeric DECIMAL
          profileUpdates.current_weight_lbs = parseFloat(formData.weight) || null;
        }
        if (formData.targetWeight) {
          // Target weight in pounds as numeric DECIMAL
          profileUpdates.target_weight_lbs = parseFloat(formData.targetWeight) || null;
        }

        // Goals - sent as TEXT string, map form values to database enum
        if (formData.primaryGoal) {
          profileUpdates.fitness_goal = GOAL_MAP[formData.primaryGoal] || null;
        }

        // Update the user_profiles table only if we have a valid UUID
        if (trimmedUuid) {
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update(profileUpdates)
            .eq('id', trimmedUuid);

          if (updateError) {
            console.error('❌ Error updating user profile:', updateError);
            throw new Error(`Failed to save client data: ${updateError.message}`);
          }

        } else {
          // No additional processing needed for client update
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
        setClientUuid('');
        setLookupMessage('');

      } catch (error) {
        console.error('Onboarding error:', error);
        alert(`Error onboarding client: ${error.message}`);
      }
    }
  };

  const renderPersonalInfo = () => (
    <div className="form-section">
      {/* UUID Lookup Field */}
      <div className="form-group uuid-lookup-field">
        <div className="uuid-label-row">
          <label>
            <Search size={16} /> Load Existing User
          </label>
          <button
            onClick={handleUuidLookup}
            disabled={lookupLoading}
            className="load-button-inline"
            type="button"
          >
            {lookupLoading ? 'Loading...' : 'Load User Data'}
          </button>
        </div>
        <input
          type="text"
          placeholder={lookupMessage && lookupMessage.includes('✅') ? lookupMessage : "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}
          value={lookupMessage && lookupMessage.includes('✅') ? '' : clientUuid}
          onChange={(e) => setClientUuid(e.target.value)}
          pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
          title="UUID format: 8-4-4-4-12 hexadecimal characters"
          className={`uuid-input-inline ${lookupMessage ? (lookupMessage.includes('✅') ? 'success' : 'error') : ''}`}
          maxLength="36"
          disabled={lookupMessage && lookupMessage.includes('✅')}
        />
        {lookupMessage && !lookupMessage.includes('✅') && (
          <div className="lookup-error-message">
            {lookupMessage}
          </div>
        )}
      </div>

      <div className="form-row compact-names">
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={errors.firstName ? 'error' : ''}
            maxLength="20"
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={errors.lastName ? 'error' : ''}
            maxLength="20"
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label><Mail size={16} /> Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label><Phone size={16} /> Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>
      </div>

      <div className="form-row compact-date-gender">
        <div className="form-group">
          <label><Calendar size={16} /> Date of Birth</label>
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

      <div className="form-group">
        <label>City</label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
        />
      </div>

      <div className="form-row compact-state-zip">
        <div className="form-group">
          <label>State</label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            maxLength="2"
            placeholder="CA"
          />
        </div>

        <div className="form-group">
          <label>Zip Code</label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            maxLength="10"
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
          <label><Ruler size={16} /> Height (inches)</label>
          <input
            type="number"
            value={formData.height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            className={errors.height ? 'error' : ''}
          />
          {errors.height && <span className="error-text">{errors.height}</span>}
        </div>

        <div className="form-group">
          <label><Scale size={16} /> Weight (lbs)</label>
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
          <label>Body Fat %</label>
          <input
            type="number"
            step="0.1"
            value={formData.bodyFatPercentage}
            onChange={(e) => handleInputChange('bodyFatPercentage', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label><Heart size={16} /> Resting Heart Rate</label>
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
        <label>Primary Goal</label>
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
        <button className="submit-btn" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default ClientOnboarding;
