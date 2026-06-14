'use client';

import React, { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { Header } from '@/components/Header';
import { AuthWall } from '@/components/AuthWall';
import { Dashboard } from '@/components/Dashboard';
import { MealDiary } from '@/components/MealDiary';
import { ProfileModal } from '@/components/ProfileModal';
import { Macros } from '@/lib/nutrition';

const DEFAULT_GOALS: Macros = {
  calories: 2000,
  protein: 150,
  fat: 60,
  carbs: 215,
};

const EMPTY_MEALS = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [goals, setGoals] = useState<Macros>(DEFAULT_GOALS);
  const [meals, setMeals] = useState<any>(EMPTY_MEALS);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Set today's date on mount
  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setCurrentDate(`${y}-${m}-${d}`);
  }, []);

  // ── Auth state subscription ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const userGoals = session.user.user_metadata?.goals;
        setGoals(userGoals || DEFAULT_GOALS);
      }
      setLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const userGoals = session.user.user_metadata?.goals;
        setGoals(userGoals || DEFAULT_GOALS);
      } else {
        setGoals(DEFAULT_GOALS);
        setMeals(EMPTY_MEALS);
      }
      setLoadingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Load diary data when date or user changes ──
  useEffect(() => {
    if (!user || !currentDate) return;

    const loadDiary = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('data')
          .eq('owner_id', user.id)
          .eq('title', currentDate)
          .maybeSingle();

        if (data?.data) {
          setMeals(data.data.meals || EMPTY_MEALS);
          if (data.data.goals) {
            setGoals(data.data.goals);
          }
        } else {
          setMeals(EMPTY_MEALS);
          const userGoals = user.user_metadata?.goals;
          setGoals(userGoals || DEFAULT_GOALS);
        }
      } catch (err) {
        console.error('Failed to load diary:', err);
      }
    };

    loadDiary();
  }, [user, currentDate]);

  // ── Save/Upsert diary data ──
  const saveDiary = async (updatedMeals: any, targetGoals: Macros) => {
    if (!user || !currentDate) return;

    try {
      const payload = {
        owner_id: user.id,
        title: currentDate,
        data: {
          meals: updatedMeals,
          goals: targetGoals,
        },
      };

      await supabase
        .from('plans')
        .upsert(payload, { onConflict: 'owner_id,title' });
    } catch (err) {
      console.error('Failed to save diary:', err);
    }
  };

  const handleAddFood = (
    mealType: string,
    name: string,
    kcal: number,
    protein: number,
    fat: number,
    carbs: number,
    grams: number
  ) => {
    const newFood = { name, grams, kcal, protein, fat, carbs };
    const updatedMeals = {
      ...meals,
      [mealType]: [...(meals[mealType] || []), newFood],
    };
    setMeals(updatedMeals);
    saveDiary(updatedMeals, goals);
  };

  const handleRemoveFood = (mealType: string, index: number) => {
    const updatedMealList = (meals[mealType] || []).filter((_: any, i: number) => i !== index);
    const updatedMeals = {
      ...meals,
      [mealType]: updatedMealList,
    };
    setMeals(updatedMeals);
    saveDiary(updatedMeals, goals);
  };

  const handleProfileSave = (newGoals: Macros) => {
    setGoals(newGoals);
    saveDiary(meals, newGoals);
  };

  // Calculate total consumed macro nutrients for the Dashboard
  const calculateConsumed = () => {
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
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthWall />;
  }

  return (
    <main className="p-4 md:p-6 text-[var(--color-text)] min-h-screen max-w-4xl mx-auto">
      <Header user={user} onOpenProfile={() => setShowProfileModal(true)} />
      
      <Dashboard goals={goals} consumed={calculateConsumed()} />
      
      <MealDiary
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        meals={meals}
        onAddFood={handleAddFood}
        onRemoveFood={handleRemoveFood}
      />

      {showProfileModal && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onSave={handleProfileSave}
        />
      )}
    </main>
  );
}
