-- ============================================================================
-- ACHIEVEMENT & GAMIFICATION SYSTEM
-- Creates tables, triggers, and functions for tracking user progress,
-- awarding achievements, and managing XP/levels
-- ============================================================================

-- ============================================================================
-- 1. CREATE TABLES
-- ============================================================================

-- Achievement Definitions Table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('strength', 'consistency', 'nutrition', 'milestone')),
  icon TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  trigger_type TEXT NOT NULL,
  trigger_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Achievement Unlocks
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  seen BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- User Statistics (Pre-computed for Performance)
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Workout stats
  total_workouts INTEGER DEFAULT 0,
  current_workout_streak INTEGER DEFAULT 0,
  longest_workout_streak INTEGER DEFAULT 0,
  last_workout_date DATE,
  total_sets INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  total_volume_lbs BIGINT DEFAULT 0,
  mesocycles_completed INTEGER DEFAULT 0,
  
  -- PR tracking
  total_prs INTEGER DEFAULT 0,
  prs_by_exercise JSONB DEFAULT '{}'::jsonb,
  
  -- Nutrition stats
  nutrition_logs_count INTEGER DEFAULT 0,
  current_nutrition_streak INTEGER DEFAULT 0,
  longest_nutrition_streak INTEGER DEFAULT 0,
  last_nutrition_log_date DATE,
  perfect_macro_days INTEGER DEFAULT 0,
  
  -- Hydration (future)
  water_logs_count INTEGER DEFAULT 0,
  current_hydration_streak INTEGER DEFAULT 0,
  longest_hydration_streak INTEGER DEFAULT 0,
  
  -- Level & XP
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- XP Transaction History
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unseen ON user_achievements(user_id, seen) WHERE seen = false;
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_trigger_type ON achievements(trigger_type);

-- ============================================================================
-- 3. HELPER FUNCTIONS
-- ============================================================================

