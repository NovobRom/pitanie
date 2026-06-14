'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Macros } from '@/lib/nutrition';

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

  // SVG Circumference calculation
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius; // ~377
  const pct = goalCalories > 0 ? Math.min(100, (currentCalories / goalCalories) * 100) : 0;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const roundVal = (n: number) => Math.round(n);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[var(--shadow-md)] border border-gray-100/50 max-w-3xl mx-auto mb-8">
      {/* Dashboard Card Header */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100/60">
        <h2 className="text-xs font-bold text-[var(--color-text-light)] uppercase tracking-wider min-w-0">
          {t('calc.target')}
        </h2>
        <button
          type="button"
          onClick={onOpenProfile}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-[var(--color-primary-dark)] transition-all cursor-pointer shadow-sm hover:shadow whitespace-nowrap"
        >
          <Settings size={14} className="text-[var(--color-primary)]" />
          {t('calc.title')}
        </button>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        
        {/* Left: Circular Calorie SVG Chart */}
        <div className="relative w-44 h-44 flex items-center justify-center mx-auto md:mx-0 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 176 176">
            {/* Background Circle */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke="#f3f4f6"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Active Circle with transition */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              stroke={isOver ? '#fca5a5' : 'var(--color-primary)'}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          
          {/* Inner details */}
          <div className="absolute flex flex-col items-center text-center">
            <span className="text-3xl font-extrabold text-[var(--color-text)]">
              {roundVal(currentCalories)}
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              / {roundVal(goalCalories)} {t('calc.kcal')}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isOver ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
              }`}
            >
              {isOver ? t('diary.over') : t('diary.remaining')}: {roundVal(Math.abs(remainingCalories))}
            </span>
          </div>
        </div>

        {/* Right: Macro Progress Bars */}
        <div className="w-full min-w-0 space-y-4 md:flex-1">
          {/* Protein */}
          <MacroBar
            label={t('calc.protein')}
            current={consumed.protein}
            goal={goals.protein}
            color="var(--color-roman)"
            bgColor="var(--color-roman-bg)"
            unit={t('calc.g')}
          />

          {/* Fat */}
          <MacroBar
            label={t('calc.fat')}
            current={consumed.fat}
            goal={goals.fat}
            color="var(--color-liza)"
            bgColor="var(--color-liza-bg)"
            unit={t('calc.g')}
          />

          {/* Carbs */}
          <MacroBar
            label={t('calc.carbs')}
            current={consumed.carbs}
            goal={goals.carbs}
            color="var(--color-primary-light)"
            bgColor="#f0fdf4"
            unit={t('calc.g')}
          />
        </div>
      </div>
    </div>
  );
}

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  bgColor: string;
  unit: string;
}

function MacroBar({ label, current, goal, color, bgColor, unit }: MacroBarProps) {
  const roundedCurrent = Math.round(current * 10) / 10;
  const roundedGoal = Math.round(goal * 10) / 10;
  const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
  const isOver = current > goal;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs font-semibold mb-1">
        <span className="text-[var(--color-text)] min-w-0 truncate">{label}</span>
        <span className="text-[var(--color-text-light)] font-mono shrink-0 whitespace-nowrap">
          {roundedCurrent}{unit} / {roundedGoal}{unit}
          {isOver && <span className="text-red-500 ml-1">⚠️</span>}
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: isOver ? '#fca5a5' : color,
          }}
        />
      </div>
    </div>
  );
}
