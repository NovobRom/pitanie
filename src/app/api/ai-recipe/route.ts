import { NextRequest, NextResponse } from 'next/server';
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

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function validateRecipe(parsed: unknown): AiRecipe | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as Record<string, unknown>;
  if (typeof obj.name !== 'string' || !Array.isArray(obj.items)) return null;

  const items: AiRecipeIngredient[] = [];
  for (const raw of obj.items) {
    if (!raw || typeof raw !== 'object') continue;
    const it = raw as Record<string, unknown>;
    const grams = num(it.grams);
    const kcal = num(it.kcal);
    const protein = num(it.protein);
    const fat = num(it.fat);
    const carbs = num(it.carbs);
    if (typeof it.name !== 'string' || grams == null || kcal == null || protein == null || fat == null || carbs == null) {
      continue;
    }
    const fiber = num(it.fiber);
    items.push({ name: it.name, grams, kcal, protein, fat, carbs, ...(fiber != null ? { fiber } : {}) });
  }
  if (items.length === 0) return null;

  const serving = num(obj.serving_g);
  return { name: obj.name, serving_g: serving && serving > 0 ? serving : 100, items };
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
