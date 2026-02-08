'use client';

import React from 'react';

export const Header = () => {
    return (
        <header className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">🍎 Детальный план питания</h1>

            {/* Goals Cards */}
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
                {/* Roman's Goals */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center shadow-sm">
                    <h2 className="font-bold text-blue-900 text-lg">👨 Роман</h2>
                    <div className="text-2xl font-bold text-blue-800 my-1">1960 ккал</div>
                    <div className="text-xs text-blue-700 font-mono">
                        Б:147г | Ж:65г | У:196г
                    </div>
                </div>
                {/* Liza's Goals */}
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 text-center shadow-sm">
                    <h2 className="font-bold text-pink-900 text-lg">👩 Лиза</h2>
                    <div className="text-2xl font-bold text-pink-800 my-1">1770 ккал</div>
                    <div className="text-xs text-pink-700 font-mono">
                        Б:133г | Ж:59г | У:177г
                    </div>
                </div>
            </div>

            <button
                onClick={() => window.print()}
                className="no-print bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition shadow-md"
            >
                <i className="fas fa-print mr-2"></i> Распечатать план
            </button>
        </header>
    );
};
