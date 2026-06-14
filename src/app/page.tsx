import React from 'react';
import { Header } from '@/components/Header';
import { CheatSheet } from '@/components/CheatSheet';
import { DailyMenu } from '@/components/DailyMenu';
import { ShoppingList } from '@/components/ShoppingList';
import { NutritionApp } from '@/components/NutritionApp';
import { LanguageToggle } from '@/components/LanguageToggle';

export default function Home() {
  return (
    <main className="p-4 md:p-6 text-[var(--color-text)] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-2">
          <LanguageToggle />
        </div>
        <Header />
        <CheatSheet />
        <NutritionApp />
        <DailyMenu />
        <ShoppingList />
        <footer className="text-center mt-16 text-[var(--color-text-muted)] text-xs mb-10">
          <p>Расчеты приблизительные (±50 ккал). Мясо взвешиваем сырым, крупу сухой.</p>
        </footer>
      </div>
    </main>
  );
}
