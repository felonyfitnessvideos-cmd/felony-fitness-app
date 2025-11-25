/**
 * @file scripts/check-verification-status.js
 * @description Monitor verification worker progress and flag status
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkVerificationStatus() {
  console.log('\n🔍 Checking Verification Status...\n');

  // Get verification statistics
  const { data: stats, error: statsError } = await supabase
    .rpc('get_verification_stats');

  if (statsError) {
    console.error('Error fetching stats:', statsError);
  } else if (stats && stats.length > 0) {
    const s = stats[0];
    console.log('═══════════════════════════════════════════');
    console.log('📊 VERIFICATION STATISTICS');
    console.log('═══════════════════════════════════════════');
    console.log(`Total foods:              ${s.total_foods}`);
    console.log(`✅ Verified:              ${s.verified_foods} (${s.verification_rate}%)`);
    console.log(`⚠️  Needs review:          ${s.needs_review_foods}`);
    console.log(`⏳ Pending verification:  ${s.pending_verification_foods}`);
    console.log('');
  }

  // Get breakdown by enrichment status
  const { data: statusBreakdown, error: statusError } = await supabase
    .from('food_servings')
    .select('enrichment_status, is_verified')
    .not('enrichment_status', 'is', null);

  if (!statusError && statusBreakdown) {
    const grouped = statusBreakdown.reduce((acc, food) => {
      const status = food.enrichment_status || 'unknown';
      const verified = food.is_verified ? 'verified' : 'unverified';
      const key = `${status}_${verified}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    console.log('═══════════════════════════════════════════');
    console.log('📈 BREAKDOWN BY STATUS');
    console.log('═══════════════════════════════════════════');
    Object.entries(grouped).forEach(([key, count]) => {
      console.log(`${key}: ${count}`);
    });
    console.log('');
  }

  // Get foods flagged for review (top 20)
  const { data: flagged, error: flaggedError } = await supabase
    .from('food_servings')
    .select('food_name, review_flags, last_verification')
    .eq('needs_review', true)
    .order('last_verification', { ascending: false })
    .limit(20);

  if (!flaggedError && flagged && flagged.length > 0) {
    console.log('═══════════════════════════════════════════');
    console.log('⚠️  FOODS FLAGGED FOR REVIEW (Top 20)');
    console.log('═══════════════════════════════════════════');
    flagged.forEach((food, idx) => {
      console.log(`\n${idx + 1}. ${food.food_name}`);
      console.log(`   Flags: ${food.review_flags?.join(', ') || 'none'}`);
      console.log(`   Last check: ${food.last_verification || 'never'}`);
    });
    console.log('');
  }

  // Get recent verifications (top 10)
  const { data: recentVerified, error: recentError } = await supabase
    .from('food_servings')
    .select('food_name, quality_score, last_verification')
    .eq('is_verified', true)
    .not('last_verification', 'is', null)
    .order('last_verification', { ascending: false })
    .limit(10);

  if (!recentError && recentVerified && recentVerified.length > 0) {
    console.log('═══════════════════════════════════════════');
    console.log('✅ RECENTLY VERIFIED (Top 10)');
    console.log('═══════════════════════════════════════════');
    recentVerified.forEach((food, idx) => {
      const timestamp = new Date(food.last_verification).toLocaleString();
      console.log(`${idx + 1}. ${food.food_name}`);
      console.log(`   Quality: ${food.quality_score} | ${timestamp}`);
    });
    console.log('');
  }

  // Get verification queue status
  const { data: queue, error: queueError } = await supabase
    .from('food_servings')
    .select('quality_score')
    .in('enrichment_status', ['completed', 'verified'])
    .or('is_verified.is.null,is_verified.eq.false')
    .limit(100);

  if (!queueError && queue) {
    console.log('═══════════════════════════════════════════');
    console.log('📋 VERIFICATION QUEUE');
    console.log('═══════════════════════════════════════════');
    console.log(`Foods in queue: ${queue.length}`);
    
    if (queue.length > 0) {
      const avgQuality = queue.reduce((sum, f) => sum + (f.quality_score || 0), 0) / queue.length;
      const highQuality = queue.filter(f => f.quality_score >= 90).length;
      const medQuality = queue.filter(f => f.quality_score >= 70 && f.quality_score < 90).length;
      const lowQuality = queue.filter(f => f.quality_score < 70).length;

      console.log(`Average quality: ${avgQuality.toFixed(1)}`);
      console.log(`High quality (≥90): ${highQuality}`);
      console.log(`Medium quality (70-89): ${medQuality}`);
      console.log(`Low quality (<70): ${lowQuality}`);
    }
    console.log('');
  }

  // Recommendations
  console.log('═══════════════════════════════════════════');
  console.log('💡 RECOMMENDATIONS');
  console.log('═══════════════════════════════════════════');

  if (stats && stats[0]) {
    const s = stats[0];
    
    if (s.needs_review_foods > 50) {
      console.log('⚠️  High number of foods flagged for review');
      console.log('   → Review flagged foods and correct data issues');
    }
    
    if (s.pending_verification_foods > 1000) {
      console.log('⏳ Large verification queue');
      console.log(`   → At 5 foods/2min, will take ~${Math.ceil(s.pending_verification_foods / 5 * 2 / 60)} hours`);
    } else if (s.pending_verification_foods > 0) {
      console.log(`⏳ ${s.pending_verification_foods} foods pending verification`);
      console.log(`   → At 5 foods/2min, will take ~${Math.ceil(s.pending_verification_foods / 5 * 2)} minutes`);
    }
    
    if (s.verification_rate >= 95) {
      console.log('✅ Excellent verification coverage!');
    } else if (s.verification_rate >= 80) {
      console.log('✅ Good verification coverage');
    } else if (s.verification_rate >= 50) {
      console.log('⚠️  Moderate verification coverage');
      console.log('   → Consider reviewing verification logic or queue');
    } else {
      console.log('⚠️  Low verification coverage');
      console.log('   → Verification worker may need attention');
    }
  }

  console.log('');
}

checkVerificationStatus().catch(console.error);
