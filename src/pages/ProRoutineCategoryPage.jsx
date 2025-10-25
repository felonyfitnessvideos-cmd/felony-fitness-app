/**
 * @file ProRoutineCategoryPage.jsx
 * @description This page displays a list of pro routines for a specific category.
 * @project Felony Fitness
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import SubPageHeader from '../components/SubPageHeader.jsx';
import Modal from 'react-modal';
import { Dumbbell, Info, X } from 'lucide-react';
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
          .select('*')
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
    
    // Fetch exercise names for the modal robustly and performantly.
    // Routine entries may come in different shapes depending on how they were
    // loaded (joined relations, RPC, or denormalized). Accept multiple shapes
    // to avoid missing IDs and showing 'Unknown Exercise'.
    const exerciseIds = Array.isArray(routine.exercises)
      ? routine.exercises
          .map((ex) => ex?.exercise_id ?? ex?.id ?? ex?.exercises?.id)
          .filter(Boolean)
      : [];

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
    
    // Use a Map for efficient O(n) lookup instead of a nested loop.
    const nameById = new Map((data ?? []).map((d) => [d.id, d.name]));
  const exercisesWithDetails = (routine.exercises || []).map((ex) => {
      // Derive the id from whichever field is present
      const id = ex?.exercise_id ?? ex?.id ?? ex?.exercises?.id;
      // Prefer any name already present on the routine object (e.g., when the
      // routine was fetched with nested exercises), otherwise use DB lookup.
      const displayName = ex?.name ?? ex?.exercises?.name ?? nameById.get(id) ?? 'Unknown Exercise';
      return {
        ...ex,
        name: displayName,
      };
    });
    // Log missing names for easier debugging when backend data is inconsistent.
    const missing = exercisesWithDetails.filter(e => !e.name || e.name === 'Unknown Exercise').map(e => e?.exercise_id ?? e?.id ?? e?.exercises?.id);
    if (missing.length > 0) {
      console.debug('ProRoutineCategoryPage: missing exercise names for ids', missing);
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
      const { error } = await supabase.rpc('copy_pro_routine_to_user', {
        p_pro_routine_id: selectedRoutine.id,
      });
      if (error) throw error;
      navigate('/workouts/routines');
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
              {modalExercises.map((ex, idx) => {
                const key = ex?.exercise_id ?? ex?.id ?? ex?.exercises?.id ?? `idx-${idx}`;
                return (
                  <li key={key}>
                    <span className="exercise-name">{ex.name}</span>
                    <span className="exercise-sets">{ex.target_sets} sets</span>
                  </li>
                );
              })}
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

