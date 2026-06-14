'use client';

import React, { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { Header } from '@/components/Header';
import { AuthWall } from '@/components/AuthWall';
import { Dashboard } from '@/components/Dashboard';
import { MealDiary } from '@/components/MealDiary';
import { ProfileModal } from '@/components/ProfileModal';
import { WeightWidget } from '@/components/WeightWidget';
import { BottomNav, Tab } from '@/components/BottomNav';
import { Macros } from '@/lib/nutrition';
import { getProfile } from '@/lib/cloud';

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
  const [activeTab, setActiveTab] = useState<Tab>('today');

  useEffect(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setCurrentDate(`${y}-${m}-${d}`);
  }, []);

  // ── Auth state ──
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        // Try profiles table first, fallback to user_metadata
        const profile = await getProfile(u.id);
        setGoals(profile?.goals || u.user_metadata?.goals || DEFAULT_GOALS);
      }
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const profile = await getProfile(u.id);
        setGoals(profile?.goals || u.user_metadata?.goals || DEFAULT_GOALS);
      } else {
        setGoals(DEFAULT_GOALS);
        setMeals(EMPTY_MEALS);
      }
      setLoadingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Load diary ──
  useEffect(() => {
    if (!user || !currentDate) return;

    const loadDiary = async () => {
      try {
        const { data } = await supabase
          .from('plans')
          .select('data')
          .eq('owner_id', user.id)
          .eq('title', currentDate)
          .maybeSingle();

        if (data?.data) {
          setMeals(data.data.meals || EMPTY_MEALS);
          if (data.data.goals) setGoals(data.data.goals);
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

  // ── Save diary ──
  const saveDiary = async (updatedMeals: any, targetGoals: Macros) => {
    if (!user || !currentDate) return;
    try {
      await supabase.from('plans').upsert(
        { owner_id: user.id, title: currentDate, data: { meals: updatedMeals, goals: targetGoals } },
        { onConflict: 'owner_id,title' }
      );
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
    const updatedMeals = {
      ...meals,
      [mealType]: [...(meals[mealType] || []), { name, grams, kcal, protein, fat, carbs }],
    };
    setMeals(updatedMeals);
    saveDiary(updatedMeals, goals);
  };

  const handleRemoveFood = (mealType: string, index: number) => {
    const updatedMeals = {
      ...meals,
      [mealType]: (meals[mealType] || []).filter((_: any, i: number) => i !== index),
    };
    setMeals(updatedMeals);
    saveDiary(updatedMeals, goals);
  };

  const handleProfileSave = (newGoals: Macros) => {
    setGoals(newGoals);
    saveDiary(meals, newGoals);
    setActiveTab('today');
  };

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
        <div className="w-8 h-8 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthWall />;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <main className="p-4 md:p-6 text-[var(--color-text)] max-w-2xl mx-auto pb-28">
        <Header user={user} onOpenProfile={() => setActiveTab('profile')} />

        {activeTab === 'today' && (
          <Dashboard
            goals={goals}
            consumed={calculateConsumed()}
            onOpenProfile={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'diary' && (
          <MealDiary
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            meals={meals}
            onAddFood={handleAddFood}
            onRemoveFood={handleRemoveFood}
          />
        )}

        {activeTab === 'profile' && (
          <>
            <WeightWidget user={user} />
            <ProfileModal
              user={user}
              onClose={() => setActiveTab('today')}
              onSave={handleProfileSave}
              inline
            />
          </>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
