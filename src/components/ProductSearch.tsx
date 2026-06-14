'use client';

import React, { useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';

interface FoodProduct {
  product_name: string;
  nutriments: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    fat_100g?: number;
    carbohydrates_100g?: number;
  };
  image_front_small_url?: string;
}

const fmt = (val?: number) => (val !== undefined ? Math.round(val) : '—');

export const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search-food?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.products ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(query);
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <section className="bg-white rounded-2xl shadow-[var(--shadow-lg)] p-6 mb-10 border border-[var(--color-border)]">
      <h2 className="text-2xl font-bold text-[var(--color-text)] mb-5 flex items-center gap-3">
        <Search size={28} className="text-[var(--color-primary-dark)]" />
        Поиск калорийности
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Например: гречка, курица, творог, buckwheat..."
            className="w-full px-4 py-3 pr-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 text-white px-5 py-3 rounded-xl transition-all shadow-[var(--shadow-md)] font-semibold text-sm flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
          Найти
        </button>
      </form>

      {loading && (
        <div className="text-center py-10 text-[var(--color-text-muted)]">
          <Loader2
            size={32}
            className="animate-spin mx-auto mb-3 text-[var(--color-primary)]"
          />
          <p className="text-sm">Ищем в базе Open Food Facts...</p>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="text-center py-8 text-[var(--color-text-muted)] text-sm">
          Ничего не найдено. Попробуйте запрос на английском или латинице.
        </p>
      )}

      {!loading && results.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((p, i) => (
            <div
              key={i}
              className="bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)] hover:shadow-[var(--shadow-md)] transition-all"
            >
              {p.image_front_small_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image_front_small_url}
                  alt={p.product_name}
                  className="w-16 h-16 object-cover rounded-lg mb-3 mx-auto"
                />
              )}
              <h3 className="font-semibold text-sm text-[var(--color-text)] mb-3 text-center leading-tight line-clamp-2 min-h-[2.5rem]">
                {p.product_name}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[var(--color-breakfast-bg)] rounded-lg p-2 text-center">
                  <div className="font-bold text-[var(--color-accent-dark)] text-base">
                    {fmt(p.nutriments['energy-kcal_100g'])}
                  </div>
                  <div className="text-[var(--color-text-muted)]">ккал</div>
                </div>
                <div className="bg-[var(--color-roman-bg)] rounded-lg p-2 text-center">
                  <div className="font-bold text-[var(--color-roman)] text-base">
                    {fmt(p.nutriments.proteins_100g)}г
                  </div>
                  <div className="text-[var(--color-text-muted)]">белки</div>
                </div>
                <div className="bg-[var(--color-liza-bg)] rounded-lg p-2 text-center">
                  <div className="font-bold text-[var(--color-liza)] text-base">
                    {fmt(p.nutriments.fat_100g)}г
                  </div>
                  <div className="text-[var(--color-text-muted)]">жиры</div>
                </div>
                <div className="bg-[var(--color-lunch-bg)] rounded-lg p-2 text-center">
                  <div className="font-bold text-[var(--color-primary-dark)] text-base">
                    {fmt(p.nutriments.carbohydrates_100g)}г
                  </div>
                  <div className="text-[var(--color-text-muted)]">углеводы</div>
                </div>
              </div>
              <p className="text-[9px] text-[var(--color-text-muted)] text-center mt-2">
                на 100 г продукта
              </p>
            </div>
          ))}
        </div>
      )}

      {!searched && (
        <p className="text-center text-[var(--color-text-muted)] text-sm py-2">
          Данные из базы{' '}
          <span className="font-semibold text-[var(--color-primary-dark)]">
            Open Food Facts
          </span>{' '}
          — более 3 млн продуктов
        </p>
      )}
    </section>
  );
};
