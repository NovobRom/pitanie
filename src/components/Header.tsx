'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { goals } from '@/data/goals';

export const Header = () => {
  return (
    <header className="text-center mb-10">
      <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-6 tracking-tight">
        🍎 План Питания
      </h1>

      {/* Goals Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
        {/* Roman's Card */}
        <div className="group relative bg-gradient-to-br from-[var(--color-roman-bg)] to-white border-2 border-[var(--color-roman)] border-opacity-30 rounded-2xl p-6 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-[var(--color-roman)] text-white flex items-center justify-center text-2xl font-bold shadow-md">
              Р
            </div>
            <div className="text-left">
              <h2 className="font-bold text-[var(--color-roman)] text-xl">Роман</h2>
              <p className="text-xs text-[var(--color-text-muted)]">Твоя норма</p>
            </div>
          </div>

          <div className="text-4xl font-extrabold text-[var(--color-roman)] mb-2">
            {goals.roman.calories}
            <span className="text-lg font-normal ml-1 text-[var(--color-text-light)]">ккал</span>
          </div>

          <div className="flex justify-around text-xs font-mono bg-white bg-opacity-60 rounded-lg p-2 mt-3">
            <div className="text-center">
              <div className="font-bold text-[var(--color-roman)]">{goals.roman.protein}г</div>
              <div className="text-[var(--color-text-muted)]">Белки</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-[var(--color-roman)]">{goals.roman.fat}г</div>
              <div className="text-[var(--color-text-muted)]">Жиры</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-[var(--color-roman)]">{goals.roman.carbs}г</div>
              <div className="text-[var(--color-text-muted)]">Углеводы</div>
            </div>
          </div>
        </div>

        {/* Liza's Card */}
        <div className="group relative bg-gradient-to-br from-[var(--color-liza-bg)] to-white border-2 border-[var(--color-liza)] border-opacity-30 rounded-2xl p-6 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-[var(--color-liza)] text-white flex items-center justify-center text-2xl font-bold shadow-md">
              Л
            </div>
            <div className="text-left">
              <h2 className="font-bold text-[var(--color-liza)] text-xl">Лиза</h2>
              <p className="text-xs text-[var(--color-text-muted)]">Твоя норма</p>
            </div>
          </div>

          <div className="text-4xl font-extrabold text-[var(--color-liza)] mb-2">
            {goals.liza.calories}
            <span className="text-lg font-normal ml-1 text-[var(--color-text-light)]">ккал</span>
          </div>

          <div className="flex justify-around text-xs font-mono bg-white bg-opacity-60 rounded-lg p-2 mt-3">
            <div className="text-center">
              <div className="font-bold text-[var(--color-liza)]">{goals.liza.protein}г</div>
              <div className="text-[var(--color-text-muted)]">Белки</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-[var(--color-liza)]">{goals.liza.fat}г</div>
              <div className="text-[var(--color-text-muted)]">Жиры</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-[var(--color-liza)]">{goals.liza.carbs}г</div>
              <div className="text-[var(--color-text-muted)]">Углеводы</div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="no-print bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-6 py-3 rounded-xl transition-all shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] flex items-center gap-2 mx-auto font-semibold"
      >
        <Printer size={18} />
        Распечатать план
      </button>
    </header>
  );
};
