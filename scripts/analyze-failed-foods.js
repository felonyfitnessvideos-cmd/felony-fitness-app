/**
 * Analyze failed food enrichments to understand failure patterns
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wkmrdelhoeqhsdifrarn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeFailed() {
  console.log('🔍 Analyzing failed food enrichments...\n');
  
  // Get all failed foods
  const { data: failedFoods, error } = await supabase
    .from('food_servings')
    .select('*')
    .eq('enrichment_status', 'failed')
    .order('last_enrichment', { ascending: false });
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`📊 Total Failed Foods: ${failedFoods.length}\n`);
  
  // Pattern 1: Check if they all have empty nutrition data
  const emptyNutrition = failedFoods.filter(f => 
    !f.calories && !f.protein_g && !f.carbs_g && !f.fat_g
  );
  
  console.log(`\n📉 Pattern: Empty Nutrition Data`);
  console.log(`   Count: ${emptyNutrition.length}/${failedFoods.length} (${(emptyNutrition.length/failedFoods.length*100).toFixed(1)}%)`);
  console.log(`   Likely Cause: Foods added without ANY nutritional data - AI cannot infer from nothing`);
  
  // Pattern 2: Check data source distribution
  const sourceMap = failedFoods.reduce((acc, f) => {
    acc[f.source] = (acc[f.source] || 0) + 1;
    return acc;
  }, {});
  
  console.log(`\n📚 Data Sources:`);
  Object.entries(sourceMap).forEach(([source, count]) => {
    console.log(`   ${source}: ${count} (${(count/failedFoods.length*100).toFixed(1)}%)`);
  });
  
  // Pattern 3: Name characteristics (too vague, too specific, etc.)
  const hasNFS = failedFoods.filter(f => f.food_name.includes('NFS'));
  const hasBeverages = failedFoods.filter(f => 
    f.food_name.toLowerCase().includes('water') ||
    f.food_name.toLowerCase().includes('coffee') ||
    f.food_name.toLowerCase().includes('tea') ||
    f.food_name.toLowerCase().includes('drink') ||
    f.food_name.toLowerCase().includes('juice')
  );
  
  console.log(`\n🏷️  Name Patterns:`);
  console.log(`   "NFS" (Not Further Specified): ${hasNFS.length} (${(hasNFS.length/failedFoods.length*100).toFixed(1)}%)`);
  console.log(`   Beverages: ${hasBeverages.length} (${(hasBeverages.length/failedFoods.length*100).toFixed(1)}%)`);
  
  // Pattern 4: When did they fail? (check time distribution)
  const recentFailures = failedFoods.filter(f => {
    const hoursSinceFailure = (Date.now() - new Date(f.last_enrichment).getTime()) / (1000 * 60 * 60);
    return hoursSinceFailure < 24;
  });
  
  console.log(`\n⏰ Failure Timing:`);
  console.log(`   Last 24 hours: ${recentFailures.length}`);
  console.log(`   Older than 24h: ${failedFoods.length - recentFailures.length}`);
  
  // Pattern 5: Sample of most recent failures for detailed inspection
  console.log(`\n\n🔬 Most Recent Failures (Last 10):`);
  failedFoods.slice(0, 10).forEach((food, idx) => {
    const hoursAgo = Math.floor((Date.now() - new Date(food.last_enrichment).getTime()) / (1000 * 60 * 60));
    console.log(`\n   ${idx + 1}. ${food.food_name}`);
    console.log(`      Failed: ${hoursAgo}h ago (${new Date(food.last_enrichment).toLocaleString()})`);
    console.log(`      Source: ${food.source}`);
    console.log(`      Data: Cal=${food.calories ?? 'null'}, P=${food.protein_g ?? 'null'}g, C=${food.carbs_g ?? 'null'}g, F=${food.fat_g ?? 'null'}g`);
    console.log(`      Serving: ${food.serving_description || 'null'}`);
  });
  
  // Recommendations
  console.log(`\n\n💡 Recommendations:`);
  
  if (emptyNutrition.length > failedFoods.length * 0.8) {
    console.log(`\n   ⚠️  MAJOR ISSUE: ${(emptyNutrition.length/failedFoods.length*100).toFixed(0)}% of failures have ZERO nutrition data`);
    console.log(`   
   The AI enrichment worker requires at least SOME data to work with.
   These foods were likely added manually without any nutritional info.
   
   Solutions:
   1. Prevent users from adding foods without at least calories + macros
   2. Add a "food data entry wizard" that guides users through USDA lookup first
   3. Set failed foods with empty data to "requires_manual_entry" status
   4. Create a separate workflow for these (manual data entry or delete)`);
  }
  
  if (hasNFS.length > failedFoods.length * 0.3) {
    console.log(`\n   ⚠️  ${hasNFS.length} foods are "NFS" (Not Further Specified) - too vague for AI`);
    console.log(`   Solution: Flag NFS foods and suggest users select more specific variants`);
  }
  
  if (hasBeverages.length > 10) {
    console.log(`\n   ⚠️  ${hasBeverages.length} beverage failures - likely zero-calorie drinks`);
    console.log(`   Solution: Create beverage templates (water=0, black coffee=2, etc.)`);
  }
  
  console.log(`\n\n✅ Analysis Complete!`);
}

analyzeFailed().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
