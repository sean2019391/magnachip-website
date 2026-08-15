export interface SoaDeviceRecord {
  id: string;
  manufacturer: string;
  partNumber: string;
  technology: 'Si' | 'SiC' | 'GaN';
  package?: string;
  description?: string;
  BV: number;
  ID_max: number;
  IDM?: number;
  RDS: number;
  Tj_max: number;
  Rjc: number;
  tSC_DS?: number;
  datasheetUrl?: string;
  verifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
