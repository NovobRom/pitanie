// Tolerant JSON extraction for LLM responses.
//
// Models occasionally wrap their JSON in ```json fences or add a short
// preamble ("Here is the breakdown:") despite being told not to. A strict
// JSON.parse then throws and the whole request fails. These helpers strip
// fences and, as a last resort, slice out the first balanced array/object.

function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

export function parseLooseArray(text: string): unknown[] | null {
  const t = stripFences(text);
  try {
    const p = JSON.parse(t);
    if (Array.isArray(p)) return p;
  } catch {
    /* fall through to substring extraction */
  }
  const start = t.indexOf('[');
  const end = t.lastIndexOf(']');
  if (start !== -1 && end > start) {
    try {
      const p = JSON.parse(t.slice(start, end + 1));
      if (Array.isArray(p)) return p;
    } catch {
      /* give up */
    }
  }
  return null;
}

export function parseLooseObject(text: string): Record<string, unknown> | null {
  const t = stripFences(text);
  try {
    const p = JSON.parse(t);
    if (p && typeof p === 'object' && !Array.isArray(p)) return p as Record<string, unknown>;
  } catch {
    /* fall through to substring extraction */
  }
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      const p = JSON.parse(t.slice(start, end + 1));
      if (p && typeof p === 'object' && !Array.isArray(p)) return p as Record<string, unknown>;
    } catch {
      /* give up */
    }
  }
  return null;
}
