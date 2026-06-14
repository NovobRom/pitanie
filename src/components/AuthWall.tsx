'use client';

import React, { useState } from 'react';
import { Mail, Loader2, Apple, Activity, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useI18n } from '@/lib/i18n';
import { LanguageToggle } from '@/components/LanguageToggle';

export function AuthWall() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : '',
        },
      });
      if (err) {
        setError(err.message);
      } else {
        setSent(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col md:flex-row">
      {/* Language Toggle in Corner */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>

      {/* Left side: Premium Marketing Widgets / App Promo */}
      <div className="flex-1 bg-gradient-to-tr from-[var(--color-primary-light)] to-[var(--color-bg)] p-8 md:p-16 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#7c9885_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-md mx-auto relative z-10 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-md">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-[var(--color-primary-dark)] tracking-tight">
                {t('auth.welcome')}
              </h1>
              <p className="text-sm text-[var(--color-text-light)]">v4.0.0 (Apple Health Style)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-[var(--color-primary)]/10 shadow-md">
              <p className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                {t('auth.marketing1')}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-[var(--color-primary)]/10 shadow-md">
              <p className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                {t('auth.marketing2')}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-[var(--color-primary)]/10 shadow-md">
              <p className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-2">
                {t('auth.marketing3')}
              </p>
            </div>
          </div>

          {/* Aesthetic Mockup */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
                <Flame size={18} />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Calories Goal</p>
                <p className="text-lg font-bold text-[var(--color-text)]">2,000 kcal</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="w-2.5 h-8 bg-blue-100 rounded-full block"></span>
              <span className="w-2.5 h-12 bg-pink-200 rounded-full block"></span>
              <span className="w-2.5 h-10 bg-green-200 rounded-full block"></span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 bg-white p-8 md:p-16 flex flex-col justify-center shadow-2xl">
        <div className="max-w-sm w-full mx-auto space-y-6">
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">{t('auth.signIn')}</h2>
            <p className="text-sm text-[var(--color-text-muted)]">{t('auth.loginPrompt')}</p>
          </div>

          {sent ? (
            <div className="bg-[var(--color-primary)]/10 p-6 rounded-2xl border border-[var(--color-primary)]/20 text-center space-y-3">
              <Mail className="w-8 h-8 text-[var(--color-primary)] mx-auto" />
              <p className="text-sm font-semibold text-[var(--color-primary-dark)]">
                {t('auth.sent')}
              </p>
            </div>
          ) : (
            <form onSubmit={sendMagicLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-light)] mb-1 uppercase tracking-wider">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-[var(--color-text)] px-4 py-3 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all shadow-sm"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? t('auth.sending') : t('auth.send')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
