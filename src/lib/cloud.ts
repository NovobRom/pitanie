// Lightweight Supabase REST client for sharing plans in the cloud.
// We only need two RPC calls, so we use fetch directly instead of supabase-js.
//
// The publishable (anon) key is safe to embed in frontend code — access is
// enforced by Row Level Security + SECURITY DEFINER functions on the server.

import { ShareState } from './shareState';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zigwrbvpeinczfwrvbiv.supabase.co';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_OF3bYcNUiL4im8DMz_8e0A_A4SPnYfP';

export const cloudEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);

async function rpc<T>(fn: string, body: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Store a plan in the cloud, returning its short shareable id.
export async function createSharedPlan(title: string, data: ShareState): Promise<string | null> {
  return rpc<string>('create_shared_plan', { p_title: title, p_data: data });
}

// Fetch a previously-shared plan by id.
export async function getSharedPlan(id: string): Promise<ShareState | null> {
  return rpc<ShareState | null>('get_shared_plan', { p_id: id });
}
