import { createClient } from '@supabase/supabase-js';

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zigwrbvpeinczfwrvbiv.supabase.co';
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_OF3bYcNUiL4im8DMz_8e0A_A4SPnYfP';

export const supabase = createClient(url, key);
