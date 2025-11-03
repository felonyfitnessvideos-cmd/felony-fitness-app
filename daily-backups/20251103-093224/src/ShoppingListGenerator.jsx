import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { ShoppingCart, Check, X, Plus, Edit, Save, Trash2, Download, Calendar } from 'lucide-react';
import { FOOD_CATEGORIES } from '../constants/mealPlannerConstants';
import './ShoppingListGenerator.css';

/**
 * ShoppingListGenerator component for creating organized shopping lists from meal plans
 * 
 * This component generates comprehensive shopping lists by:
 * - Aggregating ingredients from all meals in the weekly plan
 * - Consolidating duplicate ingredients with quantities
 * - Categorizing items by food type (produce, meat, dairy, etc.)
 * - Allowing custom item additions and editing
 * - Providing progress tracking with checkboxes
 * - Exporting lists to text files
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {Function} props.onClose - Callback function when modal is closed
 * @param {Object} props.weekPlan - Current week's meal plan data
 * @param {Date[]} props.weekDates - Array of dates for the current week
 * @returns {JSX.Element|null} Modal component for shopping list or null if not open
 * 
 * @example
 * <ShoppingListGenerator
 *   isOpen={showShoppingList}
 *   onClose={() => setShowShoppingList(false)}
 *   weekPlan={currentWeekPlan}
 *   weekDates={weekDatesArray}
 * />
 */
