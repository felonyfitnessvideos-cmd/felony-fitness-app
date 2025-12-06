/**
 * USDA Food Data Streaming Import Script
 * 
 * @description Efficiently imports Foundation and SR Legacy foods from local CSV files
 * into Supabase. Uses streaming to handle large files (food_nutrient.csv is 4GB+).
 * 
 * Strategy:
 * 1. Build allowlist of ~50k Foundation/SR Legacy foods (fits in RAM)
 * 2. Stream food_nutrient.csv, skip 95% of rows (branded foods)
 * 3. Stream food_portion.csv, filter by allowlist
 * 4. Bulk insert into Supabase in 1000-row batches
 * 
 * Usage:
 *   node scripts/import_stream.js ./FoodData_Central_csv_2025-04-24
 */

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('   Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Nutrient ID mappings (USDA FoodData Central)
const NUTRIENT_MAP = {
  208: 'calories',
  203: 'protein_g',
  204: 'fat_g',
  205: 'carbs_g',
  291: 'fiber_g',
  269: 'sugar_g',
  307: 'sodium_mg',
  306: 'potassium_mg',
  301: 'calcium_mg',
  303: 'iron_mg',
  304: 'magnesium_mg',
  305: 'phosphorus_mg',
  309: 'zinc_mg',
  312: 'copper_mg',
  315: 'manganese_mg',
  317: 'selenium_mcg',
  320: 'vitamin_a_mcg',
  401: 'vitamin_c_mg',
  404: 'thiamin_mg',
  405: 'riboflavin_mg',
  406: 'niacin_mg',
  410: 'pantothenic_acid_mg',
  415: 'vitamin_b6_mg',
  417: 'folate_mcg',
  418: 'vitamin_b12_mcg',
  323: 'vitamin_e_mg',
  430: 'vitamin_k_mcg',
  324: 'vitamin_d_mcg',
  606: 'saturated_fat_g',
  645: 'monounsaturated_fat_g',
  646: 'polyunsaturated_fat_g',
  601: 'cholesterol_mg'
};

const ALLOWED_TYPES = ['foundation_food', 'sr_legacy_food'];
const BATCH_SIZE = 1000;

/**
 * Step 1: Build Allowed List from food.csv
 * Loads ~50k Foundation/SR Legacy foods into memory
 */
async function buildAllowedList(csvDir) {
  console.log('\n📋 STEP 1: Building Allowed List from food.csv...');
  
  const allowedFoods = new Map();
  const foodPath = path.join(csvDir, 'food.csv');
  
  if (!fs.existsSync(foodPath)) {
    throw new Error(`File not found: ${foodPath}`);
  }

  return new Promise((resolve, reject) => {
    let totalRows = 0;
    let allowedRows = 0;

    fs.createReadStream(foodPath)
      .pipe(csv({
        skipLines: 0,
        strict: false,
        mapHeaders: ({ header }) => header.trim(),
        mapValues: ({ value }) => value ? value.trim() : value
      }))
      .on('data', (row) => {
        totalRows++;
        
        const dataType = row.data_type;
        const fdcId = row.fdc_id;
        
        if (ALLOWED_TYPES.includes(dataType)) {
          allowedFoods.set(fdcId, {
            fdc_id: fdcId,
            name: row.description || 'Unknown',
            category: row.food_category_id || null,
            data_type: dataType,
            nutrients: {}
          });
          allowedRows++;
          
          // Log progress every 10k rows
          if (allowedRows % 10000 === 0) {
            console.log(`   📊 Found ${allowedRows.toLocaleString()} allowed foods (${totalRows.toLocaleString()} total processed)...`);
          }
        }
      })
      .on('end', () => {
        console.log(`   ✅ Processed ${totalRows.toLocaleString()} total foods`);
        console.log(`   ✅ Kept ${allowedRows.toLocaleString()} Foundation/SR Legacy foods`);
        console.log(`   ✅ Memory usage: ~${Math.round(allowedRows * 1024 / 1024)}MB`);
        resolve(allowedFoods);
      })
      .on('error', reject);
  });
}

/**
 * Step 2: Stream food_nutrient.csv and map nutrients
 * Processes 65M rows but only keeps ~50k (filters out 95%)
 */
async function mapNutrients(csvDir, allowedFoods) {
  console.log('\n🔬 STEP 2: Streaming food_nutrient.csv...');
  
  const nutrientPath = path.join(csvDir, 'food_nutrient.csv');
  
  if (!fs.existsSync(nutrientPath)) {
    throw new Error(`File not found: ${nutrientPath}`);
  }

  return new Promise((resolve, reject) => {
    let totalRows = 0;
    let matchedRows = 0;
    let skippedRows = 0;
    let lastLog = Date.now();

    fs.createReadStream(nutrientPath)
      .pipe(csv({
        skipLines: 0,
        strict: false,
        mapHeaders: ({ header }) => header.trim(),
        mapValues: ({ value }) => value ? value.trim() : value
      }))
      .on('data', (row) => {
        totalRows++;
        
        const fdcId = row.fdc_id;
        const nutrientId = row.nutrient_id;
        const amount = parseFloat(row.amount);

        // Debug specific known fdc_id
        if (fdcId === '167512' && totalRows <= 450000) {
          console.log(`   🎯 FOUND 167512 at row ${totalRows}! nutrient_id=${nutrientId}, in_map=${allowedFoods.has(fdcId)}`);
        }

        // Progress logging every 5 seconds
        if (Date.now() - lastLog > 5000) {
          console.log(`   📊 Processed ${totalRows.toLocaleString()} rows (${matchedRows.toLocaleString()} matched, ${skippedRows.toLocaleString()} skipped)...`);
          lastLog = Date.now();
        }

        // Check if this food is in our allowlist
        if (!allowedFoods.has(fdcId)) {
          skippedRows++;
          return; // Skip branded foods (95% of file)
        }

        // Check if this is a nutrient we care about
        const nutrientKey = NUTRIENT_MAP[nutrientId];
        if (!nutrientKey) {
          return; // Skip nutrients we don't track
        }

        // Map the nutrient value
        const food = allowedFoods.get(fdcId);
        food.nutrients[nutrientKey] = amount;
        matchedRows++;
      })
      .on('end', () => {
        console.log(`   ✅ Processed ${totalRows.toLocaleString()} total nutrient rows`);
        console.log(`   ✅ Matched ${matchedRows.toLocaleString()} nutrients for allowed foods`);
        console.log(`   ✅ Skipped ${skippedRows.toLocaleString()} branded food nutrients (${Math.round(skippedRows/totalRows*100)}%)`);
        resolve();
      })
      .on('error', reject);
  });
}

/**
 * Step 3: Stream food_portion.csv
 * Extract serving size data for allowed foods
 */
async function extractPortions(csvDir, allowedFoods) {
  console.log('\n📏 STEP 3: Streaming food_portion.csv...');
  
  const portionPath = path.join(csvDir, 'food_portion.csv');
  
  if (!fs.existsSync(portionPath)) {
    console.log('   ⚠️  food_portion.csv not found, skipping portions');
    return [];
  }

  const portionsToInsert = [];

  return new Promise((resolve, reject) => {
    let totalRows = 0;
    let matchedRows = 0;

    fs.createReadStream(portionPath)
      .pipe(csv({
        skipLines: 0,
        strict: false,
        mapHeaders: ({ header }) => header.trim(),
        mapValues: ({ value }) => value ? value.trim() : value
      }))
      .on('data', (row) => {
        totalRows++;
        
        const fdcId = row.fdc_id;

        // Only keep portions for allowed foods
        if (!allowedFoods.has(fdcId)) {
          return;
        }

        matchedRows++;
        portionsToInsert.push({
          food_id: parseInt(fdcId),
          measure_unit: row.measure_unit_id || null,
          gram_weight: parseFloat(row.gram_weight) || null,
          amount: parseFloat(row.amount) || 1,
          portion_description: row.portion_description || row.modifier || null
        });
      })
      .on('end', () => {
        console.log(`   ✅ Processed ${totalRows.toLocaleString()} total portions`);
        console.log(`   ✅ Kept ${matchedRows.toLocaleString()} portions for allowed foods`);
        resolve(portionsToInsert);
      })
      .on('error', reject);
  });
}

/**
 * Step 4: Bulk insert foods into Supabase
 */
async function insertFoods(allowedFoods) {
  console.log('\n💾 STEP 4: Inserting foods into Supabase...');
  
  const foodsArray = Array.from(allowedFoods.values()).map(food => ({
    fdc_id: parseInt(food.fdc_id), // USDA identifier
    name: food.name,
    category: food.category,
    data_type: food.data_type,
    // Flatten nutrients into columns
    calories: food.nutrients.calories || null,
    protein_g: food.nutrients.protein_g || null,
    fat_g: food.nutrients.fat_g || null,
    carbs_g: food.nutrients.carbs_g || null,
    fiber_g: food.nutrients.fiber_g || null,
    sugar_g: food.nutrients.sugar_g || null,
    sodium_mg: food.nutrients.sodium_mg || null,
    potassium_mg: food.nutrients.potassium_mg || null,
    calcium_mg: food.nutrients.calcium_mg || null,
    iron_mg: food.nutrients.iron_mg || null,
    magnesium_mg: food.nutrients.magnesium_mg || null,
    phosphorus_mg: food.nutrients.phosphorus_mg || null,
    zinc_mg: food.nutrients.zinc_mg || null,
    copper_mg: food.nutrients.copper_mg || null,
    manganese_mg: food.nutrients.manganese_mg || null,
    selenium_mcg: food.nutrients.selenium_mcg || null,
    vitamin_a_mcg: food.nutrients.vitamin_a_mcg || null,
    vitamin_c_mg: food.nutrients.vitamin_c_mg || null,
    thiamin_mg: food.nutrients.thiamin_mg || null,
    riboflavin_mg: food.nutrients.riboflavin_mg || null,
    niacin_mg: food.nutrients.niacin_mg || null,
    pantothenic_acid_mg: food.nutrients.pantothenic_acid_mg || null,
    vitamin_b6_mg: food.nutrients.vitamin_b6_mg || null,
    folate_mcg: food.nutrients.folate_mcg || null,
    vitamin_b12_mcg: food.nutrients.vitamin_b12_mcg || null,
    vitamin_e_mg: food.nutrients.vitamin_e_mg || null,
    vitamin_k_mcg: food.nutrients.vitamin_k_mcg || null,
    vitamin_d_mcg: food.nutrients.vitamin_d_mcg || null,
    saturated_fat_g: food.nutrients.saturated_fat_g || null,
    monounsaturated_fat_g: food.nutrients.monounsaturated_fat_g || null,
    polyunsaturated_fat_g: food.nutrients.polyunsaturated_fat_g || null,
    cholesterol_mg: food.nutrients.cholesterol_mg || null
  }));

  console.log(`   📦 Preparing to insert ${foodsArray.length.toLocaleString()} foods in batches of ${BATCH_SIZE}...`);

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < foodsArray.length; i += BATCH_SIZE) {
    const batch = foodsArray.slice(i, i + BATCH_SIZE);
    
    try {
      const { error } = await supabase
        .from('foods')
        .upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`   ❌ Batch ${Math.floor(i/BATCH_SIZE) + 1} failed:`, error.message);
        errors += batch.length;
      } else {
        inserted += batch.length;
        console.log(`   ✅ Inserted batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(foodsArray.length/BATCH_SIZE)} (${inserted.toLocaleString()} foods)`);
      }
    } catch (err) {
      console.error(`   ❌ Batch ${Math.floor(i/BATCH_SIZE) + 1} exception:`, err.message);
      errors += batch.length;
    }
  }

  console.log(`\n   ✅ Foods inserted: ${inserted.toLocaleString()}`);
  if (errors > 0) {
    console.log(`   ⚠️  Errors: ${errors.toLocaleString()}`);
  }
}

