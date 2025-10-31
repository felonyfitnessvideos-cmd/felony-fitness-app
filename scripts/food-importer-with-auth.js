/**
 * @file scripts/food-importer-with-auth.js
 * @description Authenticated bulk food importer using service role
 */

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// Use service role for database operations
const SUPABASE_URL = 'https://wkmrdelhoeqhsdifrarn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrfnJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTk0MjQ0MywiZXhwIjoyMDQ1NTE4NDQzfQ.x8Bi5sHVHfwIJo3o66QpL6_V2MdZYh9f8wKN9BXJR6k';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Essential foods for quick import
const ESSENTIAL_FOODS = [
  // High-protein foods
  { name: 'chicken breast', category: 'Protein', priority: 1 },
  { name: 'ground beef 85/15', category: 'Protein', priority: 1 },
  { name: 'salmon fillet', category: 'Protein', priority: 1 },
  { name: 'eggs large', category: 'Protein', priority: 1 },
  { name: 'greek yogurt plain', category: 'Dairy', priority: 1 },
  
  // Carbohydrates
  { name: 'brown rice cooked', category: 'Grains', priority: 1 },
  { name: 'sweet potato baked', category: 'Vegetables', priority: 1 },
  { name: 'oats rolled dry', category: 'Grains', priority: 1 },
  { name: 'quinoa cooked', category: 'Grains', priority: 1 },
  
  // Vegetables
  { name: 'broccoli raw', category: 'Vegetables', priority: 1 },
  { name: 'spinach raw', category: 'Vegetables', priority: 1 },
  { name: 'carrots raw', category: 'Vegetables', priority: 1 },
  
  // Fruits
  { name: 'banana raw', category: 'Fruits', priority: 1 },
  { name: 'apple raw with skin', category: 'Fruits', priority: 1 },
  { name: 'avocado raw', category: 'Fruits', priority: 1 },
  
  // Fats
  { name: 'olive oil extra virgin', category: 'Oils', priority: 1 },
  { name: 'almonds raw', category: 'Nuts', priority: 1 },
  { name: 'peanut butter natural', category: 'Nuts', priority: 1 }
];

class AuthenticatedFoodImporter {
  constructor() {
    this.imported = 0;
    this.failed = 0;
    this.existing = 0;
  }

  /**
   * Search USDA API directly and insert to database
   */
  async importFood(foodData) {
    const { name, category, priority } = foodData;
    
    try {
      console.log(`🔍 Searching: ${name}`);
      
      // Check if food already exists (exact case-insensitive match)
      const normalizedName = name.trim().toLowerCase();
      const { data: existingFood, error: checkError } = await supabase
        .from('foods')
        .select('id, name')
        .ilike('name', normalizedName)
        .limit(1);

      if (checkError) {
        console.log(`  ❌ Database check error: ${checkError.message}`);
        this.failed++;
        return;
      }

      if (existingFood && existingFood.length > 0) {
        console.log(`  ⚠️ Already exists: ${existingFood[0].name}`);
        this.existing++;
        return;
      }

      // Search USDA API directly
      const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(name)}&api_key=DEMO_KEY&pageSize=1`;
      const usdaResponse = await fetch(usdaUrl);
      
      if (!usdaResponse.ok) {
        console.log(`  ❌ USDA API error: ${usdaResponse.status}`);
        this.failed++;
        return;
      }

      const usdaData = await usdaResponse.json();
      
      if (!usdaData.foods || usdaData.foods.length === 0) {
        console.log(`  ⚠️ No USDA results for: ${name}`);
        this.failed++;
        return;
      }

      const food = usdaData.foods[0];
      
      // Transform to our database format
      const foodRecord = {
        name: food.description,
        brand: food.brandOwner || null,
        category: category,
        serving_size: 100, // Default to 100g
        serving_unit: 'g',
        calories: null,
        protein: null,
        carbs: null,
        fat: null,
        fiber: null,
        sugar: null,
        sodium: null,
        usda_fdc_id: food.fdcId,
        data_source: 'USDA',
        quality_score: 60, // Base score, will be improved by enrichment
        import_priority: priority,
        created_at: new Date().toISOString()
      };

      // Extract nutrition data if available
      if (food.foodNutrients) {
        food.foodNutrients.forEach(nutrient => {
          const value = nutrient.value;
          switch (nutrient.nutrientId) {
            case 1008: foodRecord.calories = value; break;    // Energy
            case 1003: foodRecord.protein = value; break;    // Protein
            case 1005: foodRecord.carbs = value; break;      // Carbs
            case 1004: foodRecord.fat = value; break;        // Fat
            case 1079: foodRecord.fiber = value; break;      // Fiber
            case 2000: foodRecord.sugar = value; break;      // Sugar
            case 1093: foodRecord.sodium = value; break;     // Sodium
          }
        });
      }

      // Calculate quality score based on available data
      let qualityScore = 40; // Base score
      if (foodRecord.calories) qualityScore += 15;
      if (foodRecord.protein) qualityScore += 15;
      if (foodRecord.carbs) qualityScore += 10;
      if (foodRecord.fat) qualityScore += 10;
      if (foodRecord.fiber) qualityScore += 5;
      if (foodRecord.sodium) qualityScore += 5;
      
      foodRecord.quality_score = Math.min(qualityScore, 100);

      // Insert into database
      const { error: insertError } = await supabase
        .from('foods')
        .insert([foodRecord])
        .select()
        .single();

      if (insertError) {
        console.log(`  ❌ Insert error: ${insertError.message}`);
        this.failed++;
        return;
      }

      this.imported++;
      console.log(`  ✅ Imported: ${foodRecord.name} (Quality: ${foodRecord.quality_score}%)`);

      // Add slight delay to be respectful to APIs
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.log(`  ❌ Error importing ${name}: ${error.message}`);
      this.failed++;
    }
  }

  /**
   * Run the import process
   */
  async runImport() {
    console.log('🚀 Starting Authenticated Food Import');
    console.log(`📊 Importing ${ESSENTIAL_FOODS.length} essential foods\n`);

    const startTime = Date.now();

    for (let i = 0; i < ESSENTIAL_FOODS.length; i++) {
      const food = ESSENTIAL_FOODS[i];
      console.log(`\n${i + 1}/${ESSENTIAL_FOODS.length}`);
      await this.importFood(food);
    }

    const duration = (Date.now() - startTime) / 1000;

    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 IMPORT SUMMARY');
    console.log(`${'='.repeat(50)}`);
    console.log(`⏱️  Duration: ${Math.floor(duration)}s`);
    console.log(`✅ Successfully imported: ${this.imported} foods`);
    console.log(`⚠️  Already existed: ${this.existing} foods`);
    console.log(`❌ Failed imports: ${this.failed} foods`);
    console.log(`📈 Success rate: ${((this.imported / ESSENTIAL_FOODS.length) * 100).toFixed(1)}%`);
    
    console.log(`\n🎯 NEXT STEPS:`);
    console.log(`1. Check your database for ${this.imported} new foods`);
    console.log(`2. Foods will be automatically enriched by the pipeline`);
    console.log(`3. Test search in your app: enhancedNutritionAPI.searchFood('chicken')`);
    
    if (this.imported > 0) {
      console.log(`\n🎉 Database successfully seeded with ${this.imported} essential foods!`);
    }
  }
}

// Run the import
const importer = new AuthenticatedFoodImporter();
importer.runImport()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
  });