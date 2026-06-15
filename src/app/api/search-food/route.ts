import { NextRequest, NextResponse } from 'next/server';
import { foodCatalog, CatalogFood } from '@/lib/foodCatalog';

const OFF_FIELDS = [
  'product_name',
  'product_name_en',
  'product_name_ru',
  'product_name_uk',
  'nutriments',
  'brands',
].join(',');

interface OFFNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  fat_100g?: number;
  carbohydrates_100g?: number;
  fiber_100g?: number;
}

interface OFFProduct {
  product_name?: string;
  product_name_en?: string;
  product_name_ru?: string;
  product_name_uk?: string;
  brands?: string;
  nutriments: OFFNutriments;
}

interface ResultItem {
  name: string;
  brand?: string;
  verified?: boolean; // true = from our curated catalog
  nutrition: { kcal: number; protein: number; fat: number; carbs: number; fiber?: number };
}

// Lowercase + strip diacritics so "Sarrasin"/"sarrasin", "café"/"cafe" compare equally.
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics
    .replace(/ё/g, 'е') // ё → е
    .trim();
}

// Every query token (len >= 2) must appear in the candidate text.
function matchesAllTokens(text: string, tokens: string[]): boolean {
  const n = norm(text);
  return tokens.every((tok) => n.includes(tok));
}

// ── Catalog search (instant, accurate, language-correct) ─────────────────────
function searchCatalog(tokens: string[], lang: string): ResultItem[] {
  const pickName = (f: CatalogFood) =>
    lang === 'en' ? f.nameEn : f.nameRu; // ru + uk fall back to RU label

  return foodCatalog
    .filter((f) => matchesAllTokens(`${f.nameRu} ${f.nameEn}`, tokens))
    .map((f) => ({
      name: pickName(f),
      verified: true,
      nutrition: {
        kcal: f.per100.kcal,
        protein: f.per100.protein,
        fat: f.per100.fat,
        carbs: f.per100.carbs,
      },
    }));
}

// ── Pick the OFF product name for the UI language ────────────────────────────
function pickOffName(p: OFFProduct, lang: string): string | null {
  const specific =
    lang === 'ru' ? p.product_name_ru :
    lang === 'uk' ? (p.product_name_uk ?? p.product_name_ru) :
    p.product_name_en;
  return specific?.trim() || p.product_name?.trim() || null;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  const lang = request.nextUrl.searchParams.get('lang') ?? 'en';
  if (!q) return NextResponse.json({ products: [] });

  const tokens = norm(q).split(/\s+/).filter((t) => t.length >= 2);
  if (tokens.length === 0) return NextResponse.json({ products: [] });

  const lc = lang === 'ru' ? 'ru' : lang === 'uk' ? 'uk' : 'en';

  // 1. Local catalog matches — always accurate, no foreign names.
  const catalogHits = searchCatalog(tokens, lang);

  // 2. Open Food Facts — branded/packaged products, popularity-sorted.
  let offHits: ResultItem[] = [];
  try {
    const params = new URLSearchParams({
      search_terms: q,
      json: '1',
      search_simple: '1',
      action: 'process',
      sort_by: 'unique_scans_n', // popular products first
      fields: OFF_FIELDS,
      page_size: '40',
      lc,
    });

    const url = `https://world.openfoodfacts.org/cgi/search.pl?${params}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'DoseApp/2.0 (nutrition tracker)' },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      offHits = ((data.products ?? []) as OFFProduct[])
        .map((p) => {
          const name = pickOffName(p, lang);
          if (!name) return null;
          const n = p.nutriments;
          if (n['energy-kcal_100g'] == null || n.proteins_100g == null) return null;
          // Relevance gate: the display name must actually contain the query
          // tokens — this drops irrelevant foreign-named products.
          if (!matchesAllTokens(name, tokens)) return null;

          return {
            name,
            brand: p.brands ? String(p.brands).split(',')[0].trim() : undefined,
            nutrition: {
              kcal: Math.round(n['energy-kcal_100g'] * 10) / 10,
              protein: Math.round((n.proteins_100g ?? 0) * 10) / 10,
              fat: Math.round((n.fat_100g ?? 0) * 10) / 10,
              carbs: Math.round((n.carbohydrates_100g ?? 0) * 10) / 10,
              fiber: n.fiber_100g != null ? Math.round(n.fiber_100g * 10) / 10 : undefined,
            },
          } as ResultItem;
        })
        .filter((x): x is ResultItem => x !== null);
    }
  } catch {
    // OFF down — still return catalog hits.
  }

  // 3. Merge: catalog first, then OFF, deduped by normalized name.
  const seen = new Set<string>();
  const products: ResultItem[] = [];
  for (const item of [...catalogHits, ...offHits]) {
    const key = norm(item.name);
    if (seen.has(key)) continue;
    seen.add(key);
    products.push(item);
    if (products.length >= 14) break;
  }

  return NextResponse.json({ products });
}
