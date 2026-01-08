import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import FoodSearchModal from './FoodSearchModal';
import './MealBuilder.css';

const MealBuilder = ({ isOpen, onClose, onSave, editingMeal, isPremade }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [loading, setLoading] = useState(false);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [mealFoods, setMealFoods] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (editingMeal) {
      setName(editingMeal.display_name || editingMeal.name || '');
      setDescription(editingMeal.description || '');
      setCategory(editingMeal.category || 'other');
      
      if (editingMeal.user_meal_foods) {
        setMealFoods(editingMeal.user_meal_foods);
        const quantMap = {};
        editingMeal.user_meal_foods.forEach(mf => {
          quantMap[mf.id] = mf.quantity;
        });
        setQuantities(quantMap);
      } else {
        setMealFoods([]);
        setQuantities({});
      }
    } else {
      setName('');
      setDescription('');
      setCategory('other');
      setMealFoods([]);
      setQuantities({});
    }
  }, [editingMeal, isOpen]);

  const handleSelectFood = async (food) => {
    setMealFoods([...mealFoods, {
      id: `temp-${Date.now()}`,
      food_id: food.id,
      quantity: 100,
      notes: '',
      foods: food
    }]);
    setQuantities({
      ...quantities,
      [`temp-${Date.now()}`]: 100
    });
    setShowFoodSearch(false);
  };

  const removeFood = (tempId) => {
    setMealFoods(mealFoods.filter(f => f.id !== tempId));
    const newQuantities = { ...quantities };
    delete newQuantities[tempId];
    setQuantities(newQuantities);
  };

  const updateQuantity = (foodId, quantity) => {
    setQuantities({
      ...quantities,
      [foodId]: parseFloat(quantity) || 0
    });
  };

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

      let mealId;

      if (editingMeal && !isPremade) {
        const { error } = await supabase
          .from('user_meals')
          .update(mealData)
          .eq('id', editingMeal.id);
        if (error) throw error;
        mealId = editingMeal.id;
      } else {
        const { data: newMeal, error } = await supabase
          .from('user_meals')
          .insert([mealData])
          .select()
          .single();
        if (error) throw error;
        mealId = newMeal.id;
      }

      // Handle meal foods
      if (mealFoods.length > 0) {
        // Delete existing meal foods if editing
        if (editingMeal && !isPremade) {
          await supabase
            .from('user_meal_foods')
            .delete()
            .eq('user_meal_id', mealId);
        }

        // Insert new meal foods
        const mealFoodsData = mealFoods.map(mf => ({
          user_meal_id: mealId,
          food_id: mf.food_id,
          quantity: quantities[mf.id] || mf.quantity,
          notes: mf.notes || ''
        }));

        const { error: foodsError } = await supabase
          .from('user_meal_foods')
          .insert(mealFoodsData);
        
        if (foodsError) throw foodsError;
      }

      onSave();
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Error saving meal: ' + error.message);
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

          <div className="form-group">
            <div className="foods-header">
              <label>Foods in this Meal</label>
              <button 
                type="button" 
                onClick={() => setShowFoodSearch(true)} 
                className="add-food-btn"
              >
                <Plus size={16} /> Add Food
              </button>
            </div>
            
            {mealFoods.length > 0 && (
              <div className="meal-foods-list">
                {mealFoods.map((mf) => (
                  <div key={mf.id} className="meal-food-item">
                    <div className="food-details">
                      <p className="food-name">
                        {mf.foods?.name || mf.name}
                      </p>
                      <div className="food-quantity">
                        <input 
                          type="number" 
                          min="0" 
                          step="0.1"
                          value={quantities[mf.id] || mf.quantity}
                          onChange={(e) => updateQuantity(mf.id, e.target.value)}
                          className="quantity-input"
                        />
                        <span className="quantity-unit">g</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFood(mf.id)}
                      className="remove-food-btn"
                      title="Remove food"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {mealFoods.length === 0 && (
              <p className="no-foods">No foods added. Click "Add Food" to get started.</p>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Meal'}
            </button>
          </div>
        </form>

        <FoodSearchModal 
          isOpen={showFoodSearch}
          onClose={() => setShowFoodSearch(false)}
          onSelectFood={handleSelectFood}
        />
      </div>
    </div>
  );
};

export default MealBuilder;