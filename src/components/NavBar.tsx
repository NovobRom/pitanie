'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, User } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function NavBar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    {
      href: '/',
      label: t('diary.tabDashboard') || 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/diary',
      label: t('diary.tabDiary') || 'Diary',
      icon: Calendar,
    },
    {
      href: '/profile',
      label: t('diary.tabProfile') || 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 py-2 px-6 flex justify-around items-center z-50 no-print max-w-4xl mx-auto md:rounded-t-3xl md:shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
            className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl transition-all duration-200 ${
              isActive
                ? 'text-[var(--color-primary)] font-bold bg-[var(--color-primary)]/10 scale-105'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
