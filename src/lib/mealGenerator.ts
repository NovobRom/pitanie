// Auto meal-plan generator: works backwards from a macro target.
//
// 1. Pick a protein / carb / fat / veg source for each meal (shuffled for variety).
// 2. Seed grams from a per-meal split so meals are sensibly proportioned.
// 3. Solve grams at the DAY level with an iterative Gauss-Seidel pass: repeatedly
//    rescale each macro's sources so the day's protein, carbs and fat converge on
//    target. Cross-effects between macros are small, so a few passes converge well.
// 4. Snap to practical amounts (whole eggs/bananas, nearest 5 g otherwise).

import { Macros } from '@/types/nutrition';
import { CatalogFood, FoodCategory, foodCatalog, snapGrams } from './foodCatalog';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface PlanItem {
  food: CatalogFood;
  grams: number;
}

export interface PlannedMeal {
  meal: MealType;
  items: PlanItem[];
  macros: Macros;
}

export interface GeneratedPlan {
  meals: PlannedMeal[];
  totals: Macros;
}

export interface GenerateOptions {
  vegetarian: boolean;
}

type MacroRole = 'protein' | 'carb' | 'fat';

const MEAL_SPLIT: Record<MealType, number> = {
  breakfast: 0.3,
  lunch: 0.4,
  dinner: 0.3,
};

const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner'];
const ROLES: MacroRole[] = ['protein', 'carb', 'fat'];

// Map a food category / macro role to the matching per-100g nutrient key.
const ROLE_KEY: Record<MacroRole, keyof CatalogFood['per100']> = {
  protein: 'protein',
  carb: 'carbs',
  fat: 'fat',
};

interface WorkItem {
  food: CatalogFood;
  grams: number;
  role: FoodCategory;
  meal: MealType;
  locked: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function macrosOf(food: CatalogFood, grams: number): Macros {
  const f = grams / 100;
  const r = (v: number) => Math.round(v * 10) / 10;
  return {
    calories: Math.round(food.per100.kcal * f),
    protein: r(food.per100.protein * f),
    fat: r(food.per100.fat * f),
    carbs: r(food.per100.carbs * f),
  };
}

function sumMacros(items: PlanItem[]): Macros {
  return items.reduce<Macros>(
    (acc, it) => {
      const m = macrosOf(it.food, it.grams);
      return {
        calories: acc.calories + m.calories,
        protein: Math.round((acc.protein + m.protein) * 10) / 10,
        fat: Math.round((acc.fat + m.fat) * 10) / 10,
        carbs: Math.round((acc.carbs + m.carbs) * 10) / 10,
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

// grams of a macro contributed per 1 gram of food
function densfor(food: CatalogFood, role: MacroRole): number {
  return food.per100[ROLE_KEY[role]] / 100;
}

export function generatePlan(target: Macros, opts: GenerateOptions): GeneratedPlan {
  const plannable = foodCatalog.filter((f) => !f.searchOnly);
  const pool = opts.vegetarian ? plannable.filter((f) => f.vegetarian) : plannable;
  const byCat = (c: FoodCategory) => shuffle(pool.filter((f) => f.category === c));

  // Protein choice must respect the "fat budget": a protein's own fat per gram of
  // protein can't exceed the day's fat/protein ratio, otherwise fat overshoots
  // (e.g. salmon carries ~0.65 g fat per g protein — too much for a lean target).
  const ratioBudget = target.protein > 0 ? target.fat / target.protein : 0.4;
  const fatPerProtein = (f: CatalogFood) => f.per100.fat / Math.max(1, f.per100.protein);
  const allProteins = pool.filter((f) => f.category === 'protein');
  const eligible = allProteins.filter((f) => fatPerProtein(f) <= ratioBudget * 1.15);
  const proteins =
    eligible.length >= 2
      ? shuffle(eligible)
      : [...allProteins].sort((a, b) => fatPerProtein(a) - fatPerProtein(b)).slice(0, 4);

  const carbs = byCat('carb');
  const fats = byCat('fat');
  const vegs = byCat('veg');

  // ── 1 & 2. Choose foods and seed grams from the per-meal split ──────────────
  const items: WorkItem[] = [];
  MEALS.forEach((meal, i) => {
    const ratio = MEAL_SPLIT[meal];
    const pf = proteins[i % proteins.length];
    const cf = carbs[i % carbs.length];
    const ff = fats[i % fats.length];
    const vf = vegs[i % vegs.length];

    const seedProtein = clamp((target.protein * ratio * 100) / pf.per100.protein, 30, 300);
    const seedCarb = clamp((target.carbs * ratio * 100) / cf.per100.carbs, 30, 300);

    items.push({ food: pf, grams: seedProtein, role: 'protein', meal, locked: false });
    items.push({ food: cf, grams: seedCarb, role: 'carb', meal, locked: false });
    items.push({ food: ff, grams: 8, role: 'fat', meal, locked: false });
    // Vegetables: fixed volume, never scaled.
    items.push({ food: vf, grams: 100, role: 'veg', meal, locked: true });
  });

  // ── 3. Day-level Gauss-Seidel: rescale each macro's unlocked sources toward
  //       target. Locked items (veg, snapped piece-foods) count as fixed. ──────
  const targetFor: Record<MacroRole, number> = {
    protein: target.protein,
    carb: target.carbs,
    fat: target.fat,
  };

  const solve = (iterations: number) => {
    for (let iter = 0; iter < iterations; iter++) {
      for (const role of ROLES) {
        const adjustable = items.filter((it) => it.role === role && !it.locked);
        if (adjustable.length === 0) continue;

        // Macro supplied by everything that won't be scaled in this step.
        const fixed = items
          .filter((it) => !(it.role === role && !it.locked))
          .reduce((s, it) => s + densfor(it.food, role) * it.grams, 0);
        const fromAdj = adjustable.reduce((s, it) => s + densfor(it.food, role) * it.grams, 0);
        if (fromAdj <= 0) continue;

        const factor = clamp((targetFor[role] - fixed) / fromAdj, 0.15, 6);
        adjustable.forEach((it) => {
          it.grams = clamp(it.grams * factor, 0, 600);
        });
      }
    }
  };

  // Phase 1: solve everything continuously.
  solve(12);
  // Phase 2: snap & lock piece-foods (whole eggs/bananas/slices), then let the
  // continuous foods absorb the rounding so day totals stay on target.
  items.forEach((it) => {
    if (it.food.unit) {
      it.grams = snapGrams(it.food, it.grams);
      it.locked = true;
    }
  });
  solve(10);

  // ── 4. Snap remaining continuous foods and assemble meals ───────────────────
  items.forEach((it) => {
    if (!it.food.unit) it.grams = snapGrams(it.food, it.grams);
  });

  const meals: PlannedMeal[] = MEALS.map((meal) => {
    const mealItems = items
      .filter((it) => it.meal === meal && it.grams > 0)
      .map<PlanItem>((it) => ({ food: it.food, grams: it.grams }));
    return { meal, items: mealItems, macros: sumMacros(mealItems) };
  });

  const totals = sumMacros(meals.flatMap((m) => m.items));

  return { meals, totals };
}
