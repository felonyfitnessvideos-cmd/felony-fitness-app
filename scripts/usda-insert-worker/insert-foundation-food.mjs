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
		`&dataType=Foundation&pageSize=200`;
	console.log(`[DEBUG] Fetching Foundation foods from URL: ${url}`);
	const res = await fetch(url);
	if (!res.ok) {
		const text = await res.text();
		console.error(`[ERROR] Failed to fetch Foundation foods list. Status: ${res.status} ${res.statusText}`);
		console.error(`[ERROR] Response body: ${text}`);
		throw new Error('Failed to fetch Foundation foods list');
	}
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
	// Check for existing fdc_id
	const { data: existing, error: checkError } = await supabase
		.from('food_servings')
		.select('id')
		.eq('fdc_id', food.fdcId)
		.limit(1);
	if (checkError) {
		console.error('[ERROR] Failed to check for existing fdc_id:', checkError);
		throw checkError;
	}
	if (existing && existing.length > 0) {
		console.log(`[INFO] Skipping insert: fdc_id ${food.fdcId} already exists in food_servings.`);
		return;
	}

	const serving = {
		fdc_id: food.fdcId, // manually added column
		food_name: food.description,
		serving_description: null, // USDA API may not provide this directly
		calories: null, // will need to extract from food.foodNutrients
		protein_g: null,
		carbs_g: null,
		fat_g: null,
		fiber_g: null,
		sugar_g: null,
		sodium_mg: null,
		calcium_mg: null,
		iron_mg: null,
		vitamin_c_mg: null,
		potassium_mg: null,
		vitamin_a_mcg: null,
		vitamin_e_mg: null,
		vitamin_k_mcg: null,
		thiamin_mg: null,
		riboflavin_mg: null,
		niacin_mg: null,
		vitamin_b6_mg: null,
		folate_mcg: null,
		vitamin_b12_mcg: null,
		magnesium_mg: null,
		phosphorus_mg: null,
		zinc_mg: null,
		copper_mg: null,
		selenium_mcg: null,
		brand: food.brandOwner || null,
		category: food.foodCategory || null,
		data_sources: 'usda_foundation',
		enrichment_status: 'complete',
		quality_score: 100,
		is_verified: true,
		source: 'usda_foundation',
		// Add other fields as needed
	};
	// Map nutrients from food.foodNutrients array to columns
	if (Array.isArray(food.foodNutrients)) {
		for (const n of food.foodNutrients) {
			switch (n.nutrientName) {
				case 'Energy':
					serving.calories = n.value;
					break;
				case 'Protein':
					serving.protein_g = n.value;
					break;
				case 'Carbohydrate, by difference':
					serving.carbs_g = n.value;
					break;
				case 'Total lipid (fat)':
					serving.fat_g = n.value;
					break;
				case 'Fiber, total dietary':
					serving.fiber_g = n.value;
					break;
				case 'Sugars, total including NLEA':
					serving.sugar_g = n.value;
					break;
				case 'Sodium, Na':
					serving.sodium_mg = n.value;
					break;
				case 'Calcium, Ca':
					serving.calcium_mg = n.value;
					break;
				case 'Iron, Fe':
					serving.iron_mg = n.value;
					break;
				case 'Vitamin C, total ascorbic acid':
					serving.vitamin_c_mg = n.value;
					break;
				case 'Potassium, K':
					serving.potassium_mg = n.value;
					break;
				case 'Vitamin A, RAE':
					serving.vitamin_a_mcg = n.value;
					break;
				case 'Vitamin E (alpha-tocopherol)':
					serving.vitamin_e_mg = n.value;
				case 'Vitamin K (phylloquinone)':
					serving.vitamin_k_mcg = n.value;
					break;
				case 'Thiamin':
					serving.thiamin_mg = n.value;
					break;
				case 'Riboflavin':
					serving.riboflavin_mg = n.value;
					break;
				case 'Niacin':
					serving.niacin_mg = n.value;
					break;
				case 'Vitamin B-6':
					serving.vitamin_b6_mg = n.value;
					break;
				case 'Folate, total':
					serving.folate_mcg = n.value;
					break;
				case 'Vitamin B-12':
					serving.vitamin_b12_mcg = n.value;
					break;
				case 'Magnesium, Mg':
					serving.magnesium_mg = n.value;
					break;
				case 'Phosphorus, P':
					serving.phosphorus_mg = n.value;
					break;
				case 'Zinc, Zn':
					serving.zinc_mg = n.value;
					break;
				case 'Copper, Cu':
					serving.copper_mg = n.value;
					break;
				case 'Selenium, Se':
					serving.selenium_mcg = n.value;
					break;
			}
		}
	}
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
