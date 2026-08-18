/* ────────── Site content: server-only file-system CRUD ──────────
 * This module owns the on-disk JSON store for editable site content.
 * It uses Node `fs` and must NEVER be imported from a client component.
 * Client components should import from `@/lib/site-content-shared` instead.
 *
 * Persisted to `data/site-content.json`. Initial seed values come from
 * `DEFAULT_SITE_CONTENT` in `./site-content-shared.ts`.
 */

import 'server-only';
import fs from 'fs';
import path from 'path';
import {
  DEFAULT_SITE_CONTENT,
  SITE_CONTENT_SECTIONS,
  type SiteContent,
  type SiteContentSection,
} from './site-content-shared';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'site-content.json');

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SITE_CONTENT, null, 2), 'utf-8');
  }
}

function isValidSection(value: unknown): value is SiteContentSection {
  return (
    typeof value === 'string' &&
    (SITE_CONTENT_SECTIONS as readonly string[]).includes(value)
  );
}

function readData(): SiteContent {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw) as Partial<SiteContent>;
    return {
      products: data.products ?? DEFAULT_SITE_CONTENT.products,
      applications: data.applications ?? DEFAULT_SITE_CONTENT.applications,
      designResources: data.designResources ?? DEFAULT_SITE_CONTENT.designResources,
      about: data.about ?? DEFAULT_SITE_CONTENT.about,
      updatedAt: data.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return {
      ...DEFAULT_SITE_CONTENT,
      updatedAt: new Date().toISOString(),
    };
  }
}

function writeData(content: SiteContent): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(content, null, 2), 'utf-8');
}

export function getSiteContent(): SiteContent {
  return readData();
}

export function getSiteContentSection(section: SiteContentSection): unknown {
  const content = readData();
  return content[section];
}

export function saveSiteContent(content: Omit<SiteContent, 'updatedAt'>): SiteContent {
  const next: SiteContent = {
    ...content,
    updatedAt: new Date().toISOString(),
  };
  writeData(next);
  return next;
}

export function saveSiteContentSection(
  section: SiteContentSection,
  value: unknown,
): SiteContent {
  if (!isValidSection(section)) {
    throw new Error(`Invalid site-content section: ${String(section)}`);
  }
  const current = readData();
  const next: SiteContent = {
    ...current,
    [section]: value as never,
    updatedAt: new Date().toISOString(),
  };
  writeData(next);
  return next;
}
