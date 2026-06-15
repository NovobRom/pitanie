'use client';

import React, { useState, useRef } from 'react';
import { X, Sparkles, Loader2, Plus, Check } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import type { AiLoggedItem } from '@/app/api/ai-log/route';

interface AiLogModalProps {
  mealType: string;
  onClose: () => void;
  onAddItem: (name: string, kcal: number, protein: number, fat: number, carbs: number, grams: number, fiber?: number) => void;
}

export function AiLogModal({ mealType, onClose, onAddItem }: AiLogModalProps) {
  const { t } = useI18n();
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<AiLoggedItem[]>([]);
  const [added, setAdded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleParse = async () => {
    const desc = description.trim();
    if (!desc) return;
    setLoading(true);
    setError('');
    setItems([]);
    setAdded(new Set());

    try {
      const res = await fetch('/api/ai-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'no_key') setError(t('ai.noKey'));
        else setError(t('ai.error'));
        return;
      }
      if (!data.items?.length) {
        setError(t('ai.empty'));
        return;
      }
      setItems(data.items);
    } catch {
      setError(t('ai.error'));
    } finally {
      setLoading(false);
    }
  };

  const addItem = (idx: number) => {
    const item = items[idx];
    onAddItem(item.name, item.kcal, item.protein, item.fat, item.carbs, item.grams, item.fiber);
    setAdded((prev) => new Set(prev).add(idx));
  };

  const addAll = () => {
    items.forEach((item, idx) => {
      if (!added.has(idx)) {
        onAddItem(item.name, item.kcal, item.protein, item.fat, item.carbs, item.grams, item.fiber);
      }
    });
    setAdded(new Set(items.map((_, i) => i)));
  };

  const r = (n: number) => Math.round(n * 10) / 10;
  const totalKcal = items.reduce((s, it) => s + (it.kcal * it.grams) / 100, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-[var(--color-surface)] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-[var(--shadow-lg)] flex flex-col max-h-[90vh] border border-[var(--color-border)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Sparkles size={14} className="text-[var(--color-primary)]" />
            </div>
            <h3 className="font-bold text-sm text-[var(--color-text)]">{t('ai.title')}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1.5 rounded-full hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Input area */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{t('ai.hint')}</p>
            <textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleParse();
              }}
              placeholder={t('ai.placeholder')}
              rows={3}
              className="w-full text-sm px-3 py-2.5 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface-2)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
            />
            <button
              onClick={handleParse}
              disabled={loading || !description.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {t('ai.parsing')}
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  {t('ai.parse')}
                </>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-xl">{error}</p>
          )}

          {/* Results */}
          {items.length > 0 && (
            <div className="space-y-2">
              {/* Summary bar */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {items.length} {items.length === 1 ? 'позиция' : items.length < 5 ? 'позиции' : 'позиций'} · {Math.round(totalKcal)} ккал
                </p>
                <button
                  onClick={addAll}
                  disabled={added.size === items.length}
                  className="text-[10px] font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] disabled:opacity-40 px-2 py-1 rounded-lg hover:bg-[var(--color-primary)]/10 transition-all"
                >
                  {t('ai.addAll')}
                </button>
              </div>

              {items.map((item, idx) => {
                const isAdded = added.has(idx);
                const itemKcal = Math.round((item.kcal * item.grams) / 100);
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      isAdded
                        ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20'
                        : 'bg-[var(--color-surface-2)] border-[var(--color-border)]'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text)] truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-[var(--color-text-muted)]">{item.grams}г</span>
                        <span className="text-[10px] font-semibold" style={{ color: 'var(--color-fat)' }}>{itemKcal} ккал</span>
                        <span className="text-[10px]" style={{ color: 'var(--color-protein)' }}>Б {r(item.protein * item.grams / 100)}г</span>
                        <span className="text-[10px]" style={{ color: 'var(--color-fat)' }}>Ж {r(item.fat * item.grams / 100)}г</span>
                        <span className="text-[10px]" style={{ color: 'var(--color-carbs)' }}>У {r(item.carbs * item.grams / 100)}г</span>
                      </div>
                    </div>
                    <button
                      onClick={() => !isAdded && addItem(idx)}
                      className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                        isAdded
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white'
                      }`}
                    >
                      {isAdded ? <Check size={13} /> : <Plus size={13} />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
