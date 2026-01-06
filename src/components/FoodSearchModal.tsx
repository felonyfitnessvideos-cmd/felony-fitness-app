import React, { useState, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { searchFoods, formatFoodForDisplay } from '../utils/foodSearch';
import './FoodSearchModal.css';

interface Food {
  id: string;
  name: string;
  brand_owner?: string;
  portions?: Portion[];
}

interface Portion {
  id: string;
  portion_description: string;
  gram_weight: number;
}

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFood: (food: Food) => void;
}

const FoodSearchModal: React.FC<FoodSearchModalProps> = ({ isOpen, onClose, onSelectFood }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPortions, setSelectedPortions] = useState<{ [key: string]: Portion }>({});

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults([]);
      setSelectedPortions({});
    }
  }, [isOpen]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setIsSearching(true);
        const foods = await searchFoods(searchTerm);
        setResults(foods);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handlePortionChange = (foodId: string, portionId: string) => {
    const food = results.find((f: Food) => f.id === foodId);
    const portion = food?.portions?.find((p: Portion) => p.id === portionId);
    setSelectedPortions((prev) => ({ ...prev, [foodId]: portion }));
  };

  const handleAddFood = (food: Food) => {
    const portion = selectedPortions[food.id] || food.portions?.[0];
    const formatted = formatFoodForDisplay(food, portion);
    onSelectFood({ ...food, selectedPortion: portion, formatted } as Food);
  };

  if (!isOpen) return null;

  return (
    <div className="food-search-modal-overlay" onClick={onClose}>
      <div className="food-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Search Foods</h3>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search for foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="search-results">
          {isSearching && <div className="loading">Searching...</div>}
          
          {!isSearching && searchTerm.length >= 2 && results.length === 0 && (
            <div className="no-results">No foods found</div>
          )}

          {!isSearching && results.map((food: Food) => {
            const portion = selectedPortions[food.id] || food.portions?.[0];
            const formatted = formatFoodForDisplay(food, portion);
            
            return (
              <div key={food.id} className="food-result-item">
                <div className="food-info">
                  <div className="food-name">{food.name}</div>
                  {food.brand_owner && <div className="food-brand">{food.brand_owner}</div>}
                  <div className="food-nutrition">
                    <span>{formatted.calories} cal</span>
                    <span>{formatted.protein_g}g protein</span>
                    <span>{formatted.carbs_g}g carbs</span>
                    <span>{formatted.fat_g}g fat</span>
                  </div>
                </div>

                <div className="food-actions">
                  {food.portions && food.portions.length > 0 && (
                    <select
                      value={portion?.id || ''}
                      onChange={(e) => handlePortionChange(food.id, e.target.value)}
                      className="portion-select"
                    >
                      {food.portions.map((p: Portion) => (
                        <option key={p.id} value={p.id}>
                          {p.portion_description} ({p.gram_weight}g)
                        </option>
                      ))}
                    </select>
                  )}
                  <button onClick={() => handleAddFood(food)} className="add-food-btn">
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FoodSearchModal;
