// Cooking-method model. The AI returns an assumed preparation for each cooked
// item; the user can switch it in one tap and we adjust the macros locally
// (no extra model call) based on how much fat a given method typically adds.

export type CookMethod =
  | 'raw'
  | 'boiled'
  | 'steamed'
  | 'baked'
  | 'grilled'
  | 'stewed'
  | 'sauteed'
  | 'fried'
  | 'deep_fried';

export const COOK_METHODS: CookMethod[] = [
  'raw',
  'boiled',
  'steamed',
  'baked',
  'grilled',
  'stewed',
  'sauteed',
  'fried',
  'deep_fried',
];

// Approximate grams of added cooking fat per 100g of food. The AI's macros
// already bake in the fat of the method it assumed, so when the user switches
// method we shift fat (and the calories that fat carries) by the difference.
const OIL_FAT_PER_100G: Record<CookMethod, number> = {
  raw: 0,
  boiled: 0,
  steamed: 0,
  baked: 1,
  grilled: 1.5,
  stewed: 2,
  sauteed: 4,
  fried: 7,
  deep_fried: 12,
};

export function isCookMethod(v: unknown): v is CookMethod {
  return typeof v === 'string' && (COOK_METHODS as string[]).includes(v);
}

// Recompute per-100g kcal & fat when switching preparation. Protein and carbs
// are unaffected by added cooking fat, so only fat (≈9 kcal/g) moves.
export function adjustForMethod(
  macros: { kcal: number; fat: number },
  from: CookMethod,
  to: CookMethod
): { kcal: number; fat: number } {
  const delta = OIL_FAT_PER_100G[to] - OIL_FAT_PER_100G[from];
  const fat = Math.max(0, Math.round((macros.fat + delta) * 10) / 10);
  const realDelta = fat - macros.fat;
  const kcal = Math.max(0, Math.round(macros.kcal + 9 * realDelta));
  return { kcal, fat };
}
