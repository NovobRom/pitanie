import { supabase } from '@/lib/supabaseClient';
import { MealItem, MealsState } from '@/types/nutrition';
import { Result } from './types';

const EMPTY_MEALS: MealsState = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
};

export async function loadDiary(userId: string, date: string): Promise<Result<MealsState>> {
  try {
    const { data, error } = await supabase
      .from('diary_entries')
      .select('id, meal_type, product_name, calories, protein, fat, carbs, grams')
      .eq('user_id', userId)
      .eq('date', date);

    if (error) {
      return {
        ok: false,
        error: { code: 'DIARY_LOAD_FAILED', message: 'Failed to load diary entries', details: error },
      };
    }

    const meals: MealsState = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    };

    if (data) {
      data.forEach((row: any) => {
        const mealType = row.meal_type as keyof MealsState;
        if (meals[mealType]) {
          meals[mealType].push({
            id: row.id,
            name: row.product_name,
            grams: Number(row.grams),
            kcal: Number(row.calories),
            protein: Number(row.protein),
            fat: Number(row.fat),
            carbs: Number(row.carbs),
          });
        }
      });
    }

    return { ok: true, data: meals };
  } catch (err) {
    return {
      ok: false,
      error: { code: 'DIARY_LOAD_ERROR', message: 'An unexpected error occurred loading the diary', details: err },
    };
  }
}

export async function addDiaryEntry(
  userId: string,
  date: string,
  mealType: string,
  entry: Omit<MealItem, 'id'>
): Promise<Result<MealItem>> {
  try {
    const { data, error } = await supabase
      .from('diary_entries')
      .insert({
        user_id: userId,
        date,
        meal_type: mealType,
        product_name: entry.name,
        calories: entry.kcal,
        protein: entry.protein,
        fat: entry.fat,
        carbs: entry.carbs,
        grams: entry.grams,
      })
      .select('id')
      .single();

    if (error) {
      return {
        ok: false,
        error: { code: 'DIARY_ADD_FAILED', message: 'Failed to add food entry', details: error },
      };
    }

    return {
      ok: true,
      data: {
        ...entry,
        id: data.id,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: { code: 'DIARY_ADD_ERROR', message: 'An unexpected error occurred adding food entry', details: err },
    };
  }
}

export async function removeDiaryEntry(id: string): Promise<Result<void>> {
  try {
    const { error } = await supabase.from('diary_entries').delete().eq('id', id);

    if (error) {
      return {
        ok: false,
        error: { code: 'DIARY_REMOVE_FAILED', message: 'Failed to remove food entry', details: error },
      };
    }

    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: { code: 'DIARY_REMOVE_ERROR', message: 'An unexpected error occurred removing food entry', details: err },
    };
  }
}
