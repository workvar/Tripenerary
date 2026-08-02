// Dev helper: parses every .js file in the project to catch syntax errors.
// Usage: node scripts/syntax-check.cjs   (after npm install)
const fs = require('fs');
const path = require('path');

let parse;
try {
  ({ parse } = require('@babel/parser'));
} catch (e) {
  const fallback = process.env.BABEL_PARSER_PATH;
  if (!fallback) {
    console.error('Install dependencies first: npm install');
    process.exit(2);
  }
  ({ parse } = require(fallback));
}

const root = path.resolve(__dirname, '..');
const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.js')) files.push(full);
  }
})(root);

let bad = 0;
for (const f of files.sort()) {
  const rel = path.relative(root, f);
  try {
    parse(fs.readFileSync(f, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
    console.log('ok   ' + rel);
  } catch (e) {
    bad++;
    console.log('FAIL ' + rel + ' :: ' + e.message);
  }
}
console.log(bad ? '\n' + bad + ' file(s) failed' : '\nAll ' + files.length + ' files parse cleanly');
process.exit(bad ? 1 : 0);
