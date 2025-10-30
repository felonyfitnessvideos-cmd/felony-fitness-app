/**
 * @file scripts/quick-food-seeder.js
 * @description Quick food database seeder for testing
 * Seeds essential foods for immediate use
 */

import fetch from 'node-fetch';

const SUPABASE_URL = 'https://wkmrdelhoeqhsdifrarn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrfnJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk5NDI0NDMsImV4cCI6MjA0NTUxODQ0M30.VKtT33Pk_hh3gJzYQlJ9_P1xJcftR8OAIqaO4PajIQw';

// Essential foods for quick seeding
const ESSENTIAL_FOODS = [
  // Proteins
  'chicken breast', 'ground beef', 'salmon', 'eggs', 'greek yogurt',
  'cottage cheese', 'tofu', 'black beans', 'quinoa', 'turkey breast',
  
  // Carbs
  'brown rice', 'sweet potato', 'oats', 'whole wheat bread', 'pasta',
  
  // Vegetables
  'broccoli', 'spinach', 'carrots', 'bell peppers', 'tomatoes',
  
  // Fruits
  'banana', 'apple', 'berries', 'orange', 'avocado',
  
  // Fats
  'olive oil', 'almonds', 'peanut butter', 'chia seeds', 'walnuts'
];

async function quickSeed() {
  console.log('🌱 Quick Food Database Seeding...');
  console.log(`📊 Seeding ${ESSENTIAL_FOODS.length} essential foods\n`);

  let imported = 0;
  let failed = 0;

  for (let i = 0; i < ESSENTIAL_FOODS.length; i++) {
    const food = ESSENTIAL_FOODS[i];
    
    try {
      console.log(`${i + 1}/${ESSENTIAL_FOODS.length}: ${food}`);
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/nutrition-aggregator`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: food,
          sources: ['usda'],
          max_results: 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.foods && data.foods.length > 0) {
          imported++;
          console.log(`  ✅ Found and cached`);
        } else {
          failed++;
          console.log(`  ⚠️ No results`);
        }
      } else {
        failed++;
        console.log(`  ❌ API error: ${response.status}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      failed++;
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log(`\n📊 Quick Seed Summary:`);
  console.log(`✅ Imported: ${imported}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((imported / ESSENTIAL_FOODS.length) * 100).toFixed(1)}%`);
  console.log(`\n🎉 Database seeded with essential foods!`);
}

quickSeed()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });