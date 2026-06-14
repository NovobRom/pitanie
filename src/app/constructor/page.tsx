'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface AddedFood {
  id: string;
  name: string;
  grams: number;
  nutrition: Nutrition; // per 100g
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Roman's locked daily baseline (утро + кофе + протеин)
const FIXED: { label: string; detail: string; nutrition: Nutrition }[] = [
  {
    label: 'Завтрак',
    detail: 'Гречка 80г + 2 яйца + масло 10г',
    nutrition: { kcal: 474, protein: 23, fat: 20, carbs: 50 },
  },
  {
    label: 'Кофе × 2',
    detail: 'Молоко 1.5% 250г суммарно',
    nutrition: { kcal: 110, protein: 7, fat: 4, carbs: 12 },
  },
  {
    label: 'Протеин вечером',
    detail: '1 скуп (31г) + 250г молока',
    nutrition: { kcal: 230, protein: 34, fat: 4, carbs: 12 },
  },
];

const FIXED_TOTAL: Nutrition = FIXED.reduce(
  (acc, f) => ({
    kcal: acc.kcal + f.nutrition.kcal,
    protein: acc.protein + f.nutrition.protein,
    fat: acc.fat + f.nutrition.fat,
    carbs: acc.carbs + f.nutrition.carbs,
  }),
  { kcal: 0, protein: 0, fat: 0, carbs: 0 }
);

const GOALS: Nutrition = { kcal: 1720, protein: 165, fat: 55, carbs: 150 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scale(n: Nutrition, grams: number): Nutrition {
  const f = grams / 100;
  return {
    kcal: n.kcal * f,
    protein: n.protein * f,
    fat: n.fat * f,
    carbs: n.carbs * f,
  };
}

function add(a: Nutrition, b: Nutrition): Nutrition {
  return {
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    fat: a.fat + b.fat,
    carbs: a.carbs + b.carbs,
  };
}

function round(n: number, d = 1) {
  return +n.toFixed(d);
}

function priority(kcalPer100g: number) {
  if (kcalPer100g < 100)
    return { emoji: '🟢', label: 'Высокий', bg: '#f0fdf4', border: '#86efac', text: '#16a34a' };
  if (kcalPer100g <= 200)
    return { emoji: '🟡', label: 'Средний', bg: '#fffbeb', border: '#fcd34d', text: '#d97706' };
  return { emoji: '🔴', label: 'Низкий', bg: '#fff1f2', border: '#fca5a5', text: '#dc2626' };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({
  label,
  current,
  goal,
  unit,
  color,
}: {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}) {
  const pct = Math.min(100, (current / goal) * 100);
  const over = current > goal;
  const left = goal - current;

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold">{label}</span>
        <span style={{ color: over ? '#dc2626' : '#6b6b6b' }} className="font-mono text-xs">
          {round(current, 0)}
          {unit} / {goal}
          {unit}
          {over ? ' ⚠️ перебор' : ` · осталось ${round(left, 0)}${unit}`}
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: over ? '#dc2626' : color }}
        />
      </div>
    </div>
  );
}

