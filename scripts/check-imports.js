const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const repo = process.cwd();
const files = execSync('git ls-files', { cwd: repo }).toString().split('\n').filter(Boolean);
const src = files.filter((f) => f.startsWith('src/'));
const code = src.filter((f) => /\.(tsx?|jsx?)$/.test(f));
const imports = [];
for (const f of code) {
  const txt = fs.readFileSync(path.join(repo, f), 'utf8');
  const re = /import\s+[^'\"]+['\"]([^'\"]+)['\"]/g;
  let m;
  while ((m = re.exec(txt))) {
    imports.push({ file: f, imp: m[1] });
  }
}
function resolveCandidates(imp, from) {
  if (imp.startsWith('@/')) {
    const rel = imp.replace(/^@\//, 'src/');
    const tries = [rel, rel + '.ts', rel + '.tsx', rel + '.js', rel + '.jsx', rel + '/index.ts', rel + '/index.tsx', rel + '/index.js', rel + '/index.jsx'];
    return tries;
  }
  if (imp.startsWith('.')) {
    const base = path.posix.join(path.posix.dirname(from), imp);
    const tries = [base, base + '.ts', base + '.tsx', base + '.js', base + '.jsx', base + '/index.ts', base + '/index.tsx', base + '/index.js', base + '/index.jsx'];
    return tries;
  }
  return [];
}
const mismatches = [];
for (const im of imports) {
  const cands = resolveCandidates(im.imp, im.file);
  if (cands.length === 0) continue;
  let found = null;
  for (const c of cands) {
    if (files.includes(c)) {
      found = c;
      break;
    }
  }
  if (!found) {
    mismatches.push(im);
  }
}
if (mismatches.length === 0) {
  console.log('No missing import targets found (all imports resolve to files in git index).');
  process.exit(0);
}
console.log('Potential unresolved imports (do not match git files):');
for (const mm of mismatches) {
  console.log(`${mm.file} -> ${mm.imp}`);
}
process.exit(0);
