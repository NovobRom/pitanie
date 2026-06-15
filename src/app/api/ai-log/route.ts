import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export interface AiLoggedItem {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a precise nutritionist assistant. The user will describe a meal or food in natural language.
Your job is to break it down into individual food items with estimated nutritional values PER 100G and estimated portion size in grams.

Return ONLY a JSON array — no markdown, no explanation, no wrapping object. Each element must have:
- name (string, in the language the user wrote in)
- grams (number, estimated portion weight)
- kcal (number, per 100g)
- protein (number, grams per 100g)
- fat (number, grams per 100g)
- carbs (number, grams per 100g)
- fiber (number, grams per 100g, optional — omit if unknown)

Use realistic nutritional values from standard food databases. If a compound dish is described, split it into its main components.
Respond with ONLY the JSON array, nothing else.`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'no_key' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const description: string = body?.description?.trim() ?? '';
  if (!description || description.length > 1000) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: description }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';

    let items: AiLoggedItem[];
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('not array');
      items = parsed.filter(
        (x): x is AiLoggedItem =>
          typeof x.name === 'string' &&
          typeof x.grams === 'number' &&
          typeof x.kcal === 'number' &&
          typeof x.protein === 'number' &&
          typeof x.fat === 'number' &&
          typeof x.carbs === 'number'
      );
    } catch {
      return NextResponse.json({ error: 'parse_failed', raw: text }, { status: 422 });
    }

    return NextResponse.json({ items });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: 'upstream', message: msg }, { status: 502 });
  }
}
