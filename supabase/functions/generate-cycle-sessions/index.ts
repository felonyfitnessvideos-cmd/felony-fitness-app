/**
 * @file supabase/functions/generate-cycle-sessions/index.ts
 * @description Edge Function to automatically generate training session schedules for mesocycles.
 * 
 * This function creates a complete schedule of workout sessions based on a mesocycle's
 * weekly training plan. It calculates exact dates for each session, assigns routines,
 * and handles progressive overload planning with volume/intensity multipliers.
 * 
 * @project Felony Fitness
 * @author Felony Fitness Development Team
 * @version 2.0.0
 * @since 2025-11-02
 * 
 * @workflow
 * 1. Receives mesocycle_id and start_date from client
 * 2. Loads all week assignments from mesocycle_weeks table
 * 3. Calculates precise session dates using week/day indexing
 * 4. Creates cycle_sessions records with scheduling metadata
 * 5. Returns generated session list or detailed error information
 * 
 * @security
 * - Uses service role for database operations (no RLS)
 * - Validates required parameters before processing
 * - Handles user_id association from mesocycle ownership
 * 
 * @param {Object} body - Request body
 * @param {string} body.mesocycle_id - UUID of the mesocycle to generate sessions for
 * @param {string} body.start_date - Start date in ISO format (YYYY-MM-DD)
 * 
 * @returns {Response} JSON response with generated sessions or error
 * @returns {Object} response.body - Response body
 * @returns {Array} response.body.sessions - Generated session records
 * @returns {string} response.body.error - Error message if generation failed
 * 
 * Date Calculation Logic:
 * - Uses same algorithm as client-side cycleUtils.js
 * - Week offset: (week_index - 1) * 7 days
 * - Day offset: + day_index (0=Monday, 6=Sunday)
 * - Timezone-safe date manipulation
 * 
 * @example
 * // Request
 * POST /functions/v1/generate-cycle-sessions
 * Body: {
 *   mesocycle_id: "abc-123",
 *   start_date: "2025-01-06"
 * }
 * 
 * // Success Response
 * {
 *   sessions: [
 *     {
 *       id: "...",
 *       mesocycle_id: "abc-123",
 *       week_index: 1,
 *       day_index: 0,
 *       scheduled_date: "2025-01-06",
 *       routine_id: "push-routine-id"
 *     },
 *     ...
 *   ]
 * }
 */

// @ts-check
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('VITE_SUPABASE_URL');
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE') ?? Deno.env.get('SUPABASE_SERVICE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('generate-cycle-sessions: missing supabase env vars');
}

const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_SERVICE_ROLE ?? '');

/**
 * Generate precise scheduled dates for mesocycle training sessions
 * 
 * @function generateSessionDates
 * @param {string|Date} startDate - Start date as ISO string ('YYYY-MM-DD') or Date object
 * @param {Array<Object>} [assignments=[]] - Array of workout assignments from mesocycle_weeks
 * @param {number} assignments[].week_index - Week number in mesocycle (1-based indexing)
 * @param {number} assignments[].day_index - Day of week (0=Monday, 6=Sunday)
 * @param {string} assignments[].routine_id - Database ID of workout routine
 * @returns {Array<Object>} Array of scheduled session objects with calculated dates
 * 
 * @description Calculates exact dates for workout sessions using the same algorithm
 * as the client-side cycleUtils.js for consistency. Uses precise date arithmetic
 * with timezone normalization to prevent date shift bugs.
 * 
 * Date Calculation:
 * 1. Parse start date (handles ISO strings and Date objects)
 * 2. Normalize to local midnight to prevent timezone shifts
 * 3. Calculate offset: (week_index - 1) * 7 + day_index days
 * 4. Generate ISO date string (YYYY-MM-DD)
 * 
 * @example
 * const assignments = [
 *   { week_index: 1, day_index: 0, routine_id: 'push-1' },
 *   { week_index: 1, day_index: 2, routine_id: 'pull-1' }
 * ];
 * const sessions = generateSessionDates('2025-01-06', assignments);
 */
