import React from 'react';

export const ShoppingList = () => {
    return (
        <section className="bg-gray-800 text-white rounded-2xl p-6 md:p-8 mt-10 no-print">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
                <i className="fas fa-shopping-cart mr-3"></i> Список покупок
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-bold text-gray-400 mb-2 uppercase text-sm">🥩 Мясо и Молочка</h3>
                    <ul className="space-y-2">
                        <li className="flex items-center"><input type="checkbox" className="mr-3 w-5 h-5" /> Курица (Филе/Бедро б.к.) — 4 кг</li>
                        <li className="flex items-center"><input type="checkbox" className="mr-3 w-5 h-5" /> Творог (Varškė) — 14 пачек</li>
                        <li className="flex items-center"><input type="checkbox" className="mr-3 w-5 h-5" /> Яйца — 30 шт</li>
                        <li className="flex items-center"><input type="checkbox" className="mr-3 w-5 h-5 text-yellow-500" /> Сливочное масло 82% — 3 пачки</li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-gray-400 mb-2 uppercase text-sm">🍚 Бакалея и Овощи</h3>
                    <ul className="space-y-2">
                        <li className="flex items-center"><input type="checkbox" className="mr-3 w-5 h-5" /> Гречка — 2 кг</li>
                        <li className="flex items-center"><input type="checkbox" className="mr-3 w-5 h-5" /> Рис — 1 кг</li>
                        <li className="flex items-center"><input type="checkbox" className="mr-3 w-5 h-5" /> Макароны — 1 пачка (500г)</li>
                        <li className="flex items-center"><input type="checkbox" className="mr-3 w-5 h-5" /> Картофель — 2.5 кг</li>
                        <li className="flex items-center"><input type="checkbox" className="mr-3 w-5 h-5 text-green-400" /> Капуста — 2 кочана</li>
                        <li className="flex items-center"><input type="checkbox" className="mr-3 w-5 h-5 text-green-400" /> Огурцы — 1.5 кг</li>
                        <li className="flex items-center"><input type="checkbox" className="mr-3 w-5 h-5 text-purple-300" /> Свекла (вареная) — 1 уп</li>
                        <li className="flex items-center"><input type="checkbox" className="mr-3 w-5 h-5 text-blue-300" /> Квашеная капуста — 2-3 уп / 1 кг (Рома)</li>
                    </ul>
                </div>
            </div>
        </section>
    );
};
