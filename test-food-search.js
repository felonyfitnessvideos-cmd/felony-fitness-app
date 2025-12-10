import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testSearch() {
  console.log('Testing food search for "coffee"...\n');
  
  // Test 1: Count total foods
  const { count, error: countError } = await supabase
    .from('foods')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('❌ Error counting foods:', countError);
  } else {
    console.log(`✅ Total foods in database: ${count}`);
  }
  
  // Test 2: Search for coffee
  const { data: results, error: searchError } = await supabase
    .from('foods')
    .select('id, name, brand_owner, calories, protein_g')
    .ilike('name', '%coffee%')
    .limit(10);
  
  if (searchError) {
    console.error('❌ Search error:', searchError);
  } else {
    console.log(`\n✅ Found ${results.length} results for "coffee":`);
    results.forEach((food, i) => {
      console.log(`  ${i + 1}. ${food.name} - ${food.brand_owner || 'N/A'} (${food.calories} cal)`);
    });
  }
  
  // Test 3: Check portions table
  if (results && results.length > 0) {
    const { data: portions, error: portionError } = await supabase
      .from('portions')
      .select('*')
      .eq('food_id', results[0].id);
    
    if (portionError) {
      console.error('❌ Portion error:', portionError);
    } else {
      console.log(`\n✅ Portions for "${results[0].name}": ${portions.length}`);
    }
  }
}

testSearch();
