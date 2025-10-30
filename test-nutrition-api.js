/**
 * @file test-nutrition-api.js
 * @description Simple test of the nutritionAPI wrapper
 */

import { nutritionAPI } from './src/utils/nutritionAPI.js';

// Test the search functionality
async function testNutritionAPI() {
  console.log('🧪 Testing Nutrition API Wrapper...\n');

  try {
    // Test 1: Search for existing food (should return local)
    console.log('1️⃣ Testing search for existing food: "chicken breast"');
    const result1 = await nutritionAPI.searchFood('chicken breast');
    console.log('Result:', JSON.stringify(result1, null, 2));
    console.log('Quality:', result1.quality);
    console.log('Message:', result1.message);
    console.log('\n---\n');

    // Test 2: Search for non-existing food (should trigger AI with guardrails)
    console.log('2️⃣ Testing search for new food: "avocado toast"');
    const result2 = await nutritionAPI.searchFood('avocado toast');
    console.log('Result:', JSON.stringify(result2, null, 2));
    console.log('Quality:', result2.quality);
    console.log('Message:', result2.message);
    console.log('\n---\n');

    // Test 3: Validate nutrition data
    console.log('3️⃣ Testing nutrition validation');
    const goodNutrition = {
      calories: 300,
      protein_g: 25,
      carbs_g: 20,
      fat_g: 10
    };
    
    const badNutrition = {
      calories: 5000, // Too high
      protein_g: 200, // Too high
      carbs_g: 30,
      fat_g: 15
    };

    const validation1 = nutritionAPI.validateNutrition(goodNutrition);
    console.log('Good nutrition validation:', validation1);

    const validation2 = nutritionAPI.validateNutrition(badNutrition);
    console.log('Bad nutrition validation:', validation2);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testNutritionAPI();