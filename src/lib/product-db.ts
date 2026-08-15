/* ────────── Product database powered by MX Selection Guide data ────────── */

import rawData from '@/data/mx-products.json';

/* ─── Types ─── */

export interface ProductVal {
  d: string;
  n: number;
}

export interface Product {
  pn: string; // product number
  grp: string; // group (e.g. "LV MOSFET", "Super Junction")
  fam: string; // family (e.g. "30V N-Ch")
  g: string; // tab (e.g. "LV & MV MOSFET", "SJ MOSFET")
  dt?: string; // type (e.g. "MOSFET")
  cfg?: string; // configuration (e.g. "Single")
  gen?: string; // generation (e.g. "MXT", "Gen 1")
  pkg?: string; // package
  vals: Record<string, ProductVal>;
  ds?: string; // datasheet URL
  new?: number; // new flag
  dev?: number; // dev flag
  aec?: string; // automotive qualification
  smpCat?: string; // sample category ("Now", "Soon", "Q3", etc.)
  relCat?: string; // release category ("MP", "Pre", "Dev", etc.)
}

export interface ColumnDef {
  key: string;
  label: string;
  unit: string;
  num?: number;
}

export interface TabMeta {
  cols: ColumnDef[];
  num?: Array<{ key: string; label: string; unit: string }>;
}

interface RawData {
  tabs: string[];
  meta: Record<string, TabMeta>;
  products: Product[];
}

/* ─── Family → Selection Guide mapping ─── */

/** Maps our product-family names to the selection-guide grp values */
const familyGroupMap: Record<string, string[]> = {
  'MXT MOSFETs': ['LV MOSFET', 'MV MOSFET', 'BatteryFET'],
  'SJ MOSFETs': ['Super Junction'],
  'HV MOSFETs': ['HV MOSFET'],
  'Discrete IGBTs': ['IGBT'],
  'IGBT Chips for Standard Module': ['IGBT'],
  'Silicon Carbide (SiC)': ['SiC MOSFET', 'SiC SBD'],
};

/** Maps our product-family names to the selection-guide tab name (for column metadata) */
const familyTabMap: Record<string, string> = {
  'MXT MOSFETs': 'LV & MV MOSFET',
  'SJ MOSFETs': 'SJ MOSFET',
  'HV MOSFETs': 'HV MOSFET',
  'Discrete IGBTs': 'IGBT',
  'IGBT Chips for Standard Module': 'IGBT',
  'Silicon Carbide (SiC)': 'SiC',
};

/* ─── Parsed singleton ─── */

const data = rawData as unknown as RawData;

/* ─── Public API ─── */

/** Get the tab meta for a product family name */
export function getMetaForFamily(family: string): TabMeta | null {
  const tab = familyTabMap[family];
  if (!tab) return null;
  return data.meta[tab] ?? null;
}

/** Get all products for a product family + voltage variant */
export function getProductsForVariant(
  family: string,
  voltageDisplay: string, // e.g. "30V", "12V-24V"
): Product[] {
  const groups = familyGroupMap[family];
  if (!groups) return [];

  return data.products.filter((p) => {
    // Match by group
    if (!groups.includes(p.grp)) return false;

    // Match by voltage in family name
    // For "12V-24V", match products whose fam contains "12V" or "24V" or the full range
    if (voltageDisplay.includes('-')) {
      // Range variant: match any fam that contains any of the individual voltages
      const parts = voltageDisplay.split('-');
      return parts.some((part) => {
        const norm = part.trim().toUpperCase();
        // Check if fam contains this voltage (e.g. "12V" or "24V")
        return p.fam.toUpperCase().includes(norm);
      });
    }

    // Single voltage: match fam containing the voltage
    return p.fam.toUpperCase().includes(voltageDisplay.toUpperCase());
  });
}

/** Format a sample/release status badge color */
export function statusColor(cat?: string): string {
  switch (cat) {
    case 'Now':
    case 'MP':
      return 'bg-green-100 text-green-700';
    case 'Soon':
    case 'Pre':
      return 'bg-yellow-100 text-yellow-700';
    case 'Q3':
    case 'Q4':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-500';
  }
}

/** Get column definitions for a product family */
export function getColumnsForFamily(family: string): ColumnDef[] {
  const meta = getMetaForFamily(family);
  if (!meta) return [];
  return meta.cols;
}

/** Format a value from product vals for display */
export function formatVal(val?: ProductVal): string {
  if (!val) return '—';
  return val.d;
}

/** Convert variant slug to display name (e.g. "30v" → "30V", "12v-24v" → "12V-24V") */
export function variantSlugToDisplay(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.toUpperCase())
    .join('-');
}
