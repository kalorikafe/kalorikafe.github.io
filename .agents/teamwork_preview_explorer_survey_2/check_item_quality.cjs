const fs = require('fs');
const path = require('path');

const itemsFile = fs.readFileSync(path.join(__dirname, '../../src/data/items.ts'), 'utf8');

// Regex to extract item objects
const itemRegex = /\{\s*id:\s*'([^']+)',\s*chainId:\s*'([^']+)',\s*name:\s*'([^']+)',\s*category:\s*'([^']+)',\s*description:\s*'([^']*)',[\s\S]*?baseMacros:\s*\{([^}]+)\}/g;

let match;
let count = 0;
const descriptions = new Set();
const genericDescCount = {};
const sampleItemsByChain = {};

while ((match = itemRegex.exec(itemsFile)) !== null) {
  count++;
  const [_, id, chainId, name, category, description, macrosStr] = match;

  if (description.includes('özel tarifiyle hazırlanmış')) {
    genericDescCount[chainId] = (genericDescCount[chainId] || 0) + 1;
  }

  if (!sampleItemsByChain[chainId]) {
    sampleItemsByChain[chainId] = [];
  }
  if (sampleItemsByChain[chainId].length < 3) {
    sampleItemsByChain[chainId].push({ id, name, category, description, macrosStr: macrosStr.trim() });
  }
}

console.log(`Parsed ${count} items.`);
console.log("\n=== GENERIC DESCRIPTION COUNT ('özel tarifiyle hazırlanmış') PER CHAIN ===");
console.log(JSON.stringify(genericDescCount, null, 2));

console.log("\n=== SAMPLE ITEMS PER CHAIN ===");
console.log(JSON.stringify(sampleItemsByChain, null, 2));
