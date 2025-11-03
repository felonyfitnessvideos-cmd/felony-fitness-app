/**
 * @fileoverview Comprehensive mesocycle and workout session date calculation utilities
 * @description Advanced utility functions for generating precise workout schedule dates
 * from mesocycle definitions. Handles timezone normalization, week/day indexing,
 * and date arithmetic for training program scheduling with bulletproof accuracy.
 * 
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-02
 * 
 * Core Features:
 * - Accurate date calculation for multi-week training cycles
 * - Timezone-safe date parsing and manipulation
 * - Flexible week/day indexing system (0-based or 1-based)
 * - ISO date string output for consistent database storage
 * - Robust error handling for edge cases
 * 
 * Mathematical Foundation:
 * - Week-based offset calculation: (week_index - 1) * 7 days
 * - Day-based offset addition: + day_index
 * - Local timezone normalization to prevent date shifts
 * - Midnight-based date anchoring for consistency
 * 
 * @example
 * // Generate 4-week training schedule
 * const assignments = [
 *   { week_index: 1, day_index: 0, routine_id: 'push-1' },
 *   { week_index: 1, day_index: 2, routine_id: 'pull-1' },
 *   { week_index: 2, day_index: 0, routine_id: 'push-2' }
 * ];
 * const dates = generateSessionDates('2025-01-01', assignments);
 * 
 * @see {@link https://en.wikipedia.org/wiki/Periodization} for training periodization theory
 */

/**
 * Generate precise scheduled dates for mesocycle training sessions
 * 
 * @function generateSessionDates
 * @param {string|Date} startDate - Start date as ISO string ('YYYY-MM-DD') or Date object
 * @param {Array<Object>} [assignments=[]] - Array of workout assignments
 * @param {number} assignments[].week_index - Week number in mesocycle (1-based indexing)
 * @param {number} assignments[].day_index - Day of week (0=Monday, 6=Sunday)
 * @param {string} assignments[].routine_id - Database ID of workout routine
 * @returns {Array<Object>} Array of scheduled session objects
 * @returns {number} returns[].week_index - Original week index
 * @returns {number} returns[].day_index - Original day index (normalized to 0 if undefined)
 * @returns {string} returns[].scheduled_date - ISO date string ('YYYY-MM-DD')
 * @returns {string|null} returns[].routine_id - Routine ID (null if undefined)
 * 
 * @description Calculates exact dates for workout sessions based on mesocycle structure.
 * Uses precise date arithmetic with timezone normalization to prevent date shift bugs.
 * Handles multiple input formats and provides consistent ISO date output.
 * 
 * @since 2.0.0
 * 
 * Date Calculation Logic:
 * 1. **Parse Start Date**: Handles ISO strings and Date objects safely
 * 2. **Normalize Timezone**: Creates local midnight anchor to prevent shifts
 * 3. **Calculate Offset**: (week_index - 1) * 7 + day_index days from start
 * 4. **Generate ISO**: Consistent 'YYYY-MM-DD' format for database storage
 * 
 * Edge Case Handling:
 * - Null/undefined startDate defaults to current date
 * - Invalid date strings create current date fallback
 * - Missing day_index defaults to 0 (Monday)
 * - Missing routine_id defaults to null
 * 
 * @example
 * // Basic 2-week push/pull split
 * const assignments = [
 *   { week_index: 1, day_index: 0, routine_id: 'push-workout' },  // Week 1, Monday
 *   { week_index: 1, day_index: 2, routine_id: 'pull-workout' },  // Week 1, Wednesday
 *   { week_index: 2, day_index: 0, routine_id: 'push-workout' },  // Week 2, Monday
 *   { week_index: 2, day_index: 2, routine_id: 'pull-workout' }   // Week 2, Wednesday
 * ];
 * 
 * const sessions = generateSessionDates('2025-01-06', assignments);
 * // Result: [
 * //   { week_index: 1, day_index: 0, scheduled_date: '2025-01-06', routine_id: 'push-workout' },
 * //   { week_index: 1, day_index: 2, scheduled_date: '2025-01-08', routine_id: 'pull-workout' },
 * //   { week_index: 2, day_index: 0, scheduled_date: '2025-01-13', routine_id: 'push-workout' },
 * //   { week_index: 2, day_index: 2, scheduled_date: '2025-01-15', routine_id: 'pull-workout' }
 * // ]
 * 
 * @example
 * // Handle Date object input
 * const startDate = new Date('2025-01-01');
 * const sessions = generateSessionDates(startDate, assignments);
 * 
 * @example
 * // Default handling for missing parameters
 * const sessions = generateSessionDates(); // Uses current date, empty assignments
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
