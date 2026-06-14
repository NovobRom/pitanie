'use client';

import React, { useEffect, useRef, useState } from 'react';
import { User, LogOut, BookOpen, Trash2, ChevronDown } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { listMyPlans, SavedPlan } from '@/lib/cloud';
import { useI18n } from '@/lib/i18n';
import { ShareState } from '@/lib/shareState';

interface UserMenuProps {
  user: SupabaseUser;
  onOpenPlan: (state: ShareState) => void;
}

export function UserMenu({ user, onOpenPlan }: UserMenuProps) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listMyPlans().then((p) => {
      setPlans(p);
      setLoading(false);
    });
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const deletePlan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from('plans').delete().eq('id', id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const label = user.email?.split('@')[0] ?? 'Me';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-3 py-2 rounded-lg transition-all"
      >
        <User size={14} />
        <span className="max-w-[80px] truncate">{label}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-lg)] border border-[var(--color-border)] z-40 overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <p className="text-[10px] text-[var(--color-text-muted)]">{t('auth.signedAs')}</p>
            <p className="text-xs font-medium text-[var(--color-text)] truncate">{user.email}</p>
          </div>

          <div className="px-4 py-2 border-b border-[var(--color-border)]">
            <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
              {t('auth.myPlans')}
            </p>
            {loading ? (
              <p className="text-xs text-[var(--color-text-muted)] py-1">…</p>
            ) : plans.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)] py-1">{t('auth.noPlans')}</p>
            ) : (
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {plans.map((plan) => (
                  <li key={plan.id} className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onOpenPlan(plan.data);
                        setOpen(false);
                      }}
                      className="flex items-center gap-1.5 flex-1 min-w-0 text-left text-xs py-1 text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      <BookOpen size={12} className="shrink-0 text-[var(--color-text-muted)]" />
                      <span className="truncate">
                        {plan.title || t('auth.planTitle', { date: formatDate(plan.created_at) })}
                      </span>
                      <span className="text-[var(--color-text-muted)] ml-auto shrink-0">
                        {formatDate(plan.created_at)}
                      </span>
                    </button>
                    <button
                      onClick={(e) => deletePlan(plan.id, e)}
                      className="shrink-0 text-[var(--color-text-muted)] hover:text-red-500 transition-colors p-0.5"
                    >
                      <Trash2 size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-2 px-4 py-3 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors"
          >
            <LogOut size={14} />
            {t('auth.signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
