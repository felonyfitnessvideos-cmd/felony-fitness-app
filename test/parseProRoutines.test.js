import { describe, it, expect } from 'vitest';
import { parseProRoutinesFromValues } from '../scripts/parse_pro_routines_missing_ids.js';

describe('parseProRoutinesFromValues', () => {
  it('parses a VALUES tuple with JSON exercises', () => {
    const sql = "INSERT INTO pro_routines (id,name,exercises) VALUES ('id1','R1','[{\"exercise_id\":\"a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1\"}]')";
    const routines = parseProRoutinesFromValues(sql);
    expect(Array.isArray(routines)).toBe(true);
    expect(routines[0].exercises).toEqual([{ exercise_id: 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1' }]);
  });

  it('falls back to regex extraction when JSON parse fails', () => {
    const sql = "INSERT INTO pro_routines (id,name,exercises) VALUES ('id1','R1','invalid{\"exercise_id\":\"b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2\"}')";
    const routines = parseProRoutinesFromValues(sql);
    expect(routines[0].exercises).toEqual([{ exercise_id: 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2' }]);
  });
});
