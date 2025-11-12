# Dynamic Routine Generator - Design Document

## Current Issues

1. **Hardcoded Routine Names**: Names like "Upper Body", "Lower Body" don't reflect actual exercises
2. **Empty Days**: When frequency > 4, some days have no exercises
3. **No Smart Duplication**: Exercises aren't intelligently repeated with varied intensity

## Proposed Solution

### 1. Dynamic Routine Naming

Generate names based on actual muscle groups in the routine:

```javascript
// Examples:
"Chest & Triceps"  // Multiple muscle groups
"Back Focus"       // Single dominant muscle
"Full Body"        // 5+ different muscle groups
"Upper Push"       // Chest + Shoulders + Triceps
"Pull Day"         // Back + Biceps
```

### 2. Exercise Distribution Rules by Frequency

#### 2-Day Split (Full Body x2)
- **Day 1**: All exercises at 75-85% intensity
- **Day 2**: Same exercises, different order, 70-80% intensity

#### 3-Day Split (Push/Pull/Legs)
- **Push**: Chest, Shoulders, Triceps
- **Pull**: Back, Biceps
- **Legs**: Quads, Hamstrings, Glutes, Calves

#### 4-Day Split (Upper/Lower x2)
- **Day 1**: Upper Push (Chest, Shoulders, Triceps) - 80% intensity
- **Day 2**: Lower (Legs, Glutes) - 80% intensity
- **Day 3**: Upper Pull (Back, Biceps) - 75% intensity
- **Day 4**: Lower (repeat with variation) - 75% intensity

#### 5-Day Split (Push/Pull/Legs + Repeats)
- **Day 1**: Push - 80%
- **Day 2**: Pull - 80%
- **Day 3**: Legs - 80%
- **Day 4**: Push (lighter, more volume) - 70%
- **Day 5**: Pull (lighter, more volume) - 70%

#### 6-Day Split (PPL x2)
- **Day 1**: Push - 85%
- **Day 2**: Pull - 85%
- **Day 3**: Legs - 85%
- **Day 4**: Push - 75%
- **Day 5**: Pull - 75%
- **Day 6**: Legs - 75%

#### 7-Day Split (Bro Split)
- Each major muscle group gets its own day
- **Day 1**: Chest
- **Day 2**: Back
- **Day 3**: Shoulders
- **Day 4**: Legs
- **Day 5**: Arms
- **Day 6**: Accessories/Weak Points
- **Day 7**: Rest or Active Recovery

## Questions for You

1. **Naming Convention**: Do you like the muscle-group based names, or prefer something else?

2. **Intensity Reduction**: When duplicating exercises:
   - Reduce intensity by 5-10%?
   - Keep intensity same but reduce sets/reps?
   - Both?

3. **Exercise Selection on Repeat Days**: 
   - Same exercises in different order?
   - Prioritize compound movements on first instance, accessories on repeat?
   - Swap similar exercises (e.g., Barbell Bench → Dumbbell Bench)?

4. **Empty Day Handling**:
   - Always fill with repeated exercises?
   - Or allow "Rest/Recovery" days if not enough exercises?

5. **Minimum Exercises Per Day**:
   - What's the minimum? (Currently seems around 3-4)
   - Maximum? (To prevent over-training)

## Implementation Strategy

Once you answer these questions, I'll:
1. Update `routineGenerator.js` with the new logic
2. Add dynamic name generation based on muscle groups
3. Implement smart duplication with intensity variation
4. Add validation to prevent empty days
5. Update ProgramBuilderModal to show these new options

## Database Schema (Already Created)

```sql
ALTER TABLE program_routines_exercises 
ADD COLUMN is_warmup BOOLEAN DEFAULT false,
ADD COLUMN target_intensity_pct INTEGER DEFAULT 75;
```

Ready to apply this migration when you approve the design!
