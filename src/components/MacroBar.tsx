'use client';

import React from 'react';

interface MacroBarProps {
  label: string;
  unit: string;
  value: number;
  goal: number;
  barColor: string;
  textColor: string;
}

export const MacroBar = ({ label, unit, value, goal, barColor, textColor }: MacroBarProps) => {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const over = value > goal;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-[var(--color-text-muted)]">{label}</span>
        <span className={`font-bold ${over ? 'text-red-500' : textColor}`}>
          {value} / {goal} {unit}
        </span>
      </div>
      <div className="h-2.5 bg-[var(--color-border)] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