-- Calculate level from total XP
CREATE OR REPLACE FUNCTION calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: sqrt(XP / 100)
  -- Level 1: 0 XP
  -- Level 2: 100 XP
  -- Level 5: 2,500 XP
  -- Level 10: 10,000 XP
  -- Level 20: 40,000 XP
  RETURN GREATEST(1, FLOOR(SQRT(xp / 100.0))::INTEGER + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 4. ACHIEVEMENT CHECKING FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION check_and_award_achievements(
  p_user_id UUID,
  p_event_type TEXT
)
RETURNS TABLE(achievement_id UUID, is_new BOOLEAN, achievement_code TEXT) AS $$
DECLARE
  stats RECORD;
  achievement RECORD;
  should_unlock BOOLEAN;
  target_value INTEGER;
  metric_name TEXT;
BEGIN
  -- Get user stats
  SELECT * INTO stats FROM user_stats WHERE user_id = p_user_id;
  
  -- If no stats record exists, create one
  IF stats IS NULL THEN
    INSERT INTO user_stats (user_id) VALUES (p_user_id);
    SELECT * INTO stats FROM user_stats WHERE user_id = p_user_id;
  END IF;
  
  -- Check achievements that match this event type
  FOR achievement IN 
    SELECT a.* FROM achievements a
    WHERE a.trigger_type = p_event_type
      AND NOT EXISTS (
        SELECT 1 FROM user_achievements ua
        WHERE ua.user_id = p_user_id 
          AND ua.achievement_id = a.id
      )
  LOOP
    should_unlock := false;
    metric_name := achievement.trigger_value->>'metric';
    target_value := (achievement.trigger_value->>'target')::INTEGER;
    
    -- Check if conditions are met based on metric type
    CASE metric_name
      WHEN 'workout_count' THEN
        should_unlock := stats.total_workouts >= target_value;
      
      WHEN 'workout_streak' THEN
        should_unlock := stats.current_workout_streak >= target_value;
      
      WHEN 'pr_count' THEN
        should_unlock := stats.total_prs >= target_value;
      
      WHEN 'total_volume' THEN
        should_unlock := stats.total_volume_lbs >= target_value;
      
      WHEN 'mesocycle_count' THEN
        should_unlock := stats.mesocycles_completed >= target_value;
      
      WHEN 'nutrition_streak' THEN
        should_unlock := stats.current_nutrition_streak >= target_value;
      
      WHEN 'nutrition_count' THEN
        should_unlock := stats.nutrition_logs_count >= target_value;
      
      WHEN 'set_count' THEN
        should_unlock := stats.total_sets >= target_value;
      
      WHEN 'rep_count' THEN
        should_unlock := stats.total_reps >= target_value;
      
      ELSE
        should_unlock := false;
    END CASE;
    
    IF should_unlock THEN
      -- Award achievement
      INSERT INTO user_achievements (user_id, achievement_id, seen)
      VALUES (p_user_id, achievement.id, false);
      
      -- Award XP
      UPDATE user_stats SET
        total_xp = total_xp + achievement.xp_reward,
        current_level = calculate_level(total_xp + achievement.xp_reward),
        updated_at = NOW()
      WHERE user_id = p_user_id;
      
      -- Log XP transaction
      INSERT INTO xp_transactions (user_id, amount, source, reference_id)
      VALUES (p_user_id, achievement.xp_reward, 'achievement:' || achievement.code, achievement.id);
      
      -- Return newly unlocked achievement
      RETURN QUERY SELECT achievement.id, true, achievement.code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. TRIGGER FUNCTIONS
-- ============================================================================

-- Trigger: Update stats when workout is completed
CREATE OR REPLACE FUNCTION update_stats_on_workout_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_complete = true AND (OLD.is_complete IS NULL OR OLD.is_complete = false) THEN
    -- Update or create user stats
    INSERT INTO user_stats (
      user_id, 
      total_workouts, 
      last_workout_date,
      current_workout_streak,
      longest_workout_streak
    )
    VALUES (
      NEW.user_id, 
      1, 
      CURRENT_DATE,
      1,
      1
    )
    ON CONFLICT (user_id) DO UPDATE SET
      total_workouts = user_stats.total_workouts + 1,
      last_workout_date = CURRENT_DATE,
      current_workout_streak = CASE
        WHEN user_stats.last_workout_date = CURRENT_DATE - INTERVAL '1 day' 
          THEN user_stats.current_workout_streak + 1
        WHEN user_stats.last_workout_date = CURRENT_DATE 
          THEN user_stats.current_workout_streak
        ELSE 1
      END,
      longest_workout_streak = GREATEST(
        user_stats.longest_workout_streak,
        CASE
          WHEN user_stats.last_workout_date = CURRENT_DATE - INTERVAL '1 day' 
            THEN user_stats.current_workout_streak + 1
          ELSE 1
        END
      ),
      updated_at = NOW();
    
    -- Award XP for completing workout
    UPDATE user_stats SET
      total_xp = user_stats.total_xp + 100,
      current_level = calculate_level(user_stats.total_xp + 100),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Log XP transaction
    INSERT INTO xp_transactions (user_id, amount, source, reference_id)
    VALUES (NEW.user_id, 100, 'workout_complete', NEW.id);
    
    -- Check for workout achievements
    PERFORM check_and_award_achievements(NEW.user_id, 'workout_complete');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update stats when set is logged
CREATE OR REPLACE FUNCTION update_stats_on_set_logged()
RETURNS TRIGGER AS $$
DECLARE
  is_pr BOOLEAN;
  current_pr JSONB;
  workout_user_id UUID;
BEGIN
  -- Get user_id from workout_logs
  SELECT user_id INTO workout_user_id 
  FROM workout_logs 
  WHERE id = NEW.workout_log_id;
  
  -- Update totals
  INSERT INTO user_stats (
    user_id,
    total_sets,
    total_reps,
    total_volume_lbs
  )
  VALUES (
    workout_user_id,
    1,
    NEW.reps_completed,
    NEW.weight_lbs * NEW.reps_completed
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_sets = user_stats.total_sets + 1,
    total_reps = user_stats.total_reps + NEW.reps_completed,
    total_volume_lbs = user_stats.total_volume_lbs + (NEW.weight_lbs * NEW.reps_completed),
    updated_at = NOW();
  
  -- Check if this is a PR
  SELECT prs_by_exercise->NEW.exercise_id::TEXT INTO current_pr
  FROM user_stats
  WHERE user_id = workout_user_id;
  
  is_pr := (current_pr IS NULL) OR 
           (NEW.weight_lbs > (current_pr->>'weight')::NUMERIC) OR
           (NEW.weight_lbs = (current_pr->>'weight')::NUMERIC AND 
            NEW.reps_completed > (current_pr->>'reps')::INTEGER);
  
  IF is_pr THEN
    -- Update PR record
    UPDATE user_stats SET
      total_prs = total_prs + 1,
      prs_by_exercise = jsonb_set(
        COALESCE(prs_by_exercise, '{}'::jsonb),
        ARRAY[NEW.exercise_id::TEXT],
        jsonb_build_object(
          'weight', NEW.weight_lbs,
          'reps', NEW.reps_completed,
          'date', CURRENT_DATE,
          'log_entry_id', NEW.id
        )
      ),
      total_xp = user_stats.total_xp + 200,
      current_level = calculate_level(user_stats.total_xp + 200),
      updated_at = NOW()
    WHERE user_id = workout_user_id;
    
    -- Log XP for PR
    INSERT INTO xp_transactions (user_id, amount, source, reference_id)
    VALUES (workout_user_id, 200, 'pr_set', NEW.id);
    
    -- Check PR achievements
    PERFORM check_and_award_achievements(workout_user_id, 'pr_set');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update stats when nutrition is logged
CREATE OR REPLACE FUNCTION update_stats_on_nutrition_log()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or create nutrition stats
  INSERT INTO user_stats (
    user_id,
    nutrition_logs_count,
    last_nutrition_log_date,
    current_nutrition_streak,
    longest_nutrition_streak
  )
  VALUES (
    NEW.user_id,
    1,
    NEW.log_date,
    1,
    1
  )
  ON CONFLICT (user_id) DO UPDATE SET
    nutrition_logs_count = user_stats.nutrition_logs_count + 1,
    last_nutrition_log_date = NEW.log_date,
    current_nutrition_streak = CASE
      WHEN user_stats.last_nutrition_log_date = NEW.log_date - INTERVAL '1 day' 
        THEN user_stats.current_nutrition_streak + 1
      WHEN user_stats.last_nutrition_log_date = NEW.log_date 
        THEN user_stats.current_nutrition_streak
      ELSE 1
    END,
    longest_nutrition_streak = GREATEST(
      user_stats.longest_nutrition_streak,
      CASE
        WHEN user_stats.last_nutrition_log_date = NEW.log_date - INTERVAL '1 day' 
          THEN user_stats.current_nutrition_streak + 1
        ELSE 1
      END
    ),
    total_xp = user_stats.total_xp + 50,
    current_level = calculate_level(user_stats.total_xp + 50),
    updated_at = NOW();
  
  -- Log XP for nutrition log
  INSERT INTO xp_transactions (user_id, amount, source, reference_id)
  VALUES (NEW.user_id, 50, 'nutrition_log', NEW.id);
  
  -- Check nutrition achievements
  PERFORM check_and_award_achievements(NEW.user_id, 'nutrition_log');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update stats when mesocycle is completed
CREATE OR REPLACE FUNCTION update_stats_on_mesocycle_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_complete = true AND (OLD.is_complete IS NULL OR OLD.is_complete = false) THEN
    -- Update mesocycle count
    UPDATE user_stats SET
      mesocycles_completed = user_stats.mesocycles_completed + 1,
      total_xp = user_stats.total_xp + 500,
      current_level = calculate_level(user_stats.total_xp + 500),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Log XP for mesocycle completion
    INSERT INTO xp_transactions (user_id, amount, source, reference_id)
    VALUES (NEW.user_id, 500, 'mesocycle_complete', NEW.id);
    
    -- Check mesocycle achievements
    PERFORM check_and_award_achievements(NEW.user_id, 'mesocycle_complete');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. CREATE TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS workout_complete_stats_trigger ON workout_logs;
CREATE TRIGGER workout_complete_stats_trigger
  AFTER INSERT OR UPDATE ON workout_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_stats_on_workout_complete();

DROP TRIGGER IF EXISTS set_logged_stats_trigger ON workout_log_entries;
CREATE TRIGGER set_logged_stats_trigger
  AFTER INSERT ON workout_log_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_stats_on_set_logged();

DROP TRIGGER IF EXISTS nutrition_log_stats_trigger ON nutrition_logs;
CREATE TRIGGER nutrition_log_stats_trigger
  AFTER INSERT ON nutrition_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_stats_on_nutrition_log();

DROP TRIGGER IF EXISTS mesocycle_complete_stats_trigger ON mesocycle_weeks;
CREATE TRIGGER mesocycle_complete_stats_trigger
  AFTER INSERT OR UPDATE ON mesocycle_weeks
  FOR EACH ROW
  EXECUTE FUNCTION update_stats_on_mesocycle_complete();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON achievements;
DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert their own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can update their own achievement seen status" ON user_achievements;
DROP POLICY IF EXISTS "Users can view their own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can insert their own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON user_stats;
DROP POLICY IF EXISTS "Users can view their own XP transactions" ON xp_transactions;
DROP POLICY IF EXISTS "Users can insert their own XP transactions" ON xp_transactions;

-- Achievements: Public read
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

-- User Achievements: Users can view their own
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievement seen status"
  ON user_achievements FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Stats: Users can view their own
CREATE POLICY "Users can view their own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- XP Transactions: Users can view their own
CREATE POLICY "Users can view their own XP transactions"
  ON xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP transactions"
  ON xp_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 8. SEED ACHIEVEMENT DATA
-- ============================================================================

-- Clear existing achievements (in case re-running)
TRUNCATE achievements CASCADE;

-- GETTING STARTED
INSERT INTO achievements (code, name, description, category, icon, xp_reward, rarity, trigger_type, trigger_value) VALUES
('first_workout', 'First Step', 'Complete your first workout', 'milestone', '🎯', 50, 'common', 'workout_complete', '{"metric": "workout_count", "target": 1}'),
('week_warrior', 'Week Warrior', 'Complete 7 consecutive workouts', 'consistency', '📅', 200, 'rare', 'workout_complete', '{"metric": "workout_streak", "target": 7}'),
('month_maker', 'Month Maker', 'Complete 30 consecutive workouts', 'consistency', '📆', 500, 'epic', 'workout_complete', '{"metric": "workout_streak", "target": 30}'),
('quarter_crusher', 'Quarter Crusher', 'Complete 90 consecutive workouts', 'consistency', '🔥', 1500, 'legendary', 'workout_complete', '{"metric": "workout_streak", "target": 90}'),
('year_legend', 'Year Legend', 'Complete 365 consecutive workouts', 'consistency', '👑', 10000, 'legendary', 'workout_complete', '{"metric": "workout_streak", "target": 365}');

-- WORKOUT MILESTONES
INSERT INTO achievements (code, name, description, category, icon, xp_reward, rarity, trigger_type, trigger_value) VALUES
('ten_workouts', 'Getting Started', 'Complete 10 total workouts', 'consistency', '💪', 100, 'common', 'workout_complete', '{"metric": "workout_count", "target": 10}'),
('fifty_workouts', 'Dedicated Lifter', 'Complete 50 total workouts', 'consistency', '🏋️', 300, 'rare', 'workout_complete', '{"metric": "workout_count", "target": 50}'),
('hundred_workouts', 'Gym Regular', 'Complete 100 total workouts', 'consistency', '⚡', 600, 'epic', 'workout_complete', '{"metric": "workout_count", "target": 100}'),
('five_hundred_workouts', 'Iron Veteran', 'Complete 500 total workouts', 'consistency', '🔱', 2000, 'legendary', 'workout_complete', '{"metric": "workout_count", "target": 500}'),
('thousand_workouts', 'Gym Legend', 'Complete 1,000 total workouts', 'consistency', '💎', 5000, 'legendary', 'workout_complete', '{"metric": "workout_count", "target": 1000}');

-- PERSONAL RECORDS
INSERT INTO achievements (code, name, description, category, icon, xp_reward, rarity, trigger_type, trigger_value) VALUES
('first_pr', 'First PR', 'Set your first personal record', 'strength', '🎉', 100, 'common', 'pr_set', '{"metric": "pr_count", "target": 1}'),
('weight_warrior', 'Weight Warrior', 'Set 10 personal records', 'strength', '⚔️', 300, 'rare', 'pr_set', '{"metric": "pr_count", "target": 10}'),
('pr_machine', 'PR Machine', 'Set 25 personal records', 'strength', '🤖', 750, 'epic', 'pr_set', '{"metric": "pr_count", "target": 25}'),
('strength_legend', 'Strength Legend', 'Set 50 personal records', 'strength', '🦁', 1500, 'legendary', 'pr_set', '{"metric": "pr_count", "target": 50}'),
('pr_god', 'PR God', 'Set 100 personal records', 'strength', '⚡', 3000, 'legendary', 'pr_set', '{"metric": "pr_count", "target": 100}');

-- VOLUME ACHIEVEMENTS
INSERT INTO achievements (code, name, description, category, icon, xp_reward, rarity, trigger_type, trigger_value) VALUES
('hundred_sets', 'Century Club', 'Complete 100 total sets', 'strength', '💯', 150, 'common', 'workout_complete', '{"metric": "set_count", "target": 100}'),
('thousand_reps', 'Thousand Reps', 'Complete 1,000 total reps', 'strength', '🔢', 200, 'rare', 'workout_complete', '{"metric": "rep_count", "target": 1000}'),
('hundred_k_volume', '100K Club', 'Lift 100,000 total lbs', 'strength', '🏔️', 500, 'epic', 'workout_complete', '{"metric": "total_volume", "target": 100000}'),
('million_volume', 'Million Pound Club', 'Lift 1,000,000 total lbs', 'strength', '🌟', 2000, 'legendary', 'workout_complete', '{"metric": "total_volume", "target": 1000000}');

-- MESOCYCLE ACHIEVEMENTS
INSERT INTO achievements (code, name, description, category, icon, xp_reward, rarity, trigger_type, trigger_value) VALUES
('first_cycle', 'Cycle Complete', 'Complete your first mesocycle', 'consistency', '🔄', 300, 'rare', 'mesocycle_complete', '{"metric": "mesocycle_count", "target": 1}'),
('three_cycles', 'Dedicated Athlete', 'Complete 3 mesocycles', 'consistency', '🎖️', 600, 'epic', 'mesocycle_complete', '{"metric": "mesocycle_count", "target": 3}'),
('ten_cycles', 'Program Master', 'Complete 10 mesocycles', 'consistency', '👑', 2000, 'legendary', 'mesocycle_complete', '{"metric": "mesocycle_count", "target": 10}');

-- NUTRITION ACHIEVEMENTS
INSERT INTO achievements (code, name, description, category, icon, xp_reward, rarity, trigger_type, trigger_value) VALUES
('first_nutrition_log', 'Nutrition Beginner', 'Log your first meal', 'nutrition', '🍎', 50, 'common', 'nutrition_log', '{"metric": "nutrition_count", "target": 1}'),
('week_tracker', 'Week Tracker', 'Log nutrition for 7 consecutive days', 'nutrition', '📊', 200, 'rare', 'nutrition_log', '{"metric": "nutrition_streak", "target": 7}'),
('month_master', 'Month Master', 'Log nutrition for 30 consecutive days', 'nutrition', '📈', 500, 'epic', 'nutrition_log', '{"metric": "nutrition_streak", "target": 30}'),
('nutrition_ninja', 'Nutrition Ninja', 'Log nutrition for 90 consecutive days', 'nutrition', '🥷', 1500, 'legendary', 'nutrition_log', '{"metric": "nutrition_streak", "target": 90}'),
('hundred_logs', 'Nutrition Pro', 'Log 100 total meals', 'nutrition', '🥗', 300, 'rare', 'nutrition_log', '{"metric": "nutrition_count", "target": 100}');

-- ============================================================================
-- SCRIPT COMPLETE
-- ============================================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Achievement system created successfully!';
  RAISE NOTICE 'Tables created: achievements, user_achievements, user_stats, xp_transactions';
  RAISE NOTICE 'Triggers enabled: workout completion, set logging, nutrition logging, mesocycle completion';
  RAISE NOTICE 'Seeded % achievements', (SELECT COUNT(*) FROM achievements);
END $$;
