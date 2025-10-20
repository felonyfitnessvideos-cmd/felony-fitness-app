// scripts/parse_pro_routines_missing_ids_run.js
// Offline parser: compares exercise IDs referenced in pro_routines SQL
// against exercise IDs present in exercises SQL and prints any missing IDs
// along with which pro_routines reference them.

/* eslint-disable no-console */

const exercisesSql = `INSERT INTO "public"."exercises" ("id", "name", "description", "category_id", "thumbnail_url", "muscle_group_id", "type") VALUES ('24002306-79aa-40a2-a2fe-3ec986586ac4', 'Ab Wheel Rollout', 'An advanced core exercise that builds immense abdominal strength and stability.', null, null, null, 'Strength'), ('a0e3a2b0-f26e-4d86-b219-3663e4f23b8e', 'Arnold Press', null, null, null, null, 'Strength'), ('895f16bb-3908-4b3b-9c69-72cb0924ad53', 'Assisted Pull-ups', 'A pull-up variation using a machine or band to reduce bodyweight, allowing for the development of back and bicep strength.', null, null, null, 'Strength'), ('028746de-feb0-47c6-8d62-3f34f4e9d02d', 'Barbell Bench Press', null, null, null, null, 'Strength'), ('23eca0a4-5b77-4e2a-a09f-0f059e5cc4b9', 'Barbell Curl', 'A classic exercise for building bicep size and strength.', null, null, null, 'Strength'), ('d4016dc3-4301-4247-9754-36aa558f4c93', 'Barbell Shoulder Press', null, null, null, null, 'Strength'), ('38de58ec-6ac6-4607-9d4f-43a4e94acf87', 'Barbell Squat', 'A foundational lower body exercise targeting the quads, hamstrings, and glutes, often considered the king of leg exercises.', null, null, null, 'Strength');`;

const proRoutinesSql = `INSERT INTO "public"."pro_routines" ("id", "created_at", "name", "description", "category", "exercises", "recommended_for") VALUES ('1226aa33-d0b5-44ac-b334-de1272b1d3a4', '2025-10-19 21:39:21.487676+00', 'Pull Day (Aesthetic Focus)', 'An upper body pull day designed to build a strong back and defined biceps.', 'Hypertrophy', '[{"exercise_id": "1f54cabd-2027-402c-8af0-4615c2c83cae", "target_sets": 4}, {"exercise_id": "bef01399-0c5e-400c-9d58-5eb0129e65b7", "target_sets": 3}, {"exercise_id": "c0a3e8d2-5e48-4a68-80b6-7b44383c0757", "target_sets": 3}, {"exercise_id": "93f0b2a3-5c6e-4b8a-9c4c-3e6f6a7b8c9d", "target_sets": 3}]', 'Female'), ('1a174e7d-c2a8-46dd-a743-376749ff1c1f', '2025-10-19 21:39:21.487676+00', 'Glute Growth & Hamstrings', 'A lower body day focused on building strong, powerful glutes and hamstrings.', 'Hypertrophy', '[{"exercise_id": "63d9a64a-d9ea-4baf-ac3e-d8dcd3eb9569", "target_sets": 4}, {"exercise_id": "ca61eecb-6e79-4229-a0df-0610c9b67d35", "target_sets": 3}, {"exercise_id": "e9c772a6-4e28-47cd-8090-66f0ccb64b67", "target_sets": 3}, {"exercise_id": "dd5d8a78-6bad-4193-820a-36a0ab634597", "target_sets": 4}]', 'Female');`;

function extractExerciseIdsFromExercisesSql(sql) {
  const re = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const ids = new Set();
  let m;
  while ((m = re.exec(sql)) !== null) ids.add(m[0].toLowerCase());
  return ids;
}

function parseProRoutines(sql) {
  const valuesIndex = sql.indexOf('VALUES');
  const tuplesPart = valuesIndex === -1 ? sql : sql.slice(valuesIndex + 6);
  const rawTuples = tuplesPart.split(/\),\s*\(/g).map(s => s.replace(/^[\(\)\s;]+|[\(\)\s;]+$/g, ''));
  const routines = [];
  for (const tuple of rawTuples) {
    const idMatch = tuple.match(/^'([0-9a-f-]{36})'/i);
    if (!idMatch) continue;
    const routineId = idMatch[1].toLowerCase();
    const singleQuotedFields = tuple.match(/'((?:[^']|'')*)'/g) || [];
    const nameField = singleQuotedFields[2] ? singleQuotedFields[2].replace(/^'|'$/g, '') : '';
    const exercisesField = singleQuotedFields[5] ? singleQuotedFields[5].replace(/^'|'$/g, '') : '';
    let exercises = [];
    try {
      exercises = JSON.parse(exercisesField);
    } catch (e) {
      const re = /"exercise_id"\s*:\s*"([0-9a-f-]{36})"/gi;
      const ids = [];
      let mm;
      while ((mm = re.exec(exercisesField)) !== null) ids.push(mm[1].toLowerCase());
      exercises = ids.map(id => ({ exercise_id: id }));
    }
    routines.push({ id: routineId, name: nameField, exercises });
  }
  return routines;
}

const exerciseIdsSet = extractExerciseIdsFromExercisesSql(exercisesSql);
const proRoutines = parseProRoutines(proRoutinesSql);

const referencedIds = new Set();
for (const r of proRoutines) for (const ex of r.exercises) {
  const id = (ex.exercise_id || ex.id || '').toLowerCase();
  if (id) referencedIds.add(id);
}

const missing = Array.from(referencedIds).filter(id => !exerciseIdsSet.has(id));

const missingMap = {};
for (const r of proRoutines) for (const ex of r.exercises) {
  const id = (ex.exercise_id || ex.id || '').toLowerCase();
  if (!id) continue;
  if (missing.includes(id)) {
    missingMap[id] = missingMap[id] || [];
    missingMap[id].push({ routineId: r.id, routineName: r.name });
  }
}

console.log('Total exercises found in exercises SQL:', exerciseIdsSet.size);
console.log('Total unique exercise IDs referenced by pro_routines:', referencedIds.size);
console.log('Missing referenced IDs count:', missing.length);
if (missing.length === 0) {
  console.log('No missing IDs — all referenced exercise IDs are present in the exercises blob.');
} else {
  console.log('\nMissing IDs and referencing pro_routines:');
  for (const id of missing) {
    console.log(`- ${id}`);
    const refs = missingMap[id] || [];
    for (const ref of refs) console.log(`   • ${ref.routineName} (${ref.routineId})`);
  }
}

if (missing.length > 0) process.exitCode = 1;
