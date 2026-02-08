'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, RotateCcw } from 'lucide-react';
import { shoppingList } from '@/data/shopping';

export const ShoppingList = () => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('shopping-list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCheckedItems(new Set(parsed));
      } catch (e) {
        console.error('Failed to parse shopping list', e);
      }
    }
  }, []);

  const handleCheck = (index: number) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setCheckedItems(newSet);
    localStorage.setItem('shopping-list', JSON.stringify(Array.from(newSet)));
  };

  const handleReset = () => {
    if (confirm('Очистить весь список покупок?')) {
      setCheckedItems(new Set());
      localStorage.removeItem('shopping-list');
    }
  };

  const totalItems = shoppingList.length;
  const checkedCount = checkedItems.size;

  const meatItems = shoppingList.filter((item) => item.category === 'meat');
  const groceryItems = shoppingList.filter((item) => item.category === 'groceries');

  return (
    <section className="bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] text-white rounded-2xl p-6 md:p-8 mt-10 shadow-[var(--shadow-lg)] no-print">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <ShoppingCart size={32} />
          Список покупок
        </h2>
        <div className="text-right">
          <div className="text-sm opacity-80">Куплено</div>
          <div className="text-2xl font-bold">
            {checkedCount} / {totalItems}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-6">
        {/* Meat & Dairy */}
        <div>
          <h3 className="font-bold mb-3 uppercase text-sm tracking-wide opacity-90 flex items-center gap-2">
            🥩 Мясо и Молочка
          </h3>
          <ul className="space-y-2">
            {meatItems.map((item, idx) => {
              const globalIdx = shoppingList.indexOf(item);
              const isChecked = checkedItems.has(globalIdx);
              return (
                <li key={globalIdx} className="flex items-start gap-3 group">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheck(globalIdx)}
                    className="w-5 h-5 mt-0.5 cursor-pointer accent-[var(--color-accent)] flex-shrink-0"
                  />
                  <label
                    onClick={() => handleCheck(globalIdx)}
                    className={`cursor-pointer flex-1 transition-all ${
                      isChecked ? 'line-through opacity-60' : 'opacity-100'
                    } ${item.highlighted ? 'font-semibold text-[var(--color-accent-light)]' : ''}`}
                  >
                    {item.name} — {item.amount}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Groceries */}
        <div>
          <h3 className="font-bold mb-3 uppercase text-sm tracking-wide opacity-90 flex items-center gap-2">
            🍚 Бакалея и Овощи
          </h3>
          <ul className="space-y-2">
            {groceryItems.map((item) => {
              const globalIdx = shoppingList.indexOf(item);
              const isChecked = checkedItems.has(globalIdx);
              return (
                <li key={globalIdx} className="flex items-start gap-3 group">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheck(globalIdx)}
                    className="w-5 h-5 mt-0.5 cursor-pointer accent-[var(--color-accent)] flex-shrink-0"
                  />
                  <label
                    onClick={() => handleCheck(globalIdx)}
                    className={`cursor-pointer flex-1 transition-all ${
                      isChecked ? 'line-through opacity-60' : 'opacity-100'
                    } ${item.highlighted ? 'font-semibold text-[var(--color-accent-light)]' : ''}`}
                  >
                    {item.name} — {item.amount}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <button
        onClick={handleReset}
        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 mx-auto font-semibold"
      >
        <RotateCcw size={18} />
        Сбросить всё
      </button>
    </section>
  );
};
