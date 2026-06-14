'use client';

import React, { useState } from 'react';
import { CalorieCalculator } from '@/components/CalorieCalculator';
import { MenuBuilder } from '@/components/MenuBuilder';
import { Macros, CalcResult } from '@/lib/nutrition';

export const NutritionApp = () => {
  const [goals, setGoals] = useState<Macros | null>(null);

  return (
    <>
      <CalorieCalculator onResult={(r: CalcResult | null) => setGoals(r ? r.goals : null)} />
      <MenuBuilder goals={goals} />
    </>
  );
};
