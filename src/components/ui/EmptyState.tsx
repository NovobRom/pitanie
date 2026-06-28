import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 glass-card rounded-3xl border border-gray-100/50 max-w-sm mx-auto my-4 animate-scale-in">
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-4 shadow-sm">
        <Icon size={28} className="stroke-[1.5px]" />
      </div>
      <h3 className="font-bold text-base text-[var(--color-text)] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[var(--color-text-muted)] max-w-[240px] leading-relaxed mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-bold px-4 py-2.5 rounded-xl btn-interactive shadow-sm cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
