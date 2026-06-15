'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useI18n } from '@/lib/i18n';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  return (
    <div
      className="no-print inline-flex items-center gap-1 bg-[var(--color-surface)] rounded-full p-1 shadow-[var(--shadow-sm)] border border-[var(--color-border)]"
      title={t('theme.label')}
    >
      <button
        onClick={() => setTheme('light')}
        aria-label={t('theme.light')}
        className={`flex items-center justify-center w-7 h-7 rounded-full transition-all ${
          theme === 'light'
            ? 'bg-[var(--color-primary)] text-white shadow-sm'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
        }`}
      >
        <Sun size={14} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        aria-label={t('theme.dark')}
        className={`flex items-center justify-center w-7 h-7 rounded-full transition-all ${
          theme === 'dark'
            ? 'bg-[var(--color-primary)] text-white shadow-sm'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
        }`}
      >
        <Moon size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
};
