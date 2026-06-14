// Auto meal-plan generator: works backwards from a macro target.
// Strategy: split daily macros across meals, then per meal use a protein-first
// greedy fill — pick a protein, fat, carb and veg source and solve grams so the
// meal's protein / fat / carb targets are approximately met.

import { Macros } from './nutrition';
import { CatalogFood, FoodCategory, foodCatalog } from './foodCatalog';

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

const MEAL_SPLIT: Record<MealType, number> = {
  breakfast: 0.3,
  lunch: 0.4,
  dinner: 0.3,
};

const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function round5(v: number): number {
  return Math.round(v / 5) * 5;
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

export function generatePlan(target: Macros, opts: GenerateOptions): GeneratedPlan {
  const pool = opts.vegetarian ? foodCatalog.filter((f) => f.vegetarian) : foodCatalog;
  const byCat = (c: FoodCategory) => shuffle(pool.filter((f) => f.category === c));

  const proteins = byCat('protein');
  const carbs = byCat('carb');
  const fats = byCat('fat');
  const vegs = byCat('veg');

  const meals: PlannedMeal[] = MEALS.map((meal, i) => {
    const ratio = MEAL_SPLIT[meal];
    const targetProtein = target.protein * ratio;
    const targetFat = target.fat * ratio;
    const targetCarbs = target.carbs * ratio;

    // Rotate through shuffled pools so meals use different foods.
    const pf = proteins[i % proteins.length];
    const ff = fats[i % fats.length];
    const cf = carbs[i % carbs.length];
    const vf = vegs[i % vegs.length];

    const items: PlanItem[] = [];

    // 1. Protein source covers the meal's protein target.
    const gProtein = round5(clamp((targetProtein * 100) / pf.per100.protein, 30, 350));
    items.push({ food: pf, grams: gProtein });

    // 2. Fat source covers remaining fat after the protein food.
    const fatFromProtein = (gProtein * pf.per100.fat) / 100;
    const gFat = round5(clamp(((targetFat - fatFromProtein) * 100) / ff.per100.fat, 0, 40));
    if (gFat >= 5) items.push({ food: ff, grams: gFat });

    // 3. Carb source covers remaining carbs after protein + fat foods.
    const carbsSoFar =
      (gProtein * pf.per100.carbs) / 100 + (gFat * ff.per100.carbs) / 100;
    const gCarb = round5(clamp(((targetCarbs - carbsSoFar) * 100) / cf.per100.carbs, 0, 400));
    if (gCarb >= 5) items.push({ food: cf, grams: gCarb });

    // 4. Vegetables for volume/micros (fixed portion).
    items.push({ food: vf, grams: 100 });

    return { meal, items, macros: sumMacros(items) };
  });

  const totals = sumMacros(meals.flatMap((m) => m.items));

  return { meals, totals };
}
