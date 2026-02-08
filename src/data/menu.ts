import { Day } from './types';

export const weekMenu: Day[] = [
  // Понедельник
  {
    dayName: 'Понедельник',
    grain: 'Гречка',
    grainType: 'grechka',
    meals: [
      {
        type: 'breakfast',
        icon: '🌅',
        items: [
          { name: 'Яйца', portion: '2 шт' },
          { name: 'Слив. масло', portion: '10 г' },
          { name: 'Гречка', portion: '1/3 часть' },
        ],
        calories: { roman: '530 ккал', liza: '485 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          {
            name: 'Курица',
            portion: { roman: '280г', liza: '240г' },
          },
          { name: 'Гречка', portion: '1/3 часть' },
          {
            name: 'Овощи',
            romanOnly: 'Квашеная капуста',
            lizaOnly: 'Огурец + Капуста',
          },
          {
            name: 'Слив. масло',
            portion: { roman: '15г', liza: '10г' },
          },
        ],
        calories: { roman: '795 ккал', liza: '670 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          { name: 'Творог', portion: '180 г (1п)' },
          { name: 'Гречка', portion: '1/3 часть' },
          { name: 'Свекла вареная', portion: '' },
          {
            name: 'Слив. масло',
            portion: { roman: '15г', liza: '10г' },
          },
        ],
        calories: { roman: '~615 ккал', liza: '~535 ккал' },
      },
    ],
  },

  // Вторник
  {
    dayName: 'Вторник',
    grain: 'Рис',
    grainType: 'rice',
    meals: [
      {
        type: 'breakfast',
        icon: '🌅',
        items: [
          { name: 'Яйца', portion: '2 шт' },
          { name: 'Слив. масло', portion: '10 г' },
          { name: 'Рис', portion: '1/3 часть' },
        ],
        calories: { roman: '530 ккал', liza: '485 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          { name: 'Курица', portion: 'Стандарт' },
          { name: 'Рис', portion: '1/3 часть' },
          {
            name: 'Овощи',
            romanOnly: 'Квашеная капуста',
            lizaOnly: 'Огурец + Капуста',
          },
          { name: 'Масла', portion: 'Стандарт' },
        ],
        calories: { roman: '795 ккал', liza: '670 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          { name: 'Творог', portion: '180 г (1п)' },
          { name: 'Рис', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: 'Стандарт' },
        ],
        calories: { roman: '585 ккал', liza: '505 ккал' },
      },
    ],
  },

  // Среда
  {
    dayName: 'Среда',
    grain: 'Макароны',
    grainType: 'pasta',
    meals: [
      {
        type: 'breakfast',
        icon: '🌅',
        items: [
          { name: 'Яйца', portion: '2 шт' },
          { name: 'Слив. масло', portion: '10 г' },
          { name: 'Макароны', portion: '1/3 часть' },
        ],
        calories: { roman: '530 ккал', liza: '485 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          { name: 'Курица', portion: 'Стандарт' },
          { name: 'Макароны', portion: '1/3 часть' },
          {
            name: 'Овощи',
            romanOnly: 'Квашеная капуста',
            lizaOnly: 'Огурец + Капуста',
          },
          { name: 'Масла', portion: 'Стандарт' },
        ],
        calories: { roman: '795 ккал', liza: '670 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          { name: 'Творог', portion: '180 г (1п)' },
          { name: 'Макароны', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: 'Стандарт' },
        ],
        calories: { roman: '585 ккал', liza: '505 ккал' },
      },
    ],
  },

  // Четверг
  {
    dayName: 'Четверг',
    grain: 'Картофель',
    grainType: 'potato',
    meals: [
      {
        type: 'breakfast',
        icon: '🌅',
        items: [
          { name: 'Яйца', portion: '2 шт' },
          { name: 'Картофель', portion: '1/3 (≈330г / 280г)' },
          { name: 'Слив. масло', portion: '10 г' },
        ],
        calories: { roman: '~470 ккал', liza: '~430 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          { name: 'Курица', portion: 'Стандарт' },
          { name: 'Картофель', portion: '1/3 часть' },
          {
            name: 'Овощи',
            romanOnly: 'Квашеная капуста',
            lizaOnly: 'Огурец + Капуста',
          },
          { name: 'Масла', portion: 'Стандарт' },
        ],
        calories: { roman: '~730 ккал', liza: '~620 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          { name: 'Творог', portion: '180 г' },
          { name: 'Картофель', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: 'Стандарт' },
        ],
        calories: { roman: '~530 ккал', liza: '~460 ккал' },
      },
    ],
  },

  // Пятница
  {
    dayName: 'Пятница',
    grain: 'Гречка',
    grainType: 'grechka',
    meals: [
      {
        type: 'breakfast',
        icon: '🌅',
        items: [
          { name: 'Яйца', portion: '2 шт' },
          { name: 'Слив. масло', portion: '10 г' },
          { name: 'Гречка', portion: '1/3 часть' },
          { name: 'Свекла вареная', portion: '' },
        ],
        calories: { roman: '~560 ккал', liza: '~515 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          { name: 'Курица', portion: 'Стандарт' },
          { name: 'Гречка', portion: '1/3 часть' },
          {
            name: 'Овощи',
            romanOnly: 'Квашеная капуста',
            lizaOnly: 'Огурец + Капуста',
          },
          { name: 'Масла', portion: 'Стандарт' },
        ],
        calories: { roman: '795 ккал', liza: '670 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          { name: 'Творог', portion: '180 г (1п)' },
          { name: 'Гречка', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: 'Стандарт' },
        ],
        calories: { roman: '585 ккал', liza: '505 ккал' },
      },
    ],
  },

  // Суббота
  {
    dayName: 'Суббота',
    grain: 'Рис',
    grainType: 'rice',
    meals: [
      {
        type: 'breakfast',
        icon: '🌅',
        items: [
          { name: 'Яйца', portion: '2 шт' },
          { name: 'Слив. масло', portion: '10 г' },
          { name: 'Рис', portion: '1/3 часть' },
        ],
        calories: { roman: '530 ккал', liza: '485 ккал' },
      },
      {
        type: 'lunch',
        icon: '☀️',
        items: [
          { name: 'Курица', portion: 'Стандарт' },
          { name: 'Рис', portion: '1/3 часть' },
          {
            name: 'Овощи',
            romanOnly: 'Квашеная капуста',
            lizaOnly: 'Огурец + Капуста',
          },
          { name: 'Масла', portion: 'Стандарт' },
        ],
        calories: { roman: '795 ккал', liza: '670 ккал' },
      },
      {
        type: 'dinner',
        icon: '🌙',
        items: [
          { name: 'Творог', portion: '180 г (1п)' },
          { name: 'Рис', portion: '1/3 часть' },
          { name: 'Слив. масло', portion: 'Стандарт' },
        ],
        calories: { roman: '585 ккал', liza: '505 ккал' },
      },
    ],
  },

  // Воскресенье (Читмил)
  {
    dayName: 'Воскресенье',
    grain: 'Читмил',
    grainType: 'grechka',
    isCheatDay: true,
    meals: [],
  },
];