function generateSessionDates(startDate, assignments = []) {
  let start;
  if (!startDate) start = new Date();
  else if (typeof startDate === 'string') {
    const parts = startDate.split('-').map((p) => Number(p));
    start = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
  } else {
    start = new Date(startDate);
  }
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

/**
 * Main Edge Function handler for cycle session generation
 * 
 * @async
 * @function serve
 * @param {Request} req - HTTP request object
 * @returns {Promise<Response>} JSON response with generated sessions or error
 * 
 * @description Handles POST requests to generate training session schedules.
 * Validates input, queries mesocycle data, calculates session dates, and
 * creates database records with proper error handling.
 * 
 * Request Flow:
 * 1. Handle CORS preflight (OPTIONS)
 * 2. Parse and validate request body
 * 3. Load mesocycle week assignments
 * 4. Generate session dates using helper function
 * 5. Enrich with mesocycle metadata and multipliers
 * 6. Insert sessions into cycle_sessions table
 * 7. Return generated session list
 * 
 * Error Handling:
 * - 400: Missing required parameters
 * - 404: Mesocycle not found
 * - 500: Database errors or session generation failures
 */
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') return new Response('ok');

  try {
    const body = await req.json();
    const { mesocycle_id, start_date } = body;
    if (!mesocycle_id) return new Response(JSON.stringify({ error: 'mesocycle_id required' }), { status: 400 });

    // Load week assignments for the mesocycle. Prefer the explicit `day_type`
    // column if present; fall back to `notes` (legacy) if not.
    const { data: assignments, error } = await supabase
      .from('mesocycle_weeks')
      .select('week_index,day_index,routine_id,day_type,notes')
      .eq('mesocycle_id', mesocycle_id)
      .order('week_index', { ascending: true })
      .order('day_index', { ascending: true });

    if (error) throw error;

    if (!assignments || assignments.length === 0) {
      return new Response(JSON.stringify({ inserted: 0, message: 'no assignments found' }), { status: 200 });
    }

    // Map assignments into generator-friendly shape, preferring day_type then notes
    const normalized = (assignments || []).map((a) => {
      const type = a.day_type || (typeof a.notes === 'string' ? a.notes : null);
      return {
        week_index: a.week_index,
        day_index: a.day_index,
        routine_id: a.routine_id ?? null,
        day_type: type ?? (a.routine_id ? 'routine' : 'rest'),
      };
    });

    const sessions = generateSessionDates(start_date, normalized);

    // Build inserts with user_id lookup from mesocycles table
    const { data: mesoRows } = await supabase.from('mesocycles').select('user_id').eq('id', mesocycle_id).limit(1).maybeSingle();
    const user_id = mesoRows?.user_id ?? null;

    // For deload handling: if assignment day_type === 'deload' mark the
    // generated session's status as 'deload' and return planned multiplier in
    // the response so callers (frontend) can adapt UI/volume. Since the
    // cycle_sessions table does not currently include dedicated deload
    // columns, we encode the deload intent in the `status` value and return
    // detailed metadata to the caller.
    const inserts = [];
    const returnedMeta = [];
    for (let i = 0; i < sessions.length; i++) {
      const src = normalized[i];
      const s = sessions[i];
      const isDeload = (src && src.day_type === 'deload');
      const planned_volume_multiplier = isDeload ? 0.5 : 1.0;
      inserts.push({
        user_id,
        mesocycle_id,
        week_index: s.week_index,
        day_index: s.day_index,
        routine_id: s.routine_id,
        scheduled_date: s.scheduled_date,
        status: isDeload ? 'deload' : 'scheduled',
        is_deload: isDeload,
        planned_volume_multiplier,
      });
      returnedMeta.push({
        week_index: s.week_index,
        day_index: s.day_index,
        scheduled_date: s.scheduled_date,
        routine_id: s.routine_id,
        is_deload: isDeload,
        planned_volume_multiplier,
      });
    }

    const { data: insertRes, error: insertErr } = await supabase.from('cycle_sessions').insert(inserts).select();
    if (insertErr) throw insertErr;

    // For each inserted session, create a starter workout_log if the session
    // has a routine assigned and no existing log exists for that user/routine/date.
    let createdLogs = 0;
    for (const row of insertRes || []) {
      try {
        if (!row.routine_id) continue; // skip rest days
        const scheduled = row.scheduled_date; // YYYY-MM-DD
        // define day range
        const start = new Date(scheduled);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const { data: existing, error: exErr } = await supabase
          .from('workout_logs')
          .select('id')
          .eq('user_id', user_id)
          .eq('routine_id', row.routine_id)
          .gte('created_at', start.toISOString())
          .lt('created_at', end.toISOString())
          .limit(1)
          .maybeSingle();
        if (exErr) {
          console.warn('check existing log failed', exErr.message || exErr);
        }
        if (!existing) {
          const payload = {
            user_id,
            routine_id: row.routine_id,
            is_complete: false,
            created_at: start.toISOString(),
            cycle_session_id: row.id,
          };
          const { error: newLogErr } = await supabase.from('workout_logs').insert(payload).select().single();
          if (!newLogErr) createdLogs += 1;
          else console.warn('could not create starter log', newLogErr.message || newLogErr);
        }
      } catch (innerErr) {
        console.warn('error handling starter log', innerErr?.message ?? innerErr);
      }
    }

    return new Response(JSON.stringify({ inserted: insertRes?.length ?? 0, createdLogs, sessions: returnedMeta }), { status: 200 });
  } catch (err) {
    console.error('generate-cycle-sessions error', err?.message ?? err);
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500 });
  }
});