const ShoppingListGenerator = ({ isOpen, onClose, weekPlan, weekDates }) => {
  /** @type {[Array, Function]} Generated shopping list items with quantities */
  const [shoppingList, setShoppingList] = useState([]);
  
  /** @type {[Set, Function]} Set of checked item IDs for progress tracking */
  const [checkedItems, setCheckedItems] = useState(new Set());
  
  /** @type {[Array, Function]} User-added custom shopping items */
  const [customItems, setCustomItems] = useState([]);
  
  /** @type {[string, Function]} Text input for new custom item */
  const [newCustomItem, setNewCustomItem] = useState('');
  
  /** @type {[boolean, Function]} Loading state for list generation */
  const [isLoading, setIsLoading] = useState(false);
  
  /** @type {[boolean, Function]} Toggle for category grouping vs alphabetical */
  const [groupByCategory, setGroupByCategory] = useState(true);

  /** @constant {Object} Food categories for organizing shopping list items */
  const foodCategories = FOOD_CATEGORIES;

  useEffect(() => {
    if (isOpen && weekPlan) {
      generateShoppingList();
    }
  }, [isOpen, weekPlan, generateShoppingList]);

  /**
   * Generate shopping list from meal plan entries
   * Aggregates all ingredients from meals in the week and consolidates quantities
   * 
   * @async
   * @returns {Promise<void>}
   */
  const generateShoppingList = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get all meal plan entries for the current week
      const startDate = weekDates[0].toISOString().split('T')[0];
      const endDate = weekDates[6].toISOString().split('T')[0];

      const { data: entries, error } = await supabase
        .from('meal_plan_entries')
        .select(`
          *,
          meals (
            name,
            meal_foods (
              quantity,
              notes,
              food_servings (
                food_name,
                serving_size,
                serving_unit
              )
            )
          )
        `)
        .eq('weekly_meal_plan_id', weekPlan.id)
        .gte('plan_date', startDate)
        .lte('plan_date', endDate);

      if (error) throw error;

      // Aggregate ingredients from all meals
      const ingredientMap = new Map();

      entries.forEach(entry => {
        const mealServings = entry.servings || 1;
        
        entry.meals.meal_foods.forEach(mealFood => {
          const food = mealFood.food_servings;
          const totalQuantity = mealFood.quantity * mealServings;
          const key = `${food.food_name}_${food.serving_unit}`;
          
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key);
            existing.totalQuantity += totalQuantity;
            existing.meals.add(entry.meals.name);
          } else {
            ingredientMap.set(key, {
              name: food.food_name,
              totalQuantity: totalQuantity,
              servingSize: food.serving_size,
              servingUnit: food.serving_unit,
              meals: new Set([entry.meals.name]),
              category: categorizeFood(food.food_name),
              notes: mealFood.notes
            });
          }
        });
      });

      // Convert map to array and sort
      const ingredients = Array.from(ingredientMap.values()).map(item => ({
        ...item,
        meals: Array.from(item.meals),
        displayQuantity: formatQuantity(item.totalQuantity, item.servingSize, item.servingUnit)
      }));

      if (groupByCategory) {
        // Group ingredients by category
        const grouped = {};
        Object.keys(foodCategories).forEach(category => {
          grouped[category] = ingredients.filter(item => item.category === category);
        });
        setShoppingList(grouped);
      } else {
        // Alphabetical list
        setShoppingList(ingredients.sort((a, b) => a.name.localeCompare(b.name)));
      }

    } catch (error) {
      console.error('Error generating shopping list:', error);
      alert('Error generating shopping list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [weekPlan, weekDates, groupByCategory, foodCategories, categorizeFood]);

  /**
   * Categorize a food item based on its name
   * 
   * @param {string} foodName - Name of the food to categorize
   * @returns {string} Category name for the food
   */
  const categorizeFood = useCallback((foodName) => {
    const name = foodName.toLowerCase();
    
    for (const [category, keywords] of Object.entries(foodCategories)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return category;
      }
    }
    
    return 'Other';
  }, [foodCategories]);

  /**
   * Format quantity for display in shopping list
   * 
   * @param {number} totalQuantity - Total quantity needed
   * @param {number} servingSize - Size of each serving
   * @param {string} servingUnit - Unit of measurement
   * @returns {string} Formatted quantity string
   */
  const formatQuantity = (totalQuantity, servingSize, servingUnit) => {
    if (servingSize && servingSize !== 1) {
      const actualQuantity = totalQuantity * servingSize;
      return `${actualQuantity.toFixed(1)} ${servingUnit}`;
    }
    return `${totalQuantity.toFixed(1)} ${servingUnit}`;
  };

  /**
   * Toggle the checked state of a shopping list item
   * 
   * @param {string} itemKey - Unique key identifying the shopping list item
   */
  const toggleItemCheck = (itemKey) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemKey)) {
      newCheckedItems.delete(itemKey);
    } else {
      newCheckedItems.add(itemKey);
    }
    setCheckedItems(newCheckedItems);
  };

  /**
   * Add a custom item to the shopping list
   * 
   * @returns {void}
   */
  const addCustomItem = () => {
    if (!newCustomItem.trim()) return;

    const customItem = {
      id: Date.now(),
      name: newCustomItem.trim(),
      category: 'Other',
      isCustom: true
    };

    setCustomItems([...customItems, customItem]);
    setNewCustomItem('');
  };

  const removeCustomItem = (itemId) => {
    setCustomItems(customItems.filter(item => item.id !== itemId));
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(`custom_${itemId}`);
      return newSet;
    });
  };

  const exportShoppingList = () => {
    let content = `Shopping List - Week of ${weekDates[0].toLocaleDateString()}\n`;
    content += `Generated on ${new Date().toLocaleDateString()}\n\n`;

    if (groupByCategory && typeof shoppingList === 'object') {
      Object.entries(shoppingList).forEach(([category, items]) => {
        if (items.length > 0) {
          content += `${category}:\n`;
          items.forEach(item => {
            const checked = checkedItems.has(`${item.name}_${item.servingUnit}`) ? '✓' : '☐';
            content += `  ${checked} ${item.displayQuantity} ${item.name}\n`;
          });
          content += '\n';
        }
      });
    } else {
      const items = Array.isArray(shoppingList) ? shoppingList : [];
      items.forEach(item => {
        const checked = checkedItems.has(`${item.name}_${item.servingUnit}`) ? '✓' : '☐';
        content += `${checked} ${item.displayQuantity} ${item.name}\n`;
      });
    }

    // Add custom items
    if (customItems.length > 0) {
      content += '\nCustom Items:\n';
      customItems.forEach(item => {
        const checked = checkedItems.has(`custom_${item.id}`) ? '✓' : '☐';
        content += `  ${checked} ${item.name}\n`;
      });
    }

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shopping-list-${weekDates[0].toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="shopping-list-overlay">
      <div className="shopping-list-modal">
        {/* Header */}
        <div className="shopping-list-header">
          <div className="header-left">
            <h2>
              <ShoppingCart className="icon" />
              Shopping List
            </h2>
            <p>
              <Calendar className="icon small" />
              Week of {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
            </p>
          </div>
          <div className="header-actions">
            <button onClick={exportShoppingList} className="export-btn">
              <Download className="icon" />
              Export
            </button>
            <button
              onClick={() => setGroupByCategory(!groupByCategory)}
              className="group-btn"
            >
              {groupByCategory ? 'Alphabetical' : 'By Category'}
            </button>
            <button onClick={onClose} className="close-btn">
              <X className="icon" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="shopping-list-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Generating your shopping list...</p>
            </div>
          ) : (
            <>
              {/* Add Custom Item */}
              <div className="add-custom-item">
                <input
                  type="text"
                  placeholder="Add custom item..."
                  value={newCustomItem}
                  onChange={(e) => setNewCustomItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                />
                <button onClick={addCustomItem} className="add-btn">
                  <Plus className="icon" />
                </button>
              </div>

              {/* Custom Items */}
              {customItems.length > 0 && (
                <div className="custom-items-section">
                  <h3>Custom Items</h3>
                  <div className="shopping-items">
                    {customItems.map(item => (
                      <div
                        key={`custom_${item.id}`}
                        className={`shopping-item ${checkedItems.has(`custom_${item.id}`) ? 'checked' : ''}`}
                      >
                        <button
                          onClick={() => toggleItemCheck(`custom_${item.id}`)}
                          className="check-btn"
                        >
                          {checkedItems.has(`custom_${item.id}`) ? (
                            <Check className="icon" />
                          ) : (
                            <span className="unchecked"></span>
                          )}
                        </button>
                        <span className="item-name">{item.name}</span>
                        <button
                          onClick={() => removeCustomItem(item.id)}
                          className="remove-btn"
                        >
                          <Trash2 className="icon" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shopping List Items */}
              {groupByCategory && typeof shoppingList === 'object' ? (
                // Grouped by category
                Object.entries(shoppingList).map(([category, items]) => (
                  items.length > 0 && (
                    <div key={category} className="category-section">
                      <h3>{category}</h3>
                      <div className="shopping-items">
                        {items.map(item => {
                          const itemKey = `${item.name}_${item.servingUnit}`;
                          return (
                            <div
                              key={itemKey}
                              className={`shopping-item ${checkedItems.has(itemKey) ? 'checked' : ''}`}
                            >
                              <button
                                onClick={() => toggleItemCheck(itemKey)}
                                className="check-btn"
                              >
                                {checkedItems.has(itemKey) ? (
                                  <Check className="icon" />
                                ) : (
                                  <span className="unchecked"></span>
                                )}
                              </button>
                              <div className="item-details">
                                <span className="item-name">{item.name}</span>
                                <span className="item-quantity">{item.displayQuantity}</span>
                                {item.meals.length > 0 && (
                                  <span className="item-meals">
                                    For: {item.meals.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))
              ) : (
                // Alphabetical list
                <div className="shopping-items">
                  {(Array.isArray(shoppingList) ? shoppingList : []).map(item => {
                    const itemKey = `${item.name}_${item.servingUnit}`;
                    return (
                      <div
                        key={itemKey}
                        className={`shopping-item ${checkedItems.has(itemKey) ? 'checked' : ''}`}
                      >
                        <button
                          onClick={() => toggleItemCheck(itemKey)}
                          className="check-btn"
                        >
                          {checkedItems.has(itemKey) ? (
                            <Check className="icon" />
                          ) : (
                            <span className="unchecked"></span>
                          )}
                        </button>
                        <div className="item-details">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">{item.displayQuantity}</span>
                          <span className="item-category">{item.category}</span>
                          {item.meals.length > 0 && (
                            <span className="item-meals">
                              For: {item.meals.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Stats */}
        <div className="shopping-list-footer">
          <div className="stats">
            <span>{checkedItems.size} of {
              (groupByCategory && typeof shoppingList === 'object' 
                ? Object.values(shoppingList).flat().length 
                : (Array.isArray(shoppingList) ? shoppingList.length : 0)
              ) + customItems.length
            } items checked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingListGenerator;
