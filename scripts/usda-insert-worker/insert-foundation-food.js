// scripts/usda-insert-worker/insert-foundation-food.mjs
// Automated worker to insert next missing USDA Foundation Food into the database
// Requires: USDA_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in env

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const USDA_API_KEY = process.env.USDA_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!USDA_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Get list of Foundation Food IDs (static or via API)
async function getFoundationFoodIds() {
  // USDA Foundation Foods: dataType = "Foundation"
  const url = `https://api.nal.usda.gov/fdc/v1/foods/list?api_key=${USDA_API_KEY}` +
    `&dataType=Foundation&pageSize=2000`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch Foundation foods list');
  const foods = await res.json();
  console.log(`[DEBUG] Fetched ${foods.length} Foundation foods from USDA API.`);
  return foods.map(f => f.fdcId);
}

// Get FDC IDs already in DB
async function getExistingFdcIds() {
  const { data, error } = await supabase
    .from('food_servings')
    .select('fdc_id');
  if (error) throw error;
  console.log(`[DEBUG] Found ${data.length} existing FDC IDs in food_servings table.`);
  return new Set(data.map(row => row.fdc_id));
}

// Fetch full food details from USDA
async function fetchFoodDetails(fdcId) {
  const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${USDA_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch food details for FDC ID ${fdcId}`);
  return res.json();
}

// Insert food into Supabase
async function insertFood(food) {
  // Map USDA food object to your DB schema
  const serving = {
    fdc_id: food.fdcId,
    description: food.description,
    data_type: food.dataType,
    brand_owner: food.brandOwner || null,
    food_category: food.foodCategory || null,
    nutrients: food.foodNutrients,
    enrichment_status: 'complete',
    needs_review: false,
    review_flags: ['foundation_import'],
    // Add other fields as needed
  };
  console.log('[DEBUG] Attempting to insert food_serving:', JSON.stringify(serving, null, 2));
  const { error, data } = await supabase.from('food_servings').insert([serving]).select();
  if (error) {
    console.error('[ERROR] Supabase insert error:', error);
    throw error;
  }
  console.log('[DEBUG] Insert result:', data);
}

// Main runner
const main = async () => {
  try {
    const allFdcIds = await getFoundationFoodIds();
    const existingFdcIds = await getExistingFdcIds();
    const missingFdcIds = allFdcIds.filter(id => !existingFdcIds.has(id));
    if (missingFdcIds.length === 0) {
      console.log('[INFO] All Foundation foods already imported.');
      return;
    }
    console.log(`[INFO] ${missingFdcIds.length} Foundation foods missing from DB. Next FDC ID: ${missingFdcIds[0]}`);
    const nextFdcId = missingFdcIds[0];
    const food = await fetchFoodDetails(nextFdcId);
    console.log('[DEBUG] USDA food object:', JSON.stringify(food, null, 2));
    await insertFood(food);
    console.log(`[SUCCESS] Successfully inserted FDC ID: ${nextFdcId}`);
  } catch (err) {
    console.error('Worker error:', err);
    process.exit(1);
  }
};

main();
