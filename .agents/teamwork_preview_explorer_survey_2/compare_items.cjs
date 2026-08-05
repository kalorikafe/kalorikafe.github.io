const fs = require('fs');
const path = require('path');

const itemsFile = fs.readFileSync(path.join(__dirname, '../../src/data/items.ts'), 'utf8');

const itemRegex = /\{\s*id:\s*'([^']+)',\s*chainId:\s*'([^']+)',\s*name:\s*'([^']+)'/g;

let match;
const chainItems = {};

while ((match = itemRegex.exec(itemsFile)) !== null) {
  const [_, id, chainId, name] = match;
  if (!chainItems[chainId]) chainItems[chainId] = [];
  chainItems[chainId].push(name);
}

const chains = Object.keys(chainItems);
console.log('Chains:', chains);

// Compare Starbucks items with Kahve Dünyası items
console.log('\nStarbucks vs Kahve Dünyası item names comparison:');
for (let i = 0; i < 40; i++) {
  console.log(`${i+1}. SB: "${chainItems['starbucks'][i]}" | KD: "${chainItems['kahve_dunyasi'][i]}"`);
}
