/* eslint-env node */
/* eslint-disable no-console */
// Simple script: parse embedded SQL INSERT blobs and report exercises
// referenced by pro_routines that are not present in exercises.

const EXERCISES_SQL = `INSERT INTO "public"."exercises" ("id", "name") VALUES
('24002306-79aa-40a2-a2fe-3ec986586ac4','Ab Wheel Rollout'),
('23eca0a4-5b77-4e2a-a09f-0f059e5cc4b9','Barbell Curl'),
('38de58ec-6ac6-4607-9d4f-43a4e94acf87','Barbell Squat');`;

const PRO_ROUTINES_SQL = `INSERT INTO "public"."pro_routines" ("id","name","exercises") VALUES
('1226aa33-d0b5-44ac-b334-de1272b1d3a4','Pull Day','[{"exercise_id":"1f54cabd-2027-402c-8af0-4615c2c83cae"},{"exercise_id":"23eca0a4-5b77-4e2a-a09f-0f059e5cc4b9"}]'),
('1a174e7d-c2a8-46dd-a743-376749ff1c1f','Glutes','[{"exercise_id":"63d9a64a-d9ea-4baf-ac3e-d8dcd3eb9569"}]');`;

function extractIdsFromSql(sql) {
  const re = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const out = new Set();
  let m;
  while ((m = re.exec(sql)) !== null) out.add(m[0].toLowerCase());
  return out;
}

function parseProRoutines(sql) {
  const valuesIdx = sql.indexOf('VALUES');
  const tail = valuesIdx === -1 ? sql : sql.slice(valuesIdx + 6);
  const tuples = tail.split(/\),\s*\(/g).map(s => s.replace(/^[\(\)\s;]+|[\(\)\s;]+$/g, ''));
  const routines = [];
  for (const t of tuples) {
    const idMatch = t.match(/^'([0-9a-f-]{36})'/i);
    if (!idMatch) continue;
    const quoted = t.match(/'((?:[^']|'')*)'/g) || [];
    const name = quoted[1] ? quoted[1].replace(/^'|'$/g, '') : '';
    const exercisesField = quoted[2] ? quoted[2].replace(/^'|'$/g, '') : '';
    let exercises = [];
    try { exercises = JSON.parse(exercisesField); } catch (_) {
      const re = /"exercise_id"\s*:\s*"([0-9a-f-]{36})"/gi;
      let mm; const ids = [];
      while ((mm = re.exec(exercisesField)) !== null) ids.push(mm[1].toLowerCase());
      exercises = ids.map(id => ({ exercise_id: id }));
    }
    routines.push({ name, exercises });
  }
  return routines;
}

const exerciseIds = extractIdsFromSql(EXERCISES_SQL);
const proRoutines = parseProRoutines(PRO_ROUTINES_SQL);

const referenced = new Set();
for (const r of proRoutines) for (const ex of r.exercises) {
  const id = (ex.exercise_id || ex.id || '').toLowerCase();
  if (id) referenced.add(id);
}

const missing = Array.from(referenced).filter(id => !exerciseIds.has(id));

if (missing.length === 0) {
  console.log('No missing IDs — all referenced exercise IDs are present in the exercises blob.');
} else {
  console.log('\nMissing IDs and referencing pro_routines:');
  for (const id of missing) console.log(`- ${id}`);
  process.exitCode = 1;
}
// parse_pro_routines_missing_ids.js
// Compares exercise IDs in the provided SQL blobs and prints which
// exercise IDs are referenced by pro_routines but missing from exercises.

