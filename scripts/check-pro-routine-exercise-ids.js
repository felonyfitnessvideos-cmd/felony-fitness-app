/*
Diagnostic script: check-pro-routine-exercise-ids.js

Purpose:
- Query the `pro_routines` table and collect all exercise_ids referenced in the JSON `exercises` array.
- Query the `exercises` table to see which IDs are missing.
- Print a report showing which pro_routines reference missing IDs so you can decide how to fix them.

Usage:
- Requires SUPABASE_URL and SUPABASE_SERVICE_KEY (service role key) in env.
- Run: node scripts/check-pro-routine-exercise-ids.js
*/

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function main() {
  console.log('Fetching pro_routines...');
  const { data: routines, error: routinesError } = await supabase.from('pro_routines').select('id, name, exercises');
  if (routinesError) {
    console.error('Error fetching pro_routines:', routinesError);
    process.exit(1);
  }

  // Collect referenced exercise IDs
  const referencedIds = new Set();
  const routineMap = new Map(); // routineId -> array of ids

  for (const r of routines || []) {
    let ids = [];
    try {
      const arr = Array.isArray(r.exercises) ? r.exercises : JSON.parse(r.exercises);
      ids = arr.map(item => item?.exercise_id || item?.id || (item?.exercises && item.exercises.id)).filter(Boolean);
    } catch (e) {
      // If exercises stored as JSONB it'll already be an array; otherwise try parse
      console.warn(`Could not parse exercises for pro_routine ${r.id} (${r.name}):`, e.message || e);
    }
    routineMap.set(r.id, { name: r.name, ids });
    ids.forEach(id => referencedIds.add(id));
  }

  if (referencedIds.size === 0) {
    console.log('No exercise IDs referenced in pro_routines found.');
    process.exit(0);
  }

  console.log(`Found ${referencedIds.size} unique referenced exercise IDs. Checking which exist in exercises table...`);

  // Query exercises table for those IDs in batches (in() supports up to some limit)
  const idsArray = Array.from(referencedIds);
  const missing = new Set(referencedIds);

  const batchSize = 100;
  for (let i = 0; i < idsArray.length; i += batchSize) {
    const chunk = idsArray.slice(i, i + batchSize);
    const { data: found, error } = await supabase.from('exercises').select('id, name').in('id', chunk);
    if (error) {
      console.error('Error querying exercises:', error);
      process.exit(1);
    }
    (found || []).forEach(f => missing.delete(f.id));
  }

  if (missing.size === 0) {
    console.log('All referenced exercise IDs exist in the `exercises` table.');
    process.exit(0);
  }

  console.log(`Missing ${missing.size} exercise IDs. Listing routines that reference them:`);
  for (const [routineId, info] of routineMap) {
    const bad = info.ids.filter(id => missing.has(id));
    if (bad.length > 0) {
      console.log(`- Routine: ${info.name} (${routineId})`);
      bad.forEach(id => console.log(`  - missing id: ${id}`));
    }
  }

  console.log('\nSuggested fixes:');
  console.log('1) If these IDs should exist, update your `exercises` table to include rows with these UUIDs (seed them with explicit ids).');
  console.log("2) Or, if the pro_routines were authored with old/incorrect IDs, update the entries in `pro_routines.exercises` to use the current `exercises.id` values (you may need a manual mapping by exercise name).");
  console.log('3) For a programmatic fix: export pro_routines, add exercise names to the JSON, and then re-run a migration that resolves names->ids and updates the pro_routines rows.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
