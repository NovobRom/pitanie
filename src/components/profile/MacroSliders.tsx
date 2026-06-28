import React from 'react';
import { useI18n } from '@/lib/i18n';

interface MacroSlidersProps {
  proteinRatio: number;
  setProteinRatio: (r: number) => void;
  fatRatio: number;
  setFatRatio: (r: number) => void;
}

export function MacroSliders({
  proteinRatio,
  setProteinRatio,
  fatRatio,
  setFatRatio,
}: MacroSlidersProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
      <div>
        <label className="block text-[10px] font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">
          {t('calc.protein.label') || 'Protein'} (g/kg)
        </label>
        <input
          type="number"
          step="0.1"
          min="1.0"
          max="3.5"
          value={proteinRatio}
          onChange={(e) => setProteinRatio(Number(e.target.value))}
          className="w-full text-xs font-mono px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary)] shadow-sm bg-gray-50/30"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">
          {t('calc.fat.label') || 'Fat'} (ratio)
        </label>
        <select
          value={fatRatio}
          onChange={(e) => setFatRatio(Number(e.target.value))}
          className="w-full text-xs font-mono px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary)] shadow-sm bg-gray-50/30"
        >
          <option value="0.20">20%</option>
          <option value="0.25">25%</option>
          <option value="0.30">30%</option>
          <option value="0.35">35%</option>
        </select>
      </div>
    </div>
  );
}
