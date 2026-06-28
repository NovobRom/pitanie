'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight, Utensils, Copy } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { FoodSearchModal } from '@/components/FoodSearchModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Micros } from '@/lib/micronutrients';
import type { AiLoggedItem } from '@/app/api/ai-log/route';
import { AiLogModal } from '@/components/AiLogModal';

interface RationItem {
  name: string;
  grams: number;
  kcal: number; // per 100g
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number; // per 100g, optional
  micros?: Micros; // per 100g, optional (AI-logged items only)
}

interface MealDiaryProps {
  currentDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  meals: {
    breakfast: RationItem[];
    lunch: RationItem[];
    dinner: RationItem[];
    snacks: RationItem[];
  };
  onAddFood: (mealType: string, name: string, kcal: number, protein: number, fat: number, carbs: number, grams: number, fiber?: number, micros?: Micros) => void;
  onAddFoods?: (mealType: string, items: AiLoggedItem[]) => void;
  onRemoveFood: (mealType: string, index: number) => void;
  onCopyYesterday: () => Promise<boolean>;
}

export function MealDiary({ currentDate, onDateChange, meals, onAddFood, onAddFoods, onRemoveFood, onCopyYesterday }: MealDiaryProps) {
  const { t, lang } = useI18n();
  const [activeSearchMeal, setActiveSearchMeal] = useState<string | null>(null);
  const [activeAiMeal, setActiveAiMeal] = useState<string | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  // Generate week days (Mon-Sun) containing the currentDate
  const getWeekDays = (dateStr: string) => {
    const current = new Date(dateStr);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(current.setDate(diff));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const temp = new Date(monday);
      temp.setDate(monday.getDate() + i);
      days.push(temp);
    }
    return days;
  };

  const toDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const weekDays = getWeekDays(currentDate);

  const getDayName = (date: Date) => {
    const weekdayMap: Record<string, string[]> = {
      ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      uk: ['Нд', 'Пн', 'Вв', 'Ср', 'Чт', 'Пт', 'Сб'],
    };
    const currentLang = lang === 'uk' || lang === 'en' ? lang : 'ru';
    return weekdayMap[currentLang][date.getDay()];
  };

  // Move calendar by 7 days
  const shiftWeek = (direction: 'prev' | 'next') => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + (direction === 'prev' ? -7 : 7));
    onDateChange(toDateStr(date));
  };

  const calculateMealTotals = (items: RationItem[]) => {
    return items.reduce(
      (acc, item) => {
        const f = item.grams / 100;
        return {
          kcal: acc.kcal + item.kcal * f,
          protein: acc.protein + item.protein * f,
          fat: acc.fat + item.fat * f,
          carbs: acc.carbs + item.carbs * f,
          fiber: acc.fiber + (item.fiber ?? 0) * f,
        };
      },
      { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
    );
  };

  const [confirmDelete, setConfirmDelete] = useState<{ mealType: string; index: number } | null>(null);

  const renderMealSection = (type: 'breakfast' | 'lunch' | 'dinner' | 'snacks', title: string) => {
    const items = meals[type] || [];
    const totals = calculateMealTotals(items);

    return (
      <div className="glass-card rounded-3xl p-5 space-y-4 animate-slide-up">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
          <div>
            <h4 className="font-bold text-[var(--color-text)] text-sm">{title}</h4>
            <p className="text-[10px] font-mono text-[var(--color-text-muted)]">
              {Math.round(totals.kcal)} {t('calc.kcal')} · {t('build.protShort')}{Math.round(totals.protein)}г · {t('build.fatShort')}{Math.round(totals.fat)}г · {t('build.carbShort')}{Math.round(totals.carbs)}г{totals.fiber > 0.1 ? ` · ${t('micro.fiber.short')}${Math.round(totals.fiber * 10) / 10}г` : ''}
            </p>
          </div>
          <button
            onClick={() => setActiveSearchMeal(type)}
            className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-xl btn-interactive cursor-pointer"
          >
            <Plus size={12} />
            {t('diary.add')}
          </button>
        </div>

        {/* Added Foods List */}
        {items.length === 0 ? (
          <EmptyState
            icon={Utensils}
            title={t('diary.empty') || 'Empty Meal'}
            description={t('diary.emptyDesc') || 'No foods logged for this meal yet. Click the add button to log something!'}
          />
        ) : (
          <ul className="space-y-2.5">
            {items.map((item, idx) => {
              const factor = item.grams / 100;
              const isConfirming = confirmDelete?.mealType === type && confirmDelete?.index === idx;

              return (
                <li
                  key={`${item.name}-${idx}`}
                  className="flex items-center justify-between text-xs bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-2)] p-2.5 rounded-xl border border-[var(--color-border)] transition-all"
                >
                  <div className="min-w-0 pr-4">
                    <p className="font-semibold text-[var(--color-text)] truncate">{item.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                      {item.grams}g · {Math.round(item.kcal * factor)} {t('calc.kcal')} · {t('build.protShort')}{Math.round(item.protein * factor)}g
                    </p>
                  </div>
                  
                  {isConfirming ? (
                    <div className="flex items-center gap-1.5 shrink-0 animate-scale-in">
                      <button
                        onClick={async () => {
                          onRemoveFood(type, idx);
                          setConfirmDelete(null);
                        }}
                        className="bg-red-500 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg hover:bg-red-600 transition-all cursor-pointer btn-interactive"
                      >
                        {t('diary.confirmDelete') || 'Delete'}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="bg-gray-100 text-[var(--color-text)] font-semibold text-[9px] px-2.5 py-1.5 rounded-lg hover:bg-gray-200 transition-all cursor-pointer"
                      >
                        {t('share.reset') || 'Cancel'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete({ mealType: type, index: idx })}
                      className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors p-1 btn-interactive cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* ─── Apple Health Weekly Calendar Strip ─── */}
      <div className="glass-card rounded-3xl p-4 flex items-center justify-between animate-scale-in">
        <button
          onClick={() => shiftWeek('prev')}
          className="text-[var(--color-text-muted)] p-1.5 rounded-full btn-interactive cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex gap-2.5 md:gap-4 overflow-x-auto select-none no-scrollbar">
          {weekDays.map((date) => {
            const dateStr = toDateStr(date);
            const isActive = dateStr === currentDate;
            const isToday = toDateStr(new Date()) === dateStr;

            return (
              <div
                key={dateStr}
                onClick={() => onDateChange(dateStr)}
                className={`flex flex-col items-center justify-center w-10 h-14 rounded-2xl cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
                }`}
              >
                <span className={`text-[10px] font-bold ${isActive ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>
                  {getDayName(date)}
                </span>
                <span className="text-sm font-extrabold mt-1">{date.getDate()}</span>
                {isToday && !isActive && <span className="w-1 h-1 bg-[var(--color-primary)] rounded-full mt-1"></span>}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => shiftWeek('next')}
          className="text-[var(--color-text-muted)] p-1.5 rounded-full btn-interactive cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ─── Copy Yesterday ─── */}
      <div className="flex justify-end">
        <button
          onClick={async () => {
            const ok = await onCopyYesterday();
            const msg = ok ? t('diary.copyYesterday') : t('diary.copyYesterdayEmpty');
            setCopyMsg(msg);
            setTimeout(() => setCopyMsg(null), 2500);
          }}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-light)] hover:text-[var(--color-primary)] bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 px-3 py-1.5 rounded-xl transition-all shadow-sm"
        >
          <Copy size={12} />
          {copyMsg ?? t('diary.copyYesterday')}
        </button>
      </div>

      {/* ─── Diary Sections ─── */}
      <div className="grid gap-4 md:grid-cols-2">
        {renderMealSection('breakfast', t('diary.breakfast'))}
        {renderMealSection('lunch', t('diary.lunch'))}
        {renderMealSection('dinner', t('diary.dinner'))}
        {renderMealSection('snacks', t('diary.snacks'))}
      </div>

      {/* ─── Search Modal ─── */}
      {activeSearchMeal && (
        <FoodSearchModal
          mealType={activeSearchMeal}
          onClose={() => setActiveSearchMeal(null)}
          onAdd={(name, kcal, protein, fat, carbs, grams, fiber) =>
            onAddFood(activeSearchMeal, name, kcal, protein, fat, carbs, grams, fiber)
          }
        />
      )}

      {/* ─── AI Log Modal ─── */}
      {activeAiMeal && (
        <AiLogModal
          mealType={activeAiMeal}
          onClose={() => setActiveAiMeal(null)}
          onAddItem={(name, kcal, protein, fat, carbs, grams, fiber, micros) =>
            onAddFood(activeAiMeal, name, kcal, protein, fat, carbs, grams, fiber, micros)
          }
          onAddItems={onAddFoods ? (its) => onAddFoods(activeAiMeal, its) : undefined}
        />
      )}
    </div>
  );
}