const exercisesSql = `INSERT INTO "public"."exercises" ("id", "name", "description", "category_id", "thumbnail_url", "muscle_group_id", "type") VALUES ('24002306-79aa-40a2-a2fe-3ec986586ac4', 'Ab Wheel Rollout', 'An advanced core exercise that builds immense abdominal strength and stability.', null, null, null, 'Strength'), ('a0e3a2b0-f26e-4d86-b219-3663e4f23b8e', 'Arnold Press', null, null, null, null, 'Strength'), ('895f16bb-3908-4b3b-9c69-72cb0924ad53', 'Assisted Pull-ups', 'A pull-up variation using a machine or band to reduce bodyweight, allowing for the development of back and bicep strength.', null, null, null, 'Strength'), ('028746de-feb0-47c6-8d62-3f34f4e9d02d', 'Barbell Bench Press', null, null, null, null, 'Strength'), ('23eca0a4-5b77-4e2a-a09f-0f059e5cc4b9', 'Barbell Curl', 'A classic exercise for building bicep size and strength.', null, null, null, 'Strength'), ('d4016dc3-4301-4247-9754-36aa558f4c93', 'Barbell Shoulder Press', null, null, null, null, 'Strength'), ('38de58ec-6ac6-4607-9d4f-43a4e94acf87', 'Barbell Squat', 'A foundational lower body exercise targeting the quads, hamstrings, and glutes, often considered the king of leg exercises.', null, null, null, 'Strength'), ('7f00e4ee-07f0-4fff-8c33-520a1d77e97e', 'Battle Ropes', 'A high-intensity exercise that works the upper body, core, and cardiovascular system.', null, null, null, 'Cardio'), ('cbfe83b4-ac8d-4e5e-a12a-bb5505612e65', 'Bent-Over Reverse Fly', 'An exercise targeting the posterior (rear) deltoids.', null, null, null, 'Strength'), ('f6518c16-2dcb-40a4-9467-9e876be622c7', 'Bird-Dog', 'A core stability exercise that improves balance and strengthens the abs, lower back, and glutes.', null, null, null, 'Strength'), ('20272f6f-a88e-42d2-8dd6-a67646fd2f01', 'Bodyweight Squat', 'A foundational bodyweight movement that builds leg strength and endurance without external weight.', null, null, null, 'Strength'), ('0ad22d71-3d47-43a4-9c71-4456730dfc6a', 'Box Jump', 'A plyometric exercise that builds explosive power in the legs.', null, null, null, 'Strength'), ('98f47486-c54e-406e-b55b-061b57af518f', 'Bradford Press', 'A press variation that involves moving the bar from in front of the head to behind it.', null, null, null, 'Strength'), ('d573814b-a7cb-4e55-b503-ffe511bc8cc6', 'Bulgarian Split Squat', 'An advanced unilateral leg exercise that builds strength and stability.', null, null, null, 'Strength'), ('218f7b3b-fea5-4c98-b2e4-d8a6b5175bb7', 'Burpees', 'A high-intensity, full-body exercise that combines a squat, push-up, and jump.', null, null, null, 'Cardio'), ('c542040c-aac2-40ee-a498-87d0f4cc7544', 'Cable Crunch', 'A weighted crunch variation using a cable machine.', null, null, null, 'Strength'), ('2e474999-cfdb-4f65-87e0-4e1e97d482a6', 'Cable Crunches', 'A weighted abdominal exercise using a cable machine to apply consistent tension to the rectus abdominis.', null, null, null, 'Strength'), ('aa55fb28-b44e-44a7-bf41-51c0200751aa', 'Cable Fly', 'An isolation exercise for the chest using a cable machine, can be done at high, mid, or low angles.', null, null, null, 'Strength'), ('5c5a28d5-0cda-4b89-abb1-092bd69f3d00', 'Cable Overhead Tricep Extension', 'A cable variation of the overhead extension.', null, null, null, 'Strength'), ('29ea0328-de5b-4ed4-99c5-ae62b7faee4d', 'Cable Pull-Through', 'A hip-hinge exercise using a cable machine that effectively targets the glutes and hamstrings.', null, null, null, 'Strength'), ('4eb37f1d-3b2f-4bc4-81b0-94f15d423371', 'Cable Woodchop', 'A rotational core exercise that targets the obliques.', null, null, null, 'Strength'), ('0197ab2e-1312-43c4-b797-9f6550a745ad', 'Chest Press', null, null, null, null, 'Strength'), ('fdda8c38-dc98-467b-bb40-c51f700945d9', 'Chin-up', 'Similar to a pull-up but with an underhand grip, which places more emphasis on the biceps.', null, null, null, 'Strength'), ('e8518dd0-1247-41ef-9a2c-ab74aac246f0', 'Clean and Jerk', 'An Olympic weightlifting movement that builds full-body power and explosiveness.', null, null, null, 'Strength'), ('2e0fd211-df1d-4eb7-8bd9-4e7ccd615a67', 'Clean and Press', 'A variation of the Olympic lift that builds full-body strength and power.', null, null, null, 'Strength'), ('2e5b7523-0231-4867-8b58-086452ba357e', 'Close-Grip Bench Press', 'A compound press that places a heavy emphasis on the triceps.', null, null, null, 'Strength');`;

