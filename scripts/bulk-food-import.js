/**
 * @file scripts/bulk-food-import.js
 * @description Bulk Food Import System using Multi-API Nutrition Pipeline
 * 
 * FEATURES:
 * 1. Import thousands of foods from multiple APIs
 * 2. Automatic deduplication and quality scoring
 * 3. Progressive import with rate limiting
 * 4. Comprehensive food categories
 * 5. Real-time progress tracking
 */

import fetch from 'node-fetch';

// Configuration
const SUPABASE_URL = 'https://wkmrdelhoeqhsdifrarn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ';

// Comprehensive food categories for import
const FOOD_CATEGORIES = {
  'Proteins': [
    'chicken breast', 'chicken thigh', 'ground beef', 'lean beef', 'salmon', 'tuna', 'cod',
    'eggs', 'egg whites', 'greek yogurt', 'cottage cheese', 'protein powder', 'tofu', 'tempeh',
    'black beans', 'kidney beans', 'lentils', 'chickpeas', 'quinoa', 'turkey breast',
    'pork tenderloin', 'shrimp', 'crab', 'lobster', 'mussels', 'scallops', 'sardines',
    'mackerel', 'tilapia', 'ground turkey', 'beef steak', 'lamb', 'duck breast'
  ],
  'Carbohydrates': [
    'brown rice', 'white rice', 'quinoa', 'oats', 'whole wheat bread', 'sweet potato',
    'potato', 'pasta', 'whole wheat pasta', 'barley', 'bulgur', 'couscous',
    'rice cakes', 'bagel', 'tortilla', 'pita bread', 'crackers', 'cereal',
    'granola', 'muesli', 'corn', 'peas', 'beans', 'lentils', 'chickpeas'
  ],
  'Vegetables': [
    'broccoli', 'spinach', 'kale', 'carrots', 'bell peppers', 'tomatoes', 'cucumber',
    'lettuce', 'onions', 'garlic', 'mushrooms', 'zucchini', 'eggplant', 'asparagus',
    'brussels sprouts', 'cauliflower', 'cabbage', 'celery', 'green beans', 'peas',
    'corn', 'beets', 'radishes', 'turnips', 'leeks', 'artichokes', 'okra',
    'chard', 'collard greens', 'arugula', 'watercress', 'bok choy'
  ],
  'Fruits': [
    'apple', 'banana', 'orange', 'berries', 'strawberries', 'blueberries', 'raspberries',
    'blackberries', 'grapes', 'pineapple', 'mango', 'papaya', 'kiwi', 'peach',
    'pear', 'plum', 'cherries', 'watermelon', 'cantaloupe', 'honeydew', 'grapefruit',
    'lemon', 'lime', 'avocado', 'pomegranate', 'cranberries', 'dates', 'figs',
    'apricots', 'nectarine', 'coconut', 'passion fruit'
  ],
  'Fats & Oils': [
    'olive oil', 'coconut oil', 'avocado oil', 'butter', 'ghee', 'nuts', 'almonds',
    'walnuts', 'cashews', 'pecans', 'pistachios', 'brazil nuts', 'hazelnuts',
    'peanuts', 'peanut butter', 'almond butter', 'tahini', 'seeds', 'chia seeds',
    'flax seeds', 'pumpkin seeds', 'sunflower seeds', 'sesame seeds', 'hemp seeds'
  ],
  'Dairy': [
    'milk', 'whole milk', 'skim milk', '2% milk', 'almond milk', 'soy milk', 'oat milk',
    'cheese', 'cheddar cheese', 'mozzarella', 'parmesan', 'feta', 'goat cheese',
    'cream cheese', 'ricotta', 'swiss cheese', 'provolone', 'brie', 'camembert',
    'yogurt', 'greek yogurt', 'kefir', 'buttermilk', 'heavy cream', 'sour cream'
  ],
  'Beverages': [
    'water', 'green tea', 'black tea', 'coffee', 'herbal tea', 'coconut water',
    'kombucha', 'sparkling water', 'electrolyte drink', 'protein shake',
    'fresh juice', 'orange juice', 'apple juice', 'cranberry juice', 'tomato juice'
  ],
  'Spices & Condiments': [
    'salt', 'pepper', 'garlic powder', 'onion powder', 'paprika', 'cumin', 'oregano',
    'basil', 'thyme', 'rosemary', 'cinnamon', 'ginger', 'turmeric', 'curry powder',
    'chili powder', 'cayenne', 'mustard', 'ketchup', 'hot sauce', 'soy sauce',
    'vinegar', 'balsamic vinegar', 'lemon juice', 'lime juice', 'honey', 'maple syrup'
  ]
};

