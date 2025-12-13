/**
 * STEP 2: Match database foods with USDA data and extract nutrients
 * Input: foods_rows.csv (from database export)
 * Output: step2-enrichment-data.csv (foods with nutrient data to import)
 */

import fs from 'fs';
import { parse } from 'csv-parse';

const DB_FOODS_CSV = process.argv[2] || 'C:\\Users\\david\\Downloads\\foods_rows.csv';
const USDA_FOLDER = process.argv[3] || 'C:\\Users\\david\\Desktop\\Projects\\Felony Fitness\\FoodData_Central_csv_2025-04-24';

console.log('\n🔍 STEP 2: Match Foods with USDA Data');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`Input: ${DB_FOODS_CSV}`);
console.log(`USDA Data: ${USDA_FOLDER}\n`);

// Nutrients we need to extract (using correct USDA nutrient IDs)
const NUTRIENT_MAP = {
  1090: 'magnesium_mg',   // Magnesium, Mg
  1095: 'zinc_mg',        // Zinc, Zn
  1114: 'vitamin_d_mcg',  // Vitamin D (D2 + D3)
  1178: 'vitamin_b12_mcg', // Vitamin B-12
  1162: 'vitamin_c_mg',   // Vitamin C, total ascorbic acid
  1089: 'iron_mg',        // Iron, Fe
};

async function matchFoods() {
  // Step 2a: Load database foods
  console.log('📥 Step 2a: Loading database foods...');
  const dbFoods = [];
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(DB_FOODS_CSV)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        dbFoods.push({
          id: parseInt(row.id),
          name: row.name,
        });
        
        if (dbFoods.length % 1000 === 0) {
          process.stdout.write(`\r   Loaded ${dbFoods.length} foods...`);
        }
      })
      .on('end', () => {
        console.log(`\r   ✅ Loaded ${dbFoods.length} foods from database\n`);
        resolve();
      })
      .on('error', reject);
  });
  
  const dbFoodIds = new Set(dbFoods.map(f => f.id));
  
  // Step 2b: Scan USDA food.csv to find matches
  console.log('📥 Step 2b: Scanning USDA food.csv for matches...');
  const matchedFoodIds = new Set();
  let scannedCount = 0;
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(`${USDA_FOLDER}/food.csv`)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        scannedCount++;
        const fdcId = parseInt(row.fdc_id);
        
        if (dbFoodIds.has(fdcId)) {
          matchedFoodIds.add(fdcId);
        }
        
        if (scannedCount % 100000 === 0) {
          process.stdout.write(`\r   Scanned ${scannedCount.toLocaleString()} USDA foods, found ${matchedFoodIds.size} matches...`);
        }
      })
      .on('end', () => {
        console.log(`\r   ✅ Scanned ${scannedCount.toLocaleString()} USDA foods`);
        console.log(`   ✅ Found ${matchedFoodIds.size} matches in our database\n`);
        resolve();
      })
      .on('error', reject);
  });
  
  if (matchedFoodIds.size === 0) {
    console.log('⚠️  No ID matches found. Database uses different IDs than USDA fdc_id.');
    console.log('   You may need to add fdc_id column to foods table first.\n');
    process.exit(0);
  }
  
  // Step 2c: Extract nutrients for matched foods
  console.log('📥 Step 2c: Extracting nutrients for matched foods...');
  console.log(`   Target nutrients: ${Object.values(NUTRIENT_MAP).join(', ')}\n`);
  
  const foodNutrients = new Map(); // fdc_id -> { nutrient_column -> value }
  let scannedNutrients = 0;
  let relevantNutrients = 0;
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(`${USDA_FOLDER}/food_nutrient.csv`)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => {
        scannedNutrients++;
        
        const fdcId = parseInt(row.fdc_id);
        const nutrientId = parseInt(row.nutrient_id);
        const amount = parseFloat(row.amount) || 0;
        
        // Only process matched foods and target nutrients
        if (matchedFoodIds.has(fdcId) && NUTRIENT_MAP[nutrientId]) {
          if (!foodNutrients.has(fdcId)) {
            foodNutrients.set(fdcId, { id: fdcId });
          }
          
          const column = NUTRIENT_MAP[nutrientId];
          foodNutrients.get(fdcId)[column] = amount;
          relevantNutrients++;
        }
        
        if (scannedNutrients % 1000000 === 0) {
          process.stdout.write(`\r   Scanned ${(scannedNutrients / 1000000).toFixed(1)}M nutrient records, extracted ${relevantNutrients.toLocaleString()} relevant values...`);
        }
      })
      .on('end', () => {
        console.log(`\r   ✅ Scanned ${scannedNutrients.toLocaleString()} nutrient records`);
        console.log(`   ✅ Extracted ${relevantNutrients.toLocaleString()} relevant nutrient values`);
        console.log(`   ✅ Foods with nutrient data: ${foodNutrients.size}\n`);
        resolve();
      })
      .on('error', reject);
  });
  
  // Step 2d: Create enrichment CSV
  console.log('💾 Step 2d: Creating enrichment CSV...');
  
  const outputRows = [];
  for (const [_fdcId, nutrients] of foodNutrients.entries()) {
    outputRows.push(nutrients);
  }
  
  // Build CSV
  const headers = ['id', ...Object.values(NUTRIENT_MAP)];
  const csvLines = [
    headers.join(','),
    ...outputRows.map(row => 
      headers.map(h => row[h] !== undefined ? row[h] : '0').join(',')
    )
  ];
  
  const outputPath = 'scripts/step2-enrichment-data.csv';
  fs.writeFileSync(outputPath, csvLines.join('\n'), 'utf8');
  
  console.log(`✅ Created: ${outputPath}`);
  console.log(`   Records: ${outputRows.length}\n`);
  
  // Summary statistics
  console.log('📊 Nutrient Coverage Summary:');
  for (const [_nutrientId, column] of Object.entries(NUTRIENT_MAP)) {
    const withData = outputRows.filter(r => r[column] > 0).length;
    const pct = ((withData / outputRows.length) * 100).toFixed(1);
    console.log(`   ${column.padEnd(20)}: ${withData.toString().padStart(4)}/${outputRows.length} (${pct}%)`);
  }
  
  console.log('\n✅ STEP 2 COMPLETE!\n');
  console.log('Next: Run step 3 to import enrichment data into database');
  console.log('   node scripts/step3-import-enrichment.js\n');
}

matchFoods().catch(console.error);
