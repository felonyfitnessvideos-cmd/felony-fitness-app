/**
 * @file scripts/reset-failed-enrichments.js
 * @description Reset failed food enrichments to pending status so workers can retry
 * 
 * Run this manually or on a schedule to give failed foods another chance
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function resetFailedEnrichments() {
  console.log('\n🔄 Resetting Failed Food Enrichments...\n');

  // Get current failed count
  const { count: beforeCount } = await supabase
    .from('food_servings')
    .select('id', { count: 'exact', head: true })
    .eq('enrichment_status', 'failed');

  console.log(`Found ${beforeCount} failed foods\n`);

  if (beforeCount === 0) {
    console.log('✅ No failed foods to reset');
    return;
  }

  // Reset failed foods that are older than 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: resetFoods, error } = await supabase
    .from('food_servings')
    .update({ 
      enrichment_status: 'pending',
      last_enrichment: null 
    })
    .eq('enrichment_status', 'failed')
    .lt('last_enrichment', twentyFourHoursAgo)
    .select('id, food_name, last_enrichment');

  if (error) {
    console.error('❌ Error resetting failed foods:', error);
    return;
  }

  console.log(`✅ Reset ${resetFoods?.length || 0} failed foods to pending status\n`);

  if (resetFoods && resetFoods.length > 0) {
    console.log('Sample foods reset (first 10):');
    resetFoods.slice(0, 10).forEach((food, idx) => {
      console.log(`  ${idx + 1}. ${food.food_name}`);
      console.log(`     Last attempt: ${food.last_enrichment}`);
    });
    console.log('');
  }

  // Get updated status
  const { count: afterCount } = await supabase
    .from('food_servings')
    .select('id', { count: 'exact', head: true })
    .eq('enrichment_status', 'failed');

  console.log(`Failed foods remaining: ${afterCount}`);
  console.log(`(Foods failed within last 24 hours will retry tomorrow)\n`);
}

resetFailedEnrichments().catch(console.error);
