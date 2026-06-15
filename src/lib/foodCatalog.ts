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
  // searchOnly foods enrich manual search but are excluded from the
  // auto meal-plan generator (e.g. fruit, sweets, dairy drinks, sauces).
  searchOnly?: boolean;
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

  // ── Everyday foods (search-only, excluded from the meal planner) ─────────────
  // Dairy
  { id: 'milk_whole', nameRu: 'Молоко 3.2%', nameEn: 'Milk (whole)', category: 'protein', vegetarian: true, searchOnly: true, per100: { kcal: 60, protein: 3.2, fat: 3.2, carbs: 4.7 } },
  { id: 'milk_skim', nameRu: 'Молоко обезжиренное', nameEn: 'Skim milk', category: 'protein', vegetarian: true, searchOnly: true, per100: { kcal: 34, protein: 3.4, fat: 0.1, carbs: 5 } },
  { id: 'kefir', nameRu: 'Кефир 2.5%', nameEn: 'Kefir', category: 'protein', vegetarian: true, searchOnly: true, per100: { kcal: 53, protein: 3.4, fat: 2.5, carbs: 4 } },
  { id: 'sour_cream', nameRu: 'Сметана 20%', nameEn: 'Sour cream', category: 'fat', vegetarian: true, searchOnly: true, per100: { kcal: 206, protein: 2.8, fat: 20, carbs: 3.4 } },
  { id: 'cheese_hard', nameRu: 'Сыр твёрдый', nameEn: 'Hard cheese', category: 'fat', vegetarian: true, searchOnly: true, per100: { kcal: 364, protein: 25, fat: 30, carbs: 0 } },
  { id: 'mozzarella', nameRu: 'Моцарелла', nameEn: 'Mozzarella', category: 'protein', vegetarian: true, searchOnly: true, per100: { kcal: 280, protein: 22, fat: 22, carbs: 2.2 } },
  { id: 'feta', nameRu: 'Фета', nameEn: 'Feta cheese', category: 'fat', vegetarian: true, searchOnly: true, per100: { kcal: 264, protein: 14, fat: 21, carbs: 4 } },
  { id: 'cream_cheese', nameRu: 'Сливочный сыр', nameEn: 'Cream cheese', category: 'fat', vegetarian: true, searchOnly: true, per100: { kcal: 342, protein: 6, fat: 34, carbs: 4 } },

  // Fruits
  { id: 'apple', nameRu: 'Яблоко', nameEn: 'Apple', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 52, protein: 0.3, fat: 0.2, carbs: 14 }, unit: { gramsPerPiece: 180, labelRu: 'шт', labelEn: 'pcs' } },
  { id: 'orange', nameRu: 'Апельсин', nameEn: 'Orange', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 47, protein: 0.9, fat: 0.1, carbs: 12 }, unit: { gramsPerPiece: 150, labelRu: 'шт', labelEn: 'pcs' } },
  { id: 'pear', nameRu: 'Груша', nameEn: 'Pear', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 57, protein: 0.4, fat: 0.1, carbs: 15 }, unit: { gramsPerPiece: 170, labelRu: 'шт', labelEn: 'pcs' } },
  { id: 'grapes', nameRu: 'Виноград', nameEn: 'Grapes', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 69, protein: 0.7, fat: 0.2, carbs: 18 } },
  { id: 'strawberry', nameRu: 'Клубника', nameEn: 'Strawberry', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 33, protein: 0.7, fat: 0.3, carbs: 8 } },
  { id: 'blueberry', nameRu: 'Черника', nameEn: 'Blueberry', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 57, protein: 0.7, fat: 0.3, carbs: 14 } },
  { id: 'watermelon', nameRu: 'Арбуз', nameEn: 'Watermelon', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 30, protein: 0.6, fat: 0.2, carbs: 8 } },
  { id: 'mandarin', nameRu: 'Мандарин', nameEn: 'Mandarin', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 53, protein: 0.8, fat: 0.3, carbs: 13 }, unit: { gramsPerPiece: 90, labelRu: 'шт', labelEn: 'pcs' } },
  { id: 'kiwi', nameRu: 'Киви', nameEn: 'Kiwi', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 61, protein: 1.1, fat: 0.5, carbs: 15 } },
  { id: 'pineapple', nameRu: 'Ананас', nameEn: 'Pineapple', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 50, protein: 0.5, fat: 0.1, carbs: 13 } },
  { id: 'peach', nameRu: 'Персик', nameEn: 'Peach', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 39, protein: 0.9, fat: 0.3, carbs: 10 } },
  { id: 'mango', nameRu: 'Манго', nameEn: 'Mango', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 60, protein: 0.8, fat: 0.4, carbs: 15 } },
  { id: 'raspberry', nameRu: 'Малина', nameEn: 'Raspberry', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 52, protein: 1.2, fat: 0.7, carbs: 12 } },
  { id: 'cherry', nameRu: 'Вишня', nameEn: 'Cherry', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 50, protein: 1, fat: 0.3, carbs: 12 } },

  // Extra vegetables
  { id: 'carrot', nameRu: 'Морковь', nameEn: 'Carrot', category: 'veg', vegetarian: true, searchOnly: true, per100: { kcal: 41, protein: 0.9, fat: 0.2, carbs: 10 } },
  { id: 'bell_pepper', nameRu: 'Перец болгарский', nameEn: 'Bell pepper', category: 'veg', vegetarian: true, searchOnly: true, per100: { kcal: 31, protein: 1, fat: 0.3, carbs: 6 } },
  { id: 'cabbage', nameRu: 'Капуста', nameEn: 'Cabbage', category: 'veg', vegetarian: true, searchOnly: true, per100: { kcal: 25, protein: 1.3, fat: 0.1, carbs: 6 } },
  { id: 'onion', nameRu: 'Лук репчатый', nameEn: 'Onion', category: 'veg', vegetarian: true, searchOnly: true, per100: { kcal: 40, protein: 1.1, fat: 0.1, carbs: 9 } },
  { id: 'zucchini', nameRu: 'Кабачок', nameEn: 'Zucchini', category: 'veg', vegetarian: true, searchOnly: true, per100: { kcal: 17, protein: 1.2, fat: 0.3, carbs: 3.1 } },
  { id: 'mushrooms', nameRu: 'Грибы шампиньоны', nameEn: 'Mushrooms', category: 'veg', vegetarian: true, searchOnly: true, per100: { kcal: 22, protein: 3.1, fat: 0.3, carbs: 3.3 } },
  { id: 'beetroot', nameRu: 'Свёкла', nameEn: 'Beetroot', category: 'veg', vegetarian: true, searchOnly: true, per100: { kcal: 43, protein: 1.6, fat: 0.2, carbs: 10 } },
  { id: 'green_peas', nameRu: 'Горошек зелёный', nameEn: 'Green peas', category: 'veg', vegetarian: true, searchOnly: true, per100: { kcal: 81, protein: 5, fat: 0.4, carbs: 14 } },
  { id: 'corn', nameRu: 'Кукуруза', nameEn: 'Corn', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 86, protein: 3.2, fat: 1.2, carbs: 19 } },
  { id: 'eggplant', nameRu: 'Баклажан', nameEn: 'Eggplant', category: 'veg', vegetarian: true, searchOnly: true, per100: { kcal: 25, protein: 1, fat: 0.2, carbs: 6 } },

  // Extra proteins
  { id: 'shrimp', nameRu: 'Креветки', nameEn: 'Shrimp', category: 'protein', vegetarian: false, searchOnly: true, per100: { kcal: 99, protein: 24, fat: 0.3, carbs: 0.2 } },
  { id: 'tuna_canned', nameRu: 'Тунец консервированный', nameEn: 'Tuna (canned)', category: 'protein', vegetarian: false, searchOnly: true, per100: { kcal: 116, protein: 26, fat: 1, carbs: 0 } },
  { id: 'pork_lean', nameRu: 'Свинина постная', nameEn: 'Lean pork', category: 'protein', vegetarian: false, searchOnly: true, per100: { kcal: 143, protein: 21, fat: 6, carbs: 0 } },
  { id: 'ham', nameRu: 'Ветчина', nameEn: 'Ham', category: 'protein', vegetarian: false, searchOnly: true, per100: { kcal: 145, protein: 18, fat: 8, carbs: 1 } },
  { id: 'mackerel', nameRu: 'Скумбрия', nameEn: 'Mackerel', category: 'protein', vegetarian: false, searchOnly: true, per100: { kcal: 205, protein: 19, fat: 14, carbs: 0 } },
  { id: 'chicken_thigh', nameRu: 'Куриное бедро', nameEn: 'Chicken thigh', category: 'protein', vegetarian: false, searchOnly: true, per100: { kcal: 209, protein: 18, fat: 15, carbs: 0 } },
  { id: 'ground_beef', nameRu: 'Фарш говяжий', nameEn: 'Ground beef', category: 'protein', vegetarian: false, searchOnly: true, per100: { kcal: 250, protein: 26, fat: 15, carbs: 0 } },
  { id: 'beans_kidney', nameRu: 'Фасоль красная варёная', nameEn: 'Kidney beans (cooked)', category: 'protein', vegetarian: true, searchOnly: true, per100: { kcal: 127, protein: 8.7, fat: 0.5, carbs: 23 } },
  { id: 'chickpeas', nameRu: 'Нут варёный', nameEn: 'Chickpeas (cooked)', category: 'protein', vegetarian: true, searchOnly: true, per100: { kcal: 164, protein: 8.9, fat: 2.6, carbs: 27 } },

  // Extra carbs & staples
  { id: 'quinoa', nameRu: 'Киноа варёная', nameEn: 'Quinoa (cooked)', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 120, protein: 4.4, fat: 1.9, carbs: 21 } },
  { id: 'couscous', nameRu: 'Кускус варёный', nameEn: 'Couscous (cooked)', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 112, protein: 3.8, fat: 0.2, carbs: 23 } },
  { id: 'bulgur', nameRu: 'Булгур варёный', nameEn: 'Bulgur (cooked)', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 83, protein: 3.1, fat: 0.2, carbs: 19 } },
  { id: 'millet', nameRu: 'Пшено варёное', nameEn: 'Millet (cooked)', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 119, protein: 3.5, fat: 1, carbs: 24 } },
  { id: 'pearl_barley', nameRu: 'Перловка варёная', nameEn: 'Pearl barley (cooked)', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 123, protein: 2.3, fat: 0.4, carbs: 28 } },
  { id: 'rye_bread', nameRu: 'Хлеб ржаной', nameEn: 'Rye bread', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 259, protein: 8.5, fat: 3.3, carbs: 48 }, unit: { gramsPerPiece: 30, labelRu: 'ломтик', labelEn: 'slice' } },
  { id: 'honey', nameRu: 'Мёд', nameEn: 'Honey', category: 'carb', vegetarian: true, searchOnly: true, per100: { kcal: 304, protein: 0.3, fat: 0, carbs: 82 } },

  // Extra fats & treats
  { id: 'walnuts', nameRu: 'Грецкий орех', nameEn: 'Walnuts', category: 'fat', vegetarian: true, searchOnly: true, per100: { kcal: 654, protein: 15, fat: 65, carbs: 14 } },
  { id: 'cashew', nameRu: 'Кешью', nameEn: 'Cashew', category: 'fat', vegetarian: true, searchOnly: true, per100: { kcal: 553, protein: 18, fat: 44, carbs: 30 } },
  { id: 'sunflower_seeds', nameRu: 'Семечки подсолнечника', nameEn: 'Sunflower seeds', category: 'fat', vegetarian: true, searchOnly: true, per100: { kcal: 584, protein: 21, fat: 51, carbs: 20 } },
  { id: 'dark_chocolate', nameRu: 'Тёмный шоколад', nameEn: 'Dark chocolate', category: 'fat', vegetarian: true, searchOnly: true, per100: { kcal: 546, protein: 4.9, fat: 31, carbs: 61 } },
  { id: 'mayonnaise', nameRu: 'Майонез', nameEn: 'Mayonnaise', category: 'fat', vegetarian: true, searchOnly: true, per100: { kcal: 680, protein: 1, fat: 75, carbs: 2.6 } },
  { id: 'sunflower_oil', nameRu: 'Подсолнечное масло', nameEn: 'Sunflower oil', category: 'fat', vegetarian: true, searchOnly: true, per100: { kcal: 884, protein: 0, fat: 100, carbs: 0 } },
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
