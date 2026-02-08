import React from 'react';

export const DailyMenu = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📅 Меню с расчетами</h2>

            <div className="space-y-8">
                {/* Same content as before, just corrected class -> className */}
                {/* MONDAY */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
                        <span className="font-bold text-lg uppercase">Понедельник</span>
                        <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-bold">Гречка</span>
                    </div>

                    <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                        {/* Breakfast */}
                        <div className="p-4 bg-orange-50/30">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-orange-600 uppercase text-sm">🌅 Завтрак</h3>
                                <i className="fas fa-egg text-orange-200"></i>
                            </div>
                            <ul className="text-sm text-gray-700 mb-3 space-y-1">
                                <li>• <b>Яйца:</b> 2 шт</li>
                                <li>• <b>Слив. масло:</b> 10 г</li>
                                <li>• <b>Гречка:</b> 1/3 часть</li>
                            </ul>
                            <div className="text-xs border-t border-orange-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800 font-medium">
                                    <span>👨 530 ккал</span>
                                </div>
                                <div className="flex justify-between text-pink-800 font-medium">
                                    <span>👩 485 ккал</span>
                                </div>
                            </div>
                        </div>

                        {/* Lunch */}
                        <div className="p-4 bg-red-50/30">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-red-600 uppercase text-sm">☀️ Обед</h3>
                                <i className="fas fa-drumstick-bite text-red-200"></i>
                            </div>
                            <ul className="text-sm text-gray-700 mb-3 space-y-1">
                                <li>• <b>Курица:</b> <span className="text-blue-600">280г</span> / <span className="text-pink-600">240г</span></li>
                                <li>• <b>Гречка:</b> 1/3 часть</li>
                                <li className="font-bold text-xs mt-1">Овощи:</li>
                                <li>👨 <span className="text-blue-700 bg-blue-100 px-1 rounded">Квашеная капуста</span></li>
                                <li>👩 <span className="text-pink-700">Огурец + Капуста</span></li>
                                <li className="mt-1">• <b>Слив. масло:</b> <span className="text-blue-600">15г</span> / <span className="text-pink-600">10г</span></li>
                            </ul>
                            <div className="text-xs border-t border-red-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800 font-medium">
                                    <span>👨 795 ккал</span>
                                </div>
                                <div className="flex justify-between text-pink-800 font-medium">
                                    <span>👩 670 ккал</span>
                                </div>
                            </div>
                        </div>

                        {/* Dinner */}
                        <div className="p-4 bg-indigo-50/30">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-indigo-600 uppercase text-sm">🌙 Ужин</h3>
                                <i className="fas fa-cheese text-indigo-200"></i>
                            </div>
                            <ul className="text-sm text-gray-700 mb-3 space-y-1">
                                <li>• <b>Творог:</b> 180 г (1п)</li>
                                <li>• <b>Гречка:</b> 1/3 часть</li>
                                <li className="bg-purple-100 px-1 rounded">• <b>+ Свекла вареная</b></li>
                                <li>• <b>Слив. масло:</b> <span className="text-blue-600">15г</span> / <span className="text-pink-600">10г</span></li>
                            </ul>
                            <div className="text-xs border-t border-indigo-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800 font-medium">
                                    <span>👨 ~615 ккал</span>
                                </div>
                                <div className="flex justify-between text-pink-800 font-medium">
                                    <span>👩 ~535 ккал</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TUESDAY (Rice + Sauerkraut for Roman) */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
                        <span className="font-bold text-lg uppercase">Вторник</span>
                        <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-bold">Рис</span>
                    </div>
                    <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        <div className="p-4 bg-orange-50/30">
                            <h3 className="font-bold text-orange-600 uppercase text-sm mb-2">🌅 Завтрак</h3>
                            <ul className="text-sm text-gray-700 mb-3 space-y-1">
                                <li>• <b>Яйца:</b> 2 шт</li>
                                <li>• <b>Слив. масло:</b> 10 г</li>
                                <li>• <b>Рис:</b> 1/3 часть</li>
                            </ul>
                            <div className="text-xs border-t border-orange-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800"><span>👨 530 ккал</span></div>
                                <div className="flex justify-between text-pink-800"><span>👩 485 ккал</span></div>
                            </div>
                        </div>
                        <div className="p-4 bg-red-50/30">
                            <h3 className="font-bold text-red-600 uppercase text-sm mb-2">☀️ Обед</h3>
                            <ul className="text-sm text-gray-700 mb-3 space-y-1">
                                <li>• <b>Курица:</b> Стандарт</li>
                                <li>• <b>Рис:</b> 1/3 часть</li>
                                <li className="font-bold text-xs mt-1">Овощи:</li>
                                <li>👨 <span className="text-blue-700 bg-blue-100 px-1 rounded">Квашеная капуста</span></li>
                                <li>👩 <span className="text-pink-700">Огурец + Капуста</span></li>
                                <li className="mt-1">• <b>Масла:</b> Стандарт</li>
                            </ul>
                            <div className="text-xs border-t border-red-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800"><span>👨 795 ккал</span></div>
                                <div className="flex justify-between text-pink-800"><span>👩 670 ккал</span></div>
                            </div>
                        </div>
                        <div className="p-4 bg-indigo-50/30">
                            <h3 className="font-bold text-indigo-600 uppercase text-sm mb-2">🌙 Ужин</h3>
                            <ul className="text-sm text-gray-700 mb-3 space-y-1">
                                <li>• <b>Творог:</b> 180 г (1п)</li>
                                <li>• <b>Рис:</b> 1/3 часть</li>
                                <li>• <b>Слив. масло:</b> Стандарт</li>
                            </ul>
                            <div className="text-xs border-t border-indigo-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800"><span>👨 585 ккал</span></div>
                                <div className="flex justify-between text-pink-800"><span>👩 505 ккал</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* WEDNESDAY (Pasta) */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
                        <span className="font-bold text-lg uppercase">Среда</span>
                        <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-bold">Макароны</span>
                    </div>
                    <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        <div className="p-4 bg-orange-50/30">
                            <h3 className="font-bold text-orange-600 uppercase text-sm mb-2">🌅 Завтрак</h3>
                            <ul className="text-sm text-gray-700 mb-3 space-y-1">
                                <li>• <b>Яйца:</b> 2 шт</li>
                                <li>• <b>Слив. масло:</b> 10 г</li>
                                <li>• <b>Макароны:</b> 1/3 часть</li>
                            </ul>
                            <div className="text-xs border-t border-orange-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800"><span>👨 530 ккал</span></div>
                                <div className="flex justify-between text-pink-800"><span>👩 485 ккал</span></div>
                            </div>
                        </div>
                        <div className="p-4 bg-red-50/30">
                            <h3 className="font-bold text-red-600 uppercase text-sm mb-2">☀️ Обед</h3>
                            <ul className="text-sm text-gray-700 mb-3 space-y-1">
                                <li>• <b>Курица:</b> Стандарт</li>
                                <li>• <b>Макароны:</b> 1/3 часть</li>
                                <li className="font-bold text-xs mt-1">Овощи:</li>
                                <li>👨 <span className="text-blue-700 bg-blue-100 px-1 rounded">Квашеная капуста</span></li>
                                <li>👩 <span className="text-pink-700">Огурец + Капуста</span></li>
                                <li className="mt-1">• <b>Масла:</b> Стандарт</li>
                            </ul>
                            <div className="text-xs border-t border-red-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800"><span>👨 795 ккал</span></div>
                                <div className="flex justify-between text-pink-800"><span>👩 670 ккал</span></div>
                            </div>
                        </div>
                        <div className="p-4 bg-indigo-50/30">
                            <h3 className="font-bold text-indigo-600 uppercase text-sm mb-2">🌙 Ужин</h3>
                            <ul className="text-sm text-gray-700 mb-3 space-y-1">
                                <li>• <b>Творог:</b> 180 г (1п)</li>
                                <li>• <b>Макароны:</b> 1/3 часть</li>
                                <li>• <b>Слив. масло:</b> Стандарт</li>
                            </ul>
                            <div className="text-xs border-t border-indigo-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800"><span>👨 585 ккал</span></div>
                                <div className="flex justify-between text-pink-800"><span>👩 505 ккал</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* THURSDAY (POTATO + Sauerkraut) */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
                        <span className="font-bold text-lg uppercase">Четверг</span>
                        <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-bold">Картофель</span>
                    </div>
                    <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                        {/* Breakfast */}
                        <div className="p-4">
                            <h3 className="font-bold text-orange-600 uppercase text-sm mb-2">🌅 Завтрак</h3>
                            <ul className="text-sm text-gray-800 mb-3 space-y-1">
                                <li>• <b>Яйца:</b> 2 шт</li>
                                <li>• <b>Картофель:</b> 1/3 (≈330г / 280г)</li>
                                <li>• <b>Слив. масло:</b> 10 г</li>
                            </ul>
                            <div className="text-xs border-t border-gray-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800"><span>👨 ~470 ккал</span></div>
                                <div className="flex justify-between text-pink-800"><span>👩 ~430 ккал</span></div>
                            </div>
                        </div>

                        {/* Lunch */}
                        <div className="p-4">
                            <h3 className="font-bold text-red-600 uppercase text-sm mb-2">☀️ Обед</h3>
                            <ul className="text-sm text-gray-800 mb-3 space-y-1">
                                <li>• <b>Курица:</b> Стандарт</li>
                                <li>• <b>Картофель:</b> 1/3 часть</li>
                                <li className="font-bold text-xs mt-1">Овощи:</li>
                                <li>👨 <span className="text-blue-700 bg-blue-100 px-1 rounded">Квашеная капуста</span></li>
                                <li>👩 <span className="text-pink-700">Огурец + Капуста</span></li>
                                <li className="mt-1">• <b>Масла:</b> Стандарт</li>
                            </ul>
                            <div className="text-xs border-t border-gray-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800"><span>👨 ~730 ккал</span></div>
                                <div className="flex justify-between text-pink-800"><span>👩 ~620 ккал</span></div>
                            </div>
                        </div>

                        {/* Dinner */}
                        <div className="p-4">
                            <h3 className="font-bold text-indigo-600 uppercase text-sm mb-2">🌙 Ужин</h3>
                            <ul className="text-sm text-gray-800 mb-3 space-y-1">
                                <li>• <b>Творог:</b> 180 г</li>
                                <li>• <b>Картофель:</b> 1/3 часть</li>
                                <li>• <b>Слив. масло:</b> Стандарт</li>
                            </ul>
                            <div className="text-xs border-t border-gray-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800"><span>👨 ~530 ккал</span></div>
                                <div className="flex justify-between text-pink-800"><span>👩 ~460 ккал</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FRIDAY (Buckwheat + Beets) */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
                        <span className="font-bold text-lg uppercase">Пятница</span>
                        <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-bold">Гречка</span>
                    </div>
                    <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        {/* Breakfast */}
                        <div className="p-4 bg-orange-50/30">
                            <h3 className="font-bold text-orange-600 uppercase text-sm mb-2">🌅 Завтрак</h3>
                            <ul className="text-sm text-gray-700 mb-3 space-y-1">
                                <li>• <b>Яйца:</b> 2 шт</li>
                                <li>• <b>Слив. масло:</b> 10 г</li>
                                <li>• <b>Гречка:</b> 1/3 часть</li>
                                <li className="bg-purple-100 px-1 rounded">• <b>+ Свекла вареная</b></li>
                            </ul>
                            <div className="text-xs border-t border-orange-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800"><span>👨 ~560 ккал</span></div>
                                <div className="flex justify-between text-pink-800"><span>👩 ~515 ккал</span></div>
                            </div>
                        </div>
                        {/* Lunch */}
                        <div className="p-4 bg-red-50/30">
                            <h3 className="font-bold text-red-600 uppercase text-sm mb-2">☀️ Обед</h3>
                            <ul className="text-sm text-gray-700 mb-3 space-y-1">
                                <li>• <b>Курица:</b> Стандарт</li>
                                <li>• <b>Гречка:</b> 1/3 часть</li>
                                <li className="font-bold text-xs mt-1">Овощи:</li>
                                <li>👨 <span className="text-blue-700 bg-blue-100 px-1 rounded">Квашеная капуста</span></li>
                                <li>👩 <span className="text-pink-700">Огурец + Капуста</span></li>
                                <li className="mt-1">• <b>Масла:</b> Стандарт</li>
                            </ul>
                            <div className="text-xs border-t border-red-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800"><span>👨 795 ккал</span></div>
                                <div className="flex justify-between text-pink-800"><span>👩 670 ккал</span></div>
                            </div>
                        </div>
                        {/* Dinner */}
                        <div className="p-4 bg-indigo-50/30">
                            <h3 className="font-bold text-indigo-600 uppercase text-sm mb-2">🌙 Ужин</h3>
                            <ul className="text-sm text-gray-700 mb-3 space-y-1">
                                <li>• <b>Творог:</b> 180 г (1п)</li>
                                <li>• <b>Гречка:</b> 1/3 часть</li>
                                <li>• <b>Слив. масло:</b> Стандарт</li>
                            </ul>
                            <div className="text-xs border-t border-indigo-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800"><span>👨 585 ккал</span></div>
                                <div className="flex justify-between text-pink-800"><span>👩 505 ккал</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SATURDAY (Rice + Sauerkraut) */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
                        <span className="font-bold text-lg uppercase">Суббота</span>
                        <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-bold">Рис</span>
                    </div>
                    <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        <div className="p-4 bg-orange-50/30">
                            <h3 className="font-bold text-orange-600 uppercase text-sm mb-2">🌅 Завтрак</h3>
                            <ul className="text-sm text-gray-700 mb-3 space-y-1">
                                <li>• <b>Яйца:</b> 2 шт</li>
                                <li>• <b>Слив. масло:</b> 10 г</li>
                                <li>• <b>Рис:</b> 1/3 часть</li>
                            </ul>
                            <div className="text-xs border-t border-orange-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800"><span>👨 530 ккал</span></div>
                                <div className="flex justify-between text-pink-800"><span>👩 485 ккал</span></div>
                            </div>
                        </div>
                        <div className="p-4 bg-red-50/30">
                            <h3 className="font-bold text-red-600 uppercase text-sm mb-2">☀️ Обед</h3>
                            <ul className="text-sm text-gray-700 mb-3 space-y-1">
                                <li>• <b>Курица:</b> Стандарт</li>
                                <li>• <b>Рис:</b> 1/3 часть</li>
                                <li className="font-bold text-xs mt-1">Овощи:</li>
                                <li>👨 <span className="text-blue-700 bg-blue-100 px-1 rounded">Квашеная капуста</span></li>
                                <li>👩 <span className="text-pink-700">Огурец + Капуста</span></li>
                                <li className="mt-1">• <b>Масла:</b> Стандарт</li>
                            </ul>
                            <div className="text-xs border-t border-red-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800"><span>👨 795 ккал</span></div>
                                <div className="flex justify-between text-pink-800"><span>👩 670 ккал</span></div>
                            </div>
                        </div>
                        <div className="p-4 bg-indigo-50/30">
                            <h3 className="font-bold text-indigo-600 uppercase text-sm mb-2">🌙 Ужин</h3>
                            <ul className="text-sm text-gray-700 mb-3 space-y-1">
                                <li>• <b>Творог:</b> 180 г (1п)</li>
                                <li>• <b>Рис:</b> 1/3 часть</li>
                                <li>• <b>Слив. масло:</b> Стандарт</li>
                            </ul>
                            <div className="text-xs border-t border-indigo-100 pt-2 space-y-1">
                                <div className="flex justify-between text-blue-800"><span>👨 585 ккал</span></div>
                                <div className="flex justify-between text-pink-800"><span>👩 505 ккал</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SUNDAY (CHEAT MEAL) */}
                <div className="bg-purple-50 rounded-xl shadow-md overflow-hidden border-2 border-purple-200">
                    <div className="bg-purple-600 text-white p-3 flex justify-between items-center">
                        <span className="font-bold text-lg uppercase">Воскресенье</span>
                        <span className="bg-white text-purple-800 px-3 py-1 rounded-full text-sm font-bold">🍔 Читмил</span>
                    </div>
                    <div className="p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <i className="fas fa-utensils text-4xl text-purple-300"></i>
                        </div>
                        <h3 className="text-xl font-bold text-purple-900 mb-2">Отдых от диеты!</h3>
                        <p className="text-purple-800 mb-4 text-sm">
                            Сегодня можно расслабиться и съесть то, чего хотелось всю неделю (Пицца, Суши, Бургер, Торт).
                        </p>
                        <div className="inline-block bg-white px-4 py-2 rounded-lg border border-purple-200 text-sm text-gray-600">
                            💡 <b>Совет:</b> Сделайте "праздник" на один прием пищи (например, обед), а завтрак и ужин оставьте легкими (Творог/Яйца), чтобы не перегружать желудок.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
