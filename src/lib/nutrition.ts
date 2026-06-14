// Shared nutrition types and calculations.

export interface Macros {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface FoodProduct {
  product_name: string;
  nutriments: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    fat_100g?: number;
    carbohydrates_100g?: number;
  };
  image_front_small_url?: string;
}

export type Sex = 'male' | 'female';
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose' | 'maintain' | 'gain';

export interface CalcParams {
  weight: string;
  height: string;
  age: string;
  sex: Sex;
  bodyFat: string;
  activity: Activity;
  goal: Goal;
  proteinPerKg: number; // g per kg bodyweight
  fatPct: number; // % of total calories from fat
}

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

export function calcGoals(p: CalcParams): CalcResult | null {
  const w = parseFloat(p.weight);
  const h = parseFloat(p.height);
  const a = parseFloat(p.age);
  if (!w || !h || !a) return null;

  const bf = parseFloat(p.bodyFat);
  let bmr: number;
  let formula: CalcResult['formula'];

  if (bf && bf > 0 && bf < 70) {
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
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    formula,
    goals: { calories, protein, fat, carbs },
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

// ── Adaptive TDEE ──────────────────────────────────────────────────────────────

export interface WeightSample { date: string; weight_kg: number }
export interface DiarySum { date: string; kcal: number }

export interface AdaptiveTDEEResult {
  estimatedTDEE: number;
  daysOfData: number;
  delta: number; // difference vs current goal (positive = eating more than needed)
}

// Estimates real TDEE from weight trend + calorie intake.
// Requires at least two weight entries spanning 7+ days with diary coverage.
// Uses 1 kg body fat ≈ 7700 kcal energy balance.
export function calculateAdaptiveTDEE(
  weights: WeightSample[],
  diarySums: DiarySum[],
  currentGoalCalories: number,
): AdaptiveTDEEResult | null {
  if (weights.length < 2) return null;

  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const kcalByDate = new Map(diarySums.map((d) => [d.date, d.kcal]));

  const estimates: { tdee: number; days: number }[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const w1 = sorted[i];
    const w2 = sorted[sorted.length - 1]; // always compare to most recent
    if (i === sorted.length - 1) break;

    const d1 = new Date(w1.date + 'T00:00:00');
    const d2 = new Date(w2.date + 'T00:00:00');
    const days = Math.round((d2.getTime() - d1.getTime()) / 86_400_000);
    if (days < 7) continue;

    let totalKcal = 0;
    let daysLogged = 0;
    const cur = new Date(d1);
    while (cur <= d2) {
      const ds = cur.toISOString().slice(0, 10);
      const k = kcalByDate.get(ds);
      if (k && k > 300) { totalKcal += k; daysLogged++; }
      cur.setDate(cur.getDate() + 1);
    }
    if (daysLogged < Math.max(4, days * 0.4)) continue;

    const avgKcal = totalKcal / daysLogged;
    const weightChangeKcal = (w2.weight_kg - w1.weight_kg) * 7700;
    const tdee = avgKcal - weightChangeKcal / days;
    if (tdee > 800 && tdee < 6000) estimates.push({ tdee, days });
  }

  if (estimates.length === 0) return null;

  // Weight by span: longer intervals → more reliable
  const totalDays = estimates.reduce((s, e) => s + e.days, 0);
  const estimatedTDEE = Math.round(
    estimates.reduce((s, e) => s + e.tdee * (e.days / totalDays), 0),
  );

  return {
    estimatedTDEE,
    daysOfData: totalDays,
    delta: currentGoalCalories - estimatedTDEE,
  };
}
