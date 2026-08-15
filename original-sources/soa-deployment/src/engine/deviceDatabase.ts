import type { FosterStage, RthjcTable } from './soaEngine';

export interface DeviceRecord {
  /** Unique stable id, e.g. "infineon-ipw65r080cfd" */
  id: string;
  /** Manufacturer */
  manufacturer: string;
  /** Part number as displayed */
  partNumber: string;
  /** Technology: Si, SiC, GaN */
  technology: 'Si' | 'SiC' | 'GaN';
  /** Package (e.g. "TO-247") */
  package?: string;
  /** Short marketing description / use case */
  description?: string;
  /** BVDSS, V */
  BV: number;
  /** Continuous drain current, A (package-limited) */
  ID_max: number;
  /** Pulsed drain current, A */
  IDM?: number;
  /** RDS(on) at 25C, ohm */
  RDS: number;
  /** Max junction temperature, degC */
  Tj_max: number;
  /** Thermal resistance junction-to-case, degC/W (datasheet DC value) */
  Rjc: number;
  /** Short-circuit withstand time, s (omit if not rated) */
  tSC_DS?: number;
  /** Optional default Foster network (used when rthjcTable is absent) */
  foster?: FosterStage[];
  /** Datasheet transient thermal response (Zth vs t, per duty). Takes
   *  precedence over `foster` when present. */
  rthjcTable?: RthjcTable;
  /** Optional default thermal-instability knee */
  V_si_k?: number;
  m_si?: number;
  /** Data source URL (datasheet) */
  datasheetUrl?: string;
  /** ISO timestamp of when this record was last verified */
  verifiedAt?: string;
}

interface DeviceDatabaseAdapter {
  list(): Promise<DeviceRecord[]>;
  search(query: string): Promise<DeviceRecord[]>;
  get(id: string): Promise<DeviceRecord | null>;
  upsert(record: DeviceRecord): Promise<DeviceRecord>;
  remove(id: string): Promise<void>;
}

const RjcEst = (pkg: string, RDS: number) => {
  if (pkg.includes('SOT-227') || pkg.includes('SOT227')) return 0.55;
  if (pkg.includes('TO-247')) return RDS < 0.01 ? 0.35 : RDS < 0.05 ? 0.4 : RDS < 0.1 ? 0.5 : 0.6;
  if (pkg.includes('TO-220')) return RDS < 0.05 ? 0.6 : RDS < 0.15 ? 1.0 : 2.0;
  if (pkg.includes('DPAK') || pkg.includes('TO-252')) return 3.0;
  if (pkg.includes('PQFN') || pkg.includes('SuperSO8')) return RDS < 0.005 ? 0.5 : 1.0;
  if (pkg.includes('SOT-223')) return 20;
  if (pkg.includes('SOT')) return 50;
  return 1.0;
};

const SI_SI = (v: number) => ({ V_si_k: v, m_si: -2.0 });

const SEED: DeviceRecord[] = [
  {
    id: 'magnachip-amdta080n017rh', manufacturer: 'MagnaChip', partNumber: 'AMDTA080N017RH',
    technology: 'Si', package: 'TOLL', description: '80V 1.7mΩ N-channel MOSFET with datasheet Zth table.',
    BV: 80, ID_max: 230, IDM: 690, RDS: 0.0017, Tj_max: 150, Rjc: 0.32, ...SI_SI(20),
    rthjcTable: {
      times:     [1e-5, 1e-4, 1e-3, 1e-2, 1e-1, 1.0, 10.0],
      single:    [0.00331, 0.01120, 0.03733, 0.11520, 0.25067, 0.32000, 0.32000],
      perPulse: [
        { duty: 0.01, values: [0.00647, 0.01429, 0.04016, 0.11725, 0.25136, 0.32000, 0.32000] },
        { duty: 0.02, values: [0.00964, 0.01738, 0.04299, 0.11930, 0.25205, 0.32000, 0.32000] },
        { duty: 0.05, values: [0.01914, 0.02664, 0.05147, 0.12544, 0.25413, 0.32000, 0.32000] },
        { duty: 0.10, values: [0.03498, 0.04208, 0.06560, 0.13568, 0.25760, 0.32000, 0.32000] },
        { duty: 0.30, values: [0.06664, 0.07296, 0.09387, 0.15616, 0.26453, 0.32000, 0.32000] },
        { duty: 0.50, values: [0.16165, 0.16560, 0.17867, 0.21760, 0.28533, 0.32000, 0.32000] },
      ],
    },
  },
];

