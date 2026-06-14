'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, User as UserIcon, ChevronDown, Flame } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabaseClient';

interface HeaderProps {
  user: any;
  onOpenProfile: () => void;
}

export function Header({ user, onOpenProfile }: HeaderProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = () => supabase.auth.signOut();

  const username = user?.email?.split('@')[0] ?? 'User';

  return (
    <header className="flex items-center justify-between pb-5 mb-5 border-b border-[var(--color-border)] no-print">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-[var(--shadow-glow)]">
          <Flame size={16} strokeWidth={2.5} />
        </div>
        <span className="text-lg font-extrabold tracking-tight text-[var(--color-text)]">
          {t('app.name')}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageToggle />

        {user && (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] text-xs font-semibold text-[var(--color-text-light)] transition-all shadow-sm"
            >
              <UserIcon size={13} className="text-[var(--color-primary)]" />
              <span className="max-w-[80px] truncate hidden sm:inline">{username}</span>
              <ChevronDown size={11} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-[var(--shadow-lg)] border border-gray-100/80 z-40 overflow-hidden py-1">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{t('auth.signedAs')}</p>
                  <p className="text-xs font-bold text-[var(--color-text)] truncate">{user.email}</p>
                </div>

                <button
                  onClick={() => { onOpenProfile(); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[var(--color-text-light)] hover:bg-gray-50 transition-colors"
                >
                  <Settings size={13} className="text-[var(--color-text-muted)]" />
                  {t('diary.editProfile')}
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50/50 border-t border-gray-50 transition-colors"
                >
                  <LogOut size={13} />
                  {t('auth.signOut')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
