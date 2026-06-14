import { Day } from './types';

// Dinner items: Roman → протеин, Liza → творог + крупа + масло
const romanDinner = { name: 'Протеин + молоко', romanOnly: '1 скуп (31г) + 250г' };
const lizaTvorog = { name: 'Творог', lizaOnly: '180 г (1п)' };
const lizaOtrubi = { name: 'Отруби', lizaOnly: '1 ст.л.' };
const lizaMaslo = { name: 'Слив. масло', lizaOnly: '10 г' };

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
          { name: 'Гречка', portion: '80 г' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~470 ккал', liza: '~540 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          { name: 'Курица', portion: { roman: '250 г', liza: '240 г' } },
          { name: 'Гарнир', romanOnly: 'по выбору', lizaOnly: 'Гречка: 1/3 часть' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~650 ккал', liza: '~690 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          lizaTvorog,
          lizaOtrubi,
          { name: 'Гречка', lizaOnly: '1/3 часть' },
          lizaMaslo,
          romanDinner,
        ],
        calories: { roman: '~230 ккал', liza: '~600 ккал' },
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
          { name: 'Гречка', portion: '80 г' },
          { name: 'Слив. масло', portion: '10 г' },
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
            romanOnly: 'по выбору',
            lizaOnly: 'Рис: 1/3 часть',
          },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~650 ккал', liza: '~690 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          lizaTvorog,
          lizaOtrubi,
          { name: 'Гарнир', lizaOnly: 'Рис: 1/3 часть' },
          lizaMaslo,
          romanDinner,
        ],
        calories: { roman: '~230 ккал', liza: '~600 ккал' },
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
          { name: 'Гречка', portion: '80 г' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~470 ккал', liza: '~540 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          { name: 'Курица', portion: { roman: '250 г', liza: '240 г' } },
          { name: 'Макароны', romanOnly: 'по выбору', lizaOnly: '1/3 часть' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~650 ккал', liza: '~690 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          lizaTvorog,
          lizaOtrubi,
          { name: 'Макароны', lizaOnly: '1/3 часть' },
          lizaMaslo,
          romanDinner,
        ],
        calories: { roman: '~230 ккал', liza: '~600 ккал' },
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
          { name: 'Гречка', portion: '80 г' },
          { name: 'Слив. масло', portion: '10 г' },
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
            romanOnly: 'по выбору',
            lizaOnly: 'Рис: 1/3 часть',
          },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~650 ккал', liza: '~690 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          lizaTvorog,
          lizaOtrubi,
          { name: 'Гарнир', lizaOnly: 'Рис: 1/3 часть' },
          lizaMaslo,
          romanDinner,
        ],
        calories: { roman: '~230 ккал', liza: '~600 ккал' },
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
          { name: 'Гречка', portion: '80 г' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~470 ккал', liza: '~540 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          { name: 'Курица', portion: { roman: '250 г', liza: '240 г' } },
          { name: 'Гарнир', romanOnly: 'по выбору', lizaOnly: 'Гречка: 1/3 часть' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~650 ккал', liza: '~690 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          lizaTvorog,
          lizaOtrubi,
          { name: 'Гречка', lizaOnly: '1/3 часть' },
          lizaMaslo,
          romanDinner,
        ],
        calories: { roman: '~230 ккал', liza: '~600 ккал' },
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
          { name: 'Гречка', portion: '80 г' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~470 ккал', liza: '~540 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          { name: 'Курица', portion: { roman: '250 г', liza: '240 г' } },
          { name: 'Гарнир', romanOnly: 'по выбору', lizaOnly: 'Гречка: 1/3 часть' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~650 ккал', liza: '~690 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          lizaTvorog,
          lizaOtrubi,
          { name: 'Гречка', lizaOnly: '1/3 часть' },
          lizaMaslo,
          romanDinner,
        ],
        calories: { roman: '~230 ккал', liza: '~600 ккал' },
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
          { name: 'Творог', lizaOnly: '90 г (0.5п)' },
        ],
        calories: { roman: '~150 ккал', liza: '~250 ккал' },
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
          lizaTvorog,
          lizaOtrubi,
          romanDinner,
        ],
        calories: { roman: '~230 ккал', liza: '~250 ккал' },
      },
    ],
  },
];
