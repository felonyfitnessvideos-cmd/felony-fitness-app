/**
 * @fileoverview Trainer Program Library Component
 * @description Complete program management interface for trainers including browsing, 
 * creating, and assigning workout programs to clients with Google Calendar integration.
 * 
 * @author Felony Fitness Development Team
 * @version 1.0.0
 * @since 2025-11-02
 * 
 * @requires React
 * @requires Supabase
 * @requires React Router
 * 
 * @component TrainerPrograms
 * @example
 * // Used in TrainerDashboard routing
 * <Route path="/programs/*" element={<TrainerPrograms />} />
 */

import {
  ArrowLeft,
  BookOpen,
  Edit,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import ProgramBuilderModal from '../../components/trainer/ProgramBuilderModal';
import ProgramEditorModal from '../../components/trainer/ProgramEditorModal';
import CustomMuscleMap from '../../components/workout-builder/CustomMuscleMap';
import { supabase } from '../../supabaseClient';
import { generateRoutines } from '../../utils/routineGenerator';
import './TrainerPrograms.css';

/**
 * @typedef {Object} Program
 * @property {string} id - Unique program identifier
 * @property {string} name - Display name of the program
 * @property {string} description - Detailed description
 * @property {string} difficulty_level - beginner|intermediate|advanced
 * @property {number} estimated_weeks - Duration in weeks
 * @property {Array} target_muscle_groups - Array of muscle groups
 * @property {string} created_by - Creator user ID
 * @property {string} created_at - ISO timestamp
 * @property {Object} creator_profile - Creator's profile information
 * @property {number} routine_count - Number of routines in program
 */

/**
 * @typedef {Object} ProgramRoutine
 * @property {string} id - Unique routine identifier
 * @property {string} name - Display name of the routine
 * @property {string} description - Detailed description
 * @property {number} week_number - Week in program sequence
 * @property {number} day_number - Day in week sequence
 * @property {Array} exercises - Array of exercise objects
 * @property {number} estimated_duration_minutes - Expected workout time
 * @property {string} difficulty_level - beginner|intermediate|advanced
 * @property {Array} equipment_needed - Required equipment list
 */

/**
 * Main Program Library Component
 */
const ProgramLibrary = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [programRoutines, setProgramRoutines] = useState({}); // Generated routines by program ID
  const [programFrequencies, setProgramFrequencies] = useState({}); // Selected frequency for each program
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState('beginner');
  const [selectedCategory, setSelectedCategory] = useState('Strength');
  const [editingProgram, setEditingProgram] = useState(null);
  const [showProgramBuilder, setShowProgramBuilder] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClientForProgram, setSelectedClientForProgram] = useState({}); // programId -> clientId mapping
  const [assigningToClient, setAssigningToClient] = useState(false);
  const [fullscreenMuscleMap, setFullscreenMuscleMap] = useState(null); // { muscles: [], programName: '' }
  const [expandedDescriptions, setExpandedDescriptions] = useState({}); // programId -> boolean mapping

  const handleDeleteProgram = async (programId) => {
    const programToDelete = programs.find(p => p.id === programId);
    if (!programToDelete) return;

    if (window.confirm(`Are you sure you want to delete the program "${programToDelete.name}"? This action cannot be undone.`)) {
      try {
        const { error } = await supabase
          .from('programs')
          .delete()
          .eq('id', programId)
          .eq('trainer_id', user.id); // ensure user can only delete their own.

        if (error) {
          // RLS will prevent deletion, but this is an extra check.
          if (error.code === '42501') { // row-level security violation
             alert('You do not have permission to delete this program.');
          } else {
            throw error;
          }
        } else {
            setPrograms(prevPrograms => prevPrograms.filter(p => p.id !== programId));
            alert('Program deleted successfully.');
        }

      } catch (err) {
        console.error('Error deleting program:', err);
        alert(`Failed to delete program: ${err.message}`);
      }
    }
  };

  const categories = [
    { name: 'Strength', icon: '🏋️' },
    { name: 'Hypertrophy', icon: '💪' },
    { name: 'Endurance', icon: '🏃' },
    { name: 'Flexibility', icon: '🤸' },
    { name: 'Balance', icon: '🧘' },
    { name: 'Recovery', icon: '⚕️' }
  ];

  /**
   * Fetch all available programs with creator information
   * @async
   * @function fetchPrograms
   * @returns {Promise<void>}
   */
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch programs from database
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (programsError) {
        throw programsError;
      }

      if (!programsData || programsData.length === 0) {
        setPrograms([]);
        setLoading(false);
        return;
      }

      // Collect all unique exercise IDs from all programs
      const allExerciseIds = new Set();
      programsData.forEach(program => {
        const exercisePool = program.exercise_pool || [];
        exercisePool.forEach(ex => {
          if (ex.exercise_id) {
            allExerciseIds.add(ex.exercise_id);
          }
        });
      });

      // Fetch all exercises in one query (without equipment_required - column doesn't exist)
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('id, name, primary_muscle, secondary_muscle, tertiary_muscle, difficulty_level')
        .in('id', Array.from(allExerciseIds));

      if (exercisesError) {
        console.error('Error fetching exercises:', exercisesError);
        // Continue without exercise data rather than failing completely
      }

      // Create exercise lookup map
      const exerciseMap = new Map();
      (exercisesData || []).forEach(ex => {
        exerciseMap.set(ex.id, ex);
      });

      // Process programs and hydrate exercise data
      const processedPrograms = programsData.map(program => {
        const exercisePool = program.exercise_pool || [];
        const muscleGroupsMap = new Map(); // Track muscle priority: { muscleName: 'primary' | 'secondary' | 'tertiary' }
        
        // Hydrate exercise pool with full exercise data
        const hydratedExercises = exercisePool.map(poolEntry => {
          const exercise = exerciseMap.get(poolEntry.exercise_id);
          
          // Extract muscle groups from either the pool entry or the exercise itself
          const muscles = poolEntry.muscle_groups || {
            primary: exercise?.primary_muscle ? [exercise.primary_muscle] : [],
            secondary: exercise?.secondary_muscle ? [exercise.secondary_muscle] : [],
            tertiary: exercise?.tertiary_muscle ? [exercise.tertiary_muscle] : []
          };

          // Track muscle groups with priority (primary > secondary > tertiary)
          // Always upgrade to higher priority if muscle appears in multiple exercises
          muscles.primary?.forEach(m => {
            if (m) {
              // Always set as primary (upgrade from secondary/tertiary if needed)
              muscleGroupsMap.set(m, 'primary');
            }
          });
          
          muscles.secondary?.forEach(m => {
            if (m) {
              const currentPriority = muscleGroupsMap.get(m);
              // Only set as secondary if not already primary
              if (!currentPriority || currentPriority === 'tertiary') {
                muscleGroupsMap.set(m, 'secondary');
              }
            }
          });
          
          muscles.tertiary?.forEach(m => {
            if (m && !muscleGroupsMap.has(m)) {
              // Only set as tertiary if not already in map
              muscleGroupsMap.set(m, 'tertiary');
            }
          });

          return {
            ...poolEntry,
            exercise_name: exercise?.name || 'Unknown Exercise',
            exercise_data: exercise,
            muscle_groups: muscles
          };
        });

        // Convert map to array of objects with priority info
        const targetMusclesWithPriority = Array.from(muscleGroupsMap.entries()).map(([name, priority]) => ({
          name,
          priority
        }));

        return {
          ...program,
          exercise_pool: hydratedExercises,
          target_muscle_groups: targetMusclesWithPriority,
          routine_count: hydratedExercises.length
        };
      });

      setPrograms(processedPrograms);

    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to load programs. Please try again.');
      setPrograms([]);

    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply filters to programs list
   * @function getFilteredPrograms
   * @returns {Array<Program>} Filtered programs array
   */
  const getFilteredPrograms = () => {
    return programs.filter(program => {
      // Category filter - match program type to selected category
      const categoryMatch = getCategoryMatch(program, selectedCategory);
      if (!categoryMatch) return false;

      // Difficulty filter
      if (difficultyFilter && program.difficulty_level !== difficultyFilter) {
        return false;
      }

      return true;
    });
  };

  /**
   * Check if program matches selected category
   * @function getCategoryMatch
   * @param {Program} program - Program to check
   * @param {string} category - Selected category
   * @returns {boolean} Whether program matches category
   */
  const getCategoryMatch = (program, category) => {
    const categoryLower = category.toLowerCase();

    // If program_type is defined, use it as the source of truth.
    if (program.program_type) {
      const programType = program.program_type.toLowerCase();
      
      // For the 'Balance' category, we allow 'strength' and 'flexibility' types as well,
      // as balance is often a component of these.
      if (categoryLower === 'balance') {
        return ['balance', 'strength', 'flexibility'].includes(programType);
      }
      
      // For all other categories, require an exact match.
      return programType === categoryLower;
    }

    // Fallback to text matching ONLY if program_type is not set.
    const programName = (program?.name || '').toLowerCase();
    const programDesc = (program?.description || '').toLowerCase();

    switch (category) {
      case 'Strength':
        return programName.includes('strength') ||
          programName.includes('power') ||
          programDesc.includes('strength');

      case 'Hypertrophy':
        return programName.includes('hypertrophy') ||
          programName.includes('builder') ||
          programDesc.includes('muscle growth');

      case 'Endurance':
        return programName.includes('endurance') ||
          programName.includes('cardio') ||
          programDesc.includes('endurance');

      case 'Flexibility':
        return programName.includes('flexibility') ||
          programName.includes('mobility') ||
          programDesc.includes('flexibility');

      case 'Balance':
        return programName.includes('balance') ||
          programName.includes('stability') ||
          programDesc.includes('balance');

      case 'Recovery':
        return programName.includes('recovery') ||
          programName.includes('restore') ||
          programDesc.includes('recovery');

      default:
        // If category is not matched, don't show the program
        return false;
    }
  };

  /**
   * Toggle description expanded state for a program
   * @function toggleDescription
   * @param {string} programId - Program ID
   */
  const toggleDescription = (programId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }));
  };

  /**
   * Get difficulty level display with emoji
   * @function getDifficultyDisplay
   * @param {string} level - Difficulty level
   * @returns {string} Formatted difficulty display
   */
  const getDifficultyDisplay = (level) => {
    const displays = {
      beginner: '🟢 Beginner',
      intermediate: '🟡 Intermediate',
      advanced: '🔴 Advanced'
    };
    return displays[level] || level;
  };

  /**
   * Handle frequency change and generate routines for a program
   * @function handleFrequencyChange
   * @param {string} programId - Program ID
   * @param {number} frequency - Training days per week (2-7)
   */
  const handleFrequencyChange = (programId, frequency) => {
    const program = programs.find(p => p.id === programId);
    if (!program) return;

    // Update selected frequency
    setProgramFrequencies(prev => ({
      ...prev,
      [programId]: frequency
    }));

    // Generate routines from exercise pool
    try {
      const routines = generateRoutines(program.exercise_pool, frequency);
      setProgramRoutines(prev => ({
        ...prev,
        [programId]: routines
      }));
    } catch (err) {
      console.error('Error generating routines:', err);
    }
  };

  /**
   * Get selected frequency for a program (default to 3)
   * @function getProgramFrequency
   * @param {string} programId - Program ID
   * @returns {number} Selected frequency
   */
  const getProgramFrequency = (programId) => {
    return programFrequencies[programId] || 3;
  };

  /**
   * Get generated routines for a program
   * @function getProgramRoutines
   * @param {string} programId - Program ID
   * @returns {Array} Generated routines
   */
  const getProgramRoutines = (programId) => {
    return programRoutines[programId] || [];
  };

  /**
   * Fetch trainer's active clients
   * @async
   * @function fetchClients
   * @returns {Promise<void>}
   */
  const fetchClients = async () => {
    if (!user?.id) return;

    try {
      // Query trainer_clients - full_name is auto-synced from user_profiles via trigger
      const { data, error } = await supabase
        .from('trainer_clients')
        .select('client_id, full_name')
        .eq('trainer_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map to simple structure for dropdown
      const clientsList = data.map(tc => ({
        id: tc.client_id,
        name: tc.full_name || 'Unknown Client'
      }));

      setClients(clientsList);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  /**
   * Assign program to a client by creating workout_routines
   * @async
   * @function handleAssignToClient
   * @param {string} programId - Program ID
   * @returns {Promise<void>}
   */
  const handleAssignToClient = async (programId) => {
    const clientId = selectedClientForProgram[programId];
    
    if (!clientId) {
      alert('Please select a client first');
      return;
    }

    const program = programs.find(p => p.id === programId);
    const routines = getProgramRoutines(programId);

    if (!routines || routines.length === 0) {
      alert('No routines generated for this program');
      return;
    }

    try {
      setAssigningToClient(true);

      // Create workout_routines for each generated routine
      const workoutRoutines = routines.map((routine, index) => ({
        user_id: clientId,
        routine_name: routine.name,
        name: routine.name,
        description: `Day ${index + 1}: ${routine.name}`,
        is_active: true,
        is_public: false
      }));

      const { data: insertedRoutines, error: insertError } = await supabase
        .from('workout_routines')
        .insert(workoutRoutines)
        .select();

      if (insertError) throw insertError;

      // Create routine_exercises linking records for each routine
      const routineExercises = [];
      insertedRoutines.forEach((routine, routineIndex) => {
        const exercises = routines[routineIndex].exercises || [];
        exercises.forEach((exercise, exerciseIndex) => {
          routineExercises.push({
            routine_id: routine.id,
            exercise_id: exercise.exercise_id,
            exercise_order: exerciseIndex + 1,
            target_sets: exercise.sets || 3,
            rest_seconds: exercise.rest_seconds || 60
          });
        });
      });

      // Get routine IDs for cleanup if needed
      const routineIds = insertedRoutines.map(r => r.id);

      try {
        // Insert routine_exercises if any exist
        // NOTE: This requires RLS policy to allow trainers to insert exercises for client routines
        // Policy needed: Allow INSERT on routine_exercises where routine_id's user_id is in trainer_clients
        if (routineExercises.length > 0) {
          const { error: exercisesError } = await supabase
            .from('routine_exercises')
            .insert(routineExercises);

          if (exercisesError) {
            console.error('RLS Error inserting routine_exercises:', exercisesError);
            throw new Error(`Unable to add exercises to routines. This may be a permissions issue. Error: ${exercisesError.message}`);
          }
        }

        // Update trainer_clients with the routine IDs and program name
        const { error: updateError } = await supabase
          .from('trainer_clients')
          .update({
            assigned_program_id: programId,
            program_name: program.name,
            generated_routine_ids: routineIds,
            updated_at: new Date().toISOString()
          })
          .eq('trainer_id', user.id)
          .eq('client_id', clientId);

        if (updateError) throw updateError;
      } catch (err) {
        // Rollback: delete created routines if downstream operations fail
        await supabase.from('workout_routines').delete().in('id', routineIds);
        throw err;
      }

      alert(`Successfully assigned ${program.name} to client! ${routines.length} workouts created.`);
      
      // Clear selection
      setSelectedClientForProgram(prev => {
        const updated = { ...prev };
        delete updated[programId];
        return updated;
      });

    } catch (error) {
      console.error('Error assigning program to client:', error);
      alert('Failed to assign program. Please try again.');
    } finally {
      setAssigningToClient(false);
    }
  };


  // Load programs on component mount
  useEffect(() => {
    fetchPrograms();
    fetchClients();
    // fetchPrograms and fetchClients are stable functions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate default routines for all programs on initial load
  useEffect(() => {
    if (programs.length > 0) {
      const defaultFrequency = 3;
      const newRoutines = {};
      const newFrequencies = {};

      programs.forEach(program => {
        if (program.exercise_pool && program.exercise_pool.length > 0) {
          const routines = generateRoutines(program.exercise_pool, defaultFrequency);
          newRoutines[program.id] = routines;
          newFrequencies[program.id] = defaultFrequency;
        }
      });

      setProgramRoutines(newRoutines);
      setProgramFrequencies(newFrequencies);
    }
  }, [programs]);

  const filteredPrograms = getFilteredPrograms();

  if (loading) {
    return (
      <div className="trainer-programs-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading programs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trainer-programs-container">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchPrograms} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trainer-programs-container">
      {/* Header */}
      <div className="programs-header">
        {/* Category Buttons - Single scrollable row */}
        <div className="category-buttons">
          {categories.map(category => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`category-button ${selectedCategory === category.name ? 'active' : ''}`}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Controls Row - Dropdown and New Program button */}
        <div className="header-controls">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="filter-select level-select"
          >
            <option value="beginner">🟢 Beginner</option>
            <option value="intermediate">🟡 Intermediate</option>
            <option value="advanced">🔴 Advanced</option>
          </select>

          <button 
            className="create-program-button"
            onClick={() => setShowProgramBuilder(true)}
          >
            <Plus size={18} />
            New Program
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="programs-results">
        {filteredPrograms.length === 0 ? (
          <div className="no-results">
            <BookOpen size={48} />
            <h3>No programs found</h3>
            <p>Try selecting a different category or difficulty level.</p>
          </div>
        ) : (
          <div className="programs-grid">
            {filteredPrograms.map(program => (
              <div key={program.id} className="program-card">
                {/* Left side - Program Info */}
                <div className="program-main-content">
                  <div className="program-header">
                    <h3>{program.name}</h3>
                    <div className="program-difficulty">
                      {getDifficultyDisplay(program.difficulty_level)}
                    </div>
                  </div>
                  
                  <div className="program-card-actions">
                    <button 
                      className="program-edit-btn"
                      onClick={() => setEditingProgram(program)}
                      title="Edit Program"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="program-delete-btn"
                      onClick={() => handleDeleteProgram(program.id)}
                      title="Delete Program"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="program-description-container">
                    <p className={`program-description ${expandedDescriptions[program.id] ? 'expanded' : ''}`}>
                      {program.description}
                    </p>
                    {program.description && program.description.length > 120 && (
                      <button 
                        className="description-toggle-btn"
                        onClick={() => toggleDescription(program.id)}
                      >
                        {expandedDescriptions[program.id] ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>

                  {/* Exercise List */}
                  {program.routine_count > 0 && (
                    <div className="program-exercises">
                      <h4>Exercises in Pool ({program.routine_count}):</h4>
                      <ul className="exercise-list">
                        {(program.exercise_pool || []).map((exercise, idx) => (
                          <li key={idx}>
                            • {exercise.exercise_name} - {exercise.sets}x{exercise.reps} @ {exercise.rest_seconds}s rest
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="program-actions">
                    <select 
                      className="client-search-btn"
                      value={selectedClientForProgram[program.id] || ''}
                      onChange={(e) => setSelectedClientForProgram(prev => ({
                        ...prev,
                        [program.id]: e.target.value
                      }))}
                    >
                      <option value="">Select Client...</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                    <button 
                      className="add-to-client-btn"
                      onClick={() => handleAssignToClient(program.id)}
                      disabled={assigningToClient || !selectedClientForProgram[program.id]}
                    >
                      {assigningToClient ? 'Assigning...' : 'Add To Client'}
                    </button>
                  </div>
                </div>

                {/* Right side - Routine Preview */}
                <div className="program-schedule-section">
                  {/* Frequency Selector */}
                  <div className="schedule-header">
                    <label>Training Frequency:</label>
                    <select 
                      className="days-per-week-selector"
                      value={getProgramFrequency(program.id)}
                      onChange={(e) => handleFrequencyChange(program.id, parseInt(e.target.value))}
                    >
                      <option value="2">2 days/week</option>
                      <option value="3">3 days/week</option>
                      <option value="4">4 days/week</option>
                      <option value="5">5 days/week</option>
                      <option value="6">6 days/week</option>
                    </select>
                  </div>

                  {/* Muscle Map Preview - Shows coverage gaps */}
                  <div className="muscle-map-section">
                    <div 
                      className="muscle-map-container clickable"
                      onClick={() => {

                        const primaryMuscles = (program.target_muscle_groups || []).filter(m => m.priority === 'primary');

                        setFullscreenMuscleMap({ 
                          muscles: primaryMuscles, 
                          programName: program.name 
                        });
                      }}
                      title="Click to enlarge"
                    >
                      <div className="muscle-map-front">
                        <CustomMuscleMap
                          highlightedMuscles={(program.target_muscle_groups || []).filter(m => m.priority === 'primary')}
                          variant="front"
                          className="muscle-map-compact"
                        />
                      </div>
                      <div className="muscle-map-back">
                        <CustomMuscleMap
                          highlightedMuscles={(program.target_muscle_groups || []).filter(m => m.priority === 'primary')}
                          variant="back"
                          className="muscle-map-compact"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Generated Routines Preview */}
                  {getProgramRoutines(program.id).length > 0 && (
                    <div className="routine-preview">
                      <div className="routine-grid">
                        {getProgramRoutines(program.id).map((routine, idx) => (
                          <div key={idx} className="routine-card-mini">
                            <div className="routine-header-mini">
                              <span className="routine-day">Day {idx + 1}</span>
                              <span className="routine-name-mini">{routine.name}</span>
                            </div>
                            <div className="routine-stats-mini">
                              <span>{routine.exercises.length} ex</span>
                              <span>{routine.total_sets} sets</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Program Stats */}
                  <div className="program-stats">
                    <div className="stat-item">
                      <span className="stat-label">Duration:</span>
                      <span className="stat-value">{program.estimated_weeks || 'N/A'} weeks</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Type:</span>
                      <span className="stat-value">{program.program_type}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Exercises:</span>
                      <span className="stat-value">{program.routine_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Program Editor Modal */}
      {editingProgram && (
        <ProgramEditorModal
          program={editingProgram}
          onClose={() => setEditingProgram(null)}
          onSave={async (updatedProgram) => {
            // Update the programs state
            setPrograms(prevPrograms => 
              prevPrograms.map(p => 
                p.id === updatedProgram.id ? { ...p, ...updatedProgram } : p
              )
            );
            
            // Refresh the program from database to get full data
            await fetchPrograms();
            
            // Close the modal
            setEditingProgram(null);
          }}
        />
      )}

      {/* Program Builder Modal */}
      {showProgramBuilder && (
        <ProgramBuilderModal
          onClose={() => setShowProgramBuilder(false)}
          onSave={async (_newProgram) => {
            // Refresh programs list to include the new program
            await fetchPrograms();
            
            // Close the modal
            setShowProgramBuilder(false);
          }}
        />
      )}

      {/* Fullscreen Muscle Map Modal */}
      {fullscreenMuscleMap && (
        <div className="fullscreen-muscle-modal" onClick={() => setFullscreenMuscleMap(null)}>
          <div className="modal-overlay">
            <div className="modal-content-muscle" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{fullscreenMuscleMap.programName} - Target Muscles</h2>
                <button 
                  className="close-modal-btn"
                  onClick={() => setFullscreenMuscleMap(null)}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="fullscreen-muscle-maps">
                <div className="fullscreen-map-front">
                  <h3>Front</h3>
                  <CustomMuscleMap
                    key={`fullscreen-front-${fullscreenMuscleMap.programName}`}
                    highlightedMuscles={fullscreenMuscleMap.muscles}
                    variant="front"
                    className="muscle-map-fullscreen"
                  />
                </div>
                <div className="fullscreen-map-back">
                  <h3>Back</h3>
                  <CustomMuscleMap
                    key={`fullscreen-back-${fullscreenMuscleMap.programName}`}
                    highlightedMuscles={fullscreenMuscleMap.muscles}
                    variant="back"
                    className="muscle-map-fullscreen"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Program Detail Component - Placeholder
 * TODO: Implement full program detail functionality
 */
const ProgramDetail = () => {
  const navigate = useNavigate();

  const [loading] = useState(true);
  const [program] = useState(null);

  // [Previous ProgramDetail logic would go here - similar to ProgramDetailPage]
  // For brevity, I'll implement the key parts

  const goBack = () => {
    navigate('/trainer-dashboard/programs');
  };

  if (loading) {
    return (
      <div className="program-detail-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading program details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="program-detail-container">
      <div className="detail-header">
        <button onClick={goBack} className="back-button">
          <ArrowLeft size={20} />
          Back to Programs
        </button>
        <h2>{program?.name || 'Program Details'}</h2>
      </div>

      {/* Program details and routines would go here */}
      <div className="coming-soon">
        <p>Program detail view coming soon!</p>
        <p>Click back to return to the program library.</p>
      </div>
    </div>
  );
};

/**
 * Main TrainerPrograms Component with Routing
 */
const TrainerPrograms = () => {
  const _location = useLocation();

  return (
    <div className="trainer-programs-wrapper">
      <Routes>
        <Route path="/" element={<ProgramLibrary />} />
        <Route path="/:programId" element={<ProgramDetail />} />
      </Routes>
    </div>
  );
};

export default TrainerPrograms;
