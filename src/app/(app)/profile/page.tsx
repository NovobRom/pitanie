'use client';

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { useI18n } from '@/lib/i18n';
import { calcGoals } from '@/lib/nutrition';
import { Loader2, Settings, Check } from 'lucide-react';
import { PersonalInfoForm } from '@/components/profile/PersonalInfoForm';
import { MacroSliders } from '@/components/profile/MacroSliders';
import { WeightChart } from '@/components/profile/WeightChart';

export default function ProfilePage() {
  const { t } = useI18n();
  const { profile: savedProfile, weightHistory, updateProfileAndGoals, logNewWeight, isLoading } = useProfile();

  const [loading, setLoading] = useState(false);
  const [weightLogging, setWeightLogging] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState<string>('70');
  const [height, setHeight] = useState<string>('175');
  const [age, setAge] = useState<string>('30');
  const [activity, setActivity] = useState<string>('light');
  const [goal, setGoal] = useState<string>('maintain');
  const [proteinRatio, setProteinRatio] = useState<number>(2.0);
  const [fatRatio, setFatRatio] = useState<number>(0.25);

  const [logWeightVal, setLogWeightVal] = useState<string>('');

  useEffect(() => {
    if (savedProfile) {
      setSex(savedProfile.sex);
      setWeight(savedProfile.weight);
      setHeight(savedProfile.height);
      setAge(savedProfile.age);
      setActivity(savedProfile.activity);
      setGoal(savedProfile.goal);
      setProteinRatio(savedProfile.proteinPerKg);
      setFatRatio(savedProfile.fatPct / 100);
      setLogWeightVal(savedProfile.weight);
    }
  }, [savedProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const calcParams = {
      weight,
      height,
      age,
      sex,
      bodyFat: '',
      activity: activity as any,
      goal: goal as any,
      proteinPerKg: proteinRatio,
      fatPct: fatRatio * 100,
    };

    const result = calcGoals(calcParams);

    if (!result.ok) {
      setError(result.errors.map((err) => err.message).join(', '));
      setLoading(false);
      return;
    }

    const calculatedGoals = result.data.goals;
    const ok = await updateProfileAndGoals(calcParams, calculatedGoals);
    setLoading(false);

    if (ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError('Failed to save profile settings');
    }
  };

  const handleLogWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(logWeightVal);
    if (isNaN(w) || w <= 0) return;
    setWeightLogging(true);
    
    const today = new Date().toISOString().split('T')[0];
    const ok = await logNewWeight(w, today);
    setWeightLogging(false);
    
    if (ok && savedProfile) {
      // Also update the current profile weight
      const calcParams = {
        ...savedProfile,
        weight: logWeightVal,
      };
      const result = calcGoals(calcParams);
      if (result.ok) {
        await updateProfileAndGoals(calcParams, result.data.goals);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
      {/* Profile Parameters Card */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 max-w-lg w-full mx-auto">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <Settings className="text-[var(--color-primary)]" size={24} />
          <h2 className="text-xl font-bold text-[var(--color-text)]">{t('diary.editProfile')}</h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 text-xs p-3 rounded-lg border border-green-100 flex items-center gap-2">
            <Check size={14} /> Profile saved successfully!
          </div>
        )}

        <div className="space-y-4">
          <PersonalInfoForm
            sex={sex}
            setSex={setSex}
            weight={weight}
            setWeight={setWeight}
            height={height}
            setHeight={setHeight}
            age={age}
            setAge={setAge}
          />

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

          <MacroSliders
            proteinRatio={proteinRatio}
            setProteinRatio={setProteinRatio}
            setFatRatio={setFatRatio}
            fatRatio={fatRatio}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-semibold px-4 py-3 rounded-xl transition-all btn-interactive shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {t('calc.calc')}
          </button>
        </div>
      </form>

      {/* Weight History and Chart Card */}
      <div className="space-y-6 max-w-lg w-full mx-auto">
        {/* Log weight Form */}
        <form onSubmit={handleLogWeightSubmit} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[var(--color-text)]">
            {t('profile.logWeightToday') || 'Log Weight Today'}
          </h3>
          <div className="flex gap-3">
            <input
              type="number"
              step="0.1"
              value={logWeightVal}
              onChange={(e) => setLogWeightVal(e.target.value)}
              placeholder="e.g. 72.5"
              required
              className="flex-1 text-xs font-semibold px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={weightLogging}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold px-5 py-2.5 rounded-xl btn-interactive shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {weightLogging && <Loader2 size={12} className="animate-spin" />}
              {t('profile.logWeight') || 'Save Weight'}
            </button>
          </div>
        </form>

        {/* Chart */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <WeightChart data={weightHistory} />
        </div>
      </div>
    </div>
  );
}
