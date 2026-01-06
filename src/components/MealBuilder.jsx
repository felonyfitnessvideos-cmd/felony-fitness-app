import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './MealBuilder.css';

const MealBuilder = ({ isOpen, onClose, onSave, editingMeal, isPremade }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingMeal) {
      setName(editingMeal.display_name || editingMeal.name || '');
      setDescription(editingMeal.description || '');
      setCategory(editingMeal.category || 'other');
    } else {
      setName('');
      setDescription('');
      setCategory('other');
    }
  }, [editingMeal, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const mealData = {
        name,
        description,
        category,
        user_id: user.id
      };

      if (editingMeal && !isPremade) {
        const { error } = await supabase
          .from('user_meals')
          .update(mealData)
          .eq('id', editingMeal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_meals')
          .insert([mealData]);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Error saving meal');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="meal-builder-overlay">
      <div className="meal-builder-modal">
        <div className="modal-header">
          <h2>{editingMeal ? 'Edit Meal' : 'Create New Meal'}</h2>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-group">
            <label>Meal Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              placeholder="e.g., Grilled Chicken Salad"
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Optional description..."
              rows={3}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Meal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealBuilder;