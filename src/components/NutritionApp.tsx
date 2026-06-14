'use client';

import React, { useEffect, useState } from 'react';
import { Share2, Check, RotateCcw, Loader2, LogIn } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { useI18n } from '@/lib/i18n';
import { CalorieCalculator } from '@/components/CalorieCalculator';
import { MealPlanGenerator } from '@/components/MealPlanGenerator';
import { MenuBuilder, BuilderSeedItem } from '@/components/MenuBuilder';
import { AuthModal } from '@/components/AuthModal';
import { UserMenu } from '@/components/UserMenu';
import { Macros, CalcParams, CalcResult } from '@/lib/nutrition';
import { encodeState, decodeState, ShareState } from '@/lib/shareState';
import { createSharedPlan, getSharedPlan } from '@/lib/cloud';
import { supabase } from '@/lib/supabaseClient';

const STORAGE_KEY = 'pitanie.state';

export const NutritionApp = () => {
  const { t } = useI18n();

  const [booted, setBooted] = useState(false);
  const [bootKey, setBootKey] = useState(0);
  const [seedKey, setSeedKey] = useState(0);

  const [initialParams, setInitialParams] = useState<Partial<CalcParams> | undefined>();
  const [initialItems, setInitialItems] = useState<BuilderSeedItem[] | undefined>();

  const [params, setParams] = useState<CalcParams | undefined>();
  const [items, setItems] = useState<BuilderSeedItem[]>([]);
  const [goals, setGoals] = useState<Macros | null>(null);

  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ── Auth session ────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Hydrate on mount: cloud link › shared URL hash › localStorage ────────
  useEffect(() => {
    (async () => {
      let loaded: ShareState | null = null;
      const cloudMatch = window.location.hash.match(/cloud=([^&]+)/);
      const planMatch = window.location.hash.match(/plan=([^&]+)/);
      if (cloudMatch) loaded = await getSharedPlan(decodeURIComponent(cloudMatch[1]));
      if (!loaded && planMatch) loaded = decodeState(decodeURIComponent(planMatch[1]));
      if (!loaded) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) loaded = decodeState(saved);
      }
      if (loaded) applyState(loaded);
      setBooted(true);
    })();
  }, []);

  // ── Persist on change ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!booted) return;
    localStorage.setItem(STORAGE_KEY, encodeState({ v: 1, params, items }));
  }, [params, items, booted]);

  const applyState = (loaded: ShareState) => {
    setInitialParams(loaded.params);
    setInitialItems(loaded.items);
    setBootKey((k) => k + 1);
  };

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
    const state: ShareState = { v: 1, params, items };
    const base = `${window.location.origin}${window.location.pathname}`;

    setSharing(true);
    const id = await createSharedPlan('', state);
    setSharing(false);

    const hash = id ? `#cloud=${id}` : `#plan=${encodeState(state)}`;
    const url = `${base}${hash}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard may be unavailable; the hash below still makes the URL shareable.
    }
    window.history.replaceState(null, '', hash);
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

        {user ? (
          <UserMenu user={user} onOpenPlan={applyState} />
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-3 py-2 rounded-lg transition-all"
          >
            <LogIn size={14} />
            {t('auth.signIn')}
          </button>
        )}

        <button
          onClick={share}
          disabled={sharing}
          className="flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-[var(--shadow-sm)]"
        >
          {sharing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : copied ? (
            <Check size={14} />
          ) : (
            <Share2 size={14} />
          )}
          {copied ? t('share.copied') : t('share.copy')}
        </button>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

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
