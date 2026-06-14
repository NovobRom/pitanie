'use client';

import React, { useState } from 'react';
import { X, Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useI18n } from '@/lib/i18n';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : '' },
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-lg)] w-full max-w-sm mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Mail size={20} className="text-[var(--color-primary)]" />
          <h2 className="text-base font-semibold text-[var(--color-text)]">{t('auth.signIn')}</h2>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mb-5">{t('auth.loginPrompt')}</p>

        {sent ? (
          <p className="text-sm text-[var(--color-primary)] font-medium text-center py-4">
            {t('auth.sent')}
          </p>
        ) : (
          <>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
              {t('auth.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] px-3 py-2 mb-3 outline-none focus:border-[var(--color-primary)] transition-colors"
            />
            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
            <button
              onClick={send}
              disabled={loading || !email.trim()}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? t('auth.sending') : t('auth.send')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
