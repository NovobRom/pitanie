'use client';

import React from 'react';
import { Meal, MealItem, Portion } from '@/data/types';

interface MealCardProps {
  meal: Meal;
}

const getMealStyles = (type: Meal['type']) => {
  const styles = {
    breakfast: {
      bg: 'bg-[var(--color-breakfast-bg)]',
      border: 'border-[var(--color-breakfast)]',
      text: 'text-[var(--color-accent-dark)]',
    },
    lunch: {
      bg: 'bg-[var(--color-lunch-bg)]',
      border: 'border-[var(--color-lunch)]',
      text: 'text-[var(--color-primary-dark)]',
    },
    dinner: {
      bg: 'bg-[var(--color-dinner-bg)]',
      border: 'border-[var(--color-dinner)]',
      text: 'text-[#7c5ba7]',
    },
  };
  return styles[type];
};

const getMealTitle = (type: Meal['type']) => {
  const titles = {
    breakfast: 'Завтрак',
    lunch: 'Обед',
    dinner: 'Ужин',
  };
  return titles[type];
};

const renderPortion = (portion: Portion | string | undefined) => {
  if (!portion) return null;
  if (typeof portion === 'string') return <span>{portion}</span>;
  return (
    <>
      <span className="text-[var(--color-roman)] font-medium">{portion.roman}</span>
      {' / '}
      <span className="text-[var(--color-liza)] font-medium">{portion.liza}</span>
    </>
  );
};

const MealItemRow: React.FC<{ item: MealItem }> = ({ item }) => {
  return (
    <li className="text-sm leading-relaxed">
      <b className="font-semibold">{item.name}:</b>{' '}
      {item.portion && renderPortion(item.portion)}
      {item.romanOnly && (
        <div className="mt-0.5">
          <span className="text-xs bg-[var(--color-roman-bg)] text-[var(--color-roman)] px-2 py-0.5 rounded-full">
            👨 {item.romanOnly}
          </span>
        </div>
      )}
      {item.lizaOnly && (
        <div className="mt-0.5">
          <span className="text-xs text-[var(--color-liza)]">👩 {item.lizaOnly}</span>
        </div>
      )}
      {item.note && <span className="text-xs text-[var(--color-text-muted)]"> {item.note}</span>}
    </li>
  );
};

export const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  const styles = getMealStyles(meal.type);

  return (
    <div className={`p-4 ${styles.bg} border-l-4 ${styles.border} rounded-lg`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-bold ${styles.text} uppercase text-sm tracking-wide flex items-center gap-2`}>
          <span className="text-lg">{meal.icon}</span>
          {getMealTitle(meal.type)}
        </h3>
      </div>

      <ul className="space-y-2 mb-4 text-[var(--color-text)]">
        {meal.items.map((item, idx) => (
          <MealItemRow key={idx} item={item} />
        ))}
      </ul>

      <div className={`text-xs border-t ${styles.border} border-opacity-20 pt-3 space-y-1`}>
        <div className="flex justify-between font-medium text-[var(--color-roman)]">
          <span>👨 Роман:</span>
          <span>{meal.calories.roman}</span>
        </div>
        <div className="flex justify-between font-medium text-[var(--color-liza)]">
          <span>👩 Лиза:</span>
          <span>{meal.calories.liza}</span>
        </div>
      </div>
    </div>
  );
};