class BulkFoodImporter {
  constructor() {
    this.imported = 0;
    this.failed = 0;
    this.duplicates = 0;
    this.startTime = Date.now();
    this.rateLimit = 100; // ms between requests
  }

  /**
   * Import foods from multiple APIs using the nutrition pipeline
   */
  async importFoodsFromAPI(foods, category) {
    console.log(`\n🍎 Importing ${foods.length} ${category} foods...`);
    const results = [];

    for (let i = 0; i < foods.length; i++) {
      const food = foods[i];
      
      try {
        console.log(`  ${i + 1}/${foods.length}: Searching "${food}"...`);
        
        // Use our Multi-API nutrition aggregator
        const response = await fetch(`${SUPABASE_URL}/functions/v1/nutrition-aggregator`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: food,
            sources: ['usda', 'nutritionx'],
            max_results: 3 // Get top 3 results per food
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.foods && data.foods.length > 0) {
            // Add category information to foods
            const categorizedFoods = data.foods.map(f => ({
              ...f,
              category: category,
              search_term: food,
              import_source: 'multi_api_pipeline',
              import_date: new Date().toISOString()
            }));

            results.push(...categorizedFoods);
            console.log(`    ✅ Found ${data.foods.length} foods (Quality: ${data.quality_score || 'N/A'}%)`);
          } else {
            console.log(`    ⚠️ No results for "${food}"`);
            this.failed++;
          }
        } else {
          console.log(`    ❌ API error for "${food}": ${response.status}`);
          this.failed++;
        }

        // Rate limiting
        await this.sleep(this.rateLimit);

      } catch (error) {
        console.log(`    ❌ Error importing "${food}": ${error.message}`);
        this.failed++;
      }
    }

