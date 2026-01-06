import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowLeft, Carrot, Fish, Wheat, Milk, Utensils, Activity, Droplets, ChefHat, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './PremadeMealBrowser.css';

const USDA_CATEGORIES = [
  { id: 'fruits-veg', title: 'Fruits & Veggies', group: 'Food Group', icon: Carrot, color: '#10b981', keywords: ['fruit', 'vegetable', 'salad', 'green', 'berry', 'apple'] },
  { id: 'seafood', title: 'Seafood', group: 'Food Group', icon: Fish, color: '#0ea5e9', keywords: ['fish', 'seafood', 'salmon', 'tuna', 'shrimp'] },
  { id: 'whole-grains', title: 'Whole Grains', group: 'Food Group', icon: Wheat, color: '#d97706', keywords: ['grain', 'oat', 'quinoa', 'rice', 'wheat'] },
  { id: 'dairy', title: 'Dairy & Alternatives', group: 'Food Group', icon: Milk, color: '#6366f1', keywords: ['dairy', 'milk', 'yogurt', 'cheese'] },
  { id: 'protein', title: 'High Protein', group: 'Food Group', icon: Utensils, color: '#f43f5e', keywords: ['protein', 'chicken', 'beef', 'pork', 'egg'] },
  { id: 'calcium', title: 'Calcium Rich', group: 'Nutrient', icon: Activity, color: '#8b5cf6', keywords: ['calcium', 'milk', 'yogurt'] },
  { id: 'low-fat', title: 'Low Fat', group: 'Nutrient', icon: Droplets, color: '#eab308', keywords: ['lean', 'low-fat', 'light'] },
  { id: 'low-sodium', title: 'Low Sodium', group: 'Nutrient', icon: Activity, color: '#14b8a6', keywords: ['low-sodium', 'unsalted'] }
];

const PremadeMealBrowser = ({ onMealSelect, onCancel }) => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [allPremadeMeals, setAllPremadeMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPremadeMeals = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('meals')
          .select(`*, meal_foods (food_id, quantity, notes, foods (name, calories, protein_g, carbs_g, fat_g))`)
          .eq('is_premade', true);

        if (error) throw error;
        
        const mealsWithNutrition = (data || []).map((meal) => {
            let cal = 0, pro = 0, carb = 0, fat = 0;
            if(meal.meal_foods) {
                meal.meal_foods.forEach((mf) => {
                    if(mf.foods) {
                        const ratio = mf.quantity || 1;
                        cal += (mf.foods.calories || 0) * ratio;
                        pro += (mf.foods.protein_g || 0) * ratio;
                        carb += (mf.foods.carbs_g || 0) * ratio;
                        fat += (mf.foods.fat_g || 0) * ratio;
                    }
                });
            }
            return {
                ...meal,
                calories: Math.round(cal),
                protein_g: Math.round(pro),
                carbs_g: Math.round(carb),
                fat_g: Math.round(fat)
            };
        });

        setAllPremadeMeals(mealsWithNutrition);
      } catch (err) {
        console.warn('Error fetching premade meals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPremadeMeals();
  }, []);

  const filteredMeals = useMemo(() => {
    let result = allPremadeMeals;
    if (activeCategory && activeCategory.id !== 'all') {
      result = result.filter((meal) => {
        const text = `${meal.name} ${meal.description || ''} ${meal.category || ''}`.toLowerCase();
        return activeCategory.keywords.some((k) => text.includes(k));
      });
    }
    if (searchTerm) {
      result = result.filter((meal) => 
        meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (meal.description && meal.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return result;
  }, [allPremadeMeals, activeCategory, searchTerm]);

  if (!activeCategory) {
    return (
      <div className="premade-browser-container">
        <div className="browser-header">
          <button onClick={onCancel} className="back-btn"><ArrowLeft size={20} /> Back to My Meals</button>
          <h2>Browse Curated Meals</h2>
          <p className="browser-subtitle">Select a category to explore chef-crafted healthy options.</p>
        </div>
        
        {loading ? (
          <div className="loading-state"><span>Loading library...</span></div>
        ) : (
          <div className="categories-scroll">
            <h3 className="section-title">By Food Group</h3>
            <div className="cats-grid">
              {USDA_CATEGORIES.filter((c) => c.group === 'Food Group').map((cat) => (
                <button key={cat.id} className="cat-card" onClick={() => setActiveCategory(cat)} style={{'--accent': cat.color}}>
                  <div className="cat-icon-wrapper" style={{backgroundColor: `${cat.color}20`}}><cat.icon size={28} color={cat.color} /></div>
                  <span>{cat.title}</span>
                </button>
              ))}
            </div>
            <h3 className="section-title">By Goal & Nutrient</h3>
            <div className="cats-grid">
              {USDA_CATEGORIES.filter((c) => c.group === 'Nutrient').map((cat) => (
                <button key={cat.id} className="cat-card" onClick={() => setActiveCategory(cat)} style={{'--accent': cat.color}}>
                  <div className="cat-icon-wrapper" style={{backgroundColor: `${cat.color}20`}}><cat.icon size={28} color={cat.color} /></div>
                  <span>{cat.title}</span>
                </button>
              ))}
            </div>
            <div className="browse-all-wrapper">
              <button className="browse-all-btn" onClick={() => setActiveCategory({id:'all', title:'All Meals', keywords:[]})}>View All Available Meals</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="premade-browser-container">
      <div className="browser-header sticky">
        <button onClick={() => setActiveCategory(null)} className="back-btn"><ArrowLeft size={20} /> Categories</button>
        <div className="header-content">
            <h2>{activeCategory.title}</h2>
            <div className="browser-search">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder={`Search...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
        </div>
      </div>

      <div className="meals-list-grid">
        {filteredMeals.map((meal) => (
          <div key={meal.id} className="browser-meal-card" onClick={() => onMealSelect(meal)}>
            <div className="meal-icon-placeholder">
                {meal.image_url ? <img src={meal.image_url} alt={meal.name} /> : <ChefHat size={32} />}
            </div>
            <div className="browser-meal-info">
              <h4>{meal.name}</h4>
              <p className="meal-desc-short">{meal.description || 'No description available.'}</p>
              <div className="meal-macros-mini">
                <span className="macro-tag cal">{meal.calories || 0} cal</span>
                <span className="macro-tag pro">{meal.protein_g || 0}g pro</span>
              </div>
            </div>
            <button className="add-icon-btn"><Plus size={20} /></button>
          </div>
        ))}
        {filteredMeals.length === 0 && (
            <div className="empty-category-state"><p>No meals found.</p><button onClick={() => setSearchTerm('')}>Clear Search</button></div>
        )}
      </div>
    </div>
  );
};

export default PremadeMealBrowser;