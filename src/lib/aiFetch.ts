// Client helper: POST JSON to an AI endpoint with the Supabase access token
// attached. The server uses the token to authenticate the user and rate-limit
// per account (see src/lib/serverAuth.ts).

import { supabase } from './supabaseClient';

export async function aiPost(url: string, payload: unknown): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
}
