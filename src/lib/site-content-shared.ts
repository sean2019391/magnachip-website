/* ────────── Site content: shared types & defaults (client-safe) ──────────
 * This file is safe to import from both client and server components.
 * The server-only file-system helpers live in `./site-content.server.ts`.
 */

export type NestedStringMap = Record<string, string[]>;
export type TripleNestedStringMap = Record<string, NestedStringMap>;

export interface SiteContent {
  products: TripleNestedStringMap;
  applications: TripleNestedStringMap;
  designResources: NestedStringMap;
  about: Record<string, NestedStringMap | string[]>;
  updatedAt: string;
}

export const SITE_CONTENT_SECTIONS = [
  'products',
  'applications',
  'designResources',
  'about',
] as const;

export type SiteContentSection = (typeof SITE_CONTENT_SECTIONS)[number];

/** Hard-coded fallback used by both server and client when no data is on disk. */
export const DEFAULT_SITE_CONTENT: SiteContent = {
  products: {
    'Power Solution': {
      Overview: [],
      'MXT MOSFETs': [
        'Overview',
        '12V-24V',
        '30V',
        '40V',
        '60V',
        '80V',
        '100V',
        '135V',
        '150V',
        '200V',
      ],
      'SJ MOSFETs': ['Overview', '250V', '500V', '600V', '650V', '700V', '800V', '900V'],
      'HV MOSFETs': ['Overview', '200V', '250V', '400V', '500V', '600V', '650V'],
      'Discrete IGBTs': ['Overview', '650V', '1200V'],
      'IGBT Chips for Standard Module': ['Overview', '1200V'],
      'Silicon Carbide (SiC)': ['Overview'],
    },
    'Autonomous Solution': { Overview: [] },
    'Power IC': { Overview: [] },
  },
  applications: {
    Server: {
      Overview: [],
      'Power Supply Unit': ['Low-Middle Power (<1.6kW) PSU', 'High Power (>1.6kW) PSU'],
      'Main Board (48V to 12V IBC)': ['Isolated IBC for telecom', 'Non-isolated IBC for server'],
      'Main Board (VRM)': ['PC/Server'],
    },
    'Solar/ESS': {
      Overview: [],
      'ESS (Energy Storage System) for renewable energy': [],
      'Solar Inverter': ['3-phase (high power)', '1-phase (low-middle power)'],
      'Micro Solar Inverter (Low Power, <5kW)': [],
    },
    Automotive: {
      Overview: [],
      'Motor Application': [],
      'Electric Power Steering': [],
      'DC-DC Converter for ISG': [],
      'LED Headlamp': [],
      'AC Power Outlet': [],
      'PTC Heater': [],
      'E-compressor': [],
      OBC: [],
    },
  },
  designResources: {
    Overview: [],
    'Digital documentation': [],
    'Boards & Kit': [],
    'Simulation & Modeling': [],
    Software: [],
    Tools: ['Safe Operating Area (SOA)', 'Digital Datasheet'],
    Partners: [],
    'University Alliance Program': [],
  },
  about: {
    Overview: [],
    'Executive Management': [],
    'Corporate Responsibility': {
      Environment: [
        'Overview',
        'Sustainability Priorities',
        'Our Approach',
        'Climate Change',
        'GHG Emissions',
        'Water Management',
        'Waste Management',
        'Sustainable Products and Services',
        'Opportunities in Clean Tech',
      ],
      Social: [
        'Overview',
        'Human Capital Management',
        'Health and Safety',
        'Inclusive Workplace',
        'Community',
        'Supply Chain Management',
      ],
      Governance: [
        'Overview',
        'Oversight Structure',
        'Board Composition and Role',
        'Risk Management',
        'Cybersecurity and Data Privacy',
      ],
      'Ethics & Compliance': [],
      'TCFD Index': [],
    },
    Newsroom: [],
  },
  updatedAt: '2026-08-18T00:00:00.000Z',
};

export const DEFAULT_PRODUCTS: TripleNestedStringMap = DEFAULT_SITE_CONTENT.products;
export const DEFAULT_APPLICATIONS: TripleNestedStringMap = DEFAULT_SITE_CONTENT.applications;
export const DEFAULT_DESIGN_RESOURCES: NestedStringMap = DEFAULT_SITE_CONTENT.designResources;
export const DEFAULT_ABOUT: Record<string, NestedStringMap | string[]> =
  DEFAULT_SITE_CONTENT.about;
