/* ────────────────────────────────────────────────────────────────────
 * Digital datasheet registry (client-safe)
 *
 * Imports the single datasheets.json data file directly so that both
 * server components and client components can look up whether a
 * product part number has a published digital datasheet.
 * ──────────────────────────────────────────────────────────────────── */

import type { DatasheetRecord } from '@/types/datasheet';
import datasheets from '../../data/datasheets.json';

const records = datasheets as unknown as DatasheetRecord[];

/** Part numbers that have a published digital datasheet */
export const digitalDatasheetPartNumbers: string[] = records
  .filter((d) => d.published !== false)
  .map((d) => d.meta.partNumber);

/** Does this part number have a published digital datasheet? */
export function hasDigitalDatasheet(partNumber: string): boolean {
  const pn = partNumber.trim().toLowerCase();
  return digitalDatasheetPartNumbers.some((p) => p.toLowerCase() === pn);
}
