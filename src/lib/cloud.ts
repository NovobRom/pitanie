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

// ── Recipes ────────────────────────────────────────────────────────────────────

export interface RecipeItem {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
}

export interface Recipe {
  id: string;
  name: string;
  serving_g: number;
  items: RecipeItem[];
  kcal: number;    // per 100g
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

export async function getRecipes(): Promise<Recipe[]> {
  const { data } = await supabase
    .from('recipes')
    .select('id, name, serving_g, items, kcal, protein, fat, carbs, fiber')
    .order('created_at', { ascending: false });
  return (data ?? []) as Recipe[];
}

export async function saveRecipe(recipe: Omit<Recipe, 'id'>): Promise<Recipe | null> {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return null;
  const { data, error } = await supabase
    .from('recipes')
    .insert({ user_id: userId, ...recipe })
    .select()
    .single();
  if (error) return null;
  return data as Recipe;
}

export async function deleteRecipe(id: string): Promise<boolean> {
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  return !error;
}

// ── Recent Foods ───────────────────────────────────────────────────────────────

export interface RecentFood {
  name: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  lastGrams: number;
  count: number;
}

export async function getRecentFoods(limit = 10): Promise<RecentFood[]> {
  const { data } = await supabase
    .from('plans')
    .select('data')
    .order('title', { ascending: false })
    .limit(14);

  if (!data) return [];

  const foodMap = new Map<string, RecentFood>();

  for (const plan of data) {
    const meals = plan.data?.meals || {};
    for (const mealItems of Object.values(meals)) {
      for (const item of mealItems as any[]) {
        if (!item?.name) continue;
        const key = item.name.toLowerCase().trim();
        const existing = foodMap.get(key);
        if (existing) {
          existing.count++;
          existing.lastGrams = item.grams;
        } else {
          foodMap.set(key, {
            name: item.name,
            kcal: item.kcal ?? 0,
            protein: item.protein ?? 0,
            fat: item.fat ?? 0,
            carbs: item.carbs ?? 0,
            lastGrams: item.grams ?? 100,
            count: 1,
          });
        }
      }
    }
  }

  return Array.from(foodMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
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

// ── Diary calorie sums ─────────────────────────────────────────────────────────

export interface DiaryCalSum { date: string; kcal: number }

export async function getDiarySums(days = 60): Promise<DiaryCalSum[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const { data } = await supabase
    .from('plans')
    .select('title, data')
    .gte('title', cutoffStr)
    .order('title', { ascending: false });

  if (!data) return [];

  return data
    .map((plan) => {
      const meals = plan.data?.meals || {};
      let kcal = 0;
      for (const items of Object.values(meals)) {
        for (const item of items as any[]) {
          if (item?.kcal && item?.grams) kcal += (item.kcal * item.grams) / 100;
        }
      }
      return { date: plan.title as string, kcal: Math.round(kcal) };
    })
    .filter((s) => s.date && s.kcal > 0);
}
