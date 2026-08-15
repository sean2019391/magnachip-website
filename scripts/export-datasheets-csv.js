const fs = require('fs');
const path = require('path');
const dataFile = path.join(__dirname, '..', 'data', 'datasheets.json');
const outFile = path.join(__dirname, '..', 'data', 'datasheets.csv');
if (!fs.existsSync(dataFile)) {
  console.error('datasheets.json not found');
  process.exit(2);
}
const json = JSON.parse(fs.readFileSync(dataFile, 'utf8')) || [];
const rows = json.map(d => {
  const ordering = (d.cover && d.cover.ordering) || {};
  const kp = (d.cover && d.cover.keyPerformance || []).map(k=> `${k.label}:${k.value}${k.unit? ' '+k.unit:''}`).join('; ');
  return {
    id: d.id || '',
    partNumber: (d.meta && d.meta.partNumber) || '',
    title: (d.meta && d.meta.title) || '',
    version: (d.meta && d.meta.version) || '',
    date: (d.meta && d.meta.date) || '',
    company: (d.meta && d.meta.company) || '',
    classification: (d.meta && d.meta.classification) || '',
    published: d.published === false ? 'false' : 'true',
    createdAt: d.createdAt || '',
    updatedAt: d.updatedAt || '',
    ordering_type: ordering.type || '',
    ordering_package: ordering.package || '',
    ordering_marking: ordering.marking || '',
    ordering_packing: ordering.packing || '',
    ordering_rohs: ordering.rohs || '',
    ordering_url: ordering.url || '',
    keyPerformance: kp || '',
    sections_count: (d.sections || []).length
  };
});
const headers = Object.keys(rows[0] || {id:'id',partNumber:'partNumber'});
const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => '"'+String(r[h]||'').replace(/"/g,'""')+'"').join(','))).join('\n');
fs.writeFileSync(outFile, csv, 'utf8');
console.log('WROTE', outFile);
