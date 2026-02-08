export type Person = 'roman' | 'liza';

export interface Portion {
  roman: string | number;
  liza: string | number;
}

export interface MealItem {
  name: string;
  portion?: Portion | string;
  note?: string;
  romanOnly?: string;
  lizaOnly?: string;
}

export interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner';
  icon: string;
  items: MealItem[];
  calories: Portion;
}

export interface Day {
  dayName: string;
  grain: string;
  grainType: 'grechka' | 'rice' | 'pasta' | 'potato';
  meals: Meal[];
  isCheatDay?: boolean;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface Product {
  emoji: string;
  name: string;
  roman: string;
  liza: string;
  highlighted?: boolean;
}
