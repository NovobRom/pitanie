'use client';

import React, { useEffect, useState } from 'react';
import { Share2, Check, RotateCcw } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { CalorieCalculator } from '@/components/CalorieCalculator';
import { MealPlanGenerator } from '@/components/MealPlanGenerator';
import { MenuBuilder, BuilderSeedItem } from '@/components/MenuBuilder';
import { Macros, CalcParams, CalcResult } from '@/lib/nutrition';
import { encodeState, decodeState } from '@/lib/shareState';

const STORAGE_KEY = 'pitanie.state';

export const NutritionApp = () => {
  const { t } = useI18n();

  const [booted, setBooted] = useState(false);
  // Bump to remount the calculator + builder with freshly hydrated initial values.
  const [bootKey, setBootKey] = useState(0);
  // Separate counter for the generator → builder handoff remount.
  const [seedKey, setSeedKey] = useState(0);

  const [initialParams, setInitialParams] = useState<Partial<CalcParams> | undefined>();
  const [initialItems, setInitialItems] = useState<BuilderSeedItem[] | undefined>();

  const [params, setParams] = useState<CalcParams | undefined>();
  const [items, setItems] = useState<BuilderSeedItem[]>([]);
  const [goals, setGoals] = useState<Macros | null>(null);

  const [copied, setCopied] = useState(false);

  // ── Hydrate on mount: shared URL hash wins, otherwise localStorage ──────────
  useEffect(() => {
    let loaded = null;
    const match = window.location.hash.match(/plan=([^&]+)/);
    if (match) loaded = decodeState(decodeURIComponent(match[1]));
    if (!loaded) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) loaded = decodeState(saved);
    }
    // One-time hydration from external storage; intentional mount-time sync.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (loaded) {
      setInitialParams(loaded.params);
      setInitialItems(loaded.items);
    }
    setBooted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // ── Persist on change ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!booted) return;
    localStorage.setItem(STORAGE_KEY, encodeState({ v: 1, params, items }));
  }, [params, items, booted]);

  const handleCalc = (p: CalcParams, r: CalcResult | null) => {
    setParams(p);
    setGoals(r ? r.goals : null);
  };

  const sendToBuilder = (next: BuilderSeedItem[]) => {
    setInitialItems(next);
    setSeedKey((k) => k + 1);
    requestAnimationFrame(() => {
      document.getElementById('menu-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const share = async () => {
    const enc = encodeState({ v: 1, params, items });
    const url = `${window.location.origin}${window.location.pathname}#plan=${enc}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard may be unavailable; the hash below still makes the URL shareable.
    }
    window.history.replaceState(null, '', `#plan=${enc}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.history.replaceState(null, '', window.location.pathname);
    setInitialParams(undefined);
    setInitialItems(undefined);
    setParams(undefined);
    setItems([]);
    setGoals(null);
    setBootKey((k) => k + 1);
  };

  if (!booted) return null;

  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-4 no-print">
        <span className="text-[10px] text-[var(--color-text-muted)] mr-auto">{t('share.saved')}</span>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-3 py-2 rounded-lg transition-all"
        >
          <RotateCcw size={14} />
          {t('share.reset')}
        </button>
        <button
          onClick={share}
          className="flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-[var(--shadow-sm)]"
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
          {copied ? t('share.copied') : t('share.copy')}
        </button>
      </div>

      <CalorieCalculator key={`calc-${bootKey}`} initialParams={initialParams} onChange={handleCalc} />
      <MealPlanGenerator goals={goals} onSendToBuilder={sendToBuilder} />
      <div id="menu-builder">
        <MenuBuilder
          key={`build-${bootKey}-${seedKey}`}
          goals={goals}
          initialItems={initialItems}
          onItemsChange={setItems}
        />
      </div>
    </>
  );
};
