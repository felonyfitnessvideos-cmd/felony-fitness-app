/**
 * @file audit-foods-nutrients.js
 * @description Audit foods table for missing micronutrient data
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
  console.error('\nMake sure these are set in .env or .env.local file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('\n🔍 FOOD DATABASE NUTRIENT AUDIT');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

async function runAudit() {
  try {
    // 1. Overall Statistics
    console.log('📊 OVERALL STATISTICS');
    console.log('─────────────────────\n');
    
    const { error: statsError } = await supabase.rpc('get_food_stats');
    
    if (statsError) {
      // Fallback: Direct query
      const { count: totalCount } = await supabase.from('foods').select('*', { count: 'exact', head: true });
      const { count: usdaCount } = await supabase.from('foods').select('*', { count: 'exact', head: true }).eq('data_source', 'USDA');
      
      console.log(`Total Foods: ${totalCount}`);
      console.log(`USDA Foods: ${usdaCount}`);
    }
    
    // 2. Sample foods with missing data
    console.log('\n\n🔥 HIGH PRIORITY - Most Logged Foods Missing Data');
    console.log('─────────────────────────────────────────────────\n');
    
    const { data: missingFoods, error: missingError } = await supabase
      .from('foods')
      .select('id, name, brand_owner, times_logged, last_logged_at, sodium_mg, calcium_mg, iron_mg, vitamin_c_mg, vitamin_d_mcg')
      .gt('times_logged', 0)
      .or('sodium_mg.eq.0,calcium_mg.eq.0,iron_mg.eq.0,vitamin_c_mg.eq.0,vitamin_d_mcg.eq.0')
      .order('times_logged', { ascending: false })
      .limit(20);
    
    if (missingError) {
      console.error('Error fetching missing foods:', missingError);
    } else {
      console.table(missingFoods.map(f => ({
        ID: f.id,
        Name: f.name.substring(0, 40),
        Brand: f.brand_owner?.substring(0, 20) || 'N/A',
        Logged: f.times_logged,
        'Missing Sodium': f.sodium_mg === 0 ? '❌' : '✓',
        'Missing Calcium': f.calcium_mg === 0 ? '❌' : '✓',
        'Missing Iron': f.iron_mg === 0 ? '❌' : '✓',
        'Missing Vit C': f.vitamin_c_mg === 0 ? '❌' : '✓',
        'Missing Vit D': f.vitamin_d_mcg === 0 ? '❌' : '✓'
      })));
    }
    
    // 3. Completeness percentages
    console.log('\n\n⚡ MICRONUTRIENT COMPLETENESS');
    console.log('────────────────────────────────\n');
    
    const { data: allFoods } = await supabase
      .from('foods')
      .select('sodium_mg, potassium_mg, calcium_mg, iron_mg, magnesium_mg, zinc_mg, vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg, vitamin_b12_mcg');
    
    if (allFoods) {
      const total = allFoods.length;
      const completeness = {
        'Sodium': allFoods.filter(f => f.sodium_mg > 0).length,
        'Potassium': allFoods.filter(f => f.potassium_mg > 0).length,
        'Calcium': allFoods.filter(f => f.calcium_mg > 0).length,
        'Iron': allFoods.filter(f => f.iron_mg > 0).length,
        'Magnesium': allFoods.filter(f => f.magnesium_mg > 0).length,
        'Zinc': allFoods.filter(f => f.zinc_mg > 0).length,
        'Vitamin A': allFoods.filter(f => f.vitamin_a_mcg > 0).length,
        'Vitamin C': allFoods.filter(f => f.vitamin_c_mg > 0).length,
        'Vitamin D': allFoods.filter(f => f.vitamin_d_mcg > 0).length,
        'Vitamin B12': allFoods.filter(f => f.vitamin_b12_mcg > 0).length,
      };
      
      console.table(Object.entries(completeness).map(([nutrient, count]) => ({
        Nutrient: nutrient,
        'Foods with Data': count,
        'Missing Data': total - count,
        'Completeness %': ((count / total) * 100).toFixed(1) + '%'
      })));
    }
    
    // 4. Enrichment Strategy
    console.log('\n\n📋 ENRICHMENT STRATEGY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🎯 Priority Tiers:');
    console.log('  TIER 1: Foods logged 10+ times (CRITICAL)');
    console.log('  TIER 2: Foods logged 5-9 times (HIGH)');
    console.log('  TIER 3: Foods logged 1-4 times (MEDIUM)');
    console.log('  TIER 4: Never logged (LOW)\n');
    
    await supabase.rpc('get_foods_by_tier');
    
    // Fallback: Manual tier counting
    const tier1 = await supabase.from('foods').select('id', { count: 'exact', head: true }).gte('times_logged', 10);
    const tier2 = await supabase.from('foods').select('id', { count: 'exact', head: true }).gte('times_logged', 5).lt('times_logged', 10);
    const tier3 = await supabase.from('foods').select('id', { count: 'exact', head: true }).gte('times_logged', 1).lt('times_logged', 5);
    const tier4 = await supabase.from('foods').select('id', { count: 'exact', head: true }).eq('times_logged', 0);
    
    console.log(`  Tier 1 (10+ logs): ${tier1.count} foods`);
    console.log(`  Tier 2 (5-9 logs): ${tier2.count} foods`);
    console.log(`  Tier 3 (1-4 logs): ${tier3.count} foods`);
    console.log(`  Tier 4 (0 logs): ${tier4.count} foods\n`);
    
    console.log('🔄 Recommended Actions:');
    console.log('  1️⃣  Run USDA enrichment on Tier 1 foods');
    console.log('  2️⃣  Bulk import from local USDA CSV files');
    console.log('  3️⃣  Manual review for branded foods');
    console.log('  4️⃣  Consider cleanup of never-logged foods\n');
    
    console.log('✅ Audit complete!\n');
    
  } catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
  }
}

runAudit();
