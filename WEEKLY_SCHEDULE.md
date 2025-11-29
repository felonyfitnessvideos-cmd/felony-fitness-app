# 🗓️ WEEKLY DEVELOPMENT SCHEDULE

**Project:** Felony Fitness App  
**Philosophy:** Quality over quantity - sustainable weekly rhythm  
**Started:** November 23, 2025

> **Your daily command center - everything you need in one place**

---

## 📅 SUNDAY - Review & Planning Day

### 🌅 START OF DAY (15 minutes)

**1. Environment Check (2 min)**
- Open VS Code workspace
- Launch PowerShell terminal
- Check internet connection

**2. Git Status (3 min)**
```powershell
git status              # Should be clean
git pull origin main    # Get latest changes
git log --oneline -n 10 # Review week's commits
```

**3. Database Health (2 min)**
- Open Supabase dashboard
- Quick test query (verify connection)
- Check for alerts or Edge Function errors

**4. Review Last Week (5 min)**
- Read last session: `docs/SESSION_SUMMARY_YYYY-MM-DD.md`
- Check last week's accomplishments
- Note any unfinished tasks

**5. Today's Focus (3 min)**
- Sunday = Review & Planning
- Goal: Assess week, update docs, plan next week

---

### 🎯 SUNDAY PRIORITIES

**Weekly Review (30 min)**
- [ ] Review all 7 days of last week
- [ ] Update progress trackers in this document
- [ ] Calculate metrics: foods added, exercises, meals, programs, routines
- [ ] Identify wins and challenges

**Content Progress Update (20 min)**
```sql
-- Run these in Supabase SQL Editor
SELECT COUNT(*) as total_foods FROM food_servings;
SELECT COUNT(*) as total_exercises FROM exercises;
SELECT COUNT(*) as total_meals FROM meal_templates;
SELECT COUNT(*) as total_programs FROM programs;
SELECT COUNT(*) as total_routines FROM pro_routines WHERE is_template = true;

-- Food enrichment status
SELECT enrichment_status, COUNT(*) as count, 
       ROUND(AVG(quality_score), 2) as avg_quality
FROM food_servings 
GROUP BY enrichment_status 
ORDER BY enrichment_status;
```
- [ ] Update baseline metrics at bottom of this document
- [ ] Check enrichment progress (failed count should be near 0)
- [ ] Note quality score trends

**Next Week Planning (30 min)**
- [ ] Define specific content for each day
  * Monday: Food database tasks
  * Tuesday: Exercise library focus
  * Wednesday: Which meal to create
  * Thursday: Which program to build
  * Friday: Which routine to populate
  * Saturday: Testing priorities
