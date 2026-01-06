/**
 * @file ProgramBuilderModal.jsx
 * @description Full-featured program builder for creating new workout programs from scratch
 * @project Felony Fitness - Trainer Programs
 * 
 * Features:
 * - Basic program info (name, description, difficulty, type, duration)
 * - Exercise pool builder with search
 * - Sets/reps/rest configuration for each exercise
 * - AI-powered program generation (optional)
 * - Preview and validation before saving
 */

import { Bot, Plus, Save, Search, Trash2, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useAuth } from '../../useAuth';
import { supabase } from '../../supabaseClient';
import './ProgramBuilderModal.css';

/**
 * Program Builder Modal Component
 * Complete wizard-style interface for creating workout programs
 */
const ProgramBuilderModal = ({ onClose, onSave }) => {
  const { user } = useAuth();
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1); // 1=Basic Info, 2=Exercise Pool, 3=Review
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty_level: 'intermediate',
    program_type: 'strength',
    estimated_weeks: 8,
    exercise_pool: []
  });
  
  // Exercise search state
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [availableExercises, setAvailableExercises] = useState([]);
  const [searching, setSearching] = useState(false);
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Search for exercises in the database
   */
  const searchExercises = async (query) => {
    if (!query || query.length < 2) {
      setAvailableExercises([]);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, primary_muscle, secondary_muscle, difficulty_level, equipment_needed')
        .ilike('name', `%${query}%`)
        .limit(20);

      if (error) throw error;
      setAvailableExercises(data || []);
    } catch (err) {
      console.error('Error searching exercises:', err);
    } finally {
      setSearching(false);
    }
  };

  /**
   * Add exercise to pool
   */
  const addExerciseToPool = (exercise) => {
    // Check if already in pool
    const alreadyExists = formData.exercise_pool.some(
      ex => ex.exercise_id === exercise.id
    );

    if (alreadyExists) {
      alert('Exercise already in pool');
      return;
    }

    const newExercise = {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      sets: 3,
      reps: '10-12',
      rest_seconds: 90,
      notes: '',
      is_warmup: false, // Default to working set
      target_intensity_pct: 80, // Default to 80% 1RM (working set intensity)
      muscle_groups: {
        primary: exercise.primary_muscle ? [exercise.primary_muscle] : [],
        secondary: exercise.secondary_muscle ? [exercise.secondary_muscle] : [],
        tertiary: []
      }
    };

    setFormData(prev => ({
      ...prev,
      exercise_pool: [...prev.exercise_pool, newExercise]
    }));

    setExerciseSearch('');
    setAvailableExercises([]);
  };

  /**
   * Remove exercise from pool
   */
  const removeExercise = (index) => {
    setFormData(prev => ({
      ...prev,
      exercise_pool: prev.exercise_pool.filter((_, i) => i !== index)
    }));
  };

  /**
   * Update exercise in pool
   */
  const updateExercise = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      exercise_pool: prev.exercise_pool.map((ex, i) => 
        i === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  /**
   * Handle form field changes
   */
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  /**
   * Validate current step
   */
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Program name is required';
      }
      if (!formData.description.trim()) {
        newErrors.description = 'Program description is required';
      }
      if (formData.estimated_weeks < 1 || formData.estimated_weeks > 52) {
        newErrors.estimated_weeks = 'Duration must be between 1 and 52 weeks';
      }
    }

    if (step === 2) {
      if (formData.exercise_pool.length === 0) {
        newErrors.exercise_pool = 'Add at least one exercise to the pool';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Navigate to next step
   */
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  /**
   * Save program to database
   */
  const handleSave = async () => {
    if (!validateStep(2)) {
      return;
    }

    if (!user?.id) {
      alert('You must be logged in to create a program');
      return;
    }

    setSaving(true);
    try {
      // Extract target muscle groups from exercise pool
      const muscleGroups = new Set();
      formData.exercise_pool.forEach(ex => {
        ex.muscle_groups?.primary?.forEach(m => m && muscleGroups.add(m));
        ex.muscle_groups?.secondary?.forEach(m => m && muscleGroups.add(m));
        ex.muscle_groups?.tertiary?.forEach(m => m && muscleGroups.add(m));
      });

      const programData = {
        name: formData.name,
        description: formData.description,
        difficulty_level: formData.difficulty_level,
        program_type: formData.program_type,
        estimated_weeks: formData.estimated_weeks,
        exercise_pool: formData.exercise_pool,
        target_muscle_groups: Array.from(muscleGroups),
        is_active: true,
        created_by: user.id,
        trainer_id: user.id,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('programs')
        .insert(programData)
        .select()
        .single();

      if (error) throw error;

      alert(`Program "${formData.name}" created successfully!`);
      onSave(data);
      onClose();
    } catch (err) {
      console.error('Error saving program:', err);
      alert(`Failed to save program: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Render step indicator
   */
  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
        <div className="step-number">1</div>
        <div className="step-label">Basic Info</div>
      </div>
      <div className="step-line"></div>
      <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
        <div className="step-number">2</div>
        <div className="step-label">Exercise Pool</div>
      </div>
      <div className="step-line"></div>
      <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
        <div className="step-number">3</div>
        <div className="step-label">Review</div>
      </div>
    </div>
  );

  /**
   * Render Step 1: Basic Information
   */
  const renderBasicInfoStep = () => (
    <div className="step-content">
      <h3>Program Information</h3>
      
      <div className="form-group">
        <label>Program Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder="e.g., 8-Week Strength Builder"
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Describe the program goals, target audience, and what makes it unique..."
          rows={4}
          className={errors.description ? 'error' : ''}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Difficulty Level</label>
          <select
            value={formData.difficulty_level}
            onChange={(e) => handleFieldChange('difficulty_level', e.target.value)}
          >
            <option value="beginner">🟢 Beginner</option>
            <option value="intermediate">🟡 Intermediate</option>
            <option value="advanced">🔴 Advanced</option>
          </select>
        </div>

        <div className="form-group">
          <label>Program Type</label>
          <select
            value={formData.program_type}
            onChange={(e) => handleFieldChange('program_type', e.target.value)}
          >
            <option value="strength">Strength</option>
            <option value="hypertrophy">Hypertrophy</option>
            <option value="powerlifting">Powerlifting</option>
            <option value="endurance">Endurance</option>
            <option value="general">General Fitness</option>
          </select>
        </div>

        <div className="form-group">
          <label>Duration (weeks) *</label>
          <input
            type="number"
            value={formData.estimated_weeks}
            onChange={(e) => handleFieldChange('estimated_weeks', parseInt(e.target.value))}
            min="1"
            max="52"
            className={errors.estimated_weeks ? 'error' : ''}
          />
          {errors.estimated_weeks && <span className="error-message">{errors.estimated_weeks}</span>}
        </div>
      </div>
    </div>
  );

  /**
   * Render Step 2: Exercise Pool
   */
  const renderExercisePoolStep = () => (
    <div className="step-content">
      <h3>Exercise Pool ({formData.exercise_pool.length})</h3>
      <p className="step-description">
        Add exercises that will be used in this program. These exercises will be distributed across workout days.
      </p>
      
      {/* Exercise Search */}
      <div className="exercise-search">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            value={exerciseSearch}
            onChange={(e) => {
              setExerciseSearch(e.target.value);
              searchExercises(e.target.value);
            }}
            placeholder="Search exercises to add (e.g., 'bench press', 'squat')..."
          />
        </div>
        
        {searching && exerciseSearch.length >= 2 && (
          <div className="exercise-search-results">
            <div className="exercise-result-item">
              <div className="exercise-result-name">Searching...</div>
            </div>
          </div>
        )}
        
        {!searching && availableExercises.length > 0 && (
          <div className="exercise-search-results">
            {availableExercises.map(exercise => (
              <div
                key={exercise.id}
                className="exercise-result-item"
                onClick={() => addExerciseToPool(exercise)}
              >
                <div className="exercise-result-name">{exercise.name}</div>
                <div className="exercise-result-muscle">{exercise.primary_muscle}</div>
                <button className="add-exercise-btn">
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {errors.exercise_pool && (
        <div className="error-message-box">{errors.exercise_pool}</div>
      )}

      {/* Exercise List */}
      <div className="exercise-pool-list">
        {formData.exercise_pool.length === 0 ? (
          <div className="empty-pool">
            <Search size={32} />
            <p>No exercises added yet</p>
            <small>Search and add exercises above to build your program</small>
          </div>
        ) : (
          formData.exercise_pool.map((exercise, index) => (
            <div key={index} className="exercise-pool-item">
              <div className="exercise-pool-header">
                <div className="exercise-pool-name">
                  <strong>{exercise.exercise_name}</strong>
                  <span className="exercise-pool-muscle">
                    {exercise.muscle_groups?.primary?.[0] || 'N/A'}
                  </span>
                </div>
                <button
                  className="remove-exercise-btn"
                  onClick={() => removeExercise(index)}
                  title="Remove exercise"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="exercise-pool-controls">
                <div className="control-group">
                  <label>Sets</label>
                  <input
                    type="number"
                    value={exercise.sets}
                    onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                    min="1"
                    max="10"
                    className="small-input"
                  />
                </div>
                <div className="control-group">
                  <label>Reps</label>
                  <input
                    type="text"
                    value={exercise.reps}
                    onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                    placeholder="8-12"
                    className="small-input"
                  />
                </div>
                <div className="control-group">
                  <label>Rest (sec)</label>
                  <input
                    type="number"
                    value={exercise.rest_seconds}
                    onChange={(e) => updateExercise(index, 'rest_seconds', parseInt(e.target.value))}
                    min="30"
                    max="300"
                    step="15"
                    className="small-input"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  /**
   * Render Step 3: Review
   */
  const renderReviewStep = () => {
    const muscleGroups = new Set();
    formData.exercise_pool.forEach(ex => {
      ex.muscle_groups?.primary?.forEach(m => m && muscleGroups.add(m));
      ex.muscle_groups?.secondary?.forEach(m => m && muscleGroups.add(m));
    });

    return (
      <div className="step-content">
        <h3>Review & Create</h3>
        <p className="step-description">
          Review your program details before creating it.
        </p>

        <div className="review-section">
          <h4>Program Details</h4>
          <div className="review-grid">
            <div className="review-item">
              <span className="review-label">Name:</span>
              <span className="review-value">{formData.name}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Description:</span>
              <span className="review-value">{formData.description}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Difficulty:</span>
              <span className="review-value">
                {formData.difficulty_level === 'beginner' && '🟢 Beginner'}
                {formData.difficulty_level === 'intermediate' && '🟡 Intermediate'}
                {formData.difficulty_level === 'advanced' && '🔴 Advanced'}
              </span>
            </div>
            <div className="review-item">
              <span className="review-label">Type:</span>
              <span className="review-value">{formData.program_type}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Duration:</span>
              <span className="review-value">{formData.estimated_weeks} weeks</span>
            </div>
            <div className="review-item">
              <span className="review-label">Exercises:</span>
              <span className="review-value">{formData.exercise_pool.length} exercises</span>
            </div>
            <div className="review-item">
              <span className="review-label">Target Muscles:</span>
              <span className="review-value">
                {Array.from(muscleGroups).join(', ') || 'None specified'}
              </span>
            </div>
          </div>
        </div>

        <div className="review-section">
          <h4>Exercise Pool</h4>
          <div className="review-exercises">
            {formData.exercise_pool.map((ex, idx) => (
              <div key={idx} className="review-exercise-item">
                <span className="exercise-number">{idx + 1}.</span>
                <span className="exercise-name">{ex.exercise_name}</span>
                <span className="exercise-config">{ex.sets}x{ex.reps} @ {ex.rest_seconds}s</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="program-builder-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>
            <Bot size={24} />
            Create New Program
          </h2>
          <button onClick={onClose} className="close-btn" aria-label="Close">
            <X size={24} />
          </button>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Content */}
        <div className="modal-body">
          {currentStep === 1 && renderBasicInfoStep()}
          {currentStep === 2 && renderExercisePoolStep()}
          {currentStep === 3 && renderReviewStep()}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            className="btn-secondary" 
            onClick={currentStep === 1 ? onClose : goToPreviousStep}
          >
            {currentStep === 1 ? 'Cancel' : '← Previous'}
          </button>
          
          {currentStep < 3 ? (
            <button className="btn-primary" onClick={goToNextStep}>
              Next →
            </button>
          ) : (
            <button 
              className="btn-primary" 
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={18} />
              {saving ? 'Creating...' : 'Create Program'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ProgramBuilderModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default ProgramBuilderModal;
