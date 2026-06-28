// SWR-backed loader for a single day's diary (one row of the `plans` table,
// keyed by owner_id + date).
//
// Why SWR here: the previous useEffect fetch had to manually juggle loading
// state and was open to a race — switching dates quickly could let an older
// response overwrite a newer one. SWR keys the request by (user, date), dedups
// in-flight requests, caches per date (so revisiting a day is instant), and
// always resolves to the latest key's data. Optimistic edits still live in the
// page's local state; this hook owns the fetch/cache side only.

import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { Macros } from '@/types/nutrition';

export interface DiaryData {
  meals: Record<string, unknown[]>;
  goals?: Macros;
}

type DiaryKey = ['diary', string, string];

async function fetchDiary([, userId, date]: DiaryKey): Promise<DiaryData | null> {
  const { data, error } = await supabase
    .from('plans')
    .select('data')
    .eq('owner_id', userId)
    .eq('title', date)
    .maybeSingle();
  if (error) throw error;
  return (data?.data as DiaryData) ?? null;
}

export function useDiary(userId: string | null, date: string) {
  const key: DiaryKey | null = userId && date ? ['diary', userId, date] : null;
  const { data, error, isLoading, mutate } = useSWR(key, fetchDiary, {
    revalidateOnFocus: false,
  });
  return { diary: data, error, isLoading, mutate };
}
