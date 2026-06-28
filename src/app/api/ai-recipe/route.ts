import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { guardAiRequest } from '@/lib/serverAuth';
import { parseLooseObject } from '@/lib/aiJson';

// One ingredient line of an AI-generated recipe. Macros are PER 100G; grams is
// the amount of that ingredient in the dish.
export interface AiRecipeIngredient {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
}

export interface AiRecipe {
  name: string;
  serving_g: number;
  items: AiRecipeIngredient[];
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const LANG_NAMES: Record<string, string> = {
  ru: 'Russian (Русский)',
  uk: 'Ukrainian (Українська)',
  en: 'English',
};

function buildSystem(lang: string): string {
  const langName = LANG_NAMES[lang] || LANG_NAMES.ru;
  return `You are a precise culinary nutritionist. The user names a dish.
Decompose it into its main ingredients with realistic quantities for a typical home-cooked batch.
For each ingredient give nutritional values PER 100G and the amount used in the dish (grams).

Return ONLY a JSON object — no markdown, no explanation. Shape:
{
  "name": string,            // a clean dish name
  "serving_g": number,       // a sensible single-portion weight in grams
  "items": [
    { "name": string, "grams": number, "kcal": number, "protein": number, "fat": number, "carbs": number, "fiber": number }
  ]
}
- CRITICAL: the dish name and every ingredient name MUST be written in ${langName}. Do not use any other language, regardless of the input language.
- kcal/protein/fat/carbs/fiber are PER 100G of that raw ingredient, from standard food databases.
- fiber is optional; omit if unknown.
- Keep ingredient count reasonable (3–10 main components).
Respond with ONLY the JSON object, nothing else.`;
}

const finite = z.number().finite();

// A bad `fiber` value shouldn't reject the whole ingredient — coerce it away
// (.catch) so the rest of the macros still count, matching the dish's optional
// fiber contract.
const ingredientSchema = z.object({
  name: z.string(),
  grams: finite,
  kcal: finite,
  protein: finite,
  fat: finite,
  carbs: finite,
  fiber: finite.optional().catch(undefined),
});

// Top-level shape is lenient about `items` on purpose: we validate each
// ingredient individually below so one malformed entry from the model doesn't
// throw away an otherwise-good recipe.
const recipeSchema = z.object({
  name: z.string(),
  serving_g: finite.optional(),
  items: z.array(z.unknown()),
});

function validateRecipe(parsed: unknown): AiRecipe | null {
  const top = recipeSchema.safeParse(parsed);
  if (!top.success) return null;

  const items: AiRecipeIngredient[] = [];
  for (const raw of top.data.items) {
    const r = ingredientSchema.safeParse(raw);
    if (!r.success) continue;
    const { fiber, ...rest } = r.data;
    items.push(fiber != null ? { ...rest, fiber } : rest);
  }
  if (items.length === 0) return null;

  const serving = top.data.serving_g;
  return { name: top.data.name, serving_g: serving && serving > 0 ? serving : 100, items };
}

export async function POST(req: NextRequest) {
  const guard = await guardAiRequest(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => null);
  const dish: string = typeof body?.dish === 'string' ? body.dish.trim() : '';
  const lang: string = typeof body?.lang === 'string' ? body.lang : 'ru';
  if (!dish || dish.length > 200) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: buildSystem(lang),
      messages: [{ role: 'user', content: dish }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';

    const recipe = validateRecipe(parseLooseObject(text));
    if (!recipe) {
      return NextResponse.json({ error: 'parse_failed', raw: text }, { status: 422 });
    }

    return NextResponse.json({ recipe });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: 'upstream', message: msg }, { status: 502 });
  }
}
