// FILE: seed-foods.js

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// --- Configuration ---
const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID;
const NUTRITIONIX_APP_KEY = process.env.NUTRITIONIX_APP_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!NUTRITIONIX_APP_ID || !NUTRITIONIX_APP_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("Missing required environment variables.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Input Data: A list of common foods to seed ---
// Start small for testing, then expand this list as needed.
const COMMON_FOODS = [
  // Proteins
  { name: 'Chicken Breast', type: 'meat' },
  { name: 'Ground Beef', type: 'meat' },
  { name: 'Salmon', type: 'meat' },
  { name: 'Tuna', type: 'meat' },
  { name: 'Pork Chop', type: 'meat' },
  { name: 'Whole Egg', type: 'item' },
  { name: 'Egg Whites', type: 'liquid' },
  { name: 'Tofu', type: 'meat' },
  { name: 'Lentils', type: 'volume' },
  { name: 'Black Beans', type: 'volume' },
  { name: 'Chickpeas', type: 'volume' },
  { name: 'Whey Protein Powder', type: 'item' },

  // Dairy & Alternatives
  { name: 'Milk', type: 'liquid' },
  { name: 'Greek Yogurt', type: 'volume' },
  { name: 'Cottage Cheese', type: 'volume' },
  { name: 'Cheddar Cheese', type: 'volume' },
  { name: 'Almond Milk', type: 'liquid' },

  // Fats & Oils
  { name: 'Almonds', type: 'volume' },
  { name: 'Walnuts', type: 'volume' },
  { name: 'Peanut Butter', type: 'item' },
  { name: 'Avocado', type: 'item' },
  { name: 'Olive Oil', type: 'item' },
  
  // Carbohydrates
  { name: 'Oats', type: 'volume' },
  { name: 'Brown Rice', type: 'volume' },
  { name: 'White Rice', type: 'volume' },
  { name: 'Quinoa', type: 'volume' },
  { name: 'Sweet Potato', type: 'item' },
  { name: 'Russet Potato', type: 'item' },
  { name: 'White Bread', type: 'item' },
  { name: 'Whole Wheat Bread', type: 'item' },
  { name: 'Pasta', type: 'volume' },

  // Fruits
  { name: 'Apple', type: 'item' },
  { name: 'Banana', type: 'item' },
  { name: 'Blueberries', type: 'volume' },
  { name: 'Strawberries', type: 'volume' },
  { name: 'Orange', type: 'item' },

  // Vegetables
  { name: 'Broccoli', type: 'volume' },
  { name: 'Spinach', type: 'volume' },
  { name: 'Carrots', type: 'item' },
  { name: 'Bell Pepper', type: 'item' },
  { name: 'Onion', type: 'item' },
  { name: 'Tomato', type: 'item' },
  { name: 'Cucumber', type: 'item' },

  // Coffee & Tea
  { name: 'Black Coffee', type: 'liquid' },
  { name: 'Coffee with Milk', type: 'liquid' },
  { name: 'Coffee with Cream', type: 'liquid' },
  { name: 'Coffee with Sugar', type: 'liquid' },
  { name: 'Latte', type: 'liquid' },
  { name: 'Cappuccino', type: 'liquid' },
  { name: 'Espresso', type: 'item' },
  { name: 'Green Tea', type: 'liquid' },
  { name: 'Black Tea', type: 'liquid' },

  // Protein Shakes & Supplements
  { name: 'Whey Protein Shake with Water', type: 'liquid' },
  { name: 'Whey Protein Shake with Milk', type: 'liquid' },
  { name: 'Casein Protein Shake', type: 'liquid' },
  { name: 'Scoop of Whey Protein', type: 'item' },
  { name: 'Creatine', type: 'item' },

  // Other Drinks
  { name: 'Diet Coke', type: 'liquid' },
  { name: 'Coke Zero', type: 'liquid' },
  { name: 'Diet Pepsi', type: 'liquid' },
  { name: 'Gatorade Zero', type: 'liquid' },
  { name: 'Orange Juice', type: 'liquid' },
  { name: 'Apple Juice', type: 'liquid' },
  { name: 'Energy Drink', type: 'liquid' },
  { name: 'Sparkling Water', type: 'liquid' },
  { name: 'Kombucha', type: 'liquid' },

  // Salty Snacks
  { name: 'Potato Chips', type: 'volume' },
  { name: 'Tortilla Chips', type: 'volume' },
  { name: 'Pretzels', type: 'volume' },
  { name: 'Popcorn', type: 'volume' },
  { name: 'Beef Jerky', type: 'item' },
  { name: 'Rice Cakes', type: 'item' },
  { name: 'Saltine Crackers', type: 'item' },
  { name: 'Hummus', type: 'item' },
  { name: 'Salsa', type: 'item' },
  { name: 'String Cheese', type: 'item' },
  { name: 'Hard Boiled Egg', type: 'item' },
  { name: 'Cashews', type: 'volume' },
  { name: 'Pistachios', type: 'volume' },

  // Sweet Snacks & Bars
  { name: 'Protein Bar', type: 'item' },
  { name: 'Granola Bar', type: 'item' },
  { name: 'Dark Chocolate', type: 'item' },
  { name: 'Snickers Bar', type: 'item' },
  { name: 'Reeses Peanut Butter Cup', type: 'item' },
  { name: 'Apple Slices', type: 'volume' },
  { name: 'Dried Apricots', type: 'volume' },
  { name: 'Trail Mix', type: 'volume' },
  { name: 'Rice Krispie Treat', type: 'item' },
  { name: 'Fig Newton', type: 'item' },

  // Vegetables
  { name: 'Kale', type: 'volume' },
  { name: 'Romaine Lettuce', type: 'volume' },
  { name: 'Iceberg Lettuce', type: 'volume' },
  { name: 'Arugula', type: 'volume' },
  { name: 'Cabbage', type: 'volume' },
  { name: 'Cauliflower', type: 'volume' },
  { name: 'Brussels Sprouts', type: 'volume' },
  { name: 'Asparagus', type: 'item' },
  { name: 'Green Beans', type: 'volume' },
  { name: 'Peas', type: 'volume' },
  { name: 'Sweet Corn', type: 'volume' },
  { name: 'Mushroom', type: 'volume' },
  { name: 'Celery', type: 'item' },
  { name: 'Zucchini', type: 'item' },
  { name: 'Eggplant', type: 'item' },
  { name: 'Artichoke', type: 'item' },
  { name: 'Leek', type: 'item' },
  { name: 'Garlic', type: 'item' },
  { name: 'Ginger', type: 'item' },
  { name: 'Radish', type: 'item' },
  { name: 'Beet', type: 'item' },
  { name: 'Turnip', type: 'item' },
  { name: 'Jalapeno', type: 'item' },
  { name: 'Butternut Squash', type: 'volume' },
  { name: 'Acorn Squash', type: 'volume' },
  { name: 'Pumpkin', type: 'volume' },
  { name: 'Scallion', type: 'item' },
  { name: 'Fennel', type: 'item' },
  { name: 'Sweet Potato', type: 'item' }, // Also on other list, but good here
  { name: 'Yam', type: 'item' },
  
  // Fruits
  { name: 'Grapes', type: 'volume' },
  { name: 'Pear', type: 'item' },
  { name: 'Raspberries', type: 'volume' },
  { name: 'Blackberries', type: 'volume' },
  { name: 'Cranberries', type: 'volume' },
  { name: 'Watermelon', type: 'volume' },
  { name: 'Cantaloupe', type: 'volume' },
  { name: 'Honeydew', type: 'volume' },
  { name: 'Lemon', type: 'item' },
  { name: 'Lime', type: 'item' },
  { name: 'Grapefruit', type: 'item' },
  { name: 'Peach', type: 'item' },
  { name: 'Plum', type: 'item' },
  { name: 'Nectarine', type: 'item' },
  { name: 'Cherries', type: 'volume' },
  { name: 'Apricot', type: 'item' },
  { name: 'Mango', type: 'item' },
  { name: 'Pineapple', type: 'volume' },
  { name: 'Kiwi', type: 'item' },
  { name: 'Pomegranate', type: 'item' },
  
  // Meats & Seafood
  { name: 'Sirloin Steak', type: 'meat' },
  { name: 'Ribeye Steak', type: 'meat' },
  { name: 'Ground Turkey', type: 'meat' },
  { name: 'Pork Sausage', type: 'meat' },
  { name: 'Bacon', type: 'item' },
  { name: 'Deli Turkey Breast', type: 'item' },
  { name: 'Ham', type: 'item' },
  { name: 'Shrimp', type: 'meat' },
  { name: 'Cod', type: 'meat' },
  { name: 'Tilapia', type: 'meat' },
  { name: 'Scallops', type: 'meat' },
  { name: 'Canned Tuna in Water', type: 'meat' },
  
  // Grains & Breads
  { name: 'Bagel', type: 'item' },
  { name: 'English Muffin', type: 'item' },
  { name: 'Croissant', type: 'item' },
  { name: 'Whole Wheat Pasta', type: 'volume' },
  { name: 'Barley', type: 'volume' },
  { name: 'Couscous', type: 'volume' },
  { name: 'Flour Tortilla', type: 'item' },
  { name: 'Corn Tortilla', type: 'item' },
  { name: 'Pita Bread', type: 'item' },

  // More Beans & Legumes
  { name: 'Kidney Beans', type: 'volume' },
  { name: 'Pinto Beans', type: 'volume' },
  { name: 'Navy Beans', type: 'volume' },
  { name: 'Edamame', type: 'volume' },

  // More Vegetables
  { name: 'Red Potato', type: 'item' },
  { name: 'Yukon Gold Potato', type: 'item' },
  { name: 'Collard Greens', type: 'volume' },
  { name: 'Swiss Chard', type: 'volume' },
  { name: 'Okra', type: 'volume' },
  { name: 'Parsnips', type: 'item' },
  { name: 'Green Olives', type: 'item' },
  { name: 'Black Olives', type: 'item' },
  { name: 'Pickles', type: 'item' },
  { name: 'Sauerkraut', type: 'volume' },

  // More Fruits
  { name: 'Dates', type: 'item' },
  { name: 'Figs', type: 'item' },
  { name: 'Raisins', type: 'volume' },
  { name: 'Passionfruit', type: 'item' },
  { name: 'Papaya', type: 'volume' },
  { name: 'Plantain', type: 'item' },

  // More Dairy & Cheeses
  { name: 'Mozzarella Cheese', type: 'volume' },
  { name: 'Feta Cheese', type: 'volume' },
  { name: 'Parmesan Cheese', type: 'item' },
  { name: 'Provolone Cheese', type: 'item' },
  { name: 'Sour Cream', type: 'item' },
  { name: 'Cream Cheese', type: 'item' },
  { name: 'Soy Milk', type: 'liquid' },
  { name: 'Butter', type: 'item' },

  // Breakfast Items
  { name: 'Pancakes', type: 'item' },
  { name: 'Waffles', type: 'item' },
  { name: 'French Toast', type: 'item' },
  { name: 'Breakfast Sausage', type: 'item' },
  { name: 'Corn Flakes Cereal', type: 'volume' },
  { name: 'Cheerios Cereal', type: 'volume' },

  // Soups & Sauces
  { name: 'Tomato Soup', type: 'liquid' },
  { name: 'Chicken Noodle Soup', type: 'liquid' },
  { name: 'Mayonnaise', type: 'item' },
  { name: 'Ketchup', type: 'item' },
  { name: 'Mustard', type: 'item' },
  { name: 'BBQ Sauce', type: 'item' },
  { name: 'Ranch Dressing', type: 'item' },
  { name: 'Soy Sauce', type: 'item' },
  { name: 'Hot Sauce', type: 'item' },
  { name: 'Maple Syrup', type: 'item' },

  // Frozen & Prepared
  { name: 'Frozen Pizza', type: 'item' },
  { name: 'French Fries', type: 'volume' },
  { name: 'Tater Tots', type: 'volume' },
  { name: 'Chicken Nuggets', type: 'item' },
  { name: 'Fish Sticks', type: 'item' },
  { name: 'Hot Dog', type: 'item' },
  { name: 'Hamburger Bun', type: 'item' },
  { name: 'Hot Dog Bun', type: 'item' },

  // Baked Goods & Desserts
  { name: 'Brownie', type: 'item' },
  { name: 'Chocolate Chip Cookie', type: 'item' },
  { name: 'Blueberry Muffin', type: 'item' },
  { name: 'Glazed Doughnut', type: 'item' },
  { name: 'Vanilla Ice Cream', type: 'volume' },
  { name: 'Chocolate Ice Cream', type: 'volume' },
  { name: 'Apple Pie', type: 'item' },
  { name: 'Cheesecake', type: 'item' },
  { name: 'Jello', type: 'volume' },
];

const SERVING_SIZES = {
  meat: ['4 oz', '6 oz', '8 oz'],
  liquid: ['8 fl oz', '1 cup'],
  volume: ['0.5 cup', '1 cup'],
  item: ['1 serving', '1 tbsp', '1 large', '1 medium'],
};

// Helper to prevent hitting the API rate limit too quickly
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function seedFoods() {
  console.log(`Starting to seed ${COMMON_FOODS.length} common foods...`);
  
  for (const foodItem of COMMON_FOODS) {
    try {
      // 1. Insert the main food item into the 'foods' table to get its ID
      const { data: foodData, error: foodError } = await supabase
        .from('foods')
        .upsert({ name: foodItem.name }, { onConflict: 'name' })
        .select()
        .single();

      if (foodError) throw foodError;
      const foodId = foodData.id;
      console.log(`\nProcessing "${foodItem.name}" (ID: ${foodId})`);

      // 2. Get nutrition data for various serving sizes
      const servingSizesToQuery = SERVING_SIZES[foodItem.type] || ['1 serving'];

      for (const size of servingSizesToQuery) {
        const query = `${size} ${foodItem.name}`;
        
        const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-app-id': NUTRITIONIX_APP_ID,
            'x-app-key': NUTRITIONIX_APP_KEY,
          },
          body: JSON.stringify({ query: query }),
        });

        const data = await response.json();

        if (data.foods && data.foods.length > 0) {
          const foodDetails = data.foods[0];
          
          const servingPayload = {
            food_id: foodId,
            serving_description: `${foodDetails.serving_qty} ${foodDetails.serving_unit}`,
            calories: Math.round(foodDetails.nf_calories || 0),
            protein_g: foodDetails.nf_protein || 0,
            carbs_g: foodDetails.nf_total_carbohydrate || 0,
            fat_g: foodDetails.nf_total_fat || 0,
          };

          // 3. Insert the detailed serving size into the 'food_servings' table
          const { error: servingError } = await supabase
            .from('food_servings')
            .insert(servingPayload);

          if (servingError) {
            console.error(`  - Error saving serving "${size}": ${servingError.message}`);
          } else {
            console.log(`  - Successfully saved serving: "${servingPayload.serving_description}"`);
          }
        } else {
          console.log(`  - Could not find data for serving: "${size}"`);
        }
        
        // IMPORTANT: Add a small delay to respect API rate limits
        await delay(300); // 300ms delay between each API call
      }
    } catch (error) {
      console.error(`Failed to process "${foodItem.name}":`, error.message);
    }
  }
  console.log("\n✅ Food seeding complete!");
}

seedFoods();