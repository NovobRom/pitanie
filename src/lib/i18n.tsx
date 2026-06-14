'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'ru' | 'en' | 'uk';

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

  // share / persistence
  'share.copy': 'Поделиться планом',
  'share.copied': 'Ссылка скопирована!',
  'share.reset': 'Сбросить',
  'share.saved': 'План сохраняется в этом браузере',

  // auth
  'auth.signIn': 'Войти',
  'auth.signOut': 'Выйти',
  'auth.email': 'Email',
  'auth.send': 'Отправить ссылку',
  'auth.sending': 'Отправка…',
  'auth.sent': 'Проверьте почту — ссылка для входа отправлена!',
  'auth.myPlans': 'Мои планы',
  'auth.noPlans': 'Сохранённых планов пока нет',
  'auth.open': 'Открыть',
  'auth.delete': 'Удалить',
  'auth.planTitle': 'План {date}',
  'auth.signedAs': 'Вы вошли как',
  'auth.loginPrompt': 'Войдите, чтобы сохранять планы и синхронизировать между устройствами',
  'auth.welcome': 'Добро пожаловать в Питание v4',
  'auth.marketing1': '📊 Интерактивный дашборд калорий и БЖУ в стиле Apple Health',
  'auth.marketing2': '🍎 Дневник питания с поиском по базе Open Food Facts',
  'auth.marketing3': '☁️ Синхронизация данных в реальном времени и возможность делиться ссылкой',

  // diary
  'diary.remaining': 'Осталось',
  'diary.over': 'Перебор',
  'diary.add': 'Добавить',
  'diary.breakfast': 'Завтрак',
  'diary.lunch': 'Обед',
  'diary.dinner': 'Ужин',
  'diary.snacks': 'Перекусы',
  'diary.title': 'Дневник питания',
  'diary.editProfile': 'Настройки профиля',
  'diary.empty': 'Нет добавленных продуктов',
  'diary.searchTitle': 'Добавление продукта',
  'diary.searchPlaceholder': 'Название: курица, творог, гречка...',
  'diary.searchState': 'Ищем в базе Open Food Facts...',
  'diary.searchNoResults': 'Ничего не найдено. Попробуйте на английском.',
  'diary.portion': 'Порция',
  'diary.priorityHigh': 'Высокий',
  'diary.priorityMedium': 'Средний',
  'diary.priorityLow': 'Низкий',
  'diary.foodCatalog': 'База продуктов',
  'diary.addFoodAction': '+ В день',

  // common
  'lang.label': 'Язык',
};

const en: Dict = {
  // calculator
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

  // share / persistence
  'share.copy': 'Share plan',
  'share.copied': 'Link copied!',
  'share.reset': 'Reset',
  'share.saved': 'Your plan is saved in this browser',

  // auth
  'auth.signIn': 'Sign in',
  'auth.signOut': 'Sign out',
  'auth.email': 'Email',
  'auth.send': 'Send magic link',
  'auth.sending': 'Sending…',
  'auth.sent': 'Check your inbox — a sign-in link is on its way!',
  'auth.myPlans': 'My plans',
  'auth.noPlans': 'No saved plans yet',
  'auth.open': 'Open',
  'auth.delete': 'Delete',
  'auth.planTitle': 'Plan {date}',
  'auth.signedAs': 'Signed in as',
  'auth.loginPrompt': 'Sign in to save plans and sync across devices',
  'auth.welcome': 'Welcome to Pitanie v4',
  'auth.marketing1': '📊 Interactive calorie & macro dashboard in Apple Health style',
  'auth.marketing2': '🍎 Food diary with search powered by Open Food Facts',
  'auth.marketing3': '☁️ Real-time cloud sync and one-click link sharing',

  // diary
  'diary.remaining': 'Remaining',
  'diary.over': 'Over',
  'diary.add': 'Add',
  'diary.breakfast': 'Breakfast',
  'diary.lunch': 'Lunch',
  'diary.dinner': 'Dinner',
  'diary.snacks': 'Snacks',
  'diary.title': 'Food Diary',
  'diary.editProfile': 'Profile Settings',
  'diary.empty': 'No added foods',
  'diary.searchTitle': 'Add Food Product',
  'diary.searchPlaceholder': 'Name: chicken, cheese, buckwheat...',
  'diary.searchState': 'Searching Open Food Facts...',
  'diary.searchNoResults': 'Nothing found. Try a different spelling.',
  'diary.portion': 'Portion',
  'diary.priorityHigh': 'High',
  'diary.priorityMedium': 'Medium',
  'diary.priorityLow': 'Low',
  'diary.foodCatalog': 'Food Catalog',
  'diary.addFoodAction': '+ To Day',

  // common
  'lang.label': 'Language',
};

