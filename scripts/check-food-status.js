/**
 * Check food_servings enrichment status
 * Run with: node scripts/check-food-status.js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wkmrdelhoeqhsdifrarn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXJkZWxob2VxaHNkaWZyYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjYxNzIsImV4cCI6MjA3MzIwMjE3Mn0.izD-ENFv1ufuNFbUF8KSWLCP3hpOtjkPDoIuOUXGXFQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFoodStatus() {
  console.log('🔍 Checking food_servings enrichment status...\n');
  
  // Get overall stats
  const { data: stats, error: statsError } = await supabase.rpc('get_food_enrichment_stats');
  
  if (statsError) {
    // If RPC doesn't exist, query directly
    const { data, error } = await supabase
      .from('food_servings')
      .select('enrichment_status, quality_score');
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    const total = data.length;
    const enriched = data.filter(f => f.enrichment_status === 'enriched').length;
    const pending = data.filter(f => f.enrichment_status === 'pending').length;
    const failed = data.filter(f => f.enrichment_status === 'failed').length;
    const highQuality = data.filter(f => f.quality_score >= 70).length;
    const avgQuality = data.reduce((sum, f) => sum + (f.quality_score || 0), 0) / total;
    
    console.log('📊 Overall Statistics:');
    console.log(`   Total Foods: ${total}`);
    console.log(`   Enriched: ${enriched} (${(enriched/total*100).toFixed(1)}%)`);
    console.log(`   Pending: ${pending} (${(pending/total*100).toFixed(1)}%)`);
    console.log(`   Failed: ${failed} (${(failed/total*100).toFixed(1)}%)`);
    console.log(`   High Quality (≥70): ${highQuality} (${(highQuality/total*100).toFixed(1)}%)`);
    console.log(`   Average Quality Score: ${avgQuality.toFixed(2)}`);
  } else {
    console.log('📊 Stats:', stats);
  }
  
  // Get recent enrichments
  console.log('\n\n🕐 Recent Enrichment Activity (Last 10):');
  const { data: recent, error: recentError } = await supabase
    .from('food_servings')
    .select('food_name, enrichment_status, quality_score, last_enriched_at')
    .eq('enrichment_status', 'enriched')
    .order('last_enriched_at', { ascending: false })
    .limit(10);
    
  if (recentError) {
    console.error('❌ Error:', recentError);
  } else {
    recent.forEach((food, idx) => {
      const date = new Date(food.last_enriched_at).toLocaleString();
      console.log(`   ${idx + 1}. ${food.food_name} (Score: ${food.quality_score}) - ${date}`);
    });
  }
  
  // Check for any failed enrichments
  console.log('\n\n⚠️  Failed Enrichments:');
  const { data: failedFoods, error: failedError } = await supabase
    .from('food_servings')
    .select('food_name, enrichment_status')
    .eq('enrichment_status', 'failed')
    .limit(10);
    
  if (failedError) {
    console.error('❌ Error:', failedError);
  } else if (failedFoods.length === 0) {
    console.log('   ✅ No failed enrichments!');
  } else {
    failedFoods.forEach((food, idx) => {
      console.log(`   ${idx + 1}. ${food.food_name}`);
    });
  }
}

checkFoodStatus().then(() => {
  console.log('\n✅ Check complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
