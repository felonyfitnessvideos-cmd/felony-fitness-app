/**
 * Check muscle group mappings for exercises
 * Verify bicep curls and other exercises have correct muscle groups
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkMuscleMappings() {
  console.log('🔍 Checking muscle group mappings...\n');

  // Get bicep curl exercises
  const { data: bicepCurls, error: curlError } = await supabase
    .from('exercises')
    .select(`
      id,
      name,
      primary_muscle_groups:muscle_groups!primary_muscle_group_id(id, name),
      secondary_muscle_groups:muscle_groups!secondary_muscle_group_id(id, name),
      tertiary_muscle_groups:muscle_groups!tertiary_muscle_group_id(id, name)
    `)
    .ilike('name', '%bicep%curl%');

  if (curlError) {
    console.error('Error fetching bicep curls:', curlError);
  } else {
    console.log('📋 Bicep Curl Exercises:');
    bicepCurls.forEach(ex => {
      console.log(`\n  ${ex.name}:`);
      console.log(`    Primary: ${ex.primary_muscle_groups?.name || 'None'}`);
      console.log(`    Secondary: ${ex.secondary_muscle_groups?.name || 'None'}`);
      console.log(`    Tertiary: ${ex.tertiary_muscle_groups?.name || 'None'}`);
    });
  }

  // Get all unique muscle groups
  const { data: muscles, error: muscleError } = await supabase
    .from('muscle_groups')
    .select('id, name')
    .order('name');

  if (muscleError) {
    console.error('\nError fetching muscle groups:', muscleError);
  } else {
    console.log('\n\n📊 All Muscle Groups in Database:');
    muscles.forEach(m => {
      console.log(`  - ${m.name} (ID: ${m.id})`);
    });
  }

  // Check if programs need the new columns
  const { data: programs, error: progError } = await supabase
    .from('programs')
    .select('id, name')
    .limit(1);

  if (progError) {
    console.error('\nError checking programs:', progError);
  }

  // Try to check if the new columns exist in program_routines_exercises
  const { data: routineEx, error: routineError } = await supabase
    .from('program_routines_exercises')
    .select('*')
    .limit(1);

  console.log('\n\n🗄️  Database Column Check:');
  if (routineError) {
    console.log('  ❌ Could not access program_routines_exercises');
  } else if (routineEx && routineEx.length > 0) {
    const hasWarmup = 'is_warmup' in routineEx[0];
    const hasIntensity = 'target_intensity_pct' in routineEx[0];
    
    console.log(`  ${hasWarmup ? '✅' : '❌'} is_warmup column ${hasWarmup ? 'EXISTS' : 'MISSING'}`);
    console.log(`  ${hasIntensity ? '✅' : '❌'} target_intensity_pct column ${hasIntensity ? 'EXISTS' : 'MISSING'}`);
    
    if (!hasWarmup || !hasIntensity) {
      console.log('\n  ⚠️  SQL MIGRATION NEEDED: Run scripts/add-exercise-warmup-intensity.sql');
    } else {
      console.log('\n  ✅ Database schema is up to date!');
    }
  } else {
    console.log('  ℹ️  No routine exercises found (table is empty)');
    console.log('  ⚠️  SQL MIGRATION NEEDED: Run scripts/add-exercise-warmup-intensity.sql');
  }
}

checkMuscleMappings().then(() => {
  console.log('\n✅ Check complete!\n');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
