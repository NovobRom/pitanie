// Supabase client for sharing plans and listing owned plans.
// Uses supabase-js so the auth session JWT is automatically included in requests,
// which lets the DB SECURITY DEFINER functions see auth.uid().

import { supabase } from './supabaseClient';
import { ShareState } from './shareState';

export const cloudEnabled = true;

// Store a plan in the cloud, returning its short shareable id.
export async function createSharedPlan(title: string, data: ShareState): Promise<string | null> {
  const { data: id, error } = await supabase.rpc('create_shared_plan', {
    p_title: title,
    p_data: data,
  });
  if (error) return null;
  return id as string;
}

// Fetch a previously-shared plan by id.
export async function getSharedPlan(id: string): Promise<ShareState | null> {
  const { data, error } = await supabase.rpc('get_shared_plan', { p_id: id });
  if (error) return null;
  return data as ShareState | null;
}

export interface SavedPlan {
  id: string;
  title: string | null;
  created_at: string;
  data: ShareState;
}

// List all plans owned by the currently authenticated user.
export async function listMyPlans(): Promise<SavedPlan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('id, title, created_at, data')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as SavedPlan[];
}
