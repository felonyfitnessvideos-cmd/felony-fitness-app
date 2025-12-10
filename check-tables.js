import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTables() {
  console.log('Checking database tables...\n');
  
  // Check foods table
  const { count: foodsCount, error: foodsError } = await supabase
    .from('foods')
    .select('*', { count: 'exact', head: true });
  
  if (foodsError) {
    console.log('❌ foods table:', foodsError.message);
  } else {
    console.log('✅ foods table exists:', foodsCount, 'rows');
  }
  
  // Check portions table
  const { count: portionsCount, error: portionsError } = await supabase
    .from('portions')
    .select('*', { count: 'exact', head: true });
  
  if (portionsError) {
    console.log('❌ portions table:', portionsError.message);
  } else {
    console.log('✅ portions table exists:', portionsCount, 'rows');
  }
  
  // Check nutrition_logs columns
  const { data: logSample } = await supabase
    .from('nutrition_logs')
    .select('*')
    .limit(1);
  
  const hasOldColumn = logSample && logSample[0] && 'food_serving_id' in logSample[0];
  const hasNewColumn = logSample && logSample[0] && 'food_id' in logSample[0];
  
  console.log('\nnutrition_logs columns:');
  console.log(hasOldColumn ? '  ✅ food_serving_id (OLD)' : '  ❌ food_serving_id');
  console.log(hasNewColumn ? '  ✅ food_id (NEW)' : '  ❌ food_id - NEEDS MIGRATION');
}

checkTables();
