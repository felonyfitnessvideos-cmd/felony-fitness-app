/**
 * @file scripts/direct-food-batch.js
 * @description Add more foods directly to database without API dependency
 */

import fetch from 'node-fetch';

const SUPABASE_URL = 'https://wkmrdelhoeqhsdifrarn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ';

// More comprehensive food database with nutrition data
const ADDITIONAL_FOODS = [
  // More Proteins
  { name: 'Chicken Thigh, Skinless', category: 'Protein', pdcaas: 1.0, calories: 209, protein: 26.0, carbs: 0, fat: 10.9 },
  { name: 'Ground Turkey, 93% Lean', category: 'Protein', pdcaas: 1.0, calories: 120, protein: 26.0, carbs: 0, fat: 2.0 },
  { name: 'Cod, Atlantic', category: 'Protein', pdcaas: 1.0, calories: 82, protein: 18.0, carbs: 0, fat: 0.7 },
  { name: 'Tuna, Yellowfin', category: 'Protein', pdcaas: 1.0, calories: 109, protein: 25.0, carbs: 0, fat: 0.5 },
  { name: 'Shrimp, Cooked', category: 'Protein', pdcaas: 1.0, calories: 99, protein: 24.0, carbs: 0.2, fat: 0.3 },
  { name: 'Lean Ground Beef, 90%', category: 'Protein', pdcaas: 0.92, calories: 176, protein: 26.0, carbs: 0, fat: 8.0 },
  { name: 'Pork Tenderloin', category: 'Protein', pdcaas: 0.90, calories: 147, protein: 26.0, carbs: 0, fat: 4.0 },
  { name: 'Egg Whites', category: 'Protein', pdcaas: 1.0, calories: 52, protein: 11.0, carbs: 0.7, fat: 0.2 },
  
  // More Vegetables
  { name: 'Kale, Raw', category: 'Vegetables', pdcaas: 0.65, calories: 35, protein: 2.9, carbs: 7.3, fat: 0.4 },
  { name: 'Brussels Sprouts', category: 'Vegetables', pdcaas: 0.60, calories: 43, protein: 3.4, carbs: 8.9, fat: 0.3 },
  { name: 'Asparagus', category: 'Vegetables', pdcaas: 0.55, calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1 },
  { name: 'Cauliflower', category: 'Vegetables', pdcaas: 0.52, calories: 25, protein: 1.9, carbs: 5.0, fat: 0.3 },
  { name: 'Zucchini', category: 'Vegetables', pdcaas: 0.48, calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  { name: 'Green Beans', category: 'Vegetables', pdcaas: 0.50, calories: 31, protein: 1.8, carbs: 7.0, fat: 0.2 },
  { name: 'Mushrooms, White', category: 'Vegetables', pdcaas: 0.45, calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
  { name: 'Celery', category: 'Vegetables', pdcaas: 0.40, calories: 16, protein: 0.7, carbs: 3.0, fat: 0.2 },
  
  // More Fruits
  { name: 'Berries, Mixed', category: 'Fruits', pdcaas: 0.45, calories: 57, protein: 0.7, carbs: 14.0, fat: 0.3 },
  { name: 'Pineapple, Fresh', category: 'Fruits', pdcaas: 0.42, calories: 50, protein: 0.5, carbs: 13.0, fat: 0.1 },
  { name: 'Mango, Fresh', category: 'Fruits', pdcaas: 0.48, calories: 60, protein: 0.8, carbs: 15.0, fat: 0.4 },
  { name: 'Kiwi Fruit', category: 'Fruits', pdcaas: 0.50, calories: 61, protein: 1.1, carbs: 15.0, fat: 0.5 },
  { name: 'Peach, Fresh', category: 'Fruits', pdcaas: 0.45, calories: 39, protein: 0.9, carbs: 9.5, fat: 0.3 },
  { name: 'Pear, Fresh', category: 'Fruits', pdcaas: 0.42, calories: 57, protein: 0.4, carbs: 15.0, fat: 0.1 },
  { name: 'Cherries, Sweet', category: 'Fruits', pdcaas: 0.48, calories: 63, protein: 1.1, carbs: 16.0, fat: 0.2 },
  { name: 'Watermelon', category: 'Fruits', pdcaas: 0.40, calories: 30, protein: 0.6, carbs: 8.0, fat: 0.2 },
  
  // More Grains & Carbs
  { name: 'Wild Rice, Cooked', category: 'Grains', pdcaas: 0.65, calories: 101, protein: 4.0, carbs: 21.0, fat: 0.3 },
  { name: 'Barley, Cooked', category: 'Grains', pdcaas: 0.60, calories: 123, protein: 2.3, carbs: 28.0, fat: 0.4 },
  { name: 'Bulgur Wheat, Cooked', category: 'Grains', pdcaas: 0.58, calories: 83, protein: 3.1, carbs: 19.0, fat: 0.2 },
  { name: 'Millet, Cooked', category: 'Grains', pdcaas: 0.55, calories: 119, protein: 3.5, carbs: 23.0, fat: 1.0 },
  { name: 'Potato, Baked with Skin', category: 'Vegetables', pdcaas: 0.65, calories: 161, protein: 4.3, carbs: 37.0, fat: 0.2 },
  { name: 'Yam, Baked', category: 'Vegetables', pdcaas: 0.55, calories: 116, protein: 1.5, carbs: 27.0, fat: 0.1 },
  
  // More Nuts & Seeds
  { name: 'Cashews, Raw', category: 'Nuts', pdcaas: 0.52, calories: 553, protein: 18.0, carbs: 30.0, fat: 44.0 },
  { name: 'Pecans, Raw', category: 'Nuts', pdcaas: 0.48, calories: 691, protein: 9.2, carbs: 14.0, fat: 72.0 },
  { name: 'Pistachios, Raw', category: 'Nuts', pdcaas: 0.55, calories: 560, protein: 20.0, carbs: 28.0, fat: 45.0 },
  { name: 'Brazil Nuts', category: 'Nuts', pdcaas: 0.50, calories: 656, protein: 14.0, carbs: 12.0, fat: 66.0 },
  { name: 'Pumpkin Seeds', category: 'Seeds', pdcaas: 0.58, calories: 559, protein: 30.0, carbs: 15.0, fat: 49.0 },
  { name: 'Sunflower Seeds', category: 'Seeds', pdcaas: 0.55, calories: 584, protein: 21.0, carbs: 20.0, fat: 51.0 },
  { name: 'Sesame Seeds', category: 'Seeds', pdcaas: 0.52, calories: 573, protein: 18.0, carbs: 23.0, fat: 50.0 },
  
  // More Legumes
  { name: 'Navy Beans, Cooked', category: 'Legumes', pdcaas: 0.70, calories: 140, protein: 8.2, carbs: 26.0, fat: 0.6 },
  { name: 'Pinto Beans, Cooked', category: 'Legumes', pdcaas: 0.68, calories: 143, protein: 9.0, carbs: 26.0, fat: 0.7 },
  { name: 'Lima Beans, Cooked', category: 'Legumes', pdcaas: 0.72, calories: 115, protein: 7.8, carbs: 21.0, fat: 0.4 },
  { name: 'Red Lentils, Cooked', category: 'Legumes', pdcaas: 0.69, calories: 116, protein: 9.0, carbs: 20.0, fat: 0.4 },
  { name: 'Green Peas, Cooked', category: 'Legumes', pdcaas: 0.65, calories: 84, protein: 5.4, carbs: 16.0, fat: 0.2 },
  
  // Dairy Products
  { name: 'Plain Whole Milk', category: 'Dairy', pdcaas: 1.0, calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  { name: 'Low-Fat Milk, 1%', category: 'Dairy', pdcaas: 1.0, calories: 42, protein: 3.4, carbs: 5.0, fat: 1.0 },
  { name: 'Skim Milk', category: 'Dairy', pdcaas: 1.0, calories: 34, protein: 3.4, carbs: 5.0, fat: 0.2 },
  { name: 'Swiss Cheese', category: 'Dairy', pdcaas: 1.0, calories: 380, protein: 27.0, carbs: 5.4, fat: 28.0 },
  { name: 'Feta Cheese', category: 'Dairy', pdcaas: 1.0, calories: 264, protein: 14.0, carbs: 4.1, fat: 21.0 },
  { name: 'Ricotta Cheese, Part Skim', category: 'Dairy', pdcaas: 1.0, calories: 138, protein: 11.0, carbs: 5.1, fat: 8.0 },
  
  // Healthy Fats
  { name: 'Avocado Oil', category: 'Oils', pdcaas: 0.0, calories: 884, protein: 0, carbs: 0, fat: 100.0 },
  { name: 'MCT Oil', category: 'Oils', pdcaas: 0.0, calories: 830, protein: 0, carbs: 0, fat: 93.0 },
  { name: 'Grass-Fed Butter', category: 'Dairy', pdcaas: 0.0, calories: 717, protein: 0.9, carbs: 0.1, fat: 81.0 }
];

async function addFoodBatch() {
  console.log('🚀 Adding batch of additional foods to database...\n');
  
  let foodsInserted = 0;
  let servingsInserted = 0;
  let errors = 0;
  
  for (const food of ADDITIONAL_FOODS) {
    try {
      console.log(`📝 Adding: ${food.name}`);
      
      // Insert into foods table
      const foodResponse = await fetch(`${SUPABASE_URL}/rest/v1/foods`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          name: food.name,
          category: food.category,
          pdcaas_score: food.pdcaas
        })
      });
      
      if (foodResponse.ok) {
        const [insertedFood] = await foodResponse.json();
        foodsInserted++;
        
        // Insert nutrition data into food_servings
        const servingResponse = await fetch(`${SUPABASE_URL}/rest/v1/food_servings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            food_id: insertedFood.id,
            serving_description: '100g',
            calories: food.calories,
            protein_g: food.protein,
            carbs_g: food.carbs,
            fat_g: food.fat
          })
        });
        
        if (servingResponse.ok) {
          servingsInserted++;
          console.log(`  ✅ Added with nutrition data`);
        } else {
          console.log(`  ⚠️ Food added but nutrition failed`);
        }
        
      } else if (foodResponse.status === 409) {
        console.log(`  ⏭️ Already exists, skipping`);
      } else {
        const error = await foodResponse.text();
        console.log(`  ❌ Failed: ${error}`);
        errors++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      errors++;
    }
  }
  
  console.log(`\n📊 BATCH IMPORT SUMMARY`);
  console.log(`${'='.repeat(40)}`);
  console.log(`✅ Foods inserted: ${foodsInserted}`);
  console.log(`📄 Servings inserted: ${servingsInserted}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📈 Success rate: ${((foodsInserted / ADDITIONAL_FOODS.length) * 100).toFixed(1)}%`);
  console.log(`\n🎯 Total foods added: ${foodsInserted}`);
}

// Run the import
addFoodBatch().catch(console.error);