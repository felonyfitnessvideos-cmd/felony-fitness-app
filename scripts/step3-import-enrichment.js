/**
 * STEP 3: Import enrichment data into database
 * Input: step2-enrichment-data.csv
 * Output: Updated foods table with micronutrients
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import { parse } from 'csv-parse';

dotenv.config({ path: '.env.local' });
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ENRICHMENT_CSV = 'scripts/step2-enrichment-data.csv';

console.log('\n💾 STEP 3: Import Enrichment Data to Database');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function importEnrichment() {
  // Load enrichment data
  console.log(`📥 Loading enrichment data from ${ENRICHMENT_CSV}...\n`);
  
  const updates = [];
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(ENRICHMENT_CSV)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        updates.push({
          id: parseInt(row.id),
          iron_mg: parseFloat(row.iron_mg) || 0,
          magnesium_mg: parseFloat(row.magnesium_mg) || 0,
          zinc_mg: parseFloat(row.zinc_mg) || 0,
          vitamin_d_mcg: parseFloat(row.vitamin_d_mcg) || 0,
          vitamin_c_mg: parseFloat(row.vitamin_c_mg) || 0,
          vitamin_b12_mcg: parseFloat(row.vitamin_b12_mcg) || 0,
        });
        
        if (updates.length % 1000 === 0) {
          process.stdout.write(`\r   Loaded ${updates.length} records...`);
        }
      })
      .on('end', () => {
        console.log(`\r   ✅ Loaded ${updates.length} enrichment records\n`);
        resolve();
      })
      .on('error', reject);
  });
  
  // Update database in batches
  console.log('💾 Updating database...');
  console.log('   This will update nutrients for each food.\n');
  
  const BATCH_SIZE = 50; // Smaller batches for better progress visibility
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    const progress = Math.min(i + BATCH_SIZE, updates.length);
    const percent = ((progress / updates.length) * 100).toFixed(1);
    
    process.stdout.write(`\r   Progress: ${progress}/${updates.length} (${percent}%) - ✅ ${successCount} ❌ ${errorCount} ⏭️ ${skippedCount}`);
    
    // Process each food in batch
    for (const food of batch) {
      const { id, ...nutrients } = food;
      
      // Only update if we have at least one non-zero nutrient
      const hasData = Object.values(nutrients).some(v => v > 0);
      
      if (!hasData) {
        skippedCount++;
        continue;
      }
      
      const { error } = await supabase
        .from('foods')
        .update(nutrients)
        .eq('id', id);
      
      if (error) {
        errorCount++;
      } else {
        successCount++;
      }
    }
    
    // Small delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log('\n');
  console.log('✅ IMPORT COMPLETE!\n');
  console.log(`📊 Results:`);
  console.log(`   ✅ Successfully updated: ${successCount} foods`);
  console.log(`   ❌ Errors: ${errorCount} foods`);
  console.log(`   ⏭️  Skipped (no data): ${skippedCount} foods`);
  console.log(`   📈 Total processed: ${updates.length} foods\n`);
  
  // Verify improvements
  console.log('🔍 Verifying improvements...\n');
  
  const { data: sample } = await supabase
    .from('foods')
    .select('magnesium_mg, zinc_mg, vitamin_d_mcg, vitamin_b12_mcg')
    .limit(1000);
  
  if (sample) {
    const total = sample.length;
    console.log('   Post-Enrichment Coverage (sample of 1000 foods):');
    console.log(`   Magnesium:   ${sample.filter(f => f.magnesium_mg > 0).length}/${total} (${((sample.filter(f => f.magnesium_mg > 0).length / total) * 100).toFixed(1)}%)`);
    console.log(`   Zinc:        ${sample.filter(f => f.zinc_mg > 0).length}/${total} (${((sample.filter(f => f.zinc_mg > 0).length / total) * 100).toFixed(1)}%)`);
    console.log(`   Vitamin D:   ${sample.filter(f => f.vitamin_d_mcg > 0).length}/${total} (${((sample.filter(f => f.vitamin_d_mcg > 0).length / total) * 100).toFixed(1)}%)`);
    console.log(`   Vitamin B12: ${sample.filter(f => f.vitamin_b12_mcg > 0).length}/${total} (${((sample.filter(f => f.vitamin_b12_mcg > 0).length / total) * 100).toFixed(1)}%)`);
  }
  
  console.log('\n✅ ALL STEPS COMPLETE!\n');
  console.log('🎉 Your database now has comprehensive micronutrient data!\n');
}

importEnrichment().catch(console.error);
