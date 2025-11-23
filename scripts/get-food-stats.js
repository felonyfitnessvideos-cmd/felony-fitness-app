/**
 * Get accurate food_servings database statistics
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wkmrdelhoeqhsdifrarn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getAccurateStats() {
  console.log('📊 Getting accurate food_servings statistics...\n');
  
  // Get total count
  const { count: totalCount, error: totalError } = await supabase
    .from('food_servings')
    .select('*', { count: 'exact', head: true });
  
  if (totalError) {
    console.error('Error getting total:', totalError);
    return;
  }
  
  console.log(`Total Foods: ${totalCount}\n`);
  
  // Get counts by enrichment_status
  const statuses = ['completed', 'failed', 'pending', 'processing', null];
  
  console.log('Enrichment Status Distribution:');
  for (const status of statuses) {
    let query = supabase
      .from('food_servings')
      .select('*', { count: 'exact', head: true });
    
    if (status === null) {
      query = query.is('enrichment_status', null);
    } else {
      query = query.eq('enrichment_status', status);
    }
    
    const { count } = await query;
    const percentage = totalCount > 0 ? (count / totalCount * 100).toFixed(1) : 0;
    const label = status === null ? 'null (never enriched)' : status;
    console.log(`   ${label}: ${count} (${percentage}%)`);
  }
  
  // Get quality score distribution
  console.log('\n\nQuality Score Distribution:');
  
  const { data: qualityData } = await supabase
    .from('food_servings')
    .select('quality_score');
  
  if (qualityData) {
    const scores = qualityData.map(f => f.quality_score || 0);
    const highQuality = scores.filter(s => s >= 70).length;
    const mediumQuality = scores.filter(s => s >= 50 && s < 70).length;
    const lowQuality = scores.filter(s => s > 0 && s < 50).length;
    const noScore = scores.filter(s => s === 0 || s === null).length;
    
    console.log(`   High (70-100): ${highQuality} (${(highQuality/totalCount*100).toFixed(1)}%)`);
    console.log(`   Medium (50-69): ${mediumQuality} (${(mediumQuality/totalCount*100).toFixed(1)}%)`);
    console.log(`   Low (1-49): ${lowQuality} (${(lowQuality/totalCount*100).toFixed(1)}%)`);
    console.log(`   No Score (0): ${noScore} (${(noScore/totalCount*100).toFixed(1)}%)`);
    console.log(`   Average Score: ${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)}`);
  }
  
  // Get source distribution
  console.log('\n\nData Source Distribution:');
  const { data: sourceData } = await supabase
    .from('food_servings')
    .select('source');
  
  if (sourceData) {
    const sourceMap = sourceData.reduce((acc, f) => {
      const source = f.source || 'null';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(sourceMap)
      .sort((a, b) => b[1] - a[1])
      .forEach(([source, count]) => {
        console.log(`   ${source}: ${count} (${(count/totalCount*100).toFixed(1)}%)`);
      });
  }
  
  // Check for data completeness
  console.log('\n\nData Completeness:');
  
  const { data: allFoods } = await supabase
    .from('food_servings')
    .select('calories, protein_g, carbs_g, fat_g');
  
  if (allFoods) {
    const hasAllMacros = allFoods.filter(f => 
      f.calories !== null && f.protein_g !== null && f.carbs_g !== null && f.fat_g !== null
    ).length;
    
    const hasNutrition = allFoods.filter(f => 
      f.calories !== null || f.protein_g !== null || f.carbs_g !== null || f.fat_g !== null
    ).length;
    
    const emptyNutrition = allFoods.filter(f => 
      f.calories === null && f.protein_g === null && f.carbs_g === null && f.fat_g === null
    ).length;
    
    console.log(`   Complete Macros (all 4 fields): ${hasAllMacros} (${(hasAllMacros/totalCount*100).toFixed(1)}%)`);
    console.log(`   Partial Data (at least 1 field): ${hasNutrition} (${(hasNutrition/totalCount*100).toFixed(1)}%)`);
    console.log(`   Empty (no nutrition data): ${emptyNutrition} (${(emptyNutrition/totalCount*100).toFixed(1)}%)`);
  }
  
  console.log('\n✅ Statistics Complete!');
}

getAccurateStats().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
