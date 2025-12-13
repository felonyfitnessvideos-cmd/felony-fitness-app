/**
 * STEP 1: Export all foods from database to CSV
 * This creates a list of all foods we need to enrich
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n📤 STEP 1: Export Database Foods to CSV');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function exportFoods() {
  const BATCH_SIZE = 1000;
  let allFoods = [];
  let page = 0;
  
  console.log('📥 Fetching foods from database...\n');
  
  while (true) {
    const start = page * BATCH_SIZE;
    const end = start + BATCH_SIZE - 1;
    
    console.log(`   Fetching batch ${page + 1} (foods ${start + 1} - ${end + 1})...`);
    
    const { data, error } = await supabase
      .from('foods')
      .select('id, name, brand_owner, category, magnesium_mg, zinc_mg, vitamin_d_mcg, vitamin_b12_mcg')
      .range(start, end);
    
    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
    
    if (!data || data.length === 0) {
      break;
    }
    
    allFoods = allFoods.concat(data);
    console.log(`   ✅ Retrieved ${data.length} foods (total: ${allFoods.length})`);
    
    if (data.length < BATCH_SIZE) {
      break;
    }
    
    page++;
  }
  
  console.log(`\n✅ Total foods retrieved: ${allFoods.length}\n`);
  
  // Create CSV
  console.log('💾 Creating CSV file...');
  
  const csv = [
    'id,name,brand_owner,category,has_magnesium,has_zinc,has_vitamin_d,has_vitamin_b12',
    ...allFoods.map(f => 
      `${f.id},"${(f.name || '').replace(/"/g, '""')}","${(f.brand_owner || '').replace(/"/g, '""')}","${(f.category || '').replace(/"/g, '""')}",${f.magnesium_mg > 0 ? 'YES' : 'NO'},${f.zinc_mg > 0 ? 'YES' : 'NO'},${f.vitamin_d_mcg > 0 ? 'YES' : 'NO'},${f.vitamin_b12_mcg > 0 ? 'YES' : 'NO'}`
    )
  ].join('\n');
  
  const outputPath = 'scripts/step1-database-foods.csv';
  fs.writeFileSync(outputPath, csv, 'utf8');
  
  console.log(`✅ Exported to: ${outputPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total foods: ${allFoods.length}`);
  console.log(`   Missing Magnesium: ${allFoods.filter(f => f.magnesium_mg === 0).length}`);
  console.log(`   Missing Zinc: ${allFoods.filter(f => f.zinc_mg === 0).length}`);
  console.log(`   Missing Vitamin D: ${allFoods.filter(f => f.vitamin_d_mcg === 0).length}`);
  console.log(`   Missing Vitamin B12: ${allFoods.filter(f => f.vitamin_b12_mcg === 0).length}`);
  
  console.log('\n✅ STEP 1 COMPLETE!\n');
  console.log('Next: Run step 2 to match with USDA data');
  console.log('   node scripts/step2-match-usda.js\n');
}

exportFoods().catch(console.error);
