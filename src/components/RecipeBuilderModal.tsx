'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, ChefHat, Loader2, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { aiPost } from '@/lib/aiFetch';
import { saveRecipe, RecipeItem } from '@/lib/cloud';

interface RecipeBuilderModalProps {
  onClose: () => void;
  onSaved: () => void;
}

interface IngredientDraft {
  id: number;
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

let nextId = 1;
const newDraft = (): IngredientDraft => ({
  id: nextId++,
  name: '',
  grams: 100,
  kcal: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  fiber: 0,
});

export function RecipeBuilderModal({ onClose, onSaved }: RecipeBuilderModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [servingG, setServingG] = useState(100);
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([newDraft()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [aiDish, setAiDish] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Ask the AI to decompose a named dish into editable ingredient drafts.
  const handleAiFill = async () => {
    const dish = aiDish.trim();
    if (!dish) return;
    setAiLoading(true);
    setError('');
    try {
      const res = await aiPost('/api/ai-recipe', { dish });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error === 'rate_limited' ? t('ai.rateLimited') : t('ai.error'));
        return;
      }
      const recipe = data.recipe;
      if (!recipe?.items?.length) {
        setError(t('ai.empty'));
        return;
      }
      if (!name.trim() && recipe.name) setName(recipe.name);
      if (recipe.serving_g) setServingG(recipe.serving_g);
      setIngredients(
        recipe.items.map((it: RecipeItem): IngredientDraft => ({
          id: nextId++,
          name: it.name,
          grams: it.grams,
          kcal: it.kcal,
          protein: it.protein,
          fat: it.fat,
          carbs: it.carbs,
          fiber: it.fiber ?? 0,
        }))
      );
    } catch {
      setError(t('ai.error'));
    } finally {
      setAiLoading(false);
    }
  };

  const updateIngredient = (id: number, field: keyof IngredientDraft, value: string | number) => {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing))
    );
  };

  const removeIngredient = (id: number) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  // Compute totals and per-100g macros
  const totals = ingredients.reduce(
    (acc, ing) => {
      const f = ing.grams / 100;
      return {
        totalGrams: acc.totalGrams + ing.grams,
        kcal: acc.kcal + ing.kcal * f,
        protein: acc.protein + ing.protein * f,
        fat: acc.fat + ing.fat * f,
        carbs: acc.carbs + ing.carbs * f,
        fiber: acc.fiber + ing.fiber * f,
      };
    },
    { totalGrams: 0, kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 }
  );

  const scale = totals.totalGrams > 0 ? 100 / totals.totalGrams : 0;
  const per100: Omit<typeof totals, 'totalGrams'> = {
    kcal: totals.kcal * scale,
    protein: totals.protein * scale,
    fat: totals.fat * scale,
    carbs: totals.carbs * scale,
    fiber: totals.fiber * scale,
  };

  const handleSave = async () => {
    if (!name.trim()) { setError(t('recipe.name')); return; }
    const validItems = ingredients.filter((i) => i.name.trim() && i.grams > 0);
    if (validItems.length === 0) { setError(t('recipe.noIngredients')); return; }

    setSaving(true);
    setError('');

    const items: RecipeItem[] = validItems.map(({ name, grams, kcal, protein, fat, carbs, fiber }) => ({
      name, grams, kcal, protein, fat, carbs, fiber: fiber || undefined,
    }));

    const ok = await saveRecipe({
      name: name.trim(),
      serving_g: servingG,
      items,
      kcal: Math.round(per100.kcal * 10) / 10,
      protein: Math.round(per100.protein * 10) / 10,
      fat: Math.round(per100.fat * 10) / 10,
      carbs: Math.round(per100.carbs * 10) / 10,
      fiber: Math.round(per100.fiber * 10) / 10,
    });

    setSaving(false);
    if (ok) { onSaved(); onClose(); }
    else setError('Failed to save');
  };

  const r = (n: number) => Math.round(n * 10) / 10;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-3xl shadow-[var(--shadow-lg)] w-full max-w-lg flex flex-col max-h-[90vh] border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <ChefHat size={18} className="text-[var(--color-primary)]" />
            <h3 className="font-bold text-[var(--color-text)]">{t('recipe.new')}</h3>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1.5 rounded-full hover:bg-gray-50">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

          {/* AI assist — describe a dish, let the model fill the ingredients */}
          <div className="rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-[var(--color-primary)]" />
              <p className="text-[10px] font-bold text-[var(--color-primary-dark)] uppercase tracking-wider">{t('recipe.aiTitle')}</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={aiDish}
                onChange={(e) => setAiDish(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAiFill(); }}
                placeholder={t('recipe.aiPlaceholder')}
                className="flex-1 text-sm px-3 py-2 border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] transition-all"
              />
              <button
                type="button"
                onClick={handleAiFill}
                disabled={aiLoading || !aiDish.trim()}
                className="shrink-0 flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-40 text-white text-xs font-semibold px-3 rounded-xl transition-all"
              >
                {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {t('recipe.aiFill')}
              </button>
            </div>
          </div>

          {/* Name + serving */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{t('recipe.name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Овсянка с бананом…"
                className="w-full text-sm font-semibold px-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">{t('recipe.serving')}</label>
              <input
                type="number"
                min={10}
                max={5000}
                value={servingG}
                onChange={(e) => setServingG(Number(e.target.value))}
                className="w-full text-sm font-mono px-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-[var(--color-primary)] transition-all"
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">{t('recipe.addIngredient')}</p>
            <div className="space-y-2">
              {ingredients.map((ing) => (
                <div key={ing.id} className="bg-gray-50/50 rounded-2xl border border-gray-100 p-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ing.name}
                      onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                      placeholder={t('recipe.ingredient')}
                      className="flex-1 text-xs font-semibold px-3 py-1.5 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary)] bg-white"
                    />
                    <input
                      type="number"
                      min={1}
                      value={ing.grams}
                      onChange={(e) => updateIngredient(ing.id, 'grams', Number(e.target.value))}
                      title="граммы"
                      className="w-16 text-xs font-mono text-center px-2 py-1.5 border border-gray-200 rounded-xl outline-none focus:border-[var(--color-primary)] bg-white"
                    />
                    <span className="text-[10px] text-[var(--color-text-muted)] self-center">г</span>
                    <button onClick={() => removeIngredient(ing.id)} className="text-[var(--color-text-muted)] hover:text-red-400 p-1">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {([['kcal', 'ккал'], ['protein', 'Б'], ['fat', 'Ж'], ['carbs', 'У']] as const).map(([field, label]) => (
                      <div key={field}>
                        <p className="text-[9px] text-[var(--color-text-muted)] text-center mb-0.5">{label}/100г</p>
                        <input
                          type="number"
                          min={0}
                          step="0.1"
                          value={ing[field]}
                          onChange={(e) => updateIngredient(ing.id, field, Number(e.target.value))}
                          className="w-full text-[11px] font-mono text-center px-1 py-1 border border-gray-200 rounded-lg outline-none focus:border-[var(--color-primary)] bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIngredients((p) => [...p, newDraft()])}
              className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] px-3 py-1.5 rounded-xl bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 transition-all"
            >
              <Plus size={12} />
              {t('recipe.addIngredient')}
            </button>
          </div>

          {/* Preview totals */}
          {totals.totalGrams > 0 && (
            <div className="bg-[var(--color-primary)]/5 rounded-2xl p-4 space-y-1">
              <p className="text-[10px] font-bold text-[var(--color-primary-dark)] uppercase tracking-wider">{t('recipe.per100')}</p>
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                <span className="px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: 'var(--color-fat-bg)', color: 'var(--color-fat)' }}>{r(per100.kcal)} ккал</span>
                <span className="px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: 'var(--color-protein-bg)', color: 'var(--color-protein)' }}>Б {r(per100.protein)}г</span>
                <span className="px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: 'var(--color-fat-bg)', color: 'var(--color-fat)' }}>Ж {r(per100.fat)}г</span>
                <span className="px-2 py-0.5 rounded-md font-semibold" style={{ backgroundColor: 'var(--color-carbs-bg)', color: 'var(--color-carbs)' }}>У {r(per100.carbs)}г</span>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)]">Всего: {totals.totalGrams}г</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 shrink-0 flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-[var(--color-text-light)] text-xs font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-all">
            {t('auth.signOut') === 'Выйти' ? 'Отмена' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            {t('recipe.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
