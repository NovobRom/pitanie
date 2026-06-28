import React from 'react';
import { Flame, Sparkles, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function MarketingPanel() {
  const { t } = useI18n();

  return (
    <div className="w-full lg:w-[55%] bg-gradient-to-br from-[#f0f9ef] via-[#fafaf7] to-[#eef6ff] p-8 md:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-100 shrink-0">
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#7c9885_1.2px,transparent_1.2px)] [background-size:24px_24px]"></div>
      
      {/* Logo and Brand */}
      <div className="flex items-center gap-3 relative z-10 mb-12 lg:mb-0">
        <div className="w-11 h-11 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20">
          <Flame className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-[var(--color-primary-dark)] tracking-tight">
            {t('auth.welcome').replace('v4', '')}
          </h1>
          <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">v4.0 Apple Health Edition</p>
        </div>
      </div>

      {/* Marketing Cards */}
      <div className="max-w-lg w-full mx-auto relative z-10 space-y-6 my-auto py-8 lg:py-0">
        
        {/* Card 1: Dashboard */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-300 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[var(--color-accent)] flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[var(--color-text)]">
              {t('auth.marketing1.title')}
            </h3>
            <p className="text-xs text-[var(--color-text-light)] leading-relaxed">
              {t('auth.marketing1.desc')}
            </p>
          </div>
        </div>

        {/* Card 2: Food Diary */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-300 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#fff0f7] text-[var(--color-liza)] flex items-center justify-center shrink-0">
            <Flame size={18} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[var(--color-text)]">
              {t('auth.marketing2.title')}
            </h3>
            <p className="text-xs text-[var(--color-text-light)] leading-relaxed">
              {t('auth.marketing2.desc')}
            </p>
          </div>
        </div>

        {/* Card 3: Cloud Sync */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-300 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[var(--color-roman)] flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[var(--color-text)]">
              {t('auth.marketing3.title')}
            </h3>
            <p className="text-xs text-[var(--color-text-light)] leading-relaxed">
              {t('auth.marketing3.desc')}
            </p>
          </div>
        </div>

      </div>

      {/* Footer info */}
      <div className="text-[10px] text-[var(--color-text-muted)] text-center lg:text-left relative z-10 mt-12 lg:mt-0">
        © {new Date().getFullYear()} Pitanie. All rights reserved. Clinical & wellness tracker.
      </div>
    </div>
  );
}
