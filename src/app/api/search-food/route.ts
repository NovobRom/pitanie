import { NextRequest, NextResponse } from 'next/server';

const OFF_FIELDS = [
  'product_name',
  'product_name_en',
  'product_name_ru',
  'product_name_uk',
  'product_name_fr',
  'product_name_de',
  'nutriments',
  'brands',
  'languages_tags',
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
  product_name_fr?: string;
  product_name_de?: string;
  brands?: string;
  nutriments: OFFNutriments;
  languages_tags?: string[];
}

// Pick the best display name for the product given the UI language.
function pickName(p: OFFProduct, lc: string): string | null {
  const specific =
    lc === 'ru' ? p.product_name_ru :
    lc === 'uk' ? (p.product_name_uk ?? p.product_name_ru) :
    p.product_name_en;

  return specific?.trim() || p.product_name?.trim() || null;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  const lang = request.nextUrl.searchParams.get('lang') ?? 'en';

  if (!q) return NextResponse.json({ products: [] });

  // Map our lang codes to Open Food Facts lc parameter.
  const lc = lang === 'ru' ? 'ru' : lang === 'uk' ? 'uk' : 'en';

  try {
    const params = new URLSearchParams({
      search_terms: q,
      json: '1',
      search_simple: '1',
      action: 'process',
      fields: OFF_FIELDS,
      page_size: '30',  // fetch more so we can filter language mismatches
      lc,               // tells OFF to prefer products in this language
    });

    const url = `https://world.openfoodfacts.org/cgi/search.pl?${params}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'DoseApp/2.0 (nutrition tracker)' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return NextResponse.json({ products: [] }, { status: 502 });

    const data = await res.json();

    const products = ((data.products ?? []) as OFFProduct[])
      .map((p) => {
        const name = pickName(p, lc);
        if (!name) return null;

        const n = p.nutriments;
        if (n['energy-kcal_100g'] == null || n.proteins_100g == null) return null;

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
        };
      })
      .filter(Boolean)
      // De-duplicate by name to avoid near-identical entries.
      .filter((p, i, arr) => arr.findIndex((x) => x!.name === p!.name) === i)
      .slice(0, 12);

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
