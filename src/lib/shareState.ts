// Serialize the app state (calculator inputs + builder ration) into a compact,
// URL-safe string so it can be persisted locally and shared via a link.

import { CalcParams, FoodProduct } from '@/types/nutrition';

export interface RationItem {
  product: FoodProduct;
  grams: number;
}

export interface ShareState {
  v: 1;
  params?: CalcParams;
  items: RationItem[];
}

// Compact wire format keeps shared URLs short.
interface WireItem {
  n: string;
  k: number;
  p: number;
  f: number;
  c: number;
  g: number;
}

interface Wire {
  v: 1;
  params?: CalcParams;
  items: WireItem[];
}

function toWire(state: ShareState): Wire {
  return {
    v: 1,
    params: state.params,
    items: state.items.map((it) => ({
      n: it.product.product_name,
      k: it.product.nutriments['energy-kcal_100g'] ?? 0,
      p: it.product.nutriments.proteins_100g ?? 0,
      f: it.product.nutriments.fat_100g ?? 0,
      c: it.product.nutriments.carbohydrates_100g ?? 0,
      g: it.grams,
    })),
  };
}

function fromWire(wire: Wire): ShareState {
  return {
    v: 1,
    params: wire.params,
    items: (wire.items ?? []).map((w) => ({
      product: {
        product_name: w.n,
        nutriments: {
          'energy-kcal_100g': w.k,
          proteins_100g: w.p,
          fat_100g: w.f,
          carbohydrates_100g: w.c,
        },
      },
      grams: w.g,
    })),
  };
}

// base64url helpers that handle Unicode (Cyrillic food names).
function b64urlEncode(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): string {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeState(state: ShareState): string {
  return b64urlEncode(JSON.stringify(toWire(state)));
}

export function decodeState(encoded: string): ShareState | null {
  try {
    const wire = JSON.parse(b64urlDecode(encoded)) as Wire;
    if (wire?.v !== 1) return null;
    return fromWire(wire);
  } catch {
    return null;
  }
}
