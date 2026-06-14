'use client';

import React, { useState } from 'react';
import { Search, Loader2, X, Plus, ChefHat } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Macros, FoodProduct, macrosForGrams } from '@/lib/nutrition';

interface SelectedItem {
  id: number;
  product: FoodProduct;
  grams: number;
}

interface Props {
  goals: Macros | null;
}

const DEFAULT_GOALS: Macros = { calories: 2000, protein: 150, fat: 55, carbs: 200 };

// ─── Progress bar ─────────────────────────────────────────────────────────────

interface MacroBarProps {
  label: string;
  unit: string;
  value: number;
  goal: number;
  barColor: string;
  textColor: string;
}

const MacroBar = ({ label, unit, value, goal, barColor, textColor }: MacroBarProps) => {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const over = value > goal;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[var(--color-text-muted)]">{label}</span>
        <span className={`font-bold ${over ? 'text-red-500' : textColor}`}>
          {value} / {goal} {unit}
        </span>
      </div>
      <div className="h-2.5 bg-[var(--color-border)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export const MenuBuilder = ({ goals }: Props) => {
  const { t } = useI18n();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [items, setItems] = useState<SelectedItem[]>([]);
  const [nextId, setNextId] = useState(0);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search-food?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.products ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = (product: FoodProduct) => {
    setItems((prev) => [...prev, { id: nextId, product, grams: 100 }]);
    setNextId((n) => n + 1);
    setResults([]);
    setQuery('');
    setSearched(false);
  };

  const updateGrams = (id: number, raw: string) => {
    const val = parseInt(raw);
    if (isNaN(val)) return;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, grams: Math.max(1, val) } : item)),
    );
  };

  const removeItem = (id: number) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const totals = items.reduce<Macros>(
    (acc, item) => {
      const m = macrosForGrams(item.product, item.grams);
      return {
        calories: acc.calories + m.calories,
        protein: Math.round((acc.protein + m.protein) * 10) / 10,
        fat: Math.round((acc.fat + m.fat) * 10) / 10,
        carbs: Math.round((acc.carbs + m.carbs) * 10) / 10,
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );

  const activeGoals = goals ?? DEFAULT_GOALS;

  return (
    <section className="bg-white rounded-2xl shadow-[var(--shadow-lg)] p-6 mb-10 border border-[var(--color-border)]">
      <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
        <ChefHat size={28} className="text-[var(--color-primary-dark)]" />
        {t('build.title')}
      </h2>

      {/* Search */}
      <div className="mb-4">
        <h3 className="font-semibold text-[var(--color-text)] mb-3 text-sm">{t('build.add')}</h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder={t('build.search.placeholder')}
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setSearched(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <button
            onClick={search}
            disabled={loading || !query.trim()}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            {t('build.find')}
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-center py-6 text-[var(--color-text-muted)] text-sm flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> {t('build.searching')}
        </p>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="text-center py-6 text-[var(--color-text-muted)] text-sm">{t('build.notFound')}</p>
      )}

      {/* Search results */}
      {results.length > 0 && (
        <div className="mb-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {results.map((p, i) => (
            <button
              key={i}
              onClick={() => addProduct(p)}
              className="flex items-center gap-3 bg-[var(--color-bg)] hover:bg-[var(--color-secondary-light)] border border-[var(--color-border)] rounded-xl p-3 text-left transition-all group"
            >
              {p.image_front_small_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image_front_small_url}
                  alt=""
                  className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs text-[var(--color-text)] leading-tight line-clamp-2">
                  {p.product_name}
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                  {Math.round(p.nutriments['energy-kcal_100g'] ?? 0)} {t('calc.kcal')} ·{' '}
                  {Math.round(p.nutriments.proteins_100g ?? 0)}
                  {t('calc.g')} {t('build.protShort')} / 100{t('calc.g')}
                </div>
              </div>
              <Plus
                size={18}
                className="text-[var(--color-primary)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          ))}
        </div>
      )}

      {/* Selected items */}
      {items.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-[var(--color-text)] mb-3 text-sm">{t('build.ration')}</h3>
          <div className="space-y-2">
            {items.map((item) => {
              const m = macrosForGrams(item.product, item.grams);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs text-[var(--color-text)] truncate">
                      {item.product.product_name}
                    </div>
                    <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                      {m.calories} {t('calc.kcal')} · {m.protein}
                      {t('calc.g')} {t('build.protShort')} · {m.fat}
                      {t('calc.g')} {t('build.fatShort')} · {m.carbs}
                      {t('calc.g')} {t('build.carbShort')}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <input
                      type="number"
                      value={item.grams}
                      onChange={(e) => updateGrams(item.id, e.target.value)}
                      min={1}
                      className="w-16 px-2 py-1.5 rounded-lg border border-[var(--color-border)] bg-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                    <span className="text-xs text-[var(--color-text-muted)]">{t('calc.g')}</span>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Totals */}
      {items.length > 0 && (
        <div className="bg-[var(--color-bg)] rounded-xl p-5 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--color-text)] text-sm">{t('build.totals')}</h3>
            {!goals && (
              <span className="text-[var(--color-text-muted)] text-[10px]">
                {t('build.fillForCompare')}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <MacroBar
              label={t('calc.calories')}
              unit={t('calc.kcal')}
              value={totals.calories}
              goal={activeGoals.calories}
              barColor="bg-[var(--color-accent)]"
              textColor="text-[var(--color-accent-dark)]"
            />
            <MacroBar
              label={t('calc.protein')}
              unit={t('calc.g')}
              value={totals.protein}
              goal={activeGoals.protein}
              barColor="bg-[var(--color-roman)]"
              textColor="text-[var(--color-roman)]"
            />
            <MacroBar
              label={t('calc.fat')}
              unit={t('calc.g')}
              value={totals.fat}
              goal={activeGoals.fat}
              barColor="bg-[var(--color-liza)]"
              textColor="text-[var(--color-liza)]"
            />
            <MacroBar
              label={t('calc.carbs')}
              unit={t('calc.g')}
              value={totals.carbs}
              goal={activeGoals.carbs}
              barColor="bg-[var(--color-primary)]"
              textColor="text-[var(--color-primary-dark)]"
            />
          </div>

          {goals && (
            <p className="text-center text-sm mt-4 font-semibold">
              {totals.calories < goals.calories ? (
                <span className="text-[var(--color-primary-dark)]">
                  {t('build.remaining', { n: goals.calories - totals.calories })}
                </span>
              ) : totals.calories === goals.calories ? (
                <span className="text-[var(--color-primary)]">{t('build.done')}</span>
              ) : (
                <span className="text-red-500">
                  {t('build.over', { n: totals.calories - goals.calories })}
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {items.length === 0 && results.length === 0 && !loading && (
        <p className="text-center text-[var(--color-text-muted)] text-sm py-4">{t('build.empty')}</p>
      )}
    </section>
  );
};
