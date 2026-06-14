export interface ShoppingItem {
  name: string;
  amount: string;
  category: 'meat' | 'groceries';
  highlighted?: boolean;
}

export const shoppingList: ShoppingItem[] = [
  {
    name: 'Курица (Филе/Бедро б.к.)',
    amount: '3 кг',
    category: 'meat',
  },
  {
    name: 'Творог (Varškė) — Лизе',
    amount: '7 пачек',
    category: 'meat',
  },
  {
    name: 'Яйца',
    amount: '30 шт',
    category: 'meat',
  },
  {
    name: 'Сливочное масло 82%',
    amount: '1 пачка',
    category: 'meat',
    highlighted: true,
  },
  {
    name: 'Молоко 1.5% безлактозное — Роме',
    amount: '3.5 л',
    category: 'meat',
    highlighted: true,
  },
  {
    name: 'Гречка',
    amount: '1.5 кг',
    category: 'groceries',
  },
  {
    name: 'Рис',
    amount: '1 пачка 500г',
    category: 'groceries',
  },
  {
    name: 'Макароны',
    amount: '1 пачка 500г',
    category: 'groceries',
  },
  {
    name: 'Отруби пшеничные — Лизе',
    amount: '1 уп.',
    category: 'groceries',
  },
  {
    name: 'Капуста свежая',
    amount: '2 кочана',
    category: 'groceries',
    highlighted: true,
  },
  {
    name: 'Огурцы',
    amount: '1 кг',
    category: 'groceries',
    highlighted: true,
  },
  {
    name: 'Свекла (вареная)',
    amount: '1 уп. (500 г)',
    category: 'groceries',
    highlighted: true,
  },
  {
    name: 'Квашеная капуста',
    amount: '1.2 кг (Роме)',
    category: 'groceries',
    highlighted: true,
  },
];
