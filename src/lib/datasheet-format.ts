/* ────────── Formatting helpers for the digital datasheet renderer ────────── */

const NUMERIC_CELL_RE = /^[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?[A-Za-z]*$/;

/** Format a numeric-looking string, e.g. "1.7" -> "1.7", "11582" -> "11,582". */
export function formatNumericLike(value: string, unit?: string): string {
  if (value === '' || value == null) return '—';
  if (value === '—') return '—';
  if (value.trim() === '') return '—';
  const trimmed = value.trim();
  if (!NUMERIC_CELL_RE.test(trimmed.replace(/,/g, ''))) return value;
  const n = Number(trimmed.replace(/,/g, ''));
  if (Number.isFinite(n)) {
    if (Math.abs(n) >= 1000) {
      return formatThousands(n) + (unit ? ` ${unit}` : '');
    }
    if (Math.abs(n) < 0.01 && n !== 0) {
      return n.toExponential(2) + (unit ? ` ${unit}` : '');
    }
    const fixed = n.toString();
    return fixed + (unit ? ` ${unit}` : '');
  }
  return unit ? `${value} ${unit}` : value;
}

export function formatThousands(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

export function isPlaceholder(v: string) {
  return !v || v === '—' || v === '-' || v === 'N/A';
}
