'use client';

import React, { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, Minus, Brain, Camera, Sparkles, Leaf } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Macros } from '@/types/nutrition';

interface DashboardProps {
  goals: Macros;
  consumed: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  currentDate: string;
  onDateChange: (date: string) => void;
  onAddFood: (mealType: string, name: string, kcal: number, protein: number, fat: number, carbs: number, grams: number, fiber?: number, micros?: Micros) => void;
  onAddFoods?: (mealType: string, items: AiLoggedItem[]) => void;
}

// Pick a sensible meal bucket from the current hour.
function mealForNow(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return 'breakfast';
  if (h >= 11 && h < 16) return 'lunch';
  if (h >= 16 && h < 21) return 'dinner';
  return 'snacks';
}

export function Dashboard({ goals, consumed, currentDate, onDateChange, onAddFood, onAddFoods }: DashboardProps) {
  const { t, lang } = useI18n();
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [diarySums, setDiarySums] = useState<DiarySum[]>([]);
  const [weekMicros, setWeekMicros] = useState<WeekMicros | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    Promise.all([getWeights(60), getDiarySums(60), getWeekMicros()]).then(([w, d, m]) => {
      setWeights(w);
      setDiarySums(d);
      setWeekMicros(m);
      setDataLoaded(true);
    });
  }, []);

  const goalCalories = goals.calories || 2000;
  const currentCalories = consumed.kcal || 0;
  const remainingCalories = goalCalories - currentCalories;
  const isOver = remainingCalories < 0;

  const roundVal = (n: number) => Math.round(n);

  return (
    <div className="glass-card rounded-3xl p-6 max-w-3xl mx-auto mb-8 animate-scale-in">
      {/* Dashboard Card Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-gray-100/60">
        <h2 className="text-xs font-bold text-[var(--color-text-light)] uppercase tracking-wider">
          {t('calc.target') || 'Ваша цель на день'}
        </h2>
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200/60 bg-white/60 text-xs font-bold text-[var(--color-primary-dark)] btn-interactive cursor-pointer shadow-sm"
        >
          <Settings size={14} className="text-[var(--color-primary)]" />
          {t('calc.title') || 'Калькулятор калорий'}
        </button>
      </div>

      {/* Calories Overview: Eaten / Remaining */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <span className="block text-4xl font-black text-[var(--color-text)]">
            {roundVal(currentCalories)}
          </span>
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            {t('diary.eaten') || 'съедено'}
          </span>
        </div>
        <div className="text-right">
          <span className="block text-4xl font-black text-[var(--color-primary)]">
            {roundVal(Math.max(0, remainingCalories))}
          </span>
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
            {isOver ? (t('diary.over') || 'перебор') : (t('diary.remaining') || 'осталось')}
          </span>
        </div>
      </div>

      {/* Main progress bar for calories */}
      <div className="h-3 bg-gray-100/80 rounded-full overflow-hidden mb-8 relative">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out bg-[var(--color-primary)]"
          style={{
            width: `${Math.min(100, (currentCalories / goalCalories) * 100)}%`,
          }}
        />
      </div>

      {/* Macros Boxes Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Protein */}
        <div className="bg-[#eef6ff] rounded-2xl p-3 border border-blue-100 flex flex-col justify-between h-24">
          <div>
            <span className="text-[9px] font-extrabold text-[#6b9bd1] uppercase tracking-wider block mb-1">
              {t('calc.protein') || 'белки'}
            </span>
            <span className="text-sm font-black text-blue-900">
              {roundVal(consumed.protein)} <span className="text-xs font-semibold text-blue-700/80">/ {roundVal(goals.protein)}г</span>
            </span>
          </div>
          <div className="h-1.5 bg-[#6b9bd1]/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6b9bd1] rounded-full"
              style={{ width: `${Math.min(100, (consumed.protein / (goals.protein || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Fat */}
        <div className="bg-[#fff0f7] rounded-2xl p-3 border border-pink-100 flex flex-col justify-between h-24">
          <div>
            <span className="text-[9px] font-extrabold text-[#e89fc4] uppercase tracking-wider block mb-1">
              {t('calc.fat') || 'жиры'}
            </span>
            <span className="text-sm font-black text-pink-900">
              {roundVal(consumed.fat)} <span className="text-xs font-semibold text-pink-700/80">/ {roundVal(goals.fat)}г</span>
            </span>
          </div>
          <div className="h-1.5 bg-[#e89fc4]/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#e89fc4] rounded-full"
              style={{ width: `${Math.min(100, (consumed.fat / (goals.fat || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-[#f0f9ef] rounded-2xl p-3 border border-green-100 flex flex-col justify-between h-24">
          <div>
            <span className="text-[9px] font-extrabold text-[#7c9885] uppercase tracking-wider block mb-1">
              {t('calc.carbs') || 'углеводы'}
            </span>
            <span className="text-sm font-black text-green-950">
              {roundVal(consumed.carbs)} <span className="text-xs font-semibold text-green-800/80">/ {roundVal(goals.carbs)}г</span>
            </span>
          </div>
          <div className="h-1.5 bg-[#7c9885]/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7c9885] rounded-full"
              style={{ width: `${Math.min(100, (consumed.carbs / (goals.carbs || 1)) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Weight Sparkline ──────────────────────────────────────────────────────────

function WeightSparkline({ entries }: { entries: WeightEntry[] }) {
  const { t } = useI18n();
  if (entries.length < 2) return null;

  // entries come newest-first from the DB; reverse so the chart goes left=old, right=new
  const ordered = [...entries].reverse();
  const values = ordered.map((e) => Number(e.weight_kg));
  const latest = values[values.length - 1];
  const oldest = values[0];
  const diff = latest - oldest;

  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const range = max - min || 1;

  const W = 280;
  const H = 60;
  const pad = 14; // generous padding so the dot never clips the card edge

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const TrendIcon = diff < -0.1 ? TrendingDown : diff > 0.1 ? TrendingUp : Minus;
  const trendColor = diff < -0.1 ? 'text-[var(--color-carbs)]' : diff > 0.1 ? 'text-red-400' : 'text-[var(--color-text-muted)]';

  return (
    <div className="bg-[var(--color-surface)] rounded-[28px] px-6 py-4 shadow-[var(--shadow-sm)] border border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{t('weight.trend')}</p>
        <span className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
          <TrendIcon size={13} />
          {diff > 0 ? '+' : ''}{diff.toFixed(1)} {t('weight.kg')}
        </span>
      </div>
      <div className="flex items-end gap-3">
        {/* overflow-hidden clips the dot inside the card border-radius */}
        <div className="flex-1 overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            <defs>
              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline points={[...points, `${(W - pad).toFixed(1)},${H}`, `${pad},${H}`].join(' ')} fill="url(#sparkGrad)" stroke="none" />
            <polyline points={points.join(' ')} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {(() => {
              const [x, y] = points[points.length - 1].split(',').map(Number);
              return <circle cx={x} cy={y} r="4" fill="var(--color-primary)" />;
            })()}
          </svg>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-extrabold text-[var(--color-text)] tabular-nums">{latest.toFixed(1)}</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">{t('weight.kg')}</p>
        </div>
      </div>
    </div>
  );
}

// ── Weekly micronutrients card ─────────────────────────────────────────────────

const STATUS_STYLE: Record<'low' | 'ok' | 'good', { color: string; bg: string; key: string }> = {
  low: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', key: 'micro.low' },
  ok: { color: 'var(--color-fat)', bg: 'var(--color-fat-bg)', key: 'micro.ok' },
  good: { color: 'var(--color-carbs)', bg: 'var(--color-carbs-bg)', key: 'micro.good' },
};

function MicronutrientCard({ data }: { data: WeekMicros | null }) {
  const { t } = useI18n();

  // Need at least a couple of logged days for the weekly signal to mean anything.
  const enough = data && data.days >= 2;

  return (
    <div className="bg-[var(--color-surface)] rounded-[28px] px-6 py-5 shadow-[var(--shadow-sm)] border border-[var(--color-border)]">
      <div className="flex items-center gap-2 mb-1">
        <Leaf size={16} className="text-[var(--color-carbs)] shrink-0" />
        <p className="text-xs font-bold text-[var(--color-text)]">{t('micro.title')}</p>
        <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded-full">
          {t('micro.weekly')}
        </span>
      </div>

      {!enough ? (
        <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed mt-2">{t('micro.empty')}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {MICRONUTRIENTS.map((m) => {
              const total = data!.totals[m.key] ?? 0;
              const avgDaily = total / data!.days;
              const status = microStatus(avgDaily, m.rda[data!.sex]);
              const s = STATUS_STYLE[status];
              return (
                <div
                  key={m.key}
                  className="flex items-center justify-between gap-2 rounded-xl bg-[var(--color-surface-2)] px-3 py-2"
                >
                  <span className="text-[11px] font-semibold text-[var(--color-text)] truncate">{t(m.labelKey)}</span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0"
                    style={{ color: s.color, backgroundColor: s.bg }}
                  >
                    {t(s.key)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-3 leading-relaxed">{t('micro.approx')}</p>
        </>
      )}
    </div>
  );
}

// ── Adaptive TDEE Card ────────────────────────────────────────────────────────

function AdaptiveTDEECard({ result }: { result: ReturnType<typeof calculateAdaptiveTDEE> }) {
  const { t } = useI18n();

  if (!result) {
    return (
      <div className="bg-[var(--color-surface)] rounded-[28px] px-6 py-4 shadow-[var(--shadow-sm)] border border-[var(--color-border)] flex items-center gap-3">
        <Brain size={18} className="text-[var(--color-primary)] shrink-0 opacity-50" />
        <div>
          <p className="text-xs font-bold text-[var(--color-text)]">{t('tdee.title')}</p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{t('tdee.dataNeeded')}</p>
        </div>
      </div>
    );
  }

  const absDelta = Math.abs(result.delta);
  const isOnTrack = absDelta < 200;
  const isReduce = result.delta > 200;

  const statusText = isOnTrack
    ? t('tdee.onTrack')
    : isReduce
    ? `${t('tdee.reduce')} ${result.estimatedTDEE} ${t('tdee.kcalday')}`
    : `${t('tdee.increase')} ${result.estimatedTDEE} ${t('tdee.kcalday')}`;

  const statusColor = isOnTrack ? 'text-[var(--color-carbs)]' : isReduce ? 'text-[var(--color-primary)]' : 'text-[var(--color-protein)]';

  return (
    <div className="bg-[var(--color-surface)] rounded-[28px] px-6 py-4 shadow-[var(--shadow-sm)] border border-[var(--color-border)]">
      <div className="flex items-start gap-3">
        <Brain size={18} className={`shrink-0 mt-0.5 ${statusColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs font-bold text-[var(--color-text)]">{t('tdee.title')}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] ${statusColor}`}>
              {t('tdee.estimated')}: {result.estimatedTDEE} {t('tdee.kcalday')}
            </span>
          </div>
          <p className={`text-[11px] font-semibold mt-1 ${statusColor}`}>{statusText}</p>
        </div>
      </div>
    </div>
  );
}
