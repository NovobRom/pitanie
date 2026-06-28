import { NextRequest, NextResponse } from 'next/server';

interface OFFNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  fat_100g?: number;
  carbohydrates_100g?: number;
}

interface OFFProductResponse {
  status: number;
  product?: {
    product_name?: string;
    brands?: string;
    nutriments?: OFFNutriments;
    image_front_small_url?: string;
  };
}

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get('code');
  if (!barcode?.trim()) {
    return NextResponse.json({ product: null }, { status: 400 });
  }

  try {
    const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PitanieApp/1.0 (nutrition planner)' },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ product: null }, { status: 502 });
    }

    const data: OFFProductResponse = await res.json();

    if (data.status !== 1 || !data.product) {
      return NextResponse.json({ product: null });
    }

    const p = data.product;
    const n = p.nutriments;

    if (!p.product_name?.trim() || n?.['energy-kcal_100g'] === undefined) {
      return NextResponse.json({ product: null });
    }

    return NextResponse.json({
      product: {
        name: p.product_name,
        brand: p.brands ? p.brands.split(',')[0].trim() : undefined,
        nutrition: {
          kcal: n['energy-kcal_100g'] ?? 0,
          protein: n['proteins_100g'] ?? 0,
          fat: n['fat_100g'] ?? 0,
          carbs: n['carbohydrates_100g'] ?? 0,
        },
      },
    });
  } catch {
    return NextResponse.json({ product: null }, { status: 500 });
  }
}
