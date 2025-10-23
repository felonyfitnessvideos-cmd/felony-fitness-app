/**
 * parse_pro_routines_missing_ids.js
 * Utility parser used to extract referenced exercise IDs from embedded SQL
 * constants for `pro_routines` and compare them to the `exercises` data.
 * The module exports helpers used by tests and a `main` entrypoint used
 * by maintainers.
 */

const EXERCISES_SQL = `INSERT INTO "public"."exercises" ("id","name") VALUES
('24002306-79aa-40a2-a2fe-3ec986586ac4','Ab Wheel Rollout'),
('23eca0a4-5b77-4e2a-a09f-0f059e5cc4b9','Barbell Curl');`;

const PRO_ROUTINES_SQL = `INSERT INTO "public"."pro_routines" ("id","name","exercises") VALUES
('1226aa33-d0b5-44ac-b334-de1272b1d3a4','Pull Day','[{"exercise_id":"1f54cabd-2027-402c-8af0-4615c2c83cae"},{"exercise_id":"23eca0a4-5b77-4e2a-a09f-0f059e5cc4b9"}]');`;

function extractUuids(text) {
  const re = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const out = new Set();
  let m = null;
  while ((m = re.exec(text)) !== null) {
    out.add(m[0].toLowerCase());
  }
  return out;
}

export function parseProRoutinesFromValues(sql) {
  const valuesIndex = sql.indexOf('VALUES');
  const tail = valuesIndex === -1 ? sql : sql.slice(valuesIndex + 6);
  const tuples = tail.split(/\),\s*\(/g).map((s) => s.replace(/^[()\s;]+|[()\s;]+$/g, ''));
  const routines = [];

  for (const t of tuples) {
    const quoted = t.match(/'((?:[^']|'')*)'/g) || [];
    const exercisesField = quoted[2] ? quoted[2].replace(/^'|'$/g, '') : '';
    let exercises = [];
    try {
      exercises = JSON.parse(exercisesField);
      if (!Array.isArray(exercises)) exercises = [exercises];
    } catch (err) {
      // Fallback: extract exercise_id values with regex
      void err; // reference the caught error to satisfy the linter
      const re = /"exercise_id"\s*:\s*"([0-9a-f-]{36})"/gi;
      const ids = [];
      let mm = null;
      while ((mm = re.exec(exercisesField)) !== null) ids.push(mm[1].toLowerCase());
      exercises = ids.map((id) => ({ exercise_id: id }));
    }
    routines.push({ exercises });
  }

  return routines;
}

export function main() {
  const exerciseIds = extractUuids(EXERCISES_SQL);
  const proRoutines = parseProRoutinesFromValues(PRO_ROUTINES_SQL);

  const referenced = new Set();
  for (const r of proRoutines) {
    for (const ex of r.exercises) {
      const id = (ex && (ex.exercise_id || ex.id)) || '';
      if (id) referenced.add(String(id).toLowerCase());
    }
  }

  const missing = Array.from(referenced).filter((id) => !exerciseIds.has(id));

  if (missing.length === 0) {
    console.log('No missing IDs');
    return 0;
  }

  for (const id of missing) console.log(`- ${id}`);
  return 1;
}