const STORAGE_KEY = 'soa-calc:device-db:v1';
const API_BASE = '/api/soa/devices';

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init)
  if (!response.ok) throw new Error(`Request failed with ${response.status}`)
  const data = await response.json()
  return data as T
}

function readLocalDevices(): DeviceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as DeviceRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistLocalDevices(records: DeviceRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // ignore storage errors
  }
}

function sortDevices(records: DeviceRecord[]): DeviceRecord[] {
  return [...records].sort((a, b) => {
    if (a.manufacturer === 'MagnaChip' && b.manufacturer !== 'MagnaChip') return -1
    if (b.manufacturer === 'MagnaChip' && a.manufacturer !== 'MagnaChip') return 1
    return a.manufacturer === b.manufacturer
      ? a.partNumber.localeCompare(b.partNumber)
      : a.manufacturer.localeCompare(b.manufacturer)
  })
}

class RemoteDeviceAdapter implements DeviceDatabaseAdapter {
  private records: DeviceRecord[] = []
  private loaded = false

  private async ensureLoaded() {
    if (this.loaded) return
    this.loaded = true

    try {
      const remote = await fetchJson<DeviceRecord[]>(API_BASE, { cache: 'no-store' })
      if (Array.isArray(remote)) {
        this.records = sortDevices(remote)
        persistLocalDevices(this.records)
        return
      }
    } catch {
      // fall back to local storage / seed
    }

    const fallback = readLocalDevices()
    this.records = sortDevices(fallback.length > 0 ? fallback : [...SEED])
    persistLocalDevices(this.records)
  }

  async list(): Promise<DeviceRecord[]> {
    await this.ensureLoaded()
    return [...this.records]
  }

  async search(query: string): Promise<DeviceRecord[]> {
    await this.ensureLoaded()
    const q = query.trim().toLowerCase()
    if (!q) return this.list()
    return this.records.filter((record) => {
      return (
        record.partNumber.toLowerCase().includes(q) ||
        record.manufacturer.toLowerCase().includes(q) ||
        (record.description ?? '').toLowerCase().includes(q) ||
        record.technology.toLowerCase().includes(q)
      )
    })
  }

  async get(id: string): Promise<DeviceRecord | null> {
    await this.ensureLoaded()
    return this.records.find((record) => record.id === id) ?? null
  }

  async upsert(record: DeviceRecord): Promise<DeviceRecord> {
    await this.ensureLoaded()
    const existing = this.records.findIndex((item) => item.id === record.id)
    const nextRecords = [...this.records]
    if (existing >= 0) nextRecords[existing] = record
    else nextRecords.push(record)
    this.records = sortDevices(nextRecords)
    persistLocalDevices(this.records)

    try {
      const method = existing >= 0 ? 'PUT' : 'POST'
      const url = existing >= 0 ? `${API_BASE}/${record.id}` : API_BASE
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })
      if (!response.ok) throw new Error('Sync failed')
      const saved = await response.json() as DeviceRecord
      this.records = sortDevices([...nextRecords.filter((item) => item.id !== record.id), saved])
      persistLocalDevices(this.records)
      return saved
    } catch {
      return record
    }
  }

  async remove(id: string): Promise<void> {
    await this.ensureLoaded()
    this.records = sortDevices(this.records.filter((record) => record.id !== id))
    persistLocalDevices(this.records)

    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Delete failed')
    } catch {
      // ignore remote sync failures
    }
  }
}

let _adapter = new RemoteDeviceAdapter()

export function getDeviceDatabase(): DeviceDatabaseAdapter {
  return _adapter
}

export const SEED_DEVICES = SEED
