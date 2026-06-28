'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Macros } from '@/types/nutrition';

interface DashboardProps {
  goals: Macros;
  consumed: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  onOpenProfile: () => void;
}

export function Dashboard({ goals, consumed, onOpenProfile }: DashboardProps) {
  const { t } = useI18n();

  const goalCalories = goals.calories || 2000;
  const currentCalories = consumed.kcal || 0;
  const remainingCalories = goalCalories - currentCalories;
  const isOver = remainingCalories < 0;

  const roundVal = (n: number) => Math.round(n);

  return (
    <div className="glass-card rounded-3xl p-6 max-w-3xl mx-auto mb-8 animate-scale-in">
      {/* Dashboard Card Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-gray-100/60">
        <h2 className="text-xs font-bold text-[var(--color-text-light)] uppercase tracking-wider">
          {t('calc.target') || 'Ваша цель на день'}
        </h2>
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200/60 bg-white/60 text-xs font-bold text-[var(--color-primary-dark)] btn-interactive cursor-pointer shadow-sm"
        >
          <Settings size={14} className="text-[var(--color-primary)]" />
          {t('calc.title') || 'Калькулятор калорий'}
        </button>
      </div>

      {/* Calories Overview: Eaten / Remaining */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <span className="block text-4xl font-black text-[var(--color-text)]">
            {roundVal(currentCalories)}
          </span>
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            {t('diary.eaten') || 'съедено'}
          </span>
        </div>
        <div className="text-right">
          <span className="block text-4xl font-black text-[var(--color-primary)]">
            {roundVal(Math.max(0, remainingCalories))}
          </span>
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            {isOver ? (t('diary.over') || 'перебор') : (t('diary.remaining') || 'осталось')}
          </span>
        </div>
      </div>

      {/* Main progress bar for calories */}
      <div className="h-3 bg-gray-100/80 rounded-full overflow-hidden mb-8 relative">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out bg-[var(--color-primary)]"
          style={{
            width: `${Math.min(100, (currentCalories / goalCalories) * 100)}%`,
          }}
        />
      </div>

      {/* Macros Boxes Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Protein */}
        <div className="bg-[#eef6ff] rounded-2xl p-3 border border-blue-100 flex flex-col justify-between h-24">
          <div>
            <span className="text-[9px] font-extrabold text-[#6b9bd1] uppercase tracking-wider block mb-1">
              {t('calc.protein') || 'белки'}
            </span>
            <span className="text-sm font-black text-blue-900">
              {roundVal(consumed.protein)} <span className="text-xs font-semibold text-blue-700/80">/ {roundVal(goals.protein)}г</span>
            </span>
          </div>
          <div className="h-1.5 bg-[#6b9bd1]/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6b9bd1] rounded-full"
              style={{ width: `${Math.min(100, (consumed.protein / (goals.protein || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Fat */}
        <div className="bg-[#fff0f7] rounded-2xl p-3 border border-pink-100 flex flex-col justify-between h-24">
          <div>
            <span className="text-[9px] font-extrabold text-[#e89fc4] uppercase tracking-wider block mb-1">
              {t('calc.fat') || 'жиры'}
            </span>
            <span className="text-sm font-black text-pink-900">
              {roundVal(consumed.fat)} <span className="text-xs font-semibold text-pink-700/80">/ {roundVal(goals.fat)}г</span>
            </span>
          </div>
          <div className="h-1.5 bg-[#e89fc4]/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#e89fc4] rounded-full"
              style={{ width: `${Math.min(100, (consumed.fat / (goals.fat || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-[#f0f9ef] rounded-2xl p-3 border border-green-100 flex flex-col justify-between h-24">
          <div>
            <span className="text-[9px] font-extrabold text-[#7c9885] uppercase tracking-wider block mb-1">
              {t('calc.carbs') || 'углеводы'}
            </span>
            <span className="text-sm font-black text-green-950">
              {roundVal(consumed.carbs)} <span className="text-xs font-semibold text-green-800/80">/ {roundVal(goals.carbs)}г</span>
            </span>
          </div>
          <div className="h-1.5 bg-[#7c9885]/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7c9885] rounded-full"
              style={{ width: `${Math.min(100, (consumed.carbs / (goals.carbs || 1)) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
