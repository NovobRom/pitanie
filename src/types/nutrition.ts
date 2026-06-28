export interface NutritionValues {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

// For backwards compatibility and design docs
export type Macros = NutritionValues;

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

export interface MealItem {
  id?: string; // Database ID if saved individually
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface MealsState {
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
  snacks: MealItem[];
}
