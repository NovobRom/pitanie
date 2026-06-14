'use client';

import React, { useState } from 'react';
import { Calculator, Activity as ActivityIcon, Info } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import {
  calcGoals,
  CalcParams,
  CalcResult,
  Sex,
  Activity,
  Goal,
} from '@/lib/nutrition';

interface Props {
  onResult: (result: CalcResult | null) => void;
}

const ACTIVITIES: Activity[] = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
const GOALS: Goal[] = ['lose', 'maintain', 'gain'];

export const CalorieCalculator = ({ onResult }: Props) => {
  const { t } = useI18n();

  const [params, setParams] = useState<CalcParams>({
    weight: '',
    height: '',
    age: '',
    sex: 'male',
    bodyFat: '',
    activity: 'light',
    goal: 'maintain',
    proteinPerKg: 2.0,
    fatPct: 25,
  });

  const [result, setResult] = useState<CalcResult | null>(null);

  // Recompute and bubble up. Used both by the button and live slider/select changes.
  const recompute = (next: CalcParams) => {
    const r = calcGoals(next);
    setResult(r);
    onResult(r);
  };

  const update = (patch: Partial<CalcParams>) => {
    const next = { ...params, ...patch };
    setParams(next);
    // Live-update only once an initial result exists (avoids premature errors).
    if (result) recompute(next);
  };

  return (
    <section className="bg-white rounded-2xl shadow-[var(--shadow-lg)] p-6 mb-10 border border-[var(--color-border)]">
      <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1 flex items-center gap-3">
        <Calculator size={28} className="text-[var(--color-primary-dark)]" />
        {t('calc.title')}
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-5 ml-10">{t('calc.subtitle')}</p>

      {/* Numeric + select inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {(
          [
            { key: 'weight', label: t('calc.weight'), placeholder: '79' },
            { key: 'height', label: t('calc.height'), placeholder: '180' },
            { key: 'age', label: t('calc.age'), placeholder: '30' },
          ] as const
        ).map(({ key, label, placeholder }) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
            <input
              type="number"
              value={params[key]}
              onChange={(e) => update({ [key]: e.target.value } as Partial<CalcParams>)}
              placeholder={placeholder}
              className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </label>
        ))}

        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-text-muted)]">{t('calc.sex')}</span>
          <select
            value={params.sex}
            onChange={(e) => update({ sex: e.target.value as Sex })}
            className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <option value="male">{t('calc.sex.male')}</option>
            <option value="female">{t('calc.sex.female')}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-text-muted)]">{t('calc.bodyfat')}</span>
          <input
            type="number"
            value={params.bodyFat}
            onChange={(e) => update({ bodyFat: e.target.value })}
            placeholder="—"
            className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </label>

        <label className="flex flex-col gap-1 col-span-2 sm:col-span-3">
          <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
            <ActivityIcon size={13} /> {t('calc.activity')}
          </span>
          <select
            value={params.activity}
            onChange={(e) => update({ activity: e.target.value as Activity })}
            className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            {ACTIVITIES.map((a) => (
              <option key={a} value={a}>
                {t(`calc.activity.${a}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Goal segmented control */}
      <div className="mb-4">
        <span className="text-xs text-[var(--color-text-muted)] mb-1.5 block">{t('calc.goal')}</span>
        <div className="grid grid-cols-3 gap-2">
          {GOALS.map((g) => (
            <button
              key={g}
              onClick={() => update({ goal: g })}
              className={`px-2 py-2.5 rounded-lg text-xs font-semibold transition-all border ${
                params.goal === g
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--color-primary-light)]'
              }`}
            >
              {t(`calc.goal.${g}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Macro sliders (protein-first approach) */}
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--color-text-muted)]">{t('calc.protein.label')}</span>
            <span className="font-bold text-[var(--color-roman)]">
              {params.proteinPerKg.toFixed(1)} {t('calc.g')}/kg
            </span>
          </div>
          <input
            type="range"
            min={1.2}
            max={2.6}
            step={0.1}
            value={params.proteinPerKg}
            onChange={(e) => update({ proteinPerKg: parseFloat(e.target.value) })}
            className="w-full accent-[var(--color-roman)]"
          />
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{t('calc.protein.hint')}</p>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--color-text-muted)]">{t('calc.fat.label')}</span>
            <span className="font-bold text-[var(--color-liza)]">
              {params.fatPct}% {t('calc.fat.hint')}
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={40}
            step={1}
            value={params.fatPct}
            onChange={(e) => update({ fatPct: parseInt(e.target.value) })}
            className="w-full accent-[var(--color-liza)]"
          />
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            {params.bodyFat ? t('calc.bodyfat.hint') : ' '}
          </p>
        </div>
      </div>

      <button
        onClick={() => recompute(params)}
        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[var(--shadow-md)]"
      >
        {t('calc.calc')}
      </button>

      {/* Result */}
      {result ? (
        <div className="mt-5">
          {/* BMR / TDEE breakdown */}
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            <div className="bg-[var(--color-bg)] rounded-lg px-3 py-2 border border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">{t('calc.bmr')}: </span>
              <span className="font-bold text-[var(--color-text)]">
                {result.bmr} {t('calc.kcal')}
              </span>
            </div>
            <div className="bg-[var(--color-bg)] rounded-lg px-3 py-2 border border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">{t('calc.tdee')}: </span>
              <span className="font-bold text-[var(--color-text)]">
                {result.tdee} {t('calc.kcal')}
              </span>
            </div>
            <div className="bg-[var(--color-bg)] rounded-lg px-3 py-2 border border-[var(--color-border)] flex items-center gap-1">
              <Info size={12} className="text-[var(--color-text-muted)]" />
              <span className="text-[var(--color-text-muted)]">{t('calc.formula')}: </span>
              <span className="font-semibold text-[var(--color-primary-dark)]">{result.formula}</span>
            </div>
          </div>

          {/* Target macros */}
          <p className="text-xs font-semibold text-[var(--color-text)] mb-2">{t('calc.target')}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: t('calc.calories'),
                value: result.goals.calories,
                unit: t('calc.kcal'),
                bg: 'bg-[var(--color-breakfast-bg)]',
                color: 'text-[var(--color-accent-dark)]',
              },
              {
                label: t('calc.protein'),
                value: result.goals.protein,
                unit: t('calc.g'),
                bg: 'bg-[var(--color-roman-bg)]',
                color: 'text-[var(--color-roman)]',
              },
              {
                label: t('calc.fat'),
                value: result.goals.fat,
                unit: t('calc.g'),
                bg: 'bg-[var(--color-liza-bg)]',
                color: 'text-[var(--color-liza)]',
              },
              {
                label: t('calc.carbs'),
                value: result.goals.carbs,
                unit: t('calc.g'),
                bg: 'bg-[var(--color-lunch-bg)]',
                color: 'text-[var(--color-primary-dark)]',
              },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
                <div className={`text-2xl font-extrabold ${item.color}`}>
                  {item.value}
                  <span className="text-xs font-normal ml-0.5">{item.unit}</span>
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-[var(--color-text-muted)] mt-3">{t('calc.fillData')}</p>
      )}
    </section>
  );
};
