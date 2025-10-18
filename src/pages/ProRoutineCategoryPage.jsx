// @ts-check
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

const customModalStyles = {
  content: {
    top: '50%', left: '50%', right: 'auto', bottom: 'auto',
    marginRight: '-50%', transform: 'translate(-50%, -50%)',
    width: '90%', maxWidth: '500px', background: '#2d3748',
    color: '#f7fafc', border: '1px solid #4a5568',
    zIndex: 1000, padding: '1.5rem', borderRadius: '12px'
  },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 999 },
};

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
          .eq('category', categoryName);
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
    
    // Fetch exercise names for the modal
    const exerciseIds = routine.exercises.map(ex => ex.exercise_id);
    const { data, error } = await supabase
      .from('exercises')
      .select('id, name')
      .in('id', exerciseIds);
      
    if (error) {
      console.error("Error fetching exercise details:", error);
      setModalExercises([]);
      return;
    }
    
    // Map exercise names to the routine's exercise list
    const exercisesWithDetails = routine.exercises.map(ex => {
        const details = data.find(d => d.id === ex.exercise_id);
        return { ...ex, name: details?.name || 'Unknown Exercise' };
    });
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
            <button onClick={() => openModalWithRoutine(routine)}>
              <Info size={16} /> View Details
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
        style={customModalStyles}
        contentLabel="Routine Details"
        appElement={document.getElementById('root')}
      >
        {selectedRoutine && (
          <div className="routine-modal-content">
            <div className="modal-header">
                <h2>{selectedRoutine.name}</h2>
                <button onClick={closeModal} className="close-button"><X size={24} /></button>
            </div>
            <p className="modal-description">{selectedRoutine.description}</p>
            
            <h3>Exercises in this Routine:</h3>
            <ul className="modal-exercise-list">
              {modalExercises.map((ex, index) => (
                <li key={index}>
                    <span className="exercise-name">{ex.name}</span>
                    <span className="exercise-sets">{ex.target_sets} sets</span>
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
