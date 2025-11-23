/**
 * @file ProRoutineCategoryPage.jsx
 * @description This page displays a list of pro routines for a specific category.
 * @project Felony Fitness
 */

/**
 * ProRoutineCategoryPage.jsx
 *
 * Lists pro routines in a category and allows viewing details or importing
 * a routine. Fetches a small set of data from Supabase and is resilient to
 * missing data during staged deploys.
 */
/**
 * ProRoutineCategoryPage — shows a list of pro routine categories.
 *
 * Lightweight page: categories are static-ish and can be rendered from
 * local data or a cached endpoint.
 */

import { Dumbbell, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useNavigate, useParams } from 'react-router-dom';
import SubPageHeader from '../components/SubPageHeader.jsx';
import { supabase } from '../supabaseClient.js';
import './ProRoutineCategoryPage.css';

// Modal styling is handled in CSS to respect theme variables and prefers-reduced-motion

function ProRoutineCategoryPage() {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [modalExercises, setModalExercises] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchRoutines = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pro_routines')
          .select(`
            *,
            exercises:pro_routine_exercises(
              exercise_id,
              target_sets,
              target_reps,
              rest_seconds,
              exercise_order,
              is_warmup,
              target_intensity_pct,
              notes
            )
          `)
          .eq('category', categoryName)
          .order('name', { ascending: true });
        if (error) throw error;
        setRoutines(data || []);
      } catch (error) {
        console.error(`Error fetching ${categoryName} routines:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutines();
  }, [categoryName]);

  const openModalWithRoutine = async (routine) => {
    setSelectedRoutine(routine);
    setModalIsOpen(true);
    
    // Group exercises by exercise_id to avoid showing duplicate entries for each set
    // Each exercise appears multiple times in pro_routine_exercises (one row per set)
    const exercisesByIdMap = new Map();
    
    if (Array.isArray(routine.exercises)) {
      routine.exercises.forEach((ex) => {
        const id = ex?.exercise_id ?? ex?.id ?? ex?.exercises?.id;
        if (!id) return;
        
        if (!exercisesByIdMap.has(id)) {
          exercisesByIdMap.set(id, {
            exercise_id: id,
            target_sets: 0,
            is_warmup_sets: 0,
            exercise_order: ex.exercise_order,
          });
        }
        
        // Aggregate set counts (warmup vs working sets)
        const grouped = exercisesByIdMap.get(id);
        if (ex.is_warmup) {
          grouped.is_warmup_sets += 1;
        } else {
          grouped.target_sets += 1;
        }
      });
    }
    
    const exerciseIds = Array.from(exercisesByIdMap.keys());
    
    if (exerciseIds.length === 0) {
      setModalExercises([]);
      return;
    }
    
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name')
      .in('id', exerciseIds);
      
    if (error) {
      console.error("Error fetching exercise details:", error);
      setModalExercises([]);
      return;
    }
    
    // Use a Map for efficient O(n) lookup
    const nameById = new Map((data ?? []).map((d) => [d.id, d.name]));
    
    // Create unique exercise list with aggregated set counts
    const exercisesWithDetails = Array.from(exercisesByIdMap.values()).map((ex) => {
      const displayName = nameById.get(ex.exercise_id) ?? 'Unknown Exercise';
      return {
        ...ex,
        name: displayName,
      };
    }).sort((a, b) => (a.exercise_order ?? 999) - (b.exercise_order ?? 999));
    
    // Log missing names for easier debugging
    const missing = exercisesWithDetails.filter(e => !e.name || e.name === 'Unknown Exercise').map(e => e.exercise_id);
    if (missing.length > 0) {
      console.warn('Exercises with missing names:', missing);
    }
    
    setModalExercises(exercisesWithDetails);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedRoutine(null);
    setModalExercises([]);
  };

  const handleAddRoutine = async () => {
    if (!selectedRoutine) return;
    setIsAdding(true);
    try {
      // Use Supabase client to get session and access token
      const session = supabase.auth.session ? supabase.auth.session() : (await supabase.auth.getSession()).data.session;
      const userId = session?.user?.id || 'YOUR_USER_ID';
      const accessToken = session?.access_token;
      if (!accessToken) {
        alert('You must be logged in to copy a routine.');
        return;
      }
      
      // Get Supabase URL from environment variable
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wkmrdelhoeqhsdifrarn.supabase.co';
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/copy_pro_routine_to_user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ pro_routine_id: selectedRoutine.id, user_id: userId }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        navigate('/workouts/routines');
      } else {
        alert('Error adding routine: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert(`Error adding routine: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="pro-category-page-container">
      <SubPageHeader title={`${categoryName} Routines`} icon={<Dumbbell size={28} />} iconColor="#f97316" backTo="/workouts/routines/select-pro" />
      
      <div className="routine-list-container">
        {loading && <p>Loading...</p>}
        {!loading && routines.map(routine => (
          <div key={routine.id} className="routine-item-card">
            <h4>{routine.name}</h4>
            <p>{routine.description}</p>
            {/* ACCESSIBILITY FIX: Hide decorative icon from screen readers. */}
            <button onClick={() => openModalWithRoutine(routine)}>
              <Info size={16} aria-hidden="true" /> View Details
            </button>
          </div>
        ))}
         {!loading && routines.length === 0 && (
            <p className="no-routines-message">No routines found for this category yet. Check back soon!</p>
        )}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Routine Details"
        className="ReactModal__Content--custom"
        overlayClassName="ReactModal__Overlay--custom"
      >
        {selectedRoutine && (
          <div className="routine-modal-content">
            <div className="modal-header">
                <h2>{selectedRoutine.name}</h2>
                {/* ACCESSIBILITY FIX: Add aria-label and hide decorative icon. */}
                <button onClick={closeModal} className="close-button" aria-label="Close details">
                  <X size={24} aria-hidden="true" />
                </button>
            </div>
            <p className="modal-description">{selectedRoutine.description}</p>
            
            <h3>Exercises in this Routine:</h3>
            <ul className="modal-exercise-list">
              {modalExercises.map((ex) => (
                <li key={ex.exercise_id}>
                  <span className="exercise-name">{ex.name}</span>
                  <span className="exercise-sets">
                    {ex.is_warmup_sets > 0 && `${ex.is_warmup_sets} warmup + `}
                    {ex.target_sets} {ex.target_sets === 1 ? 'set' : 'sets'}
                  </span>
                </li>
              ))}
            </ul>

            <div className="modal-actions">
              <button className="secondary-button" onClick={closeModal}>Close</button>
              <button className="primary-button" onClick={handleAddRoutine} disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add to My Routines'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ProRoutineCategoryPage;

