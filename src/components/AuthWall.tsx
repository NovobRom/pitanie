'use client';

import React from 'react';
import { LanguageToggle } from '@/components/LanguageToggle';
import { MarketingPanel } from './auth/MarketingPanel';
import { AuthForm } from './auth/AuthForm';

export function AuthWall() {
  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col lg:flex-row relative">
      {/* Language Toggle - absolute in top right */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageToggle />
      </div>

      <MarketingPanel />
      <AuthForm />
    </div>
  );
}
