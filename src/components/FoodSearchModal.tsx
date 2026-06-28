'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Loader2, Search as SearchIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { SearchInput } from './food-search/SearchInput';
import { SearchResultCard } from './food-search/SearchResultCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { RecentFood, Recipe, getRecentFoods, getRecipes } from '@/lib/cloud';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { RecipeBuilderModal } from '@/components/RecipeBuilderModal';

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

  // Debounce query typing to search automatically
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      searchFoods();
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  const searchFoods = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
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
  }, [query, lang]);

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

  const handleAddProduct = (product: SearchResult) => {
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
      <div className="relative bg-white rounded-3xl shadow-[var(--shadow-lg)] w-full max-w-xl flex flex-col max-h-[85vh] border border-gray-100 overflow-hidden animate-[scaleIn_200ms_var(--ease-out)] transform-origin-center">
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
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors p-1.5 rounded-full hover:bg-gray-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Bar */}
        <SearchInput
          query={query}
          setQuery={setQuery}
          onSearch={searchFoods}
          isLoading={isLoading}
          inputRef={inputRef}
        />

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

          {!isLoading && searched && results.length === 0 && (
            <EmptyState
              icon={SearchIcon}
              title={t('diary.searchNoResults') || 'No Results'}
              description={t('diary.searchNoResultsDesc') || 'We couldn\'t find any products matching your query. Try another search term!'}
            />
          )}

          {!isLoading &&
            results.map((product) => (
              <SearchResultCard
                key={product.uid}
                product={product}
                gramInput={gramInputs[product.uid] ?? 100}
                onGramChange={(grams) => setGramInputs((prev) => ({ ...prev, [product.uid]: grams }))}
                onAdd={handleAddProduct}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