const proRoutinesSql = `INSERT INTO "public"."pro_routines" ("id", "created_at", "name", "description", "category", "exercises", "recommended_for") VALUES ('1226aa33-d0b5-44ac-b334-de1272b1d3a4', '2025-10-19 21:39:21.487676+00', 'Pull Day (Aesthetic Focus)', 'An upper body pull day designed to build a strong back and defined biceps.', 'Hypertrophy', '[{"exercise_id": "1f54cabd-2027-402c-8af0-4615c2c83cae", "target_sets": 4}, {"exercise_id": "bef01399-0c5e-400c-9d58-5eb0129e65b7", "target_sets": 3}, {"exercise_id": "c0a3e8d2-5e48-4a68-80b6-7b44383c0757", "target_sets": 3}, {"exercise_id": "93f0b2a3-5c6e-4b8a-9c4c-3e6f6a7b8c9d", "target_sets": 3}]', 'Female'), ('1a174e7d-c2a8-46dd-a743-376749ff1c1f', '2025-10-19 21:39:21.487676+00', 'Glute Growth & Hamstrings', 'A lower body day focused on building strong, powerful glutes and hamstrings.', 'Hypertrophy', '[{"exercise_id": "63d9a64a-d9ea-4baf-ac3e-d8dcd3eb9569", "target_sets": 4}, {"exercise_id": "ca61eecb-6e79-4229-a0df-0610c9b67d35", "target_sets": 3}, {"exercise_id": "e9c772a6-4e28-47cd-8090-66f0ccb64b67", "target_sets": 3}, {"exercise_id": "dd5d8a78-6bad-4193-820a-36a0ab634597", "target_sets": 4}]', 'Female'), ('1bfca821-bfef-47f7-a29c-71a9101eb322', '2025-10-19 21:39:21.487676+00', 'Lower Body Strength & Power', 'Focuses on building raw strength in the lower body with heavy compound lifts.', 'Strength', '[{"exercise_id": "38de58ec-6ac6-4607-9d4f-43a4e94acf87", "target_sets": 4}, {"exercise_id": "6712b3c2-8438-4876-9d32-d178f73117b9", "target_sets": 3}, {"exercise_id": "e9c772a6-4e28-47cd-8090-66f0ccb64b67", "target_sets": 3}]', 'Female'), ('2585de2c-fe18-4999-941c-8d95e658614b', '2025-10-19 21:39:21.487676+00', 'Lower Body Power', 'A simple but brutally effective lower body workout based on the principles of 5/3/1.', 'Strength', '[{"exercise_id": "38de58ec-6ac6-4607-9d4f-43a4e94acf87", "target_sets": 5}, {"exercise_id": "6712b3c2-8438-4876-9d32-d178f73117b9", "target_sets": 1}, {"exercise_id": "803a6234-f869-4e3b-9e8c-843f0e0f8b1a", "target_sets": 4}, {"exercise_id": "1f0c4b8a-3e6b-4e6f-8b2f-3c5d8a9e6b3c", "target_sets": 4}]', 'Male'), ('36f88ff3-d362-487f-9c87-97863e03859e', '2025-10-19 21:39:21.487676+00', 'Classic Bro Split: Back & Bis', 'A high-volume workout focused on building a wide, thick back and big biceps.', 'Hypertrophy', '[{"exercise_id": "a1e8c8a0-5c6e-4b8a-9c4c-3e6f6a7b8c9d", "target_sets": 5}, {"exercise_id": "52c4b829-37e6-4f48-9e58-86d7e63b156a", "target_sets": 4}, {"exercise_id": "3127c595-5c1a-4f51-87c2-1e967a503525", "target_sets": 4}, {"exercise_id": "23eca0a4-5b77-4e2a-a09f-0f059e5cc4b9", "target_sets": 3}, {"exercise_id": "93f0b2a3-5c6e-4b8a-9c4c-3e6f6a7b8c9d", "target_sets": 4}]', 'Male'), ('3aa29347-4320-4952-9c3e-92ccda3efc4c', '2025-10-19 21:39:21.487676+00', 'Full Body Toning A', 'A full-body routine focused on compound movements to build lean muscle and improve overall fitness.', 'Strength', '[{"exercise_id": "5ad36327-3de1-42c3-b6ea-c84088c315d", "target_sets": 3}, {"exercise_id": "10c9cc2e-4c23-4bb5-a424-5339dee8830b", "target_sets": 3}, {"exercise_id": "bef01399-0c5e-400c-9d58-5eb0129e65b7", "target_sets": 3}]', 'Female');`;