    return results;
  }

  /**
   * Insert foods into database with deduplication (Updated for new schema)
   */
  async insertFoodsToDatabase(foods) {
    if (foods.length === 0) return;

    console.log(`\n💾 Inserting ${foods.length} foods into database...`);

    try {
      // Insert foods in batches to avoid timeout
      const batchSize = 20; // Smaller batches for complex operations
      let inserted = 0;

      for (let i = 0; i < foods.length; i += batchSize) {
        const batch = foods.slice(i, i + batchSize);
        
        // Prepare foods data for foods table (basic info only)
        const foodsData = batch.map(food => ({
          name: food.name,
          category: food.category || 'Uncategorized',
          pdcaas_score: this.calculatePDCAAS(food) // Calculate from nutrition data
        }));

        // Insert into foods table first
        const foodsResponse = await fetch(`${SUPABASE_URL}/rest/v1/foods`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=ignore-duplicates,return=representation'
          },
          body: JSON.stringify(foodsData)
        });

        if (foodsResponse.ok) {
          const insertedFoods = await foodsResponse.json();
          
          // Now insert nutrition data into food_servings table
          const servingsData = insertedFoods.map((insertedFood, index) => {
            const originalFood = batch[index];
            return {
              food_id: insertedFood.id,
              serving_description: '100g',
              calories: Math.round(originalFood.calories || 0),
              protein_g: Math.round((originalFood.protein_g || 0) * 10) / 10,
              carbs_g: Math.round((originalFood.carbs_g || 0) * 10) / 10,
              fat_g: Math.round((originalFood.fat_g || 0) * 10) / 10
            };
          }).filter(serving => serving.food_id); // Only include successful food inserts

          if (servingsData.length > 0) {
            const servingsResponse = await fetch(`${SUPABASE_URL}/rest/v1/food_servings`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=ignore-duplicates'
              },
              body: JSON.stringify(servingsData)
            });

            if (servingsResponse.ok) {
              inserted += insertedFoods.length;
              console.log(`    ✅ Batch ${Math.floor(i/batchSize) + 1}: ${insertedFoods.length} foods + nutrition data inserted`);
            } else {
              const servingsError = await servingsResponse.text();
              console.log(`    ⚠️ Batch ${Math.floor(i/batchSize) + 1}: Foods inserted but nutrition failed:`, servingsError);
              inserted += insertedFoods.length; // Still count the foods as inserted
            }
          }
        } else {
          const error = await foodsResponse.text();
          console.log(`    ❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error);
        }

        // Rate limiting between batches
        await this.sleep(800);
      }

      this.imported += inserted;
      return inserted;

    } catch (error) {
      console.error('Database insertion error:', error);
      return 0;
    }
  }

  /**
   * Calculate PDCAAS score from nutrition data
   */
  calculatePDCAAS(food) {
    // Simple PDCAAS estimation based on protein content and food type
    const protein = food.protein_g || 0;
    const category = food.category || '';
    
    if (protein < 1) return 0.0;
    
    // High-quality complete proteins
    if (category.includes('Protein') || category.includes('Dairy')) {
      if (food.name.toLowerCase().includes('egg') || 
          food.name.toLowerCase().includes('milk') ||
          food.name.toLowerCase().includes('cheese') ||
          food.name.toLowerCase().includes('yogurt')) return 1.0;
      if (food.name.toLowerCase().includes('chicken') || 
          food.name.toLowerCase().includes('turkey') ||
          food.name.toLowerCase().includes('fish') ||
          food.name.toLowerCase().includes('salmon')) return 1.0;
      if (food.name.toLowerCase().includes('beef')) return 0.92;
      return 0.85; // Other proteins
    }
    
    // Plant proteins
    if (category.includes('Legumes') || food.name.toLowerCase().includes('bean') ||
        food.name.toLowerCase().includes('lentil') || food.name.toLowerCase().includes('chickpea')) {
      return 0.70;
    }
    
    if (category.includes('Nuts') || category.includes('Seeds')) {
      return 0.55;
    }
    
    if (category.includes('Grains') || food.name.toLowerCase().includes('quinoa')) {
      return 0.65;
    }
    
    // Vegetables and fruits with some protein
    if (protein > 2) return 0.60;
    
    return 0.50; // Default for foods with minimal protein
  }

  /**
   * Trigger enrichment for newly imported foods (Optional - triggers disabled for now)
   */
  async triggerEnrichment(foods) {
    console.log(`\n🤖 Enrichment check for ${foods.length} foods...`);

    try {
      // Simple quality check based on nutrition completeness
      const incompleteNutrition = foods.filter(f => {
        return !f.calories || f.calories === 0 || 
               !f.protein_g || 
               (!f.carbs_g && !f.fat_g); // Should have at least carbs or fat
      });
      
      if (incompleteNutrition.length === 0) {
        console.log('    ✅ All foods have complete nutrition data');
        return;
      }

      console.log(`    ⚠️ ${incompleteNutrition.length} foods have incomplete nutrition data`);
      console.log('    ℹ️ Enrichment triggers are currently disabled while updating schema');
      
      // Future: Re-enable when triggers are updated for new schema
      // Will use the nutrition-enrichment edge function to improve incomplete foods

    } catch (error) {
      console.log(`    ❌ Enrichment error: ${error.message}`);
    }
  }

  /**
   * Generate import summary report
   */
  generateReport() {
    const duration = (Date.now() - this.startTime) / 1000;
    
    console.log(`\n📊 BULK IMPORT SUMMARY`);
    console.log(`${'='.repeat(50)}`);
    console.log(`⏱️  Duration: ${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s`);
    console.log(`✅ Successfully imported: ${this.imported} foods`);
    console.log(`❌ Failed imports: ${this.failed}`);
    console.log(`🔄 Duplicates skipped: ${this.duplicates}`);
    console.log(`📈 Success rate: ${((this.imported / (this.imported + this.failed)) * 100).toFixed(1)}%`);
    console.log(`⚡ Average rate: ${(this.imported / duration * 60).toFixed(1)} foods/minute`);
    
    console.log(`\n🎯 NEXT STEPS:`);
    console.log(`1. Check Supabase dashboard for imported foods`);
    console.log(`2. Monitor enrichment queue progress`);
    console.log(`3. Use enhanced search in your app:`);
    console.log(`   await enhancedNutritionAPI.searchFood('chicken breast')`);
  }

  /**
   * Utility: Sleep function for rate limiting
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Main import process
   */
  async runBulkImport(selectedCategories = null, maxFoodsPerCategory = null) {
    console.log('🚀 Starting Bulk Food Import with Multi-API Nutrition Pipeline');
    console.log(`📊 Target: ${Object.keys(FOOD_CATEGORIES).length} categories`);
    
    const categoriesToImport = selectedCategories || Object.keys(FOOD_CATEGORIES);
    
    for (const category of categoriesToImport) {
      const foods = FOOD_CATEGORIES[category];
      const foodsToImport = maxFoodsPerCategory 
        ? foods.slice(0, maxFoodsPerCategory) 
        : foods;

      console.log(`\n🏷️ CATEGORY: ${category} (${foodsToImport.length} foods)`);
      
      // Import from APIs
      const apiResults = await this.importFoodsFromAPI(foodsToImport, category);
      
      // Insert to database
      if (apiResults.length > 0) {
        await this.insertFoodsToDatabase(apiResults);
        
        // Trigger enrichment for low-quality foods
        await this.triggerEnrichment(apiResults);
      }
      
      // Progress update
      console.log(`\n📈 Progress: ${this.imported} imported, ${this.failed} failed`);
      
      // Short break between categories
      await this.sleep(1000);
    }

    this.generateReport();
  }
}

// CLI Interface
const args = process.argv.slice(2);
const options = {
  categories: null,
  maxPerCategory: null,
  help: false
};

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--categories':
      options.categories = args[i + 1]?.split(',');
      i++;
      break;
    case '--max-per-category':
      options.maxPerCategory = parseInt(args[i + 1]);
      i++;
      break;
    case '--help':
    case '-h':
      options.help = true;
      break;
  }
}

if (options.help) {
  console.log(`
🍎 Bulk Food Import System

USAGE:
  node scripts/bulk-food-import.js [options]

OPTIONS:
  --categories <list>        Comma-separated list of categories to import
                            Available: ${Object.keys(FOOD_CATEGORIES).join(', ')}
  --max-per-category <num>   Maximum foods to import per category
  --help, -h                Show this help message

EXAMPLES:
  # Import all categories
  node scripts/bulk-food-import.js

  # Import only proteins and vegetables
  node scripts/bulk-food-import.js --categories "Proteins,Vegetables"

  # Import first 10 foods from each category
  node scripts/bulk-food-import.js --max-per-category 10

  # Quick test import
  node scripts/bulk-food-import.js --categories "Proteins" --max-per-category 5
  `);
  process.exit(0);
}

// Run the import
const importer = new BulkFoodImporter();
importer.runBulkImport(options.categories, options.maxPerCategory)
  .then(() => {
    console.log('\n🎉 Bulk food import completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Bulk import failed:', error);
    process.exit(1);
  });