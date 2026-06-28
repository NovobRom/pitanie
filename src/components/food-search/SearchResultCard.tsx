import React from 'react';
import { useI18n } from '@/lib/i18n';

interface Nutrition {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface SearchResult {
  uid: string;
  name: string;
  brand?: string;
  nutrition: Nutrition;
}

interface SearchResultCardProps {
  product: SearchResult;
  gramInput: number;
  onGramChange: (grams: number) => void;
  onAdd: (product: SearchResult) => void;
}

export function SearchResultCard({
  product,
  gramInput,
  onGramChange,
  onAdd,
}: SearchResultCardProps) {
  const { t } = useI18n();

  const priority = (kcalPer100g: number) => {
    if (kcalPer100g < 100)
      return { emoji: '🟢', labelKey: 'diary.priorityHigh', bg: '#f0fdf4', border: '#86efac', text: '#16a34a' };
    if (kcalPer100g <= 200)
      return { emoji: '🟡', labelKey: 'diary.priorityMedium', bg: '#fffbeb', border: '#fcd34d', text: '#d97706' };
    return { emoji: '🔴', labelKey: 'diary.priorityLow', bg: '#fff1f2', border: '#fca5a5', text: '#dc2626' };
  };

  const p = priority(product.nutrition.kcal);
  const scaledKcal = Math.round((product.nutrition.kcal * gramInput) / 100);

  return (
    <div
      style={{ backgroundColor: p.bg, borderColor: p.border }}
      className="rounded-2xl border p-4 flex flex-col gap-3 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h4 className="font-bold text-sm text-[var(--color-text)] leading-snug truncate">
            {product.name}
          </h4>
          {product.brand && (
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">
              {product.brand}
            </p>
          )}
        </div>
        <span
          style={{ color: p.text, backgroundColor: '#ffffffcc' }}
          className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
        >
          {p.emoji} {t(p.labelKey) || 'Priority'}
        </span>
      </div>

      {/* Macros Badges per 100g */}
      <div className="flex flex-wrap gap-2 text-[10px] font-mono text-[var(--color-text-light)]">
        <span className="bg-gray-100/80 px-2 py-0.5 rounded-md">
          {t('build.per100') || 'per 100g'}:
        </span>
        <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md">
          {Math.round(product.nutrition.kcal)} {t('calc.kcal') || 'kcal'}
        </span>
        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
          {t('build.protShort') || 'P'} {product.nutrition.protein}g
        </span>
        <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded-md">
          {t('build.fatShort') || 'F'} {product.nutrition.fat}g
        </span>
        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md">
          {t('build.carbShort') || 'C'} {product.nutrition.carbs}g
        </span>
      </div>

      {/* Add action */}
      <div className="flex items-center gap-3 pt-2 border-t border-black/5">
        <span className="text-[11px] text-[var(--color-text-light)] font-medium">
          {t('diary.portion') || 'Portion'}:
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <input
            type="number"
            min={1}
            max={2000}
            value={gramInput}
            onChange={(e) => onGramChange(Number(e.target.value))}
            className="w-16 text-center text-xs border border-gray-200 rounded-lg py-1 bg-white"
          />
          <span className="text-[11px] text-[var(--color-text-muted)]">g</span>
        </div>
        
        <span className="text-xs font-mono font-bold text-[var(--color-primary-dark)] ml-2">
          {scaledKcal} {t('calc.kcal') || 'kcal'}
        </span>

        <button
          onClick={() => onAdd(product)}
          className="ml-auto bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-[var(--shadow-sm)] cursor-pointer"
        >
          {t('diary.addFoodAction') || 'Add'}
        </button>
      </div>
    </div>
  );
}
