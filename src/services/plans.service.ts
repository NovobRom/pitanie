import { supabase } from '@/lib/supabaseClient';
import { SavedPlan } from '@/lib/cloud';
import { Result } from './types';

export async function createSharedPlan(title: string, data: any): Promise<Result<string>> {
  try {
    const { data: id, error } = await supabase.rpc('create_shared_plan', {
      p_title: title,
      p_data: data,
    });

    if (error) {
      return {
        ok: false,
        error: { code: 'PLAN_CREATE_FAILED', message: 'Failed to share plan', details: error },
      };
    }

    return { ok: true, data: id as string };
  } catch (err) {
    return {
      ok: false,
      error: { code: 'PLAN_CREATE_ERROR', message: 'An unexpected error occurred while sharing the plan', details: err },
    };
  }
}

export async function getSharedPlan(id: string): Promise<Result<any>> {
  try {
    const { data, error } = await supabase.rpc('get_shared_plan', { p_id: id });

    if (error) {
      return {
        ok: false,
        error: { code: 'PLAN_FETCH_FAILED', message: 'Failed to load shared plan', details: error },
      };
    }

    if (!data) {
      return {
        ok: false,
        error: { code: 'PLAN_NOT_FOUND', message: 'Shared plan not found' },
      };
    }

    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: { code: 'PLAN_FETCH_ERROR', message: 'An unexpected error occurred while loading the plan', details: err },
    };
  }
}

export async function listMyPlans(): Promise<Result<SavedPlan[]>> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('id, title, created_at, data')
      .order('created_at', { ascending: false });

    if (error) {
      return {
        ok: false,
        error: { code: 'PLANS_LIST_FAILED', message: 'Failed to list plans', details: error },
      };
    }

    return { ok: true, data: (data ?? []) as SavedPlan[] };
  } catch (err) {
    return {
      ok: false,
      error: { code: 'PLANS_LIST_ERROR', message: 'An unexpected error occurred while listing plans', details: err },
    };
  }
}
