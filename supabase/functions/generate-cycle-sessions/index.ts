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

    // Load week assignments for the mesocycle
    const { data: assignments, error } = await supabase
      .from('mesocycle_weeks')
      .select('week_index,day_index,routine_id')
      .eq('mesocycle_id', mesocycle_id)
      .order('week_index', { ascending: true })
      .order('day_index', { ascending: true });

    if (error) throw error;

    if (!assignments || assignments.length === 0) {
      return new Response(JSON.stringify({ inserted: 0, message: 'no assignments found' }), { status: 200 });
    }

    const sessions = generateSessionDates(start_date, assignments);

    // Build inserts with user_id lookup from mesocycles table
    const { data: mesoRows } = await supabase.from('mesocycles').select('user_id').eq('id', mesocycle_id).limit(1).maybeSingle();
    const user_id = mesoRows?.user_id ?? null;

    const inserts = sessions.map((s) => ({
      user_id,
      mesocycle_id,
      week_index: s.week_index,
      day_index: s.day_index,
      routine_id: s.routine_id,
      scheduled_date: s.scheduled_date,
      status: 'scheduled',
    }));

    const { data: insertRes, error: insertErr } = await supabase.from('cycle_sessions').insert(inserts);
    if (insertErr) throw insertErr;

    return new Response(JSON.stringify({ inserted: insertRes?.length ?? 0 }), { status: 200 });
  } catch (err) {
    console.error('generate-cycle-sessions error', err?.message ?? err);
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500 });
  }
});
