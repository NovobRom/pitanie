'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2, Search as SearchIcon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { SearchInput } from './food-search/SearchInput';
import { SearchResultCard } from './food-search/SearchResultCard';
import { EmptyState } from '@/components/ui/EmptyState';

interface FoodSearchModalProps {
  mealType: string;
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
  nutrition: Nutrition;
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

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading && (
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
