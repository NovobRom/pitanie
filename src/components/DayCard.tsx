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
    mixed: 'bg-indigo-100 text-indigo-900',
  };
  return colors[grainType];
};

export const DayCard: React.FC<DayCardProps> = ({ day }) => {
  return (
    <div
      className={`rounded-2xl shadow-[var(--shadow-md)] overflow-hidden border-2 ${day.isCheatDay
          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
          : 'bg-white border-[var(--color-border)]'
        }`}
    >
      <div
        className={`p-4 flex justify-between items-center ${day.isCheatDay
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            : 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white'
          }`}
      >
        <span className="font-bold text-lg uppercase tracking-wide">{day.dayName}</span>
        <span
          className={`px-4 py-1.5 rounded-full text-sm font-bold ${day.isCheatDay ? 'bg-white text-purple-700' : getGrainColor(day.grainType)
            }`}
        >
          {day.isCheatDay ? `🍔 ${day.grain}` : day.grain}
        </span>
      </div>

      {day.note && (
        <div className="bg-amber-50 border-b border-amber-100 p-3 text-center text-sm font-medium text-amber-900 flex items-center justify-center gap-2">
          {day.note}
        </div>
      )}

      {day.isCheatDay && (
        <div className="p-8 text-center border-b border-purple-100">
          <div className="text-6xl mb-4">🍕</div>
          <h3 className="text-2xl font-bold text-purple-900 mb-3">Читмил!</h3>
          <p className="text-purple-800 mb-4 text-base leading-relaxed max-w-md mx-auto">
            Один любой прием пищи — всё, что душе угодно (Пицца, Суши, Бургер).
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
        {day.meals.map((meal, idx) => (
          <MealCard key={idx} meal={meal} />
        ))}
      </div>
    </div>
  );
};
