/* ────────── Product data & slug utilities ────────── */

export const productsData: Record<string, Record<string, string[]>> = {
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
  'Autonomous Solution': {
    Overview: [],
  },
  'Power IC': {
    Overview: [],
  },
};

export const applicationsData: Record<string, Record<string, string[]>> = {
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
};

/** Convert a display name to a URL slug (e.g. "MXT MOSFETs" → "mxt-mosfets") */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Map family → slug for reverse lookup */
export const familySlugs: Record<string, string> = {};
export const slugToFamily: Record<string, string> = {};

for (const cat of Object.keys(productsData)) {
  for (const fam of Object.keys(productsData[cat])) {
    const slug = toSlug(fam);
    familySlugs[fam] = slug;
    slugToFamily[slug] = fam;
  }
}

/** Get the category that contains a given family name */
export function categoryForFamily(family: string): string | null {
  for (const cat of Object.keys(productsData)) {
    if (productsData[cat][family] !== undefined) return cat;
  }
  return null;
}

/* ─── Application slug maps ─── */

export const categorySlugs: Record<string, string> = {};
export const slugToCategory: Record<string, string> = {};

for (const cat of Object.keys(applicationsData)) {
  const slug = toSlug(cat);
  categorySlugs[cat] = slug;
  slugToCategory[slug] = cat;
}

export const subcategorySlugs: Record<string, Record<string, string>> = {};
export const slugToSubcategory: Record<string, string> = {};

for (const cat of Object.keys(applicationsData)) {
  subcategorySlugs[cat] = {};
  for (const sub of Object.keys(applicationsData[cat])) {
    const slug = toSlug(sub);
    subcategorySlugs[cat][sub] = slug;
    slugToSubcategory[slug] = sub;
  }
}

/** Get the category that contains a given subcategory */
export function categoryForSubcategory(sub: string): string | null {
  for (const cat of Object.keys(applicationsData)) {
    if (applicationsData[cat][sub] !== undefined) return cat;
  }
  return null;
}

/* ─── Design Resources ─── */

export const designResourcesData: Record<string, string[]> = {
  Overview: [],
  'Digital documentation': [],
  'Boards & Kit': [],
  'Simulation & Modeling': [],
  Software: [],
  Tools: ['Safe Operating Area (SOA)'],
  Partners: [],
  'University Alliance Program': [],
};

export const drCategorySlugs: Record<string, string> = {};
export const slugToDrCategory: Record<string, string> = {};

for (const cat of Object.keys(designResourcesData)) {
  const slug = toSlug(cat);
  drCategorySlugs[cat] = slug;
  slugToDrCategory[slug] = cat;
}
