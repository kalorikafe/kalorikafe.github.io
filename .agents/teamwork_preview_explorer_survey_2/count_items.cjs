const fs = require('fs');
const path = require('path');

const itemsContent = fs.readFileSync(path.join(__dirname, '../../src/data/items.ts'), 'utf8');
const matches = [...itemsContent.matchAll(/chainId:\s*['"]([^'"]+)['"]/g)];
const counts = {};
matches.forEach(m => counts[m[1]] = (counts[m[1]] || 0) + 1);

console.log('=== ITEMS PER CHAIN ===');
console.log(JSON.stringify(counts, null, 2));
console.log('Total items in items.ts:', matches.length);

const chainsContent = fs.readFileSync(path.join(__dirname, '../../src/data/chains.ts'), 'utf8');
const chainMatches = [...chainsContent.matchAll(/id:\s*['"]([^'"]+)['"]/g)];
console.log('\n=== CHAINS IN chains.ts ===');
console.log(chainMatches.map(m => m[1]));
