'use client';

import React, { useState } from 'react';
import { Search, Loader2, X, Plus, ChefHat, Calculator } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Macros {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

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

interface SelectedItem {
  id: number;
  product: FoodProduct;
  grams: number;
}

type Sex = 'male' | 'female';
type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type Goal = 'lose' | 'maintain' | 'gain';

interface Params {
  weight: string;
  height: string;
  age: string;
  sex: Sex;
  activity: Activity;
  goal: Goal;
}

// ─── TDEE calculator (Mifflin-St Jeor) ───────────────────────────────────────

const ACTIVITY_MULT: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_DELTA: Record<Goal, number> = {
  lose: -300,
  maintain: 0,
  gain: 300,
};

function calcGoals(p: Params): Macros | null {
  const w = parseFloat(p.weight);
  const h = parseFloat(p.height);
  const a = parseFloat(p.age);
  if (!w || !h || !a) return null;

  const bmr =
    p.sex === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;

  const calories = Math.round(bmr * ACTIVITY_MULT[p.activity] + GOAL_DELTA[p.goal]);
  const protein = Math.round(w * 2);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { calories, protein, fat, carbs };
}

function macrosForItem(item: SelectedItem): Macros {
  const n = item.product.nutriments;
  const f = item.grams / 100;
  const r = (v: number) => Math.round(v * 10) / 10;
  return {
    calories: Math.round((n['energy-kcal_100g'] ?? 0) * f),
    protein: r((n.proteins_100g ?? 0) * f),
    fat: r((n.fat_100g ?? 0) * f),
    carbs: r((n.carbohydrates_100g ?? 0) * f),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MacroBarProps {
  label: string;
  unit: string;
  value: number;
  goal: number;
  barColor: string;
  textColor: string;
}

const MacroBar = ({ label, unit, value, goal, barColor, textColor }: MacroBarProps) => {
  const pct = Math.min((value / goal) * 100, 100);
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

// ─── Main component ───────────────────────────────────────────────────────────

const DEFAULT_GOALS: Macros = { calories: 2000, protein: 150, fat: 55, carbs: 200 };

export const MenuBuilder = () => {
  const [params, setParams] = useState<Params>({
    weight: '',
    height: '',
    age: '',
    sex: 'male',
    activity: 'moderate',
    goal: 'maintain',
  });
  const [goals, setGoals] = useState<Macros | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<SelectedItem[]>([]);
  const [nextId, setNextId] = useState(0);

  // ── handlers ──

  const handleCalc = () => setGoals(calcGoals(params));

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
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

  // ── totals ──

  const totals = items.reduce<Macros>(
    (acc, item) => {
      const m = macrosForItem(item);
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

  // ── render ──

  return (
    <section className="bg-white rounded-2xl shadow-[var(--shadow-lg)] p-6 mb-10 border border-[var(--color-border)]">
      <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6 flex items-center gap-3">
        <ChefHat size={28} className="text-[var(--color-primary-dark)]" />
        Конструктор меню
      </h2>

      {/* ── PARAMETERS ─────────────────────────────────────────────── */}
      <div className="bg-[var(--color-bg)] rounded-xl p-5 mb-6 border border-[var(--color-border)]">
        <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2 text-sm">
          <Calculator size={17} className="text-[var(--color-primary)]" />
          Параметры для расчёта нормы
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {/* numeric inputs */}
          {(
            [
              { key: 'weight', label: 'Вес (кг)', placeholder: '79' },
              { key: 'height', label: 'Рост (см)', placeholder: '180' },
              { key: 'age', label: 'Возраст', placeholder: '25' },
            ] as const
          ).map(({ key, label, placeholder }) => (
            <label key={key} className="flex flex-col gap-1">
              <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
              <input
                type="number"
                value={params[key]}
                onChange={(e) => setParams((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </label>
          ))}

          {/* sex */}
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-text-muted)]">Пол</span>
            <select
              value={params.sex}
              onChange={(e) => setParams((p) => ({ ...p, sex: e.target.value as Sex }))}
              className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </label>

          {/* activity */}
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-text-muted)]">Активность</span>
            <select
              value={params.activity}
              onChange={(e) =>
                setParams((p) => ({ ...p, activity: e.target.value as Activity }))
              }
              className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="sedentary">Малоподвижный</option>
              <option value="light">Лёгкая активность</option>
              <option value="moderate">Умеренная</option>
              <option value="active">Активный</option>
              <option value="very_active">Очень активный</option>
            </select>
          </label>

          {/* goal */}
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-text-muted)]">Цель</span>
            <select
              value={params.goal}
              onChange={(e) => setParams((p) => ({ ...p, goal: e.target.value as Goal }))}
              className="px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              <option value="lose">Похудение (−300 ккал)</option>
              <option value="maintain">Поддержание</option>
              <option value="gain">Набор массы (+300 ккал)</option>
            </select>
          </label>
        </div>

        <button
          onClick={handleCalc}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[var(--shadow-md)]"
        >
          Рассчитать норму
        </button>

        {goals && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Калории',
                value: goals.calories,
                unit: 'ккал',
                bg: 'bg-[var(--color-breakfast-bg)]',
                color: 'text-[var(--color-accent-dark)]',
              },
              {
                label: 'Белки',
                value: goals.protein,
                unit: 'г',
                bg: 'bg-[var(--color-roman-bg)]',
                color: 'text-[var(--color-roman)]',
              },
              {
                label: 'Жиры',
                value: goals.fat,
                unit: 'г',
                bg: 'bg-[var(--color-liza-bg)]',
                color: 'text-[var(--color-liza)]',
              },
              {
                label: 'Углеводы',
                value: goals.carbs,
                unit: 'г',
                bg: 'bg-[var(--color-lunch-bg)]',
                color: 'text-[var(--color-primary-dark)]',
              },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
                <div className={`text-2xl font-extrabold ${item.color}`}>
                  {item.value}
                  <span className="text-xs font-normal ml-0.5">{item.unit}</span>
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SEARCH ─────────────────────────────────────────────────── */}
      <div className="mb-4">
        <h3 className="font-semibold text-[var(--color-text)] mb-3 text-sm">
          Добавить продукт в рацион
        </h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="Поиск: гречка, курица, творог, buckwheat..."
              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
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
            Найти
          </button>
        </div>
      </div>

      {/* ── SEARCH RESULTS ─────────────────────────────────────────── */}
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
                  {Math.round(p.nutriments['energy-kcal_100g'] ?? 0)} ккал ·{' '}
                  {Math.round(p.nutriments.proteins_100g ?? 0)}г Б / 100г
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

      {/* ── SELECTED ITEMS ─────────────────────────────────────────── */}
      {items.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-[var(--color-text)] mb-3 text-sm">Мой рацион</h3>
          <div className="space-y-2">
            {items.map((item) => {
              const m = macrosForItem(item);
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
                      {m.calories} ккал · {m.protein}г Б · {m.fat}г Ж · {m.carbs}г У
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
                    <span className="text-xs text-[var(--color-text-muted)]">г</span>
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

      {/* ── TOTALS ─────────────────────────────────────────────────── */}
      {items.length > 0 && (
        <div className="bg-[var(--color-bg)] rounded-xl p-5 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--color-text)] text-sm">Итого за день</h3>
            {!goals && (
              <span className="text-[var(--color-text-muted)] text-[10px]">
                Заполните параметры для точного сравнения
              </span>
            )}
          </div>

          <div className="space-y-3">
            <MacroBar
              label="Калории"
              unit="ккал"
              value={totals.calories}
              goal={activeGoals.calories}
              barColor="bg-[var(--color-accent)]"
              textColor="text-[var(--color-accent-dark)]"
            />
            <MacroBar
              label="Белки"
              unit="г"
              value={totals.protein}
              goal={activeGoals.protein}
              barColor="bg-[var(--color-roman)]"
              textColor="text-[var(--color-roman)]"
            />
            <MacroBar
              label="Жиры"
              unit="г"
              value={totals.fat}
              goal={activeGoals.fat}
              barColor="bg-[var(--color-liza)]"
              textColor="text-[var(--color-liza)]"
            />
            <MacroBar
              label="Углеводы"
              unit="г"
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
                  Осталось добрать: {goals.calories - totals.calories} ккал
                </span>
              ) : totals.calories === goals.calories ? (
                <span className="text-[var(--color-primary)]">Норма выполнена!</span>
              ) : (
                <span className="text-red-500">
                  Превышение на: {totals.calories - goals.calories} ккал
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {items.length === 0 && results.length === 0 && (
        <p className="text-center text-[var(--color-text-muted)] text-sm py-4">
          Найдите продукты и добавьте их в рацион — калории и КБЖУ посчитаются автоматически
        </p>
      )}
    </section>
  );
};
