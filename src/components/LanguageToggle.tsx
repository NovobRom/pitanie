'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useI18n, Lang } from '@/lib/i18n';

export const LanguageToggle = () => {
  const { lang, setLang, t } = useI18n();

  const langs: Lang[] = ['ru', 'en', 'uk'];

  return (
    <div
      className="no-print inline-flex items-center gap-1 bg-[var(--color-surface)] rounded-full p-1 shadow-[var(--shadow-sm)] border border-[var(--color-border)]"
      title={t('lang.label')}
    >
      <Languages size={15} className="text-[var(--color-text-muted)] ml-1.5" />
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase transition-all ${
            lang === l
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
};
