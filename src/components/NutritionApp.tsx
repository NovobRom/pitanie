'use client';

import React, { useState } from 'react';
import { CalorieCalculator } from '@/components/CalorieCalculator';
import { MealPlanGenerator } from '@/components/MealPlanGenerator';
import { MenuBuilder, BuilderSeedItem } from '@/components/MenuBuilder';
import { Macros, CalcResult } from '@/lib/nutrition';

export const NutritionApp = () => {
  const [goals, setGoals] = useState<Macros | null>(null);
  const [seedItems, setSeedItems] = useState<BuilderSeedItem[] | undefined>(undefined);
  // Bump to remount MenuBuilder with a freshly-seeded ration.
  const [seedKey, setSeedKey] = useState(0);

  const sendToBuilder = (items: BuilderSeedItem[]) => {
    setSeedItems(items);
    setSeedKey((k) => k + 1);
    // Scroll the builder into view so the handoff is visible.
    requestAnimationFrame(() => {
      document.getElementById('menu-builder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <>
      <CalorieCalculator onResult={(r: CalcResult | null) => setGoals(r ? r.goals : null)} />
      <MealPlanGenerator goals={goals} onSendToBuilder={sendToBuilder} />
      <div id="menu-builder">
        <MenuBuilder key={seedKey} goals={goals} initialItems={seedItems} />
      </div>
    </>
  );
};
