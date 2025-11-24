/**
 * @file scripts/check-enrichment-queue.js
 * @description Check how many foods actually need enrichment
 * 
 * CRITICAL CHECK: Are workers wasting resources on already-complete foods?
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkQueue() {
  console.log('\n🔍 Checking Enrichment Queue Status...\n');

  // Total foods
  const { count: total } = await supabase
    .from('food_servings')
    .select('id', { count: 'exact', head: true });

  // Completed foods
  const { count: completed } = await supabase
    .from('food_servings')
    .select('id', { count: 'exact', head: true })
    .eq('enrichment_status', 'completed');

  // Pending foods (null or pending status)
  const { count: pending } = await supabase
    .from('food_servings')
    .select('id', { count: 'exact', head: true })
    .or('enrichment_status.is.null,enrichment_status.eq.pending');

  // Failed foods
  const { count: failed } = await supabase
    .from('food_servings')
    .select('id', { count: 'exact', head: true })
    .eq('enrichment_status', 'failed');

  // Processing foods
  const { count: processing } = await supabase
    .from('food_servings')
    .select('id', { count: 'exact', head: true })
    .eq('enrichment_status', 'processing');

  // Foods with USDA source
  const { count: usdaSource } = await supabase
    .from('food_servings')
    .select('id', { count: 'exact', head: true })
    .eq('data_sources', 'USDA');

  // Foods with complete nutrition (all macros present)
  const { count: completeNutrition } = await supabase
    .from('food_servings')
    .select('id', { count: 'exact', head: true })
    .not('calories', 'is', null)
    .not('protein_g', 'is', null)
    .not('carbs_g', 'is', null)
    .not('fat_g', 'is', null);

  console.log('═══════════════════════════════════════════');
  console.log('📊 ENRICHMENT QUEUE STATUS');
  console.log('═══════════════════════════════════════════');
  console.log(`Total foods:          ${total}`);
  console.log(`✅ Completed:         ${completed} (${(completed/total*100).toFixed(1)}%)`);
  console.log(`⏳ Pending:           ${pending}`);
  console.log(`⚙️  Processing:        ${processing}`);
  console.log(`❌ Failed:            ${failed}`);
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('📈 DATA QUALITY METRICS');
  console.log('═══════════════════════════════════════════');
  console.log(`USDA source:          ${usdaSource} (${(usdaSource/total*100).toFixed(1)}%)`);
  console.log(`Complete nutrition:   ${completeNutrition} (${(completeNutrition/total*100).toFixed(1)}%)`);
  console.log('');

  // Analysis
  if (pending === 0 && failed === 0) {
    console.log('═══════════════════════════════════════════');
    console.log('🎉 RESULT: ALL FOODS ARE ENRICHED!');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('⚠️  WARNING: Enrichment workers are running unnecessarily!');
    console.log('');
    console.log('💡 RECOMMENDATION:');
    console.log('   → Disable scheduled cron jobs in GitHub Actions workflows');
    console.log('   → Keep manual triggers for future use');
    console.log('   → Save GitHub Actions minutes (currently ~720 min/day wasted)');
    console.log('   → Preserve USDA API rate limits (~300 calls/day wasted)');
    console.log('');
    console.log('📁 Files to update:');
    console.log('   1. .github/workflows/nutrition-enrichment.yml');
    console.log('   2. .github/workflows/nutrition-enrichment-worker-2.yml');
    console.log('   3. .github/workflows/nutrition-enrichment-worker-3.yml');
    console.log('');
    console.log('🔧 Change: Comment out "schedule" section, keep "workflow_dispatch"');
    console.log('');
  } else {
    console.log('═══════════════════════════════════════════');
    console.log('⚙️  RESULT: ENRICHMENT QUEUE ACTIVE');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log(`${pending + failed} foods need enrichment work`);
    console.log('Workers should continue running');
    console.log('');
  }

  // Sample pending foods (if any)
  if (pending > 0 || failed > 0) {
    console.log('═══════════════════════════════════════════');
    console.log('📋 SAMPLE FOODS NEEDING WORK (first 10):');
    console.log('═══════════════════════════════════════════');
    
    const { data: samples } = await supabase
      .from('food_servings')
      .select('id, food_name, enrichment_status, calories, protein_g, carbs_g, fat_g, data_sources')
      .or('enrichment_status.is.null,enrichment_status.eq.pending,enrichment_status.eq.failed')
      .limit(10);

    if (samples) {
      samples.forEach((food, idx) => {
        console.log(`\n${idx + 1}. ${food.food_name}`);
        console.log(`   Status: ${food.enrichment_status || 'null'}`);
        console.log(`   Data: ${food.calories || '?'} cal, ${food.protein_g || '?'}g protein, ${food.carbs_g || '?'}g carbs, ${food.fat_g || '?'}g fat`);
        console.log(`   Source: ${food.data_sources || 'none'}`);
      });
    }
    console.log('');
  }
}

checkQueue().catch(console.error);
