// Server-side auth + rate-limit guard for the Anthropic-backed API routes.
//
// Why this exists: the API key never reaches the browser (it lives only in
// process.env on the server), so it can't be lifted from the bundle. The real
// risk is *proxy abuse* — anyone could POST to /api/ai-* and spend our credits.
// This guard closes that hole:
//   1. requires a valid Supabase session (anonymous traffic → 401)
//   2. enforces a per-user rate limit via the record_ai_usage RPC (→ 429)

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zigwrbvpeinczfwrvbiv.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppZ3dyYnZwZWluY3pmd3J2Yml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Mjg2MDAsImV4cCI6MjA5NzAwNDYwMH0.Tg7iu682OuSV7kBEZIoXUGe4WUOAwWfknTvf7J40r7I';

// Per-user limits. Generous for normal diary use, tight enough to bound abuse.
const MAX_PER_MINUTE = 8;
const MAX_PER_DAY = 150;

export interface AuthedContext {
  userId: string;
  supabase: SupabaseClient;
}

function bearerToken(req: NextRequest): string {
  const header = req.headers.get('authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

// Returns the authed context on success, or a NextResponse the caller should
// return directly (401 / 429 / 503) on failure.
export async function guardAiRequest(
  req: NextRequest,
): Promise<AuthedContext | NextResponse> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'no_key' }, { status: 503 });
  }

  const token = bearerToken(req);
  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // A per-request client scoped to the caller's JWT, so RPC runs as their uid.
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data: verdict, error: rpcErr } = await supabase.rpc('record_ai_usage', {
    p_max_min: MAX_PER_MINUTE,
    p_max_day: MAX_PER_DAY,
  });
  if (rpcErr) {
    // Fail closed: if we can't account for usage, don't spend credits.
    return NextResponse.json({ error: 'usage_check_failed' }, { status: 503 });
  }
  if (!verdict?.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', reason: verdict?.reason ?? 'rate_limited' },
      { status: 429 },
    );
  }

  return { userId: userData.user.id, supabase };
}
