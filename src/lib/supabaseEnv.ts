// Single source of truth for Supabase connection config.
//
// We deliberately DO NOT provide fallback values. If the env vars are missing
// at build/runtime, the app must fail fast with a clear error rather than
// silently connecting to a hardcoded (and possibly wrong) database. The anon
// key is public, so the risk isn't a leaked secret — it's a silent misconnect.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Set it in your deployment environment (.env.local for local dev).`,
    );
  }
  return value;
}

export const SUPABASE_URL = required(
  'NEXT_PUBLIC_SUPABASE_URL',
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const SUPABASE_ANON_KEY = required(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
