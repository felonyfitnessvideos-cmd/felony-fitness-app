/**
 * @file supabase/functions/nutrition-audit/index.ts
 * @description Comprehensive nutrition database audit system
 * 
 * Analyzes existing data for:
 * - Nutritional inconsistencies
 * - Category misalignments  
 * - Outlier values
 * - Duplicate detection
 * - Quality scoring
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Same validation rules as food-search-v2
const NUTRITIONAL_LIMITS = {
  calories: { min: 0, max: 2000 },
  protein_g: { min: 0, max: 100 },
  carbs_g: { min: 0, max: 200 },
  fat_g: { min: 0, max: 100 }
};

const CATEGORY_KEYWORDS = {
  "Meat & Poultry": ["chicken", "beef", "pork", "turkey", "meat", "steak", "ground"],
  "Seafood": ["fish", "salmon", "tuna", "shrimp", "crab", "lobster", "cod"],
  "Dairy & Eggs": ["milk", "cheese", "yogurt", "egg", "butter", "cream"],
  "Grains, Bread & Pasta": ["rice", "bread", "pasta", "oats", "cereal", "chip", "cracker"],
  "Protein & Supplements": ["protein", "whey", "casein", "supplement", "powder"],
  "Fruits": ["apple", "banana", "orange", "berry", "grape", "fruit"],
  "Vegetables": ["broccoli", "spinach", "carrot", "tomato", "lettuce", "vegetable"],
  "Beverages": ["coffee", "tea", "water", "juice", "soda", "drink"],
  "Desserts & Sweets": ["cake", "cookie", "ice cream", "candy", "chocolate", "sweet"]
};

interface AuditResult {
  total_foods: number;
  total_servings: number;
  quality_issues: {
    nutritional_outliers: any[];
    calorie_inconsistencies: any[];
    category_mismatches: any[];
    potential_duplicates: any[];
    missing_data: any[];
  };
  category_distribution: any;
  recommendations: string[];
}

function analyzeNutrition(serving: any): { issues: string[], score: number } {
  const issues: string[] = [];
  let score = 100;

  // Check ranges
  for (const [nutrient, limits] of Object.entries(NUTRITIONAL_LIMITS)) {
    const value = serving[nutrient];
    if (value !== null && value !== undefined) {
      if (value < limits.min || value > limits.max) {
        issues.push(`${nutrient} out of range: ${value}`);
        score -= 20;
      }
    }
  }

  // Calorie consistency
  const estimatedCalories = (serving.carbs_g || 0) * 4 + (serving.protein_g || 0) * 4 + (serving.fat_g || 0) * 9;
  const actualCalories = serving.calories || 0;
  const difference = Math.abs(estimatedCalories - actualCalories);
  
  if (actualCalories > 0 && difference > actualCalories * 0.3) {
    issues.push(`Calorie mismatch: ${actualCalories} vs estimated ${Math.round(estimatedCalories)}`);
    score -= 15;
  }

  return { issues, score };
}

function suggestCategory(foodName: string): string | null {
  const name = foodName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return category;
    }
  }
  
  return null;
}

function findPotentialDuplicates(foods: any[]): any[] {
  const duplicates = [];
  
  for (let i = 0; i < foods.length; i++) {
    for (let j = i + 1; j < foods.length; j++) {
      const similarity = calculateSimilarity(foods[i].name, foods[j].name);
      if (similarity > 0.8) {
        duplicates.push({
          food1: foods[i],
          food2: foods[j],
          similarity: similarity
        });
      }
    }
  }
  
  return duplicates;
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all foods with their servings
    const { data: foods, error } = await supabaseAdmin
      .from('foods')
      .select('*, food_servings(*)')
      .order('id');

    if (error) throw error;

    const auditResult: AuditResult = {
      total_foods: foods.length,
      total_servings: foods.reduce((sum, food) => sum + food.food_servings.length, 0),
      quality_issues: {
        nutritional_outliers: [],
        calorie_inconsistencies: [],
        category_mismatches: [],
        potential_duplicates: [],
        missing_data: []
      },
      category_distribution: {},
      recommendations: []
    };

    // Analyze each food and its servings
    for (const food of foods) {
      // Category analysis
      const suggestedCategory = suggestCategory(food.name);
      if (suggestedCategory && suggestedCategory !== food.category) {
        auditResult.quality_issues.category_mismatches.push({
          food_id: food.id,
          name: food.name,
          current_category: food.category,
          suggested_category: suggestedCategory
        });
      }

      // Count categories
      const category = food.category || 'Uncategorized';
      auditResult.category_distribution[category] = (auditResult.category_distribution[category] || 0) + 1;

      // Analyze servings
      for (const serving of food.food_servings) {
        const analysis = analyzeNutrition(serving);
        
        if (analysis.issues.length > 0) {
          auditResult.quality_issues.nutritional_outliers.push({
            food_id: food.id,
            serving_id: serving.id,
            food_name: food.name,
            serving_description: serving.serving_description,
            issues: analysis.issues,
            quality_score: analysis.score
          });
        }

        // Check for missing data
        const requiredFields = ['calories', 'protein_g', 'carbs_g', 'fat_g'];
        const missingFields = requiredFields.filter(field => 
          serving[field] === null || serving[field] === undefined
        );
        
        if (missingFields.length > 0) {
          auditResult.quality_issues.missing_data.push({
            food_id: food.id,
            serving_id: serving.id,
            food_name: food.name,
            missing_fields: missingFields
          });
        }
      }
    }

    // Find potential duplicates
    auditResult.quality_issues.potential_duplicates = findPotentialDuplicates(foods);

    // Generate recommendations
    const recommendations = [];
    
    if (auditResult.quality_issues.category_mismatches.length > 0) {
      recommendations.push(`Review ${auditResult.quality_issues.category_mismatches.length} foods with potential category mismatches`);
    }
    
    if (auditResult.quality_issues.nutritional_outliers.length > 0) {
      recommendations.push(`Investigate ${auditResult.quality_issues.nutritional_outliers.length} servings with nutritional inconsistencies`);
    }
    
    if (auditResult.quality_issues.potential_duplicates.length > 0) {
      recommendations.push(`Consider merging ${auditResult.quality_issues.potential_duplicates.length} potential duplicate foods`);
    }
    
    if (auditResult.quality_issues.missing_data.length > 0) {
      recommendations.push(`Complete missing nutritional data for ${auditResult.quality_issues.missing_data.length} servings`);
    }

    auditResult.recommendations = recommendations;

    return new Response(JSON.stringify(auditResult, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});