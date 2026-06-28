'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Scale, TrendingDown, TrendingUp, Minus, Loader2, Trash2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { useI18n } from '@/lib/i18n';
import { logWeight, getWeights, deleteWeight, WeightEntry } from '@/lib/cloud';

interface WeightWidgetProps {
  user: User;
}

export function WeightWidget({ user }: WeightWidgetProps) {
  const { t } = useI18n();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [inputKg, setInputKg] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getWeights(30);
    setEntries(data);
    // Pre-fill input with today's weight if already logged
    const todayEntry = data.find((e) => e.date === today);
    if (todayEntry) setInputKg(String(todayEntry.weight_kg));
    setLoading(false);
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (date: string) => {
    setDeletingDate(date);
    const ok = await deleteWeight(date);
    if (ok) await load();
    setDeletingDate(null);
    if (date === today) setInputKg('');
  };

  const handleSave = async () => {
    const kg = parseFloat(inputKg);
    if (!kg || kg < 20 || kg > 500) return;
    setSaving(true);
    const ok = await logWeight(today, kg);
    if (ok) {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
      await load();
    }
    setSaving(false);
  };

  // Last 7 entries for display and trend
  const recent = entries.slice(0, 7);
  const trend7d =
    recent.length >= 2
      ? recent[0].weight_kg - recent[Math.min(6, recent.length - 1)].weight_kg
      : null;

  const TrendIcon =
    trend7d === null ? null : trend7d < -0.1 ? TrendingDown : trend7d > 0.1 ? TrendingUp : Minus;
  const trendColor =
    trend7d === null ? '' : trend7d < -0.1 ? 'text-green-500' : trend7d > 0.1 ? 'text-red-400' : 'text-gray-400';

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[var(--shadow-md)] border border-gray-100/50 mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Scale size={18} className="text-[var(--color-primary)] shrink-0" />
        <h3 className="font-bold text-[var(--color-text)] text-sm">{t('weight.title')}</h3>
        {trend7d !== null && TrendIcon && (
          <span className={`ml-auto flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
            <TrendIcon size={14} />
            {trend7d > 0 ? '+' : ''}{trend7d.toFixed(1)} {t('weight.kg')}
            <span className="text-[var(--color-text-muted)] font-normal ml-0.5">({t('weight.change7d')})</span>
          </span>
        )}
      </div>

      {/* Input row */}
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          step="0.1"
          min="20"
          max="500"
          value={inputKg}
          onChange={(e) => setInputKg(e.target.value)}
          placeholder={t('weight.today')}
          className="flex-1 text-sm font-semibold px-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all shadow-sm"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !inputKg}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : savedFlash ? (
            t('weight.saved')
          ) : (
            t('weight.save')
          )}
        </button>
      </div>

      {/* History */}
      <div>
        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
          {t('weight.history')}
        </p>
        {loading ? (
          <div className="flex justify-center py-3">
            <Loader2 size={16} className="animate-spin text-[var(--color-primary)]" />
          </div>
        ) : recent.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] text-center py-2">{t('weight.noHistory')}</p>
        ) : (
          <div className="space-y-1">
            {recent.map((entry) => {
              const isToday = entry.date === today;
              const isDeleting = deletingDate === entry.date;
              return (
                <div
                  key={entry.date}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs group ${
                    isToday
                      ? 'bg-[var(--color-primary)]/10 font-semibold text-[var(--color-primary-dark)]'
                      : 'text-[var(--color-text-light)]'
                  }`}
                >
                  <span>{isToday ? '• ' : ''}{formatDate(entry.date)}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">
                      {Number(entry.weight_kg).toFixed(1)} {t('weight.kg')}
                    </span>
                    <button
                      onClick={() => handleDelete(entry.date)}
                      disabled={isDeleting}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-[var(--color-text-muted)] hover:text-red-400 disabled:opacity-30 p-0.5"
                      title={t('weight.delete')}
                    >
                      {isDeleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
