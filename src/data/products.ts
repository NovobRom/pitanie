import { Product } from './types';

export const products: Product[] = [
  {
    emoji: '🥣',
    name: 'Гречка (сухая, только утром)',
    roman: '80 г',
    liza: '240 г',
  },
  {
    emoji: '🍗',
    name: 'Курица (сырая)',
    roman: '250 г',
    liza: '240 г',
  },
  {
    emoji: '🥛',
    name: 'Творог (Varškė)',
    roman: '—',
    liza: '1 пачка (180г)',
  },
  {
    emoji: '🧈',
    name: 'Масло сливочное',
    roman: '10 г',
    liza: '30 г',
    highlighted: true,
  },
  {
    emoji: '🌾',
    name: 'Пшеничные отруби',
    roman: '—',
    liza: '1 ст.л. (10г)',
  },
  {
    emoji: '🥛',
    name: 'Молоко 1.5% безлактозное',
    roman: '500 г (кофе + протеин)',
    liza: '—',
  },
  {
    emoji: '💪',
    name: 'Протеин (Whey Isolate)',
    roman: '1 скуп (31г)',
    liza: '—',
  },
];

export const productsNote =
  '* Овощи: Капуста + Огурцы + Уксус (Роману на обед Квашеная капуста).';
