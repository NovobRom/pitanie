import React from 'react';
import { Header } from '@/components/Header';
import { CheatSheet } from '@/components/CheatSheet';
import { DailyMenu } from '@/components/DailyMenu';
import { ShoppingList } from '@/components/ShoppingList';

export default function Home() {
  return (
    <main className="p-2 md:p-6 text-gray-800">
      <div className="max-w-5xl mx-auto">
        <Header />
        <CheatSheet />
        <DailyMenu />
        <ShoppingList />
        <footer className="text-center mt-12 text-gray-400 text-xs mb-10">
          <p>Расчеты приблизительные (±50 ккал). Мясо взвешиваем сырым, крупу сухой.</p>
        </footer>
      </div>
    </main>
  );
}
