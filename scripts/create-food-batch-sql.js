/**
 * @file scripts/create-food-batch-sql.js  
 * @description Extract foods from API and generate SQL scripts for easy import
 */

import fetch from 'node-fetch';
import fs from 'fs';

const SUPABASE_URL = 'https://wkmrdelhoeqhsdifrarn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ';

// Get the best foods from key categories
const PRIORITY_FOODS = [
  // High-protein foods
  'chicken breast', 'salmon', 'eggs', 'greek yogurt', 'cottage cheese',
  'ground beef', 'turkey breast', 'tuna', 'shrimp', 'tofu',
  
  // Essential carbs  
  'brown rice', 'oats', 'quinoa', 'sweet potato', 'whole wheat bread',
  'banana', 'apple', 'blueberries', 'spinach', 'broccoli',
  
  // Healthy fats
  'almonds', 'walnuts', 'olive oil', 'avocado', 'peanut butter',
  
  // Common foods
  'milk', 'cheese', 'butter', 'pasta', 'potato',
  'carrots', 'onions', 'tomatoes', 'lettuce', 'garlic'
];

async function createFoodBatchSQL() {
  console.log('🔄 Generating SQL scripts from API data...\n');
  
  const allFoods = [];
  let processed = 0;
  
  for (const food of PRIORITY_FOODS) {
    try {
      console.log(`📊 ${processed + 1}/${PRIORITY_FOODS.length}: ${food}`);
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/nutrition-aggregator`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: food,
          sources: ['usda'],
          max_results: 3 // Top 3 per food
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.foods && data.foods.length > 0) {
          // Get the best 2 foods from each query
          const bestFoods = data.foods
            .slice(0, 2)
            .filter(f => f.calories > 0 && f.protein_g >= 0); // Basic quality filter
          
          allFoods.push(...bestFoods);
          console.log(`  ✅ Added ${bestFoods.length} foods`);
        } else {
          console.log(`  ⚠️ No foods found`);
        }
      } else {
        console.log(`  ❌ API error: ${response.status}`);
      }
      
      processed++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Retrieved ${allFoods.length} foods from API`);
  
  // Generate SQL script
  const sqlScript = generateSQL(allFoods);
  
  // Write to file
  fs.writeFileSync('scripts/api-foods-batch.sql', sqlScript);
  console.log(`✅ Generated SQL script: scripts/api-foods-batch.sql`);
  console.log(`🎯 Ready to import ${allFoods.length} high-quality foods!`);
}

function generateSQL(foods) {
  const foodsSQL = foods.map(food => {
    const cleanName = food.name.replace(/'/g, "''");
    const cleanCategory = categorizeFoodByName(food.name).replace(/'/g, "''");
    const pdcaas = calculatePDCAAS(food);
    
    return `('${cleanName}', '${cleanCategory}', ${pdcaas})`;
  }).join(',\n');
  
  const servingsSQL = foods.map((food) => {
    const cleanName = food.name.replace(/'/g, "''");
    return `        WHEN f.name = '${cleanName}' THEN ${Math.round(food.calories || 0)}`;
  }).join('\n');
  
  const proteinSQL = foods.map((food) => {
    const cleanName = food.name.replace(/'/g, "''");
    return `        WHEN f.name = '${cleanName}' THEN ${Math.round((food.protein_g || 0) * 10) / 10}`;
  }).join('\n');
  
  const carbsSQL = foods.map((food) => {
    const cleanName = food.name.replace(/'/g, "''");
    return `        WHEN f.name = '${cleanName}' THEN ${Math.round((food.carbs_g || 0) * 10) / 10}`;
  }).join('\n');
  
  const fatSQL = foods.map((food) => {
    const cleanName = food.name.replace(/'/g, "''");
    return `        WHEN f.name = '${cleanName}' THEN ${Math.round((food.fat_g || 0) * 10) / 10}`;
  }).join('\n');
  
  return `-- High-Quality Foods from Multi-API Nutrition Pipeline
-- Generated from USDA database via nutrition-aggregator
-- Execute in Supabase SQL Editor: https://supabase.com/dashboard/project/wkmrdelhoeqhsdifrarn/sql

-- Insert foods
INSERT INTO foods (name, category, pdcaas_score) 
VALUES 
${foodsSQL}
ON CONFLICT (name) DO NOTHING;

-- Insert nutrition data  
DO $$
DECLARE
    f RECORD;
BEGIN
    FOR f IN SELECT id, name FROM foods WHERE name IN (${foods.map(food => `'${food.name.replace(/'/g, "''")}'`).join(', ')})
    LOOP
        INSERT INTO food_servings (food_id, serving_description, calories, protein_g, carbs_g, fat_g)
        VALUES (
            f.id,
            '100g',
            CASE 
${servingsSQL}
            END,
            CASE 
${proteinSQL}
            END,
            CASE 
${carbsSQL}
            END,
            CASE 
${fatSQL}
            END
        ) ON CONFLICT (food_id, serving_description) DO NOTHING;
    END LOOP;
END $$;

-- Verify results
SELECT COUNT(*) as new_foods_added FROM foods;
SELECT category, COUNT(*) as count FROM foods GROUP BY category ORDER BY count DESC;

-- Summary: ${foods.length} high-quality foods from USDA database`;
}

function categorizeFoodByName(foodName) {
  const name = foodName.toLowerCase();
  
  // Meat & Poultry
  if (name.includes('chicken') || name.includes('turkey') || name.includes('beef') || 
      name.includes('pork') || name.includes('lamb') || name.includes('meat')) {
    return 'Meat & Poultry';
  }
  
  // Fish & Seafood
  if (name.includes('fish') || name.includes('salmon') || name.includes('tuna') || 
      name.includes('shrimp') || name.includes('crab') || name.includes('lobster') ||
      name.includes('cod') || name.includes('tilapia') || name.includes('sardine')) {
    return 'Fish & Seafood';
  }
  
  // Dairy & Eggs
  if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || 
      name.includes('cottage cheese') || name.includes('butter') || name.includes('cream') ||
      name.includes('egg')) {
    return 'Dairy & Eggs';
  }
  
  // Fruits
  if (name.includes('apple') || name.includes('banana') || name.includes('berry') ||
      name.includes('orange') || name.includes('grape') || name.includes('strawberry') ||
      name.includes('blueberry') || name.includes('cherry') || name.includes('peach') ||
      name.includes('pear') || name.includes('mango') || name.includes('avocado')) {
    return 'Fruits';
  }
  
  // Vegetables
  if (name.includes('broccoli') || name.includes('spinach') || name.includes('carrot') ||
      name.includes('tomato') || name.includes('lettuce') || name.includes('onion') ||
      name.includes('pepper') || name.includes('cucumber') || name.includes('celery') ||
      name.includes('potato') || name.includes('sweet potato') || name.includes('garlic')) {
    return 'Vegetables';
  }
  
  // Grains, Bread & Pasta
  if (name.includes('rice') || name.includes('oat') || name.includes('quinoa') ||
      name.includes('bread') || name.includes('pasta') || name.includes('cereal') ||
      name.includes('wheat') || name.includes('barley') || name.includes('grain')) {
    return 'Grains, Bread & Pasta';
  }
  
  // Nuts & Seeds
  if (name.includes('almond') || name.includes('walnut') || name.includes('peanut') ||
      name.includes('cashew') || name.includes('pecan') || name.includes('seed') ||
      name.includes('nut')) {
    return 'Nuts & Seeds';
  }
  
  // Oils & Fats
  if (name.includes('oil') || name.includes('fat') || name.includes('lard')) {
    return 'Oils & Fats';
  }
  
  // Plant Proteins
  if (name.includes('tofu') || name.includes('tempeh') || name.includes('bean') ||
      name.includes('lentil') || name.includes('chickpea') || name.includes('soy')) {
    return 'Plant Proteins';
  }
  
  // If no match found, categorize by primary macronutrient
  return 'Miscellaneous';
}

function calculatePDCAAS(food) {
  const protein = food.protein_g || 0;
  const name = food.name.toLowerCase();
  
  if (protein < 1) return 0.0;
  
  // High-quality complete proteins
  if (name.includes('egg') || name.includes('milk') || name.includes('cheese') || 
      name.includes('yogurt') || name.includes('chicken') || name.includes('turkey') ||
      name.includes('fish') || name.includes('salmon') || name.includes('beef')) {
    return 1.0;
  }
  
  // Plant proteins
  if (name.includes('bean') || name.includes('lentil') || name.includes('quinoa')) {
    return 0.70;
  }
  
  if (name.includes('nut') || name.includes('seed')) {
    return 0.55;
  }
  
  if (name.includes('grain') || name.includes('rice') || name.includes('oat')) {
    return 0.65;
  }
  
  return 0.50;
}

// Run the script
createFoodBatchSQL().catch(console.error);