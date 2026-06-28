'use client';

import React from 'react';
import { useDiary } from '@/context/DiaryContext';
import { MealDiary } from '@/components/MealDiary';

export default function DiaryPage() {
  const { currentDate, setCurrentDate, meals, addFood, removeFood, copyYesterday, isLoading } = useDiary();

  const handleAddFood = async (
    mealType: string,
    name: string,
    kcal: number,
    protein: number,
    fat: number,
    carbs: number,
    grams: number
  ) => {
    await addFood(mealType, { name, kcal, protein, fat, carbs, grams });
  };

  const handleRemoveFood = async (mealType: string, index: number) => {
    const list = meals[mealType as keyof typeof meals] || [];
    const item = list[index];
    if (item && item.id) {
      await removeFood(mealType, item.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <MealDiary
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      meals={meals}
      onAddFood={handleAddFood}
      onRemoveFood={handleRemoveFood}
      onCopyYesterday={copyYesterday}
    />
  );
}
