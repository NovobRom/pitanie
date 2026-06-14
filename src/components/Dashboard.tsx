'use client';

import React, { useEffect, useState } from 'react';
import { Settings, TrendingDown, TrendingUp, Minus, Brain } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Macros } from '@/lib/nutrition';
import { calculateAdaptiveTDEE, WeightSample, DiarySum } from '@/lib/nutrition';
import { getWeights, getDiarySums, WeightEntry } from '@/lib/cloud';

interface DashboardProps {
  goals: Macros;
  consumed: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  onOpenProfile: () => void;
}

export function Dashboard({ goals, consumed, onOpenProfile }: DashboardProps) {
  const { t } = useI18n();
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [diarySums, setDiarySums] = useState<DiarySum[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getWeights(60), getDiarySums(60)]).then(([w, d]) => {
      setWeights(w);
      setDiarySums(d);
      setDataLoaded(true);
    });
  }, []);

  const goalCalories = goals.calories || 2000;
  const currentCalories = consumed.kcal || 0;
  const remainingCalories = goalCalories - currentCalories;
  const isOver = remainingCalories < 0;

  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const pct = goalCalories > 0 ? Math.min(100, (currentCalories / goalCalories) * 100) : 0;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const roundVal = (n: number) => Math.round(n);

  // Adaptive TDEE
  const adaptiveTDEE = dataLoaded
    ? calculateAdaptiveTDEE(
        weights.map((w) => ({ date: w.date, weight_kg: Number(w.weight_kg) })) as WeightSample[],
        diarySums as DiarySum[],
        goalCalories,
      )
    : null;

  // Weight sparkline data (last 14 entries, ascending)
  const sparkWeights = [...weights].reverse().slice(-14);

  return (
    <div className="space-y-4 max-w-3xl mx-auto mb-8">
      {/* ── Main Calorie + Macro card ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 shadow-[var(--shadow-md)] border border-gray-100/50">
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100/60">
          <h2 className="text-xs font-bold text-[var(--color-text-light)] uppercase tracking-wider min-w-0">
            {t('calc.target')}
          </h2>
          <button
            type="button"
            onClick={onOpenProfile}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-[var(--color-primary-dark)] transition-all cursor-pointer shadow-sm hover:shadow whitespace-nowrap"
          >
            <Settings size={14} className="text-[var(--color-primary)]" />
            {t('calc.title')}
          </button>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
          {/* Circular Calorie Chart */}
          <div className="relative w-44 h-44 flex items-center justify-center mx-auto md:mx-0 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 176 176">
              <circle cx="88" cy="88" r={radius} stroke="#f3f4f6" strokeWidth={strokeWidth} fill="transparent" />
              <circle
                cx="88" cy="88" r={radius}
                stroke={isOver ? '#fca5a5' : 'var(--color-primary)'}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <span className="text-3xl font-extrabold text-[var(--color-text)]">{roundVal(currentCalories)}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                / {roundVal(goalCalories)} {t('calc.kcal')}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isOver ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                {isOver ? t('diary.over') : t('diary.remaining')}: {roundVal(Math.abs(remainingCalories))}
              </span>
            </div>
          </div>

          {/* Macro Progress Bars */}
          <div className="w-full min-w-0 space-y-4 md:flex-1">
            <MacroBar label={t('calc.protein')} current={consumed.protein} goal={goals.protein} color="var(--color-roman)" bgColor="var(--color-roman-bg)" unit={t('calc.g')} />
            <MacroBar label={t('calc.fat')} current={consumed.fat} goal={goals.fat} color="var(--color-liza)" bgColor="var(--color-liza-bg)" unit={t('calc.g')} />
            <MacroBar label={t('calc.carbs')} current={consumed.carbs} goal={goals.carbs} color="var(--color-primary-light)" bgColor="#f0fdf4" unit={t('calc.g')} />
          </div>
        </div>
      </div>

      {/* ── Weight Trend Sparkline ─────────────────────────────────────────── */}
      {sparkWeights.length >= 2 && (
        <WeightSparkline entries={sparkWeights} />
      )}

      {/* ── Adaptive TDEE ─────────────────────────────────────────────────── */}
      {dataLoaded && <AdaptiveTDEECard result={adaptiveTDEE} goalCalories={goalCalories} />}
    </div>
  );
}

// ── Weight Sparkline ──────────────────────────────────────────────────────────

