export interface ShoppingItem {
  name: string;
  amount: string;
  category: 'meat' | 'groceries';
  highlighted?: boolean;
}

export const shoppingList: ShoppingItem[] = [
  {
    name: 'Курица (Филе/Бедро б.к.)',
    amount: '4 кг',
    category: 'meat',
  },
  {
    name: 'Творог (Varškė)',
    amount: '14 пачек',
    category: 'meat',
  },
  {
    name: 'Яйца',
    amount: '30 шт',
    category: 'meat',
  },
  {
    name: 'Сливочное масло 82%',
    amount: '3 пачки',
    category: 'meat',
    highlighted: true,
  },
  {
    name: 'Гречка',
    amount: '2 кг',
    category: 'groceries',
  },
  {
    name: 'Рис',
    amount: '1 кг',
    category: 'groceries',
  },
  {
    name: 'Макароны',
    amount: '1 пачка (500г)',
    category: 'groceries',
  },
  {
    name: 'Картофель',
    amount: '2.5 кг',
    category: 'groceries',
  },
  {
    name: 'Капуста',
    amount: '2 кочана',
    category: 'groceries',
    highlighted: true,
  },
  {
    name: 'Огурцы',
    amount: '1.5 кг',
    category: 'groceries',
    highlighted: true,
  },
  {
    name: 'Свекла (вареная)',
    amount: '1 уп',
    category: 'groceries',
    highlighted: true,
  },
  {
    name: 'Квашеная капуста',
    amount: '2-3 уп / 1 кг (Рома)',
    category: 'groceries',
    highlighted: true,
  },
];
