"""
Convert exercises CSV to SQL INSERT statements
Run this to generate the complete SQL file with all 300 exercises
"""

import csv

def generate_sql_from_csv():
    sql_header = """-- COMPLETE 300 Exercise Insert - Generated from CSV
-- This bypasses CSV upload and inserts all exercises directly

DROP TABLE IF EXISTS exercises CASCADE;

CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    instructions TEXT,
    category VARCHAR(50) NOT NULL,
    primary_muscle_group_id UUID REFERENCES muscle_groups(id),
    secondary_muscle_group_id UUID REFERENCES muscle_groups(id),
    tertiary_muscle_group_id UUID REFERENCES muscle_groups(id),
    equipment_needed TEXT,
    difficulty_level VARCHAR(20) DEFAULT 'Beginner',
    is_compound BOOLEAN DEFAULT false,
    exercise_type VARCHAR(50) DEFAULT 'strength',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to exercises for authenticated users" ON exercises FOR SELECT TO authenticated USING (true);

-- Helper function for muscle lookup
CREATE OR REPLACE FUNCTION get_muscle_id(muscle_name TEXT) RETURNS UUID AS $$
BEGIN
    IF muscle_name IS NULL OR muscle_name = 'None' THEN RETURN NULL; END IF;
    RETURN (SELECT id FROM muscle_groups WHERE name = muscle_name LIMIT 1);
END;
$$ LANGUAGE plpgsql;

-- Insert all exercises
"""

    sql_footer = """
-- Clean up
DROP FUNCTION get_muscle_id(TEXT);

-- Create indexes and view
CREATE INDEX idx_exercises_primary_muscle ON exercises(primary_muscle_group_id);
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty_level);

CREATE OR REPLACE VIEW exercises_with_muscles AS
SELECT 
    e.id, e.name, e.description, e.instructions, e.category,
    e.equipment_needed, e.difficulty_level, e.is_compound,
    pm.name as primary_muscle, sm.name as secondary_muscle, tm.name as tertiary_muscle
FROM exercises e
LEFT JOIN muscle_groups pm ON pm.id = e.primary_muscle_group_id
LEFT JOIN muscle_groups sm ON sm.id = e.secondary_muscle_group_id  
LEFT JOIN muscle_groups tm ON tm.id = e.tertiary_muscle_group_id;

-- Results
SELECT COUNT(*) as total_exercises,
       COUNT(CASE WHEN category = 'Free Weight' THEN 1 END) as free_weight,
       COUNT(CASE WHEN category = 'Machine' THEN 1 END) as machine,  
       COUNT(CASE WHEN category = 'Bodyweight' THEN 1 END) as bodyweight
FROM exercises;
"""

    inserts = []
    
    # Read the CSV file
    with open('exercises_updated_muscles.csv', 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Escape single quotes for SQL
            name = row['name'].replace("'", "''")
            description = row['description'].replace("'", "''")
            instructions = row['instructions'].replace("'", "''")
            category = row['category']
            primary_muscle = row['primary_muscle']
            secondary_muscle = row['secondary_muscle'] if row['secondary_muscle'] != 'None' else None
            tertiary_muscle = row['tertiary_muscle'] if row['tertiary_muscle'] != 'None' else None
            equipment = row['equipment_needed'].replace("'", "''")
            difficulty = row['difficulty_level']
            
            # Create INSERT statement
            insert_sql = f"""INSERT INTO exercises (name, description, instructions, category, primary_muscle_group_id, secondary_muscle_group_id, tertiary_muscle_group_id, equipment_needed, difficulty_level, is_compound, exercise_type)
VALUES ('{name}', '{description}', '{instructions}', '{category}', 
        get_muscle_id('{primary_muscle}'), 
        {"get_muscle_id('" + secondary_muscle + "')" if secondary_muscle else "NULL"}, 
        {"get_muscle_id('" + tertiary_muscle + "')" if tertiary_muscle else "NULL"},
        '{equipment}', '{difficulty}', 
        {str(secondary_muscle is not None).lower()}, 'strength');"""
            
            inserts.append(insert_sql)
    
    # Write complete SQL file
    with open('all_exercises_insert.sql', 'w', encoding='utf-8') as output:
        output.write(sql_header)
        output.write('\n\n'.join(inserts))
        output.write(sql_footer)
    
    print(f"Generated all_exercises_insert.sql with {len(inserts)} exercises")

if __name__ == "__main__":
    generate_sql_from_csv()