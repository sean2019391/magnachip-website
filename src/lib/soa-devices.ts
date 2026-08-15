import fs from 'fs';
import path from 'path';
import type { SoaDeviceRecord } from '@/types/soa-device';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'soa-devices.json');

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
}

function readData(): SoaDeviceRecord[] {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeData(devices: SoaDeviceRecord[]): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(devices, null, 2), 'utf-8');
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getAllDevices(): SoaDeviceRecord[] {
  return readData().sort((a, b) => {
    if (a.manufacturer === 'MagnaChip' && b.manufacturer !== 'MagnaChip') return -1;
    if (b.manufacturer === 'MagnaChip' && a.manufacturer !== 'MagnaChip') return 1;
    return a.partNumber.localeCompare(b.partNumber);
  });
}

export function getDevice(id: string): SoaDeviceRecord | null {
  return readData().find((device) => device.id === id) ?? null;
}

export function searchDevices(query: string): SoaDeviceRecord[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return getAllDevices();
  return getAllDevices().filter((device) => {
    return (
      device.manufacturer.toLowerCase().includes(keyword) ||
      device.partNumber.toLowerCase().includes(keyword) ||
      (device.description ?? '').toLowerCase().includes(keyword) ||
      device.technology.toLowerCase().includes(keyword)
    );
  });
}

export function createDevice(
  data: Omit<SoaDeviceRecord, 'id' | 'createdAt' | 'updatedAt'>,
): SoaDeviceRecord {
  const devices = readData();
  const now = new Date().toISOString();
  const device: SoaDeviceRecord = {
    ...data,
    id: slugify(`${data.manufacturer}-${data.partNumber}`) || `device-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  devices.push(device);
  writeData(devices);
  return device;
}

export function updateDevice(
  id: string,
  data: Partial<Omit<SoaDeviceRecord, 'id' | 'createdAt'>>,
): SoaDeviceRecord | null {
  const devices = readData();
  const index = devices.findIndex((device) => device.id === id);
  if (index === -1) return null;
  devices[index] = {
    ...devices[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  writeData(devices);
  return devices[index];
}

export function deleteDevice(id: string): boolean {
  const devices = readData();
  const index = devices.findIndex((device) => device.id === id);
  if (index === -1) return false;
  devices.splice(index, 1);
  writeData(devices);
  return true;
}
