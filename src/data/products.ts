import { Product } from './types';

export const products: Product[] = [
  {
    emoji: '🥣',
    name: 'Крупа / Макароны (сухие)',
    roman: '280 г',
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
    roman: '1 пачка (180г)',
    liza: '1 пачка (180г)',
  },
  {
    emoji: '🧈',
    name: 'Масло сливочное',
    roman: '20 г',
    liza: '30 г',
    highlighted: true,
  },
  {
    emoji: '🌾',
    name: 'Пшеничные отруби',
    roman: '1 ст.л. (10г)',
    liza: '1 ст.л. (10г)',
  },
];

export const productsNote =
  '* Овощи: Капуста + Огурцы + Уксус (Роману на обед Квашеная капуста).';
