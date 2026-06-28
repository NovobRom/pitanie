// Shared nutrition types and calculations.

import { Macros, FoodProduct, Sex, Activity, Goal, CalcParams } from '@/types/nutrition';

export const ACTIVITY_MULT: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Goal as a percentage adjustment to TDEE (evidence-based: ~20% deficit, ~15% surplus)
export const GOAL_FACTOR: Record<Goal, number> = {
  lose: 0.8,
  maintain: 1.0,
  gain: 1.15,
};

export interface CalcResult {
  bmr: number;
  tdee: number;
  goals: Macros;
  formula: 'Mifflin-St Jeor' | 'Katch-McArdle';
}

export interface ValidationError {
  field: keyof CalcParams;
  message: string;
}

export type CalcResultUnion = 
  | { ok: true; data: CalcResult }
  | { ok: false; errors: ValidationError[] };

export function calcGoals(p: CalcParams): CalcResultUnion {
  const errors: ValidationError[] = [];

  const w = parseFloat(p.weight);
  if (isNaN(w) || w < 20 || w > 500) {
    errors.push({ field: 'weight', message: 'Weight must be between 20 and 500 kg' });
  }

  const h = parseFloat(p.height);
  if (isNaN(h) || h < 50 || h > 300) {
    errors.push({ field: 'height', message: 'Height must be between 50 and 300 cm' });
  }

  const a = parseFloat(p.age);
  if (isNaN(a) || a < 1 || a > 150) {
    errors.push({ field: 'age', message: 'Age must be between 1 and 150 years' });
  }

  const bf = p.bodyFat ? parseFloat(p.bodyFat) : NaN;
  if (p.bodyFat && (isNaN(bf) || bf < 1 || bf > 70)) {
    errors.push({ field: 'bodyFat', message: 'Body fat must be between 1% and 70%' });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  let bmr: number;
  let formula: CalcResult['formula'];

  if (!isNaN(bf) && bf > 0 && bf < 70) {
    // Katch-McArdle: based on lean body mass
    const lbm = w * (1 - bf / 100);
    bmr = 370 + 21.6 * lbm;
    formula = 'Katch-McArdle';
  } else {
    // Mifflin-St Jeor
    bmr = p.sex === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    formula = 'Mifflin-St Jeor';
  }

  const tdee = bmr * ACTIVITY_MULT[p.activity];
  const calories = Math.round(tdee * GOAL_FACTOR[p.goal]);

  // Protein-first: protein from g/kg, fat from % of calories, carbs fill remainder.
  const protein = Math.round(w * p.proteinPerKg);
  const fat = Math.round((calories * (p.fatPct / 100)) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return {
    ok: true,
    data: {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      formula,
      goals: { calories, protein, fat, carbs },
    },
  };
}

export function macrosForGrams(product: FoodProduct, grams: number): Macros {
  const n = product.nutriments;
  const f = grams / 100;
  const r = (v: number) => Math.round(v * 10) / 10;
  return {
    calories: Math.round((n['energy-kcal_100g'] ?? 0) * f),
    protein: r((n.proteins_100g ?? 0) * f),
    fat: r((n.fat_100g ?? 0) * f),
    carbs: r((n.carbohydrates_100g ?? 0) * f),
  };
}
