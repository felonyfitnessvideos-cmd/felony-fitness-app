/**
 * @file cycleUtils.js
 * Utility functions for generating cycle session dates from mesocycle definitions.
 */

/**
 * Generate scheduled dates for a mesocycle based on a start date and week/day assignments.
 * @param {string|Date} startDate - ISO date string or Date object representing the first day of week 1.
 * @param {Array<{week_index:number, day_index:number, routine_id:string}>} assignments
 * @returns {Array<{week_index:number, day_index:number, scheduled_date:string, routine_id:string}>}
 */
export function generateSessionDates(startDate, assignments = []) {
  let start;
  if (!startDate) start = new Date();
  else if (typeof startDate === 'string') {
    // parse YYYY-MM-DD (avoid timezone shift by constructing with numeric parts)
    const parts = startDate.split('-').map((p) => Number(p));
    // parts: [YYYY, MM, DD]
    start = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
  } else {
    start = new Date(startDate);
  }
  // Normalize to local midnight to avoid timezone shifts in tests
  const base = new Date(start.getFullYear(), start.getMonth(), start.getDate());

  return assignments.map((a) => {
    const daysOffset = (a.week_index - 1) * 7 + (a.day_index || 0);
    const d = new Date(base);
    d.setDate(base.getDate() + daysOffset);
    const iso = d.toISOString().slice(0, 10);
    return {
      week_index: a.week_index,
      day_index: a.day_index ?? 0,
      scheduled_date: iso,
      routine_id: a.routine_id ?? null,
    };
  });
}

export default { generateSessionDates };
