import { FoodProduct } from '@/types/nutrition';
import { Result } from './types';

export async function searchFood(query: string, token: string): Promise<Result<FoodProduct[]>> {
  try {
    const res = await fetch(`/api/search-food?q=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      return {
        ok: false,
        error: { code: 'UNAUTHORIZED', message: 'You must be logged in to search for food' },
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        error: { code: 'SEARCH_FAILED', message: 'Food search failed' },
      };
    }

    const data = await res.json();
    return { ok: true, data: data.products || [] };
  } catch (err) {
    return {
      ok: false,
      error: { code: 'SEARCH_ERROR', message: 'An unexpected error occurred during search', details: err },
    };
  }
}
