/* ────────────────────────────────────────────────────────────────────
 * Digital Datasheet domain model
 *
 * Ported from the Digital Datasheet Studio (digital-datasheet/app) —
 * the flexible schema that captures the AMDTA080N017RH MOSFET product
 * datasheet faithfully (cover, tables, curves, package).
 * Data lives in a single file: data/datasheets.json
 * ──────────────────────────────────────────────────────────────────── */

export interface NoteRef {
  /** numeric or alphanumeric footnote label, e.g. "1", "2)", "a" */
  label: string;
  text: string;
}

/* ── Cover ── */

export interface Feature {
  icon?: string;
  text: string;
}

export interface KeyPerformance {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}

export interface Ordering {
  type?: string;
  package?: string;
  marking?: string;
  packing?: string;
  rohs?: string;
  url?: string;
}

export interface Cover {
  subtitle?: string;
  /** bullet section under "FEATURES" */
  features: Feature[];
  /** bullet section under "PRODUCT VALIDATION" */
  validation: Feature[];
  /** a compact "key performance" stats grid */
  keyPerformance: KeyPerformance[];
  ordering?: Ordering;
  /** url/path to a package outline image (top/bottom view etc.) */
  packageImageUrl?: string;
  packageImageCaption?: string;
}

/* ── Sections ── */

export type CellType = 'text' | 'number';

export interface Column {
  id: string;
  /** column header text */
  header: string;
  /** unit suffix appended to header (e.g. "V", "mΩ") */
  unit?: string;
  /** used by renderer to know how to align/format values */
  type: CellType;
  /** approximate display width in characters (used for min-width) */
  width?: number;
}

export interface Row {
  id: string;
  /** raw string value; renderer decides formatting */
  cells: string[];
  /** attached footnote references ("1)", "2)" ...) */
  notes: string[];
}

export type SectionType =
  | 'absoluteMax'
  | 'static'
  | 'dynamic'
  | 'diode'
  | 'gateCharge'
  | 'thermal'
  | 'avalanche'
  | 'soa'
  | 'custom'
  | 'notes';

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  /** optional subtitle / context line shown under the title */
  subtitle?: string;
  columns: Column[];
  rows: Row[];
  /** free-form footnotes (kept separate so any section can attach them) */
  notes: NoteRef[];
}

/* ── Curves ── */

export interface CurveSeries {
  id: string;
  name: string;
  /** optional condition text, e.g. "VGS=10V" or "Tc=25°C" */
  condition?: string;
  points: [number, number][];
  /** optional per-series display style */
  color?: string;
  dash?: string;
  /** marker for each point (used for sparse measurement sets) */
  showMarkers?: boolean;
}

export interface Curve {
  id: string;
  figure: string; // e.g. "Fig. 1"
  title: string;
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string;
  xScale: 'linear' | 'log';
  yScale: 'linear' | 'log';
  series: CurveSeries[];
  notes: NoteRef[];
}

/* ── Package ── */

export interface Package {
  name?: string;
  imageUrl?: string;
  notes: string[];
}

/* ── Datasheet root ── */

export interface DatasheetMeta {
  title: string;
  partNumber: string;
  version: string;
  date: string; // ISO date (yyyy-mm-dd) or free text
  company: string;
  classification: string;
  disclaimer: string;
}

export interface DatasheetBody {
  schemaVersion: number;
  meta: DatasheetMeta;
  cover: Cover;
  sections: Section[];
  curves: Curve[];
  pkg?: Package;
}

/** A stored datasheet record — one entry in data/datasheets.json */
export interface DatasheetRecord extends DatasheetBody {
  id: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ── Default factory ── */

export function emptyDatasheetMeta(): DatasheetMeta {
  return {
    title: 'New Datasheet',
    partNumber: 'PART-NUMBER-0000',
    version: '1.0',
    date: new Date().toISOString().slice(0, 10),
    company: 'Magnachip Semiconductor',
    classification: 'Product Data Sheet',
    disclaimer:
      'The information in this document is subject to change without notice. Magnachip reserves the right to make changes to improve reliability, function or design. Magnachip does not assume any liability arising out of the application or use of any product or circuit described herein; neither does it convey any license under its patent rights, nor the rights of others.',
  };
}

export function emptyDatasheetBody(): DatasheetBody {
  return {
    schemaVersion: 1,
    meta: emptyDatasheetMeta(),
    cover: {
      subtitle: '',
      features: [],
      validation: [],
      keyPerformance: [],
      ordering: {
        type: '—',
        package: '—',
        marking: '—',
        packing: '—',
        rohs: '—',
      },
    },
    sections: [],
    curves: [],
    pkg: { name: '', notes: [] },
  };
}

export function newId(prefix = 'id'): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
