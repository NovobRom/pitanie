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
  'auth.signUp': 'Регистрация',
  'auth.signOut': 'Выйти',
  'auth.email': 'Email',
  'auth.password': 'Пароль',
  'auth.send': 'Войти',
  'auth.sending': 'Вход…',
  'auth.sent': 'Проверьте почту — ссылка для входа отправлена!',
  'auth.registering': 'Регистрация…',
  'auth.confirmEmailPrompt': 'Регистрация успешна! Если требуется подтверждение, проверьте почту.',
  'auth.noAccount': 'Нет аккаунта? Зарегистрироваться',
  'auth.haveAccount': 'Уже есть аккаунт? Войти',
  'auth.myPlans': 'Мои планы',
  'auth.noPlans': 'Сохранённых планов пока нет',
  'auth.open': 'Открыть',
  'auth.delete': 'Удалить',
  'auth.planTitle': 'План {date}',
  'auth.signedAs': 'Вы вошли как',
  'auth.loginPrompt': 'Войдите, чтобы сохранять планы и синхронизировать между устройствами',
  'auth.welcome': 'Добро пожаловать',
  'auth.feature1Title': 'Интерактивный дашборд',
  'auth.feature1Desc': 'Калории и БЖУ с кольцами прогресса и остатком на день',
  'auth.feature2Title': 'Дневник питания',
  'auth.feature2Desc': 'Поиск по базе Open Food Facts и быстрое добавление продуктов',
  'auth.feature3Title': 'Синхронизация и доступ',
  'auth.feature3Desc': 'Данные в реальном времени между устройствами и ссылка для доступа',

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

  // adaptive TDEE
  'tdee.title': 'Адаптивный TDEE',
  'tdee.estimated': 'Расчётный расход',
  'tdee.onTrack': 'Норма соответствует данным ✓',
  'tdee.reduce': 'Рекомендуем снизить до',
  'tdee.increase': 'Рекомендуем повысить до',
  'tdee.dataNeeded': 'Добавьте 2+ недели веса и дневника',
  'tdee.kcalday': 'ккал/день',

  // copy yesterday
  'diary.copyYesterday': 'Скопировать вчера',
  'diary.copyYesterdayEmpty': 'Вчера не было записей',

  // weight trend
  'weight.trend': 'Тренд веса',

  // weight tracking
  'weight.title': 'Вес',
  'weight.today': 'Мой вес сегодня',
  'weight.save': 'Сохранить',
  'weight.history': 'История веса',
  'weight.change7d': 'Изменение за 7 дней',
  'weight.kg': 'кг',
  'weight.noHistory': 'Нет записей',
  'weight.saved': 'Сохранено',

  // common
  'app.name': 'Dose',
  'nav.today': 'Сегодня',
  'nav.diary': 'Дневник',
  'nav.profile': 'Профиль',
  'build.protShort': 'Б',
  'build.fatShort': 'Ж',
  'build.carbShort': 'У',
  'build.find': 'Найти',
  'build.per100': 'на 100г',
  'lang.label': 'Язык',

  // micronutrients
  'micro.fiber': 'Клетчатка',
  'micro.fiber.short': 'Кл',

  // recipes
  'recipe.title': 'Мои рецепты',
  'recipe.new': 'Новый рецепт',
  'recipe.name': 'Название рецепта',
  'recipe.serving': 'Размер порции (г)',
  'recipe.addIngredient': 'Добавить ингредиент',
  'recipe.ingredient': 'Ингредиент',
  'recipe.save': 'Сохранить рецепт',
  'recipe.empty': 'Рецептов пока нет',
  'recipe.delete': 'Удалить',
  'recipe.per100': 'на 100г',
  'recipe.noIngredients': 'Добавьте ингредиенты',

  // recent foods
  'recent.title': 'Недавние',
  'recent.empty': 'Начните добавлять продукты',

  // barcode
  'barcode.scan': 'Штрихкод',
  'barcode.scanning': 'Наведите камеру на штрихкод',
  'barcode.notFound': 'Продукт не найден по штрихкоду',
  'barcode.error': 'Камера недоступна',
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
  'auth.signUp': 'Sign up',
  'auth.signOut': 'Sign out',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.send': 'Sign in',
  'auth.sending': 'Signing in…',
  'auth.sent': 'Check your inbox — a sign-in link is on its way!',
  'auth.registering': 'Registering…',
  'auth.confirmEmailPrompt': 'Sign up successful! Please check your inbox if email confirmation is enabled.',
  'auth.noAccount': "Don't have an account? Sign up",
  'auth.haveAccount': 'Already have an account? Sign in',
  'auth.myPlans': 'My plans',
  'auth.noPlans': 'No saved plans yet',
  'auth.open': 'Open',
  'auth.delete': 'Delete',
  'auth.planTitle': 'Plan {date}',
  'auth.signedAs': 'Signed in as',
  'auth.loginPrompt': 'Sign in to save plans and sync across devices',
  'auth.welcome': 'Welcome',
  'auth.feature1Title': 'Interactive dashboard',
  'auth.feature1Desc': 'Calories & macros with progress rings and remaining for the day',
  'auth.feature2Title': 'Food diary',
  'auth.feature2Desc': 'Search the Open Food Facts database and log foods in seconds',
  'auth.feature3Title': 'Sync & access',
  'auth.feature3Desc': 'Real-time data across devices and a shareable link',

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

  // adaptive TDEE
  'tdee.title': 'Adaptive TDEE',
  'tdee.estimated': 'Estimated expenditure',
  'tdee.onTrack': 'Target matches your data ✓',
  'tdee.reduce': 'Consider reducing to',
  'tdee.increase': 'Consider increasing to',
  'tdee.dataNeeded': 'Log 2+ weeks of weight & diary',
  'tdee.kcalday': 'kcal/day',

  // copy yesterday
  'diary.copyYesterday': 'Copy yesterday',
  'diary.copyYesterdayEmpty': 'No entries yesterday',

  // weight trend
  'weight.trend': 'Weight trend',

  // weight tracking
  'weight.title': 'Weight',
  'weight.today': 'My weight today',
  'weight.save': 'Save',
  'weight.history': 'Weight history',
  'weight.change7d': '7-day change',
  'weight.kg': 'kg',
  'weight.noHistory': 'No entries yet',
  'weight.saved': 'Saved',

  // common
  'app.name': 'Dose',
  'nav.today': 'Today',
  'nav.diary': 'Diary',
  'nav.profile': 'Profile',
  'build.protShort': 'P',
  'build.fatShort': 'F',
  'build.carbShort': 'C',
  'build.find': 'Search',
  'build.per100': 'per 100g',
  'lang.label': 'Language',

  // micronutrients
  'micro.fiber': 'Fiber',
  'micro.fiber.short': 'Fi',

  // recipes
  'recipe.title': 'My Recipes',
  'recipe.new': 'New Recipe',
  'recipe.name': 'Recipe name',
  'recipe.serving': 'Serving size (g)',
  'recipe.addIngredient': 'Add ingredient',
  'recipe.ingredient': 'Ingredient',
  'recipe.save': 'Save recipe',
  'recipe.empty': 'No recipes yet',
  'recipe.delete': 'Delete',
  'recipe.per100': 'per 100g',
  'recipe.noIngredients': 'Add ingredients first',

  // recent foods
  'recent.title': 'Recent',
  'recent.empty': 'Start adding foods to see recent',

  // barcode
  'barcode.scan': 'Scan',
  'barcode.scanning': 'Point camera at barcode',
  'barcode.notFound': 'Product not found for this barcode',
  'barcode.error': 'Camera not available',
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
  'calc.goal.gain': 'Набор маси (+15%)',
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
  'auth.signUp': 'Реєстрація',
  'auth.signOut': 'Вийти',
  'auth.email': 'Email',
  'auth.password': 'Пароль',
  'auth.send': 'Увійти',
  'auth.sending': 'Вхід…',
  'auth.sent': 'Перевірте пошту — посилання для входу надіслано!',
  'auth.registering': 'Реєстрація…',
  'auth.confirmEmailPrompt': 'Реєстрація успішна! Якщо потрібне підтвердження, перевірте пошту.',
  'auth.noAccount': 'Немає акаунту? Зареєструватися',
  'auth.haveAccount': 'Вже є акаунт? Увійти',
  'auth.myPlans': 'Мої плани',
  'auth.noPlans': 'Збережених планів поки немає',
  'auth.open': 'Відкрити',
  'auth.delete': 'Вилучити',
  'auth.planTitle': 'План {date}',
  'auth.signedAs': 'Ви увійшли як',
  'auth.loginPrompt': 'Увійдіть, щоб зберігати плани та синхронізувати між пристроями',
  'auth.welcome': 'Ласкаво просимо',
  'auth.feature1Title': 'Інтерактивний дашборд',
  'auth.feature1Desc': 'Калорії та БЖВ з кільцями прогресу та залишком на день',
  'auth.feature2Title': 'Щоденник харчування',
  'auth.feature2Desc': 'Пошук по базі Open Food Facts та швидке додавання продуктів',
  'auth.feature3Title': 'Синхронізація та доступ',
  'auth.feature3Desc': 'Дані в реальному часі між пристроями та посилання для доступу',

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
  'diary.foodCatalog': 'База продуктов',
  'diary.addFoodAction': '+ У день',

  // adaptive TDEE
  'tdee.title': 'Адаптивний TDEE',
  'tdee.estimated': 'Розрахунковий розхід',
  'tdee.onTrack': 'Норма відповідає даним ✓',
  'tdee.reduce': 'Рекомендуємо знизити до',
  'tdee.increase': 'Рекомендуємо підвищити до',
  'tdee.dataNeeded': 'Додайте 2+ тижні ваги та щоденника',
  'tdee.kcalday': 'ккал/день',

  // copy yesterday
  'diary.copyYesterday': 'Скопіювати вчора',
  'diary.copyYesterdayEmpty': 'Вчора не було записів',

  // weight trend
  'weight.trend': 'Тренд ваги',

  // weight tracking
  'weight.title': 'Вага',
  'weight.today': 'Моя вага сьогодні',
  'weight.save': 'Зберегти',
  'weight.history': 'Історія ваги',
  'weight.change7d': 'Зміна за 7 днів',
  'weight.kg': 'кг',
  'weight.noHistory': 'Немає записів',
  'weight.saved': 'Збережено',

  // common
  'app.name': 'Dose',
  'nav.today': 'Сьогодні',
  'nav.diary': 'Щоденник',
  'nav.profile': 'Профіль',
  'build.protShort': 'Б',
  'build.fatShort': 'Ж',
  'build.carbShort': 'В',
  'build.find': 'Знайти',
  'build.per100': 'на 100г',
  'lang.label': 'Мова',

  // micronutrients
  'micro.fiber': 'Клітковина',
  'micro.fiber.short': 'Кл',

  // recipes
  'recipe.title': 'Мої рецепти',
  'recipe.new': 'Новий рецепт',
  'recipe.name': 'Назва рецепту',
  'recipe.serving': 'Розмір порції (г)',
  'recipe.addIngredient': 'Додати інгредієнт',
  'recipe.ingredient': 'Інгредієнт',
  'recipe.save': 'Зберегти рецепт',
  'recipe.empty': 'Рецептів поки немає',
  'recipe.delete': 'Вилучити',
  'recipe.per100': 'на 100г',
  'recipe.noIngredients': 'Спочатку додайте інгредієнти',

  // recent foods
  'recent.title': 'Нещодавні',
  'recent.empty': 'Почніть додавати продукти',

  // barcode
  'barcode.scan': 'Штрихкод',
  'barcode.scanning': 'Наведіть камеру на штрихкод',
  'barcode.notFound': 'Продукт не знайдено за штрихкодом',
  'barcode.error': 'Камера недоступна',
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
