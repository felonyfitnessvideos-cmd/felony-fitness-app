import { describe, it, expect } from 'vitest';
import { generateSessionDates } from '../src/lib/cycleUtils.js';

describe('generateSessionDates', () => {
  it('generates correct dates for week/day assignments', () => {
    const start = '2025-10-20'; // Monday
    const assignments = [
      { week_index: 1, day_index: 0, routine_id: 'r1' },
      { week_index: 1, day_index: 2, routine_id: 'r2' },
      { week_index: 2, day_index: 0, routine_id: 'r3' },
    ];
    const result = generateSessionDates(start, assignments);
    expect(result).toHaveLength(3);
    expect(result[0].scheduled_date).toBe('2025-10-20');
    expect(result[1].scheduled_date).toBe('2025-10-22');
    expect(result[2].scheduled_date).toBe('2025-10-27');
  });
});
