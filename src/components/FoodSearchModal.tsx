'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Search, Loader2, ScanLine, Clock, ChefHat, Trash2, BadgeCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { getRecentFoods, RecentFood, getRecipes, Recipe, deleteRecipe } from '@/lib/cloud';
import { BarcodeScanner } from './BarcodeScanner';
import { RecipeBuilderModal } from './RecipeBuilderModal';

interface FoodSearchModalProps {
  mealType: string;
  onClose: () => void;
  onAdd: (name: string, kcal: number, protein: number, fat: number, carbs: number, grams: number, fiber?: number) => void;
}

interface Nutrition {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
}

interface SearchResult {
  uid: string;
  name: string;
  brand?: string;
  verified?: boolean;
  nutrition: Nutrition;
}

export function FoodSearchModal({ mealType, onClose, onAdd }: FoodSearchModalProps) {
  const { t, lang } = useI18n();
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [gramInputs, setGramInputs] = useState<Record<string, number>>({});
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showRecipeBuilder, setShowRecipeBuilder] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadRecipes = useCallback(async () => {
    const r = await getRecipes();
    setRecipes(r);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
    getRecentFoods(8).then((foods) => {
      setRecentFoods(foods);
      setRecentLoading(false);
    });
    loadRecipes();
  }, [loadRecipes]);

  const searchFoods = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ q: q.trim(), lang });
      const res = await fetch(`/api/search-food?${params}`);
      const data = await res.json();

      const products: SearchResult[] = (data.products ?? []).map((p: any, idx: number) => ({
        uid: `${idx}-${String(p.name).slice(0, 20)}`,
        name: String(p.name),
        brand: p.brand,
        verified: p.verified === true,
        nutrition: p.nutrition,
      }));

      setResults(products);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  const handleBarcodeDetected = useCallback(async (barcode: string) => {
    setShowScanner(false);
    setBarcodeLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/barcode-food?code=${encodeURIComponent(barcode)}`);
      const data = await res.json();
      if (data.product) {
        setResults([{
          uid: `barcode-${barcode}`,
          name: data.product.name,
          brand: data.product.brand,
          nutrition: data.product.nutrition,
        }]);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setBarcodeLoading(false);
    }
  }, []);

  function priority(kcalPer100g: number) {
    if (kcalPer100g < 100)
      return { emoji: '🟢', labelKey: 'diary.priorityHigh', bg: '#f0fdf4', border: '#86efac', text: '#16a34a' };
    if (kcalPer100g <= 200)
      return { emoji: '🟡', labelKey: 'diary.priorityMedium', bg: '#fffbeb', border: '#fcd34d', text: '#d97706' };
    return { emoji: '🔴', labelKey: 'diary.priorityLow', bg: '#fff1f2', border: '#fca5a5', text: '#dc2626' };
  }

  const handleAddRecent = (food: RecentFood) => {
    onAdd(food.name, food.kcal, food.protein, food.fat, food.carbs, food.lastGrams);
    onClose();
  };

  const handleAddRecipe = (recipe: Recipe, grams: number) => {
    onAdd(recipe.name, recipe.kcal, recipe.protein, recipe.fat, recipe.carbs, grams, recipe.fiber || undefined);
    onClose();
  };

  const handleDeleteRecipe = async (id: string) => {
    await deleteRecipe(id);
    loadRecipes();
  };

  const handleAddSearchResult = (product: SearchResult) => {
    const grams = gramInputs[product.uid] ?? 100;
    onAdd(product.name, product.nutrition.kcal, product.nutrition.protein, product.nutrition.fat, product.nutrition.carbs, grams, product.nutrition.fiber);
    onClose();
  };

  const getMealTitle = () => {
    const keys: Record<string, string> = {
      breakfast: 'diary.breakfast',
      lunch: 'diary.lunch',
      dinner: 'diary.dinner',
      snacks: 'diary.snacks',
    };
    return t(keys[mealType] ?? 'diary.add');
  };

  const showRecent = !searched && !isLoading;

  if (showScanner) {
    return <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setShowScanner(false)} />;
  }

  if (showRecipeBuilder) {
    return <RecipeBuilderModal onClose={() => setShowRecipeBuilder(false)} onSaved={loadRecipes} />;
  }

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
              onKeyDown={(e) => e.key === 'Enter' && searchFoods(query)}
              placeholder={t('diary.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[var(--color-primary)] transition-all shadow-sm"
            />
          </div>
          {/* Barcode button */}
          <button
            onClick={() => setShowScanner(true)}
            title={t('barcode.scan')}
            className="shrink-0 flex items-center justify-center w-11 h-11 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm text-[var(--color-primary)]"
          >
            <ScanLine size={20} />
          </button>
          <button
            onClick={() => searchFoods(query)}
            disabled={isLoading || !query.trim()}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all shadow-[var(--shadow-sm)] shrink-0"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : t('build.find')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Barcode lookup loading */}
          {barcodeLoading && (
            <div className="text-center py-12 space-y-2">
              <Loader2 size={24} className="animate-spin mx-auto text-[var(--color-primary)]" />
              <p className="text-xs text-[var(--color-text-muted)]">{t('barcode.scanning')}…</p>
            </div>
          )}

          {/* Search loading */}
          {isLoading && !barcodeLoading && (
            <div className="text-center py-12 space-y-2">
              <Loader2 size={24} className="animate-spin mx-auto text-[var(--color-primary)]" />
              <p className="text-xs text-[var(--color-text-muted)]">{t('diary.searchState')}</p>
            </div>
          )}

          {/* Recipes (shown before first search) */}
          {showRecent && !barcodeLoading && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <ChefHat size={13} className="text-[var(--color-text-muted)]" />
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{t('recipe.title')}</p>
                </div>
                <button
                  onClick={() => setShowRecipeBuilder(true)}
                  className="text-[10px] font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] flex items-center gap-1"
                >
                  + {t('recipe.new')}
                </button>
              </div>
              {recipes.length === 0 ? (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-2">{t('recipe.empty')}</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {recipes.map((recipe) => {
                    const scaledKcal = Math.round((recipe.kcal * recipe.serving_g) / 100);
                    return (
                      <div key={recipe.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/15">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[var(--color-text)] truncate">{recipe.name}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5">
                            {recipe.serving_g}г · {scaledKcal} {t('calc.kcal')} · {t('build.protShort')} {Math.round(recipe.protein * recipe.serving_g / 100)}г
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddRecipe(recipe, recipe.serving_g)}
                          className="shrink-0 bg-[var(--color-primary)]/15 hover:bg-[var(--color-primary)]/25 text-[var(--color-primary-dark)] text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all"
                        >
                          {t('diary.addFoodAction')}
                        </button>
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="shrink-0 text-[var(--color-text-muted)] hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Recent foods (shown before first search) */}
          {showRecent && !barcodeLoading && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Clock size={13} className="text-[var(--color-text-muted)]" />
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {t('recent.title')}
                </p>
              </div>
              {recentLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={16} className="animate-spin text-[var(--color-primary)]" />
                </div>
              ) : recentFoods.length === 0 ? (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-4">{t('recent.empty')}</p>
              ) : (
                <div className="space-y-2">
                  {recentFoods.map((food, i) => {
                    const scaledKcal = Math.round((food.kcal * food.lastGrams) / 100);
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 hover:bg-gray-100/70 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[var(--color-text)] truncate">{food.name}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)] font-mono mt-0.5">
                            {food.lastGrams}г · {scaledKcal} {t('calc.kcal')} · {t('build.protShort')} {Math.round(food.protein * food.lastGrams / 100)}г
                          </p>
                        </div>
                        <button
                          onClick={() => handleAddRecent(food)}
                          className="shrink-0 bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary-dark)] text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all"
                        >
                          {t('diary.addFoodAction')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* No results */}
          {!isLoading && !barcodeLoading && searched && results.length === 0 && (
            <p className="text-center py-12 text-sm text-[var(--color-text-muted)]">
              {t('diary.searchNoResults')}
            </p>
          )}

          {/* Search results */}
          {!isLoading && !barcodeLoading && results.map((product) => {
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
                    <h4 className="font-bold text-sm text-[var(--color-text)] leading-snug truncate flex items-center gap-1">
                      {product.verified && (
                        <BadgeCheck size={14} className="text-[var(--color-carbs)] shrink-0" />
                      )}
                      <span className="truncate">{product.name}</span>
                    </h4>
                    {product.brand ? (
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">
                        {product.brand}
                      </p>
                    ) : product.verified ? (
                      <p className="text-[10px] text-[var(--color-carbs)] mt-0.5 truncate font-semibold">
                        {t('search.verified')}
                      </p>
                    ) : null}
                  </div>
                  <span
                    style={{ color: p.text, backgroundColor: '#ffffffcc' }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  >
                    {p.emoji} {t(p.labelKey)}
                  </span>
                </div>

                {/* Macros per 100g */}
                <div className="flex flex-wrap gap-2 text-[10px] font-mono text-[var(--color-text-light)]">
                  <span className="bg-gray-100/80 px-2 py-0.5 rounded-md">{t('build.per100')}:</span>
                  <span className="px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: 'var(--color-fat-bg)', color: 'var(--color-fat)' }}>
                    {Math.round(product.nutrition.kcal)} {t('calc.kcal')}
                  </span>
                  <span className="px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: 'var(--color-protein-bg)', color: 'var(--color-protein)' }}>
                    {t('build.protShort')} {product.nutrition.protein}g
                  </span>
                  <span className="px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: 'var(--color-fat-bg)', color: 'var(--color-fat)' }}>
                    {t('build.fatShort')} {product.nutrition.fat}g
                  </span>
                  <span className="px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: 'var(--color-carbs-bg)', color: 'var(--color-carbs)' }}>
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
                    onClick={() => handleAddSearchResult(product)}
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
