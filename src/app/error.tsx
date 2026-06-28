'use client';

// Route-segment error boundary. Catches errors thrown while rendering the page
// (e.g. an unexpected client-side crash) and shows a recoverable fallback
// instead of a blank screen. Note: this does NOT catch errors inside event
// handlers or async API calls — those are handled locally where they occur.

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App route error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center bg-[var(--color-surface)] rounded-[28px] p-8 shadow-[var(--shadow-md)] border border-[var(--color-border)]">
        <h2 className="text-xl font-extrabold text-[var(--color-text)] mb-2">
          Что-то пошло не так
        </h2>
        <p className="text-sm text-[var(--color-text-light)] mb-6">
          Произошла непредвиденная ошибка. Попробуйте ещё раз — ваши данные сохранены.
        </p>
        <button
          onClick={reset}
          className="w-full rounded-2xl bg-[var(--color-primary)] text-white font-semibold py-3 transition active:scale-[0.98]"
        >
          Повторить
        </button>
      </div>
    </div>
  );
}
