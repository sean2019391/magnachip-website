import fs from 'fs';
import path from 'path';
import type { DatasheetRecord, DatasheetBody } from '@/types/datasheet';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'datasheets.json');

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
}

function readData(): DatasheetRecord[] {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as DatasheetRecord[]) : [];
  } catch {
    return [];
  }
}

function writeData(datasheets: DatasheetRecord[]): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(datasheets, null, 2), 'utf-8');
}

/** Datasheets visible on the public site (published), newest first */
export function getDatasheets(): DatasheetRecord[] {
  const datasheets = readData();
  return datasheets
    .filter((d) => d.published !== false)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/** All datasheets (including drafts), newest first — for admin */
export function getAllDatasheets(): DatasheetRecord[] {
  const datasheets = readData();
  return datasheets.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getDatasheet(id: string): DatasheetRecord | null {
  const datasheets = readData();
  return datasheets.find((d) => d.id === id) ?? null;
}

export function getDatasheetByPartNumber(partNumber: string): DatasheetRecord | null {
  const datasheets = readData();
  return (
    datasheets.find(
      (d) => d.meta.partNumber.toLowerCase() === partNumber.toLowerCase() && d.published !== false,
    ) ?? null
  );
}

/** Part numbers that have a published digital datasheet (for product pages) */
export function getPublishedPartNumbers(): string[] {
  return readData()
    .filter((d) => d.published !== false)
    .map((d) => d.meta.partNumber);
}

export function createDatasheet(body: DatasheetBody & { published?: boolean }): DatasheetRecord {
  const datasheets = readData();
  const now = new Date().toISOString();
  const record: DatasheetRecord = {
    ...body,
    id: crypto.randomUUID(),
    published: body.published ?? true,
    createdAt: now,
    updatedAt: now,
  };
  datasheets.push(record);
  writeData(datasheets);
  return record;
}

export function updateDatasheet(
  id: string,
  data: Partial<Omit<DatasheetRecord, 'id' | 'createdAt'>>,
): DatasheetRecord | null {
  const datasheets = readData();
  const index = datasheets.findIndex((d) => d.id === id);
  if (index === -1) return null;
  datasheets[index] = {
    ...datasheets[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeData(datasheets);
  return datasheets[index];
}

export function deleteDatasheet(id: string): boolean {
  const datasheets = readData();
  const index = datasheets.findIndex((d) => d.id === id);
  if (index === -1) return false;
  datasheets.splice(index, 1);
  writeData(datasheets);
  return true;
}
