'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { Header } from '@/components/Header';
import { AuthWall } from '@/components/AuthWall';
import { Dashboard } from '@/components/Dashboard';
import { MealDiary } from '@/components/MealDiary';
import { ProfileModal } from '@/components/ProfileModal';
import { WeightWidget } from '@/components/WeightWidget';
import { BottomNav, Tab } from '@/components/BottomNav';
import { DashboardSkeleton, DiarySkeleton, Skeleton } from '@/components/Skeleton';
import { Macros } from '@/lib/nutrition';
import { getProfile } from '@/lib/cloud';
import { useDiary, type DiaryData } from '@/lib/useDiary';
import type { Micros } from '@/lib/micronutrients';
import type { AiLoggedItem } from '@/app/api/ai-log/route';

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

  // ── Load diary (SWR: cached per date, race-safe) ──
  const { diary, isLoading: loadingDiary, mutate: mutateDiary } = useDiary(
    user?.id ?? null,
    currentDate,
  );

  // Seed local edit state from whatever SWR resolved for the current day.
  useEffect(() => {
    if (!user || !currentDate || loadingDiary) return;
    if (diary?.meals) {
      setMeals(diary.meals);
      if (diary.goals) setGoals(diary.goals);
    } else {
      setMeals(EMPTY_MEALS);
      setGoals(user.user_metadata?.goals || DEFAULT_GOALS);
    }
  }, [diary, loadingDiary, user, currentDate]);

  // ── Save diary ──
  const saveDiary = async (updatedMeals: any, targetGoals: Macros) => {
    if (!user || !currentDate) return;
    const next: DiaryData = { meals: updatedMeals, goals: targetGoals };
    // Keep the SWR cache in sync with the optimistic local edit (no refetch).
    mutateDiary(next, { revalidate: false });
    const { error } = await supabase.from('plans').upsert(
      { owner_id: user.id, title: currentDate, data: next },
      { onConflict: 'owner_id,title' }
    );
    if (error) console.error('Failed to save diary:', error.message, error.details);
  };

  const handleAddFood = (
    mealType: string,
    name: string,
    kcal: number,
    protein: number,
    fat: number,
    carbs: number,
    grams: number,
    fiber?: number,
    micros?: Micros
  ) => {
    const item: any = { name, grams, kcal, protein, fat, carbs };
    if (fiber != null) item.fiber = fiber;
    if (micros) item.micros = micros;
    const updatedMeals = {
      ...meals,
      [mealType]: [...(meals[mealType] || []), item],
    };
    setMeals(updatedMeals);
    saveDiary(updatedMeals, goals);
  };

  const handleAddFoodBatch = (mealType: string, newItems: AiLoggedItem[]) => {
    if (!newItems.length) return;
    const mapped = newItems.map((item) => {
      const r: any = { name: item.name, grams: item.grams, kcal: item.kcal, protein: item.protein, fat: item.fat, carbs: item.carbs };
      if (item.fiber != null) r.fiber = item.fiber;
      if (item.micros) r.micros = item.micros;
      return r;
    });
    const updatedMeals = {
      ...meals,
      [mealType]: [...(meals[mealType] || []), ...mapped],
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
    setActiveTab('today');
  };

  const handleCopyYesterday = async (): Promise<boolean> => {
    if (!user || !currentDate) return false;
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    const yStr = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}-${String(prev.getDate()).padStart(2, '0')}`;
    try {
      const { data } = await supabase.from('plans').select('data').eq('owner_id', user.id).eq('title', yStr).maybeSingle();
      if (!data?.data?.meals) return false;
      const copied = data.data.meals;
      setMeals(copied);
      await saveDiary(copied, goals);
      return true;
    } catch {
      return false;
    }
  };

  // Recompute totals only when the meals change, not on every re-render
  // (e.g. opening a modal or switching tabs).
  const consumed = useMemo(() => {
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

  if (loadingSession) {
    return (
      <div className="min-h-screen">
        <main className="p-4 md:p-6 text-[var(--color-text)] max-w-2xl mx-auto pb-28">
          {/* Header placeholder */}
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  if (!user) return <AuthWall />;

  return (
    <div className="min-h-screen">
      <main className="p-4 md:p-6 text-[var(--color-text)] max-w-2xl mx-auto pb-28">
        <Header user={user} onOpenProfile={() => setActiveTab('profile')} />

        {activeTab === 'today' && (
          loadingDiary ? (
            <DashboardSkeleton />
          ) : (
            <Dashboard
              goals={goals}
              consumed={consumed}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onAddFood={handleAddFood}
              onAddFoods={handleAddFoodBatch}
            />
          )
        )}

        {activeTab === 'diary' && (
          loadingDiary ? (
            <DiarySkeleton />
          ) : (
            <MealDiary
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              meals={meals}
              onAddFood={handleAddFood}
              onAddFoods={handleAddFoodBatch}
              onRemoveFood={handleRemoveFood}
              onCopyYesterday={handleCopyYesterday}
            />
          )
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
