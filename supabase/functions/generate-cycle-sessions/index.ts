// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? Deno.env.get('VITE_SUPABASE_URL');
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE') ?? Deno.env.get('SUPABASE_SERVICE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('generate-cycle-sessions: missing supabase env vars');
}

const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_SERVICE_ROLE ?? '');

// Helper: generate session dates like the frontend helper
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

// Edge function handler
Deno.serve(async (req) => {
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
        start.setHours(0,0,0,0);
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
          const { data: newLog, error: newLogErr } = await supabase.from('workout_logs').insert(payload).select().single();
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
