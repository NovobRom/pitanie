import { Day } from './types';

export const weekMenu: Day[] = [
  // Понедельник
  {
    dayName: 'Понедельник',
    grain: 'Гречка (общая)',
    grainType: 'grechka',
    meals: [
      {
        type: 'breakfast',
        icon: '🌅',
        items: [
          { name: 'Яйца', portion: '2 шт' },
          { name: 'Гречка', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: { roman: '0 г', liza: '10 г' } },
        ],
        calories: { roman: '~470 ккал', liza: '~540 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          { name: 'Курица', portion: { roman: '250 г', liza: '240 г' } },
          { name: 'Гречка', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~700 ккал', liza: '~690 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          { name: 'Творог', portion: '180 г (1п)' },
          { name: 'Отруби', portion: '1 ст.л.' },
          { name: 'Гречка', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~600 ккал', liza: '~600 ккал' },
      },
    ],
  },

  // Вторник
  {
    dayName: 'Вторник',
    grain: 'Гарниры раздельно',
    grainType: 'mixed',
    note: '⚠️ В эти дни гарниры готовятся в разных кастрюлях.',
    meals: [
      {
        type: 'breakfast',
        icon: '🌅',
        items: [
          { name: 'Яйца', portion: '2 шт' },
          {
            name: 'Гарнир',
            romanOnly: 'Гречка: 1/3 часть',
            lizaOnly: 'Рис: 1/3 часть',
          },
          { name: 'Слив. масло', portion: { roman: '0 г', liza: '10 г' } },
        ],
        calories: { roman: '~470 ккал', liza: '~540 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          { name: 'Курица', portion: { roman: '250 г', liza: '240 г' } },
          {
            name: 'Гарнир',
            romanOnly: 'Гречка: 1/3 часть',
            lizaOnly: 'Рис: 1/3 часть',
          },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~700 ккал', liza: '~690 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          { name: 'Творог', portion: '180 г (1п)' },
          { name: 'Отруби', portion: '1 ст.л.' },
          {
            name: 'Гарнир',
            romanOnly: 'Гречка: 1/3 часть',
            lizaOnly: 'Рис: 1/3 часть',
          },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~600 ккал', liza: '~600 ккал' },
      },
    ],
  },

  // Среда
  {
    dayName: 'Среда',
    grain: 'Макароны (общие)',
    grainType: 'pasta',
    meals: [
      {
        type: 'breakfast',
        icon: '🌅',
        items: [
          { name: 'Яйца', portion: '2 шт' },
          { name: 'Макароны', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: { roman: '0 г', liza: '10 г' } },
        ],
        calories: { roman: '~470 ккал', liza: '~540 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          { name: 'Курица', portion: { roman: '250 г', liza: '240 г' } },
          { name: 'Макароны', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~700 ккал', liza: '~690 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          { name: 'Творог', portion: '180 г (1п)' },
          { name: 'Отруби', portion: '1 ст.л.' },
          { name: 'Макароны', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~600 ккал', liza: '~600 ккал' },
      },
    ],
  },

  // Четверг
  {
    dayName: 'Четверг',
    grain: 'Гарниры раздельно',
    grainType: 'mixed',
    note: '⚠️ В эти дни гарниры готовятся в разных кастрюлях.',
    meals: [
      {
        type: 'breakfast',
        icon: '🌅',
        items: [
          { name: 'Яйца', portion: '2 шт' },
          {
            name: 'Гарнир',
            romanOnly: 'Гречка: 1/3 часть',
            lizaOnly: 'Рис: 1/3 часть',
          },
          { name: 'Слив. масло', portion: { roman: '0 г', liza: '10 г' } },
        ],
        calories: { roman: '~470 ккал', liza: '~540 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          { name: 'Курица', portion: { roman: '250 г', liza: '240 г' } },
          {
            name: 'Гарнир',
            romanOnly: 'Гречка: 1/3 часть',
            lizaOnly: 'Рис: 1/3 часть',
          },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~700 ккал', liza: '~690 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          { name: 'Творог', portion: '180 г (1п)' },
          { name: 'Отруби', portion: '1 ст.л.' },
          {
            name: 'Гарнир',
            romanOnly: 'Гречка: 1/3 часть',
            lizaOnly: 'Рис: 1/3 часть',
          },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~600 ккал', liza: '~600 ккал' },
      },
    ],
  },

  // Пятница
  {
    dayName: 'Пятница',
    grain: 'Гречка (общая)',
    grainType: 'grechka',
    meals: [
      {
        type: 'breakfast',
        icon: '🌅',
        items: [
          { name: 'Яйца', portion: '2 шт' },
          { name: 'Гречка', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: { roman: '0 г', liza: '10 г' } },
        ],
        calories: { roman: '~470 ккал', liza: '~540 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          { name: 'Курица', portion: { roman: '250 г', liza: '240 г' } },
          { name: 'Гречка', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~700 ккал', liza: '~690 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          { name: 'Творог', portion: '180 г (1п)' },
          { name: 'Отруби', portion: '1 ст.л.' },
          { name: 'Гречка', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~600 ккал', liza: '~600 ккал' },
      },
    ],
  },

  // Суббота
  {
    dayName: 'Суббота',
    grain: 'Гречка (общая)',
    grainType: 'grechka',
    meals: [
      {
        type: 'breakfast',
        icon: '🌅',
        items: [
          { name: 'Яйца', portion: '2 шт' },
          { name: 'Гречка', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: { roman: '0 г', liza: '10 г' } },
        ],
        calories: { roman: '~470 ккал', liza: '~540 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          { name: 'Курица', portion: { roman: '250 г', liza: '240 г' } },
          { name: 'Гречка', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~700 ккал', liza: '~690 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          { name: 'Творог', portion: '180 г (1п)' },
          { name: 'Отруби', portion: '1 ст.л.' },
          { name: 'Гречка', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~600 ккал', liza: '~600 ккал' },
      },
    ],
  },

  // Воскресенье (Читмил)
  {
    dayName: 'Воскресенье',
    grain: 'Читмил',
    grainType: 'grechka',
    isCheatDay: true,
    meals: [
      {
        type: 'breakfast',
        icon: '🌅',
        items: [
          { name: 'Яйца', portion: '2 шт' },
          { name: 'Творог', portion: '90 г (0.5п)' },
        ],
        calories: { roman: '~250 ккал', liza: '~250 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [{ name: 'Любой прием пищи', portion: 'Пицца / Суши / Бургер' }],
        calories: { roman: '—', liza: '—' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          { name: 'Творог', portion: '180 г (1п)' },
          { name: 'Отруби', portion: '1 ст.л.' },
        ],
        calories: { roman: '~250 ккал', liza: '~250 ккал' },
      },
    ],
  },
];