const uk: Dict = {
  // calculator
  'calc.title': 'Калькулятор калорій',
  'calc.subtitle': 'Розрахуйте свою норму КБЖВ',
  'calc.weight': 'Вага (кг)',
  'calc.height': 'Зріст (см)',
  'calc.age': 'Вік',
  'calc.sex': 'Стать',
  'calc.sex.male': 'Чоловіча',
  'calc.sex.female': 'Жіноча',
  'calc.bodyfat': '% жиру (необов\'язково)',
  'calc.bodyfat.hint': 'Вказали — використовуємо точну формулу Katch-McArdle',
  'calc.activity': 'Активність',
  'calc.activity.sedentary': 'Сидяча (офіс, без спорту)',
  'calc.activity.light': 'Легка (тренування 1–3 р/тижд)',
  'calc.activity.moderate': 'Помірна (3–5 р/тижд)',
  'calc.activity.active': 'Висока (6–7 р/тижд)',
  'calc.activity.very_active': 'Дуже висока (фіз. праця + спорт)',
  'calc.goal': 'Ціль',
  'calc.goal.lose': 'Схуднення (−20%)',
  'calc.goal.maintain': 'Підтримання',
  'calc.goal.gain': 'Набір маси (+15%)',
  'calc.protein.label': 'Білок',
  'calc.protein.hint': 'Рекомендується 1.6–2.2 г/кг',
  'calc.fat.label': 'Жири',
  'calc.fat.hint': 'від калорійності',
  'calc.calc': 'Розрахувати норму',
  'calc.fillData': 'Заповніть вагу, зріст та вік',
  'calc.bmr': 'BMR (обмін у спокої)',
  'calc.tdee': 'TDEE (з активністю)',
  'calc.formula': 'Формула',
  'calc.target': 'Ваша ціль на день',
  'calc.calories': 'Калорії',
  'calc.protein': 'Білки',
  'calc.fat': 'Жири',
  'calc.carbs': 'Вуглеводи',
  'calc.kcal': 'ккал',
  'calc.g': 'г',

  // share / persistence
  'share.copy': 'Поділитися планом',
  'share.copied': 'Посилання скопійовано!',
  'share.reset': 'Скинути',
  'share.saved': 'План зберігається в цьому браузері',

  // auth
  'auth.signIn': 'Увійти',
  'auth.signOut': 'Вийти',
  'auth.email': 'Email',
  'auth.send': 'Надіслати посилання',
  'auth.sending': 'Надсилання…',
  'auth.sent': 'Перевірте пошту — посилання для входу надіслано!',
  'auth.myPlans': 'Мої плани',
  'auth.noPlans': 'Збережених планів поки немає',
  'auth.open': 'Відкрити',
  'auth.delete': 'Вилучити',
  'auth.planTitle': 'План {date}',
  'auth.signedAs': 'Ви увійшли як',
  'auth.loginPrompt': 'Увійдіть, щоб зберігати плани та синхронізувати між пристроями',
  'auth.welcome': 'Ласкаво просимо в Харчування v4',
  'auth.marketing1': '📊 Інтерактивний дашборд калорій та БЖВ у стилі Apple Health',
  'auth.marketing2': '🍎 Щоденник харчування з пошуком по базі Open Food Facts',
  'auth.marketing3': '☁️ Синхронізація даних у реальному часі та можливість поділитися посиланням',

  // diary
  'diary.remaining': 'Залишилося',
  'diary.over': 'Перебір',
  'diary.add': 'Додати',
  'diary.breakfast': 'Сніданок',
  'diary.lunch': 'Обід',
  'diary.dinner': 'Вечеря',
  'diary.snacks': 'Перекуси',
  'diary.title': 'Щоденник харчування',
  'diary.editProfile': 'Налаштування профілю',
  'diary.empty': 'Немає доданих продуктів',
  'diary.searchTitle': 'Додавання продукту',
  'diary.searchPlaceholder': 'Назва: курка, сир, гречка...',
  'diary.searchState': 'Шукаємо в базі Open Food Facts...',
  'diary.searchNoResults': 'Нічого не знайдено. Спробуйте англійською.',
  'diary.portion': 'Порція',
  'diary.priorityHigh': 'Високий',
  'diary.priorityMedium': 'Середній',
  'diary.priorityLow': 'Низький',
  'diary.foodCatalog': 'База продуктів',
  'diary.addFoodAction': '+ У день',

  // common
  'lang.label': 'Мова',
};

const dictionaries: Record<Lang, Dict> = { ru, en, uk };

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
    if (saved === 'ru' || saved === 'en' || saved === 'uk') {
      setLangState(saved);
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    let str = dictionaries[lang]?.[key] ?? dictionaries.ru[key] ?? key;
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
