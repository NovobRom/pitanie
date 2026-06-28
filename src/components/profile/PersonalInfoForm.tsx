import React from 'react';
import { useI18n } from '@/lib/i18n';

interface PersonalInfoFormProps {
  sex: 'male' | 'female';
  setSex: (sex: 'male' | 'female') => void;
  weight: string;
  setWeight: (w: string) => void;
  height: string;
  setHeight: (h: string) => void;
  age: string;
  setAge: (a: string) => void;
}

export function PersonalInfoForm({
  sex,
  setSex,
  weight,
  setWeight,
  height,
  setHeight,
  age,
  setAge,
}: PersonalInfoFormProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      {/* Sex */}
      <div>
        <label className="block text-xs font-bold text-[var(--color-text-light)] mb-1.5 uppercase tracking-wider">
          {t('calc.sex')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['male', 'female'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSex(s)}
              className={`py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
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

      {/* Weight, Height, Age */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-light)] mb-1 uppercase tracking-wider">
            {t('calc.weight')}
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            className="w-full text-xs font-semibold px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-light)] mb-1 uppercase tracking-wider">
            {t('calc.height')}
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            required
            className="w-full text-xs font-semibold px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[var(--color-text-light)] mb-1 uppercase tracking-wider">
            {t('calc.age')}
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            className="w-full text-xs font-semibold px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
