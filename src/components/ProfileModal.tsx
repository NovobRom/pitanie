'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Settings } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabaseClient';
import { Macros } from '@/lib/nutrition';

interface ProfileModalProps {
  user: any;
  onClose: () => void;
  onSave: (goals: Macros) => void;
}

export function ProfileModal({ user, onClose, onSave }: ProfileModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial values from user metadata or defaults
  const meta = user?.user_metadata || {};
  const [sex, setSex] = useState<'male' | 'female'>(meta.sex || 'male');
  const [weight, setWeight] = useState<number>(meta.weight || 70);
  const [height, setHeight] = useState<number>(meta.height || 175);
  const [age, setAge] = useState<number>(meta.age || 30);
  const [activity, setActivity] = useState<string>(meta.activity || 'light');
  const [goal, setGoal] = useState<string>(meta.goal || 'maintain');
  const [proteinRatio, setProteinRatio] = useState<number>(meta.proteinRatio || 2.0); // g/kg
  const [fatRatio, setFatRatio] = useState<number>(meta.fatRatio || 0.25); // % of calories

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mifflin-St Jeor BMR
    const bmr = 10 * weight + 6.25 * height - 5 * age + (sex === 'male' ? 5 : -161);

    // TDEE Activity Factor
    const activityFactors: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const tdee = bmr * (activityFactors[activity] || 1.2);

    // Goal Calorie Target Adjustment
    const goalFactors: Record<string, number> = {
      lose: 0.8,     // -20% deficit
      maintain: 1.0,  // maintenance
      gain: 1.15,    // +15% surplus
    };
    const targetCalories = Math.max(1200, tdee * (goalFactors[goal] || 1.0));

    // Macro Calculation
    const targetProtein = weight * proteinRatio;
    const targetFat = (targetCalories * fatRatio) / 9;
    const targetCarbs = Math.max(0, (targetCalories - targetProtein * 4 - targetFat * 9) / 4);

    const calculatedGoals: Macros = {
      calories: Math.round(targetCalories),
      protein: Math.round(targetProtein),
      fat: Math.round(targetFat),
      carbs: Math.round(targetCarbs),
    };

    const updatedMetadata = {
      sex,
      weight,
      height,
      age,
      activity,
      goal,
      proteinRatio,
      fatRatio,
      goals: calculatedGoals,
    };

    try {
      const { error: err } = await supabase.auth.updateUser({
        data: updatedMetadata,
      });

      if (err) {
        setError(err.message);
      } else {
        onSave(calculatedGoals);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={handleSave}
        className="relative bg-white rounded-3xl shadow-[var(--shadow-lg)] w-full max-w-md flex flex-col max-h-[90vh] border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="text-[var(--color-primary)]" size={20} />
            <h3 className="font-bold text-[var(--color-text)] text-base">{t('diary.editProfile')}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors p-1 rounded-full hover:bg-gray-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Sex */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-light)] mb-1 uppercase tracking-wider">
              {t('calc.sex')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['male', 'female'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSex(s)}
                  className={`py-2 px-4 rounded-xl text-xs font-semibold border transition-all ${
                    sex === s
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                      : 'bg-white text-[var(--color-text-light)] border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {s === 'male' ? t('calc.sex.male') : t('calc.sex.female')}
                </button>
              ))}
            </div>
          </div>

          {/* Weight & Height & Age */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-light)] mb-1 uppercase tracking-wider">
                {t('calc.weight')}
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                min={30}
                max={300}
                required
                className="w-full text-xs font-semibold px-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-light)] mb-1 uppercase tracking-wider">
                {t('calc.height')}
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min={100}
                max={250}
                required
                className="w-full text-xs font-semibold px-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-light)] mb-1 uppercase tracking-wider">
                {t('calc.age')}
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                min={1}
                max={120}
                required
                className="w-full text-xs font-semibold px-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Activity */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-light)] mb-1 uppercase tracking-wider">
              {t('calc.activity')}
            </label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all shadow-sm"
            >
              <option value="sedentary">{t('calc.activity.sedentary')}</option>
              <option value="light">{t('calc.activity.light')}</option>
              <option value="moderate">{t('calc.activity.moderate')}</option>
              <option value="active">{t('calc.activity.active')}</option>
              <option value="very_active">{t('calc.activity.very_active')}</option>
            </select>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-text-light)] mb-1 uppercase tracking-wider">
              {t('calc.goal')}
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all shadow-sm"
            >
              <option value="lose">{t('calc.goal.lose')}</option>
              <option value="maintain">{t('calc.goal.maintain')}</option>
              <option value="gain">{t('calc.goal.gain')}</option>
            </select>
          </div>

          {/* Ratios (Advanced settings) */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">
                {t('calc.protein.label')} (g/kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="3.5"
                value={proteinRatio}
                onChange={(e) => setProteinRatio(Number(e.target.value))}
                className="w-full text-xs font-mono px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-[var(--color-primary)] shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">
                {t('calc.fat.label')} (ratio)
              </label>
              <select
                value={fatRatio}
                onChange={(e) => setFatRatio(Number(e.target.value))}
                className="w-full text-xs font-mono px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-[var(--color-primary)] shadow-sm"
              >
                <option value="0.20">20%</option>
                <option value="0.25">25%</option>
                <option value="0.30">30%</option>
                <option value="0.35">35%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-[var(--color-text-light)] text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            {t('share.reset')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {t('calc.calc')}
          </button>
        </div>
      </form>
    </div>
  );
}
