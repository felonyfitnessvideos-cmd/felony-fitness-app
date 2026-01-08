/**
 * @file rank_foods.js
 * @description Ranks foods by commonness score (10-75) based on category and name patterns
 * @usage node rank_foods.js
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env.local from the project root
const envLocalPath = path.resolve('./.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Category-based ranking tiers
const CATEGORY_SCORES = {
  // Ubiquitous foods (70-75)
  'fruits': 72,
  'vegetables': 71,
  'grains': 70,
  'meat': 73,
  'dairy': 72,
  'eggs': 74,
  
  // Common foods (60-69)
  'condiments': 65,
  'oils': 64,
  'spices': 63,
  'beverages': 62,
  'nuts': 61,
  'legumes': 60,
  
  // Moderately common (40-59)
  'baked products': 55,
  'snacks': 50,
  'sweets': 48,
  'frozen meals': 45,
  'prepared foods': 42,
  'sauces': 58,
  
  // Less common (20-39)
  'supplements': 25,
  'specialty foods': 28,
  'ethnic foods': 32,
  'health foods': 30,
  
  // Rare (10-19)
  'other': 15,
};

// Common food name patterns for boosting score
const COMMON_FOODS = [
  // Proteins
  'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey', 'lamb',
  'egg', 'milk', 'cheese', 'yogurt', 'cottage cheese',
  
  // Vegetables
  'broccoli', 'spinach', 'carrot', 'lettuce', 'tomato', 'cucumber', 'pepper',
  'onion', 'garlic', 'potato', 'sweet potato', 'asparagus', 'green bean',
  
  // Fruits
  'apple', 'banana', 'orange', 'grape', 'berry', 'strawberry', 'blueberry',
  'watermelon', 'pear', 'peach', 'avocado', 'coconut',
  
  // Grains
  'rice', 'bread', 'pasta', 'oats', 'cereal', 'flour', 'wheat', 'corn',
  'barley', 'quinoa', 'couscous',
  
  // Basics
  'salt', 'pepper', 'water', 'oil', 'butter', 'sugar', 'honey',
  'vinegar', 'sauce', 'soup', 'broth', 'stock',
  
  // Nuts/Seeds
  'almond', 'peanut', 'walnut', 'sunflower', 'flax', 'chia',
  
  // Dairy/Alternatives
  'milk', 'cream', 'butter', 'ice cream', 'yogurt',
];

// Uncommon/specialty patterns
const UNCOMMON_FOODS = [
  'exotic', 'imported', 'specialty', 'ethnic', 'artisanal',
  'supplement', 'powder', 'extract', 'concentrate', 'blend',
];

/**
 * Calculate commonness score based on food name and category
 */
function calculateCommonness(name, category) {
  let score = CATEGORY_SCORES[category?.toLowerCase()] || 40;
  
  const nameLower = name.toLowerCase();
  
  // Boost for very common foods
  if (COMMON_FOODS.some(food => nameLower.includes(food))) {
    score = Math.min(75, score + 8);
  }
  
  // Reduce for uncommon/specialty foods
  if (UNCOMMON_FOODS.some(term => nameLower.includes(term))) {
    score = Math.max(10, score - 15);
  }
  
  // Slight boost for branded/specific items (they tend to be more common)
  if (nameLower.includes('brand') || nameLower.includes('prepared')) {
    score = Math.min(75, score + 3);
  }
  
  // Reduce for overly long names (usually specific/rare items)
  if (name.length > 80) {
    score = Math.max(10, score - 5);
  }
  
  return Math.max(10, Math.min(75, score));
}

/**
 * Rank all foods in the database
 */
async function rankFoods() {
  try {
    console.log('🏋️ Starting food commonness ranking...\n');
    
    // Fetch all foods
    const { data: foods, error: fetchError } = await supabase
      .from('foods')
      .select('id, name, category')
      .limit(100000);
    
    if (fetchError) throw fetchError;
    
    if (!foods || foods.length === 0) {
      console.log('⚠️  No foods found in database');
      return;
    }
    
    console.log(`📊 Found ${foods.length} foods to rank\n`);
    
    // Calculate scores for all foods
    const updates = foods.map(food => ({
      id: food.id,
      name: food.name,
      category: food.category,
      commonness_score: calculateCommonness(food.name, food.category)
    }));
    
    // Group by score for display
    const scoreDistribution = {};
    updates.forEach(update => {
      scoreDistribution[update.commonness_score] = (scoreDistribution[update.commonness_score] || 0) + 1;
    });
    
    console.log('📈 Score Distribution:');
    Object.keys(scoreDistribution)
      .sort((a, b) => b - a)
      .slice(0, 10)
      .forEach(score => {
        console.log(`   ${score}: ${scoreDistribution[score]} foods`);
      });
    console.log();
    
    // Batch update in chunks (Supabase has limits)
    const BATCH_SIZE = 500;
    let processed = 0;
    
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = updates.slice(i, i + BATCH_SIZE);
      
      // Update each food
      for (const update of batch) {
        const { error } = await supabase
          .from('foods')
          .update({ commonness_score: update.commonness_score })
          .eq('id', update.id);
        
        if (error) {
          console.error(`❌ Error updating food ${update.id}:`, error.message);
        }
      }
      
      processed += batch.length;
      const pct = ((processed / updates.length) * 100).toFixed(1);
      console.log(`✓ Processed ${processed}/${updates.length} foods (${pct}%)`);
    }
    
    console.log('\n✅ Food ranking complete!');
    console.log(`   - Ubiquitous (70-75): Foods like eggs, chicken, rice, basic vegetables`);
    console.log(`   - Common (60-69): Nuts, oils, common condiments`);
    console.log(`   - Moderate (40-59): Snacks, baked goods, processed foods`);
    console.log(`   - Uncommon (20-39): Specialty and ethnic foods`);
    console.log(`   - Rare (10-19): Exotic items and supplements`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
rankFoods();
