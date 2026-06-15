'use client';

import React, { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, Minus, Brain, Camera, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Macros } from '@/lib/nutrition';
import { calculateAdaptiveTDEE, WeightSample, DiarySum } from '@/lib/nutrition';
import { getWeights, getDiarySums, WeightEntry } from '@/lib/cloud';
import { AiLogModal } from '@/components/AiLogModal';

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
  onAddFood: (mealType: string, name: string, kcal: number, protein: number, fat: number, carbs: number, grams: number, fiber?: number) => void;
}

// Pick a sensible meal bucket from the current hour.
function mealForNow(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return 'breakfast';
  if (h >= 11 && h < 16) return 'lunch';
  if (h >= 16 && h < 21) return 'dinner';
  return 'snacks';
}

export function Dashboard({ goals, consumed, currentDate, onDateChange, onAddFood }: DashboardProps) {
  const { t, lang } = useI18n();
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [diarySums, setDiarySums] = useState<DiarySum[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

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
  const pct = goalCalories > 0 ? Math.min(100, (currentCalories / goalCalories) * 100) : 0;
  const roundVal = (n: number) => Math.round(n);

  const adaptiveTDEE = dataLoaded
    ? calculateAdaptiveTDEE(
        weights.map((w) => ({ date: w.date, weight_kg: Number(w.weight_kg) })) as WeightSample[],
        diarySums as DiarySum[],
        goalCalories,
      )
    : null;

  const sparkWeights = [...weights].reverse().slice(-14);

  return (
    <div className="space-y-4 max-w-2xl mx-auto mb-8">
      {/* ── Week strip ──────────────────────────────────────────────────────── */}
      <WeekStrip currentDate={currentDate} onDateChange={onDateChange} lang={lang} />

      {/* ── Calorie + Macro hero card ───────────────────────────────────────── */}
      <div className="bg-[var(--color-surface)] rounded-[28px] p-6 shadow-[var(--shadow-md)] border border-[var(--color-border)]">
        {/* Big EATEN / LEFT */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-extrabold tracking-tight text-[var(--color-text)] tabular-nums leading-none">
              {roundVal(currentCalories)}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mt-1.5">
              {t('dash.eaten')}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-4xl font-extrabold tracking-tight tabular-nums leading-none ${isOver ? 'text-red-500' : 'text-[var(--color-primary)]'}`}>
              {roundVal(Math.abs(remainingCalories))}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] mt-1.5">
              {isOver ? t('diary.over') : t('dash.left')}
            </p>
          </div>
        </div>

        {/* Thin calorie bar */}
        <div className="mt-4">
          <div className="h-2.5 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${pct}%`,
                background: isOver
                  ? '#f87171'
                  : 'linear-gradient(90deg, var(--color-primary-light), var(--color-primary))',
              }}
            />
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5 text-right tabular-nums">
            {roundVal(goalCalories)} {t('calc.kcal')}
          </p>
        </div>

        {/* Macro mini-cards */}
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          <MacroCard label={t('calc.protein')} current={consumed.protein} goal={goals.protein} color="var(--color-protein)" bg="var(--color-protein-bg)" />
          <MacroCard label={t('calc.fat')} current={consumed.fat} goal={goals.fat} color="var(--color-fat)" bg="var(--color-fat-bg)" />
          <MacroCard label={t('calc.carbs')} current={consumed.carbs} goal={goals.carbs} color="var(--color-carbs)" bg="var(--color-carbs-bg)" />
        </div>
      </div>

      {/* ── Dose AI assistant card ──────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setAiOpen(true)}
        className="w-full text-left bg-[var(--color-surface)] rounded-[28px] p-5 shadow-[var(--shadow-md)] border border-[var(--color-border)] hover:shadow-[var(--shadow-lg)] transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-primary-dark)] text-white flex items-center justify-center shadow-[var(--shadow-glow)] shrink-0">
            <Sparkles size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-[var(--color-text)] leading-tight">{t('dash.aiName')}</p>
            <p className="text-[11px] text-[var(--color-text-light)] truncate">{t('dash.aiRole')}</p>
          </div>
          <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded-full shrink-0">
            AI
          </span>
        </div>

        {/* Fake input row that opens the modal */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3">
          <span className="flex-1 text-sm text-[var(--color-text-muted)] truncate">{t('dash.aiPrompt')}</span>
          <span className="w-8 h-8 rounded-xl bg-[var(--color-ink)] text-[var(--color-surface)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Camera size={15} />
          </span>
        </div>
      </button>

      {/* ── Weight Trend Sparkline ─────────────────────────────────────────── */}
      {sparkWeights.length >= 2 && <WeightSparkline entries={sparkWeights} />}

      {/* ── Adaptive TDEE ─────────────────────────────────────────────────── */}
      {dataLoaded && <AdaptiveTDEECard result={adaptiveTDEE} />}

      {/* ── AI modal ──────────────────────────────────────────────────────── */}
      {aiOpen && (
        <AiLogModal
          mealType={mealForNow()}
          onClose={() => setAiOpen(false)}
          onAddItem={(name, kcal, protein, fat, carbs, grams, fiber) =>
            onAddFood(mealForNow(), name, kcal, protein, fat, carbs, grams, fiber)
          }
        />
      )}
    </div>
  );
}

// ── Week strip ────────────────────────────────────────────────────────────────

function WeekStrip({ currentDate, onDateChange, lang }: { currentDate: string; onDateChange: (d: string) => void; lang: string }) {
  if (!currentDate) return null;

  const toStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const current = new Date(currentDate);
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(new Date(currentDate).setDate(diff));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const names: Record<string, string[]> = {
    ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    uk: ['Нд', 'Пн', 'Вв', 'Ср', 'Чт', 'Пт', 'Сб'],
  };
  const dn = names[lang === 'uk' || lang === 'en' ? lang : 'ru'];
  const todayStr = toStr(new Date());

  return (
    <div className="flex items-center gap-1.5 bg-[var(--color-surface)] rounded-[22px] p-2 shadow-[var(--shadow-sm)] border border-[var(--color-border)]">
      {days.map((d) => {
        const ds = toStr(d);
        const isActive = ds === currentDate;
        const isToday = ds === todayStr;
        return (
          <button
            key={ds}
            onClick={() => onDateChange(ds)}
            className={`flex-1 flex flex-col items-center justify-center py-2 rounded-2xl transition-all ${
              isActive ? 'bg-[var(--color-ink)] text-[var(--color-surface)]' : 'hover:bg-[var(--color-surface-2)]'
            }`}
          >
            <span className={`text-[9px] font-bold uppercase ${isActive ? 'text-[var(--color-surface)]/70' : 'text-[var(--color-text-muted)]'}`}>
              {dn[d.getDay()]}
            </span>
            <span className={`text-sm font-extrabold mt-0.5 tabular-nums ${isActive ? 'text-[var(--color-surface)]' : 'text-[var(--color-text)]'}`}>
              {d.getDate()}
            </span>
            {isToday && !isActive && <span className="w-1 h-1 bg-[var(--color-primary)] rounded-full mt-0.5" />}
          </button>
        );
      })}
    </div>
  );
}

// ── Macro mini-card ─────────────────────────────────────────────────────────--

function MacroCard({ label, current, goal, color, bg }: { label: string; current: number; goal: number; color: string; bg: string }) {
  const cur = Math.round(current);
  const g = Math.round(goal);
  const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
  const isOver = current > goal;

  return (
    <div className="rounded-2xl p-3" style={{ backgroundColor: bg }}>
      <p className="text-[9px] font-bold uppercase tracking-wider truncate" style={{ color }}>{label}</p>
      <p className="text-sm font-extrabold text-[var(--color-text)] tabular-nums mt-1">
        {cur}<span className="text-[var(--color-text-muted)] font-bold">/{g}</span>
      </p>
      <div className="h-1.5 rounded-full bg-black/5 overflow-hidden mt-1.5">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: isOver ? '#f87171' : color }}
        />
      </div>
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
        <svg viewBox={`0 0 ${W} ${H}`} className="flex-1 overflow-visible">
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
        <div className="text-right shrink-0">
          <p className="text-lg font-extrabold text-[var(--color-text)] tabular-nums">{latest.toFixed(1)}</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">{t('weight.kg')}</p>
        </div>
      </div>
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
