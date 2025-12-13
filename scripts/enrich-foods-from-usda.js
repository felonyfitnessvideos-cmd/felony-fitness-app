/**
 * @file enrich-foods-from-usda.js
 * @description Match existing foods to USDA dataset and import missing micronutrients
 * 
 * STRATEGY:
 * 1. Load USDA food.csv and food_nutrient.csv from local files
 * 2. Match existing DB foods to USDA foods by name similarity
 * 3. Import missing nutrients (Magnesium, Zinc, Vit D, Vit B12, etc.)
 * 4. Update foods table with complete micronutrient data
 * 
 * USAGE:
 *   node scripts/enrich-foods-from-usda.js <path-to-usda-folder>
 * 
 * EXAMPLE:
 *   node scripts/enrich-foods-from-usda.js "C:\Users\david\Desktop\Projects\Felony Fitness\FoodData_Central_csv_2025-04-24"
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============================================================================
// NUTRIENT ID MAPPINGS (USDA FoodData Central)
// ============================================================================

const CRITICAL_NUTRIENTS = {
  // Missing in DB (0% coverage)
  304: 'magnesium_mg',      // Magnesium
  309: 'zinc_mg',           // Zinc
  328: 'vitamin_d_mcg',     // Vitamin D (D2 + D3)
  418: 'vitamin_b12_mcg',   // Vitamin B12
  
  // Partial coverage - fill gaps
  317: 'selenium_mcg',      // Selenium
  312: 'copper_mg',         // Copper
  305: 'phosphorus_mg',     // Phosphorus
  
  // B Vitamins
  404: 'thiamin_mg',        // Thiamin (B1)
  405: 'riboflavin_mg',     // Riboflavin (B2)
  406: 'niacin_mg',         // Niacin (B3)
  415: 'vitamin_b6_mg',     // Vitamin B6
  417: 'folate_mcg',        // Folate total
  
  // Fat-soluble vitamins
  320: 'vitamin_a_mcg',     // Vitamin A (RAE)
  323: 'vitamin_e_mg',      // Vitamin E
  430: 'vitamin_k_mcg',     // Vitamin K
  
  // Water-soluble
  401: 'vitamin_c_mg',      // Vitamin C
  
  // Other important
  601: 'cholesterol_mg',    // Cholesterol
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize food name for matching
 */
function normalizeFoodName(name) {
  return name
    .toLowerCase()
    .replace(/[,.\-()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate similarity score between two strings
 */
function calculateSimilarity(str1, str2) {
  const s1 = normalizeFoodName(str1);
  const s2 = normalizeFoodName(str2);
  
  // Exact match
  if (s1 === s2) return 100;
  
  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 90;
  
  // Word overlap
  const words1 = new Set(s1.split(' '));
  const words2 = new Set(s2.split(' '));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return (intersection.size / union.size) * 100;
}

/**
 * Load USDA food data
 */
async function loadUSDAFoods(usdaPath) {
  console.log('📥 Loading USDA food.csv...');
  
  const foodPath = path.join(usdaPath, 'food.csv');
  const foods = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(foodPath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        foods.push({
          fdc_id: parseInt(row.fdc_id),
          description: row.description,
          data_type: row.data_type,
          category: row.food_category_id || null
        });
      })
      .on('end', () => {
        console.log(`✅ Loaded ${foods.length.toLocaleString()} USDA foods`);
        resolve(foods);
      })
      .on('error', reject);
  });
}

/**
 * Load USDA nutrient data for specific foods
 */
async function loadUSDANutrients(usdaPath, fdcIds) {
  console.log('📥 Loading USDA food_nutrient.csv...');
  
  const nutrientPath = path.join(usdaPath, 'food_nutrient.csv');
  const nutrients = {};
  
  const fdcIdSet = new Set(fdcIds);
  const nutrientIds = Object.keys(CRITICAL_NUTRIENTS).map(n => parseInt(n));
  
  let processed = 0;
  let matched = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(nutrientPath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        processed++;
        
        if (processed % 1000000 === 0) {
          console.log(`   Processed ${(processed / 1000000).toFixed(1)}M rows, found ${matched} nutrient values...`);
        }
        
        const fdcId = parseInt(row.fdc_id);
        const nutrientId = parseInt(row.nutrient_id);
        const amount = parseFloat(row.amount) || 0;
        
        // Only process foods we care about and critical nutrients
        if (fdcIdSet.has(fdcId) && nutrientIds.includes(nutrientId)) {
          if (!nutrients[fdcId]) {
            nutrients[fdcId] = {};
          }
          
          const columnName = CRITICAL_NUTRIENTS[nutrientId];
          nutrients[fdcId][columnName] = amount;
          matched++;
        }
      })
      .on('end', () => {
        console.log(`✅ Processed ${processed.toLocaleString()} nutrient rows`);
        console.log(`✅ Found ${matched.toLocaleString()} critical nutrient values`);
        console.log(`✅ Loaded nutrients for ${Object.keys(nutrients).length} foods`);
        resolve(nutrients);
      })
      .on('error', reject);
  });
}

/**
 * Match DB foods to USDA foods
 */