function extractExerciseIdsFromExercisesSql(sql) {
  const re = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const ids = new Set();
  let match;
  while ((match = re.exec(sql)) !== null) {
    ids.add(match[0].toLowerCase());
  }
  return ids;
}

function parseProRoutines(sql) {
  const valuesIndex = sql.indexOf('VALUES');
  const tuplesPart = valuesIndex === -1 ? sql : sql.slice(valuesIndex + 6);
  const rawTuples = tuplesPart.split(/\),\s*\(/g).map(s => s.replace(/^\(*|\)*;?$/g, '').trim());

  /* eslint-disable no-console */

  // Cleaned single-copy parser script
  // Compares exercise IDs in the provided SQL blobs and prints which
  // exercise IDs are referenced by pro_routines but missing from exercises.

  // Embedded SQL blobs (trimmed to relevant portions for offline parsing).
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
      let m;
      while ((m = re.exec(exercisesField)) !== null) ids.push(m[1].toLowerCase());
      exercises = ids.map(id => ({ exercise_id: id }));
    }
    routines.push({ id: routineId, name: nameField, exercises });
  }
  return routines;
}

const exerciseIdsSet = extractExerciseIdsFromExercisesSql(exercisesSql);
const proRoutines = parseProRoutines(proRoutinesSql);

// Cleaned single-copy parser script
// Compares exercise IDs in the provided SQL blobs and prints which
// exercise IDs are referenced by pro_routines but missing from exercises.

// Embedded SQL blobs (trimmed to relevant portions for offline parsing).
const exercisesSql = `INSERT INTO "public"."exercises" ("id", "name", "description", "category_id", "thumbnail_url", "muscle_group_id", "type") VALUES ('24002306-79aa-40a2-a2fe-3ec986586ac4', 'Ab Wheel Rollout', 'An advanced core exercise that builds immense abdominal strength and stability.', null, null, null, 'Strength'), ('a0e3a2b0-f26e-4d86-b219-3663e4f23b8e', 'Arnold Press', null, null, null, null, 'Strength'), ('895f16bb-3908-4b3b-9c69-72cb0924ad53', 'Assisted Pull-ups', 'A pull-up variation using a machine or band to reduce bodyweight, allowing for the development of back and bicep strength.', null, null, null, 'Strength'), ('028746de-feb0-47c6-8d62-3f34f4e9d02d', 'Barbell Bench Press', null, null, null, null, 'Strength'), ('23eca0a4-5b77-4e2a-a09f-0f059e5cc4b9', 'Barbell Curl', 'A classic exercise for building bicep size and strength.', null, null, null, 'Strength'), ('d4016dc3-4301-4247-9754-36aa558f4c93', 'Barbell Shoulder Press', null, null, null, null, 'Strength'), ('38de58ec-6ac6-4607-9d4f-43a4e94acf87', 'Barbell Squat', 'A foundational lower body exercise targeting the quads, hamstrings, and glutes, often considered the king of leg exercises.', null, null, null, 'Strength');`;

