import { createClient } from '@supabase/supabase-js';

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zigwrbvpeinczfwrvbiv.supabase.co';
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppZ3dyYnZwZWluY3pmd3J2Yml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Mjg2MDAsImV4cCI6MjA5NzAwNDYwMH0.Tg7iu682OuSV7kBEZIoXUGe4WUOAwWfknTvf7J40r7I';

export const supabase = createClient(url, key);
