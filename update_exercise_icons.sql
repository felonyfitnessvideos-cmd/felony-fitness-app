-- First, make sure the exercise_icons bucket is PUBLIC in Supabase Storage settings
-- Then run this SQL to update all exercise thumbnail_url based on primary_muscle

UPDATE exercises
SET thumbnail_url = CASE primary_muscle
    -- Exact matches
    WHEN 'Biceps' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Biceps.png'
    WHEN 'Triceps' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Triceps.png'
    WHEN 'Forearms' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Forearms.png'
    WHEN 'Brachialis' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Brachialis.png'
    
    -- Chest
    WHEN 'Chest' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Middle_Chest.png'
    WHEN 'Middle Chest' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Middle_Chest.png'
    WHEN 'Upper Chest' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Upper_Chest.png'
    WHEN 'Lower Chest' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Middle_Chest.png'
    WHEN 'Inner Chest' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Middle_Chest.png'
    
    -- Back
    WHEN 'Latissimus Dorsi' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Lats.png'
    WHEN 'Lats' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Lats.png'
    WHEN 'Back' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Lats.png'
    WHEN 'Middle Back' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Lats.png'
    WHEN 'Rhomboids' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Rhomboids.png'
    WHEN 'Erector Spinae' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Erector_Spinae.png'
    
    -- Shoulders
    WHEN 'Front Deltoids' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Front_Delts.png'
    WHEN 'Rear Deltoids' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Rear_Delts.png'
    WHEN 'Posterior Deltoid' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Rear_Delts.png'
    WHEN 'Side Deltoids' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Front_Delts.png'
    WHEN 'Lateral Deltoids' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Front_Delts.png'
    WHEN 'Lateral Deltoid' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Front_Delts.png'
    WHEN 'Shoulders' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Front_Delts.png'
    
    -- Traps
    WHEN 'Trapezius' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Traps.png'
    WHEN 'Traps' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Traps.png'
    WHEN 'Lower Trapezius' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Traps.png'
    WHEN 'Middle Trapezius' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Traps.png'
    
    -- Legs
    WHEN 'Quadriceps' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Quads.png'
    WHEN 'Hamstrings' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Hamstrings.png'
    WHEN 'Glutes' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Glutes.png'
    WHEN 'Gluteus Medius' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Glutes.png'
    WHEN 'Calves' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Calves.png'
    WHEN 'Gastrocnemius' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Calves.png'
    WHEN 'Tibialis Anterior' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Calves.png'
    WHEN 'Legs' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Quads.png'
    
    -- Hip/Adductors
    WHEN 'Adductors' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Adductors.png'
    WHEN 'Hip Adductors' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Adductors.png'
    WHEN 'Hip Flexors' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Hip_Flexor.png'
    WHEN 'Hip Abductors' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Glutes.png'
    
    -- Core/Abs
    WHEN 'Abs' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Upper_abs.png'
    WHEN 'Upper Abdominals' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Upper_abs.png'
    WHEN 'Lower Abdominals' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Lower_Abs.png'
    WHEN 'Obliques' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Obliques.png'
    WHEN 'Rectus Abdominis' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Upper_abs.png'
    WHEN 'Core' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Upper_abs.png'
    
    -- Neck
    WHEN 'Neck Flexors' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Neck_flexor.png'
    WHEN 'Neck Extensors' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Neck_flexor.png'
    
    -- Other
    WHEN 'Full Body' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Full_body.png'
    WHEN 'Rotator Cuff' THEN 'https://wkmrdelhoeqhsdifrarn.supabase.co/storage/v1/object/public/exercise_icons/Rear_Delts.png'
    
    ELSE NULL
END
WHERE primary_muscle IS NOT NULL;
