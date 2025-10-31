/**
 * @file scripts/direct-food-seeder.js
 * @description Direct database seeding using SQL commands
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wkmrdelhoeqhsdifrarn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrfnJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk5NDI0NDMsImV4cCI6MjA0NTUxODQ0M30.VKtT33Pk_hh3gJzYQlJ9_P1xJcftR8OAIqaO4PajIQw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ESSENTIAL_FOODS = [
  // Protein Foods
  { name: 'Chicken Breast, Skinless, Boneless, Raw', category: 'Protein', serving_size: 100, serving_unit: 'g', calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0, sodium: 74, data_source: 'Manual', quality_score: 85 },
  { name: 'Ground Beef, 85% Lean', category: 'Protein', serving_size: 100, serving_unit: 'g', calories: 250, protein: 26.0, carbs: 0, fat: 17.0, fiber: 0, sodium: 75, data_source: 'Manual', quality_score: 85 },
  { name: 'Salmon, Atlantic, Raw', category: 'Protein', serving_size: 100, serving_unit: 'g', calories: 208, protein: 25.4, carbs: 0, fat: 12.4, fiber: 0, sodium: 59, data_source: 'Manual', quality_score: 85 },
  { name: 'Eggs, Large, Whole', category: 'Protein', serving_size: 100, serving_unit: 'g', calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0, sodium: 124, data_source: 'Manual', quality_score: 85 },
  { name: 'Greek Yogurt, Plain, Nonfat', category: 'Dairy', serving_size: 100, serving_unit: 'g', calories: 59, protein: 10.3, carbs: 3.6, fat: 0.4, fiber: 0, sodium: 36, data_source: 'Manual', quality_score: 85 },

  // Carbohydrate Foods
  { name: 'Brown Rice, Cooked', category: 'Grains', serving_size: 100, serving_unit: 'g', calories: 111, protein: 2.6, carbs: 22.0, fat: 0.9, fiber: 1.6, sodium: 1, data_source: 'Manual', quality_score: 80 },
  { name: 'Sweet Potato, Baked', category: 'Vegetables', serving_size: 100, serving_unit: 'g', calories: 90, protein: 2.0, carbs: 21.0, fat: 0.1, fiber: 3.3, sodium: 6, data_source: 'Manual', quality_score: 80 },
  { name: 'Oats, Rolled, Dry', category: 'Grains', serving_size: 100, serving_unit: 'g', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6, sodium: 2, data_source: 'Manual', quality_score: 85 },
  { name: 'Quinoa, Cooked', category: 'Grains', serving_size: 100, serving_unit: 'g', calories: 120, protein: 4.4, carbs: 22.0, fat: 1.9, fiber: 2.8, sodium: 7, data_source: 'Manual', quality_score: 85 },

  // Vegetables
  { name: 'Broccoli, Raw', category: 'Vegetables', serving_size: 100, serving_unit: 'g', calories: 34, protein: 2.8, carbs: 7.0, fat: 0.4, fiber: 2.6, sodium: 33, data_source: 'Manual', quality_score: 90 },
  { name: 'Spinach, Raw', category: 'Vegetables', serving_size: 100, serving_unit: 'g', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sodium: 79, data_source: 'Manual', quality_score: 90 },
  { name: 'Carrots, Raw', category: 'Vegetables', serving_size: 100, serving_unit: 'g', calories: 41, protein: 0.9, carbs: 10.0, fat: 0.2, fiber: 2.8, sodium: 69, data_source: 'Manual', quality_score: 85 },

  // Fruits
  { name: 'Banana, Raw', category: 'Fruits', serving_size: 100, serving_unit: 'g', calories: 89, protein: 1.1, carbs: 23.0, fat: 0.3, fiber: 2.6, sodium: 1, data_source: 'Manual', quality_score: 85 },
  { name: 'Apple, Raw, with Skin', category: 'Fruits', serving_size: 100, serving_unit: 'g', calories: 52, protein: 0.3, carbs: 14.0, fat: 0.2, fiber: 2.4, sodium: 1, data_source: 'Manual', quality_score: 85 },
  { name: 'Avocado, Raw', category: 'Fruits', serving_size: 100, serving_unit: 'g', calories: 160, protein: 2.0, carbs: 9.0, fat: 15.0, fiber: 7.0, sodium: 7, data_source: 'Manual', quality_score: 90 },

  // Nuts and Fats
  { name: 'Almonds, Raw', category: 'Nuts', serving_size: 100, serving_unit: 'g', calories: 579, protein: 21.0, carbs: 22.0, fat: 50.0, fiber: 12.0, sodium: 1, data_source: 'Manual', quality_score: 90 },
  { name: 'Olive Oil, Extra Virgin', category: 'Oils', serving_size: 100, serving_unit: 'g', calories: 884, protein: 0, carbs: 0, fat: 100.0, fiber: 0, sodium: 2, data_source: 'Manual', quality_score: 80 },
  { name: 'Peanut Butter, Natural', category: 'Nuts', serving_size: 100, serving_unit: 'g', calories: 588, protein: 25.0, carbs: 20.0, fat: 50.0, fiber: 8.0, sodium: 17, data_source: 'Manual', quality_score: 85 }
];

async function seedDatabase() {
  console.log('🌱 Direct Database Seeding...');
  console.log(`📊 Seeding ${ESSENTIAL_FOODS.length} essential foods\n`);

  let inserted = 0;
  let existing = 0;
  let failed = 0;

  for (let i = 0; i < ESSENTIAL_FOODS.length; i++) {
    const food = ESSENTIAL_FOODS[i];
    
    try {
      console.log(`${i + 1}/${ESSENTIAL_FOODS.length}: ${food.name}`);
      
      // Check if food already exists
      const { data: existingFood, error: checkError } = await supabase
        .from('foods')
        .select('id, name')
        .eq('name', food.name)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.log(`  ❌ Check error: ${checkError.message}`);
        failed++;
        continue;
      }

      if (existingFood) {
        console.log(`  ⚠️ Already exists`);
        existing++;
        continue;
      }

      // Insert the food
      const { error: insertError } = await supabase
        .from('foods')
        .insert([{
          ...food,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) {
        console.log(`  ❌ Insert error: ${insertError.message}`);
        failed++;
        continue;
      }

      console.log(`  ✅ Inserted (Quality: ${food.quality_score}%)`);
      inserted++;

    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      failed++;
    }

    // Small delay to be respectful
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 SEEDING SUMMARY');
  console.log(`${'='.repeat(50)}`);
  console.log(`✅ Successfully inserted: ${inserted} foods`);
  console.log(`⚠️  Already existed: ${existing} foods`);
  console.log(`❌ Failed insertions: ${failed} foods`);
  console.log(`📈 Success rate: ${((inserted / ESSENTIAL_FOODS.length) * 100).toFixed(1)}%`);
  
  if (inserted > 0) {
    console.log(`\n🎉 Database successfully seeded with ${inserted} essential foods!`);
    console.log(`\n🔍 Test your new foods:`);
    console.log(`await enhancedNutritionAPI.searchFood('chicken')`);
    console.log(`await enhancedNutritionAPI.searchFood('broccoli')`);
    console.log(`await enhancedNutritionAPI.searchFood('banana')`);
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });