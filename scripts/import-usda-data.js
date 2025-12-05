/**
 * @file scripts/import-usda-data.js
 * @description Import local USDA FoodData Central CSV files directly into Supabase
 * 
 * USAGE:
 *   node scripts/import-usda-data.js <path-to-usda-folder> [options]
 * 
 * EXAMPLES:
 *   node scripts/import-usda-data.js ./usda_data
 *   node scripts/import-usda-data.js ./usda_data --data-types=branded_food,foundation_food
 *   node scripts/import-usda-data.js ./usda_data --batch-size=500 --dry-run
 * 
 * OPTIONS:
 *   --data-types     Comma-separated list of data types to import (default: all)
 *   --batch-size     Number of records per batch insert (default: 1000)
 *   --dry-run        Parse files but don't insert to database
 *   --skip-existing  Skip foods that already exist (by fdc_id)
 * 
 * REQUIRED USDA FILES (from FoodData_Central_csv_*.zip):
 *   - food.csv               (core food metadata)
 *   - food_nutrient.csv      (nutrient values for each food)
 *   - nutrient.csv           (nutrient definitions)
 *   - branded_food.csv       (branded food specific data)
 *   - food_category.csv      (optional: food categories)
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { createClient } = require('@supabase/supabase-js');

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Nutrient ID to database column mapping (from USDA_NUTRIENT_MAPPINGS.md)
const NUTRIENT_MAP = {
  // Macronutrients
  203: 'protein_g',
  204: 'fat_g',
  205: 'carbs_g',
  208: 'calories',
  291: 'fiber_g',
  269: 'sugar_g',
  
  // Minerals
  301: 'calcium_mg',
  303: 'iron_mg',
  304: 'magnesium_mg',
  305: 'phosphorus_mg',
  306: 'potassium_mg',
  307: 'sodium_mg',
  309: 'zinc_mg',
  312: 'copper_mg',
  315: 'manganese_mg',
  317: 'selenium_mcg',
  
  // Vitamins (Fat-Soluble)
  320: 'vitamin_a_mcg',
  328: 'vitamin_d_mcg',
  323: 'vitamin_e_mg',
  430: 'vitamin_k_mcg',
  
  // Vitamins (Water-Soluble)
  401: 'vitamin_c_mg',
  404: 'thiamin_mg',
  405: 'riboflavin_mg',
  406: 'niacin_mg',
  410: 'pantothenic_acid_mg',
  415: 'vitamin_b6_mg',
  417: 'folate_mcg',
  418: 'vitamin_b12_mcg',
  421: 'choline_mg',
  
  // Fatty Acids
  606: 'saturated_fat_g',
  645: 'monounsaturated_fat_g',
  646: 'polyunsaturated_fat_g',
  605: 'trans_fat_g',
  601: 'cholesterol_mg',
  
  // Other
  255: 'water_g',
  262: 'caffeine_mg',
  221: 'alcohol_g'
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function readCSV(filePath) {
  console.log(`📖 Reading: ${path.basename(filePath)}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  });
  console.log(`   ✅ Loaded ${records.length.toLocaleString()} records`);
  return records;
}

function categorizeFood(description) {
  const lower = description.toLowerCase();
  
  if (lower.includes('beef') || lower.includes('chicken') || lower.includes('pork') || lower.includes('turkey') || lower.includes('lamb')) {
    return 'Meat & Poultry';
  }
  if (lower.includes('fish') || lower.includes('salmon') || lower.includes('tuna') || lower.includes('shrimp')) {
    return 'Seafood';
  }
  if (lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt') || lower.includes('butter')) {
    return 'Dairy';
  }
  if (lower.includes('bread') || lower.includes('pasta') || lower.includes('rice') || lower.includes('cereal')) {
    return 'Grains';
  }
  if (lower.includes('apple') || lower.includes('banana') || lower.includes('orange') || lower.includes('berry')) {
    return 'Fruits';
  }
  if (lower.includes('lettuce') || lower.includes('carrot') || lower.includes('broccoli') || lower.includes('spinach')) {
    return 'Vegetables';
  }
  if (lower.includes('cookie') || lower.includes('cake') || lower.includes('candy') || lower.includes('chocolate')) {
    return 'Sweets';
  }
  if (lower.includes('soda') || lower.includes('juice') || lower.includes('coffee') || lower.includes('tea')) {
    return 'Beverages';
  }
  if (lower.includes('oil') || lower.includes('sauce') || lower.includes('dressing') || lower.includes('condiment')) {
    return 'Condiments & Oils';
  }
  
  return 'Other';
}

// ============================================================================
// MAIN IMPORT LOGIC
// ============================================================================

async function importUSDAData(usdaPath, options = {}) {
  const {
    dataTypes = ['branded_food', 'foundation_food', 'sr_legacy_food'],
    batchSize = 1000,
    dryRun = false,
    skipExisting = true
  } = options;

  console.log('\n🚀 USDA FoodData Central Importer');
  console.log('=====================================');
  console.log(`📁 Source: ${usdaPath}`);
  console.log(`📊 Data Types: ${dataTypes.join(', ')}`);
  console.log(`📦 Batch Size: ${batchSize}`);
  console.log(`🧪 Dry Run: ${dryRun ? 'YES' : 'NO'}`);
  console.log('=====================================\n');

  // Step 1: Load all CSV files
  console.log('📥 STEP 1: Loading USDA CSV files...\n');
  
  const foods = readCSV(path.join(usdaPath, 'food.csv'));
  const foodNutrients = readCSV(path.join(usdaPath, 'food_nutrient.csv'));
  const brandedFoods = fs.existsSync(path.join(usdaPath, 'branded_food.csv'))
    ? readCSV(path.join(usdaPath, 'branded_food.csv'))
    : [];

  // Step 2: Build nutrient lookup map (fdc_id => { nutrient_id => value })
  console.log('\n🔄 STEP 2: Building nutrient index...\n');
  const nutrientsByFood = new Map();
  
  for (const nutrient of foodNutrients) {
    const fdcId = parseInt(nutrient.fdc_id);
    const nutrientId = parseInt(nutrient.nutrient_id);
    const value = parseFloat(nutrient.amount) || 0;
    
    if (!nutrientsByFood.has(fdcId)) {
      nutrientsByFood.set(fdcId, {});
    }
    
    if (NUTRIENT_MAP[nutrientId]) {
      nutrientsByFood.get(fdcId)[NUTRIENT_MAP[nutrientId]] = value;
    }
  }
  
  console.log(`   ✅ Indexed nutrients for ${nutrientsByFood.size.toLocaleString()} foods`);

  // Step 3: Build branded food lookup map
  console.log('\n🔄 STEP 3: Building branded food index...\n');
  const brandedByFdcId = new Map();
  
  for (const branded of brandedFoods) {
    brandedByFdcId.set(parseInt(branded.fdc_id), branded);
  }
  
  console.log(`   ✅ Indexed ${brandedByFdcId.size.toLocaleString()} branded foods`);

  // Step 4: Filter foods by data type
  console.log('\n🔍 STEP 4: Filtering foods by data type...\n');
  const filteredFoods = foods.filter(food => dataTypes.includes(food.data_type));
  console.log(`   ✅ Selected ${filteredFoods.length.toLocaleString()} foods (from ${foods.length.toLocaleString()} total)`);

  // Step 5: Transform USDA data to our schema
  console.log('\n🔄 STEP 5: Transforming data to database schema...\n');
  const transformedFoods = [];
  
  for (const food of filteredFoods) {
    const fdcId = parseInt(food.fdc_id);
    const nutrients = nutrientsByFood.get(fdcId) || {};
    const branded = brandedByFdcId.get(fdcId);
    
    const transformed = {
      fdc_id: fdcId,
      data_type: food.data_type,
      description: food.description || 'Unknown',
      food_category_id: food.food_category_id ? parseInt(food.food_category_id) : null,
      publication_date: food.publication_date || null,
      
      // Nutrients (default to 0 if missing)
      ...nutrients,
      
      // Branded food specific fields
      brand_owner: branded?.brand_owner || null,
      brand_name: branded?.brand_name || null,
      subbrand_name: branded?.subbrand_name || null,
      gtin_upc: branded?.gtin_upc || null,
      ingredients: branded?.ingredients || null,
      serving_size: branded?.serving_size ? parseFloat(branded.serving_size) : null,
      serving_size_unit: branded?.serving_size_unit || null,
      household_serving_fulltext: branded?.household_serving_fulltext || null,
      
      // Metadata
      category: categorizeFood(food.description),
      data_source: 'usda'
    };
    
    transformedFoods.push(transformed);
  }
  
  console.log(`   ✅ Transformed ${transformedFoods.length.toLocaleString()} foods`);

  // Step 6: Insert to database in batches
  if (dryRun) {
    console.log('\n🧪 DRY RUN: Skipping database insert');
    console.log('\n📊 Sample Record:');
    console.log(JSON.stringify(transformedFoods[0], null, 2));
    return;
  }

  console.log('\n💾 STEP 6: Inserting to Supabase...\n');
  
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  for (let i = 0; i < transformedFoods.length; i += batchSize) {
    const batch = transformedFoods.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(transformedFoods.length / batchSize);
    
    console.log(`   📦 Batch ${batchNum}/${totalBatches} (${batch.length} records)...`);
    
    try {
      const { error } = await supabase
        .from('food_servings')
        .upsert(batch, { onConflict: 'fdc_id', ignoreDuplicates: skipExisting });
      
      if (error) {
        console.error(`   ❌ Error:`, error.message);
        totalErrors += batch.length;
      } else {
        totalInserted += batch.length;
        console.log(`   ✅ Inserted ${batch.length} records`);
      }
    } catch (err) {
      console.error(`   ❌ Exception:`, err.message);
      totalErrors += batch.length;
    }
    
    // Progress indicator
    const progress = ((i + batchSize) / transformedFoods.length * 100).toFixed(1);
    console.log(`   📊 Progress: ${progress}%\n`);
  }

  // Step 7: Summary
  console.log('\n✅ IMPORT COMPLETE');
  console.log('=====================================');
  console.log(`✅ Inserted: ${totalInserted.toLocaleString()}`);
  console.log(`⏭️  Skipped: ${totalSkipped.toLocaleString()}`);
  console.log(`❌ Errors: ${totalErrors.toLocaleString()}`);
  console.log('=====================================\n');
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

const args = process.argv.slice(2);
const usdaPath = args[0];

if (!usdaPath) {
  console.error('❌ Usage: node import-usda-data.js <path-to-usda-folder> [options]');
  process.exit(1);
}

if (!fs.existsSync(usdaPath)) {
  console.error(`❌ Directory not found: ${usdaPath}`);
  process.exit(1);
}

// Parse options
const options = {};
args.slice(1).forEach(arg => {
  if (arg.startsWith('--data-types=')) {
    options.dataTypes = arg.split('=')[1].split(',');
  } else if (arg.startsWith('--batch-size=')) {
    options.batchSize = parseInt(arg.split('=')[1]);
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--skip-existing') {
    options.skipExisting = true;
  }
});

// Run import
importUSDAData(usdaPath, options)
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
