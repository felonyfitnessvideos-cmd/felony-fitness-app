# Calculator Dashboard System

## Overview

Unified fitness calculator dashboard for trainers to calculate and save client metrics directly to their profiles.

## Features

### 1. Strength Commander (1RM Calculator)

- **Formula**: Epley formula `Weight × (1 + Reps/30)`
- **Inputs**: Lift name, weight, reps
- **Outputs**: Estimated 1RM and training percentages (95%, 90%, 85%, 80%, 75%, 70%, 65%)
- **Use Case**: Program planning, tracking strength progress

### 2. Body Comp Engine (LBM & TDEE)

- **Formulas**:
  - Boer formula for Lean Body Mass
  - Katch-McArdle formula for TDEE
- **Inputs**: Weight, height, gender, activity level
- **Outputs**: LBM (lbs), BMR (calories), TDEE (calories)
- **Use Case**: Baseline metrics for nutrition planning

### 3. Zone Master (Heart Rate Zones)

- **Formula**: Karvonen formula `((Max - Rest) × %) + Rest`
- **Inputs**: Age, resting heart rate
- **Outputs**: Max HR and 5 training zones (Recovery, Endurance, Aerobic, Threshold, VO2 Max)
- **Use Case**: Cardio programming, intensity monitoring

### 4. Macro Architect (Nutrition Split)

- **Method**: Residual split
  - Protein: 1g per lb LBM (adjustable)
  - Fat: 30% of total calories
  - Carbs: Fills remainder
- **Inputs**: LBM, TDEE, goal adjustment, protein ratio
- **Outputs**: Complete macro breakdown (g, calories, percentages)
- **Use Case**: Personalized nutrition planning
- **Note**: Auto-populates with Body Comp results when available

## Architecture

### Files Created

```
src/
├── utils/
│   └── fitnessCalculators.js          # Pure math functions
├── services/
│   └── trainerService.js              # Supabase integration
├── components/
│   └── tools/
│       ├── CalculatorDashboard.jsx    # Main UI component
│       └── CalculatorDashboard.css    # Styling
supabase/
└── migrations/
    └── add-metrics-column-to-trainer-clients.sql
```

### Database Schema

**Table**: `trainer_clients`
**Column**: `metrics` (JSONB)

**Structure**:

```json
{
  "strength": {
    "liftName": "Bench Press",
    "weight": 225,
    "reps": 5,
    "oneRepMax": 264,
    "percentages": [...],
    "lastUpdated": "2025-12-11T..."
  },
  "bodyComp": {
    "lbmLbs": 150,
    "bmr": 1850,
    "tdee": 2775,
    "lastUpdated": "2025-12-11T..."
  },
  "heartRate": {
    "maxHR": 190,
    "zones": [...],
    "lastUpdated": "2025-12-11T..."
  },
  "macros": {
    "totalCals": 2000,
    "protein": { "g": 150, "cals": 600, "pct": 30 },
    "fat": { "g": 67, "cals": 600, "pct": 30 },
    "carbs": { "g": 200, "cals": 800, "pct": 40 },
    "lastUpdated": "2025-12-11T..."
  }
}
```

## Usage

### Navigation

Access via Trainer Dashboard left sidebar → "Calculators" button

### Workflow

1. Select a client from the dropdown
2. Choose a calculator tab
3. Enter required inputs
4. Click "Calculate" button
5. Review results
6. Click "Save to Client Profile" to persist data

### Integration Features

- **Auto-population**: Macro calculator auto-fills with Body Comp results
- **Timestamps**: All saved metrics include `lastUpdated` timestamp
- **Validation**: Input validation prevents NaN errors
- **Loading states**: Visual feedback during save operations
- **Success/error messages**: Clear user feedback

## API Reference

### `fitnessCalculators.js`

```javascript
calculate1RM(weight, reps);
getPercentageChart(oneRepMax);
calculateBodyComp(weightLbs, heightInches, gender, activityMult);
calculateHeartZones(age, restingHR);
calculateMacros(tdee, lbmLbs, goalAdjustment, proteinRatio);
```

### `trainerService.js`

```javascript
updateClientMetrics(clientId, category, data);
getClientMetrics(clientId);
deleteClientMetric(clientId, category);
```

## Migration

Run the migration to add the `metrics` column:

```sql
-- Execute in Supabase SQL Editor or via migration
supabase/migrations/add-metrics-column-to-trainer-clients.sql
```

This will:

- Add `metrics` JSONB column with default `{}`
- Create GIN index for efficient querying
- Add column documentation

## Future Enhancements

Potential additions:

- Historical tracking (save multiple calculations with timestamps)
- Visual charts/graphs of progress
- Export metrics to PDF reports
- Calculator presets/templates
- Body fat percentage calculator
- Hydration calculator
- Recovery/CNS fatigue calculator

## Testing Checklist

- [ ] Migration adds `metrics` column successfully
- [ ] Calculator math functions return correct values
- [ ] Client dropdown populates with trainer's clients
- [ ] Each calculator displays results correctly
- [ ] Save button persists data to Supabase
- [ ] Saved data appears in `trainer_clients.metrics`
- [ ] Body Comp results auto-populate in Macro calculator
- [ ] Input validation prevents errors
- [ ] Loading states display during save
- [ ] Success/error messages appear appropriately
- [ ] Responsive design works on tablet/desktop

## Code Quality

✅ **All requirements met**:

- JSDoc documentation on all functions
- Input validation (no NaN errors)
- Error handling with try-catch
- Loading states during async operations
- Type-safe inputs (type="number")
- Clear visual hierarchy
- Tab-based navigation
- Supabase integration with JSONB merge
- Accessible (ARIA labels, keyboard navigation)

---

**Last Updated**: 2025-12-11
**Maintained By**: Felony Fitness Development Team
