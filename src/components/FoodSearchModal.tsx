'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface FoodSearchModalProps {
  mealType: string; // 'breakfast' | 'lunch' | 'dinner' | 'snacks'
  onClose: () => void;
  onAdd: (name: string, kcal: number, protein: number, fat: number, carbs: number, grams: number) => void;
}

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
  nutrition: Nutrition; // per 100g
}

export function FoodSearchModal({ mealType, onClose, onAdd }: FoodSearchModalProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [gramInputs, setGramInputs] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function searchFoods() {
    const q = query.trim();
    if (!q) return;
    setIsLoading(true);
    setSearched(true);
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
        q
      )}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,nutriments,brands`;
      const res = await fetch(url);
      const data = await res.json();

      const products: SearchResult[] = (data.products ?? [])
        .filter((p: any) => {
          const n = p.nutriments;
          return p.product_name && n && n['energy-kcal_100g'] != null && n['proteins_100g'] != null;
        })
        .map((p: any, idx: number) => {
          const n = p.nutriments;
          return {
            uid: `${idx}-${String(p.product_name).slice(0, 20)}`,
            name: String(p.product_name),
            brand: p.brands ? String(p.brands).split(',')[0].trim() : undefined,
            nutrition: {
              kcal: n['energy-kcal_100g'] ?? 0,
              protein: n['proteins_100g'] ?? 0,
              fat: n['fat_100g'] ?? 0,
              carbs: n['carbohydrates_100g'] ?? 0,
            },
          };
        })
        .slice(0, 12);

      setResults(products);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  function priority(kcalPer100g: number) {
    if (kcalPer100g < 100)
      return { emoji: '🟢', labelKey: 'diary.priorityHigh', bg: '#f0fdf4', border: '#86efac', text: '#16a34a' };
    if (kcalPer100g <= 200)
      return { emoji: '🟡', labelKey: 'diary.priorityMedium', bg: '#fffbeb', border: '#fcd34d', text: '#d97706' };
    return { emoji: '🔴', labelKey: 'diary.priorityLow', bg: '#fff1f2', border: '#fca5a5', text: '#dc2626' };
  }

  const handleAddProduct = (product: SearchResult) => {
    const grams = gramInputs[product.uid] ?? 100;
    onAdd(
      product.name,
      product.nutrition.kcal,
      product.nutrition.protein,
      product.nutrition.fat,
      product.nutrition.carbs,
      grams
    );
    onClose();
  };

  const getMealTitle = () => {
    switch (mealType) {
      case 'breakfast':
        return t('diary.breakfast');
      case 'lunch':
        return t('diary.lunch');
      case 'dinner':
        return t('diary.dinner');
      case 'snacks':
        return t('diary.snacks');
      default:
        return '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-3xl shadow-[var(--shadow-lg)] w-full max-w-xl flex flex-col max-h-[85vh] border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-[var(--color-text)] text-lg">{t('diary.searchTitle')}</h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              {t('diary.add')} → {getMealTitle()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors p-1.5 rounded-full hover:bg-gray-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchFoods()}
              placeholder={t('diary.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all shadow-sm"
            />
          </div>
          <button
            onClick={searchFoods}
            disabled={isLoading || !query.trim()}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all shadow-[var(--shadow-sm)] shrink-0"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : t('build.find')}
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && (
            <div className="text-center py-12 space-y-2">
              <Loader2 size={24} className="animate-spin mx-auto text-[var(--color-primary)]" />
              <p className="text-xs text-[var(--color-text-muted)]">{t('diary.searchState')}</p>
            </div>
          )}

          {!isLoading && searched && results.length === 0 && (
            <p className="text-center py-12 text-sm text-[var(--color-text-muted)]">
              {t('diary.searchNoResults')}
            </p>
          )}

          {!isLoading &&
            results.map((product) => {
              const p = priority(product.nutrition.kcal);
              const grams = gramInputs[product.uid] ?? 100;
              const scaledKcal = Math.round((product.nutrition.kcal * grams) / 100);

              return (
                <div
                  key={product.uid}
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
                      {p.emoji} {t(p.labelKey)}
                    </span>
                  </div>

                  {/* Macros Badges per 100g */}
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono text-[var(--color-text-light)]">
                    <span className="bg-gray-100/80 px-2 py-0.5 rounded-md">
                      {t('build.per100')}:
                    </span>
                    <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md">
                      {Math.round(product.nutrition.kcal)} {t('calc.kcal')}
                    </span>
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                      {t('build.protShort')} {product.nutrition.protein}g
                    </span>
                    <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded-md">
                      {t('build.fatShort')} {product.nutrition.fat}g
                    </span>
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md">
                      {t('build.carbShort')} {product.nutrition.carbs}g
                    </span>
                  </div>

                  {/* Add action */}
                  <div className="flex items-center gap-3 pt-2 border-t border-black/5">
                    <span className="text-[11px] text-[var(--color-text-light)] font-medium">
                      {t('diary.portion')}:
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <input
                        type="number"
                        min={1}
                        max={2000}
                        value={grams}
                        onChange={(e) =>
                          setGramInputs((prev) => ({ ...prev, [product.uid]: Number(e.target.value) }))
                        }
                        className="w-16 text-center text-xs border border-gray-200 rounded-lg py-1 bg-white"
                      />
                      <span className="text-[11px] text-[var(--color-text-muted)]">g</span>
                    </div>
                    
                    <span className="text-xs font-mono font-bold text-[var(--color-primary-dark)] ml-2">
                      {scaledKcal} {t('calc.kcal')}
                    </span>

                    <button
                      onClick={() => handleAddProduct(product)}
                      className="ml-auto bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-[var(--shadow-sm)]"
                    >
                      {t('diary.addFoodAction')}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
