/**
 * @file enrich-existing-foods.js
 * @description Efficiently enrich ONLY foods that exist in our database
 * Strategy: 
 * 1. Get all food IDs from database (12,652 foods)
 * 2. Load USDA food.csv and create ID lookup (only matching foods)
 * 3. Load nutrients only for matched foods
 * 4. Update database in batches
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import { parse } from 'csv-parse';

dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Critical missing nutrients to enrich
const NUTRIENT_MAP = {
  304: 'magnesium_mg',    // Magnesium (0% coverage)
  309: 'zinc_mg',         // Zinc (0% coverage)
  328: 'vitamin_d_mcg',   // Vitamin D (0% coverage)
  418: 'vitamin_b12_mcg', // Vitamin B12 (0% coverage)
  // Also fill gaps in partial coverage:
  401: 'vitamin_c_mg',    // Vitamin C (58% coverage)
  303: 'iron_mg',         // Iron (97% - fill remaining gaps)
};

const USDA_PATH = process.argv[2];

if (!USDA_PATH) {
  console.error('Usage: node scripts/enrich-existing-foods.js <path-to-USDA-folder>');
  console.error('Example: node scripts/enrich-existing-foods.js "C:\\Users\\david\\Desktop\\Projects\\Felony Fitness\\FoodData_Central_csv_2025-04-24"');
  process.exit(1);
}

console.log('\n🔄 TARGETED MICRONUTRIENT ENRICHMENT');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function main() {
  // Step 1: Get ALL food IDs from database
  console.log('📥 Step 1: Fetching food IDs from database...');
  
  const { data: dbFoods, error: dbError } = await supabase
    .from('foods')
    .select('id, name');
  
  if (dbError) {
    console.error('❌ Database error:', dbError);
    process.exit(1);
  }
  
  console.log(`✅ Found ${dbFoods.length} foods in database\n`);
  
  // Create lookup map of database food IDs
  const dbFoodIds = new Set(dbFoods.map(f => f.id));
  const _dbFoodNames = new Map(dbFoods.map(f => [f.id, f.name]));
  
  // Step 2: Load USDA food.csv - only keep foods that exist in our DB
  console.log('📥 Step 2: Loading USDA food.csv (filtering to our foods)...');
  
  const foodPath = `${USDA_PATH}/food.csv`;
  const matchedFoods = new Map(); // fdc_id -> { id: our_db_id }
  
  let totalUsdaFoods = 0;
  let matchedCount = 0;
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(foodPath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        totalUsdaFoods++;
        const fdcId = parseInt(row.fdc_id);
        
        // Check if this USDA food exists in our database
        if (dbFoodIds.has(fdcId)) {
          matchedFoods.set(fdcId, { id: fdcId });
          matchedCount++;
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`✅ Scanned ${totalUsdaFoods} USDA foods`);
  console.log(`✅ Found ${matchedCount} matches in our database\n`);
  
  if (matchedCount === 0) {
    console.log('⚠️  No matches found. Your database may use different IDs.');
    console.log('   Trying name-based matching...\n');
    
    // Fallback: Try matching by name
    // TODO: Implement fuzzy name matching if needed
    console.log('❌ Name-based matching not yet implemented');
    console.log('   Your foods table likely needs the fdc_id column populated first.');
    process.exit(0);
  }
  
  // Step 3: Load nutrients ONLY for matched foods
  console.log('📥 Step 3: Loading nutrients for matched foods...');
  
  const nutrientPath = `${USDA_PATH}/food_nutrient.csv`;
  const foodNutrients = new Map(); // fdc_id -> { nutrient_id -> amount }
  
  let totalNutrients = 0;
  let relevantNutrients = 0;
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(nutrientPath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        totalNutrients++;
        
        const fdcId = parseInt(row.fdc_id);
        const nutrientId = parseInt(row.nutrient_id);
        const amount = parseFloat(row.amount);
        
        // Only process if this is a matched food AND a nutrient we care about
        if (matchedFoods.has(fdcId) && NUTRIENT_MAP[nutrientId]) {
          if (!foodNutrients.has(fdcId)) {
            foodNutrients.set(fdcId, {});
          }
          foodNutrients.get(fdcId)[nutrientId] = amount;
          relevantNutrients++;
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`✅ Scanned ${totalNutrients} nutrient records`);
  console.log(`✅ Found ${relevantNutrients} relevant nutrients for our foods\n`);
  
  // Step 4: Build update records
  console.log('🔧 Step 4: Building update records...');
  
  const updates = [];
  
  for (const [fdcId, nutrients] of foodNutrients.entries()) {
    const updateData = { id: fdcId };
    
    for (const [nutrientId, amount] of Object.entries(nutrients)) {
      const column = NUTRIENT_MAP[nutrientId];
      if (column) {
        updateData[column] = amount;
      }
    }
    
    // Only update if we have at least one nutrient
    if (Object.keys(updateData).length > 1) {
      updates.push(updateData);
    }
  }
  
  console.log(`✅ Prepared ${updates.length} food updates\n`);
  
  if (updates.length === 0) {
    console.log('⚠️  No updates to apply. Exiting.');
    process.exit(0);
  }
  
  // Step 5: Update database in batches
  console.log('💾 Step 5: Updating database...');
  console.log(`   Nutrients being updated: ${Object.values(NUTRIENT_MAP).join(', ')}\n`);
  
  const BATCH_SIZE = 100;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    
    process.stdout.write(`\r   Processing: ${Math.min(i + BATCH_SIZE, updates.length)}/${updates.length} foods...`);
    
    // Update each food individually (upsert doesn't work well with partial updates)
    for (const food of batch) {
      const { id, ...nutrients } = food;
      
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
  }
  
  console.log('\n');
  console.log('✅ ENRICHMENT COMPLETE!\n');
  console.log(`   ✅ Successfully updated: ${successCount} foods`);
  console.log(`   ❌ Errors: ${errorCount} foods\n`);
  
  // Step 6: Run audit again to see improvements
  console.log('📊 Running post-enrichment audit...\n');
  
  const { data: auditData } = await supabase
    .from('foods')
    .select('magnesium_mg, zinc_mg, vitamin_d_mcg, vitamin_b12_mcg, vitamin_c_mg, iron_mg')
    .limit(1000);
  
  if (auditData) {
    const total = auditData.length;
    console.log('   Nutrient Coverage (Post-Enrichment):');
    console.log(`   - Magnesium: ${auditData.filter(f => f.magnesium_mg > 0).length}/${total} (${((auditData.filter(f => f.magnesium_mg > 0).length / total) * 100).toFixed(1)}%)`);
    console.log(`   - Zinc: ${auditData.filter(f => f.zinc_mg > 0).length}/${total} (${((auditData.filter(f => f.zinc_mg > 0).length / total) * 100).toFixed(1)}%)`);
    console.log(`   - Vitamin D: ${auditData.filter(f => f.vitamin_d_mcg > 0).length}/${total} (${((auditData.filter(f => f.vitamin_d_mcg > 0).length / total) * 100).toFixed(1)}%)`);
    console.log(`   - Vitamin B12: ${auditData.filter(f => f.vitamin_b12_mcg > 0).length}/${total} (${((auditData.filter(f => f.vitamin_b12_mcg > 0).length / total) * 100).toFixed(1)}%)`);
  }
  
  console.log('\n✅ Done!\n');
}

main().catch(console.error);
