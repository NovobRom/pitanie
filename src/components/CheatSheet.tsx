import React from 'react';

export const CheatSheet = () => {
    return (
        <section className="bg-white rounded-2xl shadow-lg p-5 mb-8 border-l-8 border-green-500 text-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                <i className="fas fa-scale-balanced mr-3 text-green-500"></i> Общая база на день (Сырой вес)
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <th className="p-2 rounded-tl-lg">Продукт</th>
                            <th className="p-2 bg-blue-50 text-blue-900 border-l border-blue-200">👨 Роман</th>
                            <th className="p-2 bg-pink-50 text-pink-900 border-l border-pink-200 rounded-tr-lg">👩 Лиза</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        <tr className="border-b">
                            <td className="p-2 font-semibold">🥣 Крупа (гречка/рис) сухая</td>
                            <td className="p-2 border-l border-blue-100">280 г</td>
                            <td className="p-2 border-l border-pink-100">240 г</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-2 font-semibold">🍝 Макароны (сухие)</td>
                            <td className="p-2 border-l border-blue-100">280 г</td>
                            <td className="p-2 border-l border-pink-100">240 г</td>
                        </tr>
                        <tr className="border-b bg-yellow-50">
                            <td className="p-2 font-semibold text-yellow-800">🥔 Картофель (сырой)</td>
                            <td className="p-2 border-l border-yellow-100 font-bold">1 кг</td>
                            <td className="p-2 border-l border-yellow-100 font-bold">850 г</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-2 font-semibold">🍗 Курица (сырая)</td>
                            <td className="p-2 border-l border-blue-100">280 г</td>
                            <td className="p-2 border-l border-pink-100">240 г</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-2 font-semibold">🥛 Творог (Varškė)</td>
                            <td className="p-2 border-l border-blue-100">1 пачка (180г)</td>
                            <td className="p-2 border-l border-pink-100">1 пачка (180г)</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-2 font-semibold text-yellow-800">🧈 Масло сливочное</td>
                            <td className="p-2 border-l border-yellow-100 font-bold">40 г</td>
                            <td className="p-2 border-l border-yellow-100 font-bold">30 г</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p className="mt-2 text-xs text-gray-500">* Овощи: Капуста + Огурцы + Уксус (Роману на обед Квашеная капуста).</p>
        </section>
    );
};
