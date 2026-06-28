import { supabase } from '@/lib/supabaseClient';
import { CalcParams, Macros } from '@/types/nutrition';
import { Result } from './types';

export interface UserProfileData {
  profile: CalcParams | null;
  goals: Macros | null;
}

export async function loadProfile(userId: string): Promise<Result<UserProfileData>> {
  try {
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('weight, height, age, sex, body_fat, activity, goal')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      return {
        ok: false,
        error: { code: 'PROFILE_LOAD_FAILED', message: 'Failed to load user profile', details: profileError },
      };
    }

    // Fetch goals
    const { data: goalsData, error: goalsError } = await supabase
      .from('goals')
      .select('calories, protein, fat, carbs')
      .eq('user_id', userId)
      .maybeSingle();

    if (goalsError) {
      return {
        ok: false,
        error: { code: 'GOALS_LOAD_FAILED', message: 'Failed to load user goals', details: goalsError },
      };
    }

    let profile: CalcParams | null = null;
    if (profileData) {
      profile = {
        weight: String(profileData.weight),
        height: String(profileData.height),
        age: String(profileData.age),
        sex: profileData.sex as any,
        bodyFat: profileData.body_fat ? String(profileData.body_fat) : '',
        activity: profileData.activity as any,
        goal: profileData.goal as any,
        proteinPerKg: 2.0, // defaults, calculator will handle actual values
        fatPct: 25,
      };
    }

    let goals: Macros | null = null;
    if (goalsData) {
      goals = {
        calories: Number(goalsData.calories),
        protein: Number(goalsData.protein),
        fat: Number(goalsData.fat),
        carbs: Number(goalsData.carbs),
      };
    }

    return {
      ok: true,
      data: { profile, goals },
    };
  } catch (err) {
    return {
      ok: false,
      error: { code: 'PROFILE_LOAD_ERROR', message: 'An unexpected error occurred loading profile', details: err },
    };
  }
}

export async function saveProfileAndGoals(
  userId: string,
  profile: CalcParams,
  goals: Macros
): Promise<Result<void>> {
  try {
    // 1. Save profile
    const { error: profileError } = await supabase.from('user_profiles').upsert({
      user_id: userId,
      weight: parseFloat(profile.weight),
      height: parseFloat(profile.height),
      age: parseInt(profile.age, 10),
      sex: profile.sex,
      body_fat: profile.bodyFat ? parseFloat(profile.bodyFat) : null,
      activity: profile.activity,
      goal: profile.goal,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      return {
        ok: false,
        error: { code: 'PROFILE_SAVE_FAILED', message: 'Failed to save user profile', details: profileError },
      };
    }

    // 2. Save goals
    const { error: goalsError } = await supabase.from('goals').upsert({
      user_id: userId,
      calories: goals.calories,
      protein: goals.protein,
      fat: goals.fat,
      carbs: goals.carbs,
      updated_at: new Date().toISOString(),
    });

    if (goalsError) {
      return {
        ok: false,
        error: { code: 'GOALS_SAVE_FAILED', message: 'Failed to save goals', details: goalsError },
      };
    }

    // 3. Save goals to auth user metadata so it behaves as cache (for backwards compatibility/easy loading)
    await supabase.auth.updateUser({
      data: { goals },
    });

    // 4. Log current weight to weight history automatically
    await supabase.from('weight_history').upsert({
      user_id: userId,
      weight: parseFloat(profile.weight),
      date: new Date().toISOString().split('T')[0],
    });

    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: { code: 'PROFILE_SAVE_ERROR', message: 'An unexpected error occurred saving profile', details: err },
    };
  }
}

export interface WeightEntry {
  id?: string;
  date: string;
  weight: number;
}

export async function loadWeightHistory(userId: string): Promise<Result<WeightEntry[]>> {
  try {
    const { data, error } = await supabase
      .from('weight_history')
      .select('date, weight')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .limit(30);

    if (error) {
      return {
        ok: false,
        error: { code: 'WEIGHT_LOAD_FAILED', message: 'Failed to load weight history', details: error },
      };
    }

    return {
      ok: true,
      data: data.map((d: any) => ({ date: d.date, weight: Number(d.weight) })),
    };
  } catch (err) {
    return {
      ok: false,
      error: { code: 'WEIGHT_LOAD_ERROR', message: 'An unexpected error occurred loading weight history', details: err },
    };
  }
}

export async function logWeight(userId: string, weight: number, dateStr: string): Promise<Result<void>> {
  try {
    const { error } = await supabase.from('weight_history').upsert({
      user_id: userId,
      weight,
      date: dateStr,
    });

    if (error) {
      return {
        ok: false,
        error: { code: 'WEIGHT_LOG_FAILED', message: 'Failed to log weight', details: error },
      };
    }

    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: { code: 'WEIGHT_LOG_ERROR', message: 'An unexpected error occurred logging weight', details: err },
    };
  }
}
