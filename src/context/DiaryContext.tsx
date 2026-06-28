'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { MealItem, MealsState } from '@/types/nutrition';
import { loadDiary, addDiaryEntry, removeDiaryEntry } from '@/services/diary.service';

interface DiaryContextType {
  meals: MealsState;
  currentDate: string;
  isLoading: boolean;
  setCurrentDate: (date: string) => void;
  addFood: (mealType: string, entry: Omit<MealItem, 'id'>) => Promise<boolean>;
  removeFood: (mealType: string, entryId: string) => Promise<boolean>;
}

const EMPTY_MEALS: MealsState = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
};

const DiaryContext = createContext<DiaryContextType>({
  meals: EMPTY_MEALS,
  currentDate: '',
  isLoading: true,
  setCurrentDate: () => {},
  addFood: async () => false,
  removeFood: async () => false,
});

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState<string>('');
  const [meals, setMeals] = useState<MealsState>(EMPTY_MEALS);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize date on mount
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setCurrentDate(`${y}-${m}-${d}`);
  }, []);

  // Load meals on date or user change
  useEffect(() => {
    if (!user || !currentDate) {
      setMeals(EMPTY_MEALS);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    loadDiary(user.id, currentDate).then((res) => {
      if (res.ok && res.data) {
        setMeals(res.data);
      } else {
        setMeals(EMPTY_MEALS);
      }
      setIsLoading(false);
    });
  }, [user, currentDate]);

  const addFood = async (mealType: string, entry: Omit<MealItem, 'id'>): Promise<boolean> => {
    if (!user || !currentDate) return false;
    const res = await addDiaryEntry(user.id, currentDate, mealType, entry);
    if (res.ok && res.data) {
      const newEntry = res.data;
      setMeals((prev) => ({
        ...prev,
        [mealType]: [...(prev[mealType as keyof MealsState] || []), newEntry],
      }));
      return true;
    }
    return false;
  };

  const removeFood = async (mealType: string, entryId: string): Promise<boolean> => {
    const res = await removeDiaryEntry(entryId);
    if (res.ok) {
      setMeals((prev) => ({
        ...prev,
        [mealType]: (prev[mealType as keyof MealsState] || []).filter((item) => item.id !== entryId),
      }));
      return true;
    }
    return false;
  };

  return (
    <DiaryContext.Provider value={{ meals, currentDate, isLoading, setCurrentDate, addFood, removeFood }}>
      {children}
    </DiaryContext.Provider>
  );
}

export function useDiary() {
  return useContext(DiaryContext);
}
