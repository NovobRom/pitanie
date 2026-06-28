import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';

interface OFFNutriments {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  fat_100g?: number;
  carbohydrates_100g?: number;
}

interface OFFProduct {
  product_name: string;
  nutriments: OFFNutriments;
  image_front_small_url?: string;
}

interface OFFResponse {
  products: OFFProduct[];
}

export const GET = withAuth(async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  if (!query?.trim()) {
    return NextResponse.json({ products: [] });
  }

  try {
    const url =
      `https://world.openfoodfacts.org/cgi/search.pl` +
      `?search_terms=${encodeURIComponent(query)}` +
      `&json=1&search_simple=1&action=process` +
      `&fields=product_name,nutriments,image_front_small_url` +
      `&page_size=9`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'PitanieApp/1.0 (nutrition planner)' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ products: [] }, { status: 502 });
    }

    const data: OFFResponse = await res.json();

    const products = data.products
      .filter(
        (p) =>
          p.product_name?.trim() &&
          p.nutriments?.['energy-kcal_100g'] !== undefined,
      )
      .slice(0, 6);

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: [] }, { status: 500 });
  }
});
