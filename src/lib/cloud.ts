// Supabase client for sharing plans and listing owned plans.
// Uses supabase-js so the auth session JWT is automatically included in requests,
// which lets the DB SECURITY DEFINER functions see auth.uid().

import { supabase } from './supabaseClient';
import { ShareState } from './shareState';
import { Macros } from './nutrition';

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

// ── Profile ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  sex: 'male' | 'female';
  age: number;
  height: number;
  activity: string;
  goal: string;
  protein_ratio: number;
  fat_ratio: number;
  goals: Macros | null;
  locale: string;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('sex, age, height, activity, goal, protein_ratio, fat_ratio, goals, locale')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as UserProfile;
}

export async function saveProfile(profile: Partial<UserProfile> & { goals: Macros }): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: (await supabase.auth.getUser()).data.user?.id, ...profile }, { onConflict: 'id' });
  return !error;
}

// ── Weights ────────────────────────────────────────────────────────────────────

export interface WeightEntry {
  date: string;
  weight_kg: number;
}

export async function logWeight(date: string, kg: number): Promise<boolean> {
  const { error } = await supabase
    .from('weights')
    .upsert({ user_id: (await supabase.auth.getUser()).data.user?.id, date, weight_kg: kg }, { onConflict: 'user_id,date' });
  return !error;
}

export async function getWeights(limit = 30): Promise<WeightEntry[]> {
  const { data, error } = await supabase
    .from('weights')
    .select('date, weight_kg')
    .order('date', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as WeightEntry[];
}
