import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { guardAiRequest } from '@/lib/serverAuth';
import { Micros, sanitizeMicros } from '@/lib/micronutrients';
import { parseLooseArray } from '@/lib/aiJson';
import { CookMethod, isCookMethod } from '@/lib/cooking';

export interface AiLoggedItem {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  micros?: Micros;
  method?: CookMethod;
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const LANG_NAMES: Record<string, string> = {
  ru: 'Russian (Русский)',
  uk: 'Ukrainian (Українська)',
  en: 'English',
};

function langInstruction(lang: string): string {
  const name = LANG_NAMES[lang] || LANG_NAMES.ru;
  return `CRITICAL: Every "name" field MUST be written in ${name}. Do not use any other language for item names, regardless of the input language. This is mandatory.`;
}

const OUTPUT_SPEC = `Return ONLY a JSON array — no markdown, no explanation, no wrapping object. Each element must have:
- name (string) — see the language rule above
- grams (number, estimated portion weight)
- kcal (number, per 100g)
- protein (number, grams per 100g)
- fat (number, grams per 100g)
- carbs (number, grams per 100g)
- fiber (number, grams per 100g, optional — omit if unknown)
- method (string, optional): the cooking method, EXACTLY one of:
    raw, boiled, steamed, baked, grilled, stewed, sauteed, fried, deep_fried
  Put the cooking method HERE, not in the name. Keep "name" clean — do NOT add the cooking-method word to it.
  The kcal/fat values MUST already reflect this method (e.g. include absorbed oil for fried/sautéed).
  Omit "method" entirely for items where preparation doesn't apply: sauces, condiments, drinks, raw fruit, bread.
- micros (object, optional): APPROXIMATE micronutrients PER 100G. Include any you can estimate from standard food databases, omit the rest. Keys and units:
    iron_mg, calcium_mg, magnesium_mg, potassium_mg, zinc_mg,
    vitamin_a_mcg (RAE), vitamin_c_mg, vitamin_d_mcg, vitamin_b12_mcg, folate_mcg

Use realistic nutritional values from standard food databases. Respond with ONLY the JSON array, nothing else.`;

// Shared guidance to maximise completeness of recognition — the part that
// turns "ok" into a killer feature: nothing visible should be silently dropped.
const THOROUGHNESS = `You MUST list every visible component as a separate JSON item. Common mistakes to avoid:
- RED OR ORANGE SAUCE on pasta or rice → list it as a separate item (e.g. ketchup, tomato sauce, bolognese). Do NOT fold it into the pasta.
- DRESSING on a salad → separate item (olive oil, vinegar, mayonnaise, etc.)
- BUTTER or OIL on vegetables or bread → separate item
- SOUR CREAM or YOGURT as a topping → separate item
- MUSHROOMS, ONIONS sautéed as a side → separate item
If you can see a sauce, drizzle, dip, or condiment anywhere on the plate, you MUST include it as a separate array element with an estimated gram weight (even if it looks small — e.g. 30g ketchup).
Cooking fat counts: if something is fried or sautéed, account for absorbed oil in that item's fat value.
Split composite dishes into their main components. Do not silently drop any visible ingredient.`;

const TEXT_SYSTEM = (lang: string) => `You are a precise nutritionist assistant. The user will describe a meal or food in natural language.
${langInstruction(lang)}
Break it down into individual food items with estimated nutritional values PER 100G and estimated portion size in grams.
${THOROUGHNESS}
${OUTPUT_SPEC}`;

const VISION_SYSTEM = (lang: string) => `You are a precise nutritionist assistant. The user will send a PHOTO of a meal or food.
${langInstruction(lang)}
Identify each distinct food item visible in the photo. For each, estimate the portion size in grams from visual cues
(plate size, typical servings) and provide nutritional values PER 100G.
${THOROUGHNESS}
Before you build the JSON, mentally scan the plate top-to-bottom: main carb, protein, vegetables, then EVERY sauce/condiment/dressing/drizzle. Any red, orange, white, or yellow substance on top of food is likely a sauce — list it separately.
If the image does not contain food, return an empty JSON array [].
${OUTPUT_SPEC}`;

const ALLOWED_MEDIA = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type MediaType = (typeof ALLOWED_MEDIA)[number];

// Parse a data URL (data:image/jpeg;base64,XXXX) into media type + raw base64.
function parseDataUrl(dataUrl: string): { media: MediaType; data: string } | null {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const media = match[1] as MediaType;
  if (!ALLOWED_MEDIA.includes(media)) return null;
  return { media, data: match[2] };
}

export async function POST(req: NextRequest) {
  // Auth + per-user rate limit. Returns a NextResponse on failure.
  const guard = await guardAiRequest(req);
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => null);
  const description: string = body?.description?.trim() ?? '';
  const image: string = typeof body?.image === 'string' ? body.image : '';
  const lang: string = typeof body?.lang === 'string' ? body.lang : 'ru';

  let system: string;
  let content: Anthropic.MessageParam['content'];

  if (image) {
    const parsed = parseDataUrl(image);
    if (!parsed) {
      return NextResponse.json({ error: 'invalid_image' }, { status: 400 });
    }
    // Guard against oversized payloads (~6MB of base64 ≈ 4.5MB image).
    if (parsed.data.length > 6_000_000) {
      return NextResponse.json({ error: 'image_too_large' }, { status: 413 });
    }
    system = VISION_SYSTEM(lang);
    content = [
      {
        type: 'image',
        source: { type: 'base64', media_type: parsed.media, data: parsed.data },
      },
      {
        type: 'text',
        text: description || 'Analyse this meal photo and estimate its nutrition.',
      },
    ];
  } else {
    if (!description || description.length > 1000) {
      return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
    }
    system = TEXT_SYSTEM(lang);
    content = description;
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';

    const parsed = parseLooseArray(text);
    if (!parsed) {
      return NextResponse.json({ error: 'parse_failed', raw: text }, { status: 422 });
    }

    const items: AiLoggedItem[] = (parsed as Record<string, unknown>[])
      .filter(
        (x) =>
          typeof x.name === 'string' &&
          typeof x.grams === 'number' &&
          typeof x.kcal === 'number' &&
          typeof x.protein === 'number' &&
          typeof x.fat === 'number' &&
          typeof x.carbs === 'number'
      )
      .map((x): AiLoggedItem => {
        const micros = sanitizeMicros(x.micros);
        return {
          name: x.name as string,
          grams: x.grams as number,
          kcal: x.kcal as number,
          protein: x.protein as number,
          fat: x.fat as number,
          carbs: x.carbs as number,
          ...(typeof x.fiber === 'number' ? { fiber: x.fiber } : {}),
          ...(micros ? { micros } : {}),
          ...(isCookMethod(x.method) ? { method: x.method } : {}),
        };
      });

    return NextResponse.json({ items });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: 'upstream', message: msg }, { status: 502 });
  }
}