function NutritionBadges({ n, grams }: { n: Nutrition; grams?: number }) {
  const display = grams != null ? scale(n, grams) : n;
  return (
    <div className="flex flex-wrap gap-2 text-xs font-mono">
      <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
        {round(display.kcal, 0)} ккал
      </span>
      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
        Б {round(display.protein, 1)}г
      </span>
      <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full">
        Ж {round(display.fat, 1)}г
      </span>
      <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
        У {round(display.carbs, 1)}г
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ConstructorPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [gramInputs, setGramInputs] = useState<Record<string, number>>({});
  const [addedFoods, setAddedFoods] = useState<AddedFood[]>([]);
  const [showFixed, setShowFixed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Search ──
  async function searchFoods() {
    const q = query.trim();
    if (!q) return;
    setIsLoading(true);
    setSearched(true);
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,nutriments,brands`;
      const res = await fetch(url);
      const data = await res.json();

      const products: SearchResult[] = (data.products ?? [])
        .filter((p: Record<string, unknown>) => {
          const n = p.nutriments as Record<string, number> | undefined;
          return p.product_name && n && n['energy-kcal_100g'] != null && n['proteins_100g'] != null;
        })
        .map((p: Record<string, unknown>, idx: number) => {
          const n = p.nutriments as Record<string, number>;
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
    }
    setIsLoading(false);
  }

  // ── Add food ──
  function addFood(product: SearchResult) {
    const grams = gramInputs[product.uid] ?? 100;
    setAddedFoods((prev) => [
      ...prev,
      { id: `${Date.now()}-${product.uid}`, name: product.name, grams, nutrition: product.nutrition },
    ]);
  }

  function removeFood(id: string) {
    setAddedFoods((prev) => prev.filter((f) => f.id !== id));
  }

  function updateGrams(id: string, grams: number) {
    setAddedFoods((prev) => prev.map((f) => (f.id === id ? { ...f, grams } : f)));
  }

  // ── Totals ──
  const addedTotal = addedFoods.reduce(
    (acc, f) => add(acc, scale(f.nutrition, f.grams)),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 }
  );
  const total = add(FIXED_TOTAL, addedTotal);
  const remaining: Nutrition = {
    kcal: GOALS.kcal - total.kcal,
    protein: GOALS.protein - total.protein,
    fat: GOALS.fat - total.fat,
    carbs: GOALS.carbs - total.carbs,
  };

  return (
    <main
      className="min-h-screen p-4 md:p-6"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Nav */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-white transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ← План
          </Link>
          <h1 className="text-xl font-bold">🍽️ Конструктор питания</h1>
        </div>

        {/* ─── Progress ─────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: 'var(--color-roman)' }}>
              👨 Роман — день
            </h2>
            <div className="text-right">
              <span
                className="text-2xl font-extrabold"
                style={{ color: total.kcal > GOALS.kcal ? '#dc2626' : 'var(--color-roman)' }}
              >
                {round(total.kcal, 0)}
              </span>
              <span className="text-sm ml-1" style={{ color: 'var(--color-text-muted)' }}>
                / {GOALS.kcal} ккал
              </span>
            </div>
          </div>
          <ProgressBar label="Калории" current={total.kcal} goal={GOALS.kcal} unit=" ккал" color="#f39c6b" />
          <ProgressBar label="Белок" current={total.protein} goal={GOALS.protein} unit="г" color="#6b9bd1" />
          <ProgressBar label="Жиры" current={total.fat} goal={GOALS.fat} unit="г" color="#e89fc4" />
          <ProgressBar label="Углеводы" current={total.carbs} goal={GOALS.carbs} unit="г" color="#a8d5a3" />

          {/* Remaining summary */}
          <div className="mt-4 pt-3 border-t border-gray-100 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span className="font-semibold">Осталось добрать: </span>
            <span className={remaining.kcal < 0 ? 'text-red-500' : ''}>
              {round(remaining.kcal, 0)} ккал
            </span>
            {' · '}
            <span className={remaining.protein < 0 ? 'text-red-500' : ''}>
              Б {round(remaining.protein, 1)}г
            </span>
            {' · '}
            <span className={remaining.fat < 0 ? 'text-red-500' : ''}>
              Ж {round(remaining.fat, 1)}г
            </span>
            {' · '}
            <span className={remaining.carbs < 0 ? 'text-red-500' : ''}>
              У {round(remaining.carbs, 1)}г
            </span>
          </div>
        </section>

        {/* ─── Fixed meals ──────────────────────────────────────────────── */}
        <section
          className="rounded-2xl p-4 mb-4 border"
          style={{ background: 'var(--color-breakfast-bg)', borderColor: 'var(--color-breakfast)' }}
        >
          <button
            onClick={() => setShowFixed(!showFixed)}
            className="w-full flex items-center justify-between text-sm font-semibold"
            style={{ color: 'var(--color-accent-dark)' }}
          >
            <span>🔒 Фиксированные приёмы ({round(FIXED_TOTAL.kcal, 0)} ккал · Б {FIXED_TOTAL.protein}г)</span>
            <span>{showFixed ? '▲' : '▼'}</span>
          </button>

          {showFixed && (
            <div className="mt-3 space-y-3">
              {FIXED.map((f) => (
                <div key={f.label} className="bg-white rounded-xl p-3">
                  <div className="font-medium text-sm mb-1">{f.label}</div>
                  <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    {f.detail}
                  </div>
                  <NutritionBadges n={f.nutrition} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── Added foods ──────────────────────────────────────────────── */}
        {addedFoods.length > 0 && (
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
            <h2 className="font-bold text-sm mb-3">🍴 Добавлено в день</h2>
            <ul className="space-y-2">
              {addedFoods.map((food) => {
                const n = scale(food.nutrition, food.grams);
                return (
                  <li
                    key={food.id}
                    className="flex items-center gap-2 text-sm rounded-xl p-2.5"
                    style={{ background: 'var(--color-secondary-light)' }}
                  >
                    <span className="flex-1 min-w-0 font-medium truncate">{food.name}</span>
                    <input
                      type="number"
                      min={1}
                      max={2000}
                      value={food.grams}
                      onChange={(e) => updateGrams(food.id, Number(e.target.value))}
                      className="w-14 text-center text-xs border border-gray-200 rounded-lg py-1 bg-white"
                    />
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>г</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--color-roman)' }}>
                      {round(n.kcal, 0)} · Б{round(n.protein, 1)}
                    </span>
                    <button
                      onClick={() => removeFood(food.id)}
                      className="text-red-300 hover:text-red-500 transition-colors ml-1 shrink-0"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* ─── Search ───────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold mb-1">🔍 Добавить продукт</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
            База Open Food Facts · 3 млн продуктов · можно по-русски или по-английски
          </p>

          <div className="flex gap-2 mb-3">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchFoods()}
              placeholder="курица, oatmeal, rye bread..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-300 transition-colors"
            />
            <button
              onClick={searchFoods}
              disabled={isLoading || !query.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: 'var(--color-roman)' }}
            >
              {isLoading ? '⏳' : 'Найти'}
            </button>
          </div>

          {/* Priority legend */}
          <div className="flex gap-4 text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
            <span>🟢 &lt;100 ккал/100г — высокий приоритет</span>
            <span>🟡 100–200 — средний</span>
            <span>🔴 &gt;200 — низкий</span>
          </div>

          {/* Results */}
          {isLoading && (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Ищем в базе Open Food Facts...
            </div>
          )}

          {!isLoading && searched && results.length === 0 && (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Ничего не найдено. Попробуй по-английски или сократи название.
            </div>
          )}

          <ul className="space-y-2">
            {results.map((product) => {
              const p = priority(product.nutrition.kcal);
              const grams = gramInputs[product.uid] ?? 100;
              return (
                <li
                  key={product.uid}
                  className="rounded-xl border p-3"
                  style={{ background: p.bg, borderColor: p.border }}
                >
                  {/* Name + priority */}
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm leading-snug">{product.name}</div>
                      {product.brand && (
                        <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {product.brand}
                        </div>
                      )}
                    </div>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{ color: p.text, background: '#ffffff99' }}
                    >
                      {p.emoji} {p.label}
                    </span>
                  </div>

                  {/* Per 100g */}
                  <div className="mb-2">
                    <span className="text-xs mr-2" style={{ color: 'var(--color-text-muted)' }}>на 100г:</span>
                    <NutritionBadges n={product.nutrition} />
                  </div>

                  {/* Gram input + add */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Порция:</span>
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
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>г →</span>
                    <NutritionBadges n={product.nutrition} grams={grams} />
                    <button
                      onClick={() => addFood(product)}
                      className="ml-auto shrink-0 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      + В день
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <footer className="text-center mt-8 mb-6 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Данные: Open Food Facts (CC BY-SA) · КБЖУ приблизительны
        </footer>
      </div>
    </main>
  );
}