- [ ] Identify any blockers or dependencies
- [ ] Set realistic goals (don't over-commit)

**Documentation Cleanup (15 min)**
- [ ] Archive old session summaries (move to `docs/archive/`)
- [ ] Update README.md if needed
- [ ] Clean up any WIP documents
- [ ] Commit all documentation changes

**Backup Management (10 min)**
```powershell
# Check backup folder
Get-ChildItem backups/ | Sort-Object LastWriteTime -Descending

# Keep last 7 daily backups, delete older
Get-ChildItem backups/daily-* | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -Skip 7 | 
    Remove-Item -Recurse -Force
```

---

### 🌙 END OF DAY (30 minutes)

**1. Code Cleanup (3 min)**
- No `console.log()` statements
- Remove unused imports
- Delete commented code

**2. Git Commit (5 min)**
```powershell
git status
git add .
git commit -m "docs: weekly review and planning for week of YYYY-MM-DD"
git push origin main
```

**3. Database Backup (2-3 min)** ⚡ **CRITICAL - NEVER SKIP**
```powershell
.\scripts\backup-via-api.ps1 -BackupName "daily-$(Get-Date -Format 'yyyy-MM-dd')"
```
- Verify `backups/daily-YYYY-MM-DD/` folder created
- Check file sizes reasonable (~6MB for food_servings.json)

**4. Session Documentation (15 min)**
- Create `docs/SESSION_SUMMARY_YYYY-MM-DD.md`
- Include:
  * Week reviewed, metrics updated
  * Next week's plan (specific content)
  * Any schedule adjustments needed
  * Time spent today
  * Notes for Monday morning

**5. Content Progress Update (3 min)**
- Update "Progress Tracking" section below
- Check off Sunday's tasks
- Note next week's targets

**6. Environment Cleanup (2 min)**
- Close unused terminals
- Clear sensitive terminal history
- Save all files

---

## 📅 MONDAY - Food Enrichment Day

### 🌅 START OF DAY (15 minutes)

**1. Environment Check (2 min)**
- Open VS Code workspace
- Launch PowerShell terminal
- Check internet connection

**2. Git Status (3 min)**
```powershell
git status              # Should be clean
git pull origin main    # Get latest changes
git log --oneline -n 5  # Review recent commits
```

**3. Database Health (3 min)**
- Open Supabase dashboard
- Quick test query
- Check Edge Function logs

**4. Review Yesterday's Work (4 min)**
- Read Sunday's session summary
- Review next week's plan from yesterday
- Note Monday's specific goals

**5. Food Enrichment Check (3 min)** ⭐ **MONDAY SPECIAL**
```powershell
node scripts/check-food-status.js
```
- Review: Total foods, enrichment %, quality scores, failed count
- Compare to last week's numbers
- Note any issues (high failed count, low quality)

---

### 🎯 MONDAY PRIORITIES

**Food Enrichment Monitoring (30 min)**
```sql
-- Detailed enrichment status
SELECT enrichment_status, COUNT(*) as count,
       ROUND(AVG(quality_score), 2) as avg_quality,
       MIN(enriched_at) as oldest,
       MAX(enriched_at) as newest
FROM food_servings 
WHERE enriched_at IS NOT NULL
GROUP BY enrichment_status 
ORDER BY enrichment_status;

-- Foods with low quality scores
SELECT id, food_name, quality_score, enrichment_status, enriched_at
FROM food_servings 
WHERE quality_score < 70 AND quality_score > 0
ORDER BY quality_score ASC
LIMIT 20;

-- Failed enrichments (investigate)
SELECT id, food_name, enrichment_status, calories, protein_g, carbs_g, fat_g
FROM food_servings 
WHERE enrichment_status = 'failed'
ORDER BY food_name
LIMIT 20;
```
- [ ] Check GitHub Actions for worker runs
- [ ] Investigate any failed enrichments
- [ ] Review quality scores (target: ≥70)
- [ ] Check if workers are processing backfilled foods

**Fix Food Data Issues (30 min)**
- [ ] Review foods with quality_score < 70
- [ ] Fix obvious data errors (zero macros, wrong serving sizes)
- [ ] Update food names if unclear
- [ ] Re-trigger enrichment for fixed foods (set status to NULL)

**Add High-Demand Foods (30-45 min)**
- [ ] Identify 10-15 commonly requested foods
- [ ] Add to `food_servings` table with baseline data
- [ ] Set `enrichment_status` to NULL (let workers enrich)
- [ ] Test food search to verify they appear

**Test Food Search (15 min)**
- [ ] Open nutrition log page
- [ ] Search for newly added foods
- [ ] Verify autocomplete works
- [ ] Check food details display correctly
- [ ] Test adding foods to nutrition log

---

### 🌙 END OF DAY (30 minutes)

**1. Code Cleanup (3 min)**
- Remove debug statements
- Clean up any test code

**2. Quality Check (5 min)**
- Run `npm run lint` if code changed
- Fix all ESLint errors
- Test changes made today

**3. Git Commit (5 min)**
```powershell
git status
git add .
git commit -m "feat: add 15 high-demand foods, fix 12 low-quality entries"
git push origin main
```

**4. Database Backup (2-3 min)** ⚡ **CRITICAL**
```powershell
.\scripts\backup-via-api.ps1 -BackupName "daily-$(Get-Date -Format 'yyyy-MM-dd')"
```

**5. Session Documentation (10 min)**
- Create `docs/SESSION_SUMMARY_YYYY-MM-DD.md`
- Include:
  * Foods added/fixed today
  * Enrichment progress metrics
  * Quality score improvements
  * Issues found
  * Notes for Tuesday

**6. Content Progress Update (3 min)**
- Update "Progress Tracking" section
- Check off Monday's tasks

**7. Environment Cleanup (2 min)**
- Close terminals, clear history, save files

---

## 📅 TUESDAY - Exercise Library Day

### 🌅 START OF DAY (15 minutes)

**1. Environment Check (2 min)**
- Open VS Code workspace
- Launch PowerShell terminal
- Check internet connection

**2. Git Status (3 min)**
```powershell
git status
git pull origin main
git log --oneline -n 5
```

**3. Database Health (3 min)**
- Open Supabase dashboard
- Quick test query
- Check for alerts

**4. Review Yesterday's Work (4 min)**
- Read Monday's session summary
- Review food enrichment results
- Note Tuesday's specific goals

**5. Today's Focus (3 min)**
- Tuesday = Exercise Library Day
- Goal: Add 100 exercises OR improve documentation

---

### 🎯 TUESDAY PRIORITIES

**Exercise Library Audit (30 min)**
```sql
-- Exercise counts by muscle group
SELECT primary_muscle_group, COUNT(*) as count
FROM exercises 
GROUP BY primary_muscle_group 
ORDER BY count DESC;

-- Exercise counts by equipment
SELECT equipment, COUNT(*) as count
FROM exercises 
GROUP BY equipment 
ORDER BY count DESC;

-- Exercises missing descriptions or form cues
SELECT id, name, primary_muscle_group, equipment
FROM exercises 
WHERE description IS NULL OR description = '' OR LENGTH(description) < 50
ORDER BY primary_muscle_group
LIMIT 30;
```
- [ ] Identify underrepresented muscle groups
- [ ] Note equipment gaps (bodyweight, dumbbells, etc.)
- [ ] List exercises with poor documentation

**Add New Exercises (60-90 min)**

**Choose ONE focus:**
- **Option A:** Add 5-10 new exercises for underrepresented muscle groups
- **Option B:** Improve documentation for 10-15 existing exercises

**For New Exercises:**
- [ ] Research proper form and technique
- [ ] Define: name, muscle groups, equipment, difficulty
- [ ] Write clear description (100-200 words)
- [ ] Add form cues (3-5 key points)
- [ ] List common mistakes
- [ ] Provide progressions/regressions
- [ ] Add to database with SQL or UI

**For Documentation Improvements:**
- [ ] Expand descriptions (target 150+ words)
- [ ] Add detailed form cues
- [ ] Include breathing techniques
- [ ] Add safety warnings where needed
- [ ] Link to video resources (if available)

**Test Exercise Search & Filters (20 min)**
- [ ] Open workout builder page
- [ ] Search for newly added exercises
- [ ] Test muscle group filters
- [ ] Test equipment filters
- [ ] Verify exercise details display correctly
- [ ] Add exercise to workout to verify full flow

**Quality Checklist**
- [ ] All exercises have primary_muscle_group
- [ ] Equipment is specified (or 'bodyweight')
- [ ] Descriptions are clear and helpful (150+ words ideal)
- [ ] Difficulty level appropriate (beginner/intermediate/advanced)
- [ ] No duplicate exercises in database

---

### 🌙 END OF DAY (30 minutes)

**1. Code Cleanup (3 min)**
- Remove debug statements
- Clean up test code

**2. Quality Check (5 min)**
- Run `npm run lint` if code changed
- Fix all ESLint errors
- Test changes

**3. Git Commit (5 min)**
```powershell
git status
git add .
git commit -m "feat: add 8 shoulder exercises with detailed form cues"
git push origin main
```

**4. Database Backup (2-3 min)** ⚡ **CRITICAL**
```powershell
.\scripts\backup-via-api.ps1 -BackupName "daily-$(Get-Date -Format 'yyyy-MM-dd')"
```

**5. Session Documentation (10 min)**
- Create `docs/SESSION_SUMMARY_YYYY-MM-DD.md`
- Include:
  * Exercises added/improved (with names)
  * Muscle groups addressed
  * Documentation quality improvements
  * Notes for Wednesday

**6. Content Progress Update (3 min)**
- Update "Progress Tracking" section
- Check off Tuesday's tasks

**7. Environment Cleanup (2 min)**
- Close terminals, clear history, save files

---

## 📅 WEDNESDAY - Meal Creation Day

### 🌅 START OF DAY (15 minutes)

**1. Environment Check (2 min)**
- Open VS Code workspace
- Launch PowerShell terminal
- Check internet connection

**2. Git Status (3 min)**
```powershell
git status
git pull origin main
git log --oneline -n 5
```

**3. Database Health (3 min)**
- Open Supabase dashboard
- Quick test query
- Check for alerts

**4. Review Yesterday's Work (4 min)**
- Read Tuesday's session summary
- Review exercises added
- Note Wednesday's specific meal to create

**5. Today's Focus (3 min)**
- Wednesday = Meal Creation Day
- Goal: Create 1 complete, high-quality meal
- Target: 52 meals per year = sustainable

---

### 🎯 WEDNESDAY PRIORITIES

**Meal Planning & Research (30 min)**

**Today's Meal:** [Specific meal name planned on Sunday]

- [ ] Define meal type (breakfast, lunch, dinner, snack)
- [ ] Target macros (protein, carbs, fats, calories)
- [ ] List all ingredients needed (5-10 ingredients)
- [ ] Verify ALL ingredients exist in `food_servings` table
```sql
-- Check if ingredient exists
SELECT id, food_name, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g
FROM food_servings 
WHERE food_name ILIKE '%chicken breast%' 
  AND enrichment_status = 'completed'
ORDER BY quality_score DESC
LIMIT 5;
```
- [ ] Plan serving sizes (realistic, whole numbers preferred)
- [ ] Estimate prep time and cook time

**Macro Calculation (45 min)**

**Critical: Accuracy is paramount**

- [ ] Create spreadsheet or table with:
  * Ingredient name
  * Food serving ID from database
  * Quantity (g or ml)
  * Calories per 100g
  * Protein per 100g
  * Carbs per 100g
  * Fat per 100g
  * Calculated totals

- [ ] Calculate totals for entire meal
- [ ] Verify: (4 × protein) + (4 × carbs) + (9 × fat) ≈ total calories (±5 calories)
- [ ] Round to 1 decimal place for macros
- [ ] Double-check math (this is critical for user trust)

**Example Calculation:**
```
Chicken Breast (200g):
- Calories: 165 cal/100g × 2 = 330 cal
- Protein: 31g/100g × 2 = 62g
- Carbs: 0g/100g × 2 = 0g
- Fat: 3.6g/100g × 2 = 7.2g

Brown Rice (150g cooked):
- Calories: 112 cal/100g × 1.5 = 168 cal
- Protein: 2.6g/100g × 1.5 = 3.9g
- Carbs: 23.5g/100g × 1.5 = 35.3g
- Fat: 0.9g/100g × 1.5 = 1.4g

TOTALS:
- Calories: 498 cal
- Protein: 65.9g
- Carbs: 35.3g
- Fat: 8.6g

Verification: (4×65.9) + (4×35.3) + (9×8.6) = 263.6 + 141.2 + 77.4 = 482.2 cal
Close enough (±16 cal, within 5% - acceptable)
```

**Write Instructions (30 min)**
- [ ] Clear, step-by-step preparation instructions
- [ ] Include cooking temperatures and times
- [ ] Add tips for best results
- [ ] Note any substitution options
- [ ] Specify serving size (1 serving, 2 servings, etc.)

**Add Meal to Database (20 min)**
```sql
-- Insert meal template
INSERT INTO meal_templates (
  name, description, meal_type, prep_time_minutes, 
  cook_time_minutes, servings, dietary_tags
) VALUES (
  'Grilled Chicken with Brown Rice',
  'High-protein, low-fat meal perfect for muscle building...',
  'lunch',
  10,
  20,
  1,
  ARRAY['high-protein', 'gluten-free']
) RETURNING id;

-- Insert meal ingredients (repeat for each ingredient)
INSERT INTO meal_ingredients (
  meal_template_id, food_serving_id, quantity_grams
) VALUES (
  '[meal_id_from_above]',
  '[food_serving_id_for_chicken]',
  200
);
```
- [ ] Add meal template
- [ ] Add all ingredients with correct quantities
- [ ] Verify totals in UI match your calculations

**Test Meal Display (15 min)**
- [ ] Open meal plan page
- [ ] Find your new meal
- [ ] Verify all ingredients display correctly
- [ ] Check macro totals match calculations
- [ ] Test "Add to Meal Plan" functionality
- [ ] Verify meal appears in nutrition log

**Meal Quality Checklist**
- [ ] All ingredients exist in database with correct IDs
- [ ] Macro math verified: (4×protein + 4×carbs + 9×fat) ≈ calories (±5%)
- [ ] Serving sizes realistic (whole numbers where possible)
- [ ] Prep + cook times accurate
- [ ] Instructions clear and actionable (anyone could follow)
- [ ] Dietary tags appropriate (high-protein, vegetarian, etc.)
- [ ] Ingredient quantities make sense together
- [ ] Meal tested in UI and displays correctly

---

### 🌙 END OF DAY (30 minutes)

**1. Code Cleanup (3 min)**
- Remove debug statements
- Clean up test code

**2. Quality Check (5 min)**
- Run `npm run lint` if code changed
- Fix all ESLint errors
- Test meal one more time

**3. Git Commit (5 min)**
```powershell
git status
git add .
git commit -m "feat: add 'Grilled Chicken with Brown Rice' meal template (498 cal, 66g protein)"
git push origin main
```

**4. Database Backup (2-3 min)** ⚡ **CRITICAL**
```powershell
.\scripts\backup-via-api.ps1 -BackupName "daily-$(Get-Date -Format 'yyyy-MM-dd')"
```

**5. Session Documentation (10 min)**
- Create `docs/SESSION_SUMMARY_YYYY-MM-DD.md`
- Include:
  * Meal name and type
  * Total macros
  * Ingredients used
  * Any challenges (missing ingredients, macro calculation issues)
  * Notes for Thursday

**6. Content Progress Update (3 min)**
- Update "Progress Tracking" section
- Check off Wednesday's tasks
- Increment meal count

**7. Environment Cleanup (2 min)**
- Close terminals, clear history, save files

---

## 📅 THURSDAY - Program Development Day

### 🌅 START OF DAY (15 minutes)

**1. Environment Check (2 min)**
- Open VS Code workspace
- Launch PowerShell terminal
- Check internet connection

**2. Git Status (3 min)**
```powershell
git status
git pull origin main
git log --oneline -n 5
```

**3. Database Health (3 min)**
- Open Supabase dashboard
- Quick test query
- Check for alerts

**4. Review Yesterday's Work (4 min)**
- Read Wednesday's session summary
- Review meal created
- Note Thursday's specific program to build

**5. Today's Focus (3 min)**
- Thursday = Program Development Day
- Goal: Create 1 complete training program
- Target: 52 programs per year = sustainable

---

### 🎯 THURSDAY PRIORITIES

**Program Design (45-60 min)**

**Today's Program:** [Specific program name planned on Sunday]

- [ ] Define program type (strength, hypertrophy, powerlifting, etc.)
- [ ] Set duration (4-12 weeks)
- [ ] Choose training split (full body, upper/lower, PPL, bro split, etc.)
- [ ] Define frequency (3x, 4x, 5x, 6x per week)
- [ ] Identify target audience (beginner, intermediate, advanced)
- [ ] Write program description (goals, who it's for, what to expect)

**Map Exercises to Program (60-90 min)**

**Per Training Day:**
- [ ] Select 5-8 exercises per session
- [ ] Order: Compounds first → Isolations last
- [ ] Define sets, reps, RPE, rest periods per exercise
```
Example Day 1 - Push:
1. Barbell Bench Press: 4 sets × 6-8 reps @ RPE 8 / 3 min rest
2. Overhead Press: 3 sets × 8-10 reps @ RPE 7-8 / 2.5 min rest
3. Incline Dumbbell Press: 3 sets × 10-12 reps @ RPE 7 / 2 min rest
4. Cable Flyes: 3 sets × 12-15 reps @ RPE 7 / 90 sec rest
5. Lateral Raises: 3 sets × 15-20 reps @ RPE 8 / 90 sec rest
6. Tricep Pushdowns: 3 sets × 12-15 reps @ RPE 7 / 60 sec rest
```

- [ ] Verify ALL exercises exist in `exercises` table
```sql
-- Check if exercise exists
SELECT id, name, primary_muscle_group, equipment, difficulty
FROM exercises 
WHERE name ILIKE '%bench press%' 
ORDER BY name
LIMIT 10;
```

**Progressive Overload Protocol (30 min)**
- [ ] Define how to progress week to week
  * Add weight? Add reps? Add sets? Increase RPE?
- [ ] Map out week-by-week progression for key lifts
- [ ] Include deload week (if program is 8+ weeks)
```
Example 8-Week Program:
- Weeks 1-3: Linear progression (add 5 lbs per week)
- Week 4: Deload (reduce volume by 40%)
- Weeks 5-7: Continue linear progression
- Week 8: Test week or deload
```

**Add Coaching Notes (20 min)**
- [ ] Warmup protocol (dynamic stretches, activation exercises)
- [ ] Form cues per exercise
- [ ] When to increase weight
- [ ] How to modify if exercises are too hard/easy
- [ ] Recovery recommendations
- [ ] Nutrition tips

**Add Program to Database (30 min)**
```sql
-- Insert program
INSERT INTO programs (
  name, description, duration_weeks, days_per_week, 
  difficulty, program_type, created_by_trainer_id
) VALUES (
  'Push Pull Legs - Intermediate',
  ' 8-week intermediate PPL program focusing on hypertrophy...',
  8,
  6,
  'intermediate',
  'hypertrophy',
  '[your_trainer_id]'
) RETURNING id;

-- Insert program days
INSERT INTO program_days (
  program_id, day_number, day_name, focus
) VALUES (
  '[program_id_from_above]',
  1,
  'Push Day',
  'Chest, Shoulders, Triceps'
) RETURNING id;

-- Insert exercises per day (repeat for each exercise)
INSERT INTO program_exercises (
  program_day_id, exercise_id, sets, reps_min, reps_max, 
  rpe_target, rest_seconds, order_index
) VALUES (
  '[program_day_id]',
  '[exercise_id]',
  4,
  6,
  8,
  8,
  180,
  1
);
```

**Test Program Assignment (15 min)**
- [ ] Open admin/trainer dashboard
- [ ] Assign program to test client (or yourself)
- [ ] Verify program displays correctly
- [ ] Check all exercises show up
- [ ] Test workout log integration (can you log a session?)

**Program Quality Checklist**
- [ ] All exercises exist in exercises table
- [ ] Progressive overload structure defined
- [ ] Deload weeks included (if 8+ weeks)
- [ ] Rep ranges, sets, RPE, rest defined for ALL exercises
- [ ] Program description clear and helpful
- [ ] Target audience and goals specified
- [ ] Warmup and cooldown protocols included
- [ ] Program tested in UI and works correctly

---

### 🌙 END OF DAY (30 minutes)

**1. Code Cleanup (3 min)**
- Remove debug statements
- Clean up test code

**2. Quality Check (5 min)**
- Run `npm run lint` if code changed
- Fix all ESLint errors
- Test program one more time

**3. Git Commit (5 min)**
```powershell
git status
git add .
git commit -m "feat: add 'Push Pull Legs - Intermediate' 8-week program (6x/week hypertrophy)"
git push origin main
```

**4. Database Backup (2-3 min)** ⚡ **CRITICAL**
```powershell
.\scripts\backup-via-api.ps1 -BackupName "daily-$(Get-Date -Format 'yyyy-MM-dd')"
```

**5. Session Documentation (10 min)**
- Create `docs/SESSION_SUMMARY_YYYY-MM-DD.md`
- Include:
  * Program name and type
  * Duration, frequency, split
  * Number of exercises per day
  * Any challenges (missing exercises, UI bugs)
  * Notes for Friday

**6. Content Progress Update (3 min)**
- Update "Progress Tracking" section
- Check off Thursday's tasks
- Increment program count

**7. Environment Cleanup (2 min)**
- Close terminals, clear history, save files

---

## 📅 FRIDAY - Pro Routine Development Day

### 🌅 START OF DAY (15 minutes)

**1. Environment Check (2 min)**
- Open VS Code workspace
- Launch PowerShell terminal
- Check internet connection

**2. Git Status (3 min)**
```powershell
git status
git pull origin main
git log --online -n 5
```

**3. Database Health (3 min)**
- Open Supabase dashboard
- Quick test query
- Check for alerts

**4. Review Yesterday's Work (4 min)**
- Read Thursday's session summary
- Review program created
- Note Friday's specific routine to populate

**5. Today's Focus (3 min)**
- Friday = Pro Routine Development Day
- Goal: Create 1 complete pro routine
- Target: 52 routines per year = sustainable

---

### 🎯 FRIDAY PRIORITIES

**Routine Design (30 min)**

**Today's Routine:** [Specific routine name planned on Sunday]

**Existing Pro Routine Templates (Choose One to Populate):**
1. Bodyweight Pro (✅ Done)
2. Bodyweight Basics
3. Strength Starter
4. Strength Pro
5. Hypertrophy Builder
6. Hypertrophy Advanced
7. Powerlifting Foundation
8. Powerlifting Elite
9. Full Body Beginner
10. Full Body Advanced
11. Upper Lower Split
12. Push Pull Legs

- [ ] Choose routine to populate
- [ ] Verify routine exists in `pro_routines` table
- [ ] Note difficulty level (beginner/intermediate/advanced)
- [ ] Identify target muscle group or training style
- [ ] Plan 6-10 exercises appropriate for level

**Select Optimal Exercises (45 min)**
- [ ] Choose 6-10 exercises
- [ ] Order: Compounds first → Isolations last
- [ ] Mix equipment types (if advanced/intermediate)
- [ ] Verify ALL exercises exist in database
```sql
-- Find exercises for specific muscle group
SELECT id, name, primary_muscle_group, equipment, difficulty
FROM exercises 
WHERE primary_muscle_group = 'chest'
  AND difficulty = 'intermediate'
ORDER BY name;
```

**Define Sets, Reps, Intensity (30 min)**

**Per Exercise:**
- [ ] Sets (typically 3-4)
- [ ] Rep range (6-8 for strength, 8-12 for hypertrophy, 12-15 for endurance)
- [ ] Rest periods (2-3 min for compounds, 1-2 min for isolations)
- [ ] RPE or intensity guidance (RPE 7-9)

**Example Routine Structure:**
```
Hypertrophy Builder (Chest & Triceps):
1. Barbell Bench Press: 4 × 8-10 @ RPE 8 / 2.5 min
2. Incline Dumbbell Press: 3 × 10-12 @ RPE 7-8 / 2 min
3. Cable Flyes: 3 × 12-15 @ RPE 7 / 90 sec
4. Dips: 3 × 8-12 @ RPE 8 / 2 min
5. Overhead Tricep Extension: 3 × 12-15 @ RPE 7 / 90 sec
6. Tricep Pushdowns: 3 × 15-20 @ RPE 8 / 60 sec
```

**Add Exercise Alternatives (30 min)**
- [ ] Provide 2-3 alternatives per exercise
- [ ] Alternatives for different equipment access
  * Barbell → Dumbbell → Bodyweight
  * Machine → Cable → Free weight
- [ ] Verify all alternative exercises exist in database

**Add to Database (30 min)**
```sql
-- Insert routine exercises
INSERT INTO pro_routine_exercises (
  routine_id, exercise_id, order_index, sets, 
  reps_min, reps_max, rest_seconds, rpe_target, notes
) VALUES (
  '[routine_id]',
  '[exercise_id]',
  1,
  4,
  8,
  10,
  150,
  8,
  'Focus on controlled eccentric (3 sec down)'
) RETURNING id;

-- Insert exercise alternatives
INSERT INTO pro_routine_exercise_alternatives (
  routine_exercise_id, exercise_id, equipment_type
) VALUES (
  '[routine_exercise_id]',
  '[alternative_exercise_id]',
  'dumbbell'
);
```

**Add Warmup/Cooldown Protocols (20 min)**
- [ ] Define 5-10 minute warmup routine
  * Dynamic stretches
  * Activation exercises
  * Light cardio
- [ ] Define 5-10 minute cooldown
  * Static stretches
  * Foam rolling suggestions
  * Recovery notes

**Add Coaching Notes (15 min)**
- [ ] Form cues per exercise (brief, actionable)
- [ ] Common mistakes to avoid
- [ ] How to progress (add weight, reps, sets)
- [ ] Modification options (if too hard/easy)

**Test Routine in UI (20 min)**
- [ ] Navigate to Pro Routines page
- [ ] Find your populated routine
- [ ] Verify all exercises display
- [ ] Check alternatives show up
- [ ] Test "Add to My Routines" functionality
- [ ] Verify copied routine works correctly
- [ ] Test delete, toggle, duplicate features

**Routine Quality Checklist**
- [ ] 6-10 exercises appropriate for difficulty level
- [ ] Exercise order optimized (compounds → isolations)
- [ ] 2-3 alternatives per exercise (different equipment)
- [ ] Sets, reps, rest defined for all exercises
- [ ] Warmup/cooldown protocols included
- [ ] Coaching notes helpful and actionable
- [ ] All exercises exist in database
- [ ] Routine tested in UI (displays correctly, "Add to My Routines" works)

---

### 🌙 END OF DAY (30 minutes)

**1. Code Cleanup (3 min)**
- Remove debug statements
- Clean up test code

**2. Quality Check (5 min)**
- Run `npm run lint` if code changed
- Fix all ESLint errors
- Test routine one more time

**3. Git Commit (5 min)**
```powershell
git status
git add .
git commit -m "feat: populate 'Hypertrophy Builder' pro routine (chest/triceps, 6 exercises)"
git push origin main
```

**4. Database Backup (2-3 min)** ⚡ **CRITICAL**
```powershell
.\scripts\backup-via-api.ps1 -BackupName "daily-$(Get-Date -Format 'yyyy-MM-dd')"
```

**Optional: Weekly Storage Backup (5-10 min)**
```powershell
# Run every Friday or after adding files to storage buckets
.\scripts\backup-storage-buckets.ps1 -BackupName "storage-$(Get-Date -Format 'yyyy-MM-dd')"
```
- Backs up trainer manual PDFs, images, assets (5 buckets)
- Takes ~5-10 minutes (233 MB currently)
- Keep last 4 weekly backups

**5. Session Documentation (10 min)**
- Create `docs/SESSION_SUMMARY_YYYY-MM-DD.md`
- Include:
  * Routine name and type
  * Number of exercises added
  * Alternatives provided
  * Any challenges (missing exercises, UI bugs)
  * Notes for Saturday

**6. Content Progress Update (3 min)**
- Update "Progress Tracking" section
- Check off Friday's tasks
- Increment routine count

**7. Environment Cleanup (2 min)**
- Close terminals, clear history, save files

---

## 📅 SATURDAY - Testing & Quality Assurance Day

### 🌅 START OF DAY (15 minutes)

**1. Environment Check (2 min)**
- Open VS Code workspace
- Launch PowerShell terminal
- Check internet connection

**2. Git Status (3 min)**
```powershell
git status
git pull origin main
git log --oneline -n 5
```

**3. Database Health (3 min)**
- Open Supabase dashboard
- Quick test query
- Check for alerts

**4. Review Yesterday's Work (4 min)**
- Read Friday's session summary
- Review routine populated
- List all content added this week

**5. Today's Focus (3 min)**
- Saturday = Testing & QA Day
- Goal: Test all new content, fix bugs, improve UX
- Ensure everything production-ready

---

### 🎯 SATURDAY PRIORITIES

**Test This Week's Content (60-90 min)**

**Monday - Foods:**
- [ ] Search for newly added foods in nutrition log
- [ ] Verify food details accurate (macros, serving sizes)
- [ ] Test adding foods to meal plan
- [ ] Check food autocomplete works correctly

**Tuesday - Exercises:**
- [ ] Search for newly added exercises in workout builder
- [ ] Verify exercise details display (description, form cues, equipment)
- [ ] Test filters (muscle group, equipment, difficulty)
- [ ] Add exercises to workout to verify integration

**Wednesday - Meal:**
- [ ] Find meal in meal plan page
- [ ] Verify ingredient list correct
- [ ] Check macro totals match calculations (±5 cal)
- [ ] Test "Add to Meal Plan" functionality
- [ ] Verify meal appears in nutrition log
- [ ] Test editing meal (adjust servings)

**Thursday - Program:**
- [ ] Assign program to test client (or yourself)
- [ ] Verify program structure displays correctly
- [ ] Check all exercises show up
- [ ] Test workout logging for program day
- [ ] Verify progressive overload tracking works
- [ ] Test marking days complete

**Friday - Routine:**
- [ ] Open Pro Routines page
- [ ] Verify routine displays correctly
- [ ] Check all exercises present
- [ ] Test alternatives show up
- [ ] Test "Add to My Routines" (copy functionality)
- [ ] Verify copied routine editable
- [ ] Test delete, duplicate, toggle features

**Run Validation Queries (30 min)**
```sql
-- Foods with missing data
SELECT id, food_name, enrichment_status, quality_score
FROM food_servings 
WHERE (calories IS NULL OR calories = 0)
  OR (protein_g IS NULL AND carbs_g IS NULL AND fat_g IS NULL)
ORDER BY food_name
LIMIT 50;

-- Exercises missing critical info
SELECT id, name, primary_muscle_group, equipment
FROM exercises 
WHERE description IS NULL OR description = ''
  OR primary_muscle_group IS NULL
ORDER BY name
LIMIT 50;

-- Meal templates with calculation errors
SELECT mt.id, mt.name, 
       SUM(fs.calories * mi.quantity_grams / 100.0) as calc_calories
FROM meal_templates mt
JOIN meal_ingredients mi ON mi.meal_template_id = mt.id
JOIN food_servings fs ON fs.id = mi.food_serving_id
GROUP BY mt.id, mt.name
HAVING ABS(SUM(fs.calories * mi.quantity_grams / 100.0) - 
           (SELECT total_calories FROM meal_templates WHERE id = mt.id)) > 10;

-- Programs with missing exercises
SELECT p.id, p.name, pd.day_name, COUNT(pe.id) as exercise_count
FROM programs p
JOIN program_days pd ON pd.program_id = p.id
LEFT JOIN program_exercises pe ON pe.program_day_id = pd.id
GROUP BY p.id, p.name, pd.id, pd.day_name
HAVING COUNT(pe.id) = 0;

-- Pro routines not fully populated
SELECT id, name, difficulty, is_template
FROM pro_routines 
WHERE is_template = true
  AND id NOT IN (
    SELECT DISTINCT routine_id FROM pro_routine_exercises
  )
ORDER BY name;
```
- [ ] Review query results
- [ ] Fix any data quality issues found
- [ ] Re-test after fixes

**Bug Fixing (30-60 min)**
- [ ] Review any errors in browser console
- [ ] Check Supabase logs for backend errors
- [ ] Fix UI display issues
- [ ] Address any user feedback (if available)
- [ ] Test critical user flows:
  * Sign up → Create account
  * Trainer creates workout → Assigns to client
  * Client logs nutrition → Views daily totals
  * Client completes workout → Sees progress

**Update Documentation (20 min)**
- [ ] Update README if features changed
- [ ] Document any new workflows discovered
- [ ] Add code comments for complex logic
- [ ] Create/update migration docs (if schema changed)

---

### 🌙 END OF DAY (30 minutes)

**1. Code Cleanup (5 min)**
- Remove all debug statements
- Clean up test code
- Delete unused imports

**2. Quality Check (5 min)**
- Run `npm run lint` (fix all errors)
- Run tests if available
- Final manual test of critical flows

**3. Git Commit (5 min)**
```powershell
git status
git add .
git commit -m "test: verify week's content, fix 3 data validation issues"
git push origin main
```

**4. Database Backup (2-3 min)** ⚡ **CRITICAL**
```powershell
.\scripts\backup-via-api.ps1 -BackupName "daily-$(Get-Date -Format 'yyyy-MM-dd')"
```

**5. Session Documentation (10 min)**
- Create `docs/SESSION_SUMMARY_YYYY-MM-DD.md`
- Include:
  * All content tested (foods, exercises, meal, program, routine)
  * Bugs found and fixed
  * Data validation results
  * Notes for Sunday (review day)

**6. Content Progress Update (3 min)**
- Update "Progress Tracking" section
- Check off Saturday's tasks
- Prepare for Sunday review

**7. Environment Cleanup (2 min)**
- Close terminals, clear history, save files

---

## 📈 Progress Tracking

### Baseline (November 23, 2025):
- **Foods:** 5,424 (enrichment 52.1% complete, 568 high-quality)
- **Exercises:** ~350
- **Meals:** 10 premade templates
- **Programs:** 6 specialized programs
- **Pro Routines:** 1/12 populated (Bodyweight Pro)

### Current Week Progress:
- **Monday - Foods:** [Update after Monday]
- **Tuesday - Exercises:** [Update after Tuesday]
- **Wednesday - Meals:** [Update after Wednesday]
- **Thursday - Programs:** [Update after Thursday]
- **Friday - Routines:** [Update after Friday]
- **Saturday - Testing:** [Update after Saturday]

### Target by End of December 2025:
- **Foods:** 5,500+ (enrichment 80%+ complete)
- **Exercises:** 400+
- **Meals:** 15 premade templates
- **Programs:** 10 complete programs
- **Pro Routines:** 6/12 populated (50%)

---

## 🚨 Emergency Protocols

**If Day's Work Can't Be Completed:**
- Skip that day's content addition (DON'T try to catch up)
- Focus on quality over quantity
- Maintain weekly rhythm
- Document blockers
- Adjust next week's plan if needed

**If Critical Bug Found:**
1. STOP adding new content
2. Assess severity (data loss? auth failure? UI broken?)
3. Fix immediately if high-severity
4. Document bug thoroughly
5. Test fix extensively
6. Commit with `fix:` prefix

**If Database Issue:**
1. STOP all database modifications
2. Check Supabase status page
3. Review recent migrations/queries
4. Restore from backup if needed:
   - Daily backups in `backups/daily-YYYY-MM-DD/`
   - Supabase dashboard → Database → Backup
5. Document issue and resolution

---

## 💡 Quality Standards

### For All Content:
- ✅ Accuracy is paramount (users trust our data)
- ✅ Test everything before marking complete
- ✅ Document as you go (future you will thank you)
- ✅ Commit working code frequently (every 1-2 hours)
- ✅ Never skip database backups (CRITICAL)

### Commit Message Standards:
- `feat:` New features (foods, exercises, meals, programs, routines)
- `fix:` Bug fixes
- `docs:` Documentation only
- `refactor:` Code restructuring
- `perf:` Performance improvements
- `test:` Test changes
- `chore:` Tooling, dependencies

---

## 📞 Quick Reference

**Daily Backups:**
```powershell
.\scripts\backup-via-api.ps1 -BackupName "daily-$(Get-Date -Format 'yyyy-MM-dd')"
```

**Food Enrichment Check:**
```powershell
node scripts/check-food-status.js
```

**Git Workflow:**
```powershell
git status
git pull origin main
git add .
git commit -m "type: description"
git push origin main
```

**Supabase Dashboard:**
https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn

**GitHub Repository:**
https://github.com/felonyfitnessvideos-cmd/felony-fitness-app

---

**Last Updated:** November 23, 2025  
**Owner:** David (Developer)  
**Review Cadence:** Updated every Sunday

---

*"Sustainable content creation is a marathon, not a sprint. Quality always wins."*