function WeightSparkline({ entries }: { entries: WeightEntry[] }) {
  const { t } = useI18n();
  if (entries.length < 2) return null;

  const values = entries.map((e) => Number(e.weight_kg));
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const range = max - min || 1;

  const W = 280;
  const H = 60;
  const pad = 8;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const latest = values[values.length - 1];
  const oldest = values[0];
  const diff = latest - oldest;
  const TrendIcon = diff < -0.1 ? TrendingDown : diff > 0.1 ? TrendingUp : Minus;
  const trendColor = diff < -0.1 ? 'text-green-500' : diff > 0.1 ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="bg-white rounded-3xl px-6 py-4 shadow-[var(--shadow-sm)] border border-gray-100/50">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{t('weight.trend')}</p>
        <span className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
          <TrendIcon size={13} />
          {diff > 0 ? '+' : ''}{diff.toFixed(1)} {t('weight.kg')}
        </span>
      </div>
      <div className="flex items-end gap-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="flex-1 overflow-visible">
          {/* Area fill */}
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            points={[...points, `${(W - pad).toFixed(1)},${H}`, `${pad},${H}`].join(' ')}
            fill="url(#sparkGrad)"
            stroke="none"
          />
          {/* Line */}
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Latest dot */}
          {(() => {
            const [x, y] = points[points.length - 1].split(',').map(Number);
            return <circle cx={x} cy={y} r="4" fill="var(--color-primary)" />;
          })()}
        </svg>
        <div className="text-right shrink-0">
          <p className="text-lg font-extrabold text-[var(--color-text)]">{latest.toFixed(1)}</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">{t('weight.kg')}</p>
        </div>
      </div>
    </div>
  );
}

// ── Adaptive TDEE Card ────────────────────────────────────────────────────────

function AdaptiveTDEECard({ result, goalCalories }: { result: ReturnType<typeof calculateAdaptiveTDEE>; goalCalories: number }) {
  const { t } = useI18n();

  if (!result) {
    return (
      <div className="bg-white rounded-3xl px-6 py-4 shadow-[var(--shadow-sm)] border border-gray-100/50 flex items-center gap-3">
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
  const isIncrease = result.delta < -200;

  const statusText = isOnTrack
    ? t('tdee.onTrack')
    : isReduce
    ? `${t('tdee.reduce')} ${result.estimatedTDEE} ${t('tdee.kcalday')}`
    : `${t('tdee.increase')} ${result.estimatedTDEE} ${t('tdee.kcalday')}`;

  const statusColor = isOnTrack ? 'text-green-600' : isReduce ? 'text-orange-500' : 'text-blue-500';
  const bgColor = isOnTrack ? 'bg-green-50' : isReduce ? 'bg-orange-50' : 'bg-blue-50';

  return (
    <div className={`rounded-3xl px-6 py-4 shadow-[var(--shadow-sm)] border ${isOnTrack ? 'border-green-100 bg-green-50/50' : isReduce ? 'border-orange-100 bg-orange-50/30' : 'border-blue-100 bg-blue-50/30'}`}>
      <div className="flex items-start gap-3">
        <Brain size={18} className={`shrink-0 mt-0.5 ${statusColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs font-bold text-[var(--color-text)]">{t('tdee.title')}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bgColor} ${statusColor}`}>
              {t('tdee.estimated')}: {result.estimatedTDEE} {t('tdee.kcalday')}
            </span>
          </div>
          <p className={`text-[11px] font-semibold mt-1 ${statusColor}`}>{statusText}</p>
        </div>
      </div>
    </div>
  );
}

// ── MacroBar (unchanged) ──────────────────────────────────────────────────────

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  bgColor: string;
  unit: string;
}

function MacroBar({ label, current, goal, color, bgColor, unit }: MacroBarProps) {
  const roundedCurrent = Math.round(current * 10) / 10;
  const roundedGoal = Math.round(goal * 10) / 10;
  const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
  const isOver = current > goal;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-xs font-semibold mb-1">
        <span className="text-[var(--color-text)] min-w-0 truncate">{label}</span>
        <span className="text-[var(--color-text-light)] font-mono shrink-0 whitespace-nowrap">
          {roundedCurrent}{unit} / {roundedGoal}{unit}
          {isOver && <span className="text-red-500 ml-1">⚠️</span>}
        </span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: isOver ? '#fca5a5' : color }}
        />
      </div>
    </div>
  );
}