function matchFoodsToUSDA(dbFoods, usdaFoods) {
  console.log('🔍 Matching DB foods to USDA dataset...');
  
  const matches = [];
  let highConfidence = 0;
  let mediumConfidence = 0;
  let lowConfidence = 0;
  
  for (const dbFood of dbFoods) {
    let bestMatch = null;
    let bestScore = 0;
    
    // Try to find best USDA match
    for (const usdaFood of usdaFoods) {
      const score = calculateSimilarity(dbFood.name, usdaFood.description);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = usdaFood;
      }
      
      // Early exit for perfect matches
      if (score === 100) break;
    }
    
    // Only accept matches above threshold
    if (bestScore >= 70) {
      matches.push({
        dbFood,
        usdaFood: bestMatch,
        score: bestScore
      });
      
      if (bestScore >= 90) highConfidence++;
      else if (bestScore >= 80) mediumConfidence++;
      else lowConfidence++;
    }
  }
  
  console.log(`✅ Matched ${matches.length} foods:`);
  console.log(`   🟢 High confidence (90+): ${highConfidence}`);
  console.log(`   🟡 Medium confidence (80-89): ${mediumConfidence}`);
  console.log(`   🟠 Low confidence (70-79): ${lowConfidence}`);
  
  return matches;
}

/**
 * Update foods in database with enriched nutrient data
 */
async function enrichFoodsInDatabase(matches, nutrientData) {
  console.log('💾 Enriching foods in database...');
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const match of matches) {
    const fdcId = match.usdaFood.fdc_id;
    const nutrients = nutrientData[fdcId];
    
    if (!nutrients || Object.keys(nutrients).length === 0) {
      skipped++;
      continue;
    }
    
    // Build update object with only non-zero values
    const updateData = { data_source: 'USDA' };
    for (const [key, value] of Object.entries(nutrients)) {
      if (value > 0) {
        updateData[key] = value;
      }
    }
    
    // Only update if we have actual nutrient data
    if (Object.keys(updateData).length > 1) {
      const { error } = await supabase
        .from('foods')
        .update(updateData)
        .eq('id', match.dbFood.id);
      
      if (error) {
        console.error(`   ❌ Error updating food ${match.dbFood.id}:`, error.message);
        errors++;
      } else {
        updated++;
        
        if (updated % 10 === 0) {
          console.log(`   Updated ${updated} foods...`);
        }
      }
    } else {
      skipped++;
    }
  }
  
  console.log(`✅ Enrichment complete:`);
  console.log(`   Updated: ${updated} foods`);
  console.log(`   Skipped: ${skipped} (no nutrient data)`);
  console.log(`   Errors: ${errors}`);
  
  return { updated, skipped, errors };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Missing USDA folder path');
    console.error('Usage: node scripts/enrich-foods-from-usda.js <path-to-usda-folder>');
    console.error('Example: node scripts/enrich-foods-from-usda.js "C:\\Users\\david\\Desktop\\Projects\\Felony Fitness\\FoodData_Central_csv_2025-04-24"');
    process.exit(1);
  }
  
  const usdaPath = args[0];
  
  if (!fs.existsSync(usdaPath)) {
    console.error(`❌ USDA folder not found: ${usdaPath}`);
    process.exit(1);
  }
  
  console.log('\n🚀 FOOD DATABASE ENRICHMENT FROM USDA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📁 USDA Folder: ${usdaPath}\n`);
  
  try {
    // Step 1: Load foods from database (prioritize logged foods)
    console.log('📊 Step 1: Loading foods from database...');
    const { data: dbFoods, error: dbError } = await supabase
      .from('foods')
      .select('id, name, brand_owner, times_logged, magnesium_mg, zinc_mg, vitamin_d_mcg, vitamin_b12_mcg')
      .order('times_logged', { ascending: false })
      .limit(1000); // Start with top 1000 foods
    
    if (dbError) throw dbError;
    
    console.log(`✅ Loaded ${dbFoods.length} foods from database`);
    
    // Filter to foods missing critical nutrients
    const foodsNeedingEnrichment = dbFoods.filter(f => 
      f.magnesium_mg === 0 || f.zinc_mg === 0 || f.vitamin_d_mcg === 0 || f.vitamin_b12_mcg === 0
    );
    
    console.log(`🎯 ${foodsNeedingEnrichment.length} foods need enrichment\n`);
    
    if (foodsNeedingEnrichment.length === 0) {
      console.log('✅ All foods already have complete nutrient data!');
      return;
    }
    
    // Step 2: Load USDA foods
    console.log('📊 Step 2: Loading USDA dataset...');
    const usdaFoods = await loadUSDAFoods(usdaPath);
    console.log();
    
    // Step 3: Match foods
    console.log('📊 Step 3: Matching foods to USDA dataset...');
    const matches = matchFoodsToUSDA(foodsNeedingEnrichment, usdaFoods);
    console.log();
    
    if (matches.length === 0) {
      console.log('❌ No matches found. Try adjusting matching threshold.');
      return;
    }
    
    // Step 4: Load nutrients for matched foods
    console.log('📊 Step 4: Loading nutrient data for matched foods...');
    const fdcIds = matches.map(m => m.usdaFood.fdc_id);
    const nutrientData = await loadUSDANutrients(usdaPath, fdcIds);
    console.log();
    
    // Step 5: Update database
    console.log('📊 Step 5: Updating database with enriched data...');
    const results = await enrichFoodsInDatabase(matches, nutrientData);
    console.log();
    
    // Summary
    console.log('📋 ENRICHMENT SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total DB Foods Analyzed: ${dbFoods.length}`);
    console.log(`Foods Needing Enrichment: ${foodsNeedingEnrichment.length}`);
    console.log(`USDA Matches Found: ${matches.length}`);
    console.log(`Successfully Enriched: ${results.updated}`);
    console.log(`Skipped (no data): ${results.skipped}`);
    console.log(`Errors: ${results.errors}`);
    console.log();
    console.log('✅ Enrichment complete! Run audit again to see improvements.');
    console.log('💡 To process more foods, increase the limit in the script or run again.');
    
  } catch (error) {
    console.error('\n❌ Enrichment failed:', error);
    process.exit(1);
  }
}

main();
