'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'ru' | 'en';

// ─── Dictionaries ─────────────────────────────────────────────────────────────
// Only the "product" features (calculator + menu builder) are translated.
// The personal weekly-plan demo content stays in Russian for now.

type Dict = Record<string, string>;

const ru: Dict = {
  // calculator
  'calc.title': 'Калькулятор калорий',
  'calc.subtitle': 'Рассчитайте свою норму КБЖУ',
  'calc.weight': 'Вес (кг)',
  'calc.height': 'Рост (см)',
  'calc.age': 'Возраст',
  'calc.sex': 'Пол',
  'calc.sex.male': 'Мужской',
  'calc.sex.female': 'Женский',
  'calc.bodyfat': '% жира (необязательно)',
  'calc.bodyfat.hint': 'Указали — используем точную формулу Katch-McArdle',
  'calc.activity': 'Активность',
  'calc.activity.sedentary': 'Сидячая (офис, без спорта)',
  'calc.activity.light': 'Лёгкая (тренировки 1–3 р/нед)',
  'calc.activity.moderate': 'Умеренная (3–5 р/нед)',
  'calc.activity.active': 'Высокая (6–7 р/нед)',
  'calc.activity.very_active': 'Очень высокая (физ. труд + спорт)',
  'calc.goal': 'Цель',
  'calc.goal.lose': 'Похудение (−20%)',
  'calc.goal.maintain': 'Поддержание',
  'calc.goal.gain': 'Набор массы (+15%)',
  'calc.protein.label': 'Белок',
  'calc.protein.hint': 'Рекомендуется 1.6–2.2 г/кг',
  'calc.fat.label': 'Жиры',
  'calc.fat.hint': 'от калорийности',
  'calc.calc': 'Рассчитать норму',
  'calc.fillData': 'Заполните вес, рост и возраст',
  'calc.bmr': 'BMR (обмен покоя)',
  'calc.tdee': 'TDEE (с активностью)',
  'calc.formula': 'Формула',
  'calc.target': 'Ваша цель на день',
  'calc.calories': 'Калории',
  'calc.protein': 'Белки',
  'calc.fat': 'Жиры',
  'calc.carbs': 'Углеводы',
  'calc.kcal': 'ккал',
  'calc.g': 'г',

  // builder
  'build.title': 'Конструктор меню',
  'build.add': 'Добавить продукт в рацион',
  'build.search.placeholder': 'Поиск: гречка, курица, творог, buckwheat...',
  'build.find': 'Найти',
  'build.searching': 'Ищем в базе Open Food Facts...',
  'build.notFound': 'Ничего не найдено. Попробуйте запрос на английском.',
  'build.ration': 'Мой рацион',
  'build.totals': 'Итого за день',
  'build.fillForCompare': 'Рассчитайте норму выше для сравнения с целью',
  'build.remaining': 'Осталось добрать: {n} ккал',
  'build.done': 'Норма выполнена!',
  'build.over': 'Превышение на: {n} ккал',
  'build.empty': 'Найдите продукты и добавьте их — калории посчитаются автоматически',
  'build.per100': 'на 100 г',
  'build.protShort': 'Б',
  'build.fatShort': 'Ж',
  'build.carbShort': 'У',

  // generator
  'gen.title': 'Авто-подбор меню',
  'gen.subtitle': 'Подберём продукты под вашу цель по КБЖУ',
  'gen.needGoal': 'Сначала рассчитайте норму в калькуляторе выше',
  'gen.generate': 'Подобрать меню',
  'gen.regenerate': 'Другой вариант',
  'gen.vegetarian': 'Вегетарианское',
  'gen.toBuilder': 'Перенести в конструктор',
  'gen.meal.breakfast': 'Завтрак',
  'gen.meal.lunch': 'Обед',
  'gen.meal.dinner': 'Ужин',
  'gen.match': 'Совпадение с целью',
  'gen.hint': 'Можно перенести в конструктор и отредактировать граммы вручную',

  // common
  'lang.label': 'Язык',
};

const en: Dict = {
  'calc.title': 'Calorie Calculator',
  'calc.subtitle': 'Calculate your daily macro targets',
  'calc.weight': 'Weight (kg)',
  'calc.height': 'Height (cm)',
  'calc.age': 'Age',
  'calc.sex': 'Sex',
  'calc.sex.male': 'Male',
  'calc.sex.female': 'Female',
  'calc.bodyfat': 'Body fat % (optional)',
  'calc.bodyfat.hint': 'If set, we use the precise Katch-McArdle formula',
  'calc.activity': 'Activity',
  'calc.activity.sedentary': 'Sedentary (desk job, no sport)',
  'calc.activity.light': 'Light (exercise 1–3×/week)',
  'calc.activity.moderate': 'Moderate (3–5×/week)',
  'calc.activity.active': 'Active (6–7×/week)',
  'calc.activity.very_active': 'Very active (physical job + sport)',
  'calc.goal': 'Goal',
  'calc.goal.lose': 'Lose fat (−20%)',
  'calc.goal.maintain': 'Maintain',
  'calc.goal.gain': 'Gain mass (+15%)',
  'calc.protein.label': 'Protein',
  'calc.protein.hint': 'Recommended 1.6–2.2 g/kg',
  'calc.fat.label': 'Fat',
  'calc.fat.hint': 'of calories',
  'calc.calc': 'Calculate target',
  'calc.fillData': 'Enter weight, height and age',
  'calc.bmr': 'BMR (resting)',
  'calc.tdee': 'TDEE (with activity)',
  'calc.formula': 'Formula',
  'calc.target': 'Your daily target',
  'calc.calories': 'Calories',
  'calc.protein': 'Protein',
  'calc.fat': 'Fat',
  'calc.carbs': 'Carbs',
  'calc.kcal': 'kcal',
  'calc.g': 'g',

  'build.title': 'Menu Builder',
  'build.add': 'Add a product to your ration',
  'build.search.placeholder': 'Search: rice, chicken, oats, banana...',
  'build.find': 'Search',
  'build.searching': 'Searching Open Food Facts...',
  'build.notFound': 'Nothing found. Try a different spelling.',
  'build.ration': 'My ration',
  'build.totals': 'Daily total',
  'build.fillForCompare': 'Calculate your target above to compare',
  'build.remaining': 'Remaining: {n} kcal',
  'build.done': 'Target reached!',
  'build.over': 'Over by: {n} kcal',
  'build.empty': 'Find products and add them — calories are counted automatically',
  'build.per100': 'per 100 g',
  'build.protShort': 'P',
  'build.fatShort': 'F',
  'build.carbShort': 'C',

  'gen.title': 'Auto Meal Plan',
  'gen.subtitle': "We'll pick foods to match your macro target",
  'gen.needGoal': 'First calculate your target in the calculator above',
  'gen.generate': 'Generate plan',
  'gen.regenerate': 'Another option',
  'gen.vegetarian': 'Vegetarian',
  'gen.toBuilder': 'Send to builder',
  'gen.meal.breakfast': 'Breakfast',
  'gen.meal.lunch': 'Lunch',
  'gen.meal.dinner': 'Dinner',
  'gen.match': 'Match to target',
  'gen.hint': 'Send it to the builder to fine-tune grams by hand',

  'lang.label': 'Language',
};

const dictionaries: Record<Lang, Dict> = { ru, en };

// ─── Context ──────────────────────────────────────────────────────────────────

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

const STORAGE_KEY = 'pitanie.lang';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved === 'ru' || saved === 'en') {
      // Sync persisted choice after mount; effect avoids SSR hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLangState(saved);
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    let str = dictionaries[lang][key] ?? dictionaries.ru[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  };

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
