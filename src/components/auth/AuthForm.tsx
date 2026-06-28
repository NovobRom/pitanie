import React, { useState } from 'react';
import { Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabaseClient';

export function AuthForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });
        if (err) {
          setError(err.message);
        }
      } else {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });
        if (err) {
          setError(err.message);
        } else {
          setSuccessMsg(t('auth.confirmEmailPrompt'));
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setError('');
    setSuccessMsg('');
    setPassword('');
  };

  return (
    <div className="w-full lg:w-[45%] bg-white p-8 md:p-16 flex flex-col justify-center shadow-xl lg:shadow-2xl relative">
      <div className="max-w-md w-full mx-auto space-y-8">
        
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold text-[var(--color-text)] tracking-tight">
            {mode === 'login' ? t('auth.signIn') : t('auth.signUp')}
          </h2>
          <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
            {t('auth.loginPrompt')}
          </p>
        </div>

        {successMsg ? (
          <div className="bg-[#f0f9ef] p-6 rounded-3xl border border-[var(--color-primary)]/10 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center mx-auto shadow-md shadow-[var(--color-primary)]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[var(--color-primary-dark)]">
                {successMsg}
              </p>
            </div>
            <button
              onClick={toggleMode}
              className="text-xs font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
            >
              {t('auth.haveAccount')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[var(--color-text-light)] uppercase tracking-wider">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 text-sm text-[var(--color-text)] pl-11 pr-4 py-3.5 outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[var(--color-text-light)] uppercase tracking-wider">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 text-sm text-[var(--color-text)] pl-11 pr-4 py-3.5 outline-none focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all shadow-sm"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-4 rounded-2xl border border-red-100 font-medium">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-40 text-white text-sm font-bold px-4 py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg shadow-[var(--color-primary)]/10 hover:shadow-[var(--color-primary)]/20 cursor-pointer"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Lock size={16} />
              )}
              {loading
                ? (mode === 'login' ? t('auth.sending') : t('auth.registering'))
                : (mode === 'login' ? t('auth.signIn') : t('auth.signUp'))}
            </button>

            {/* Toggle Mode */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={toggleMode}
                className="text-xs font-semibold text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
              >
                {mode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
