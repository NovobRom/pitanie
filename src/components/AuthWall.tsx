'use client';

import React from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MarketingPanel } from './auth/MarketingPanel';
import { AuthForm } from './auth/AuthForm';

export function AuthWall() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col lg:flex-row relative">
      {/* Controls - absolute in top right */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <MarketingPanel />
      <AuthForm />
    </div>
  );
}
