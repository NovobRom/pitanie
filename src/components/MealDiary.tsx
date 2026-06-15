'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight, Copy, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { FoodSearchModal } from '@/components/FoodSearchModal';
import { AiLogModal } from '@/components/AiLogModal';

interface RationItem {
  name: string;
  grams: number;
  kcal: number; // per 100g
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number; // per 100g, optional
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
  onAddFood: (mealType: string, name: string, kcal: number, protein: number, fat: number, carbs: number, grams: number, fiber?: number) => void;
  onRemoveFood: (mealType: string, index: number) => void;
  onCopyYesterday: () => Promise<boolean>;
}

export function MealDiary({ currentDate, onDateChange, meals, onAddFood, onRemoveFood, onCopyYesterday }: MealDiaryProps) {
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

  const renderMealSection = (type: 'breakfast' | 'lunch' | 'dinner' | 'snacks', title: string) => {
    const items = meals[type] || [];
    const totals = calculateMealTotals(items);

    return (
      <div className="bg-white rounded-3xl p-5 shadow-[var(--shadow-sm)] border border-gray-100/50 space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-50">
          <div>
            <h4 className="font-bold text-[var(--color-text)] text-sm">{title}</h4>
            <p className="text-[10px] font-mono text-[var(--color-text-muted)]">
              {Math.round(totals.kcal)} {t('calc.kcal')} · {t('build.protShort')}{Math.round(totals.protein)}г · {t('build.fatShort')}{Math.round(totals.fat)}г · {t('build.carbShort')}{Math.round(totals.carbs)}г{totals.fiber > 0.1 ? ` · ${t('micro.fiber.short')}${Math.round(totals.fiber * 10) / 10}г` : ''}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveAiMeal(type)}
              title={t('ai.button')}
              className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-primary)] hover:text-white bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)] px-2.5 py-1.5 rounded-xl transition-all"
            >
              <Sparkles size={12} />
            </button>
            <button
              onClick={() => setActiveSearchMeal(type)}
              className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-xl transition-all"
            >
              <Plus size={12} />
              {t('diary.add')}
            </button>
          </div>
        </div>

        {/* Added Foods List */}
        {items.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] italic text-center py-4">
            {t('diary.empty')}
          </p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((item, idx) => {
              const factor = item.grams / 100;
              return (
                <li
                  key={`${item.name}-${idx}`}
                  className="flex items-center justify-between text-xs bg-gray-50/50 hover:bg-gray-50 p-2.5 rounded-xl border border-gray-100/30 transition-all"
                >
                  <div className="min-w-0 pr-4">
                    <p className="font-semibold text-[var(--color-text)] truncate">{item.name}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                      {item.grams}g · {Math.round(item.kcal * factor)} {t('calc.kcal')} · {t('build.protShort')}{Math.round(item.protein * factor)}g
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveFood(type, idx)}
                    className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={13} />
                  </button>
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
      
      {/* ─── Weekly Calendar Strip ─── */}
      <div className="bg-white rounded-3xl p-4 shadow-[var(--shadow-sm)] border border-gray-100/50 flex items-center justify-between">
        <button
          onClick={() => shiftWeek('prev')}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1.5 rounded-full hover:bg-gray-50"
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
                    : 'text-[var(--color-text)] hover:bg-gray-50'
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
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1.5 rounded-full hover:bg-gray-50"
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
          className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-light)] hover:text-[var(--color-primary)] bg-white border border-gray-200 hover:border-[var(--color-primary)]/40 px-3 py-1.5 rounded-xl transition-all shadow-sm"
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
          onAddItem={(name, kcal, protein, fat, carbs, grams, fiber) =>
            onAddFood(activeAiMeal, name, kcal, protein, fat, carbs, grams, fiber)
          }
        />
      )}
    </div>
  );
}
