import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testExactQuery() {
  const term = 'coffee';
  
  console.log('Testing exact query from NutritionLogPage...\n');
  console.log(`Query: .or('name.ilike.%${term}%,brand_owner.ilike.%${term}%')\n`);
  
  // Exact query from the code
  const { data: results, error: searchError } = await supabase
    .from('foods')
    .select(`
      *,
      portions (*)
    `)
    .or(`name.ilike.%${term}%,brand_owner.ilike.%${term}%`)
    .order('name')
    .limit(50);

  if (searchError) {
    console.error('❌ Search error:', searchError);
    console.error('Error details:', JSON.stringify(searchError, null, 2));
  } else {
    console.log(`✅ Found ${results.length} results`);
    if (results.length > 0) {
      console.log('\nFirst 3 results:');
      results.slice(0, 3).forEach((food, i) => {
        console.log(`  ${i + 1}. ${food.name}`);
        console.log(`     Brand: ${food.brand_owner || 'N/A'}`);
        console.log(`     Portions: ${food.portions?.length || 0}`);
      });
    }
  }
}

testExactQuery();