const proRoutinesSql = `INSERT INTO "public"."pro_routines" ("id", "created_at", "name", "description", "category", "exercises", "recommended_for") VALUES ('1226aa33-d0b5-44ac-b334-de1272b1d3a4', '2025-10-19 21:39:21.487676+00', 'Pull Day (Aesthetic Focus)', 'An upper body pull day designed to build a strong back and defined biceps.', 'Hypertrophy', '[{"exercise_id": "1f54cabd-2027-402c-8af0-4615c2c83cae", "target_sets": 4}, {"exercise_id": "bef01399-0c5e-400c-9d58-5eb0129e65b7", "target_sets": 3}, {"exercise_id": "c0a3e8d2-5e48-4a68-80b6-7b44383c0757", "target_sets": 3}, {"exercise_id": "93f0b2a3-5c6e-4b8a-9c4c-3e6f6a7b8c9d", "target_sets": 3}]', 'Female'), ('1a174e7d-c2a8-46dd-a743-376749ff1c1f', '2025-10-19 21:39:21.487676+00', 'Glute Growth & Hamstrings', 'A lower body day focused on building strong, powerful glutes and hamstrings.', 'Hypertrophy', '[{"exercise_id": "63d9a64a-d9ea-4baf-ac3e-d8dcd3eb9569", "target_sets": 4}, {"exercise_id": "ca61eecb-6e79-4229-a0df-0610c9b67d35", "target_sets": 3}, {"exercise_id": "e9c772a6-4e28-47cd-8090-66f0ccb64b67", "target_sets": 3}, {"exercise_id": "dd5d8a78-6bad-4193-820a-36a0ab634597", "target_sets": 4}]', 'Female');`;

function extractExerciseIdsFromExercisesSql(sql) {
  const re = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const ids = new Set();
  let match;
  while ((match = re.exec(sql)) !== null) {
    ids.add(match[0].toLowerCase());
  }
  return ids;
}

