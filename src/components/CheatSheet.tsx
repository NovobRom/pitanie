'use client';

import React from 'react';
import { Scale } from 'lucide-react';
import { products, productsNote } from '@/data/products';

export const CheatSheet = () => {
  return (
    <section className="bg-gradient-to-br from-[var(--color-primary-light)] to-[var(--color-secondary)] rounded-2xl shadow-[var(--shadow-lg)] p-6 mb-10 border border-[var(--color-primary)]">
      <h2 className="text-2xl font-bold text-[var(--color-primary-dark)] mb-5 flex items-center gap-3">
        <Scale size={28} className="text-[var(--color-primary-dark)]" />
        Общая база на день (Сырой вес)
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {products.map((product, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-xl p-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all ${
              product.highlighted ? 'ring-2 ring-[var(--color-accent)]' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">{product.emoji}</div>
              <div className="flex-1">
                <h3
                  className={`font-semibold text-sm mb-2 ${
                    product.highlighted ? 'text-[var(--color-accent-dark)]' : 'text-[var(--color-text)]'
                  }`}
                >
                  {product.name}
                </h3>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-roman)] font-medium">👨 Роман:</span>
                    <span className="font-bold text-[var(--color-roman)]">{product.roman}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-liza)] font-medium">👩 Лиза:</span>
                    <span className="font-bold text-[var(--color-liza)]">{product.liza}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--color-text-muted)] bg-white bg-opacity-60 p-3 rounded-lg">
        {productsNote}
      </p>
    </section>
  );
};
