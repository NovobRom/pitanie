// Curated food catalog for the auto meal-plan generator.
// Values are per 100 g of edible portion (grains/pasta as COOKED weight,
// so plate grams are intuitive). Macros from common nutrition databases.

export type FoodCategory = 'protein' | 'carb' | 'fat' | 'veg';

export interface FoodUnit {
  gramsPerPiece: number;
  labelRu: string;
  labelEn: string;
}

export interface CatalogFood {
  id: string;
  nameRu: string;
  nameEn: string;
  category: FoodCategory;
  vegetarian: boolean;
  per100: { kcal: number; protein: number; fat: number; carbs: number };
  // Foods normally counted in pieces (eggs, bananas, bread slices).
  unit?: FoodUnit;
}

export const foodCatalog: CatalogFood[] = [
  // ── Proteins ────────────────────────────────────────────────
  { id: 'chicken_breast', nameRu: 'Куриная грудка', nameEn: 'Chicken breast', category: 'protein', vegetarian: false, per100: { kcal: 165, protein: 31, fat: 3.6, carbs: 0 } },
  { id: 'turkey', nameRu: 'Индейка', nameEn: 'Turkey breast', category: 'protein', vegetarian: false, per100: { kcal: 135, protein: 29, fat: 1, carbs: 0 } },
  { id: 'beef', nameRu: 'Говядина постная', nameEn: 'Lean beef', category: 'protein', vegetarian: false, per100: { kcal: 187, protein: 26, fat: 9, carbs: 0 } },
  { id: 'salmon', nameRu: 'Лосось', nameEn: 'Salmon', category: 'protein', vegetarian: false, per100: { kcal: 208, protein: 20, fat: 13, carbs: 0 } },
  { id: 'cod', nameRu: 'Треска', nameEn: 'Cod', category: 'protein', vegetarian: false, per100: { kcal: 82, protein: 18, fat: 0.7, carbs: 0 } },
  { id: 'eggs', nameRu: 'Яйца', nameEn: 'Eggs', category: 'protein', vegetarian: true, per100: { kcal: 155, protein: 13, fat: 11, carbs: 1.1 }, unit: { gramsPerPiece: 55, labelRu: 'шт', labelEn: 'pcs' } },
  { id: 'cottage_cheese', nameRu: 'Творог 5%', nameEn: 'Cottage cheese', category: 'protein', vegetarian: true, per100: { kcal: 121, protein: 17, fat: 5, carbs: 3 } },
  { id: 'greek_yogurt', nameRu: 'Греческий йогурт', nameEn: 'Greek yogurt', category: 'protein', vegetarian: true, per100: { kcal: 59, protein: 10, fat: 0.4, carbs: 3.6 } },
  { id: 'tofu', nameRu: 'Тофу', nameEn: 'Tofu', category: 'protein', vegetarian: true, per100: { kcal: 76, protein: 8, fat: 4.8, carbs: 1.9 } },
  { id: 'whey', nameRu: 'Протеин (сывороточный)', nameEn: 'Whey protein', category: 'protein', vegetarian: true, per100: { kcal: 370, protein: 75, fat: 6, carbs: 8 } },

  // ── Carbs ───────────────────────────────────────────────────
  { id: 'buckwheat', nameRu: 'Гречка варёная', nameEn: 'Buckwheat (cooked)', category: 'carb', vegetarian: true, per100: { kcal: 92, protein: 3.4, fat: 0.6, carbs: 20 } },
  { id: 'rice', nameRu: 'Рис варёный', nameEn: 'Rice (cooked)', category: 'carb', vegetarian: true, per100: { kcal: 130, protein: 2.7, fat: 0.3, carbs: 28 } },
  { id: 'oats', nameRu: 'Овсянка варёная', nameEn: 'Oatmeal (cooked)', category: 'carb', vegetarian: true, per100: { kcal: 71, protein: 2.5, fat: 1.5, carbs: 12 } },
  { id: 'potato', nameRu: 'Картофель варёный', nameEn: 'Potato (boiled)', category: 'carb', vegetarian: true, per100: { kcal: 87, protein: 1.9, fat: 0.1, carbs: 20 } },
  { id: 'sweet_potato', nameRu: 'Батат', nameEn: 'Sweet potato', category: 'carb', vegetarian: true, per100: { kcal: 86, protein: 1.6, fat: 0.1, carbs: 20 } },
  { id: 'bread', nameRu: 'Хлеб цельнозерновой', nameEn: 'Whole-grain bread', category: 'carb', vegetarian: true, per100: { kcal: 247, protein: 13, fat: 3.4, carbs: 41 }, unit: { gramsPerPiece: 30, labelRu: 'ломтик', labelEn: 'slice' } },
  { id: 'pasta', nameRu: 'Паста варёная', nameEn: 'Pasta (cooked)', category: 'carb', vegetarian: true, per100: { kcal: 131, protein: 5, fat: 1.1, carbs: 25 } },
  { id: 'banana', nameRu: 'Банан', nameEn: 'Banana', category: 'carb', vegetarian: true, per100: { kcal: 89, protein: 1.1, fat: 0.3, carbs: 23 }, unit: { gramsPerPiece: 120, labelRu: 'шт', labelEn: 'pcs' } },
  { id: 'lentils', nameRu: 'Чечевица варёная', nameEn: 'Lentils (cooked)', category: 'carb', vegetarian: true, per100: { kcal: 116, protein: 9, fat: 0.4, carbs: 20 } },

  // ── Fats ────────────────────────────────────────────────────
  { id: 'olive_oil', nameRu: 'Оливковое масло', nameEn: 'Olive oil', category: 'fat', vegetarian: true, per100: { kcal: 884, protein: 0, fat: 100, carbs: 0 } },
  { id: 'butter', nameRu: 'Сливочное масло', nameEn: 'Butter', category: 'fat', vegetarian: true, per100: { kcal: 717, protein: 0.9, fat: 81, carbs: 0.1 } },
  { id: 'almonds', nameRu: 'Миндаль', nameEn: 'Almonds', category: 'fat', vegetarian: true, per100: { kcal: 579, protein: 21, fat: 50, carbs: 22 } },
  { id: 'peanut_butter', nameRu: 'Арахисовая паста', nameEn: 'Peanut butter', category: 'fat', vegetarian: true, per100: { kcal: 588, protein: 25, fat: 50, carbs: 20 } },
  { id: 'avocado', nameRu: 'Авокадо', nameEn: 'Avocado', category: 'fat', vegetarian: true, per100: { kcal: 160, protein: 2, fat: 15, carbs: 9 } },

  // ── Vegetables (volume, low cal) ────────────────────────────
  { id: 'broccoli', nameRu: 'Брокколи', nameEn: 'Broccoli', category: 'veg', vegetarian: true, per100: { kcal: 34, protein: 2.8, fat: 0.4, carbs: 7 } },
  { id: 'cucumber', nameRu: 'Огурец', nameEn: 'Cucumber', category: 'veg', vegetarian: true, per100: { kcal: 15, protein: 0.7, fat: 0.1, carbs: 3.6 } },
  { id: 'tomato', nameRu: 'Помидор', nameEn: 'Tomato', category: 'veg', vegetarian: true, per100: { kcal: 18, protein: 0.9, fat: 0.2, carbs: 3.9 } },
  { id: 'spinach', nameRu: 'Шпинат', nameEn: 'Spinach', category: 'veg', vegetarian: true, per100: { kcal: 23, protein: 2.9, fat: 0.4, carbs: 3.6 } },
  { id: 'mixed_veg', nameRu: 'Овощной салат', nameEn: 'Mixed salad', category: 'veg', vegetarian: true, per100: { kcal: 25, protein: 1.3, fat: 0.1, carbs: 5 } },
];

export function foodName(food: CatalogFood, lang: 'ru' | 'en'): string {
  return lang === 'ru' ? food.nameRu : food.nameEn;
}

// Snap a raw gram amount to a practical value: whole pieces for piece-foods,
// otherwise the nearest 5 g.
export function snapGrams(food: CatalogFood, grams: number): number {
  if (food.unit) {
    const pieces = Math.max(1, Math.round(grams / food.unit.gramsPerPiece));
    return pieces * food.unit.gramsPerPiece;
  }
  return Math.max(5, Math.round(grams / 5) * 5);
}

// Human-readable amount, e.g. "3 шт · 165 г" for eggs, "180 г" for chicken.
export function formatAmount(food: CatalogFood, grams: number, lang: 'ru' | 'en'): string {
  const g = lang === 'ru' ? 'г' : 'g';
  if (food.unit) {
    const pieces = Math.max(1, Math.round(grams / food.unit.gramsPerPiece));
    const label = lang === 'ru' ? food.unit.labelRu : food.unit.labelEn;
    return `${pieces} ${label} · ${grams} ${g}`;
  }
  return `${grams} ${g}`;
}
