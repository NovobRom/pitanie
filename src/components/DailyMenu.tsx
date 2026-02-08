'use client';

import React from 'react';
import { weekMenu } from '@/data/menu';
import { DayCard } from './DayCard';

export const DailyMenu = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-[var(--color-text)] mb-8 text-center">
        📅 Меню на неделю
      </h2>

      <div className="space-y-6">
        {weekMenu.map((day, idx) => (
          <DayCard key={idx} day={day} />
        ))}
      </div>
    </div>
  );
};