/**
 * Step 5: Bulk insert portions into Supabase
 */
async function insertPortions(portions) {
  if (portions.length === 0) {
    console.log('\n   ⏭️  No portions to insert');
    return;
  }

  console.log('\n💾 STEP 5: Inserting portions into Supabase...');
  
  // First, fetch the food UUID mappings from fdc_id
  console.log('   🔍 Fetching food UUID mappings...');
  const fdcIds = [...new Set(portions.map(p => p.food_id))];
  
  const { data: foods, error: fetchError } = await supabase
    .from('foods')
    .select('id, fdc_id')
    .in('fdc_id', fdcIds);
  
  if (fetchError) {
    console.error(`   ❌ Failed to fetch food mappings:`, fetchError.message);
    return;
  }
  
  // Create fdc_id -> UUID mapping
  const fdcToUuid = new Map();
  foods.forEach(food => {
    fdcToUuid.set(food.fdc_id, food.id);
  });
  
  console.log(`   ✅ Mapped ${fdcToUuid.size.toLocaleString()} foods to UUIDs`);
  
  // Transform portions to use UUID food_id
  const portionsWithUuid = portions
    .filter(p => fdcToUuid.has(p.food_id))
    .map(p => ({
      food_id: fdcToUuid.get(p.food_id),
      measure_unit: p.measure_unit,
      gram_weight: p.gram_weight,
      amount: p.amount,
      portion_description: p.portion_description
    }));
  
  console.log(`   📦 Preparing to insert ${portionsWithUuid.length.toLocaleString()} portions in batches of ${BATCH_SIZE}...`);

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < portionsWithUuid.length; i += BATCH_SIZE) {
    const batch = portionsWithUuid.slice(i, i + BATCH_SIZE);
    
    try {
      const { error } = await supabase
        .from('portions')
        .insert(batch);
      
      if (error) {
        console.error(`   ❌ Batch ${Math.floor(i/BATCH_SIZE) + 1} failed:`, error.message);
        errors += batch.length;
      } else {
        inserted += batch.length;
        console.log(`   ✅ Inserted batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(portionsWithUuid.length/BATCH_SIZE)} (${inserted.toLocaleString()} portions)`);
      }
    } catch (err) {
      console.error(`   ❌ Batch ${Math.floor(i/BATCH_SIZE) + 1} exception:`, err.message);
      errors += batch.length;
    }
  }

  console.log(`\n   ✅ Portions inserted: ${inserted.toLocaleString()}`);
  if (errors > 0) {
    console.log(`   ⚠️  Errors: ${errors.toLocaleString()}`);
  }
}