function parseProRoutines(sql) {
  const valuesIndex = sql.indexOf('VALUES');
  const tuplesPart = valuesIndex === -1 ? sql : sql.slice(valuesIndex + 6);
  const rawTuples = tuplesPart.split(/\),\s*\(/g).map(s => s.replace(/^[\(\)\s;]+|[\(\)\s;]+$/g, ''));
  // New clean parser script
  /* eslint-disable no-console */

  const EXERCISES_SQL = `INSERT INTO "public"."exercises" ("id", "name") VALUES
  ('24002306-79aa-40a2-a2fe-3ec986586ac4','Ab Wheel Rollout'),
  ('a0e3a2b0-f26e-4d86-b219-3663e4f23b8e','Arnold Press'),
  ('895f16bb-3908-4b3b-9c69-72cb0924ad53','Assisted Pull-ups'),
  ('028746de-feb0-47c6-8d62-3f34f4e9d02d','Barbell Bench Press'),
  // parse_pro_routines_missing_ids.js
  // Clean single-copy parser script.
  // Compares exercise IDs in the provided SQL blobs and prints which
  // exercise IDs are referenced by pro_routines but missing from exercises.

  /* eslint-disable no-console */

  // Short example SQL blobs (trimmed) used for offline parsing.
  const EXERCISES_SQL = `INSERT INTO "public"."exercises" ("id", "name") VALUES
  ('24002306-79aa-40a2-a2fe-3ec986586ac4','Ab Wheel Rollout'),
  ('23eca0a4-5b77-4e2a-a09f-0f059e5cc4b9','Barbell Curl'),
  ('38de58ec-6ac6-4607-9d4f-43a4e94acf87','Barbell Squat');`;

  const PRO_ROUTINES_SQL = `INSERT INTO "public"."pro_routines" ("id","name","exercises") VALUES
  ('1226aa33-d0b5-44ac-b334-de1272b1d3a4','Pull Day','[{"exercise_id":"1f54cabd-2027-402c-8af0-4615c2c83cae"},{"exercise_id":"23eca0a4-5b77-4e2a-a09f-0f059e5cc4b9"}]'),
  ('1a174e7d-c2a8-46dd-a743-376749ff1c1f','Glutes','[{"exercise_id":"63d9a64a-d9ea-4baf-ac3e-d8dcd3eb9569"}]');`;

  function extractIdsFromSql(sql) {
    const re = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
    const out = new Set();
    let m;
    while ((m = re.exec(sql)) !== null) out.add(m[0].toLowerCase());
    return out;
  }

  function parseProRoutines(sql) {
    const valuesIdx = sql.indexOf('VALUES');
    const tail = valuesIdx === -1 ? sql : sql.slice(valuesIdx + 6);
    const tuples = tail.split(/\),\s*\(/g).map(s => s.replace(/^[\(\)\s;]+|[\(\)\s;]+$/g, ''));
    const routines = [];
    for (const t of tuples) {
      const idMatch = t.match(/^'([0-9a-f-]{36})'/i);
      if (!idMatch) continue;
      const id = idMatch[1].toLowerCase();
      const quoted = t.match(/'((?:[^']|'')*)'/g) || [];
      const name = quoted[1] ? quoted[1].replace(/^'|'$/g, '') : '';
      const exercisesField = quoted[2] ? quoted[2].replace(/^'|'$/g, '') : '';
      let exercises = [];
      try { exercises = JSON.parse(exercisesField); } catch (e) {
        const re = /"exercise_id"\s*:\s*"([0-9a-f-]{36})"/gi;
        let mm; const ids = [];
        while ((mm = re.exec(exercisesField)) !== null) ids.push(mm[1].toLowerCase());
        exercises = ids.map(id => ({ exercise_id: id }));
      }
      routines.push({ id, name, exercises });
    }
    return routines;
  }

  const exerciseIds = extractIdsFromSql(EXERCISES_SQL);
  const proRoutines = parseProRoutines(PRO_ROUTINES_SQL);

  const referenced = new Set();
  for (const r of proRoutines) for (const ex of r.exercises) {
    const id = (ex.exercise_id || ex.id || '').toLowerCase();
    if (id) referenced.add(id);
  }

  const missing = Array.from(referenced).filter(id => !exerciseIds.has(id));

  if (missing.length === 0) {
    console.log('No missing IDs — all referenced exercise IDs are present in the exercises blob.');
  } else {
    console.log('\nMissing IDs and referencing pro_routines:');
    for (const id of missing) {
      console.log(`- ${id}`);
    }
    process.exitCode = 1;
  }
  return routines;
}

const exerciseIdsSet = extractExerciseIdsFromExercisesSql(exercisesSql);
const proRoutines = parseProRoutines(proRoutinesSql);

// Clean single-copy parser script
// Compares exercise IDs in the provided SQL blobs and prints which
// exercise IDs are referenced by pro_routines but missing from exercises.

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
const referencedIdsFinal = new Set();
for (const r of proRoutinesFinal) for (const ex of r.exercises) {
  const id = (ex.exercise_id || ex.id || '').toLowerCase();
  if (id) referencedIdsFinal.add(id);
}

const missing = Array.from(referencedIds).filter(id => !exerciseIdsSet.has(id));

const missingFinal = Array.from(referencedIdsFinal).filter(id => !exerciseIdsSetFinal.has(id));
const missingMapFinal = {};
for (const r of proRoutinesFinal) for (const ex of r.exercises) {
  const id = (ex.exercise_id || ex.id || '').toLowerCase();
  if (!id) continue;
  if (missingFinal.includes(id)) {
    missingMapFinal[id] = missingMapFinal[id] || [];
    missingMapFinal[id].push({ routineId: r.id, routineName: r.name });
  }
}

console.log('Total exercises found in exercises SQL:', exerciseIdsSet.size);
console.log('Total exercises found in exercises SQL:', exerciseIdsSetFinal.size);
console.log('Total unique exercise IDs referenced by pro_routines:', referencedIdsFinal.size);
console.log('Missing referenced IDs count:', missingFinal.length);
if (missing.length === 0) {
if (missingFinal.length === 0) {
  console.log('No missing IDs — all referenced exercise IDs are present in the exercises blob.');
} else {
  console.log('\nMissing IDs and referencing pro_routines:');
  for (const id of missingFinal) {
    console.log(`- ${id}`);
    const refs = missingMapFinal[id] || [];
    for (const ref of refs) console.log(`   • ${ref.routineName} (${ref.routineId})`);
  }
}

if (missing.length > 0) process.exitCode = 1;
if (missingFinal.length > 0) process.exitCode = 1;