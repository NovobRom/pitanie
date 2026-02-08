'use client';

import React from 'react';
import { Day } from '@/data/types';
import { MealCard } from './MealCard';

interface DayCardProps {
  day: Day;
}

const getGrainColor = (grainType: Day['grainType']) => {
  const colors = {
    grechka: 'bg-amber-100 text-amber-900',
    rice: 'bg-yellow-100 text-yellow-900',
    pasta: 'bg-orange-100 text-orange-900',
    potato: 'bg-yellow-50 text-yellow-800',
  };
  return colors[grainType];
};

export const DayCard: React.FC<DayCardProps> = ({ day }) => {
  if (day.isCheatDay) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-[var(--shadow-md)] overflow-hidden border-2 border-purple-200">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex justify-between items-center">
          <span className="font-bold text-lg uppercase tracking-wide">{day.dayName}</span>
          <span className="bg-white text-purple-700 px-4 py-1.5 rounded-full text-sm font-bold">
            🍔 {day.grain}
          </span>
        </div>

        <div className="p-8 text-center">
          <div className="text-6xl mb-4">🍕</div>
          <h3 className="text-2xl font-bold text-purple-900 mb-3">Отдых от диеты!</h3>
          <p className="text-purple-800 mb-6 text-base leading-relaxed max-w-md mx-auto">
            Сегодня можно расслабиться и съесть то, чего хотелось всю неделю (Пицца, Суши, Бургер, Торт).
          </p>
          <div className="inline-block bg-white px-5 py-3 rounded-xl border border-purple-200 text-sm text-[var(--color-text)]">
            💡 <b>Совет:</b> Сделайте "праздник" на один прием пищи (например, обед), а завтрак и ужин оставьте
            легкими (Творог/Яйца), чтобы не перегружать желудок.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[var(--shadow-md)] overflow-hidden border border-[var(--color-border)]">
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white p-4 flex justify-between items-center">
        <span className="font-bold text-lg uppercase tracking-wide">{day.dayName}</span>
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${getGrainColor(day.grainType)}`}>
          {day.grain}
        </span>
      </div>

      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
        {day.meals.map((meal, idx) => (
          <MealCard key={idx} meal={meal} />
        ))}
      </div>
    </div>
  );
};
