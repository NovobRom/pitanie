// Micronutrient reference data + helpers.
//
// IMPORTANT: micronutrient values in this app are APPROXIMATE. They come from
// the AI's per-food estimates, which carry far more uncertainty than macros
// (cooking, ripeness, storage and portion error all compound). We therefore
// surface them only as a weekly, bucketed "low / ok / good" signal — never as
// precise figures.

export type MicroKey =
  | 'iron_mg'
  | 'calcium_mg'
  | 'magnesium_mg'
  | 'potassium_mg'
  | 'zinc_mg'
  | 'vitamin_a_mcg'
  | 'vitamin_c_mg'
  | 'vitamin_d_mcg'
  | 'vitamin_b12_mcg'
  | 'folate_mcg';

// Per-100g micronutrient amounts attached to a logged food item.
export type Micros = Partial<Record<MicroKey, number>>;

export interface MicroDef {
  key: MicroKey;
  labelKey: string; // i18n key (see src/lib/i18n.tsx)
  unit: string;
  // Reference Daily Intake for adults 19–50 (US RDA / AI where no RDA exists).
  rda: { male: number; female: number };
}

export const MICRONUTRIENTS: MicroDef[] = [
  { key: 'iron_mg', labelKey: 'micro.iron', unit: 'мг', rda: { male: 8, female: 18 } },
  { key: 'calcium_mg', labelKey: 'micro.calcium', unit: 'мг', rda: { male: 1000, female: 1000 } },
  { key: 'magnesium_mg', labelKey: 'micro.magnesium', unit: 'мг', rda: { male: 400, female: 310 } },
  { key: 'potassium_mg', labelKey: 'micro.potassium', unit: 'мг', rda: { male: 3400, female: 2600 } },
  { key: 'zinc_mg', labelKey: 'micro.zinc', unit: 'мг', rda: { male: 11, female: 8 } },
  { key: 'vitamin_a_mcg', labelKey: 'micro.vitaminA', unit: 'мкг', rda: { male: 900, female: 700 } },
  { key: 'vitamin_c_mg', labelKey: 'micro.vitaminC', unit: 'мг', rda: { male: 90, female: 75 } },
  { key: 'vitamin_d_mcg', labelKey: 'micro.vitaminD', unit: 'мкг', rda: { male: 15, female: 15 } },
  { key: 'vitamin_b12_mcg', labelKey: 'micro.vitaminB12', unit: 'мкг', rda: { male: 2.4, female: 2.4 } },
  { key: 'folate_mcg', labelKey: 'micro.folate', unit: 'мкг', rda: { male: 400, female: 400 } },
];

export const MICRO_KEYS: MicroKey[] = MICRONUTRIENTS.map((m) => m.key);

export type MicroStatus = 'low' | 'ok' | 'good';

// Bucket an average daily intake against the reference value. Coarse on
// purpose — the underlying estimate is not precise enough for fine gradations.
export function microStatus(avgDaily: number, rda: number): MicroStatus {
  const ratio = rda > 0 ? avgDaily / rda : 0;
  if (ratio < 0.5) return 'low';
  if (ratio < 1) return 'ok';
  return 'good';
}

// Keep only known micro keys with finite, positive numbers. Used to sanitise
// untrusted AI output before it is stored.
export function sanitizeMicros(raw: unknown): Micros | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const out: Micros = {};
  for (const key of MICRO_KEYS) {
    const v = (raw as Record<string, unknown>)[key];
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
      out[key] = Math.round(v * 100) / 100;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
