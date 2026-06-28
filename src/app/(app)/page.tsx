'use client';

import React from 'react';
import { useProfile } from '@/context/ProfileContext';
import { useDiary } from '@/context/DiaryContext';
import { Dashboard } from '@/components/Dashboard';

export default function DashboardPage() {
  const { goals } = useProfile();
  const { meals, isLoading } = useDiary();

  const consumed = React.useMemo(() => {
    const total = { kcal: 0, protein: 0, fat: 0, carbs: 0 };
    Object.values(meals).forEach((list: any) => {
      list.forEach((item: any) => {
        const factor = item.grams / 100;
        total.kcal += item.kcal * factor;
        total.protein += item.protein * factor;
        total.fat += item.fat * factor;
        total.carbs += item.carbs * factor;
      });
    });
    return total;
  }, [meals]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <Dashboard
      goals={goals}
      consumed={consumed}
      onOpenProfile={() => {}} // No longer needs callback as nav bar handles profile routing
    />
  );
}
