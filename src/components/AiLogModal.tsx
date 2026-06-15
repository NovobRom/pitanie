'use client';

import React, { useState, useRef } from 'react';
import { X, Sparkles, Loader2, Plus, Check, Camera, ImagePlus, Type } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { aiPost } from '@/lib/aiFetch';
import type { Micros } from '@/lib/micronutrients';
import type { AiLoggedItem } from '@/app/api/ai-log/route';
import { COOK_METHODS, adjustForMethod, type CookMethod } from '@/lib/cooking';

interface AiLogModalProps {
  mealType: string;
  onClose: () => void;
  onAddItem: (name: string, kcal: number, protein: number, fat: number, carbs: number, grams: number, fiber?: number, micros?: Micros) => void;
  onAddItems?: (items: AiLoggedItem[]) => void;
}

type Mode = 'text' | 'photo';

// Downscale an image file to a JPEG data URL (max edge 1024px) to keep the
// API payload small and the vision call cheap.
function fileToDownscaledDataUrl(file: File, maxEdge = 1024, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode failed'));
      img.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('no canvas'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function AiLogModal({ mealType, onClose, onAddItem, onAddItems }: AiLogModalProps) {
  const { t, lang } = useI18n();
  const [mode, setMode] = useState<Mode>('text');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [items, setItems] = useState<AiLoggedItem[]>([]);
  const [added, setAdded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const resetResults = () => {
    setItems([]);
    setAdded(new Set());
    setError('');
  };

  const handlePickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    resetResults();
    try {
      const dataUrl = await fileToDownscaledDataUrl(file);
      setPhoto(dataUrl);
    } catch {
      setError(t('ai.error'));
    }
  };

  const runParse = async (payload: { description?: string; image?: string }) => {
    setLoading(true);
    resetResults();
    try {
      const res = await aiPost('/api/ai-log', { ...payload, lang });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'no_key') setError(t('ai.noKey'));
        else if (data.error === 'rate_limited') setError(t('ai.rateLimited'));
        else setError(t('ai.error'));
        return;
      }
      if (!data.items?.length) {
        setError(payload.image ? t('ai.photoEmpty') : t('ai.empty'));
        return;
      }
      setItems(data.items);
    } catch {
      setError(t('ai.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleParseText = () => {
    const desc = description.trim();
    if (!desc) return;
    runParse({ description: desc });
  };

  const handleParsePhoto = () => {
    if (!photo) return;
    runParse({ image: photo, description: description.trim() || undefined });
  };

  // The chosen cooking method is baked into the name that goes to the diary,
  // so the user's correction persists (the diary item has no method field).
  const composeName = (item: AiLoggedItem) =>
    item.method ? `${item.name}, ${t(`cook.${item.method}`).toLowerCase()}` : item.name;

  // Switch a recognised item's preparation and re-estimate its macros locally.
  const changeMethod = (idx: number, next: CookMethod) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx || !it.method || it.method === next) return it;
        const { kcal, fat } = adjustForMethod({ kcal: it.kcal, fat: it.fat }, it.method, next);
        return { ...it, method: next, kcal, fat };
      })
    );
  };

  const addItem = (idx: number) => {
    const item = items[idx];
    onAddItem(composeName(item), item.kcal, item.protein, item.fat, item.carbs, item.grams, item.fiber, item.micros);
    setAdded((prev) => new Set(prev).add(idx));
  };

  const addAll = () => {
    const toAdd = items
      .filter((_, idx) => !added.has(idx))
      .map((item) => ({ ...item, name: composeName(item) }));
    if (onAddItems) {
      onAddItems(toAdd);
    } else {
      toAdd.forEach((item) => {
        onAddItem(item.name, item.kcal, item.protein, item.fat, item.carbs, item.grams, item.fiber, item.micros);
      });
    }
    setAdded(new Set(items.map((_, i) => i)));
  };

  const r = (n: number) => Math.round(n * 10) / 10;
  const totalKcal = items.reduce((s, it) => s + (it.kcal * it.grams) / 100, 0);

  const switchMode = (m: Mode) => {
    setMode(m);
    resetResults();
  };

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

        {/* Mode tabs */}
        <div className="flex gap-1 p-1 mx-4 mt-3 rounded-2xl bg-[var(--color-surface-2)] shrink-0">
          <button
            onClick={() => switchMode('text')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl transition-all ${
              mode === 'text'
                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-text-muted)]'
            }`}
          >
            <Type size={13} />
            {t('ai.tabText')}
          </button>
          <button
            onClick={() => switchMode('photo')}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl transition-all ${
              mode === 'photo'
                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-text-muted)]'
            }`}
          >
            <Camera size={13} />
            {t('ai.tabPhoto')}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* ── Text mode ── */}
          {mode === 'text' && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{t('ai.hint')}</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleParseText();
                }}
                placeholder={t('ai.placeholder')}
                rows={3}
                className="w-full text-sm px-3 py-2.5 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface-2)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-primary)] transition-colors resize-none"
              />
              <button
                onClick={handleParseText}
                disabled={loading || !description.trim()}
                className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {loading ? t('ai.parsing') : t('ai.parse')}
              </button>
            </div>
          )}

          {/* ── Photo mode ── */}
          {mode === 'photo' && (
            <div className="space-y-3">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePickFile}
                className="hidden"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handlePickFile}
                className="hidden"
              />

              {!photo ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{t('ai.photoHint')}</p>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-semibold py-3 rounded-2xl transition-all"
                  >
                    <Camera size={16} />
                    {t('ai.takePhoto')}
                  </button>
                  <button
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 border border-[var(--color-border)] text-[var(--color-text-light)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 text-sm font-semibold py-3 rounded-2xl transition-all"
                  >
                    <ImagePlus size={16} />
                    {t('ai.choosePhoto')}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt="meal"
                    className="w-full max-h-56 object-cover rounded-2xl border border-[var(--color-border)]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setPhoto(null); resetResults(); }}
                      className="flex-1 border border-[var(--color-border)] text-[var(--color-text-light)] text-xs font-semibold py-2.5 rounded-xl hover:bg-[var(--color-surface-2)] transition-all"
                    >
                      {t('ai.retake')}
                    </button>
                    <button
                      onClick={handleParsePhoto}
                      disabled={loading}
                      className="flex-[2] flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-40 text-white text-xs font-semibold py-2.5 rounded-xl transition-all"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      {loading ? t('ai.parsing') : t('ai.analyzePhoto')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-xl">{error}</p>
          )}

          {/* Results */}
          {items.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {items.length} · {Math.round(totalKcal)} ккал
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
                      {item.method && (
                        <select
                          value={item.method}
                          onChange={(e) => changeMethod(idx, e.target.value as CookMethod)}
                          disabled={isAdded}
                          title={t('ai.method')}
                          className="mt-1.5 text-[10px] font-semibold rounded-lg px-2 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-light)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60 cursor-pointer"
                        >
                          {COOK_METHODS.map((m) => (
                            <option key={m} value={m}>
                              {t(`cook.${m}`)}
                            </option>
                          ))}
                        </select>
                      )}
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
