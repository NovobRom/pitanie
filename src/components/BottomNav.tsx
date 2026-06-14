'use client';

import React from 'react';
import { Sun, BookOpen, User } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export type Tab = 'today' | 'diary' | 'profile';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { t } = useI18n();

  const tabs: { id: Tab; icon: React.ElementType; labelKey: string }[] = [
    { id: 'today', icon: Sun, labelKey: 'nav.today' },
    { id: 'diary', icon: BookOpen, labelKey: 'nav.diary' },
    { id: 'profile', icon: User, labelKey: 'nav.profile' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 no-print"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-around py-1">
        {tabs.map(({ id, icon: Icon, labelKey }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex flex-col items-center gap-0.5 px-5 py-2.5 flex-1 cursor-pointer transition-all"
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={22}
                className={`transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={`text-[10px] font-semibold tracking-wide transition-colors ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                }`}
              >
                {t(labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
