# Meal Plan Quick-Add Feature

## Overview
Added a one-click button to quickly add scheduled meal plan meals to the daily nutrition log. This feature streamlines the logging process by allowing users to add entire meals from their weekly meal plan without searching for individual foods.

## User Experience

### Button Location
The "Add Meal Plan" button appears between the meal tabs (Breakfast/Lunch/Dinner/Snack) and the search bar.

### Button Behavior
1. **Visibility**: Button only appears if:
   - User is authenticated
   - An active meal plan exists for today
   - The meal type matches (e.g., Breakfast button for Breakfast meal)
   - The meal hasn't been logged yet today

2. **Label**: Shows meal name from plan (e.g., `➕ Add "Breakfast 1"`)

3. **On Click**:
   - Fetches all foods associated with the meal
   - Bulk inserts all foods into nutrition_logs
   - Multiplies quantities by servings if specified
   - Refreshes the page to show new entries
   - Button disappears after successful add

4. **Loading State**: Shows "Adding..." while processing

## Technical Implementation

### Database Schema Used
```
weekly_meal_plans
├── user_id
├── start_date
├── end_date
└── is_active

weekly_meal_plan_entries
├── plan_id (FK → weekly_meal_plans)
├── plan_date (YYYY-MM-DD)
├── meal_type (Breakfast, Lunch, Dinner, Snack)
├── meal_id (FK → meals)
└── servings (multiplier)

meals
├── id
└── name

meal_foods
├── meal_id (FK → meals)
├── food_servings_id (FK → food_servings)
└── quantity
```

### Key Functions

#### `fetchScheduledMeal(userId, mealType)`
```javascript
// Queries weekly_meal_plan_entries for:
// - Active plan (is_active = true)
// - Current date (plan_date = today)
// - Matching meal type
// Returns: { entryId, mealId, mealName, servings }
```

#### `handleAddMealPlanToLog()`
```javascript
// 1. Fetches all meal_foods for the scheduled meal
// 2. Maps to nutrition_log entries with proper quantities
// 3. Bulk inserts to nutrition_logs table
// 4. Refreshes page data
// 5. Hides button
```

### State Management
```javascript
const [scheduledMeal, setScheduledMeal] = useState(null);
const [isAddingMealPlan, setIsAddingMealPlan] = useState(false);
```

### Reactive Updates
```javascript
useEffect(() => {
  if (userId && activeMeal) {
    const mealAlreadyLogged = todaysLogs.some(log => log.meal_type === activeMeal);
    if (!mealAlreadyLogged) {
      fetchScheduledMeal(userId, activeMeal);
    } else {
      setScheduledMeal(null);
    }
  }
}, [userId, activeMeal, todaysLogs, fetchScheduledMeal]);
```

## Styling

### Button Appearance
- **Color**: Green gradient (`#10b981` → `#059669`)
- **Width**: Full width of container
- **Border Radius**: 12px (rounded)
- **Padding**: 0.875rem x 1.25rem
- **Shadow**: Subtle green glow
- **Font**: 600 weight, 0.95rem size

### Hover Effect
- Darker green gradient
- Slight elevation (translateY -1px)
- Stronger shadow

### Disabled State
- 60% opacity
- No pointer cursor
- No hover effects

## Edge Cases Handled

1. **No Meal Plan**: Button doesn't appear
2. **Meal Already Logged**: Button hidden automatically
3. **Empty Meal**: Shows alert "This meal has no foods assigned"
4. **Network Errors**: Caught and alerted to user
5. **PGRST116 (No Rows)**: Silently handled, button hidden
6. **Multiple Servings**: Quantities multiplied correctly

## Performance Considerations

- Uses `useCallback` to prevent unnecessary re-renders
- Bulk insert (single query) instead of N separate inserts
- No unnecessary refetches (direct state update after fetch)
- Button conditionally rendered (not just hidden)

## Future Enhancements

Potential improvements:
1. **Preview modal**: Show foods before adding
2. **Partial add**: Allow deselecting certain foods
3. **Edit quantities**: Adjust servings before adding
4. **Recurring schedules**: Support for weekly patterns
5. **Offline support**: Queue inserts when offline

## Files Modified

### `src/pages/NutritionLogPage.jsx`
- Added `scheduledMeal` and `isAddingMealPlan` state
- Added `fetchScheduledMeal()` function
- Added `handleAddMealPlanToLog()` function
- Added `useEffect` for reactive meal plan fetching
- Added JSX for meal plan button

### `src/pages/NutritionLogPage.css`
- Added `.meal-plan-add-section` styles
- Added `.add-meal-plan-btn` styles with hover/active/disabled states

## Testing Checklist

- [ ] Button appears when meal plan exists for today
- [ ] Button shows correct meal name
- [ ] Button hidden when no meal plan exists
- [ ] Button hidden after meal is added
- [ ] Button hidden if meal already logged
- [ ] Bulk insert creates all nutrition_log entries
- [ ] Quantities multiplied by servings correctly
- [ ] Daily totals update after adding meal
- [ ] Loading state works during insert
- [ ] Error handling shows user-friendly messages
- [ ] Works across all meal types (Breakfast, Lunch, Dinner, Snack)
- [ ] Timezone handling correct for date matching

---

**Implementation Date**: November 11, 2025  
**Developer**: GitHub Copilot (with David)