/**
 * Main execution
 */
async function main() {
  const csvDir = process.argv[2];

  if (!csvDir) {
    console.error('❌ Usage: node scripts/import_stream.js <csv_directory>');
    console.error('   Example: node scripts/import_stream.js ./FoodData_Central_csv_2025-04-24');
    process.exit(1);
  }

  if (!fs.existsSync(csvDir)) {
    console.error(`❌ Directory not found: ${csvDir}`);
    process.exit(1);
  }

  console.log('🚀 USDA Food Data Streaming Import');
  console.log('═══════════════════════════════════════');
  console.log(`📂 Source: ${csvDir}`);
  console.log(`🎯 Target: ${SUPABASE_URL}`);
  console.log(`🔍 Filter: ${ALLOWED_TYPES.join(', ')}`);

  const startTime = Date.now();

  try {
    // Step 1: Build allowlist (~50k foods, ~50MB RAM)
    const allowedFoods = await buildAllowedList(csvDir);

    // Step 2: Stream 65M nutrient rows, keep only ~50k
    await mapNutrients(csvDir, allowedFoods);

    // Step 3: Stream portions, filter by allowlist
    const portions = await extractPortions(csvDir, allowedFoods);

    // Step 4: Bulk insert foods
    await insertFoods(allowedFoods);

    // Step 5: Bulk insert portions
    await insertPortions(portions);

    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log('\n✅ Import Complete!');
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📊 Foods: ${allowedFoods.size.toLocaleString()}`);
    console.log(`📊 Portions: ${portions.length.toLocaleString()}`);

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
