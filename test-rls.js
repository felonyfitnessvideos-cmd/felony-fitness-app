import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Test with ANON key (like the browser)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testRLS() {
  console.log('Testing RLS policies with ANON key (browser context)...\n');
  
  // Test foods table
  const { data: foods, error: foodsError } = await supabase
    .from('foods')
    .select('id, name')
    .limit(5);
  
  if (foodsError) {
    console.error('❌ Foods table error:', foodsError.message);
    console.error('   Code:', foodsError.code);
    console.error('   This means: RLS is blocking anonymous access');
  } else {
    console.log(`✅ Foods table accessible: ${foods.length} results`);
  }
  
  // Test portions table
  const { data: portions, error: portionsError } = await supabase
    .from('portions')
    .select('id, food_id')
    .limit(5);
  
  if (portionsError) {
    console.error('\n❌ Portions table error:', portionsError.message);
    console.error('   Code:', portionsError.code);
    console.error('   This means: RLS is blocking anonymous access');
  } else {
    console.log(`✅ Portions table accessible: ${portions.length} results`);
  }
  
  // Test with join (like the UI does)
  const { data: joined, error: joinError } = await supabase
    .from('foods')
    .select('id, name, portions(*)')
    .limit(5);
  
  if (joinError) {
    console.error('\n❌ Foods+portions join error:', joinError.message);
    console.error('   Code:', joinError.code);
  } else {
    console.log(`\n✅ Foods with portions join works: ${joined.length} results`);
    if (joined.length > 0) {
      console.log(`   First result has ${joined[0].portions?.length || 0} portions`);
    }
  }
}

testRLS();
