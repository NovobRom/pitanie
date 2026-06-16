'use client';

import React from 'react';

// Base shimmer block. Sits on the app's warm surfaces, so it uses surface-2 as
// the placeholder tone and Tailwind's built-in pulse animation.
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-[var(--color-surface-2)] ${className}`}
    />
  );
}

// Mirrors the today view (week strip + calorie/macro hero card + a secondary
// card) so there's no layout shift when the real Dashboard takes over.
export function DashboardSkeleton() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto mb-8" aria-hidden="true">
      {/* Week strip */}
      <div className="flex justify-between gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-14 flex-1 rounded-2xl" />
        ))}
      </div>

      {/* Calorie + macro hero card */}
      <div className="bg-[var(--color-surface)] rounded-[28px] p-6 shadow-[var(--shadow-md)] border border-[var(--color-border)] space-y-5">
        <div className="flex items-end justify-between gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Secondary card (trend / micros) */}
      <Skeleton className="h-28 rounded-[28px]" />
    </div>
  );
}

// Mirrors the meal diary: a date row plus a few collapsible meal sections.
export function DiarySkeleton() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto mb-8" aria-hidden="true">
      <Skeleton className="h-12 w-full rounded-2xl" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--color-surface)] rounded-[24px] p-5 shadow-[var(--shadow-sm)] border border-[var(--color-border)] space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-14" />
          </div>
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
