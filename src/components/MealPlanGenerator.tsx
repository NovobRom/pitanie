'use client';

import React, { useState } from 'react';
import { Wand2, RefreshCw, Leaf, ArrowDownToLine, Sunrise, Sun, Moon } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Macros, FoodProduct } from '@/lib/nutrition';
import { foodName, formatAmount } from '@/lib/foodCatalog';
import { generatePlan, GeneratedPlan, MealType } from '@/lib/mealGenerator';
import { MacroBar } from '@/components/MacroBar';
import { BuilderSeedItem } from '@/components/MenuBuilder';

interface Props {
  goals: Macros | null;
  onSendToBuilder: (items: BuilderSeedItem[]) => void;
}

const MEAL_ICON: Record<MealType, React.ReactNode> = {
  breakfast: <Sunrise size={18} className="text-[var(--color-accent-dark)]" />,
  lunch: <Sun size={18} className="text-[var(--color-primary-dark)]" />,
  dinner: <Moon size={18} className="text-[var(--color-liza)]" />,
};

export const MealPlanGenerator = ({ goals, onSendToBuilder }: Props) => {
  const { t, lang } = useI18n();
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [vegetarian, setVegetarian] = useState(false);

  const generate = () => {
    if (!goals) return;
    setPlan(generatePlan(goals, { vegetarian }));
  };

  const sendToBuilder = () => {
    if (!plan) return;
    const items: BuilderSeedItem[] = plan.meals.flatMap((m) =>
      m.items.map((it) => ({
        product: {
          product_name: foodName(it.food, lang),
          nutriments: {
            'energy-kcal_100g': it.food.per100.kcal,
            proteins_100g: it.food.per100.protein,
            fat_100g: it.food.per100.fat,
            carbohydrates_100g: it.food.per100.carbs,
          },
        } as FoodProduct,
        grams: it.grams,
      })),
    );
    onSendToBuilder(items);
  };

  return (
    <section className="bg-white rounded-2xl shadow-[var(--shadow-lg)] p-6 mb-10 border border-[var(--color-border)]">
      <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1 flex items-center gap-3">
        <Wand2 size={28} className="text-[var(--color-primary-dark)]" />
        {t('gen.title')}
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] mb-5 ml-10">{t('gen.subtitle')}</p>

      {!goals ? (
        <p className="text-center text-[var(--color-text-muted)] text-sm py-6 bg-[var(--color-bg)] rounded-xl border border-dashed border-[var(--color-border)]">
          {t('gen.needGoal')}
        </p>
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              onClick={generate}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[var(--shadow-md)] flex items-center gap-2"
            >
              {plan ? <RefreshCw size={16} /> : <Wand2 size={16} />}
              {plan ? t('gen.regenerate') : t('gen.generate')}
            </button>

            <label className="flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={vegetarian}
                onChange={(e) => setVegetarian(e.target.checked)}
                className="accent-[var(--color-primary)] w-4 h-4"
              />
              <Leaf size={15} className="text-[var(--color-primary)]" />
              {t('gen.vegetarian')}
            </label>

            {plan && (
              <button
                onClick={sendToBuilder}
                className="ml-auto bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-[var(--color-text)] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              >
                <ArrowDownToLine size={16} />
                {t('gen.toBuilder')}
              </button>
            )}
          </div>

          {plan && (
            <>
              {/* Meal cards */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {plan.meals.map((meal) => (
                  <div
                    key={meal.meal}
                    className="bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm text-[var(--color-text)] flex items-center gap-2">
                        {MEAL_ICON[meal.meal]}
                        {t(`gen.meal.${meal.meal}`)}
                      </h3>
                      <span className="text-xs font-bold text-[var(--color-accent-dark)]">
                        {meal.macros.calories} {t('calc.kcal')}
                      </span>
                    </div>

                    <ul className="space-y-1.5 mb-3">
                      {meal.items.map((it, i) => (
                        <li key={i} className="flex justify-between text-xs gap-2">
                          <span className="text-[var(--color-text)]">{foodName(it.food, lang)}</span>
                          <span className="font-semibold text-[var(--color-text-light)] whitespace-nowrap">
                            {formatAmount(it.food, it.grams, lang)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="text-[10px] text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-2">
                      {meal.macros.protein}
                      {t('calc.g')} {t('build.protShort')} · {meal.macros.fat}
                      {t('calc.g')} {t('build.fatShort')} · {meal.macros.carbs}
                      {t('calc.g')} {t('build.carbShort')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Match to target */}
              <div className="bg-[var(--color-bg)] rounded-xl p-5 border border-[var(--color-border)]">
                <h3 className="font-semibold text-[var(--color-text)] text-sm mb-4">{t('gen.match')}</h3>
                <div className="space-y-3">
                  <MacroBar
                    label={t('calc.calories')}
                    unit={t('calc.kcal')}
                    value={plan.totals.calories}
                    goal={goals.calories}
                    barColor="bg-[var(--color-accent)]"
                    textColor="text-[var(--color-accent-dark)]"
                  />
                  <MacroBar
                    label={t('calc.protein')}
                    unit={t('calc.g')}
                    value={plan.totals.protein}
                    goal={goals.protein}
                    barColor="bg-[var(--color-roman)]"
                    textColor="text-[var(--color-roman)]"
                  />
                  <MacroBar
                    label={t('calc.fat')}
                    unit={t('calc.g')}
                    value={plan.totals.fat}
                    goal={goals.fat}
                    barColor="bg-[var(--color-liza)]"
                    textColor="text-[var(--color-liza)]"
                  />
                  <MacroBar
                    label={t('calc.carbs')}
                    unit={t('calc.g')}
                    value={plan.totals.carbs}
                    goal={goals.carbs}
                    barColor="bg-[var(--color-primary)]"
                    textColor="text-[var(--color-primary-dark)]"
                  />
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] text-center mt-4">
                  {t('gen.hint')}
                </p>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
};
